import { createClient } from "@/lib/supabase/server";

export type AppRole = "super_admin" | "admin" | "caller";

export interface CurrentActor {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: AppRole;
  branchId: string | null;
}

export async function getCurrentActor() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user?.id) {
    return { supabase, actor: null as CurrentActor | null, session: null };
  }

  const { data: caller } = await supabase
    .from("callers")
    .select("id, user_id, name, email, role, branch_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!caller || !caller.role) {
    return { supabase, actor: null as CurrentActor | null, session: null };
  }

  return {
    supabase,
    session: null,
    actor: {
      id: caller.id,
      userId: caller.user_id,
      name: caller.name,
      email: caller.email,
      role: caller.role as AppRole,
      branchId: caller.branch_id ?? null,
    } satisfies CurrentActor,
  };
}

export function isSuperAdmin(actor: CurrentActor | null): actor is CurrentActor {
  return !!actor && actor.role === "super_admin";
}

export function isBranchAdmin(actor: CurrentActor | null): actor is CurrentActor {
  return !!actor && actor.role === "admin";
}

export function isAdminLike(actor: CurrentActor | null): actor is CurrentActor {
  return !!actor && (actor.role === "super_admin" || actor.role === "admin");
}

export function resolveBranchScope(
  actor: CurrentActor,
  requestedBranchId?: string | null,
) {
  if (actor.role === "super_admin") {
    return requestedBranchId ?? null;
  }

  return actor.branchId;
}
