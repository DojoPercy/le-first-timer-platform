import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentActor, isAdminLike } from "@/lib/auth/server";

export async function POST(request: Request) {
  try {
    const { actor } = await getCurrentActor();
    if (!actor || !isAdminLike(actor)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const role = body.role;
    const requestedBranchId =
      typeof body.branchId === "string" ? body.branchId : null;

    if (!email || !password || !name || !role) {
      return NextResponse.json(
        { error: "Missing required fields: email, password, name, role" },
        { status: 400 }
      );
    }

    if (!["super_admin", "admin", "caller"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    if (role === "super_admin" && actor.role !== "super_admin") {
      return NextResponse.json(
        { error: "Only superadmins can create superadmins" },
        { status: 403 }
      );
    }

    const branchId =
      actor.role === "super_admin" ? requestedBranchId : actor.branchId;

    if (role !== "super_admin" && !branchId) {
      return NextResponse.json(
        { error: "A branch is required for admin and caller accounts" },
        { status: 400 }
      );
    }

    const adminClient = createAdminClient();
    const { data: authData, error: authError } =
      await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

    if (authError || !authData.user?.id) {
      return NextResponse.json(
        { error: authError?.message || "Failed to create auth user" },
        { status: 500 }
      );
    }

    const { error: insertError } = await adminClient.from("callers").insert({
      user_id: authData.user.id,
      name,
      email,
      role,
      branch_id: role === "super_admin" ? null : branchId,
    });

    if (insertError) {
      await adminClient.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json(
      {
        message: "User created successfully",
        userId: authData.user.id,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
