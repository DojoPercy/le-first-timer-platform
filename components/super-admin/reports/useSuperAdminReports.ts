"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { downloadReportPdf } from "@/lib/report-docs/download-report-pdf";
import type {
  PlatformReportPeriod,
  PlatformReportsResponse,
} from "@/lib/super-admin/platform-reports-types";

function buildRequestDate(period: PlatformReportPeriod, year: number, month: number) {
  if (period === "weekly") return new Date();
  if (period === "monthly") return new Date(year, month, 1);
  return new Date(year, 0, 1);
}

export function useSuperAdminReports() {
  const now = new Date();
  const [period, setPeriod] = useState<PlatformReportPeriod>("monthly");
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [data, setData] = useState<PlatformReportsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestDate = useMemo(
    () => buildRequestDate(period, selectedYear, selectedMonth),
    [period, selectedMonth, selectedYear],
  );

  const fetchReports = useCallback(async () => {
    try {
      setError(null);
      setIsLoading(true);
      const params = new URLSearchParams({ period, date: requestDate.toISOString() });
      const response = await fetch(`/api/superadmin/reports?${params.toString()}`, { cache: "no-store" });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.message || "Failed to load platform reports");
      }

      setData(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load platform reports");
    } finally {
      setIsLoading(false);
    }
  }, [period, requestDate]);

  useEffect(() => {
    void fetchReports();
  }, [fetchReports]);

  const handleGenerateReport = useCallback(async () => {
    setIsGenerating(true);
    try {
      await downloadReportPdf(
        "/api/superadmin/generate-report-pdf",
        { period, date: requestDate.toISOString() },
        `platform_${period}_report.pdf`,
      );
      toast.success("Platform PDF report downloaded");
    } catch (err) {
      console.error("Failed to generate platform PDF report:", err);
      toast.error("Failed to generate platform PDF report");
    } finally {
      setIsGenerating(false);
    }
  }, [period, requestDate]);

  return {
    data,
    error,
    isGenerating,
    isLoading,
    period,
    selectedMonth,
    selectedYear,
    setPeriod,
    setSelectedMonth,
    setSelectedYear,
    refresh: fetchReports,
    handleGenerateReport,
  };
}
