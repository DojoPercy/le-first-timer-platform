"use client";

import { useMemo, useState } from "react";

type PlatformReportRow = {
  id: string;
  branch_id: string;
  branch_name?: string;
  year: number;
  month: number;
  total_souls_assigned: number;
  total_followups_made: number;
  completion_percentage: number;
};

interface SuperAdminReportsClientProps {
  reports: PlatformReportRow[];
}

export function SuperAdminReportsClient({
  reports,
}: SuperAdminReportsClientProps) {
  const [query, setQuery] = useState("");
  const [branchFilter, setBranchFilter] = useState("");

  const branches = useMemo(
    () =>
      Array.from(
        new Map(
          reports.map((report) => [
            report.branch_id,
            report.branch_name || report.branch_id,
          ])
        ).entries()
      ),
    [reports]
  );

  const filteredReports = useMemo(() => {
    const lowered = query.trim().toLowerCase();
    let items = reports;

    if (branchFilter) {
      items = items.filter((report) => report.branch_id === branchFilter);
    }

    if (!lowered) return items;
    return items.filter((report) =>
      [report.branch_name, report.branch_id, `${report.month}/${report.year}`]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(lowered))
    );
  }, [branchFilter, query, reports]);

  const totals = useMemo(() => {
    return filteredReports.reduce(
      (acc, report) => {
        acc.assigned += report.total_souls_assigned || 0;
        acc.followups += report.total_followups_made || 0;
        acc.avgCompletion += report.completion_percentage || 0;
        return acc;
      },
      { assigned: 0, followups: 0, avgCompletion: 0 }
    );
  }, [filteredReports]);

  const averageCompletion =
    filteredReports.length > 0
      ? Math.round(totals.avgCompletion / filteredReports.length)
      : 0;
  const branchLeaderboard = useMemo(() => {
    const branchMap = new Map<
      string,
      {
        branchId: string;
        branchName: string;
        assigned: number;
        followups: number;
        completionTotal: number;
        rows: number;
      }
    >();

    for (const report of filteredReports) {
      const current = branchMap.get(report.branch_id) || {
        branchId: report.branch_id,
        branchName: report.branch_name || report.branch_id,
        assigned: 0,
        followups: 0,
        completionTotal: 0,
        rows: 0,
      };

      current.assigned += report.total_souls_assigned || 0;
      current.followups += report.total_followups_made || 0;
      current.completionTotal += report.completion_percentage || 0;
      current.rows += 1;
      branchMap.set(report.branch_id, current);
    }

    return Array.from(branchMap.values())
      .map((item) => ({
        ...item,
        averageCompletion:
          item.rows > 0 ? Math.round(item.completionTotal / item.rows) : 0,
      }))
      .sort((a, b) => b.averageCompletion - a.averageCompletion);
  }, [filteredReports]);

  const bestCompletionBranch = branchLeaderboard[0] || null;
  const topFollowupBranch =
    [...branchLeaderboard].sort((a, b) => b.followups - a.followups)[0] || null;

  const handleExportCsv = () => {
    const rows = [
      ["Branch", "BranchId", "Period", "Assigned", "FollowUps", "Completion"],
      ...filteredReports.map((report) => [
        report.branch_name || "",
        report.branch_id,
        `${report.month}/${report.year}`,
        String(report.total_souls_assigned),
        String(report.total_followups_made),
        `${report.completion_percentage}%`,
      ]),
    ];

    const csv = rows
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "platform-monthly-reports.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            Platform reports
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Monthly report comparisons and branch-level performance snapshots.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <select
            value={branchFilter}
            onChange={(event) => setBranchFilter(event.target.value)}
            className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none"
          >
            <option value="">All branches</option>
            {branches.map(([branchId, branchName]) => (
              <option key={branchId} value={branchId}>
                {branchName}
              </option>
            ))}
          </select>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Filter by branch or period"
            className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none"
          />
          <button
            type="button"
            onClick={handleExportCsv}
            disabled={filteredReports.length === 0}
            className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Export CSV
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
          <p className="text-sm font-medium text-slate-500">Visible rows</p>
          <p className="mt-3 text-3xl font-bold text-slate-900">{filteredReports.length}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
          <p className="text-sm font-medium text-slate-500">Assigned total</p>
          <p className="mt-3 text-3xl font-bold text-slate-900">{totals.assigned}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
          <p className="text-sm font-medium text-slate-500">Average completion</p>
          <p className="mt-3 text-3xl font-bold text-slate-900">{averageCompletion}%</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-3xl border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900">Branch comparison</h3>
          <p className="mt-1 text-sm text-slate-500">
            Best completion and strongest follow-up volume in the currently visible dataset.
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Best completion
              </p>
              <p className="mt-3 text-lg font-semibold text-slate-900">
                {bestCompletionBranch?.branchName || "No data"}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {bestCompletionBranch ? `${bestCompletionBranch.averageCompletion}% average completion` : ""}
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Most follow-ups
              </p>
              <p className="mt-3 text-lg font-semibold text-slate-900">
                {topFollowupBranch?.branchName || "No data"}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {topFollowupBranch ? `${topFollowupBranch.followups} follow-ups recorded` : ""}
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900">Leaderboard</h3>
          <p className="mt-1 text-sm text-slate-500">
            Branches ranked by average completion across the visible rows.
          </p>
          <div className="mt-5 space-y-3">
            {branchLeaderboard.slice(0, 5).map((branch) => (
              <div
                key={branch.branchId}
                className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3"
              >
                <div>
                  <p className="font-medium text-slate-900">{branch.branchName}</p>
                  <p className="text-xs text-slate-500">
                    {branch.followups} follow-ups • {branch.assigned} assigned
                  </p>
                </div>
                <span className="text-sm font-semibold text-slate-900">
                  {branch.averageCompletion}%
                </span>
              </div>
            ))}
            {branchLeaderboard.length === 0 ? (
              <div className="rounded-2xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                No branch comparison data available yet.
              </div>
            ) : null}
          </div>
        </section>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-4 font-medium">Branch</th>
                <th className="px-4 py-4 font-medium">Period</th>
                <th className="px-4 py-4 font-medium">Assigned</th>
                <th className="px-4 py-4 font-medium">Follow-ups</th>
                <th className="px-4 py-4 font-medium">Completion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredReports.map((report) => (
                <tr key={report.id}>
                  <td className="px-4 py-4">
                    <div className="font-medium text-slate-900">
                      {report.branch_name || report.branch_id}
                    </div>
                    <div className="text-xs text-slate-500">{report.branch_id}</div>
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    {report.month}/{report.year}
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    {report.total_souls_assigned}
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    {report.total_followups_made}
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    {report.completion_percentage}%
                  </td>
                </tr>
              ))}
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                    No platform reports found.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
