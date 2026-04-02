"use client";

import { ReportCharts } from "@/components/admin/reports/ReportCharts";
import { ReportMCEvangelismSection } from "@/components/admin/reports/ReportMCEvangelismSection";
import { ReportStatsCards } from "@/components/admin/reports/ReportStatsCards";
import { ReportTrendChart } from "@/components/admin/reports/ReportTrendChart";
import { ReportsMonthlyToolbar } from "@/components/admin/reports/ReportsMonthlyToolbar";
import type {
  ActiveTab,
  ReportType,
} from "@/app/admin/reports/reports-page-constants";
import type {
  GlobalReportStats,
  MonthlyReport,
  ReportTrendData,
  WeeklyReport,
  YearlyReport,
} from "@/lib/store/reports-store";

interface ReportsOverviewPanelProps {
  activeTab: ActiveTab;
  reports: Array<WeeklyReport | MonthlyReport | YearlyReport>;
  globalStats: GlobalReportStats | null;
  trendData: ReportTrendData[];
  isLoadingTrends: boolean;
  selectedMonth: number;
  selectedYear: number;
  onPeriodChange: (month: number, year: number) => void;
  onCompare: () => void;
}

export function ReportsOverviewPanel({
  activeTab,
  reports,
  globalStats,
  trendData,
  isLoadingTrends,
  selectedMonth,
  selectedYear,
  onPeriodChange,
  onCompare,
}: ReportsOverviewPanelProps) {
  return (
    <div className="animate-in slide-in-from-bottom-2 space-y-5 fade-in duration-500">
      {activeTab === "monthly" ? (
        <ReportsMonthlyToolbar
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          onPeriodChange={onPeriodChange}
          onCompare={onCompare}
        />
      ) : null}

      <ReportStatsCards reports={reports} globalStats={globalStats} />

      <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm dark:border-slate-800 dark:bg-slate-950 sm:p-6">
        <ReportCharts
          reports={reports}
          globalStats={globalStats}
          reportType={activeTab as ReportType}
        />
      </div>

      <ReportMCEvangelismSection mcEvangelism={globalStats?.mcEvangelism} />

      <ReportTrendChart data={trendData} isLoading={isLoadingTrends} />
    </div>
  );
}
