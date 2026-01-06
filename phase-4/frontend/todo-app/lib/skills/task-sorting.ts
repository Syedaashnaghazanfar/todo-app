/**
 * Task Sorting Skill
 *
 * Implements stable sorting with tie-breaking rules for consistent task ordering.
 * Pure function with multiple sort options.
 *
 * Sort Options:
 * - Priority: VERY_IMPORTANT first, then by due date (ascending)
 * - Due Date: Soonest first, with null dates last
 * - Created Date: Newest first
 * - Alphabetical: By title (A-Z)
 *
 * Tie-Breaking Rules (applied in order):
 * 1. Priority (VERY_IMPORTANT > HIGH > MEDIUM > LOW)
 * 2. Due Date (ascending, nulls last)
 * 3. Created Date (descending, newest first)
 * 4. Title (alphabetical, case-insensitive)
 *
 * @module lib/skills/task-sorting
 */

import type { Task, Priority } from '@/types/task.types';
import { PRIORITY_ORDER } from '@/types/task.types';

/**
 * Sort field options
 */
export type SortField = 'PRIORITY' | 'DUE_DATE' | 'CREATED_DATE' | 'ALPHABETICAL';

/**
 * Sort direction
 */
export type SortDirection = 'ASC' | 'DESC';

/**
 * Sort state interface
 */
export interface SortState {
  field: SortField;
  direction: SortDirection;
}

/**
 * Default sort state (Priority descending)
 */
export const DEFAULT_SORT_STATE: SortState = {
  field: 'PRIORITY',
  direction: 'DESC',
};

/**
 * Sort tasks by specified field and direction with tie-breaking
 *
 * Uses stable sorting algorithm with comprehensive tie-breaking rules.
 *
 * @param tasks - Array of tasks to sort
 * @param sortState - Sort configuration
 * @returns Sorted array of tasks (new array, original unchanged)
 *
 * @example
 * sortTasks(tasks, { field: 'PRIORITY', direction: 'DESC' })
 * // Returns tasks sorted by priority (VERY_IMPORTANT first)
 *
 * sortTasks(tasks, { field: 'DUE_DATE', direction: 'ASC' })
 * // Returns tasks sorted by due date (soonest first, nulls last)
 */
export function sortTasks(tasks: Task[], sortState: SortState): Task[] {
  // Create copy to avoid mutating original
  const sortedTasks = [...tasks];

  // Primary sort comparator
  const primaryComparator = getComparator(sortState.field, sortState.direction);

  // Sort with primary and tie-breaking comparators
  sortedTasks.sort((a, b) => {
    // Primary sort
    const primaryResult = primaryComparator(a, b);
    if (primaryResult !== 0) {
      return primaryResult;
    }

    // Tie-breaking: Apply all tie-breakers in order
    return applyTieBreakers(a, b, sortState.field);
  });

  return sortedTasks;
}

/**
 * Get comparator function for sort field
 *
 * @param field - Sort field
 * @param direction - Sort direction
 * @returns Comparator function
 */
function getComparator(field: SortField, direction: SortDirection): (a: Task, b: Task) => number {
  const multiplier = direction === 'ASC' ? 1 : -1;

  switch (field) {
    case 'PRIORITY':
      return (a, b) => multiplier * comparePriority(a.priority, b.priority);

    case 'DUE_DATE':
      return (a, b) => multiplier * compareDueDate(a.dueDate, b.dueDate);

    case 'CREATED_DATE':
      return (a, b) => multiplier * compareCreatedDate(a.createdAt, b.createdAt);

    case 'ALPHABETICAL':
      return (a, b) => multiplier * compareTitle(a.title, b.title);

    default:
      return () => 0;
  }
}

/**
 * Apply tie-breaking rules in order
 *
 * Tie-breaking order (skip primary field):
 * 1. Priority (DESC)
 * 2. Due Date (ASC, nulls last)
 * 3. Created Date (DESC)
 * 4. Title (ASC)
 *
 * @param a - First task
 * @param b - Second task
 * @param primaryField - Primary sort field (skip this in tie-breaking)
 * @returns Comparison result
 */
