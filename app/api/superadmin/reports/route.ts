import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentActor } from "@/lib/auth/server";

export async function GET() {
  try {
    const { actor } = await getCurrentActor();
    if (!actor || actor.role !== "super_admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const supabase = createAdminClient();
    const { data: reports, error } = await supabase
      .from("monthly_reports")
      .select("id, branch_id, year, month, total_souls_assigned, total_followups_made, completion_percentage")
      .order("year", { ascending: false })
      .order("month", { ascending: false })
      .limit(50);

    if (error) throw error;

    return NextResponse.json({ reports: reports || [] });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
