import { useEffect, useState } from "react";
import { useStatsStore } from "@/lib/store/stats-store";

export function useMCStats() {
  const {
    mcStats,
    totalSouls,
    totalMCs,
    isLoadingMCStats,
    fetchMCStats,
  } = useStatsStore();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    fetchMCStats();
  }, [fetchMCStats]);

  const chartData = mcStats.map((stat) => ({
    name: stat.mc,
    value: stat.count,
  }));

  return {
    mcStats,
    totalSouls,
    totalMCs,
    isLoadingMCStats,
    hoveredIndex,
    setHoveredIndex,
    chartData,
  };
}
