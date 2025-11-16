import {
  format,
  formatDistanceToNow,
  parseISO,
  addDays,
  addHours,
  addMinutes,
  isAfter,
  isBefore,
  startOfDay,
  endOfDay,
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  differenceInSeconds,
} from "date-fns";

/**
 * Date utility functions using date-fns
 * All dates stored in database as UTC ISO 8601 strings
 * All calculations done in UTC
 * Display formatted in user's local timezone
 */

/**
 * Gets current UTC timestamp as ISO string
 */
export function getCurrentUTC(): string {
  return new Date().toISOString();
}

/**
 * Parses ISO date string to Date object
 */
export function parseDate(isoString: string): Date {
  return parseISO(isoString);
}

/**
 * Formats date for display (user's local timezone)
 */
export function formatDate(
  date: Date | string,
  formatString: string = "PPP"
): string {
  const dateObj = typeof date === "string" ? parseDate(date) : date;
  return format(dateObj, formatString);
}

/**
 * Formats date as relative time ("2 hours ago", "in 3 days")
 */
export function formatRelative(date: Date | string): string {
  const dateObj = typeof date === "string" ? parseDate(date) : date;
  return formatDistanceToNow(dateObj, { addSuffix: true });
}

/**
 * Formats time duration in seconds to human readable format
 * Examples: "5m 30s", "1h 15m", "2h"
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const parts: string[] = [];

  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0 && hours === 0) parts.push(`${secs}s`); // Only show seconds if less than 1 hour

  return parts.join(" ") || "0s";
}

/**
 * Calculates next review date based on spaced repetition interval (in days)
 */
export function calculateNextReview(intervalDays: number): string {
  const nextReview = addDays(new Date(), intervalDays);
  return nextReview.toISOString();
}

/**
 * Calculates next review date based on hours
 */
export function calculateNextReviewHours(intervalHours: number): string {
  const nextReview = addHours(new Date(), intervalHours);
  return nextReview.toISOString();
}

/**
 * Calculates next review date based on minutes
 */
export function calculateNextReviewMinutes(intervalMinutes: number): string {
  const nextReview = addMinutes(new Date(), intervalMinutes);
  return nextReview.toISOString();
}

/**
 * Checks if a card is due for review
 */
export function isCardDue(nextReviewDate: string | null): boolean {
  if (!nextReviewDate) return true; // Never reviewed, so due

  const nextReview = parseDate(nextReviewDate);
  const now = new Date();

  return isBefore(nextReview, now) || nextReview.getTime() === now.getTime();
}

/**
 * Checks if a date is in the past
 */
export function isPast(date: string | Date): boolean {
  const dateObj = typeof date === "string" ? parseDate(date) : date;
  return isBefore(dateObj, new Date());
}

/**
 * Checks if a date is in the future
 */
export function isFuture(date: string | Date): boolean {
  const dateObj = typeof date === "string" ? parseDate(date) : date;
  return isAfter(dateObj, new Date());
}

/**
 * Gets start of day in UTC
 */
export function getStartOfDay(date?: Date | string): string {
  const dateObj = date
    ? typeof date === "string"
      ? parseDate(date)
      : date
    : new Date();
  return startOfDay(dateObj).toISOString();
}

/**
 * Gets end of day in UTC
 */
export function getEndOfDay(date?: Date | string): string {
  const dateObj = date
    ? typeof date === "string"
      ? parseDate(date)
      : date
    : new Date();
  return endOfDay(dateObj).toISOString();
}

/**
 * Calculates days between two dates
 */
export function getDaysBetween(
  startDate: string | Date,
  endDate: string | Date
): number {
  const start =
    typeof startDate === "string" ? parseDate(startDate) : startDate;
  const end = typeof endDate === "string" ? parseDate(endDate) : endDate;
  return differenceInDays(end, start);
}

/**
 * Calculates hours between two dates
 */
export function getHoursBetween(
  startDate: string | Date,
  endDate: string | Date
): number {
  const start =
    typeof startDate === "string" ? parseDate(startDate) : startDate;
  const end = typeof endDate === "string" ? parseDate(endDate) : endDate;
  return differenceInHours(end, start);
}

/**
 * Calculates minutes between two dates
 */
export function getMinutesBetween(
  startDate: string | Date,
  endDate: string | Date
): number {
  const start =
    typeof startDate === "string" ? parseDate(startDate) : startDate;
  const end = typeof endDate === "string" ? parseDate(endDate) : endDate;
  return differenceInMinutes(end, start);
}

/**
 * Calculates seconds between two dates
 */
export function getSecondsBetween(
  startDate: string | Date,
  endDate: string | Date
): number {
  const start =
    typeof startDate === "string" ? parseDate(startDate) : startDate;
  const end = typeof endDate === "string" ? parseDate(endDate) : endDate;
  return differenceInSeconds(end, start);
}

/**
 * Formats date for display in study session ("Due today", "Due in 3 days", "Overdue by 2 days")
 */
export function formatDueDate(nextReviewDate: string | null): string {
  if (!nextReviewDate) return "Never studied";

  const nextReview = parseDate(nextReviewDate);
  const now = new Date();
  const daysDiff = differenceInDays(nextReview, now);

  if (daysDiff < 0) {
    return `Overdue by ${Math.abs(daysDiff)} day${Math.abs(daysDiff) === 1 ? "" : "s"}`;
  }

  if (daysDiff === 0) {
    const hoursDiff = differenceInHours(nextReview, now);
    if (hoursDiff <= 0) return "Due now";
    return `Due in ${hoursDiff} hour${hoursDiff === 1 ? "" : "s"}`;
  }

  if (daysDiff === 1) return "Due tomorrow";

  return `Due in ${daysDiff} days`;
}

/**
 * Formats timestamp for display ("Today 3:45 PM", "Yesterday 2:30 PM", "Dec 15, 2024")
 */
export function formatTimestamp(date: string | Date): string {
  const dateObj = typeof date === "string" ? parseDate(date) : date;
  const now = new Date();
  const daysDiff = differenceInDays(now, dateObj);

  if (daysDiff === 0) {
    return `Today ${format(dateObj, "p")}`;
  }

  if (daysDiff === 1) {
    return `Yesterday ${format(dateObj, "p")}`;
  }

  if (daysDiff < 7) {
    return format(dateObj, "EEEE p"); // "Monday 3:45 PM"
  }

  return format(dateObj, "PP"); // "Dec 15, 2024"
}

/**
 * Groups dates by day (for grouping study sessions)
 */
export function groupByDay(
  dates: (string | Date)[]
): Record<string, (string | Date)[]> {
  const grouped: Record<string, (string | Date)[]> = {};

  dates.forEach((date) => {
    const dateObj = typeof date === "string" ? parseDate(date) : date;
    const dayKey = format(dateObj, "yyyy-MM-dd");

    if (!grouped[dayKey]) {
      grouped[dayKey] = [];
    }

    grouped[dayKey].push(date);
  });

  return grouped;
}
