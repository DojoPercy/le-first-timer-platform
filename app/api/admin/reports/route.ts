import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentActor, isAdminLike, resolveBranchScope } from "@/lib/auth/server";

export async function GET(request: Request) {
  try {
    const { actor } = await getCurrentActor();
    if (!actor || !isAdminLike(actor)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const callerId = searchParams.get("callerId");
    const year = searchParams.get("year");
    const month = searchParams.get("month");
    const weekNumber = searchParams.get("weekNumber");
    const branchId = resolveBranchScope(actor, searchParams.get("branchId"));

    if (!type) {
      return NextResponse.json({ message: "type is required" }, { status: 400 });
    }

    if (!branchId) {
      return NextResponse.json(
        { message: "A branch must be selected to fetch reports." },
        { status: 400 }
      );
    }

    const tableName =
      type === "weekly"
        ? "weekly_reports"
        : type === "monthly"
          ? "monthly_reports"
          : type === "yearly"
            ? "yearly_reports"
            : null;

    if (!tableName) {
      return NextResponse.json(
        { message: "Invalid report type." },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    let query = supabase.from(tableName).select("*").eq("branch_id", branchId);

    if (type === "weekly") {
      query = query.order("year", { ascending: false }).order("week_number", {
        ascending: false,
      });
      if (weekNumber) query = query.eq("week_number", Number(weekNumber));
    } else if (type === "monthly") {
      query = query.order("year", { ascending: false }).order("month", {
        ascending: false,
      });
      if (month) query = query.eq("month", Number(month));
    } else {
      query = query.order("year", { ascending: false });
    }

    if (year) query = query.eq("year", Number(year));
    if (callerId) query = query.eq("caller_id", callerId);

    const { data, error } = await query;
    if (error) throw error;

    const reports = data || [];
    const callerIds = [...new Set(reports.map((item: any) => item.caller_id).filter(Boolean))];

    let callerMap = new Map<string, { id: string; name: string; email: string }>();
    if (callerIds.length > 0) {
      const { data: callers } = await supabase
        .from("callers")
        .select("id, name, email")
        .eq("branch_id", branchId)
        .in("id", callerIds);

      callerMap = new Map((callers || []).map((caller) => [caller.id, caller]));
    }

    return NextResponse.json({
      reports: reports.map((report: any) => ({
        ...report,
        callers: callerMap.get(report.caller_id) || null,
      })),
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Failed to fetch reports.",
      },
      { status: 500 }
    );
  }
}
