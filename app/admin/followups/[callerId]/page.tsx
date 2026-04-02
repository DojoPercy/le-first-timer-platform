"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo } from "react";
import { useCallerStore } from "@/lib/store/caller-store";
import { useFirstTimerStore } from "@/lib/store/first-timer-store";
import { useFollowupStore } from "@/lib/store/followup-store";
import { StatsCard } from "@/components/stats-card";

export default function CallerFollowupsDrilldownPage() {
  const params = useParams<{ callerId: string }>();
  const callerId = params.callerId;
  const { callers, fetchCallers } = useCallerStore();
  const { firstTimers, fetchFirstTimers } = useFirstTimerStore();
  const { followups, fetchFollowups } = useFollowupStore();

  useEffect(() => {
    void fetchCallers();
    void fetchFirstTimers();
    void fetchFollowups({ callerId });
  }, [callerId, fetchCallers, fetchFirstTimers, fetchFollowups]);

  const caller = callers.find((item) => item.id === callerId);
  const assignedFirstTimers = useMemo(
    () => firstTimers.filter((item) => item.assigned_caller_id === callerId),
    [callerId, firstTimers]
  );
  const contacted = followups.filter((item) => item.status === "Contacted").length;
  const pending = followups.filter((item) => item.status === "Pending").length;
  const notReachable = followups.filter((item) => item.status === "Not Reachable").length;
  const firstTimerMap = new Map(assignedFirstTimers.map((item) => [item.id, item.full_name]));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            {caller?.name || "Caller"} follow-up drilldown
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Assigned first timers and the follow-up outcomes recorded for this caller.
          </p>
        </div>
        <Link
          href="/admin/followups"
          className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700"
        >
          Back to follow-ups
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard label="Assigned first timers" value={assignedFirstTimers.length} />
        <StatsCard label="Total follow-ups" value={followups.length} />
        <StatsCard label="Contacted" value={contacted} />
        <StatsCard label="Pending / Not Reachable" value={`${pending} / ${notReachable}`} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="overflow-hidden rounded-3xl border border-slate-200">
          <div className="border-b border-slate-100 px-4 py-4">
            <h3 className="font-semibold text-slate-900">Assigned first timers</h3>
          </div>
          <div className="divide-y divide-slate-100 bg-white">
            {assignedFirstTimers.map((item) => (
              <div key={item.id} className="px-4 py-4">
                <p className="font-medium text-slate-900">{item.full_name}</p>
                <p className="mt-1 text-sm text-slate-500">
                  {item.contact || "N/A"} • {item.cell_name || "No cell"} • {item.visit_type || "Unknown"}
                </p>
              </div>
            ))}
            {assignedFirstTimers.length === 0 ? (
              <div className="px-4 py-8 text-center text-slate-500">
                No first timers assigned to this caller yet.
              </div>
            ) : null}
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-200">
          <div className="border-b border-slate-100 px-4 py-4">
            <h3 className="font-semibold text-slate-900">Follow-up activity</h3>
          </div>
          <div className="divide-y divide-slate-100 bg-white">
            {followups.map((item) => (
              <div key={item.id} className="px-4 py-4">
                <div className="flex items-center justify-between gap-4">
                  <p className="font-medium text-slate-900">
                    {firstTimerMap.get(item.first_timer_id) || item.first_timer_id}
                  </p>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                    {item.status}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  {new Date(item.date).toLocaleString()}
                </p>
                <p className="mt-2 text-sm text-slate-600">{item.notes || "No notes"}</p>
              </div>
            ))}
            {followups.length === 0 ? (
              <div className="px-4 py-8 text-center text-slate-500">
                No follow-ups recorded for this caller.
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
