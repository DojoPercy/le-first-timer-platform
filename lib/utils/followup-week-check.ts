/**
 * Utility functions for checking weekly follow-up eligibility
 */

/**
 * Get the start of the current week (Monday)
 */
export function getWeekStart(date: Date = new Date()): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const weekStart = new Date(d.setDate(diff));
  weekStart.setHours(0, 0, 0, 0);
  return weekStart;
}

/**
 * Get the end of the current week (Sunday)
 */
export function getWeekEnd(date: Date = new Date()): Date {
  const weekStart = getWeekStart(date);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);
  return weekEnd;
}

/**
 * Check if a date is within the current week
 */
export function isInCurrentWeek(date: Date | string): boolean {
  const checkDate = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const weekStart = getWeekStart(now);
  const weekEnd = getWeekEnd(now);
  return checkDate >= weekStart && checkDate <= weekEnd;
}

/**
 * Check if a follow-up was done this week for a first timer by a caller
 */
export function hasFollowupThisWeek(
  followups: Array<{ date: string; caller_id: string; first_timer_id?: string }>,
  firstTimerId: string,
  callerId: string
): boolean {
  return followups.some(
    (f) =>
      f.caller_id === callerId &&
      (!f.first_timer_id || f.first_timer_id === firstTimerId) &&
      isInCurrentWeek(f.date)
  );
}

/**
 * Get the date when the next follow-up can be done (next Monday)
 */
export function getNextFollowupDate(): Date {
  const today = new Date();
  const weekEnd = getWeekEnd(today);
  const nextMonday = new Date(weekEnd);
  nextMonday.setDate(nextMonday.getDate() + 1);
  nextMonday.setHours(0, 0, 0, 0);
  return nextMonday;
}

/**
 * Format date for display
 */
export function formatNextFollowupDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
