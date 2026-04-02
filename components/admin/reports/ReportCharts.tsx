"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  WeeklyReport,
  MonthlyReport,
  YearlyReport,
  GlobalReportStats,
} from "@/lib/store/reports-store";

import { MC_COLORS } from "@/components/admin/mcStats/MCStatsChart";
import { useBreakpoint } from "./useBreakpoint";
import { MC_CHART_CONFIG, abbreviateName } from "./reportChartUtils";
import { CustomCallerTooltip, CustomMCTooltip } from "./ReportChartTooltips";


interface ReportChartsProps {
  reports: (WeeklyReport | MonthlyReport | YearlyReport)[];
  globalStats?: GlobalReportStats | null;
  reportType: "weekly" | "monthly" | "yearly";
}

export function ReportCharts({
  reports,
  globalStats,
  reportType,
}: ReportChartsProps) {
  const [hoveredMcIndex, setHoveredMcIndex] = useState<number | null>(null);
  const breakpoint = useBreakpoint();
  const { innerRadius, outerRadius, cx } = MC_CHART_CONFIG[breakpoint];
  const isMobile = breakpoint === "mobile";

  if (reports.length === 0 && !globalStats) return null;

  // 1. Caller Performance Data (Use global live data if available/overview mode, or fallback to snapshots)

  let callerData = [];
  if (globalStats && globalStats.callerPerformance.length > 0) {
    callerData = globalStats.callerPerformance.map((p) => ({
      name: abbreviateName(p.name),
      fullName: p.name,
      "Follow-ups": p.followups,
    }));
  } else {
    callerData = reports.map((r) => ({
      name: abbreviateName(r.callers?.name || "Unknown"),
      fullName: r.callers?.name || "Unknown",
      "Follow-ups": r.total_followups_made,
    }));
  }
  callerData = callerData.slice(0, 10);

  // 2. Mega Church (MC) Distribution Data
  const mcData = globalStats
    ? Object.entries(globalStats.mcDistribution)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)

    : [];
  const totalMcSouls = mcData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Caller Performance - Bar Chart */}
        <Card className="border-none shadow-sm bg-slate-50/30 dark:bg-slate-900/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm sm:text-base font-bold">
              Caller Performance (Top 10)
            </CardTitle>
          </CardHeader>
          <CardContent className="px-2 sm:px-6">
            <div className="h-52 sm:h-75 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={callerData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#E2E8F0"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: "#64748B" }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: "#64748B" }}
                  />
                  <Tooltip content={<CustomCallerTooltip />} />
                  <Legend
                    iconType="circle"
                    wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }}
                  />
                  <Bar
                    dataKey="Follow-ups"
                    fill="#8B5CF6"
                    radius={[4, 4, 0, 0]}
                    barSize={32}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Mega Church (MC) Distribution - Pie Chart */}
        <Card className="border-none shadow-sm bg-slate-50/30 dark:bg-slate-900/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm sm:text-base font-bold">
              Mega Church Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="px-2 sm:px-6">
            {mcData.length === 0 ? (
              <div className="flex items-center justify-center h-52 sm:h-75 text-muted-foreground text-sm">
                No souls won from any Mega Church in this period
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                <div className="w-full h-56 sm:h-72 mx-auto flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={mcData}
                        cx={cx}
                        cy="50%"
                        innerRadius={innerRadius}
                        outerRadius={outerRadius}
                        paddingAngle={isMobile ? 3 : 5}
                        dataKey="value"
                        stroke="none"
                        onMouseLeave={() => setHoveredMcIndex(null)}
                      >
                        {mcData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={MC_COLORS[index % MC_COLORS.length]}
                            opacity={
                              hoveredMcIndex === null || hoveredMcIndex === index
                                ? 1
                                : 0.3
                            }
                            style={{
                              transition: "opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                              cursor: "pointer",
                            }}
                            onMouseEnter={() => setHoveredMcIndex(index)}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        content={<CustomMCTooltip />}
                        contentStyle={{
                          borderRadius: "12px",
                          border: "none",
                          boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-2 pt-1 max-h-80 overflow-y-auto pr-1">
                  {mcData.map((stat, index) => (
                    <div
                      key={stat.name}
                      className="flex items-center justify-between cursor-pointer px-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-all duration-300 ease-in-out"
                      onMouseEnter={() => setHoveredMcIndex(index)}
                      onMouseLeave={() => setHoveredMcIndex(null)}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <div
                          className="h-3.5 w-3.5 rounded-full shadow-sm shrink-0"
                          style={{
                            backgroundColor: MC_COLORS[index % MC_COLORS.length],
                          }}
                        />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                          {stat.name}
                        </span>
                      </div>
                      <div className="text-right shrink-0 ml-2">
                        <span className="text-base font-bold text-gray-900 dark:text-gray-100">
                          {stat.value}
                        </span>
                        {totalMcSouls > 0 && (
                          <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                            {Math.round((stat.value / totalMcSouls) * 100)}%
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Souls Won Trend Chart */}
      {/* Removed Location Grouping chart - replaced with trend chart below */}
    </div>
  );
}
