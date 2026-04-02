"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Pagination } from "@/components/ui/pagination";
import { PaginationInfo } from "@/components/_reusable_components/pagination-info";
import { useCallerStore } from "@/lib/store/caller-store";
import { useFirstTimerStore } from "@/lib/store/first-timer-store";
import { useFollowupStore } from "@/lib/store/followup-store";
import { isInCurrentWeek } from "@/lib/utils/followup-week-check";

const ITEMS_PER_PAGE = 10;
type FollowupView = "weekly" | "all";

export default function AdminFollowupsPage() {
  const { followups, fetchFollowups, isLoading } = useFollowupStore();
  const { firstTimers, fetchFirstTimers } = useFirstTimerStore();
  const { callers, fetchCallers } = useCallerStore();
  const [callerFilter, setCallerFilter] = useState("");
  const [view, setView] = useState<FollowupView>("weekly");
  const [currentPage, setCurrentPage] = useState(1);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    void fetchFollowups();
    void fetchFirstTimers();
    void fetchCallers();
  }, [fetchCallers, fetchFirstTimers, fetchFollowups]);

  const firstTimerMap = useMemo(
    () => new Map(firstTimers.map((item) => [item.id, item])),
    [firstTimers]
  );
  const callerMap = useMemo(
    () => new Map(callers.map((item) => [item.id, item])),
    [callers]
  );

  const filteredFollowups = useMemo(() => {
    let items = followups;

    if (view === "weekly") {
      items = items.filter((followup) => isInCurrentWeek(followup.date));
    }

    if (callerFilter) {
      items = items.filter((followup) => followup.caller_id === callerFilter);
    }

    return items;
  }, [callerFilter, followups, view]);

  useEffect(() => {
    setCurrentPage(1);
  }, [callerFilter, view]);

  const totalPages = Math.ceil(filteredFollowups.length / ITEMS_PER_PAGE);
  const paginatedFollowups = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredFollowups.slice(start, start + ITEMS_PER_PAGE);
  }, [currentPage, filteredFollowups]);

  const handleReset = async () => {
    setResetting(true);
    try {
      await fetch("/api/admin/reset-followups", { method: "POST" });
      await fetchFollowups();
      await fetchFirstTimers();
    } finally {
      setResetting(false);
    }
  };

  const handleExportCsv = () => {
    const rows = [
      ["Date", "FirstTimer", "Caller", "Status", "Notes"],
      ...filteredFollowups.map((item) => [
        new Date(item.date).toISOString(),
        firstTimerMap.get(item.first_timer_id)?.full_name || item.first_timer_id,
        callerMap.get(item.caller_id)?.name || item.caller_id,
        item.status,
        item.notes || "",
      ]),
    ];

    const csv = rows
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "followups.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            Follow-ups
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Keep track of every call outcome and see where weekly follow-up is getting stuck.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setView("weekly")}
            className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
              view === "weekly"
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-200 text-slate-700 hover:bg-slate-50"
            }`}
          >
            This Week
          </button>
          <button
            type="button"
            onClick={() => setView("all")}
            className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
              view === "all"
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-200 text-slate-700 hover:bg-slate-50"
            }`}
          >
            All Time
          </button>
        </div>

        <select
          value={callerFilter}
          onChange={(event) => setCallerFilter(event.target.value)}
          className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none lg:min-w-[220px]"
        >
          <option value="">All callers</option>
          {callers
            .filter((caller) => caller.role === "caller")
            .map((caller) => (
              <option key={caller.id} value={caller.id}>
                {caller.name}
              </option>
            ))}
        </select>
        <button
          type="button"
          onClick={handleExportCsv}
          disabled={filteredFollowups.length === 0}
          className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Export CSV
        </button>
        <button
          type="button"
          onClick={() => void handleReset()}
          disabled={resetting}
          className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {resetting ? "Resetting..." : "Reset all follow-ups"}
        </button>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-4 font-medium">Date</th>
                <th className="px-4 py-4 font-medium">First Timer</th>
                <th className="px-4 py-4 font-medium">Caller</th>
                <th className="px-4 py-4 font-medium">Status</th>
                <th className="px-4 py-4 font-medium">Notes</th>
                <th className="px-4 py-4 font-medium">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {paginatedFollowups.map((followup) => (
                <tr key={followup.id}>
                  <td className="px-4 py-4 text-slate-600">
                    {new Date(followup.date).toLocaleString()}
                  </td>
                  <td className="px-4 py-4 font-medium text-slate-900">
                    {firstTimerMap.get(followup.first_timer_id)?.full_name || "Unknown"}
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    {callerMap.get(followup.caller_id)?.name || "Unknown"}
                  </td>
                  <td className="px-4 py-4">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                      {followup.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    {followup.notes || "No notes"}
                  </td>
                  <td className="px-4 py-4">
                    <Link
                      href={`/admin/followups/${followup.caller_id}`}
                      className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Open
                    </Link>
                  </td>
                </tr>
              ))}
              {!isLoading && paginatedFollowups.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    {view === "weekly"
                      ? "No follow-ups found for this week."
                      : "No follow-ups found."}
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 ? (
        <div className="flex flex-col items-center gap-4 border-t border-slate-200 pt-4">
          <Pagination
            current={currentPage}
            total={totalPages}
            onChange={setCurrentPage}
          />
          <PaginationInfo
            currentPage={currentPage}
            itemsPerPage={ITEMS_PER_PAGE}
            totalItems={filteredFollowups.length}
            itemName="follow-ups"
          />
        </div>
      ) : null}
    </div>
  );
}
