"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useDashboardStore } from "@/lib/store/dashboard-store";
import { StatsCard } from "@/components/stats-card";

export default function AdminDashboardPage() {
  const {
    stats,
    isLoading,
    fetchStats,
    handleSyncSheets,
    syncing,
    handleAssignAllFirstTimers,
    assigning,
  } = useDashboardStore();

  useEffect(() => {
    void fetchStats();
  }, [fetchStats]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            Branch dashboard
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Track intake volume, caller coverage, and the current follow-up picture.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => void handleSyncSheets(false)}
            disabled={syncing}
            className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {syncing ? "Syncing..." : "Sync Google Sheets"}
          </button>
          <button
            type="button"
            onClick={() => void handleAssignAllFirstTimers()}
            disabled={assigning}
            className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {assigning ? "Assigning..." : "Redistribute assignments"}
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard label="Total first timers" value={stats.totalFirstTimers} />
        <StatsCard label="Assigned" value={stats.assignedFirstTimers} />
        <StatsCard label="Unassigned" value={stats.unassignedFirstTimers} />
        <StatsCard label="Fully joined" value={stats.fullyJoinedCount} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard label="Joining" value={stats.joiningCount} />
        <StatsCard label="Visiting" value={stats.visitingCount} />
        <StatsCard label="Followed up this week" value={stats.followedUpThisWeekCount} />
        <StatsCard
          label="Needs follow-up this week"
          value={stats.pendingFollowupThisWeekCount}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-3xl border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900">Top cells</h3>
          <p className="text-sm text-slate-500">
            Where first timers are being received most often.
          </p>

          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-slate-500">
                <tr>
                  <th className="pb-3 font-medium">Cell</th>
                  <th className="pb-3 font-medium">Count</th>
                  <th className="pb-3 font-medium">Share</th>
                </tr>
              </thead>
              <tbody>
                {stats.topCells.map((cell) => {
                  const share = cell.total > 0 ? Math.round((cell.count / cell.total) * 100) : 0;
                  return (
                    <tr key={cell.cell} className="border-t border-slate-100">
                      <td className="py-3 font-medium text-slate-900">{cell.cell}</td>
                      <td className="py-3 text-slate-600">{cell.count}</td>
                      <td className="py-3 text-slate-600">{share}%</td>
                    </tr>
                  );
                })}
                {!isLoading && stats.topCells.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-6 text-center text-slate-500">
                      No cell data available yet.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
          <h3 className="text-lg font-semibold text-slate-900">This week</h3>
          <div className="mt-4 space-y-4 text-sm text-slate-600">
            <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3">
              <span>Total follow-ups</span>
              <span className="font-semibold text-slate-900">{stats.totalFollowups}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3">
              <span>Contacted</span>
              <span className="font-semibold text-slate-900">{stats.followupsContacted}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3">
              <span>Needs follow-up this week</span>
              <span className="font-semibold text-slate-900">{stats.pendingFollowupThisWeekCount}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3">
              <span>Completion rate</span>
              <span className="font-semibold text-slate-900">{stats.completionRate}%</span>
            </div>
          </div>
        </section>
      </div>

      <section className="rounded-3xl border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900">Caller weekly accountability</h3>
        <p className="mt-1 text-sm text-slate-500">
          Who has been assigned work, who has followed up this week, and who still has people pending.
        </p>
        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-slate-500">
              <tr>
                <th className="pb-3 font-medium">Caller</th>
                <th className="pb-3 font-medium">Assigned</th>
                <th className="pb-3 font-medium">Followed Up This Week</th>
                <th className="pb-3 font-medium">Pending This Week</th>
                <th className="pb-3 font-medium">Fully Joined</th>
              </tr>
            </thead>
            <tbody>
              {stats.callerWeeklyPerformance.map((caller) => (
                <tr key={caller.callerId} className="border-t border-slate-100">
                  <td className="py-3 font-medium text-slate-900">{caller.name}</td>
                  <td className="py-3 text-slate-600">{caller.assigned}</td>
                  <td className="py-3 text-slate-600">{caller.followedUpThisWeek}</td>
                  <td className="py-3 text-slate-600">{caller.pendingThisWeek}</td>
                  <td className="py-3 text-slate-600">{caller.fullyJoined}</td>
                </tr>
              ))}
              {!isLoading && stats.callerWeeklyPerformance.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-500">
                    No caller performance data available yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900">Quick actions</h3>
        <p className="mt-1 text-sm text-slate-500">
          Jump straight into the most common branch workflows.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/admin/first-timers"
            className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white"
          >
            Review first timers
          </Link>
          <Link
            href="/admin/followups"
            className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700"
          >
            Manage follow-ups
          </Link>
          <Link
            href="/admin/reports"
            className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700"
          >
            Open reports
          </Link>
          <Link
            href="/admin/users"
            className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700"
          >
            Manage users
          </Link>
        </div>
      </section>
    </div>
  );
}
