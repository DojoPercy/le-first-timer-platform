"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo } from "react";
import { StatsCard } from "@/components/stats-card";
import { useCallerStore } from "@/lib/store/caller-store";
import { useFirstTimerStore } from "@/lib/store/first-timer-store";
import { useFollowupStore } from "@/lib/store/followup-store";
import { isInCurrentWeek } from "@/lib/utils/followup-week-check";

function getOutcomeLabel(status?: string | null) {
  if (status === "still_deciding") return "Still Deciding";
  if (status === "fully_joined") return "Fully Joined";
  if (status === "not_continuing") return "Not Continuing";
  return "Follow-up Pending";
}

export default function FirstTimerDetailPage() {
  const params = useParams<{ id: string }>();
  const firstTimerId = params.id;
  const { firstTimers, fetchFirstTimers } = useFirstTimerStore();
  const { followups, fetchFollowups } = useFollowupStore();
  const { callers, fetchCallers } = useCallerStore();

  useEffect(() => {
    void fetchFirstTimers();
    void fetchFollowups({ firstTimerId });
    void fetchCallers();
  }, [fetchCallers, fetchFirstTimers, fetchFollowups, firstTimerId]);

  const firstTimer = firstTimers.find((item) => item.id === firstTimerId) || null;
  const assignedCaller = callers.find((caller) => caller.id === firstTimer?.assigned_caller_id);
  const weeklyFollowupDone = firstTimer?.last_followup_at
    ? isInCurrentWeek(firstTimer.last_followup_at)
    : false;

  const orderedTimeline = useMemo(() => {
    if (!firstTimer) return [];

    const entries = [
      {
        type: "intake",
        date: firstTimer.form_submitted_at || firstTimer.created_at,
        title: "First timer form submitted",
        description: `${firstTimer.full_name} was received into the platform.`,
      },
      ...(firstTimer.assigned_caller_id
        ? [
            {
              type: "assignment",
              date: firstTimer.updated_at,
              title: "Caller assigned",
              description: assignedCaller
                ? `${assignedCaller.name} is currently responsible for follow-up.`
                : "A caller has been assigned for follow-up.",
            },
          ]
        : []),
      ...(followups || []).map((followup) => ({
        type: "followup",
        date: followup.date,
        title: `Follow-up: ${followup.status}`,
        description: followup.notes || "No notes recorded.",
      })),
      ...(firstTimer.joined_confirmed_at
        ? [
            {
              type: "outcome",
              date: firstTimer.joined_confirmed_at,
              title: "Fully joined confirmed",
              description: "This first timer has been confirmed as fully joined.",
            },
          ]
        : []),
    ];

    return entries.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [assignedCaller, firstTimer, followups]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            {firstTimer?.full_name || "First timer details"}
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Full follow-up picture, outcome status, and timeline for this first timer.
          </p>
        </div>
        <Link
          href="/admin/first-timers"
          className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700"
        >
          Back to first timers
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard label="Outcome" value={getOutcomeLabel(firstTimer?.followup_outcome_status)} />
        <StatsCard label="Assigned Caller" value={assignedCaller?.name || "Unassigned"} />
        <StatsCard label="Weekly Follow-up" value={weeklyFollowupDone ? "Done" : "Needed"} />
        <StatsCard label="Total Follow-ups" value={followups.length} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-3xl border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900">Profile summary</h3>
          <div className="mt-5 space-y-4 text-sm text-slate-600">
            <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
              <span>Contact</span>
              <span className="font-semibold text-slate-900">{firstTimer?.contact || "N/A"}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
              <span>Residence</span>
              <span className="font-semibold text-slate-900">
                {firstTimer?.place_of_residence || "N/A"}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
              <span>Invited By</span>
              <span className="font-semibold text-slate-900">{firstTimer?.invited_by || "N/A"}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
              <span>Cell</span>
              <span className="font-semibold text-slate-900">{firstTimer?.cell_name || "N/A"}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
              <span>Initial Response</span>
              <span className="font-semibold text-slate-900">{firstTimer?.visit_type || "Unknown"}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
              <span>Joined Confirmed</span>
              <span className="font-semibold text-slate-900">
                {firstTimer?.joined_confirmed_at
                  ? new Date(firstTimer.joined_confirmed_at).toLocaleDateString()
                  : "Not yet"}
              </span>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900">Follow-up timeline</h3>
          <div className="mt-5 space-y-4">
            {orderedTimeline.map((entry, index) => (
              <div
                key={`${entry.type}-${entry.date}-${index}`}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4"
              >
                <div className="flex items-center justify-between gap-4">
                  <p className="font-semibold text-slate-900">{entry.title}</p>
                  <span className="text-xs text-slate-500">
                    {new Date(entry.date).toLocaleString()}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-600">{entry.description}</p>
              </div>
            ))}
            {orderedTimeline.length === 0 ? (
              <div className="rounded-2xl bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                No timeline activity yet.
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}
