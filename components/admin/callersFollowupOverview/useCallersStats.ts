import { useState, useCallback } from "react";
import { getCurrentBranchId } from "@/lib/auth/client-branch";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { Caller, Soul, Followup } from "@/lib/types";
import type { CallerFollowupStats } from "./types";
import { getWeekEnd, getWeekStart } from "@/lib/utils/followup-week-check";

export function useCallersStats() {
  const [callersStats, setCallersStats] = useState<CallerFollowupStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCallersStats = useCallback(async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const branchId = await getCurrentBranchId();
      const now = new Date();
      const weekStart = getWeekStart(now);
      const weekEnd = getWeekEnd(now);

      if (!branchId) {
        setCallersStats([]);
        return;
      }

      const [callersRes, soulsRes, followupsRes] = await Promise.all([
        supabase
          .from("callers")
          .select("id, name, email, role")
          .eq("role", "caller")
          .eq("branch_id", branchId),
        supabase.from("souls").select("id, assigned_caller_id").eq("branch_id", branchId),
        supabase
          .from("followups")
          .select("id, caller_id, soul_id, date")
          .eq("branch_id", branchId)
          .gte("date", weekStart.toISOString())
          .lte("date", weekEnd.toISOString()),
      ]);

      if (callersRes.error) throw callersRes.error;
      if (soulsRes.error) throw soulsRes.error;
      if (followupsRes.error) throw followupsRes.error;

      const callers = (callersRes.data || []) as Caller[];
      const souls = (soulsRes.data || []) as Soul[];
      const followups = (followupsRes.data || []) as Pick<
        Followup,
        "id" | "caller_id" | "soul_id" | "date"
      >[];

      // Calculate stats for each caller
      const stats: CallerFollowupStats[] = callers.map((caller) => {
        const assignedSouls = souls.filter(
          (soul: Soul) => soul.assigned_caller_id === caller.id
        );
        const assignedSoulIds = new Set(
          assignedSouls.map((soul: Soul) => soul.id)
        );
        const callerFollowups = followups.filter(
          (followup) =>
            followup.caller_id === caller.id &&
            assignedSoulIds.has(followup.soul_id)
        );

        // Each assigned soul needs one follow-up during the current week.
        const uniqueSoulsWithFollowups = new Set(
          callerFollowups.map((followup) => followup.soul_id)
        ).size;

        const totalFollowupsMade = callerFollowups.length;
        const totalFollowupsNeeded = assignedSouls.length;
        const percentage =
          totalFollowupsNeeded > 0
            ? Math.round((uniqueSoulsWithFollowups / totalFollowupsNeeded) * 100)
            : 0;

        return {
          caller,
          assignedSouls: assignedSouls.length,
          totalFollowupsMade,
          totalFollowupsNeeded,
          percentage,
        };
      });

      // Sort by percentage (ascending) to show callers who need attention first
      stats.sort((a, b) => a.percentage - b.percentage);

      setCallersStats(stats);
    } catch (error) {
      console.error("Failed to fetch callers stats:", error);
      toast.error("Failed to load caller statistics");
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    callersStats,
    isLoading,
    fetchCallersStats,
  };
}
