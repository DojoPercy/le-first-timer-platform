"use client";

import { BarChart2, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type {
  PlatformReportBranchSummary,
  PlatformReportPeriod,
} from "@/lib/super-admin/platform-reports-types";

interface PlatformReportsBranchesTableProps {
  branches: PlatformReportBranchSummary[];
  period: PlatformReportPeriod;
  isLoading: boolean;
  onRefresh: () => Promise<void>;
}

function getPeriodLabel(period: PlatformReportPeriod) {
  return period.charAt(0).toUpperCase() + period.slice(1);
}

export function PlatformReportsBranchesTable({
  branches,
  period,
  isLoading,
  onRefresh,
}: PlatformReportsBranchesTableProps) {
  return (
    <div className="animate-in slide-in-from-bottom-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm fade-in duration-500 dark:border-slate-800 dark:bg-slate-950">
      <div className="flex flex-col justify-between gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:gap-4 sm:p-6 dark:border-slate-900">
        <div>
          <h3 className="flex items-center gap-2 text-base font-bold sm:text-lg">
            <BarChart2 className="h-4 w-4 text-indigo-500" />
            {getPeriodLabel(period)} Branch Breakdown
          </h3>
          <p className="mt-1 text-[11px] text-muted-foreground sm:text-xs">
            Detailed branch follow-up performance and coverage for this reporting period.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={onRefresh} className="text-muted-foreground">
          <RefreshCw className={`mr-2 h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
          Refresh Data
        </Button>
      </div>

      <Card className="rounded-none border-0 shadow-none">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm sm:text-base">Branch Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          {branches.length === 0 ? (
            <p className="text-xs text-muted-foreground sm:text-sm">No branches available yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="h-9 text-[11px]">Branch</TableHead>
                  <TableHead className="h-9 text-[11px]">Status</TableHead>
                  <TableHead className="h-9 text-[11px] text-center">Souls</TableHead>
                  <TableHead className="h-9 text-[11px] text-center">Done</TableHead>
                  <TableHead className="h-9 text-[11px]">Distro.</TableHead>
                  <TableHead className="h-9 text-[11px]">Coverage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {branches.map((branch) => (
                  <TableRow key={branch.id}>
                    <TableCell className="py-2.5">
                      <div className="min-w-[180px]">
                        <p className="text-sm font-medium text-foreground">{branch.name}</p>
                        <p className="text-[11px] text-muted-foreground">/{branch.slug}</p>
                      </div>
                    </TableCell>
                    <TableCell className="py-2.5">
                      <Badge
                        variant={branch.status === "active" ? "default" : "outline"}
                        className={`text-[10px] ${branch.status === "active" ? "bg-green-600 text-white" : ""}`}
                      >
                        {branch.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-2.5 text-center text-sm font-semibold">
                      {branch.totalSouls.toLocaleString()}
                    </TableCell>
                    <TableCell className="py-2.5 text-center text-sm">
                      {branch.followups.toLocaleString()}
                    </TableCell>
                    <TableCell className="min-w-[120px] py-2.5">
                      <div className="flex h-1.5 w-full gap-0.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                        <div
                          className="h-full bg-purple-500"
                          title={`Contacted: ${branch.followupsContacted}`}
                          style={{
                            width: `${(branch.followupsContacted / (branch.followups || 1)) * 100}%`,
                          }}
                        />
                        <div
                          className="h-full bg-slate-400"
                          title={`Other: ${branch.followupsPending + branch.followupsNotReachable}`}
                          style={{
                            width: `${((branch.followupsPending + branch.followupsNotReachable) / (branch.followups || 1)) * 100}%`,
                          }}
                        />
                      </div>
                      <div className="mt-1 flex justify-between text-[9px] font-medium text-muted-foreground">
                        <span>{branch.followupsContacted}c</span>
                        <span>{branch.followupsNotReachable}u</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-2.5">
                      <div className="flex min-w-[120px] items-center gap-3">
                        <div className="h-1.5 flex-1 rounded-full bg-slate-100 dark:bg-slate-800">
                          <div
                            className={`h-1.5 rounded-full transition-all duration-1000 ${
                              branch.completionPercentage >= 80
                                ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]"
                                : branch.completionPercentage >= 50
                                  ? "bg-amber-500"
                                  : "bg-rose-500"
                            }`}
                            style={{
                              width: `${Math.min(branch.completionPercentage, 100)}%`,
                            }}
                          />
                        </div>
                        <span className="w-10 text-[11px] font-bold tabular-nums">
                          {branch.completionPercentage.toFixed(0)}%
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
