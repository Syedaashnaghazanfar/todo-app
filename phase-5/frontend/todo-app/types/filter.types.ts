/**
 * Filter State Type Definitions
 *
 * Defines filter state for task filtering with cumulative AND logic across categories
 * and OR logic within categories. Filter state is persisted in localStorage.
 *
 * @module types/filter.types
 */

import type { Priority, TaskStatus } from './task.types';

/**
 * Due date filter options
 *
 * - overdue: dueDate < now
 * - today: dueDate within today (00:00 to 23:59)
 * - this_week: dueDate within next 7 days from now
 * - this_month: dueDate within current calendar month
 * - no_due_date: dueDate === undefined or null
 */
export type DueDateFilter = 'overdue' | 'today' | 'this_week' | 'this_month' | 'no_due_date';

/**
 * Filter state for task filtering
 *
 * Filter logic:
 * - Empty arrays = no filter applied for that category
 * - OR logic within each category (e.g., [IN_PROGRESS, COMPLETED] = show either)
 * - AND logic across categories (all active categories must match)
 *
 * Example:
 * {
 *   status: ['IN_PROGRESS'],
 *   priority: ['VERY_IMPORTANT', 'HIGH'],
 *   dueDate: ['today', 'overdue']
 * }
 *
 * Interpretation: Show tasks that are IN_PROGRESS AND (VERY_IMPORTANT OR HIGH) AND (due today OR overdue)
 *
 * @property status - Selected status filters (max 3, no duplicates)
 * @property priority - Selected priority filters (max 4, no duplicates)
 * @property dueDate - Selected due date filters (max 5, no duplicates)
 */
export interface FilterState {
  status: TaskStatus[];
  priority: Priority[];
  dueDate: DueDateFilter[];
}

/**
 * Default filter state (no filters applied)
 */
export const DEFAULT_FILTER_STATE: FilterState = {
  status: [],
  priority: [],
  dueDate: [],
} as const;

/**
 * Due date filter labels for UI
 */
export const DUE_DATE_FILTER_LABELS: Record<DueDateFilter, string> = {
  overdue: 'Overdue',
  today: 'Today',
  this_week: 'This Week',
  this_month: 'This Month',
  no_due_date: 'No Due Date',
} as const;

/**
 * Filter category labels for UI
 */
export const FILTER_CATEGORY_LABELS = {
  status: 'Status',
  priority: 'Priority',
  dueDate: 'Due Date',
} as const;

/**
 * Maximum number of filters per category
 */
export const MAX_FILTERS_PER_CATEGORY = {
  status: 3,
  priority: 4,
  dueDate: 5,
} as const;
