import { NextResponse } from "next/server";
import { getCurrentActor } from "@/lib/auth/server";
import { createAdminClient } from "@/lib/supabase/admin";

function getRedirectForRole(role: string) {
  if (role === "super_admin") return "/superadmin/dashboard";
  if (role === "admin") return "/admin";
  return "/caller";
}

export async function GET() {
  const { actor } = await getCurrentActor();

  if (!actor) {
    return NextResponse.json({ authenticated: false });
  }

  let branch: { id: string; name: string; slug: string } | null = null;

  if (actor.branchId) {
    const adminClient = createAdminClient();
    const { data: branchRow } = await adminClient
      .from("branches")
      .select("id, name, slug")
      .eq("id", actor.branchId)
      .maybeSingle();

    if (branchRow) {
      branch = branchRow;
    }
  }

  return NextResponse.json({
    authenticated: true,
    role: actor.role,
    redirectTo: getRedirectForRole(actor.role),
    branch,
  });
}
