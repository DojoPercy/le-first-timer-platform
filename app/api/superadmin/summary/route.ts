import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentActor } from "@/lib/auth/server";

export async function GET() {
  try {
    const { actor } = await getCurrentActor();
    if (!actor || actor.role !== "super_admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const supabase = createAdminClient();
    const [branches, users, firstTimers, followups] = await Promise.all([
      supabase.from("branches").select("id, name, status"),
      supabase.from("callers").select("id, role, branch_id, name"),
      supabase.from("first_timers").select("id, branch_id, assigned_caller_id, followup_outcome_status, last_followup_at, created_at"),
      supabase.from("followups").select("id, branch_id, status"),
    ]);

    if (branches.error) throw branches.error;
    if (users.error) throw users.error;
    if (firstTimers.error) throw firstTimers.error;
    if (followups.error) throw followups.error;

    const branchHealth = branches.data.map((branch) => {
      const branchUsers = users.data.filter((user) => user.branch_id === branch.id);
      const branchFirstTimers = firstTimers.data.filter((item) => item.branch_id === branch.id);
      const branchFollowups = followups.data.filter((item) => item.branch_id === branch.id);

      return {
        branchId: branch.id,
        branchName: branch.name,
        status: branch.status,
        users: branchUsers.length,
        firstTimers: branchFirstTimers.length,
        assignedFirstTimers: branchFirstTimers.filter((item) => item.assigned_caller_id).length,
        followups: branchFollowups.length,
        contacted: branchFollowups.filter((item) => item.status === "Contacted").length,
        fullyJoined: branchFirstTimers.filter((item) => item.followup_outcome_status === "fully_joined").length,
        pendingThisWeek: branchFirstTimers.filter(
          (item) => item.assigned_caller_id && !item.last_followup_at
        ).length,
      };
    });

    return NextResponse.json({
      totalBranches: branches.data.length,
      activeBranches: branches.data.filter((branch) => branch.status === "active").length,
      totalUsers: users.data.length,
      totalFirstTimers: firstTimers.data.length,
      assignedFirstTimers: firstTimers.data.filter((item) => item.assigned_caller_id).length,
      fullyJoinedFirstTimers: firstTimers.data.filter(
        (item) => item.followup_outcome_status === "fully_joined"
      ).length,
      totalFollowups: followups.data.length,
      contactedFollowups: followups.data.filter((item) => item.status === "Contacted").length,
      branchHealth,
    });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
