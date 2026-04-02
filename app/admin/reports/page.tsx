"use client";

import { useEffect, useMemo, useState } from "react";
import { useReportsStore } from "@/lib/store/reports-store";

type ReportType = "weekly" | "monthly" | "yearly";

export default function AdminReportsPage() {
  const {
    weeklyReports,
    monthlyReports,
    yearlyReports,
    globalStats,
    trendData,
    fetchWeeklyReports,
    fetchMonthlyReports,
    fetchYearlyReports,
    fetchGlobalStats,
    fetchReportTrends,
    generateReports,
  } = useReportsStore();
  const [reportType, setReportType] = useState<ReportType>("monthly");
  const [busy, setBusy] = useState(false);
  const currentDate = useMemo(() => new Date(), []);

  useEffect(() => {
    void fetchWeeklyReports({ year: currentDate.getFullYear() });
    void fetchMonthlyReports({ year: currentDate.getFullYear() });
    void fetchYearlyReports({ year: currentDate.getFullYear() });
    void fetchGlobalStats(reportType, currentDate);
    void fetchReportTrends(reportType);
  }, [
    currentDate,
    fetchGlobalStats,
    fetchMonthlyReports,
    fetchReportTrends,
    fetchWeeklyReports,
    fetchYearlyReports,
    reportType,
  ]);

  const reports =
    reportType === "weekly"
      ? weeklyReports
      : reportType === "monthly"
        ? monthlyReports
        : yearlyReports;

  const handleGenerate = async () => {
    setBusy(true);
    try {
      await generateReports(reportType, currentDate);
      await Promise.all([
        fetchWeeklyReports({ year: currentDate.getFullYear() }),
        fetchMonthlyReports({ year: currentDate.getFullYear() }),
        fetchYearlyReports({ year: currentDate.getFullYear() }),
        fetchGlobalStats(reportType, currentDate),
        fetchReportTrends(reportType),
      ]);
    } finally {
      setBusy(false);
    }
  };

  const handleExportCsv = () => {
    const rows = [
      ["Caller", "Assigned", "FollowUps", "Contacted", "Pending", "NotReachable", "Completion"],
      ...reports.map((report) => [
        report.callers?.name || report.caller_id,
        String(report.total_first_timers_assigned ?? report.total_souls_assigned ?? 0),
        String(report.total_followups_made ?? 0),
        String(report.followups_contacted ?? 0),
        String(report.followups_pending ?? 0),
        String(report.followups_not_reachable ?? 0),
        `${report.completion_percentage ?? 0}%`,
      ]),
    ];

    const csv = rows
      .map((row) =>
        row
          .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `first-timer-${reportType}-reports.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const maxTrend = Math.max(
    ...trendData.map((item) => Math.max(item.firstTimers, item.followups)),
    1
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            Reports
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Generate summary reports from first timer assignments and follow-up activity.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <select
            value={reportType}
            onChange={(event) => setReportType(event.target.value as ReportType)}
            className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none"
          >
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
          <button
            type="button"
            onClick={() => void handleGenerate()}
            disabled={busy}
            className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? "Generating..." : `Generate ${reportType} reports`}
          </button>
          <button
            type="button"
            onClick={handleExportCsv}
            disabled={reports.length === 0}
            className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Export CSV
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
          <p className="text-sm font-medium text-slate-500">First timers in period</p>
          <p className="mt-3 text-3xl font-bold text-slate-900">
            {globalStats?.totalFirstTimers ?? 0}
          </p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
          <p className="text-sm font-medium text-slate-500">First timers this month</p>
          <p className="mt-3 text-3xl font-bold text-slate-900">
            {globalStats?.firstTimersInMonth ?? 0}
          </p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
          <p className="text-sm font-medium text-slate-500">Follow-ups in period</p>
          <p className="mt-3 text-3xl font-bold text-slate-900">
            {globalStats?.totalFollowups ?? 0}
          </p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
          <p className="text-sm font-medium text-slate-500">Tracked cells</p>
          <p className="mt-3 text-3xl font-bold text-slate-900">
            {Object.keys(globalStats?.cellDistribution || {}).length}
          </p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-3xl border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Trend snapshot</h3>
              <p className="text-sm text-slate-500">
                First timers versus follow-ups across recent {reportType} periods.
              </p>
            </div>
          </div>

          <div className="mt-6 flex items-end gap-3 overflow-x-auto">
            {trendData.map((item) => (
              <div key={item.sortKey ?? item.period} className="min-w-[84px] flex-1">
                <div className="flex h-44 items-end justify-center gap-2">
                  <div
                    className="w-4 rounded-t-full bg-slate-900"
                    style={{ height: `${(item.firstTimers / maxTrend) * 100}%` }}
                  />
                  <div
                    className="w-4 rounded-t-full bg-slate-300"
                    style={{ height: `${(item.followups / maxTrend) * 100}%` }}
                  />
                </div>
                <p className="mt-3 text-center text-xs font-medium text-slate-500">
                  {item.period}
                </p>
                <p className="mt-1 text-center text-xs text-slate-400">
                  {item.firstTimers}/{item.followups}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900">Caller activity</h3>
          <p className="text-sm text-slate-500">
            Follow-up volume recorded in the selected period.
          </p>

          <div className="mt-5 space-y-3">
            {(globalStats?.callerPerformance || []).map((caller) => (
              <div
                key={caller.callerId}
                className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3"
              >
                <span className="text-sm font-medium text-slate-700">{caller.name}</span>
                <span className="text-sm font-semibold text-slate-900">
                  {caller.followups} follow-ups
                </span>
              </div>
            ))}
            {(globalStats?.callerPerformance || []).length === 0 ? (
              <div className="rounded-2xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                No caller activity yet for this period.
              </div>
            ) : null}
          </div>
        </section>
      </div>

      <section className="rounded-3xl border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900">Inviter performance</h3>
        <p className="text-sm text-slate-500">
          Which inviters are bringing people in and how many have fully joined in the selected period.
        </p>

        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-slate-500">
              <tr>
                <th className="pb-3 font-medium">Invited By</th>
                <th className="pb-3 font-medium">Total Invited</th>
                <th className="pb-3 font-medium">Fully Joined</th>
                <th className="pb-3 font-medium">Still Deciding</th>
                <th className="pb-3 font-medium">Pending</th>
                <th className="pb-3 font-medium">Conversion</th>
              </tr>
            </thead>
            <tbody>
              {(globalStats?.inviterPerformance || []).map((inviter) => (
                <tr key={inviter.inviter} className="border-t border-slate-100">
                  <td className="py-3 font-medium text-slate-900">{inviter.inviter}</td>
                  <td className="py-3 text-slate-600">{inviter.invitedCount}</td>
                  <td className="py-3 text-slate-600">{inviter.fullyJoinedCount}</td>
                  <td className="py-3 text-slate-600">{inviter.stillDecidingCount}</td>
                  <td className="py-3 text-slate-600">{inviter.pendingCount}</td>
                  <td className="py-3 text-slate-600">{inviter.conversionRate}%</td>
                </tr>
              ))}
              {(globalStats?.inviterPerformance || []).length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-500">
                    No inviter data yet for this period.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <div className="overflow-hidden rounded-3xl border border-slate-200">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-4 font-medium">Caller</th>
                <th className="px-4 py-4 font-medium">Assigned</th>
                <th className="px-4 py-4 font-medium">Follow-ups</th>
                <th className="px-4 py-4 font-medium">Contacted</th>
                <th className="px-4 py-4 font-medium">Completion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {reports.map((report) => (
                <tr key={report.id}>
                  <td className="px-4 py-4 font-medium text-slate-900">
                    {report.callers?.name || report.caller_id}
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    {report.total_first_timers_assigned ?? report.total_souls_assigned}
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    {report.total_followups_made}
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    {report.followups_contacted}
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    {report.completion_percentage}%
                  </td>
                </tr>
              ))}
              {reports.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                    No {reportType} reports available yet.
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
