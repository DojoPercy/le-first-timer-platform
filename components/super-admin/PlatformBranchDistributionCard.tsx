"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MCStatsChart, MC_COLORS } from "@/components/admin/mcStats/MCStatsChart";
import type { PlatformBranchSummary } from "@/lib/super-admin/platform-summary-types";

interface PlatformBranchDistributionCardProps {
  branches: PlatformBranchSummary[];
}

export function PlatformBranchDistributionCard({
  branches,
}: PlatformBranchDistributionCardProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const rankedBranches = [...branches]
    .filter((branch) => branch.souls > 0)
    .sort((a, b) => b.souls - a.souls);

  const totalSouls = rankedBranches.reduce((sum, branch) => sum + branch.souls, 0);
  const activeBranches = branches.filter((branch) => branch.status === "active").length;
  const chartData = rankedBranches.map((branch) => ({ name: branch.name, value: branch.souls }));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Branch Distribution</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center justify-center gap-6 text-center text-sm sm:justify-start">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Souls Won</p>
            <p className="text-lg font-semibold text-foreground">{totalSouls.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Live Branches</p>
            <p className="text-lg font-semibold text-foreground">{activeBranches.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Branches With Souls</p>
            <p className="text-lg font-semibold text-foreground">{rankedBranches.length.toLocaleString()}</p>
          </div>
        </div>

        {rankedBranches.length === 0 ? (
          <p className="text-sm text-muted-foreground">No branch soul data yet.</p>
        ) : (
          <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-4 dark:border-gray-800 dark:bg-gray-900/30 sm:p-5">
            <h4 className="mb-4 text-sm font-semibold text-gray-900 dark:text-gray-100">
              Souls Won Across Branches
            </h4>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <MCStatsChart chartData={chartData} hoveredIndex={hoveredIndex} />
              <div className="max-h-100 space-y-2 overflow-y-auto pt-4 lg:max-h-112.5">
                {rankedBranches.map((branch, index) => {
                  const percentage = totalSouls > 0 ? (branch.souls / totalSouls) * 100 : 0;

                  return (
                    <div
                      key={branch.id}
                      className="flex cursor-pointer items-center justify-between rounded-md px-2 transition-all duration-300 ease-in-out hover:bg-gray-100 dark:hover:bg-gray-800/50"
                      onMouseEnter={() => setHoveredIndex(index)}
                      onMouseLeave={() => setHoveredIndex(null)}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="h-3.5 w-3.5 shrink-0 rounded-full shadow-sm"
                            style={{ backgroundColor: MC_COLORS[index % MC_COLORS.length] }}
                          />
                          <span className="truncate text-sm font-medium text-gray-700 dark:text-gray-300">
                            {branch.name}
                          </span>
                        </div>
                        <p className="ml-6 text-xs text-muted-foreground">/{branch.slug}</p>
                      </div>
                      <div className="ml-2 shrink-0 text-right">
                        <span className="text-base font-bold text-gray-900 dark:text-gray-100">
                          {branch.souls}
                        </span>
                        <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                          {Math.round(percentage)}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
