/**
 * Time Utility Functions
 *
 * Provides functions for formatting relative time and durations for human-readable display.
 * All functions handle timezone-aware comparisons and edge cases.
 *
 * @module utils/timeUtils
 */

/**
 * Time constants (milliseconds)
 */
const TIME_UNITS = {
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
  WEEK: 7 * 24 * 60 * 60 * 1000,
  MONTH: 30 * 24 * 60 * 60 * 1000,
  YEAR: 365 * 24 * 60 * 60 * 1000,
} as const;

/**
 * Format relative time from ISO 8601 datetime string
 *
 * Converts an ISO datetime to human-readable relative time:
 * - Future: "in 2 hours", "in 3 days"
 * - Past: "2 hours ago", "3 days ago"
 * - Edge cases: "just now", "in a moment"
 *
 * @param isoString - ISO 8601 datetime string (YYYY-MM-DDTHH:mm:ss.sssZ)
 * @returns Human-readable relative time string
 *
 * @example
 * formatRelativeTime('2025-12-16T18:00:00.000Z') // "in 2 hours" (if now is 16:00)
 * formatRelativeTime('2025-12-15T10:00:00.000Z') // "1 day ago" (if now is 16:00 on 16th)
 * formatRelativeTime(undefined) // "No due date"
 */
export function formatRelativeTime(isoString?: string): string {
  if (!isoString) {
    return 'No due date';
  }

  try {
    const targetDate = new Date(isoString);
    const now = new Date();
    const diffMs = targetDate.getTime() - now.getTime();
    const absDiffMs = Math.abs(diffMs);
    const isFuture = diffMs > 0;

    // Just now (within 30 seconds)
    if (absDiffMs < 30 * TIME_UNITS.SECOND) {
      return isFuture ? 'in a moment' : 'just now';
    }

    // Seconds
    if (absDiffMs < TIME_UNITS.MINUTE) {
      const seconds = Math.floor(absDiffMs / TIME_UNITS.SECOND);
      return isFuture ? `in ${seconds} second${seconds !== 1 ? 's' : ''}` : `${seconds} second${seconds !== 1 ? 's' : ''} ago`;
    }

    // Minutes
    if (absDiffMs < TIME_UNITS.HOUR) {
      const minutes = Math.floor(absDiffMs / TIME_UNITS.MINUTE);
      return isFuture ? `in ${minutes} minute${minutes !== 1 ? 's' : ''}` : `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    }

    // Hours
    if (absDiffMs < TIME_UNITS.DAY) {
      const hours = Math.floor(absDiffMs / TIME_UNITS.HOUR);
      return isFuture ? `in ${hours} hour${hours !== 1 ? 's' : ''}` : `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    }

    // Days
    if (absDiffMs < TIME_UNITS.WEEK) {
      const days = Math.floor(absDiffMs / TIME_UNITS.DAY);
      return isFuture ? `in ${days} day${days !== 1 ? 's' : ''}` : `${days} day${days !== 1 ? 's' : ''} ago`;
    }

    // Weeks
    if (absDiffMs < TIME_UNITS.MONTH) {
      const weeks = Math.floor(absDiffMs / TIME_UNITS.WEEK);
      return isFuture ? `in ${weeks} week${weeks !== 1 ? 's' : ''}` : `${weeks} week${weeks !== 1 ? 's' : ''} ago`;
    }

    // Months
    if (absDiffMs < TIME_UNITS.YEAR) {
      const months = Math.floor(absDiffMs / TIME_UNITS.MONTH);
      return isFuture ? `in ${months} month${months !== 1 ? 's' : ''}` : `${months} month${months !== 1 ? 's' : ''} ago`;
    }

    // Years
    const years = Math.floor(absDiffMs / TIME_UNITS.YEAR);
    return isFuture ? `in ${years} year${years !== 1 ? 's' : ''}` : `${years} year${years !== 1 ? 's' : ''} ago`;
  } catch (error) {
    console.error('Error formatting relative time:', error);
    return 'Invalid date';
  }
}

