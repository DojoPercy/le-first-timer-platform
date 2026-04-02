"use client";

import { useEffect, useState } from "react";
import { StatsCard } from "@/components/stats-card";

type SummaryPayload = {
  totalBranches: number;
  activeBranches: number;
  totalUsers: number;
  totalFirstTimers: number;
  assignedFirstTimers: number;
  totalFollowups: number;
  contactedFollowups: number;
  branchHealth: Array<{
    branchId: string;
    branchName: string;
    status: "active" | "inactive";
    users: number;
    firstTimers: number;
    assignedFirstTimers: number;
    fullyJoined: number;
    pendingThisWeek: number;
    followups: number;
    contacted: number;
  }>;
  fullyJoinedFirstTimers: number;
};

export function SuperAdminDashboardClient() {
  const [summary, setSummary] = useState<SummaryPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSummary = async () => {
      try {
        const response = await fetch("/api/superadmin/summary", {
          cache: "no-store",
        });
        const payload = await response.json().catch(() => null);
        if (!response.ok) {
          throw new Error(payload?.message || "Failed to load summary");
        }
        setSummary(payload);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Failed to load summary");
      }
    };

    void loadSummary();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">
          Platform dashboard
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Cross-branch visibility for branches, users, first timers, and follow-ups.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatsCard label="Total branches" value={summary?.totalBranches ?? 0} />
        <StatsCard label="Active branches" value={summary?.activeBranches ?? 0} />
        <StatsCard label="Platform users" value={summary?.totalUsers ?? 0} />
        <StatsCard label="Total first timers" value={summary?.totalFirstTimers ?? 0} />
        <StatsCard label="Assigned first timers" value={summary?.assignedFirstTimers ?? 0} />
        <StatsCard label="Fully joined" value={summary?.fullyJoinedFirstTimers ?? 0} />
        <StatsCard
          label="Contacted follow-ups"
          value={`${summary?.contactedFollowups ?? 0} / ${summary?.totalFollowups ?? 0}`}
        />
      </div>

      <div className="rounded-3xl border border-slate-200">
        <div className="border-b border-slate-100 px-6 py-5">
          <h3 className="text-lg font-semibold text-slate-900">Branch health</h3>
          <p className="text-sm text-slate-500">
            Quick branch-by-branch coverage for users, intake, and follow-up.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-4 font-medium">Branch</th>
                <th className="px-4 py-4 font-medium">Users</th>
                <th className="px-4 py-4 font-medium">First Timers</th>
                <th className="px-4 py-4 font-medium">Assigned</th>
                <th className="px-4 py-4 font-medium">Fully Joined</th>
                <th className="px-4 py-4 font-medium">Pending</th>
                <th className="px-4 py-4 font-medium">Follow-ups</th>
                <th className="px-4 py-4 font-medium">Contacted</th>
                <th className="px-4 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {(summary?.branchHealth || []).map((branch) => (
                <tr key={branch.branchId}>
                  <td className="px-4 py-4 font-medium text-slate-900">{branch.branchName}</td>
                  <td className="px-4 py-4 text-slate-600">{branch.users}</td>
                  <td className="px-4 py-4 text-slate-600">{branch.firstTimers}</td>
                  <td className="px-4 py-4 text-slate-600">{branch.assignedFirstTimers}</td>
                  <td className="px-4 py-4 text-slate-600">{branch.fullyJoined}</td>
                  <td className="px-4 py-4 text-slate-600">{branch.pendingThisWeek}</td>
                  <td className="px-4 py-4 text-slate-600">{branch.followups}</td>
                  <td className="px-4 py-4 text-slate-600">{branch.contacted}</td>
                  <td className="px-4 py-4">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                      {branch.status}
                    </span>
                  </td>
                </tr>
              ))}
              {!error && (summary?.branchHealth || []).length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-slate-500">
                    No branch data available yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}
    </div>
  );
}
