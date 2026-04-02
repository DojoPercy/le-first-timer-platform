import { createAdminClient } from "@/lib/supabase/admin";
import { SuperAdminReportsClient } from "./superadmin-reports-client";

export default async function SuperAdminReportsPage() {
  const supabase = createAdminClient();
  const { data: reports } = await supabase
    .from("monthly_reports")
    .select("id, branch_id, year, month, total_souls_assigned, total_followups_made, completion_percentage")
    .order("year", { ascending: false })
    .order("month", { ascending: false })
    .limit(50);

  const branchIds = [...new Set((reports || []).map((report) => report.branch_id).filter(Boolean))];
  const { data: branches } =
    branchIds.length > 0
      ? await supabase.from("branches").select("id, name").in("id", branchIds)
      : { data: [] as Array<{ id: string; name: string }> };

  const branchMap = new Map((branches || []).map((branch) => [branch.id, branch.name]));
  const enrichedReports = (reports || []).map((report) => ({
    ...report,
    branch_name: branchMap.get(report.branch_id) || report.branch_id,
  }));

  return <SuperAdminReportsClient reports={enrichedReports} />;
}
