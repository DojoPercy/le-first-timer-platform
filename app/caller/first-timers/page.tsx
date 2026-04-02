"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useCallerStore } from "@/lib/store/caller-store";
import { useFollowupStore } from "@/lib/store/followup-store";
import { useFirstTimerStore } from "@/lib/store/first-timer-store";
import type { FirstTimer } from "@/lib/types";

type FollowupStatus = "Contacted" | "Pending" | "Not Reachable";
type FollowupOutcomeStatus =
  | "pending"
  | "still_deciding"
  | "fully_joined"
  | "not_continuing";

function getOutcomeLabel(status?: FollowupOutcomeStatus | null) {
  if (status === "still_deciding") return "Still Deciding";
  if (status === "fully_joined") return "Fully Joined";
  if (status === "not_continuing") return "Not Continuing";
  return "Follow-up Pending";
}

export default function CallerFirstTimersPage() {
  const supabase = createClient();
  const { currentCaller, fetchCurrentCaller, getMyFirstTimers } = useCallerStore();
  const { addFollowup } = useFollowupStore();
  const { updateFollowupOutcome } = useFirstTimerStore();
  const [items, setItems] = useState<FirstTimer[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [status, setStatus] = useState<FollowupStatus>("Contacted");
  const [outcomeStatus, setOutcomeStatus] = useState<FollowupOutcomeStatus>("pending");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user?.id) return;
      await fetchCurrentCaller(user.id);
    };

    void initialize();
  }, [fetchCurrentCaller, supabase.auth]);

  useEffect(() => {
    const loadItems = async () => {
      if (!currentCaller?.id) return;
      const data = await getMyFirstTimers(currentCaller.id);
      setItems(data);
      setSelectedId((current) => current || data[0]?.id || "");
    };

    void loadItems();
  }, [currentCaller?.id, getMyFirstTimers]);

  const selectedItem = useMemo(
    () => items.find((item) => item.id === selectedId),
    [items, selectedId]
  );

  useEffect(() => {
    setOutcomeStatus(selectedItem?.followup_outcome_status || "pending");
  }, [selectedItem]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!currentCaller?.id || !selectedId) return;

    setSaving(true);
    try {
      await addFollowup({
        first_timer_id: selectedId,
        caller_id: currentCaller.id,
        date: new Date().toISOString(),
        notes,
        status,
      });
      await updateFollowupOutcome(selectedId, outcomeStatus);
      setItems((current) =>
        current.map((item) =>
          item.id === selectedId
            ? {
                ...item,
                followup_outcome_status: outcomeStatus,
                joined_confirmed_at:
                  outcomeStatus === "fully_joined"
                    ? new Date().toISOString()
                    : item.joined_confirmed_at ?? null,
              }
            : item
        )
      );
      setNotes("");
      setStatus("Contacted");
      setOutcomeStatus(outcomeStatus);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">
          My first timers
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Review your assigned list and log a follow-up quickly from here.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="overflow-hidden rounded-3xl border border-slate-200">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-4 py-4 font-medium">Name</th>
                  <th className="px-4 py-4 font-medium">Contact</th>
                  <th className="px-4 py-4 font-medium">Cell</th>
                  <th className="px-4 py-4 font-medium">Visit Type</th>
                  <th className="px-4 py-4 font-medium">Outcome</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {items.map((item) => (
                  <tr
                    key={item.id}
                    className={selectedId === item.id ? "bg-slate-50" : undefined}
                    onClick={() => setSelectedId(item.id)}
                  >
                    <td className="cursor-pointer px-4 py-4 font-medium text-slate-900">
                      {item.full_name}
                    </td>
                    <td className="cursor-pointer px-4 py-4 text-slate-600">
                      {item.contact || "N/A"}
                    </td>
                    <td className="cursor-pointer px-4 py-4 text-slate-600">
                      {item.cell_name || "N/A"}
                    </td>
                    <td className="cursor-pointer px-4 py-4 text-slate-600">
                      {item.visit_type || "Unknown"}
                    </td>
                    <td className="cursor-pointer px-4 py-4 text-slate-600">
                      {getOutcomeLabel(item.followup_outcome_status)}
                    </td>
                  </tr>
                ))}
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                      No first timers are assigned to you yet.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>

        <section className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
          <h3 className="text-lg font-semibold text-slate-900">Log follow-up</h3>
          <p className="mt-2 text-sm text-slate-500">
            {selectedItem
              ? `Recording follow-up for ${selectedItem.full_name}.`
              : "Select a first timer from the table to record follow-up."}
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Status
              </label>
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value as FollowupStatus)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none"
              >
                <option value="Contacted">Contacted</option>
                <option value="Pending">Pending</option>
                <option value="Not Reachable">Not Reachable</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Follow-up outcome
              </label>
              <select
                value={outcomeStatus}
                onChange={(event) =>
                  setOutcomeStatus(event.target.value as FollowupOutcomeStatus)
                }
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none"
              >
                <option value="pending">Follow-up Pending</option>
                <option value="still_deciding">Still Deciding</option>
                <option value="fully_joined">Fully Joined</option>
                <option value="not_continuing">Not Continuing</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={6}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none"
                placeholder="What happened during the call or visit?"
              />
            </div>

            {selectedItem ? (
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
                Current recorded outcome:{" "}
                <span className="font-semibold text-slate-900">
                  {getOutcomeLabel(selectedItem.followup_outcome_status)}
                </span>
              </div>
            ) : null}

            <button
              type="submit"
              disabled={!selectedId || saving}
              className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save follow-up"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
