"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AdminFollowupOverview } from "@/components/admin/admin-followup-overview";
import { CallerProgressMonitor } from "@/components/admin/caller-progress-monitor";
import { StatsCard } from "@/components/stats-card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { createClient } from "@/lib/supabase/client";
import { getWeekEnd, getWeekStart } from "@/lib/utils/followup-week-check";
import type { Followup } from "@/lib/types";
import { BarChart3, ListChecks, RefreshCw } from "lucide-react";

interface WeeklyStats {
  totalCallers: number;
  activeCallers: number;
  totalAssigned: number;
  totalFollowedUp: number;
  overallCompletionRate: number;
  weekStart: Date;
  weekEnd: Date;
}

function buildWeeklyTrend(weekStart: Date, weekEnd: Date, followups: Followup[]) {
  const rows: { day: string; followedUp: number; pending: number }[] = [];
  const cursor = new Date(
    weekStart.getFullYear(),
    weekStart.getMonth(),
    weekStart.getDate()
  );
  const last = new Date(weekEnd.getFullYear(), weekEnd.getMonth(), weekEnd.getDate());

  while (cursor.getTime() <= last.getTime()) {
    const dayStart = new Date(cursor);
    dayStart.setHours(0, 0, 0, 0);
    const dayEndAt = new Date(cursor);
    dayEndAt.setHours(23, 59, 59, 999);
    const label = dayStart.toLocaleDateString("en-US", { weekday: "short" });
    const followedUp = followups.filter((f) => {
      const fd = new Date(f.date);
      return fd >= dayStart && fd <= dayEndAt;
    }).length;
    rows.push({ day: label, followedUp, pending: 0 });
    cursor.setDate(cursor.getDate() + 1);
  }
  return rows;
}

export default function FollowupsSummaryPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats | null>(null);
  const [statusBreakdown, setStatusBreakdown] = useState({
    contacted: 0,
    pending: 0,
    notReachable: 0,
  });
  const [weeklyTrend, setWeeklyTrend] = useState<
    { day: string; followedUp: number; pending: number }[]
  >([]);

  const supabase = createClient();

  const fetchWeeklyStats = useCallback(async () => {
    try {
      setIsLoading(true);

      const now = new Date();
      const weekStart = getWeekStart(now);
      const weekEnd = getWeekEnd(now);

      const { data: callers, error: callersError } = await supabase
        .from("callers")
        .select("*")
        .eq("role", "caller");

      if (callersError) throw callersError;

      const { data: firstTimers, error: firstTimersError } = await supabase
        .from("first_timers")
        .select("*");

      if (firstTimersError) throw firstTimersError;

      const { data: weeklyFollowups, error: followupsError } = await supabase
        .from("followups")
        .select("*")
        .gte("date", weekStart.toISOString())
        .lte("date", weekEnd.toISOString());

      if (followupsError) throw followupsError;

      const list = (weeklyFollowups ?? []) as Followup[];

      const assignedFirstTimers = (firstTimers ?? []).filter((ft) => ft.assigned_caller_id);
      const uniqueFollowedUpThisWeek = new Set(list.map((f) => f.first_timer_id)).size;
      const activeCallers = new Set(list.map((f) => f.caller_id)).size;
      const overallCompletionRate =
        assignedFirstTimers.length > 0
          ? Math.round((uniqueFollowedUpThisWeek / assignedFirstTimers.length) * 100)
          : 0;

      setWeeklyStats({
        totalCallers: callers?.length ?? 0,
        activeCallers,
        totalAssigned: assignedFirstTimers.length,
        totalFollowedUp: uniqueFollowedUpThisWeek,
        overallCompletionRate,
        weekStart,
        weekEnd,
      });

      setStatusBreakdown({
        contacted: list.filter((f) => f.status === "Contacted").length,
        pending: list.filter((f) => f.status === "Pending").length,
        notReachable: list.filter((f) => f.status === "Not Reachable").length,
      });

      setWeeklyTrend(buildWeeklyTrend(weekStart, weekEnd, list));
    } catch (error) {
      console.error("Failed to fetch weekly stats:", error);
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    void fetchWeeklyStats();
  }, [fetchWeeklyStats]);

  const pendingAssigned =
    weeklyStats != null
      ? Math.max(weeklyStats.totalAssigned - weeklyStats.totalFollowedUp, 0)
      : 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            Follow-ups summary
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            High-level coverage for the current week (Monday–Sunday), aligned with the
            Follow-ups list.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={isLoading}
            onClick={() => void fetchWeeklyStats()}
            className="rounded-2xl border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700"
          >
            {isLoading ? (
              <>
                <Spinner className="mr-2 h-4 w-4" />
                Refreshing…
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </>
            )}
          </Button>
          <Button
            asChild
            className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
          >
            <Link href="/admin/followups" className="inline-flex items-center">
              <ListChecks className="mr-2 h-4 w-4" />
              Open follow-ups
            </Link>
          </Button>
        </div>
      </div>

      {isLoading && !weeklyStats ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-28 rounded-2xl border border-slate-200 bg-slate-50 animate-pulse"
            />
          ))}
        </div>
      ) : null}

      {weeklyStats ? (
        <>
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-slate-900">
                <BarChart3 className="h-5 w-5" />
                <h3 className="text-lg font-semibold">This week at a glance</h3>
              </div>
              <p className="text-sm text-slate-500">
                {weeklyStats.weekStart.toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })}{" "}
                –{" "}
                {weeklyStats.weekEnd.toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
              <StatsCard label="Total callers" value={weeklyStats.totalCallers} />
              <StatsCard label="Active this week" value={weeklyStats.activeCallers} />
              <StatsCard label="Assigned first timers" value={weeklyStats.totalAssigned} />
              <StatsCard label="Unique followed up" value={weeklyStats.totalFollowedUp} />
              <StatsCard
                label="Completion rate"
                value={`${weeklyStats.overallCompletionRate}%`}
                hint="Share of assigned people with ≥1 follow-up this week"
              />
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-slate-900">Charts</h3>
            <AdminFollowupOverview
              embedChartsOnly
              isLoading={isLoading}
              stats={{
                totalFirstTimers: weeklyStats.totalAssigned,
                followedUpThisWeek: weeklyStats.totalFollowedUp,
                pendingThisWeek: pendingAssigned,
                completionRate: weeklyStats.overallCompletionRate,
                statusBreakdown,
                weeklyTrend,
              }}
            />
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-slate-900">Caller progress</h3>
            <CallerProgressMonitor hideWeeklyOverview />
          </section>
        </>
      ) : null}
    </div>
  );
}