/**
 * Format duration from milliseconds to human-readable string
 *
 * Converts milliseconds to the largest appropriate unit:
 * - < 1 minute: "45 seconds"
 * - < 1 hour: "23 minutes"
 * - < 1 day: "5 hours"
 * - < 1 week: "3 days"
 * - >= 1 week: "2 weeks"
 *
 * @param milliseconds - Duration in milliseconds
 * @returns Human-readable duration string
 *
 * @example
 * formatDuration(5000) // "5 seconds"
 * formatDuration(120000) // "2 minutes"
 * formatDuration(7200000) // "2 hours"
 */
export function formatDuration(milliseconds: number): string {
  if (milliseconds < 0) {
    return '0 seconds';
  }

  // Seconds
  if (milliseconds < TIME_UNITS.MINUTE) {
    const seconds = Math.floor(milliseconds / TIME_UNITS.SECOND);
    return `${seconds} second${seconds !== 1 ? 's' : ''}`;
  }

  // Minutes
  if (milliseconds < TIME_UNITS.HOUR) {
    const minutes = Math.floor(milliseconds / TIME_UNITS.MINUTE);
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  }

  // Hours
  if (milliseconds < TIME_UNITS.DAY) {
    const hours = Math.floor(milliseconds / TIME_UNITS.HOUR);
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  }

  // Days
  if (milliseconds < TIME_UNITS.WEEK) {
    const days = Math.floor(milliseconds / TIME_UNITS.DAY);
    return `${days} day${days !== 1 ? 's' : ''}`;
  }

  // Weeks
  if (milliseconds < TIME_UNITS.MONTH) {
    const weeks = Math.floor(milliseconds / TIME_UNITS.WEEK);
    return `${weeks} week${weeks !== 1 ? 's' : ''}`;
  }

  // Months
  if (milliseconds < TIME_UNITS.YEAR) {
    const months = Math.floor(milliseconds / TIME_UNITS.MONTH);
    return `${months} month${months !== 1 ? 's' : ''}`;
  }

  // Years
  const years = Math.floor(milliseconds / TIME_UNITS.YEAR);
  return `${years} year${years !== 1 ? 's' : ''}`;
}

/**
 * Check if a date is overdue (past current time)
 *
 * @param isoString - ISO 8601 datetime string
 * @returns True if date is in the past, false otherwise
 */
export function isOverdue(isoString?: string): boolean {
  if (!isoString) {
    return false;
  }

  try {
    const targetDate = new Date(isoString);
    const now = new Date();
    return targetDate.getTime() < now.getTime();
  } catch (error) {
    console.error('Error checking overdue status:', error);
    return false;
  }
}

/**
 * Check if a date is within a specified threshold (e.g., urgent if within 6 hours)
 *
 * @param isoString - ISO 8601 datetime string
 * @param thresholdMs - Threshold in milliseconds
 * @returns True if date is within threshold from now, false otherwise
 */
export function isWithinThreshold(isoString?: string, thresholdMs: number = 6 * TIME_UNITS.HOUR): boolean {
  if (!isoString) {
    return false;
  }

  try {
    const targetDate = new Date(isoString);
    const now = new Date();
    const diffMs = targetDate.getTime() - now.getTime();
    return diffMs > 0 && diffMs <= thresholdMs;
  } catch (error) {
    console.error('Error checking threshold:', error);
    return false;
  }
}

/**
 * Format date to ISO 8601 string with timezone
 *
 * @param date - Date object or ISO string
 * @returns ISO 8601 datetime string (YYYY-MM-DDTHH:mm:ss.sssZ)
 */
export function toISOString(date: Date | string): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toISOString();
  } catch (error) {
    console.error('Error converting to ISO string:', error);
    return new Date().toISOString();
  }
}

/**
 * Parse ISO 8601 string to Date object
 *
 * @param isoString - ISO 8601 datetime string
 * @returns Date object, or null if invalid
 */
export function parseISOString(isoString: string): Date | null {
  try {
    const date = new Date(isoString);
    return isNaN(date.getTime()) ? null : date;
  } catch (error) {
    console.error('Error parsing ISO string:', error);
    return null;
  }
}
