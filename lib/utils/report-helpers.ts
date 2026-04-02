/**
 * Utility functions for generating and processing reports
 */

import type { Caller, FirstTimer, Followup } from "@/lib/types";

export interface ReportStats {
  total_souls_assigned: number;
  total_followups_made: number;
  followups_contacted: number;
  followups_pending: number;
  followups_not_reachable: number;
  souls_followed_up: number;
  completion_percentage: number;
}

/**
 * Get ISO week number from a date
 */
export function getISOWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

/**
 * Get week start and end dates (Monday to Sunday)
 */
export function getWeekBounds(date: Date): { weekStart: Date; weekEnd: Date } {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const weekStart = new Date(d.setDate(diff));
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);
  return { weekStart, weekEnd };
}

/**
 * Check if a date is within a date range
 */
export function isDateInRange(date: Date, startDate: Date, endDate: Date): boolean {
  const d = new Date(date);
  return d >= startDate && d <= endDate;
}

/**
 * Calculate report statistics for a caller
 */
export function calculateReportStats(
  callerId: string,
  firstTimers: FirstTimer[],
  followups: Followup[],
  startDate: Date,
  endDate: Date
): ReportStats {
  const assignedFirstTimers = firstTimers.filter(
    (ft) => ft.assigned_caller_id === callerId
  );

  const callerFollowups = followups.filter(
    (followup) =>
      followup.caller_id === callerId &&
      isDateInRange(new Date(followup.date), startDate, endDate)
  );

  const statusCounts = {
    Contacted: 0,
    Pending: 0,
    "Not Reachable": 0,
  };

  callerFollowups.forEach((followup) => {
    if (followup.status in statusCounts) {
      statusCounts[followup.status as keyof typeof statusCounts]++;
    }
  });

  const firstTimersWithFollowups = new Set(
    callerFollowups.map((f) => f.first_timer_id)
  );

  const totalFollowupsNeeded = assignedFirstTimers.length;
  const completionPercentage =
    totalFollowupsNeeded > 0
      ? Math.round((firstTimersWithFollowups.size / totalFollowupsNeeded) * 100 * 100) / 100
      : 0;

  return {
    total_souls_assigned: assignedFirstTimers.length,
    total_followups_made: callerFollowups.length,
    followups_contacted: statusCounts.Contacted,
    followups_pending: statusCounts.Pending,
    followups_not_reachable: statusCounts["Not Reachable"],
    souls_followed_up: firstTimersWithFollowups.size,
    completion_percentage: completionPercentage,
  };
}

/**
 * Generate weekly report data
 */
export function generateWeeklyReport(
  callerId: string,
  firstTimers: FirstTimer[],
  followups: Followup[],
  weekDate: Date
): {
  week_start_date: Date;
  week_end_date: Date;
  year: number;
  week_number: number;
  stats: ReportStats;
} {
  const { weekStart, weekEnd } = getWeekBounds(weekDate);
  const year = weekDate.getFullYear();
  const weekNumber = getISOWeekNumber(weekDate);

  const stats = calculateReportStats(
    callerId,
    firstTimers,
    followups,
    weekStart,
    weekEnd
  );

  return {
    week_start_date: weekStart,
    week_end_date: weekEnd,
    year,
    week_number: weekNumber,
    stats,
  };
}

/**
 * Generate monthly report data
 */
export function generateMonthlyReport(
  callerId: string,
  firstTimers: FirstTimer[],
  followups: Followup[],
  year: number,
  month: number
): {
  year: number;
  month: number;
  stats: ReportStats;
} {
  const startDate = new Date(year, month - 1, 1);
  startDate.setHours(0, 0, 0, 0);
  const endDate = new Date(year, month, 0);
  endDate.setHours(23, 59, 59, 999);

  const stats = calculateReportStats(
    callerId,
    firstTimers,
    followups,
    startDate,
    endDate
  );

  return {
    year,
    month,
    stats,
  };
}

/**
 * Generate yearly report data
 */
export function generateYearlyReport(
  callerId: string,
  firstTimers: FirstTimer[],
  followups: Followup[],
  year: number
): {
  year: number;
  stats: ReportStats;
} {
  const startDate = new Date(year, 0, 1);
  startDate.setHours(0, 0, 0, 0);
  const endDate = new Date(year, 11, 31);
  endDate.setHours(23, 59, 59, 999);

  const stats = calculateReportStats(
    callerId,
    firstTimers,
    followups,
    startDate,
    endDate
  );

  return {
    year,
    stats,
  };
}
