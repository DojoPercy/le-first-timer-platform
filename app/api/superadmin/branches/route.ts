import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentActor } from "@/lib/auth/server";

function toSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function GET() {
  try {
    const { actor } = await getCurrentActor();
    if (!actor || actor.role !== "super_admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const supabase = createAdminClient();
    const { data: branches, error } = await supabase
      .from("branches")
      .select("id, name, slug, status, code, description, created_at, updated_at")
      .order("created_at", { ascending: false });

    if (error) throw error;

    const enriched = await Promise.all(
      (branches || []).map(async (branch) => {
        const [integrationsRes, usersRes, firstTimersRes, adminsRes] = await Promise.all([
          supabase
            .from("branch_integrations")
            .select("id, integration_type, provider, sheet_id, sheet_range, form_url, status")
            .eq("branch_id", branch.id),
          supabase
            .from("callers")
            .select("id", { count: "exact", head: true })
            .eq("branch_id", branch.id)
            .neq("role", "super_admin"),
          supabase
            .from("first_timers")
            .select("id", { count: "exact", head: true })
            .eq("branch_id", branch.id),
          supabase
            .from("callers")
            .select("id, name, email")
            .eq("branch_id", branch.id)
            .eq("role", "admin")
            .order("created_at", { ascending: true })
            .limit(1),
        ]);

        return {
          ...branch,
          integrations: integrationsRes.data || [],
          users_count: usersRes.count || 0,
          first_timers_count: firstTimersRes.count || 0,
          branch_admin: adminsRes.data?.[0] || null,
        };
      })
    );

    return NextResponse.json({ branches: enriched });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const supabase = createAdminClient();
  let createdBranchId: string | null = null;
  let createdUserId: string | null = null;

  try {
    const { actor } = await getCurrentActor();
    if (!actor || actor.role !== "super_admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const branch = body?.branch || {};
    const admin = body?.admin || {};
    const integration = body?.integration || {};

    if (!branch.name || !admin.name || !admin.email || !admin.password) {
      return NextResponse.json(
        { message: "Branch name and branch admin credentials are required" },
        { status: 400 }
      );
    }

    const slug = toSlug(String(branch.name));
    if (!slug) {
      return NextResponse.json(
        { message: "Unable to derive a branch slug" },
        { status: 400 }
      );
    }

    const { data: createdBranch, error: branchError } = await supabase
      .from("branches")
      .insert({
        name: String(branch.name),
        slug,
        code: branch.code ? String(branch.code) : null,
        description: branch.description ? String(branch.description) : null,
      })
      .select("id, name, slug")
      .single();

    if (branchError || !createdBranch) {
      throw new Error(branchError?.message || "Failed to create branch");
    }

    createdBranchId = createdBranch.id;

    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email: String(admin.email),
        password: String(admin.password),
        email_confirm: true,
      });

    if (authError || !authData.user?.id) {
      throw new Error(authError?.message || "Failed to create branch admin user");
    }

    createdUserId = authData.user.id;

    const { error: callerError } = await supabase.from("callers").insert({
      user_id: authData.user.id,
      name: String(admin.name),
      email: String(admin.email),
      role: "admin",
      branch_id: createdBranch.id,
    });

    if (callerError) {
      throw new Error(callerError.message);
    }

    if (integration?.sheetId) {
      const { error: integrationError } = await supabase
        .from("branch_integrations")
        .insert({
          branch_id: createdBranch.id,
          integration_type: "first_timer_intake",
          provider: "google_sheets",
          sheet_id: String(integration.sheetId),
          sheet_range: integration.sheetRange ? String(integration.sheetRange) : null,
          form_url: integration.formUrl ? String(integration.formUrl) : null,
          status: "active",
          template_version: 1,
          created_by: actor.id,
          updated_by: actor.id,
        });

      if (integrationError) {
        throw new Error(integrationError.message);
      }
    }

    return NextResponse.json(
      { message: "Branch created successfully", branch: createdBranch },
      { status: 201 }
    );
  } catch (error) {
    if (createdUserId) {
      try {
        await supabase.auth.admin.deleteUser(createdUserId);
      } catch {}
    }

    if (createdBranchId) {
      try {
        await supabase.from("branches").delete().eq("id", createdBranchId);
      } catch {}
    }

    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
