import { createClient } from "@/lib/supabase/client";

let cachedBranchId: string | null | undefined = undefined;
let cachedUserId: string | null | undefined = undefined;

export function resetCachedBranchId() {
  cachedBranchId = undefined;
  cachedUserId = undefined;
}

export async function getCurrentBranchId(): Promise<string | null> {
  const supabase = createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user?.id) {
    resetCachedBranchId();
    return null;
  }

  if (cachedUserId === user.id && cachedBranchId !== undefined) {
    return cachedBranchId;
  }

  const { data } = await supabase
    .from("callers")
    .select("branch_id")
    .eq("user_id", user.id)
    .maybeSingle();

  cachedUserId = user.id;
  cachedBranchId = data?.branch_id ?? null;
  return cachedBranchId;
}
