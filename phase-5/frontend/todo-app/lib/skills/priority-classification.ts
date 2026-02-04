/**
 * Priority Classification Skill
 *
 * Automatically classifies task priority based on due date proximity and urgency keywords.
 * Pure function with no side effects for predictable, testable behavior.
 *
 * Classification Rules:
 * 1. IF title contains urgency keyword AND (dueDate within 6 hours OR no dueDate) → VERY_IMPORTANT
 * 2. ELSE IF dueDate within 6 hours → VERY_IMPORTANT
 * 3. ELSE IF dueDate within 24 hours → HIGH
 * 4. ELSE IF dueDate within 1 week → MEDIUM
 * 5. ELSE → LOW
 *
 * @module lib/skills/priority-classification
 */

import type { Priority } from '@/types/task.types';
import { URGENCY_KEYWORDS } from '@/types/task.types';

/**
 * Time thresholds in milliseconds
 */
const TIME_THRESHOLDS = {
  SIX_HOURS: 6 * 60 * 60 * 1000,
  TWENTY_FOUR_HOURS: 24 * 60 * 60 * 1000,
  ONE_WEEK: 7 * 24 * 60 * 60 * 1000,
} as const;

/**
 * Classify task priority based on due date and title content
 *
 * @param task - Task object with title and optional dueDate
 * @returns Priority level (VERY_IMPORTANT | HIGH | MEDIUM | LOW)
 *
 * @example
 * classifyPriority({ title: 'Urgent: Fix bug', dueDate: undefined })
 * // Returns: 'VERY_IMPORTANT' (urgency keyword with no due date)
 *
 * classifyPriority({ title: 'Review PR', dueDate: '2025-12-16T20:00:00.000Z' })
 * // Returns: 'HIGH' (due within 24 hours, assuming now is ~18:00)
 *
 * classifyPriority({ title: 'Update docs', dueDate: '2025-12-20T10:00:00.000Z' })
 * // Returns: 'MEDIUM' (due within 1 week)
 */
export function classifyPriority(task: Pick<{ title: string; dueDate?: string }, 'title' | 'dueDate'>): Priority {
  const { title, dueDate } = task;

  // Check for urgency keywords in title (case-insensitive)
  const hasUrgencyKeyword = containsUrgencyKeyword(title);

  // No due date
  if (!dueDate) {
    // Urgency keyword without due date → VERY_IMPORTANT
    if (hasUrgencyKeyword) {
      return 'VERY_IMPORTANT';
    }
    // No urgency keyword and no due date → LOW
    return 'LOW';
  }

  // Calculate time until due date
  const timeUntilDue = getTimeUntilDue(dueDate);

  // If past due or invalid date, treat as overdue (VERY_IMPORTANT)
  if (timeUntilDue < 0) {
    return 'VERY_IMPORTANT';
  }

  // Rule 1: Urgency keyword + due within 6 hours → VERY_IMPORTANT
  if (hasUrgencyKeyword && timeUntilDue <= TIME_THRESHOLDS.SIX_HOURS) {
    return 'VERY_IMPORTANT';
  }

  // Rule 2: Due within 6 hours → VERY_IMPORTANT
  if (timeUntilDue <= TIME_THRESHOLDS.SIX_HOURS) {
    return 'VERY_IMPORTANT';
  }

  // Rule 3: Due within 24 hours → HIGH
  if (timeUntilDue <= TIME_THRESHOLDS.TWENTY_FOUR_HOURS) {
    return 'HIGH';
  }

  // Rule 4: Due within 1 week → MEDIUM
  if (timeUntilDue <= TIME_THRESHOLDS.ONE_WEEK) {
    return 'MEDIUM';
  }

  // Rule 5: Due after 1 week → LOW
  return 'LOW';
}

/**
 * Check if title contains any urgency keywords (case-insensitive)
 *
 * Urgency keywords: "urgent", "asap", "critical", "important", "emergency"
 *
 * @param title - Task title to check
 * @returns True if title contains urgency keyword, false otherwise
 *
 * @example
 * containsUrgencyKeyword('URGENT: Fix production bug') // true
 * containsUrgencyKeyword('ASAP - Review code') // true
 * containsUrgencyKeyword('Normal task') // false
 */
function containsUrgencyKeyword(title: string): boolean {
  const lowerTitle = title.toLowerCase();
  return URGENCY_KEYWORDS.some((keyword) => lowerTitle.includes(keyword.toLowerCase()));
}

/**
 * Calculate time in milliseconds until due date
 *
 * @param dueDate - ISO 8601 datetime string
 * @returns Milliseconds until due date (negative if past due)
 *
 * @example
 * getTimeUntilDue('2025-12-16T20:00:00.000Z')
 * // Returns: milliseconds until 20:00 (positive if future, negative if past)
 */
function getTimeUntilDue(dueDate: string): number {
  try {
    const due = new Date(dueDate);
    const now = new Date();
    return due.getTime() - now.getTime();
  } catch (error) {
    console.error('Error parsing due date:', error);
    // If date parsing fails, treat as invalid (return negative to trigger VERY_IMPORTANT)
    return -1;
  }
}

/**
 * Re-classify task priority when task data changes
 *
 * This function should be called whenever:
 * - Task title is updated
 * - Task due date is updated
 * - Task is loaded from storage
 *
 * @param task - Task object with title and optional dueDate
 * @returns Updated priority level
 *
 * @example
 * const task = { title: 'Fix bug', dueDate: '2025-12-16T20:00:00.000Z', priority: 'LOW' };
 * const newPriority = reclassifyPriority(task);
 * // Returns: 'HIGH' (due within 24 hours, overriding old 'LOW' priority)
 */
export function reclassifyPriority(task: Pick<{ title: string; dueDate?: string }, 'title' | 'dueDate'>): Priority {
  return classifyPriority(task);
}

/**
 * Check if a task should be classified as VERY_IMPORTANT
 *
 * Useful for notification triggers and visual emphasis.
 *
 * @param task - Task object with title and optional dueDate
 * @returns True if task should be VERY_IMPORTANT, false otherwise
 *
 * @example
 * isVeryImportant({ title: 'Urgent: Fix bug', dueDate: undefined }) // true
 * isVeryImportant({ title: 'Normal task', dueDate: '2025-12-30T10:00:00.000Z' }) // false
 */
export function isVeryImportant(task: Pick<{ title: string; dueDate?: string }, 'title' | 'dueDate'>): boolean {
  return classifyPriority(task) === 'VERY_IMPORTANT';
}
