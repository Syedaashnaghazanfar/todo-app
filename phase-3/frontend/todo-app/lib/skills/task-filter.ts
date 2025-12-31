/**
 * Task Filter Skill
 *
 * Implements multi-dimensional task filtering with cumulative AND logic.
 * Pure function for predictable, testable filtering behavior.
 *
 * Filter Types:
 * - Status: NOT_STARTED, IN_PROGRESS, COMPLETED
 * - Priority: VERY_IMPORTANT, HIGH, MEDIUM, LOW
 * - Due Date: Overdue, Today, This Week, This Month, No Due Date
 *
 * Filter Logic: Cumulative AND (all active filters must match)
 *
 * @module lib/skills/task-filter
 */

import type { Task, TaskStatus, Priority } from '@/types/task.types';

/**
 * Due date filter options
 */
export type DueDateFilter = 'OVERDUE' | 'TODAY' | 'THIS_WEEK' | 'THIS_MONTH' | 'NO_DUE_DATE' | 'ALL';

/**
 * Filter state interface
 */
export interface FilterState {
  /** Status filters (empty array = no status filtering) */
  status: TaskStatus[];
  /** Priority filters (empty array = no priority filtering) */
  priority: Priority[];
  /** Due date filter (ALL = no due date filtering) */
  dueDate: DueDateFilter;
  /** Tag filters (empty array = no tag filtering) */
  tags: string[];
}

/**
 * Default filter state (no filtering)
 */
export const DEFAULT_FILTER_STATE: FilterState = {
  status: [],
  priority: [],
  dueDate: 'ALL',
  tags: [],
};

/**
 * Filter tasks by multiple criteria (cumulative AND logic)
 *
 * Applies all active filters. A task must match ALL criteria to be included.
 *
 * @param tasks - Array of tasks to filter
 * @param filterState - Current filter state
 * @returns Filtered array of tasks
 *
 * @example
 * filterTasks(tasks, {
 *   status: ['IN_PROGRESS'],
 *   priority: ['HIGH'],
 *   dueDate: 'TODAY',
 *   tags: []
 * })
 * // Returns only tasks that are IN_PROGRESS AND HIGH priority AND due TODAY
 */
export function filterTasks(tasks: Task[], filterState: FilterState): Task[] {
  return tasks.filter((task) => {
    // Status filter (AND logic if multiple statuses selected)
    if (filterState.status.length > 0 && !filterState.status.includes(task.status)) {
      return false;
    }

    // Priority filter (AND logic if multiple priorities selected)
    if (filterState.priority.length > 0 && !filterState.priority.includes(task.priority)) {
      return false;
    }

    // Due date filter
    if (filterState.dueDate !== 'ALL' && !matchesDueDateFilter(task, filterState.dueDate)) {
      return false;
    }

    // Tag filter (task must have ALL selected tags)
    if (filterState.tags.length > 0) {
      const hasAllTags = filterState.tags.every((tag) => task.tags.includes(tag));
      if (!hasAllTags) {
        return false;
      }
    }

    return true; // Task matches all filters
  });
}

/**
 * Check if task matches due date filter
 *
 * @param task - Task to check
 * @param dueDateFilter - Due date filter option
 * @returns True if task matches filter, false otherwise
 */
export function matchesDueDateFilter(task: Task, dueDateFilter: DueDateFilter): boolean {
  // ALL filter matches everything
  if (dueDateFilter === 'ALL') {
    return true;
  }

  // NO_DUE_DATE filter
  if (dueDateFilter === 'NO_DUE_DATE') {
    return !task.dueDate;
  }

  // All other filters require a due date
  if (!task.dueDate) {
    return false;
  }

  const taskDue = new Date(task.dueDate);
  const now = new Date();
  now.setHours(0, 0, 0, 0); // Normalize to start of day

  switch (dueDateFilter) {
    case 'OVERDUE':
      return taskDue < now;

    case 'TODAY':
      const today = new Date(now);
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return taskDue >= today && taskDue < tomorrow;

    case 'THIS_WEEK':
      const weekStart = getStartOfWeek(now);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);
      return taskDue >= weekStart && taskDue < weekEnd;

    case 'THIS_MONTH':
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      return taskDue >= monthStart && taskDue < monthEnd;

    default:
      return true;
  }
}

