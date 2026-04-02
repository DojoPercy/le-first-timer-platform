"use client";

import { Plus, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PlatformMetaStats } from "@/components/super-admin/PlatformMetaStats";

interface BranchesToolbarProps {
  branchCount: number;
  activeBranches: number;
  totalSouls: number;
  totalIntegrations: number;
  onCreate: () => void;
  onRefresh: () => void;
}

export function BranchesToolbar({
  branchCount,
  activeBranches,
  totalSouls,
  totalIntegrations,
  onCreate,
  onRefresh,
}: BranchesToolbarProps) {
  return (
    <>
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs text-muted-foreground sm:text-sm md:text-base">
            Create and manage church branches, branch admins, and connected sheets from one place.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button type="button" onClick={onCreate}>
            <Plus className="h-4 w-4" />
            Create Branch
          </Button>
          <Button type="button" variant="outline" onClick={onRefresh}>
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      <PlatformMetaStats
        soulsWon={totalSouls}
        branches={branchCount}
        activeBranches={activeBranches}
        integrations={totalIntegrations}
      />
    </>
  );
}
