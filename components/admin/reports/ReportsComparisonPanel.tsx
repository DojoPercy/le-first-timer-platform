"use client";

import { Button } from "@/components/ui/button";
import { ReportsComparison } from "@/components/admin/reports/ReportsComparison";
import type { MonthlyReport } from "@/lib/store/reports-store";

interface ReportsComparisonPanelProps {
  reports: MonthlyReport[];
  onClose: () => void;
}

export function ReportsComparisonPanel({
  reports,
  onClose,
}: ReportsComparisonPanelProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-xl font-bold">Compare Monthly Reports</h3>
        <Button variant="outline" size="sm" onClick={onClose}>
          Exit Compare
        </Button>
      </div>
      <ReportsComparison
        reports={reports}
        reportType="monthly"
        availablePeriods={reports.map((report) => `${report.year}-${report.month}`)}
      />
    </div>
  );
}
