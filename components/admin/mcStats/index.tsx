"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { HiOutlineUserGroup } from "react-icons/hi";
import { CardLoading } from "@/components/_reusable_components/card-loading";
import { NoDataCard } from "@/components/_reusable_components/no-data-card";
import { MCStatsChart } from "./MCStatsChart";
import { MCStatsList } from "./MCStatsList";
import { useMCStats } from "./useMCStats";

export function MCStatsCard() {
  const {
    mcStats,
    totalSouls,
    totalMCs,
    isLoadingMCStats,
    hoveredIndex,
    setHoveredIndex,
    chartData,
  } = useMCStats();

  if (isLoadingMCStats) {
    return (
      <CardLoading
        headerHeight="h-5"
        headerWidth="w-40"
        contentHeight="h-64"
        className="border-none shadow-md"
      />
    );
  }

  if (mcStats.length === 0) {
    return (
      <NoDataCard
        title="MC Statistics"
        message="No MC data available"
        icon={<HiOutlineUserGroup className="text-green-500" />}
        className="border-none shadow-md"
      />
    );
  }

  return (
    <Card className="border-none shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <HiOutlineUserGroup className="text-green-500" />
          MC Statistics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Summary Stats */}
          <div className="flex items-center justify-center gap-4 sm:gap-6 text-sm">
            <div className="text-center">
              <p className="text-[10px] sm:text-xs text-muted-foreground">Total Souls</p>
              <p className="text-xl sm:text-2xl font-bold text-green-700 dark:text-green-300">
                {totalSouls}
              </p>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="text-center">
              <p className="text-[10px] sm:text-xs text-muted-foreground">Active MCs</p>
              <p className="text-xl sm:text-2xl font-bold text-green-700 dark:text-green-300">
                {totalMCs}
              </p>
            </div>
          </div>

          {/* Pie Chart and Details Side by Side */}
          <div className="bg-gray-50/50 dark:bg-gray-900/30 rounded-lg p-4 sm:p-5 border border-gray-200 dark:border-gray-800">
            <h4 className="text-sm font-semibold mb-4 text-gray-900 dark:text-gray-100">
              MC Distribution
            </h4>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pie Chart - Left Side */}
              <MCStatsChart chartData={chartData} hoveredIndex={hoveredIndex} />
              
              {/* Details - Right Side */}
              <MCStatsList
                mcStats={mcStats}
                totalSouls={totalSouls}
                hoveredIndex={hoveredIndex}
                onMouseEnter={setHoveredIndex}
                onMouseLeave={() => setHoveredIndex(null)}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
