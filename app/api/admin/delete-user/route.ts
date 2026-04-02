import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentActor, isAdminLike } from "@/lib/auth/server";

export async function DELETE(request: Request) {
  try {
    const { actor } = await getCurrentActor();
    if (!actor || !isAdminLike(actor)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const userId = typeof body.user_id === "string" ? body.user_id : "";
    const role = typeof body.role === "string" ? body.role : "";

    if ((!email && !userId) || !role) {
      return NextResponse.json(
        { error: "Email or user_id and role required" },
        { status: 400 }
      );
    }

    const adminClient = createAdminClient();
    let resolvedUserId = userId;

    if (!resolvedUserId && email) {
      const { data, error } = await adminClient.auth.admin.listUsers();
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      const authUser = data.users.find((item) => item.email === email);
      resolvedUserId = authUser?.id || "";
    }

    if (!resolvedUserId) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { data: targetUser, error: targetError } = await adminClient
      .from("callers")
      .select("id, branch_id, role")
      .eq("user_id", resolvedUserId)
      .maybeSingle();

    if (targetError) {
      return NextResponse.json({ error: targetError.message }, { status: 500 });
    }

    if (!targetUser) {
      return NextResponse.json(
        { error: "Target user not found" },
        { status: 404 }
      );
    }

    if (actor.role === "admin") {
      if (targetUser.role === "super_admin") {
        return NextResponse.json(
          { error: "Branch admins cannot delete superadmins" },
          { status: 403 }
        );
      }

      if (!actor.branchId || targetUser.branch_id !== actor.branchId) {
        return NextResponse.json(
          { error: "You can only delete users in your branch" },
          { status: 403 }
        );
      }
    }

    const { error: deleteCallerError } = await adminClient
      .from("callers")
      .delete()
      .eq("user_id", resolvedUserId)
      .eq("role", role);

    if (deleteCallerError) {
      return NextResponse.json(
        { error: deleteCallerError.message },
        { status: 500 }
      );
    }

    const { error: deleteAuthError } =
      await adminClient.auth.admin.deleteUser(resolvedUserId);

    if (deleteAuthError) {
      return NextResponse.json(
        { error: deleteAuthError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
