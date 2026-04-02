"use client";

import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MC_COLORS } from "@/components/admin/mcStats/MCStatsChart";
import { CustomCallerTooltip, CustomMCTooltip } from "@/components/admin/reports/ReportChartTooltips";
import { MC_CHART_CONFIG, abbreviateName } from "@/components/admin/reports/reportChartUtils";
import { useBreakpoint } from "@/components/admin/reports/useBreakpoint";
import type { PlatformReportBranchSummary } from "@/lib/super-admin/platform-reports-types";

interface PlatformReportsChartsProps {
  branches: PlatformReportBranchSummary[];
}

export function PlatformReportsCharts({ branches }: PlatformReportsChartsProps) {
  const [hoveredBranchIndex, setHoveredBranchIndex] = useState<number | null>(null);
  const breakpoint = useBreakpoint();
  const { innerRadius, outerRadius, cx } = MC_CHART_CONFIG[breakpoint];
  const isMobile = breakpoint === "mobile";

  const branchPerformanceData = [...branches]
    .sort((a, b) => b.followups - a.followups || b.soulsWon - a.soulsWon)
    .slice(0, 10)
    .map((branch) => ({
      name: abbreviateName(branch.name),
      fullName: branch.name,
      "Follow-ups": branch.followups,
    }));

  const branchDistributionData = branches
    .filter((branch) => branch.soulsWon > 0)
    .sort((a, b) => b.soulsWon - a.soulsWon)
    .map((branch) => ({ name: branch.name, value: branch.soulsWon }));

  const totalSoulsWon = branchDistributionData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
        <Card className="border-none bg-slate-50/30 shadow-sm dark:bg-slate-900/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold sm:text-base">Branch Performance (Top 10)</CardTitle>
          </CardHeader>
          <CardContent className="px-2 sm:px-6">
            {branchPerformanceData.length === 0 ? (
              <div className="flex h-52 items-center justify-center text-sm text-muted-foreground sm:h-75">
                No branch follow-up activity in this period
              </div>
            ) : (
              <div className="h-52 w-full sm:h-75">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={branchPerformanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" vertical={false} />
                    <XAxis axisLine={false} dataKey="name" tick={{ fontSize: 11, fill: "#64748B" }} tickLine={false} />
                    <YAxis axisLine={false} tick={{ fontSize: 11, fill: "#64748B" }} tickLine={false} />
                    <Tooltip content={<CustomCallerTooltip />} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
                    <Bar barSize={32} dataKey="Follow-ups" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-none bg-slate-50/30 shadow-sm dark:bg-slate-900/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold sm:text-base">Branch Distribution</CardTitle>
          </CardHeader>
          <CardContent className="px-2 sm:px-6">
            {branchDistributionData.length === 0 ? (
              <div className="flex h-52 items-center justify-center text-sm text-muted-foreground sm:h-75">
                No branch soul wins in this period
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                <div className="mx-auto flex h-56 w-full items-center justify-center sm:h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        cx={cx}
                        cy="50%"
                        data={branchDistributionData}
                        dataKey="value"
                        innerRadius={innerRadius}
                        outerRadius={outerRadius}
                        paddingAngle={isMobile ? 3 : 5}
                        stroke="none"
                        onMouseLeave={() => setHoveredBranchIndex(null)}
                      >
                        {branchDistributionData.map((entry, index) => (
                          <Cell
                            key={`${entry.name}-${index}`}
                            fill={MC_COLORS[index % MC_COLORS.length]}
                            opacity={hoveredBranchIndex === null || hoveredBranchIndex === index ? 1 : 0.3}
                            style={{ transition: "opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1)", cursor: "pointer" }}
                            onMouseEnter={() => setHoveredBranchIndex(index)}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        content={<CustomMCTooltip />}
                        contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="max-h-80 space-y-2 overflow-y-auto pr-1 pt-1">
                  {branchDistributionData.map((branch, index) => (
                    <div
                      key={branch.name}
                      className="flex cursor-pointer items-center justify-between rounded-md px-2 transition-all duration-300 ease-in-out hover:bg-gray-100 dark:hover:bg-gray-800/50"
                      onMouseEnter={() => setHoveredBranchIndex(index)}
                      onMouseLeave={() => setHoveredBranchIndex(null)}
                    >
                      <div className="min-w-0 flex flex-1 items-center gap-2.5">
                        <div
                          className="h-3.5 w-3.5 shrink-0 rounded-full shadow-sm"
                          style={{ backgroundColor: MC_COLORS[index % MC_COLORS.length] }}
                        />
                        <span className="truncate text-sm font-medium text-gray-700 dark:text-gray-300">{branch.name}</span>
                      </div>
                      <div className="ml-2 shrink-0 text-right">
                        <span className="text-base font-bold text-gray-900 dark:text-gray-100">{branch.value}</span>
                        {totalSoulsWon > 0 ? (
                          <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                            {Math.round((branch.value / totalSoulsWon) * 100)}%
                          </span>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
