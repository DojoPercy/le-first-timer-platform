"use client";

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { SetTargetDialog } from "@/components/admin/dashboardStats/SetTargetDialog";
import { PlatformBranchDistributionCard } from "@/components/super-admin/PlatformBranchDistributionCard";
import { PlatformBranchesTable } from "@/components/super-admin/PlatformBranchesTable";
import { PlatformMetaStats } from "@/components/super-admin/PlatformMetaStats";
import { PlatformSoulsWonTrendChart } from "@/components/super-admin/PlatformSoulsWonTrendChart";
import { SuperAdminDashboardHeader } from "@/components/super-admin/SuperAdminDashboardHeader";
import { useSuperAdminDashboard } from "@/components/super-admin/useSuperAdminDashboard";

export function SuperAdminDashboard() {
  const {
    data,
    error,
    isLoading,
    isSavingTarget,
    isTargetDialogOpen,
    targetInput,
    setIsTargetDialogOpen,
    setTargetInput,
    handleSetTarget,
  } = useSuperAdminDashboard();

  if (isLoading && !data) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (error && !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Platform summary unavailable</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!data) {
    return null;
  }

  const progressPercentage = data.platformTarget
    ? Math.min((data.totals.souls / data.platformTarget) * 100, 100)
    : 0;

  return (
    <div className="space-y-6 sm:space-y-8">
      <SuperAdminDashboardHeader
        yearTarget={data.platformTarget}
        currentSouls={data.totals.souls}
        progressPercentage={progressPercentage}
        setupRequired={data.platformTargetSetupRequired}
        onUpdateTarget={() => {
          setTargetInput(data.platformTarget ? String(data.platformTarget) : "");
          setIsTargetDialogOpen(true);
        }}
      />

      <PlatformMetaStats
        soulsWon={data.totals.souls}
        branches={data.totals.branches}
        activeBranches={data.totals.activeBranches}
        integrations={data.totals.activeIntegrations}
      />

      <PlatformBranchDistributionCard branches={data.branchSummaries} />

      <div className="w-full">
        <PlatformSoulsWonTrendChart
          monthlyTrend={data.monthlyTrend}
          yearlyTrend={data.yearlyTrend}
          totalSoulsWon={data.totalSoulsWon}
        />
      </div>

      <PlatformBranchesTable branches={data.branchSummaries} />

      <SetTargetDialog
        open={isTargetDialogOpen}
        onOpenChange={setIsTargetDialogOpen}
        targetInput={targetInput}
        onTargetInputChange={setTargetInput}
        currentTarget={data.platformTarget}
        onSetTarget={handleSetTarget}
      />

      {isSavingTarget ? <span className="sr-only">Saving platform target</span> : null}
    </div>
  );
}