/**
 * Get start of week (Sunday)
 *
 * @param date - Reference date
 * @returns Date representing start of week (Sunday at 00:00:00)
 */
function getStartOfWeek(date: Date): Date {
  const day = date.getDay();
  const diff = date.getDate() - day; // Sunday as start of week
  const startOfWeek = new Date(date);
  startOfWeek.setDate(diff);
  startOfWeek.setHours(0, 0, 0, 0);
  return startOfWeek;
}

/**
 * Count active filters in filter state
 *
 * @param filterState - Current filter state
 * @returns Number of active filters
 *
 * @example
 * countActiveFilters({
 *   status: ['IN_PROGRESS'],
 *   priority: ['HIGH', 'MEDIUM'],
 *   dueDate: 'TODAY',
 *   tags: ['Work']
 * })
 * // Returns: 4 (1 status + 2 priorities + 1 due date + 1 tag)
 */
export function countActiveFilters(filterState: FilterState): number {
  let count = 0;

  count += filterState.status.length;
  count += filterState.priority.length;
  count += filterState.tags.length;

  if (filterState.dueDate !== 'ALL') {
    count += 1;
  }

  return count;
}

/**
 * Check if any filters are active
 *
 * @param filterState - Current filter state
 * @returns True if any filters are active, false otherwise
 */
export function hasActiveFilters(filterState: FilterState): boolean {
  return countActiveFilters(filterState) > 0;
}

/**
 * Clear all filters
 *
 * @returns Default filter state with no filters active
 */
export function clearAllFilters(): FilterState {
  return { ...DEFAULT_FILTER_STATE };
}

/**
 * Toggle status filter
 *
 * Adds status if not present, removes if present.
 *
 * @param filterState - Current filter state
 * @param status - Status to toggle
 * @returns Updated filter state
 */
export function toggleStatusFilter(filterState: FilterState, status: TaskStatus): FilterState {
  const currentStatuses = filterState.status;
  const hasStatus = currentStatuses.includes(status);

  return {
    ...filterState,
    status: hasStatus
      ? currentStatuses.filter((s) => s !== status)
      : [...currentStatuses, status],
  };
}

/**
 * Toggle priority filter
 *
 * Adds priority if not present, removes if present.
 *
 * @param filterState - Current filter state
 * @param priority - Priority to toggle
 * @returns Updated filter state
 */
export function togglePriorityFilter(filterState: FilterState, priority: Priority): FilterState {
  const currentPriorities = filterState.priority;
  const hasPriority = currentPriorities.includes(priority);

  return {
    ...filterState,
    priority: hasPriority
      ? currentPriorities.filter((p) => p !== priority)
      : [...currentPriorities, priority],
  };
}

/**
 * Set due date filter
 *
 * @param filterState - Current filter state
 * @param dueDate - Due date filter option
 * @returns Updated filter state
 */
export function setDueDateFilter(filterState: FilterState, dueDate: DueDateFilter): FilterState {
  return {
    ...filterState,
    dueDate,
  };
}

/**
 * Toggle tag filter
 *
 * Adds tag if not present, removes if present.
 *
 * @param filterState - Current filter state
 * @param tag - Tag to toggle
 * @returns Updated filter state
 */
export function toggleTagFilter(filterState: FilterState, tag: string): FilterState {
  const currentTags = filterState.tags;
  const hasTag = currentTags.includes(tag);

  return {
    ...filterState,
    tags: hasTag ? currentTags.filter((t) => t !== tag) : [...currentTags, tag],
  };
}
