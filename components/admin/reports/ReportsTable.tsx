"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import type {
  WeeklyReport,
  MonthlyReport,
  YearlyReport,
} from "@/lib/store/reports-store";
import { EmptyState } from "@/components/_reusable_components/empty-state";

interface ReportsTableProps {
  reports: (WeeklyReport | MonthlyReport | YearlyReport)[];
  reportType: "weekly" | "monthly" | "yearly";
  onRefresh: () => void;
  hideRefresh?: boolean;
}

export function ReportsTable({
  reports,
  reportType,
  onRefresh,
  hideRefresh = false,
}: ReportsTableProps) {
  const formatPeriod = (
    report: WeeklyReport | MonthlyReport | YearlyReport,
  ) => {
    if (reportType === "weekly") {
      const weekly = report as WeeklyReport;
      return `Week ${weekly.week_number}, ${weekly.year}`;
    } else if (reportType === "monthly") {
      const monthly = report as MonthlyReport;
      const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      return `${monthNames[monthly.month - 1]} ${monthly.year}`;
    } else {
      const yearly = report as YearlyReport;
      return yearly.year.toString();
    }
  };

  return (
    <div className="space-y-4">
      {!hideRefresh && (
        <div className="flex justify-end p-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      )}
      <div className="overflow-x-auto">
        <Table className="min-w-[600px]">
          <TableHeader>
            <TableRow className="bg-slate-50 dark:bg-slate-900 border-y border-slate-100 dark:border-slate-800">
              <TableHead className="font-semibold text-slate-900 dark:text-slate-100 py-4 text-nowrap pl-6">
                Caller
              </TableHead>
              <TableHead className="font-semibold text-slate-900 dark:text-slate-100 py-4 text-nowrap">
                Period
              </TableHead>
              <TableHead className="font-semibold text-slate-900 dark:text-slate-100 py-4 text-nowrap text-center">
                Assigned
              </TableHead>
              <TableHead className="font-semibold text-slate-900 dark:text-slate-100 py-4 text-nowrap text-center">
                Done
              </TableHead>
              <TableHead className="font-semibold text-slate-900 dark:text-slate-100 py-4 text-nowrap">
                Distro.
              </TableHead>
              <TableHead className="font-semibold text-slate-900 dark:text-slate-100 py-4 text-nowrap">
                Success Rate
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reports.length === 0 ? (
              <EmptyState
                colSpan={7}
                message={`No ${reportType} reports have been generated yet.`}
              />
            ) : (
              reports.map((report) => (
                <TableRow
                  key={report.id}
                  className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors group"
                >
                  <TableCell className="font-medium whitespace-nowrap pl-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-slate-900 dark:text-slate-100 font-bold">
                        {report.callers?.name || "Unknown"}
                      </span>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                        {report.callers?.email}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap py-4">
                    <span className="inline-flex items-center px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px] font-medium">
                      {formatPeriod(report)}
                    </span>
                  </TableCell>
                  <TableCell className="text-center font-semibold py-4">
                    {report.total_souls_assigned}
                  </TableCell>
                  <TableCell className="text-center py-4">
                    {report.total_followups_made}
                  </TableCell>
                  <TableCell className="py-4 min-w-[120px]">
                    <div className="flex gap-0.5 h-1.5 w-full rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                      <div
                        className="bg-purple-500 h-full"
                        title={`Contacted: ${report.followups_contacted}`}
                        style={{
                          width: `${(report.followups_contacted / (report.total_followups_made || 1)) * 100}%`,
                        }}
                      />
                      <div
                        className="bg-slate-400 h-full"
                        title={`Other: ${report.followups_pending + report.followups_not_reachable}`}
                        style={{
                          width: `${((report.followups_pending + report.followups_not_reachable) / (report.total_followups_made || 1)) * 100}%`,
                        }}
                      />
                    </div>
                    <div className="flex justify-between mt-1 text-[9px] text-muted-foreground font-medium">
                      <span>{report.followups_contacted}c</span>
                      <span>{report.followups_not_reachable}u</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex items-center gap-3 min-w-[120px]">
                      <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full transition-all duration-1000 ${
                            report.completion_percentage >= 80
                              ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]"
                              : report.completion_percentage >= 50
                                ? "bg-amber-500"
                                : "bg-rose-500"
                          }`}
                          style={{
                            width: `${Math.min(report.completion_percentage, 100)}%`,
                          }}
                        />
                      </div>
                      <span className="text-[11px] font-bold tabular-nums w-10">
                        {report.completion_percentage.toFixed(0)}%
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
