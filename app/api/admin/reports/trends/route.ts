import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentActor, isAdminLike, resolveBranchScope } from "@/lib/auth/server";

function getWeekStart(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const weekStart = new Date(d.setDate(diff));
  weekStart.setHours(0, 0, 0, 0);
  return weekStart;
}

function formatPeriod(date: Date, period: "weekly" | "monthly" | "yearly") {
  if (period === "weekly") {
    const weekStart = getWeekStart(date);
    const yearStart = new Date(weekStart.getFullYear(), 0, 1);
    const yearStartWeek = getWeekStart(yearStart);
    const diffMs = weekStart.getTime() - yearStartWeek.getTime();
    const weekNumber = Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000)) + 1;
    return `${weekStart.getFullYear()}-W${weekNumber}`;
  }
  if (period === "monthly") {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  }
  return `${date.getFullYear()}`;
}

function buildTrendBuckets(period: "weekly" | "monthly" | "yearly") {
  const now = new Date();
  return Array.from({ length: 6 }).map((_, index) => {
    const date = new Date(now);
    if (period === "weekly") {
      date.setDate(now.getDate() - (5 - index) * 7);
      const weekStart = getWeekStart(date);
      return {
        label: formatPeriod(weekStart, period),
        date: weekStart,
        firstTimers: 0,
        followups: 0,
      };
    } else if (period === "monthly") {
      date.setMonth(now.getMonth() - (5 - index));
    } else {
      date.setFullYear(now.getFullYear() - (5 - index));
    }
    return {
      label: formatPeriod(date, period),
      date,
      firstTimers: 0,
      followups: 0,
    };
  });
}

export async function GET(request: Request) {
  try {
    const { actor } = await getCurrentActor();
    if (!actor || !isAdminLike(actor)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = (searchParams.get("period") || "monthly") as
      | "weekly"
      | "monthly"
      | "yearly";
    const branchId = resolveBranchScope(actor, searchParams.get("branchId"));

    if (!branchId) {
      return NextResponse.json(
        { message: "A branch must be selected to fetch report trends." },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const [firstTimersRes, followupsRes] = await Promise.all([
      supabase.from("first_timers").select("created_at, form_submitted_at").eq("branch_id", branchId),
      supabase.from("followups").select("date").eq("branch_id", branchId),
    ]);

    if (firstTimersRes.error) throw firstTimersRes.error;
    if (followupsRes.error) throw followupsRes.error;

    const buckets = buildTrendBuckets(period);
    const bucketMap = new Map(buckets.map((bucket) => [bucket.label, bucket]));

    for (const item of firstTimersRes.data || []) {
      const label = formatPeriod(
        new Date(item.form_submitted_at || item.created_at),
        period
      );
      const bucket = bucketMap.get(label);
      if (bucket) bucket.firstTimers += 1;
    }

    for (const item of followupsRes.data || []) {
      const label = formatPeriod(new Date(item.date), period);
      const bucket = bucketMap.get(label);
      if (bucket) bucket.followups += 1;
    }

    return NextResponse.json({
      trendData: buckets.map((bucket) => ({
        period: bucket.label,
        firstTimers: bucket.firstTimers,
        followups: bucket.followups,
        sortKey: bucket.date.toISOString(),
      })),
    });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
