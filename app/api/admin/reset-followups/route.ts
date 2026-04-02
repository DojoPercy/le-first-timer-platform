import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentActor, isAdminLike, resolveBranchScope } from "@/lib/auth/server";

export async function POST(request: Request) {
  try {
    const { actor } = await getCurrentActor();
    if (!actor || !isAdminLike(actor)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const branchId = resolveBranchScope(actor, body?.branchId || null);
    if (!branchId) {
      return NextResponse.json(
        { message: "A branch must be selected" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const { count } = await supabase
      .from("followups")
      .select("*", { count: "exact", head: true })
      .eq("branch_id", branchId);

    const { error: deleteError } = await supabase
      .from("followups")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000")
      .eq("branch_id", branchId);

    if (deleteError) throw deleteError;

    const { error: updateError } = await supabase
      .from("first_timers")
      .update({ last_followup_at: null })
      .eq("branch_id", branchId)
      .not("id", "is", null);

    if (updateError) {
      console.warn("Failed to reset first timers last_followup_at:", updateError);
    }

    return NextResponse.json({
      message: "All follow-ups reset successfully",
      deletedCount: count || 0,
    });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
