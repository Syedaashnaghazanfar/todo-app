/**
 * Notification Entity Type Definitions
 *
 * Defines notifications triggered for VERY IMPORTANT tasks due within 6 hours.
 * Notifications are stored in localStorage with a maximum of 50 entries (FIFO queue).
 *
 * @module types/notification.types
 */

import type { Priority } from './task.types';

/**
 * Notification entity representing a notification event
 *
 * Notifications are triggered for:
 * - Tasks with priority = VERY_IMPORTANT
 * - Tasks with status != COMPLETED
 * - Tasks due within 6 hours
 * - With duplicate prevention (10-minute window)
 *
 * @property id - UUID v4 identifier, generated client-side
 * @property taskId - Foreign key reference to Task.id
 * @property message - Notification text (max 500 characters), format: "Task '{title}' due {relativeTime}"
 * @property timestamp - ISO 8601 datetime, when notification was created (immutable)
 * @property read - Whether user has marked as read (false → true only)
 * @property priority - Inherited from task for styling (always VERY_IMPORTANT)
 */
export interface Notification {
  // Identity
  id: string;
  taskId: string;

  // Content
  message: string;

  // Metadata
  timestamp: string;
  read: boolean;
  priority: Priority;
}

/**
 * Notification trigger configuration
 */
export const NOTIFICATION_CONFIG = {
  /** Maximum notifications stored (FIFO queue) */
  MAX_NOTIFICATIONS: 50,

  /** Duplicate prevention window (milliseconds) */
  DUPLICATE_PREVENTION_WINDOW: 10 * 60 * 1000, // 10 minutes

  /** Urgency threshold for triggering notifications (milliseconds) */
  URGENCY_THRESHOLD: 6 * 60 * 60 * 1000, // 6 hours

  /** Notification check interval (milliseconds) */
  CHECK_INTERVAL: 10 * 60 * 1000, // 10 minutes
} as const;

/**
 * Message template for notifications
 *
 * @param taskTitle - The task title
 * @param relativeTime - Human-readable relative time (e.g., "in 2 hours", "overdue by 1 hour")
 * @returns Formatted notification message
 */
export function formatNotificationMessage(taskTitle: string, relativeTime: string): string {
  return `Task '${taskTitle}' due ${relativeTime}`;
}
