"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Pagination } from "@/components/ui/pagination";
import { PaginationInfo } from "@/components/_reusable_components/pagination-info";
import { useCallerStore } from "@/lib/store/caller-store";
import { useFirstTimerStore } from "@/lib/store/first-timer-store";
import { isInCurrentWeek } from "@/lib/utils/followup-week-check";
import { getISOWeekNumber, getWeekBounds } from "@/lib/utils/report-helpers";

const ITEMS_PER_PAGE = 10;

type FirstTimerView =
  | "all"
  | "unassigned"
  | "needs_followup"
  | "followed_this_week"
  | "fully_joined"
  | "still_deciding"
  | "not_continuing";

function getOutcomeLabel(status?: string | null) {
  if (status === "still_deciding") return "Still Deciding";
  if (status === "fully_joined") return "Fully Joined";
  if (status === "not_continuing") return "Not Continuing";
  return "Follow-up Pending";
}

function getOperationalDate(firstTimer: { form_submitted_at?: string | null; created_at: string }) {
  return new Date(firstTimer.form_submitted_at || firstTimer.created_at);
}

export default function AdminFirstTimersPage() {
  const { firstTimers, isLoading, fetchFirstTimers, assignFirstTimer } =
    useFirstTimerStore();
  const { callers, fetchCallers } = useCallerStore();
  const [query, setQuery] = useState("");
  const [view, setView] = useState<FirstTimerView>("all");
  const [selectedWeekKey, setSelectedWeekKey] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    void fetchFirstTimers();
    void fetchCallers();
  }, [fetchCallers, fetchFirstTimers]);

  const callerMap = useMemo(
    () => new Map(callers.map((caller) => [caller.id, caller.name])),
    [callers]
  );

  const weekOptions = useMemo(() => {
    const groups = new Map<
      string,
      {
        key: string;
        label: string;
        weekStart: Date;
        weekEnd: Date;
      }
    >();

    for (const item of firstTimers) {
      const createdAt = getOperationalDate(item);
      const { weekStart, weekEnd } = getWeekBounds(createdAt);
      const weekNumber = getISOWeekNumber(createdAt);
      const key = `${weekStart.getFullYear()}-W${weekNumber}`;

      if (!groups.has(key)) {
        groups.set(key, {
          key,
          label: `${weekStart.getFullYear()} Week ${weekNumber}`,
          weekStart,
          weekEnd,
        });
      }
    }

    return Array.from(groups.values()).sort(
      (a, b) => b.weekStart.getTime() - a.weekStart.getTime()
    );
  }, [firstTimers]);

  useEffect(() => {
    if (!selectedWeekKey && weekOptions.length > 0) {
      setSelectedWeekKey(weekOptions[0].key);
    }
  }, [selectedWeekKey, weekOptions]);

  const filteredFirstTimers = useMemo(() => {
    const lowered = query.trim().toLowerCase();
    const weekFiltered = firstTimers.filter((firstTimer) => {
      if (!selectedWeekKey) return false;
      const createdAt = getOperationalDate(firstTimer);
      const { weekStart } = getWeekBounds(createdAt);
      const weekNumber = getISOWeekNumber(createdAt);
      return `${weekStart.getFullYear()}-W${weekNumber}` === selectedWeekKey;
    });

    const viewFiltered = weekFiltered.filter((firstTimer) => {
      if (view === "unassigned") return !firstTimer.assigned_caller_id;
      if (view === "needs_followup") {
        return !!firstTimer.assigned_caller_id && !isInCurrentWeek(firstTimer.last_followup_at || "");
      }
      if (view === "followed_this_week") {
        return !!firstTimer.last_followup_at && isInCurrentWeek(firstTimer.last_followup_at);
      }
      if (view === "fully_joined") return firstTimer.followup_outcome_status === "fully_joined";
      if (view === "still_deciding") return firstTimer.followup_outcome_status === "still_deciding";
      if (view === "not_continuing") return firstTimer.followup_outcome_status === "not_continuing";
      return true;
    });

    const searched = !lowered
      ? viewFiltered
      : viewFiltered.filter((firstTimer) =>
          [
            firstTimer.full_name,
            firstTimer.contact,
            firstTimer.place_of_residence,
            firstTimer.invited_by,
            firstTimer.cell_name,
            firstTimer.visit_type,
            getOutcomeLabel(firstTimer.followup_outcome_status),
          ]
            .filter(Boolean)
            .some((value) => value!.toLowerCase().includes(lowered))
        );

    return searched.sort(
      (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );
  }, [firstTimers, query, selectedWeekKey, view]);

  useEffect(() => {
    setCurrentPage(1);
  }, [query, selectedWeekKey, view]);

  const selectedWeek = useMemo(
    () => weekOptions.find((option) => option.key === selectedWeekKey) || null,
    [selectedWeekKey, weekOptions]
  );

  const totalPages = Math.ceil(filteredFirstTimers.length / ITEMS_PER_PAGE);
  const paginatedFirstTimers = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredFirstTimers.slice(start, start + ITEMS_PER_PAGE);
  }, [currentPage, filteredFirstTimers]);

  const handleAssign = async (firstTimerId: string, callerId: string) => {
    setSavingId(firstTimerId);
    try {
      await assignFirstTimer(firstTimerId, callerId);
    } finally {
      setSavingId(null);
    }
  };

  const callerStats = useMemo(() => {
    return filteredFirstTimers.reduce<Record<string, number>>((acc, item) => {
      if (!item.assigned_caller_id) return acc;
      const callerName = callerMap.get(item.assigned_caller_id) || "Unknown Caller";
      acc[callerName] = (acc[callerName] || 0) + 1;
      return acc;
    }, {});
  }, [callerMap, filteredFirstTimers]);

  const handleExportCsv = () => {
    const rows = [
      [
        "FullName",
        "Contact",
        "Residence",
        "InvitedBy",
        "Cell",
        "VisitType",
        "OutcomeStatus",
        "JoinedConfirmedAt",
        "AssignedCallerId",
      ],
      ...filteredFirstTimers.map((item) => [
        item.full_name || "",
        item.contact || "",
        item.place_of_residence || "",
        item.invited_by || "",
        item.cell_name || "",
        item.visit_type || "",
        item.followup_outcome_status || "pending",
        item.joined_confirmed_at || "",
        item.assigned_caller_id || "",
      ]),
    ];

    const csv = rows
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = selectedWeek ? `first-timers-${selectedWeek.key}.csv` : "first-timers.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            First timers
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Review one week at a time, monitor assignments, and manage follow-up progress clearly.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            ["all", "All"],
            ["unassigned", "Unassigned"],
            ["needs_followup", "Needs Follow-up"],
            ["followed_this_week", "Followed This Week"],
            ["fully_joined", "Fully Joined"],
            ["still_deciding", "Still Deciding"],
            ["not_continuing", "Not Continuing"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setView(value as FirstTimerView)}
              className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                view === value
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[0.8fr_1fr_auto]">
        <select
          value={selectedWeekKey}
          onChange={(event) => setSelectedWeekKey(event.target.value)}
          className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none"
        >
          {weekOptions.map((week) => (
            <option key={week.key} value={week.key}>
              {week.label}
            </option>
          ))}
        </select>

        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by name, contact, residence, inviter, or cell"
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400"
        />

        <button
          type="button"
          onClick={handleExportCsv}
          disabled={filteredFirstTimers.length === 0}
          className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Export CSV
        </button>
      </div>

      {selectedWeek ? (
        <section className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50 px-6 py-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">{selectedWeek.label}</h3>
              <p className="mt-1 text-sm text-slate-500">
                {selectedWeek.weekStart.toLocaleDateString()} to {selectedWeek.weekEnd.toLocaleDateString()}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-white px-4 py-3 text-sm">
                <p className="text-slate-500">First timers</p>
                <p className="mt-1 font-semibold text-slate-900">{filteredFirstTimers.length}</p>
              </div>
              <div className="rounded-2xl bg-white px-4 py-3 text-sm">
                <p className="text-slate-500">Assigned</p>
                <p className="mt-1 font-semibold text-slate-900">
                  {filteredFirstTimers.filter((item) => item.assigned_caller_id).length}
                </p>
              </div>
              <div className="rounded-2xl bg-white px-4 py-3 text-sm">
                <p className="text-slate-500">Unassigned</p>
                <p className="mt-1 font-semibold text-slate-900">
                  {filteredFirstTimers.filter((item) => !item.assigned_caller_id).length}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {Object.entries(callerStats)
              .sort((a, b) => b[1] - a[1])
              .map(([callerName, count]) => (
                <span
                  key={`${selectedWeek.key}-${callerName}`}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700"
                >
                  {callerName}: {count}
                </span>
              ))}
            {Object.keys(callerStats).length === 0 ? (
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-500">
                No callers assigned yet in this week
              </span>
            ) : null}
          </div>
        </section>
      ) : null}

      <div className="overflow-hidden rounded-3xl border border-slate-200">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-4 font-medium">Name</th>
                <th className="px-4 py-4 font-medium">Contact</th>
                <th className="px-4 py-4 font-medium">Residence</th>
                <th className="px-4 py-4 font-medium">Invited By</th>
                <th className="px-4 py-4 font-medium">Cell</th>
                <th className="px-4 py-4 font-medium">Visit Type</th>
                <th className="px-4 py-4 font-medium">Outcome</th>
                <th className="px-4 py-4 font-medium">Assigned Caller</th>
                <th className="px-4 py-4 font-medium">Last Follow-up</th>
                <th className="px-4 py-4 font-medium">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {paginatedFirstTimers.map((firstTimer) => (
                <tr key={firstTimer.id}>
                  <td className="px-4 py-4 font-medium text-slate-900">
                    {firstTimer.full_name}
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    {firstTimer.contact || "N/A"}
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    {firstTimer.place_of_residence || "N/A"}
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    {firstTimer.invited_by || "N/A"}
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    {firstTimer.cell_name || "N/A"}
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    {firstTimer.visit_type || "Unknown"}
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-900">
                        {getOutcomeLabel(firstTimer.followup_outcome_status)}
                      </span>
                      {firstTimer.joined_confirmed_at ? (
                        <span className="text-xs text-slate-500">
                          Joined {new Date(firstTimer.joined_confirmed_at).toLocaleDateString()}
                        </span>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <select
                      value={firstTimer.assigned_caller_id || ""}
                      onChange={(event) =>
                        void handleAssign(firstTimer.id, event.target.value)
                      }
                      disabled={savingId === firstTimer.id}
                      className="w-full min-w-[180px] rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none"
                    >
                      <option value="">Unassigned</option>
                      {callers
                        .filter((caller) => caller.role === "caller")
                        .map((caller) => (
                          <option key={caller.id} value={caller.id}>
                            {caller.name}
                          </option>
                        ))}
                    </select>
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    {firstTimer.last_followup_at
                      ? new Date(firstTimer.last_followup_at).toLocaleDateString()
                      : "Not yet"}
                  </td>
                  <td className="px-4 py-4">
                    <Link
                      href={`/admin/first-timers/${firstTimer.id}`}
                      className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Open
                    </Link>
                  </td>
                </tr>
              ))}
              {!isLoading && paginatedFirstTimers.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-slate-500">
                    No first timers found for the selected week.
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
            totalItems={filteredFirstTimers.length}
            itemName="first timers"
          />
        </div>
      ) : null}
    </div>
  );
}
