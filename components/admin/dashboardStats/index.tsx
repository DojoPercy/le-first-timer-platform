"use client";

import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { YearTargetDisplay } from "./YearTargetDisplay";
import { SyncErrorsDisplay } from "./SyncErrorsDisplay";
import { ActionButtons } from "./ActionButtons";
import { SetTargetDialog } from "./SetTargetDialog";
import { useDashboardStore } from "@/lib/store/dashboard-store";
import { AdminSoulStats } from "@/components/admin/AdminSoulStats";

export function DashboardStats() {
  const {
    stats,
    isLoading,
    fetchStats,
    yearTarget,
    isTargetDialogOpen,
    setIsTargetDialogOpen,
    targetInput,
    setTargetInput,
    handleSetTarget,
    calculateProgress,
    syncing,
    syncErrors,
    handleSyncSheets,
    assigning,
    handleAssignAllSouls,
  } = useDashboardStore();

  useEffect(() => {
    fetchStats();
    if (typeof window !== "undefined") {
      useDashboardStore.getState().fetchYearTarget();
    }
  }, [fetchStats]);

  const progressPercentage = calculateProgress(stats.totalSouls);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4">
          <Skeleton className="h-24 w-full rounded-2xl" />
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <Skeleton className="h-7 w-40" />
            <Skeleton className="h-9 w-32" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="overflow-x-auto">
          <div className="flex min-w-max items-center justify-between gap-4">
            <div className="flex min-w-[360px] flex-1 items-center gap-3">
              <YearTargetDisplay
                yearTarget={yearTarget}
                currentSouls={stats.totalSouls}
                progressPercentage={progressPercentage}
              />
            </div>
            <div className="flex items-center gap-2 sm:gap-3 whitespace-nowrap">
              <ActionButtons
                syncing={syncing}
                assigning={assigning}
                onSync={() => handleSyncSheets(false)}
                onAssign={handleAssignAllSouls}
                onSetTarget={() => {
                  if (yearTarget && yearTarget > 0) {
                    setTargetInput(yearTarget.toString());
                  } else {
                    setTargetInput("");
                  }
                  setIsTargetDialogOpen(true);
                }}
                currentTarget={yearTarget}
              />
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <SyncErrorsDisplay syncErrors={syncErrors} />
        </div>
      </div>

      <AdminSoulStats
        totalSouls={stats.totalSouls}
        assignedSouls={stats.assignedSouls}
        unassignedSouls={stats.unassignedSouls}
        altarCallSouls={stats.altarCallSouls}
      />

      <SetTargetDialog
        open={isTargetDialogOpen}
        onOpenChange={setIsTargetDialogOpen}
        targetInput={targetInput}
        onTargetInputChange={setTargetInput}
        currentTarget={yearTarget}
        onSetTarget={handleSetTarget}
      />
    </div>
  );
}
