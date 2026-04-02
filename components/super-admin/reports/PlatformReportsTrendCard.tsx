"use client";

import { ReportTrendChart } from "@/components/admin/reports/ReportTrendChart";
import type { PlatformTrendEntry } from "@/lib/super-admin/platform-reports-types";

interface PlatformReportsTrendCardProps {
  trendData: PlatformTrendEntry[];
}

export function PlatformReportsTrendCard({ trendData }: PlatformReportsTrendCardProps) {
  return <ReportTrendChart data={trendData} />;
}
