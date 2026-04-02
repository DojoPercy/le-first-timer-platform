"use client";

import { useState } from "react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { PlatformReportsHeader } from "@/components/super-admin/reports/PlatformReportsHeader";
import { PlatformReportsToolbar } from "@/components/super-admin/reports/PlatformReportsToolbar";
import { PlatformReportsOverviewCards } from "@/components/super-admin/reports/PlatformReportsOverviewCards";
import { PlatformReportsCharts } from "@/components/super-admin/reports/PlatformReportsCharts";
import { PlatformReportsTrendCard } from "@/components/super-admin/reports/PlatformReportsTrendCard";
import { PlatformReportsBranchesTable } from "@/components/super-admin/reports/PlatformReportsBranchesTable";
import { useSuperAdminReports } from "@/components/super-admin/reports/useSuperAdminReports";

export function SuperAdminReportsView() {
  const reports = useSuperAdminReports();
  const [viewMode, setViewMode] = useState<"overview" | "branches">("overview");

  if (reports.isLoading && !reports.data) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (reports.error && !reports.data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Platform reports unavailable</CardTitle>
          <CardDescription>{reports.error}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!reports.data) {
    return null;
  }

  return (
    <div className="space-y-4 sm:space-y-5">
      <PlatformReportsHeader
        isGenerating={reports.isGenerating}
        onGenerate={reports.handleGenerateReport}
      />

      <PlatformReportsToolbar
        period={reports.period}
        viewMode={viewMode}
        selectedMonth={reports.selectedMonth}
        selectedYear={reports.selectedYear}
        onPeriodChange={reports.setPeriod}
        onViewModeChange={setViewMode}
        onMonthChange={reports.setSelectedMonth}
        onYearChange={reports.setSelectedYear}
      />

      {viewMode === "overview" ? (
        <>
          <PlatformReportsOverviewCards overview={reports.data.overview} />

          <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm dark:border-slate-800 dark:bg-slate-950 sm:p-6">
            <PlatformReportsCharts branches={reports.data.branchSummaries} />
          </div>

          <PlatformReportsTrendCard trendData={reports.data.trendData} />
        </>
      ) : (
        <PlatformReportsBranchesTable
          branches={reports.data.branchSummaries}
          period={reports.period}
          isLoading={reports.isLoading}
          onRefresh={reports.refresh}
        />
      )}
    </div>
  );
}

