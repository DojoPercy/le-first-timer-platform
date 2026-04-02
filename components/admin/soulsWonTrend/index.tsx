"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { HiOutlineTrendingUp } from "react-icons/hi";
import { SoulsWonLineChart } from "./SoulsWonLineChart";
import { ViewModeToggle } from "./ViewModeToggle";
import { useSoulsWonTrend } from "./useSoulsWonTrend";

export function SoulsWonTrendChart() {
  const {
    trendData,
    totalSoulsWon,
    isLoadingTrend,
    viewMode,
    handleViewModeChange,
  } = useSoulsWonTrend();

  if (isLoadingTrend) {
    return (
      <Card className="border-none shadow-md">
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (trendData.length === 0) {
    return (
      <Card className="border-none shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <HiOutlineTrendingUp className="text-blue-500" />
            Souls Won Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <p>No data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <HiOutlineTrendingUp className="text-blue-500" />
            Souls Won Trend
          </CardTitle>
          <ViewModeToggle viewMode={viewMode} onViewModeChange={handleViewModeChange} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Summary Stat */}
          <div className="text-center">
            <p className="text-[10px] sm:text-xs text-muted-foreground">Total Souls Won</p>
            <p className="text-xl sm:text-2xl font-bold text-blue-700 dark:text-blue-300">
              {totalSoulsWon}
            </p>
          </div>

          {/* Line Chart */}
          <SoulsWonLineChart trendData={trendData} viewMode={viewMode} />
        </div>
      </CardContent>
    </Card>
  );
}
