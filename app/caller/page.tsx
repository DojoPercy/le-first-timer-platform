"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { StatsCard } from "@/components/stats-card";
import { useCallerStore } from "@/lib/store/caller-store";
import { useFollowupStore } from "@/lib/store/followup-store";
import { hasFollowupThisWeek } from "@/lib/utils/followup-week-check";
import type { FirstTimer } from "@/lib/types";

export default function CallerDashboardPage() {
  const supabase = createClient();
  const { currentCaller, fetchCurrentCaller, getMyFirstTimers } = useCallerStore();
  const { fetchFollowups, followups } = useFollowupStore();
  const [myFirstTimers, setMyFirstTimers] = useState<FirstTimer[]>([]);

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
    const loadMyData = async () => {
      if (!currentCaller?.id) return;
      const items = await getMyFirstTimers(currentCaller.id);
      setMyFirstTimers(items);
      await fetchFollowups({ callerId: currentCaller.id });
    };

    void loadMyData();
  }, [currentCaller?.id, fetchFollowups, getMyFirstTimers]);

  const contactedCount = useMemo(
    () => followups.filter((followup) => followup.status === "Contacted").length,
    [followups]
  );
  const followedUpThisWeekCount = useMemo(() => {
    if (!currentCaller?.id) return 0;
    return myFirstTimers.filter((item) =>
      hasFollowupThisWeek(followups, item.id, currentCaller.id)
    ).length;
  }, [currentCaller?.id, followups, myFirstTimers]);
  const pendingThisWeekCount = useMemo(
    () => Math.max(myFirstTimers.length - followedUpThisWeekCount, 0),
    [followedUpThisWeekCount, myFirstTimers.length]
  );
  const fullyJoinedCount = useMemo(
    () =>
      myFirstTimers.filter((item) => item.followup_outcome_status === "fully_joined")
        .length,
    [myFirstTimers]
  );

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">
          My dashboard
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Keep up with the people assigned to you and the follow-ups you have logged.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard label="Assigned first timers" value={myFirstTimers.length} />
        <StatsCard label="Followed up this week" value={followedUpThisWeekCount} />
        <StatsCard label="Needs follow-up this week" value={pendingThisWeekCount} />
        <StatsCard label="Fully joined" value={fullyJoinedCount} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard label="My follow-ups" value={followups.length} />
        <StatsCard label="Contacted" value={contactedCount} />
        <StatsCard
          label="Caller"
          value={currentCaller?.name || "Loading..."}
          hint={currentCaller?.email}
        />
      </div>
    </div>
  );
}
