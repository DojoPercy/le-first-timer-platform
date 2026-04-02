import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentActor } from "@/lib/auth/server";

type RouteContext = {
  params: Promise<{
    branchId: string;
  }>;
};

async function requireSuperAdmin() {
  const { actor } = await getCurrentActor();
  return actor?.role === "super_admin" ? actor : null;
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const actor = await requireSuperAdmin();
    if (!actor) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { branchId } = await context.params;
    const body = await request.json().catch(() => ({}));
    const supabase = createAdminClient();

    const { error } = await supabase
      .from("branches")
      .update({
        name: body?.name,
        code: body?.code || null,
        description: body?.description || null,
        status: body?.status === "inactive" ? "inactive" : "active",
      })
      .eq("id", branchId);

    if (error) throw error;

    const adminName =
      typeof body?.adminName === "string" ? body.adminName.trim() : "";
    const adminEmail =
      typeof body?.adminEmail === "string" ? body.adminEmail.trim() : "";
    const adminPassword =
      typeof body?.adminPassword === "string" ? body.adminPassword : "";
    const sheetId =
      typeof body?.sheetId === "string" ? body.sheetId.trim() : "";
    const sheetRange =
      typeof body?.sheetRange === "string" ? body.sheetRange.trim() : "";
    const formUrl =
      typeof body?.formUrl === "string" ? body.formUrl.trim() : "";
    const integrationStatus =
      body?.integrationStatus === "paused" || body?.integrationStatus === "error"
        ? body.integrationStatus
        : "active";

    const { data: branchAdmin, error: branchAdminError } = await supabase
      .from("callers")
      .select("id, user_id")
      .eq("branch_id", branchId)
      .eq("role", "admin")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (branchAdminError) throw branchAdminError;

    if (branchAdmin && (adminName || adminEmail)) {
      const { error: callerUpdateError } = await supabase
        .from("callers")
        .update({
          name: adminName || undefined,
          email: adminEmail || undefined,
        })
        .eq("id", branchAdmin.id);

      if (callerUpdateError) throw callerUpdateError;
    }

    if (branchAdmin && (adminEmail || adminPassword)) {
      const { error: authUpdateError } =
        await supabase.auth.admin.updateUserById(branchAdmin.user_id, {
          email: adminEmail || undefined,
          password: adminPassword || undefined,
          email_confirm: adminEmail ? true : undefined,
        });

      if (authUpdateError) throw authUpdateError;
    }

    if (sheetId) {
      const { error: integrationError } = await supabase
        .from("branch_integrations")
        .upsert(
          {
            branch_id: branchId,
            integration_type: "first_timer_intake",
            provider: "google_sheets",
            sheet_id: sheetId,
            sheet_range: sheetRange || null,
            form_url: formUrl || null,
            status: integrationStatus,
            template_version: 1,
            created_by: actor.id,
            updated_by: actor.id,
          },
          { onConflict: "branch_id,integration_type" }
        );

      if (integrationError) throw integrationError;
    }

    return NextResponse.json({ message: "Branch updated successfully" });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const actor = await requireSuperAdmin();
    if (!actor) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { branchId } = await context.params;
    const supabase = createAdminClient();

    const { data: branch, error: branchError } = await supabase
      .from("branches")
      .select("id, name, slug")
      .eq("id", branchId)
      .maybeSingle();

    if (branchError) throw branchError;
    if (!branch) {
      return NextResponse.json({ message: "Branch not found" }, { status: 404 });
    }

    const [firstTimers, followups, callers] = await Promise.all([
      supabase
        .from("first_timers")
        .select("id", { count: "exact", head: true })
        .eq("branch_id", branchId),
      supabase
        .from("followups")
        .select("id", { count: "exact", head: true })
        .eq("branch_id", branchId),
      supabase
        .from("callers")
        .select("id, user_id, role")
        .eq("branch_id", branchId)
        .neq("role", "super_admin"),
    ]);

    const hasData = (firstTimers.count || 0) > 0 || (followups.count || 0) > 0;
    if (hasData) {
      return NextResponse.json(
        {
          message:
            "This branch already has first timer data. Set it inactive instead of deleting it.",
        },
        { status: 400 }
      );
    }

    const branchUsers = callers.data || [];

    if (branchUsers.length > 0) {
      const { error: callerDeleteError } = await supabase
        .from("callers")
        .delete()
        .eq("branch_id", branchId)
        .neq("role", "super_admin");

      if (callerDeleteError) throw callerDeleteError;

      await Promise.all(
        branchUsers
          .map((user) => user.user_id)
          .filter(Boolean)
          .map(async (userId) => {
            await supabase.auth.admin.deleteUser(userId);
          })
      );
    }

    await supabase.from("branch_integrations").delete().eq("branch_id", branchId);

    const { error: deleteBranchError } = await supabase
      .from("branches")
      .delete()
      .eq("id", branchId);

    if (deleteBranchError) throw deleteBranchError;

    return NextResponse.json({ message: `${branch.name} deleted successfully` });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
