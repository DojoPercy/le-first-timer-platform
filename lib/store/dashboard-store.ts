import { create } from "zustand";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { getCurrentBranchId } from "@/lib/auth/client-branch";
import { getWeekStart, getWeekEnd } from "@/lib/utils/followup-week-check";
import { buildInviterStats } from "@/lib/utils/inviter-analytics";
import type { FirstTimer, Followup, CellStat, InviterStat } from "@/lib/types";

export interface DashboardStatsData {
  totalFirstTimers: number;
  assignedFirstTimers: number;
  unassignedFirstTimers: number;
  fullyJoinedCount: number;
  followedUpThisWeekCount: number;
  pendingFollowupThisWeekCount: number;
  totalFollowups: number;
  followupsContacted: number;
  followupsPending: number;
  followupsNotReachable: number;
  completionRate: number;
  joiningCount: number;
  visitingCount: number;
  topCells: CellStat[];
  topInviters: InviterStat[];
  callerWeeklyPerformance: Array<{
    callerId: string;
    name: string;
    assigned: number;
    followedUpThisWeek: number;
    pendingThisWeek: number;
    fullyJoined: number;
  }>;
}

interface DashboardStore {
  stats: DashboardStatsData;
  isLoading: boolean;
  fetchStats: () => Promise<void>;
  syncing: boolean;
  handleSyncSheets: (isAutoSync?: boolean) => Promise<void>;
  assigning: boolean;
  handleAssignAllFirstTimers: () => Promise<void>;
}

const defaultStats: DashboardStatsData = {
  totalFirstTimers: 0,
  assignedFirstTimers: 0,
  unassignedFirstTimers: 0,
  fullyJoinedCount: 0,
  followedUpThisWeekCount: 0,
  pendingFollowupThisWeekCount: 0,
  totalFollowups: 0,
  followupsContacted: 0,
  followupsPending: 0,
  followupsNotReachable: 0,
  completionRate: 0,
  joiningCount: 0,
  visitingCount: 0,
  topCells: [],
  topInviters: [],
  callerWeeklyPerformance: [],
};

