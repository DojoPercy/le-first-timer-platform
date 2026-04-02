"use client";

import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HiOutlineRefresh } from "react-icons/hi";
import DeleteConfirmDialog from "@/components/_reusable_components/delete-confirm-dialog";
import { LoadingSkeleton } from "./LoadingSkeleton";
import { CallersStatsTable } from "./CallersStatsTable";
import { useCallersStats } from "./useCallersStats";
import { useResetFollowups } from "./useResetFollowups";
import { getWeekEnd, getWeekStart } from "@/lib/utils/followup-week-check";

export function CallersFollowupOverview() {
  const { callersStats, isLoading, fetchCallersStats } = useCallersStats();
  const {
    resetting,
    resetDialogOpen,
    setResetDialogOpen,
    handleResetFollowups,
  } = useResetFollowups(fetchCallersStats);
  const now = new Date();
  const weekStart = getWeekStart(now);
  const weekEnd = getWeekEnd(now);
  const weekRangeLabel = `${weekStart.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })} - ${weekEnd.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })}`;

  useEffect(() => {
    fetchCallersStats();
  }, [fetchCallersStats]);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-lg sm:text-xl">Follow-ups Overview</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Weekly progress for {weekRangeLabel}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setResetDialogOpen(true)}
              disabled={resetting}
              className="gap-2"
            >
              <HiOutlineRefresh className="h-4 w-4" />
              Reset All Follow-ups
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <CallersStatsTable callersStats={callersStats} />
        </CardContent>
      </Card>

      <DeleteConfirmDialog
        open={resetDialogOpen}
        onOpenChange={setResetDialogOpen}
        title="Reset All Follow-ups"
        description="Are you sure you want to delete all follow-ups? This action cannot be undone."
        confirmLabel="Reset"
        onConfirm={handleResetFollowups}
        loading={resetting}
      />
    </>
  );
}
