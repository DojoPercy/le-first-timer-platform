import { create } from "zustand";
import {
  fetchGlobalStatsRequest,
  fetchReportTrendsRequest,
  fetchReportsByType,
  generateReportsRequest,
} from "@/lib/store/reports-api";
import type {
  MonthlyReport,
  ReportsStore,
  WeeklyReport,
  YearlyReport,
} from "@/lib/store/report-types";

export type {
  GlobalReportStats,
  MonthlyReport,
  ReportTrendData,
  ReportsStore,
  WeeklyReport,
  YearlyReport,
} from "@/lib/store/report-types";

export const useReportsStore = create<ReportsStore>((set) => ({
  isFetchingData: false,
  setIsFetchingData: (isFetching) => set({ isFetchingData: isFetching }),
  weeklyReports: [],
  isLoadingWeekly: false,
  fetchWeeklyReports: async (filters) => {
    set({ isLoadingWeekly: true });
    try {
      set({
        weeklyReports: await fetchReportsByType<WeeklyReport>(
          "weekly",
          filters
        ),
      });
    } catch (error) {
      console.error("Failed to fetch weekly reports:", error);
      set({ weeklyReports: [] });
    } finally {
      set({ isLoadingWeekly: false });
    }
  },
  monthlyReports: [],
  isLoadingMonthly: false,
  fetchMonthlyReports: async (filters) => {
    set({ isLoadingMonthly: true });
    try {
      const monthlyReports = await fetchReportsByType<MonthlyReport>(
        "monthly",
        filters
      );
      set({ monthlyReports });
      return monthlyReports;
    } catch (error) {
      console.error("Failed to fetch monthly reports:", error);
      set({ monthlyReports: [] });
      return [];
    } finally {
      set({ isLoadingMonthly: false });
    }
  },
  yearlyReports: [],
  isLoadingYearly: false,
  fetchYearlyReports: async (filters) => {
    set({ isLoadingYearly: true });
    try {
      set({
        yearlyReports: await fetchReportsByType<YearlyReport>(
          "yearly",
          filters
        ),
      });
    } catch (error) {
      console.error("Failed to fetch yearly reports:", error);
      set({ yearlyReports: [] });
    } finally {
      set({ isLoadingYearly: false });
    }
  },
  globalStats: null,
  isLoadingGlobal: false,
  fetchGlobalStats: async (period, date, branchId) => {
    set({ isLoadingGlobal: true });
    try {
      set({
        globalStats: await fetchGlobalStatsRequest(period, date, branchId),
      });
    } catch (error) {
      console.error("Failed to fetch global stats:", error);
      set({ globalStats: null });
    } finally {
      set({ isLoadingGlobal: false });
    }
  },
  trendData: [],
  isLoadingTrends: false,
  fetchReportTrends: async (period, branchId) => {
    set({ isLoadingTrends: true });
    try {
      set({
        trendData: await fetchReportTrendsRequest(period, branchId),
      });
    } catch (error) {
      console.error("Failed to fetch report trends:", error);
      set({ trendData: [] });
    } finally {
      set({ isLoadingTrends: false });
    }
  },
  generateReports: async (reportType, date, branchId) => {
    try {
      return await generateReportsRequest(reportType, date, branchId);
    } catch (error) {
      console.error("Failed to generate reports:", error);
      throw error;
    }
  },
}));
