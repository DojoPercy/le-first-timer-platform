"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useMCEvangelismStore } from "@/lib/store/mc-evangelism-store";
import { ADMIN_AUTO_SYNC_EVENT } from "@/lib/store/admin-auto-sync-store";
import { toast } from "sonner";
import { MCEvangelismFilters, MONTH_OPTIONS } from "./MCEvangelismFilters";
import { MCSummaryStats } from "./MCSummaryStats";
import { MCPerformanceTable } from "./MCPerformanceTable";

type AutoSyncDetail = {
  mcChanged?: boolean;
};

export function MCEvangelismStats() {
  const {
    reports,
    stats,
    totalPeopleReached,
    totalSoulsWon,
    isLoading,
    fetchReports,
    syncMCEvangelism,
    calculateStats,
  } = useMCEvangelismStore();

  const [isSyncing, setIsSyncing] = useState(false);
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<string>("all");

  useEffect(() => {
    const filters: { year: number; month?: number } = { year: selectedYear };
    if (selectedMonth !== "all") {
      filters.month = parseInt(selectedMonth);
    }
    fetchReports(filters);
  }, [selectedYear, selectedMonth, fetchReports]);

  useEffect(() => {
    if (reports.length > 0) {
      calculateStats();
    }
  }, [reports, calculateStats]);

  useEffect(() => {
    const handleAutoSync = (event: Event) => {
      const detail = (event as CustomEvent<AutoSyncDetail>).detail;
      if (!detail?.mcChanged) {
        return;
      }

      const filters: { year: number; month?: number } = { year: selectedYear };
      if (selectedMonth !== "all") {
        filters.month = parseInt(selectedMonth);
      }

      fetchReports(filters);
    };

    window.addEventListener(ADMIN_AUTO_SYNC_EVENT, handleAutoSync as EventListener);
    return () => {
      window.removeEventListener(ADMIN_AUTO_SYNC_EVENT, handleAutoSync as EventListener);
    };
  }, [selectedYear, selectedMonth, fetchReports]);

  const handleSync = async () => {
    setIsSyncing(true);
    toast.loading("Syncing MC evangelism reports...", { id: "mc-sync" });

    const result = await syncMCEvangelism();

    setIsSyncing(false);

    if (result.success) {
      const message =
        result.newReports || result.updatedReports
          ? `Synced successfully! ${result.newReports || 0} new, ${result.updatedReports || 0} updated`
          : "No new reports found";
      toast.success(message, { id: "mc-sync" });
      const filters: { year: number; month?: number } = { year: selectedYear };
      if (selectedMonth !== "all") {
        filters.month = parseInt(selectedMonth);
      }
      await fetchReports(filters);
    } else {
      toast.error(result.message, { id: "mc-sync" });
    }
  };

  const conversionRate = totalPeopleReached > 0
    ? ((totalSoulsWon / totalPeopleReached) * 100).toFixed(1)
    : "0.0";

  const monthLabel = MONTH_OPTIONS.find((month) => month.value === selectedMonth)?.label;

  return (
    <Card className="border-none shadow-sm">
      <CardHeader className="my-0 py-0">
        <MCEvangelismFilters
          selectedYear={selectedYear}
          selectedMonth={selectedMonth}
          onYearChange={setSelectedYear}
          onMonthChange={setSelectedMonth}
          onSync={handleSync}
          isSyncing={isSyncing}
          isLoading={isLoading}
        />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
              {[1, 2, 3].map((index) => (
                <div key={index} className="bg-slate-50 dark:bg-slate-900/20 rounded-lg p-4 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="flex-1">
                      <Skeleton className="h-3 w-24 mb-2" />
                      <Skeleton className="h-8 w-16" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-slate-50/50 dark:bg-slate-900/30 rounded-lg p-4 border border-slate-200 dark:border-slate-800">
              <Skeleton className="h-5 w-48 mb-4" />
              <div className="space-y-2">
                {[1, 2, 3, 4].map((index) => (
                  <Skeleton key={index} className="h-12 w-full" />
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            <MCSummaryStats
              totalPeopleReached={totalPeopleReached}
              totalSoulsWon={totalSoulsWon}
              conversionRate={conversionRate}
            />
            <MCPerformanceTable
              stats={stats}
              reports={reports}
              selectedYear={selectedYear}
              selectedMonth={selectedMonth}
              monthLabel={monthLabel}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}
