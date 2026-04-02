

import { useState } from "react";
import { ReportsTable } from "@/components/admin/reports/ReportsTable";
import type { WeeklyReport, MonthlyReport, YearlyReport } from "@/lib/store/reports-store";
import type { FC } from "react";

interface ReportsComparisonProps {
  reports: (WeeklyReport | MonthlyReport | YearlyReport)[];
  reportType: "weekly" | "monthly" | "yearly";
  availablePeriods: string[];
}

export const ReportsComparison: FC<ReportsComparisonProps> = ({
  reports,
  reportType,
  availablePeriods,
}) => {
  const [first, setFirst] = useState<string>(availablePeriods[0]);
  const [second, setSecond] = useState<string>(availablePeriods[1] || availablePeriods[0]);

  const firstReport = reports.find(
    (r: any) =>
      (reportType === "monthly"
        ? `${r.year}-${r.month}`
        : r.year.toString()) === first
  );
  const secondReport = reports.find(
    (r: any) =>
      (reportType === "monthly"
        ? `${r.year}-${r.month}`
        : r.year.toString()) === second
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4">
        <div className="flex-1">
          <label className="block text-xs font-bold mb-1">First</label>
          <select
            className="border rounded px-2 py-1 w-full text-sm"
            value={first}
            onChange={(e) => setFirst(e.target.value)}
          >
            {availablePeriods.map((p: string) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-xs font-bold mb-1">Second</label>
          <select
            className="border rounded px-2 py-1 w-full text-sm"
            value={second}
            onChange={(e) => setSecond(e.target.value)}
          >
            {availablePeriods.map((p: string) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-bold mb-2">{first}</h4>
          {firstReport ? (
            <ReportsTable
              reports={[firstReport]}
              reportType={reportType}
              onRefresh={() => {}}
              hideRefresh
            />
          ) : (
            <div className="text-sm text-muted-foreground">No data</div>
          )}
        </div>
        <div>
          <h4 className="font-bold mb-2">{second}</h4>
          {secondReport ? (
            <ReportsTable
              reports={[secondReport]}
              reportType={reportType}
              onRefresh={() => {}}
              hideRefresh
            />
          ) : (
            <div className="text-sm text-muted-foreground">No data</div>
          )}
        </div>
      </div>
    </div>
  );
};
