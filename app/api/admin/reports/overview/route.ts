import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentActor, isAdminLike, resolveBranchScope } from "@/lib/auth/server";

function isInWindow(dateString: string, start: Date, end: Date) {
  const date = new Date(dateString);
  return date >= start && date <= end;
}

function getWindow(period: "weekly" | "monthly" | "yearly", date: Date) {
  if (period === "weekly") {
    const start = new Date(date);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1);
    start.setDate(diff);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }

  if (period === "monthly") {
    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
    return { start, end };
  }

  const start = new Date(date.getFullYear(), 0, 1);
  const end = new Date(date.getFullYear(), 11, 31, 23, 59, 59, 999);
  return { start, end };
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
    const date = new Date(searchParams.get("date") || new Date().toISOString());
    const branchId = resolveBranchScope(actor, searchParams.get("branchId"));

    if (!branchId) {
      return NextResponse.json(
        { message: "A branch must be selected to fetch report overview." },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const [firstTimersRes, followupsRes, callersRes] = await Promise.all([
      supabase.from("first_timers").select("*").eq("branch_id", branchId),
      supabase.from("followups").select("*").eq("branch_id", branchId),
      supabase.from("callers").select("id, name").eq("branch_id", branchId).eq("role", "caller"),
    ]);

    if (firstTimersRes.error) throw firstTimersRes.error;
    if (followupsRes.error) throw followupsRes.error;
    if (callersRes.error) throw callersRes.error;

    const { start, end } = getWindow(period, date);
    const firstTimers = (firstTimersRes.data || []).filter((item) =>
      isInWindow(item.created_at, start, end)
    );
    const followups = (followupsRes.data || []).filter((item) =>
      isInWindow(item.date, start, end)
    );

    const cellDistribution = firstTimers.reduce<Record<string, number>>((acc, item) => {
      const key = item.cell_name || "Unknown";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const callerPerformance = (callersRes.data || []).map((caller) => ({
      callerId: caller.id,
      name: caller.name,
      followups: followups.filter((item) => item.caller_id === caller.id).length,
    }));

    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
    const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);

    return NextResponse.json({
      globalStats: {
        totalFirstTimers: firstTimers.length,
        firstTimersInMonth: (firstTimersRes.data || []).filter((item) =>
          isInWindow(item.created_at, monthStart, monthEnd)
        ).length,
        cellDistribution,
        totalFollowups: followups.length,
        callerPerformance,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
