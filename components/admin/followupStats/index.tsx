"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CardLoading } from "@/components/_reusable_components/card-loading";
import { FollowupStatusChart } from "./FollowupStatusChart";
import { FollowupProgressChart } from "./FollowupProgressChart";
import { useFollowupStats } from "./useFollowupStats";
import { getWeekEnd, getWeekStart } from "@/lib/utils/followup-week-check";

export function AdminFollowupStatsChart() {
  const {
    isLoading,
    hasData,
    chartData,
    statusCounts,
    totalFollowups,
    followedUpCount,
    notFollowedUpCount,
    totalSouls,
  } = useFollowupStats();
  const now = new Date();
  const weekStart = getWeekStart(now);
  const weekEnd = getWeekEnd(now);
  const weekRangeLabel = `${weekStart.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })} - ${weekEnd.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })}`;

  if (isLoading) {
    return <CardLoading />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Follow-up Overview</CardTitle>
        <p className="text-sm text-muted-foreground">Current week: {weekRangeLabel}</p>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <p className="text-sm">No follow-up data for this week yet</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Charts Side by Side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Follow-up Status Distribution */}
              <FollowupStatusChart
                chartData={chartData}
                statusCounts={statusCounts}
                totalFollowups={totalFollowups}
              />

              {/* Follow-up Progress */}
              {totalSouls > 0 && (
                <FollowupProgressChart
                  followedUpCount={followedUpCount}
                  notFollowedUpCount={notFollowedUpCount}
                  totalSouls={totalSouls}
                />
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
