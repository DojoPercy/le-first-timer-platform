"use client";

import { Button } from "@/components/ui/button";
import { YearTargetDisplay } from "@/components/admin/dashboardStats/YearTargetDisplay";

interface SuperAdminDashboardHeaderProps {
  yearTarget: number | null;
  currentSouls: number;
  progressPercentage: number;
  setupRequired: boolean;
  onUpdateTarget: () => void;
}

export function SuperAdminDashboardHeader({
  yearTarget,
  currentSouls,
  progressPercentage,
  setupRequired,
  onUpdateTarget,
}: SuperAdminDashboardHeaderProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h1 className="mb-2 text-xl font-bold sm:text-2xl md:text-4xl">Platform Overview</h1>
          <p className="text-xs text-muted-foreground sm:text-sm md:text-base">
            Branch-wide ministry performance across all connected locations.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center xl:justify-end">
          <div className="overflow-x-auto">
            <div className="flex min-w-max items-center gap-3 rounded-xl border border-border/60 bg-card px-3 py-3 shadow-sm sm:px-4">
              <YearTargetDisplay
                yearTarget={yearTarget}
                currentSouls={currentSouls}
                progressPercentage={progressPercentage}
              />
            </div>
          </div>
          <Button type="button" variant="outline" onClick={onUpdateTarget}>
            Update Target
          </Button>
        </div>
      </div>

      {setupRequired ? (
        <p className="text-xs text-amber-600 dark:text-amber-400">
          Platform target setup is not enabled yet. Run the platform target SQL migration to save targets.
        </p>
      ) : null}
    </div>
  );
}
