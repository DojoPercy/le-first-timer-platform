import { useEffect } from "react";
import { useStatsStore } from "@/lib/store/stats-store";

export function useSoulsWonTrend() {
  const {
    trendData,
    totalNewSouls,
    isLoadingTrend,
    viewMode,
    setViewMode,
    fetchTrendData,
  } = useStatsStore();

  useEffect(() => {
    fetchTrendData();
  }, [viewMode, fetchTrendData]);

  const handleViewModeChange = (mode: "monthly" | "yearly") => {
    setViewMode(mode);
    fetchTrendData();
  };

  return {
    trendData,
    totalSoulsWon: totalNewSouls,
    isLoadingTrend,
    viewMode,
    handleViewModeChange,
  };
}