function applyTieBreakers(a: Task, b: Task, primaryField: SortField): number {
  // Tie-breaker 1: Priority (if not primary field)
  if (primaryField !== 'PRIORITY') {
    const priorityResult = comparePriority(a.priority, b.priority);
    if (priorityResult !== 0) {
      return -priorityResult; // DESC (VERY_IMPORTANT first)
    }
  }

  // Tie-breaker 2: Due Date (if not primary field)
  if (primaryField !== 'DUE_DATE') {
    const dueDateResult = compareDueDate(a.dueDate, b.dueDate);
    if (dueDateResult !== 0) {
      return dueDateResult; // ASC (soonest first, nulls last)
    }
  }

  // Tie-breaker 3: Created Date (if not primary field)
  if (primaryField !== 'CREATED_DATE') {
    const createdResult = compareCreatedDate(a.createdAt, b.createdAt);
    if (createdResult !== 0) {
      return -createdResult; // DESC (newest first)
    }
  }

  // Tie-breaker 4: Title (if not primary field)
  if (primaryField !== 'ALPHABETICAL') {
    return compareTitle(a.title, b.title); // ASC (A-Z)
  }

  return 0; // All tie-breakers exhausted
}

/**
 * Compare priorities
 *
 * @param a - First priority
 * @param b - Second priority
 * @returns Comparison result (positive if a > b, negative if a < b, 0 if equal)
 */
function comparePriority(a: Priority, b: Priority): number {
  return PRIORITY_ORDER[a] - PRIORITY_ORDER[b];
}

/**
 * Compare due dates
 *
 * Null dates are considered greater than any date (sorted last in ascending order).
 *
 * @param a - First due date (ISO string or undefined)
 * @param b - Second due date (ISO string or undefined)
 * @returns Comparison result
 */
function compareDueDate(a: string | undefined, b: string | undefined): number {
  // Both null: equal
  if (!a && !b) {
    return 0;
  }

  // Only a is null: a > b (nulls last)
  if (!a) {
    return 1;
  }

  // Only b is null: a < b (nulls last)
  if (!b) {
    return -1;
  }

  // Both have dates: compare chronologically
  const dateA = new Date(a).getTime();
  const dateB = new Date(b).getTime();

  return dateA - dateB;
}

/**
 * Compare created dates
 *
 * @param a - First created date (ISO string)
 * @param b - Second created date (ISO string)
 * @returns Comparison result
 */
function compareCreatedDate(a: string, b: string): number {
  const dateA = new Date(a).getTime();
  const dateB = new Date(b).getTime();

  return dateA - dateB;
}

/**
 * Compare titles (case-insensitive alphabetical)
 *
 * @param a - First title
 * @param b - Second title
 * @returns Comparison result
 */
function compareTitle(a: string, b: string): number {
  return a.toLowerCase().localeCompare(b.toLowerCase());
}

/**
 * Toggle sort direction
 *
 * @param currentDirection - Current sort direction
 * @returns Opposite direction
 */
export function toggleSortDirection(currentDirection: SortDirection): SortDirection {
  return currentDirection === 'ASC' ? 'DESC' : 'ASC';
}

/**
 * Get recommended sort direction for field
 *
 * Some fields have more intuitive default directions:
 * - Priority: DESC (VERY_IMPORTANT first)
 * - Due Date: ASC (soonest first)
 * - Created Date: DESC (newest first)
 * - Alphabetical: ASC (A-Z)
 *
 * @param field - Sort field
 * @returns Recommended direction
 */
export function getRecommendedDirection(field: SortField): SortDirection {
  switch (field) {
    case 'PRIORITY':
      return 'DESC';
    case 'DUE_DATE':
      return 'ASC';
    case 'CREATED_DATE':
      return 'DESC';
    case 'ALPHABETICAL':
      return 'ASC';
    default:
      return 'ASC';
  }
}
