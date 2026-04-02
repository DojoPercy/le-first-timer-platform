import type {
  GlobalReportStats,
  MonthlyReport,
  ReportTrendData,
  WeeklyReport,
  YearlyReport,
} from "@/lib/store/report-types";

type ReportPeriod = "weekly" | "monthly" | "yearly";

async function requestJson<T>(url: string) {
  const res = await fetch(url, { method: "GET" });
  const payload = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message =
      typeof payload === "object" && payload && "message" in payload
        ? String(
            (payload as { message?: string }).message ||
              `Server responded ${res.status}`
          )
        : `Server responded ${res.status}`;
    throw new Error(message);
  }

  return payload as T;
}

function buildReportParams(
  type: ReportPeriod,
  filters?: {
    callerId?: string;
    year?: number;
    month?: number;
    weekNumber?: number;
    branchId?: string | null;
  }
) {
  const params = new URLSearchParams({ type });

  if (filters?.callerId) params.set("callerId", String(filters.callerId));
  if (filters?.year) params.set("year", String(filters.year));
  if (filters?.weekNumber)
    params.set("weekNumber", String(filters.weekNumber));
  if (filters?.branchId) params.set("branchId", String(filters.branchId));
  if (filters?.month != null) {
    const month = Number(filters.month);
    if (!Number.isNaN(month)) {
      params.set(
        "month",
        String(month >= 0 && month <= 11 ? month + 1 : month)
      );
    }
  }

  return params;
}

export async function fetchReportsByType<
  T extends WeeklyReport | MonthlyReport | YearlyReport
>(
  type: ReportPeriod,
  filters?: {
    callerId?: string;
    year?: number;
    month?: number;
    weekNumber?: number;
    branchId?: string | null;
  }
) {
  const params = buildReportParams(type, filters);
  const payload = await requestJson<{ reports?: T[] }>(
    `/api/admin/reports?${params.toString()}`
  );
  return payload.reports || [];
}

export async function fetchGlobalStatsRequest(
  period: ReportPeriod,
  date: Date,
  branchId?: string | null
) {
  const params = new URLSearchParams({
    period,
    date: date.toISOString(),
  });
  if (branchId) params.set("branchId", branchId);
  const payload = await requestJson<{ globalStats: GlobalReportStats }>(
    `/api/admin/reports/overview?${params.toString()}`
  );
  return payload.globalStats;
}

export async function fetchReportTrendsRequest(
  period: ReportPeriod,
  branchId?: string | null
) {
  const params = new URLSearchParams({ period });
  if (branchId) params.set("branchId", branchId);
  const payload = await requestJson<{ trendData: ReportTrendData[] }>(
    `/api/admin/reports/trends?${params.toString()}`
  );
  return payload.trendData || [];
}

export async function generateReportsRequest(
  reportType: ReportPeriod,
  date: Date | string,
  branchId?: string | null
) {
  const dateString =
    typeof date === "string" ? date : new Date(date).toISOString();

  const res = await fetch("/api/admin/generate-reports", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      reportType,
      date: dateString,
      branchId: branchId || undefined,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    try {
      const payload = JSON.parse(text);
      throw new Error(payload.message || `HTTP ${res.status}`);
    } catch {
      throw new Error(text || `HTTP ${res.status}`);
    }
  }

  return res.json();
}
