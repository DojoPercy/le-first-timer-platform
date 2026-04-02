"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, TooltipProps } from "recharts";
import type { Soul, Followup } from "@/lib/types";
import { CardLoading } from "@/components/_reusable_components/card-loading";
import { getWeekEnd, getWeekStart } from "@/lib/utils/followup-week-check";

interface FollowupStatsChartProps {
  souls: Soul[];
  followups: Followup[];
  isLoading?: boolean;
}

const COLORS = {
  Contacted: "#3b82f6", // blue
  Pending: "#f59e0b", // yellow/amber
  "Not Reachable": "#ef4444", // red
};

// Custom tooltip component
const CustomTooltip = ({ active, payload }: TooltipProps<any, any>) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-2">
        <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 mb-1">
          {data.name}
        </p>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          <span className="font-medium">{data.value}</span> follow-up{data.value !== 1 ? 's' : ''}
        </p>
        {data.payload?.percent !== undefined && (
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">
            {((data.payload.percent as number) * 100).toFixed(1)}%
          </p>
        )}
      </div>
    );
  }
  return null;
};

export function FollowupStatsChart({
  souls,
  followups,
  isLoading,
}: FollowupStatsChartProps) {
  if (isLoading) {
    return <CardLoading />;
  }

  // Calculate follow-up status distribution
  const statusCounts = {
    Contacted: 0,
    Pending: 0,
    "Not Reachable": 0,
  };

  followups.forEach((followup) => {
    if (followup.status in statusCounts) {
      statusCounts[followup.status as keyof typeof statusCounts]++;
    }
  });

  // Prepare data for pie chart
  const chartData = Object.entries(statusCounts)
    .filter(([_, count]) => count > 0)
    .map(([status, count]) => ({
      name: status,
      value: count,
    }));

  // Calculate souls with and without follow-ups
  const soulsWithFollowups = new Set(followups.map((f) => f.soul_id));
  const followedUp = souls.filter((soul) => soulsWithFollowups.has(soul.id)).length;
  const notFollowedUp = souls.length - followedUp;

  const followupOverviewData = [
    { name: "Followed Up", value: followedUp, color: "#3b82f6" },
    { name: "Not Followed Up", value: notFollowedUp, color: "#e5e7eb" },
  ];

  const totalFollowups = followups.length;
  const hasData = souls.length > 0 || chartData.length > 0;
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
              {chartData.length > 0 ? (
                <div className="bg-gray-50/50 dark:bg-gray-900/30 rounded-lg p-4 sm:p-5 border border-gray-200 dark:border-gray-800">
                  <h4 className="text-sm font-semibold mb-4 text-gray-900 dark:text-gray-100">Follow-up Status This Week</h4>
                  <div className="space-y-4 sm:space-y-5">
                    <div className="w-full h-50 sm:h-62.5">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={false}
                            outerRadius={90}
                            innerRadius={30}
                            fill="#8884d8"
                            dataKey="value"
                            stroke="none"
                          >
                            {chartData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[entry.name as keyof typeof COLORS] || "#8884d8"}
                              />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-2.5 pt-2">
                      {Object.entries(statusCounts).map(([status, count]) => (
                        <div key={status} className="flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors">
                          <div className="flex items-center gap-2.5">
                            <div
                              className="h-3.5 w-3.5 rounded-full shadow-sm"
                              style={{
                                backgroundColor:
                                  COLORS[status as keyof typeof COLORS] || "#8884d8",
                              }}
                            />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{status}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-base font-bold text-gray-900 dark:text-gray-100">{count}</span>
                            {totalFollowups > 0 && (
                              <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                                {Math.round((count / totalFollowups) * 100)}%
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full min-h-75 text-muted-foreground border border-gray-200 dark:border-gray-800 rounded-lg bg-gray-50/50 dark:bg-gray-900/30">
                  <p className="text-sm">No follow-ups recorded this week</p>
                </div>
              )}

              {/* Follow-up Progress */}
              {souls.length > 0 && (
                <div className="bg-gray-50/50 dark:bg-gray-900/30 rounded-lg p-4 sm:p-5 border border-gray-200 dark:border-gray-800">
                  <h4 className="text-sm font-semibold mb-4 text-gray-900 dark:text-gray-100">Weekly Follow-up Progress</h4>
                  <div className="space-y-4 sm:space-y-5">
                    <div className="w-full h-50 sm:h-62.5">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={followupOverviewData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={false}
                            outerRadius={90}
                            innerRadius={30}
                            fill="#8884d8"
                            dataKey="value"
                            stroke="none"
                          >
                            {followupOverviewData.map((entry, index) => (
                              <Cell key={`cell-overview-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-2.5 pt-2">
                      <div className="flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors">
                        <div className="flex items-center gap-2.5">
                          <div className="h-3.5 w-3.5 rounded-full bg-blue-500 shadow-sm" />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Followed Up</span>
                        </div>
                        <div className="text-right">
                          <span className="text-base font-bold text-gray-900 dark:text-gray-100">{followedUp}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                            {Math.round((followedUp / souls.length) * 100)}%
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors">
                        <div className="flex items-center gap-2.5">
                          <div className="h-3.5 w-3.5 rounded-full bg-gray-300 dark:bg-gray-600 shadow-sm" />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Not Followed Up</span>
                        </div>
                        <div className="text-right">
                          <span className="text-base font-bold text-gray-900 dark:text-gray-100">{notFollowedUp}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                            {Math.round((notFollowedUp / souls.length) * 100)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
