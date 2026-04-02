import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  generateMonthlyReport,
  generateWeeklyReport,
  generateYearlyReport,
} from "@/lib/utils/report-helpers";
import { getCurrentActor, isAdminLike, resolveBranchScope } from "@/lib/auth/server";
import type { Caller, FirstTimer, Followup } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const { actor } = await getCurrentActor();
    if (!actor || !isAdminLike(actor)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const reportType = body?.reportType as "weekly" | "monthly" | "yearly" | undefined;
    const reportDate = new Date(body?.date || "");
    const branchId = resolveBranchScope(actor, body?.branchId || null);

    if (!reportType || Number.isNaN(reportDate.getTime())) {
      return NextResponse.json(
        { message: "A valid reportType and date are required." },
        { status: 400 }
      );
    }

    if (!branchId) {
      return NextResponse.json(
        { message: "A branch must be selected to generate reports." },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const { data: callers, error: callersError } = await supabase
      .from("callers")
      .select("id")
      .eq("role", "caller")
      .eq("branch_id", branchId);

    if (callersError) throw callersError;

    const [firstTimersResponse, followupsResponse] = await Promise.all([
      supabase.from("first_timers").select("*").eq("branch_id", branchId),
      supabase.from("followups").select("*").eq("branch_id", branchId),
    ]);

    if (firstTimersResponse.error) throw firstTimersResponse.error;
    if (followupsResponse.error) throw followupsResponse.error;

    const firstTimers = (firstTimersResponse.data || []) as FirstTimer[];
    const followups = (followupsResponse.data || []) as Followup[];
    const generated: string[] = [];

    for (const caller of (callers || []) as Pick<Caller, "id">[]) {
      let tableName = "";
      let reportPayload: Record<string, unknown> = {
        branch_id: branchId,
        caller_id: caller.id,
      };

      if (reportType === "weekly") {
        const report = generateWeeklyReport(
          caller.id,
          firstTimers,
          followups,
          reportDate
        );
        tableName = "weekly_reports";
        reportPayload = {
          ...reportPayload,
          week_start_date: report.week_start_date.toISOString().split("T")[0],
          week_end_date: report.week_end_date.toISOString().split("T")[0],
          year: report.year,
          week_number: report.week_number,
          ...report.stats,
        };
      } else if (reportType === "monthly") {
        const report = generateMonthlyReport(
          caller.id,
          firstTimers,
          followups,
          reportDate.getFullYear(),
          reportDate.getMonth() + 1
        );
        tableName = "monthly_reports";
        reportPayload = {
          ...reportPayload,
          year: report.year,
          month: report.month,
          ...report.stats,
        };
      } else {
        const report = generateYearlyReport(
          caller.id,
          firstTimers,
          followups,
          reportDate.getFullYear()
        );
        tableName = "yearly_reports";
        reportPayload = {
          ...reportPayload,
          year: report.year,
          ...report.stats,
        };
      }

      const onConflict =
        reportType === "weekly"
          ? "caller_id,branch_id,year,week_number"
          : reportType === "monthly"
            ? "caller_id,branch_id,year,month"
            : "caller_id,branch_id,year";

      const { error } = await supabase
        .from(tableName)
        .upsert(reportPayload, { onConflict });

      if (error) throw error;
      generated.push(caller.id);
    }

    return NextResponse.json({
      message: `Generated ${generated.length} ${reportType} report rows.`,
      generated: generated.length,
    });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Failed to generate reports.",
      },
      { status: 500 }
    );
  }
}