async function fetchDashboardStatsRequest(): Promise<DashboardStatsData> {
  const supabase = createClient();
  const branchId = await getCurrentBranchId();

  if (!branchId) return defaultStats;

  const now = new Date();
  const weekStart = getWeekStart(now);
  const weekEnd = getWeekEnd(now);

  const [{ data: firstTimers }, { data: callers }, { data: followups }] =
    await Promise.all([
      supabase.from("first_timers").select("*").eq("branch_id", branchId),
      supabase
        .from("callers")
        .select("id, role, name")
        .eq("role", "caller")
        .eq("branch_id", branchId),
      supabase
        .from("followups")
        .select("status, first_timer_id")
        .eq("branch_id", branchId)
        .gte("date", weekStart.toISOString())
        .lte("date", weekEnd.toISOString()),
    ]);

  const callerIds = new Set(
    callers?.map((c: { id: string }) => c.id) || []
  );
  const totalFirstTimers = firstTimers?.length || 0;
  const assignedFirstTimers =
    firstTimers?.filter(
      (ft: FirstTimer) =>
        ft.assigned_caller_id && callerIds.has(ft.assigned_caller_id)
    ).length || 0;

  const joiningCount =
    firstTimers?.filter(
      (ft: FirstTimer) =>
        ft.visit_type?.toUpperCase().includes("JOINING")
    ).length || 0;
  const visitingCount =
    firstTimers?.filter(
      (ft: FirstTimer) =>
        ft.visit_type?.toUpperCase() === "VISITING"
    ).length || 0;

  // Cell stats
  const cellCounts: Record<string, number> = {};
  for (const ft of firstTimers || []) {
    if (!ft.cell_name) continue;
    cellCounts[ft.cell_name] = (cellCounts[ft.cell_name] || 0) + 1;
  }
  const topCells: CellStat[] = Object.entries(cellCounts)
    .map(([cell, count]) => ({ cell, count, total: totalFirstTimers }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
  const topInviters = buildInviterStats(firstTimers || []);

  // Followup stats
  const totalFollowups = followups?.length || 0;
  const followupsContacted =
    followups?.filter((f: Pick<Followup, "status" | "first_timer_id">) => f.status === "Contacted")
      .length || 0;
  const followupsPending =
    followups?.filter((f: Pick<Followup, "status" | "first_timer_id">) => f.status === "Pending")
      .length || 0;
  const followupsNotReachable =
    followups?.filter(
      (f: Pick<Followup, "status" | "first_timer_id">) => f.status === "Not Reachable"
    ).length || 0;

  const uniqueFollowedUpSet = new Set(
    followups?.map((f: Pick<Followup, "status" | "first_timer_id">) => f.first_timer_id) || []
  );
  const uniqueFollowedUp = uniqueFollowedUpSet.size;
  const pendingFollowupThisWeekCount =
    firstTimers?.filter(
      (ft: FirstTimer) =>
        !!ft.assigned_caller_id && !uniqueFollowedUpSet.has(ft.id)
    ).length || 0;
  const completionRate =
    totalFirstTimers > 0
      ? Math.round((uniqueFollowedUp / totalFirstTimers) * 100)
      : 0;
  const fullyJoinedCount =
    firstTimers?.filter(
      (ft: FirstTimer) => ft.followup_outcome_status === "fully_joined"
    ).length || 0;
  const callerWeeklyPerformance = (callers || []).map((caller: { id: string }) => {
    const assigned = (firstTimers || []).filter(
      (ft: FirstTimer) => ft.assigned_caller_id === caller.id
    );
    const followedUpThisWeek = assigned.filter((ft: FirstTimer) =>
      uniqueFollowedUpSet.has(ft.id)
    ).length;

    return {
      callerId: caller.id,
      name: (callers || []).find((item: any) => item.id === caller.id)?.name || "Caller",
      assigned: assigned.length,
      followedUpThisWeek,
      pendingThisWeek: Math.max(assigned.length - followedUpThisWeek, 0),
      fullyJoined: assigned.filter(
        (ft: FirstTimer) => ft.followup_outcome_status === "fully_joined"
      ).length,
    };
  });

  return {
    totalFirstTimers,
    assignedFirstTimers,
    unassignedFirstTimers: totalFirstTimers - assignedFirstTimers,
    fullyJoinedCount,
    followedUpThisWeekCount: uniqueFollowedUp,
    pendingFollowupThisWeekCount,
    totalFollowups,
    followupsContacted,
    followupsPending,
    followupsNotReachable,
    completionRate,
    joiningCount,
    visitingCount,
    topCells,
    topInviters,
    callerWeeklyPerformance,
  };
}

export const useDashboardStore = create<DashboardStore>((set, get) => ({
  stats: defaultStats,
  isLoading: true,

  fetchStats: async () => {
    try {
      set({ stats: await fetchDashboardStatsRequest(), isLoading: false });
    } catch (error) {
      console.error("Failed to fetch stats:", error);
      set({ isLoading: false });
    }
  },

  syncing: false,
  handleSyncSheets: async (isAutoSync = false) => {
    if (!isAutoSync) {
      set({ syncing: true });
      toast.loading("Syncing Google Sheets...", { id: "sync-sheets" });
    }
    try {
      const response = await fetch("/api/sync-sheets", { method: "POST" });
      const data = await response.json();
      const newLabel =
        data.count > 0
          ? `${data.count} new first timer${data.count > 1 ? "s" : ""}`
          : null;
      if (!isAutoSync) {
        if (data.count > 0) {
          const labels = [
            newLabel,
            data.autoAssigned
              ? `${data.autoAssigned} assigned to callers`
              : null,
          ].filter(Boolean);
          toast.success(`${labels.join(" • ")} synced successfully`, {
            id: "sync-sheets",
          });
        } else {
          toast.info("No new entries found in Google Sheets", {
            id: "sync-sheets",
          });
        }
      } else if (data.count > 0) {
        toast.success(`${newLabel} synced automatically`, { duration: 4000 });
      }
      if (data.count > 0 || data.autoAssigned > 0) await get().fetchStats();
    } catch (error) {
      console.error("Sync failed:", error);
      if (!isAutoSync) {
        toast.error("Sync failed - check console for details", {
          id: "sync-sheets",
        });
      }
    } finally {
      if (!isAutoSync) set({ syncing: false });
    }
  },

  assigning: false,
  handleAssignAllFirstTimers: async () => {
    set({ assigning: true });
    toast.loading("Redistributing first timers evenly across callers...", {
      id: "assign-first-timers",
    });
    try {
      const response = await fetch("/api/admin/assign-all-first-timers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ redistribute: true }),
      });
      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: "Unknown error" }));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }
      const data = await response.json();
      if (data.assigned > 0) {
        toast.success(
          `${data.assigned} first timer${data.assigned > 1 ? "s" : ""} redistributed evenly`,
          { id: "assign-first-timers" }
        );
      } else {
        toast.info("No first timers to redistribute", {
          id: "assign-first-timers",
        });
      }
      if (data.errors > 0)
        toast.error(
          `${data.errors} errors occurred during redistribution`,
          { id: "assign-errors" }
        );
      await get().fetchStats();
    } catch (error) {
      console.error("Redistribution failed:", error);
      toast.error(
        `Redistribution failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        { id: "assign-first-timers" }
      );
    } finally {
      set({ assigning: false });
    }
  },
}));
