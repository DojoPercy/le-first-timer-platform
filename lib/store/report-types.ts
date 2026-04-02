export interface WeeklyReport {
  id: string;
  caller_id: string;
  week_start_date: string;
  week_end_date: string;
  year: number;
  week_number: number;
  total_souls_assigned: number;
  total_followups_made: number;
  followups_contacted: number;
  followups_pending: number;
  followups_not_reachable: number;
  souls_followed_up: number;
  completion_percentage: number;
  created_at: string;
  updated_at: string;
  callers?: { id: string; name: string; email: string };
  total_first_timers_assigned?: number;
  first_timers_followed_up?: number;
}

export interface MonthlyReport {
  id: string;
  caller_id: string;
  year: number;
  month: number;
  total_souls_assigned: number;
  total_followups_made: number;
  followups_contacted: number;
  followups_pending: number;
  followups_not_reachable: number;
  souls_followed_up: number;
  completion_percentage: number;
  created_at: string;
  updated_at: string;
  callers?: { id: string; name: string; email: string };
  total_first_timers_assigned?: number;
  first_timers_followed_up?: number;
}

export interface YearlyReport {
  id: string;
  caller_id: string;
  year: number;
  total_souls_assigned: number;
  total_followups_made: number;
  followups_contacted: number;
  followups_pending: number;
  followups_not_reachable: number;
  souls_followed_up: number;
  completion_percentage: number;
  created_at: string;
  updated_at: string;
  callers?: { id: string; name: string; email: string };
  total_first_timers_assigned?: number;
  first_timers_followed_up?: number;
}

export interface GlobalReportStats {
  totalFirstTimers: number;
  firstTimersInMonth: number;
  cellDistribution: Record<string, number>;
  totalFollowups: number;
  callerPerformance: { callerId: string; name: string; followups: number }[];
  inviterPerformance: {
    inviter: string;
    invitedCount: number;
    fullyJoinedCount: number;
    stillDecidingCount: number;
    notContinuingCount: number;
    pendingCount: number;
    conversionRate: number;
  }[];
  trendData?: { period: string; firstTimers: number; followups: number }[];
}

export interface ReportTrendData {
  period: string;
  followups: number;
  firstTimers: number;
  sortKey: string;
}

export interface ReportsStore {
  isFetchingData: boolean;
  setIsFetchingData: (isFetching: boolean) => void;
  weeklyReports: WeeklyReport[];
  isLoadingWeekly: boolean;
  fetchWeeklyReports: (filters?: {
    callerId?: string;
    year?: number;
    weekNumber?: number;
    branchId?: string | null;
  }) => Promise<void>;
  monthlyReports: MonthlyReport[];
  isLoadingMonthly: boolean;
  fetchMonthlyReports: (filters?: {
    callerId?: string;
    year?: number;
    month?: number;
    branchId?: string | null;
  }) => Promise<MonthlyReport[]>;
  yearlyReports: YearlyReport[];
  isLoadingYearly: boolean;
  fetchYearlyReports: (filters?: {
    callerId?: string;
    year?: number;
    branchId?: string | null;
  }) => Promise<void>;
  globalStats: GlobalReportStats | null;
  isLoadingGlobal: boolean;
  fetchGlobalStats: (
    period: "weekly" | "monthly" | "yearly",
    date: Date,
    branchId?: string | null
  ) => Promise<void>;
  trendData: ReportTrendData[];
  isLoadingTrends: boolean;
  fetchReportTrends: (
    period: "weekly" | "monthly" | "yearly",
    branchId?: string | null
  ) => Promise<void>;
  generateReports: (
    reportType: "weekly" | "monthly" | "yearly",
    date: Date,
    branchId?: string | null
  ) => Promise<void>;
}
