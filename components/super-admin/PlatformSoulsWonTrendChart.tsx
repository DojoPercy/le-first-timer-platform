"use client";

import { useMemo, useState } from "react";
import { TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SoulsWonLineChart } from "@/components/admin/soulsWonTrend/SoulsWonLineChart";
import { ViewModeToggle } from "@/components/admin/soulsWonTrend/ViewModeToggle";
import type { TrendData } from "@/lib/store/stats-store";

interface PlatformSoulsWonTrendChartProps {
  monthlyTrend: TrendData[];
  yearlyTrend: TrendData[];
  totalSoulsWon: number;
}

export function PlatformSoulsWonTrendChart({
  monthlyTrend,
  yearlyTrend,
  totalSoulsWon,
}: PlatformSoulsWonTrendChartProps) {
  const [viewMode, setViewMode] = useState<"monthly" | "yearly">("monthly");
  const trendData = useMemo(
    () => (viewMode === "monthly" ? monthlyTrend : yearlyTrend),
    [monthlyTrend, viewMode, yearlyTrend],
  );

  if (trendData.length === 0) {
    return (
      <Card className="border-none shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <TrendingUp className="text-blue-500" />
            Souls Won Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-64 items-center justify-center text-muted-foreground">
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
          <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <TrendingUp className="text-blue-500" />
            Souls Won Trend
          </CardTitle>
          <ViewModeToggle viewMode={viewMode} onViewModeChange={setViewMode} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-[10px] text-muted-foreground sm:text-xs">Total Souls Won</p>
            <p className="text-xl font-bold text-blue-700 dark:text-blue-300 sm:text-2xl">
              {totalSoulsWon}
            </p>
          </div>
          <SoulsWonLineChart trendData={trendData} viewMode={viewMode} />
        </div>
      </CardContent>
    </Card>
  );
}
