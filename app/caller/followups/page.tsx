"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useCallerStore } from "@/lib/store/caller-store";
import { useFollowupStore } from "@/lib/store/followup-store";

export default function CallerFollowupsPage() {
  const supabase = createClient();
  const { currentCaller, fetchCurrentCaller } = useCallerStore();
  const { followups, fetchFollowups } = useFollowupStore();

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
    if (!currentCaller?.id) return;
    void fetchFollowups({ callerId: currentCaller.id });
  }, [currentCaller?.id, fetchFollowups]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">
          My follow-ups
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Review the follow-ups you have logged so far.
        </p>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-4 font-medium">Date</th>
                <th className="px-4 py-4 font-medium">Status</th>
                <th className="px-4 py-4 font-medium">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {followups.map((followup) => (
                <tr key={followup.id}>
                  <td className="px-4 py-4 text-slate-600">
                    {new Date(followup.date).toLocaleString()}
                  </td>
                  <td className="px-4 py-4">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                      {followup.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    {followup.notes || "No notes"}
                  </td>
                </tr>
              ))}
              {followups.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-slate-500">
                    No follow-ups logged yet.
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
