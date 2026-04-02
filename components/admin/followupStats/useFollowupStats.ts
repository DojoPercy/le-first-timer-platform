import { useEffect } from "react";
import { useStatsStore } from "@/lib/store/stats-store";
import { useSoulStore } from "@/lib/store/soul-store";

export function useFollowupStats() {
  const { followupStats, isLoadingFollowupStats, fetchFollowupStats } = useStatsStore();
  const { souls, fetchSouls } = useSoulStore();

  useEffect(() => {
    fetchSouls();
    fetchFollowupStats();
  }, [fetchSouls, fetchFollowupStats]);

  if (!followupStats) {
    return {
      isLoading: isLoadingFollowupStats,
      hasData: false,
      chartData: [],
      statusCounts: {},
      totalFollowups: 0,
      followedUpCount: 0,
      notFollowedUpCount: 0,
      totalSouls: 0,
    };
  }

  const { statusCounts, totalFollowups, followedUpCount, notFollowedUpCount } = followupStats;

  // Prepare data for pie chart
  const chartData = Object.entries(statusCounts)
    .filter(([_, count]) => count > 0)
    .map(([status, count]) => ({
      name: status,
      value: count,
    }));

  const hasData = souls.length > 0 || chartData.length > 0;

  return {
    isLoading: isLoadingFollowupStats,
    hasData,
    chartData,
    statusCounts,
    totalFollowups,
    followedUpCount,
    notFollowedUpCount,
    totalSouls: souls.length,
  };
}
