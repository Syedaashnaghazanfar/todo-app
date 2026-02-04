/**
 * Sort State Type Definitions
 *
 * Defines sort state for task sorting with tie-breaking rules.
 * Sort state is persisted in localStorage.
 *
 * @module types/sort.types
 */

/**
 * Sort field options
 *
 * Each field has automatic tie-breakers:
 * - priority: Primary = Priority, Tie-breaker 1 = Due Date (asc), Tie-breaker 2 = Created Date (desc), Tie-breaker 3 = Title (asc)
 * - dueDate: Primary = Due Date, Tie-breaker 1 = Priority (desc), Tie-breaker 2 = Created Date (desc), Tie-breaker 3 = Title (asc)
 * - createdDate: Primary = Created Date, Tie-breaker 1 = Priority (desc), Tie-breaker 2 = Due Date (asc), Tie-breaker 3 = Title (asc)
 * - alphabetical: Primary = Title, Tie-breaker 1 = Priority (desc), Tie-breaker 2 = Due Date (asc), Tie-breaker 3 = Created Date (desc)
 */
export type SortField = 'priority' | 'dueDate' | 'createdDate' | 'alphabetical';

/**
 * Sort direction options
 *
 * - asc: Ascending (A-Z, 1-9, oldest-newest, LOW-VERY_IMPORTANT)
 * - desc: Descending (Z-A, 9-1, newest-oldest, VERY_IMPORTANT-LOW)
 */
export type SortDirection = 'asc' | 'desc';

/**
 * Sort state for task sorting
 *
 * Default sort: Priority descending (VERY_IMPORTANT first)
 *
 * Null handling:
 * - Tasks without due dates sort last in ascending order, first in descending order
 * - Tasks without descriptions sort as empty strings
 *
 * @property field - Sort field with automatic tie-breakers
 * @property direction - Sort direction (ascending or descending)
 */
export interface SortState {
  field: SortField;
  direction: SortDirection;
}

/**
 * Default sort state (Priority descending, VERY_IMPORTANT first)
 */
export const DEFAULT_SORT_STATE: SortState = {
  field: 'priority',
  direction: 'desc',
} as const;

/**
 * Sort field labels for UI
 */
export const SORT_FIELD_LABELS: Record<SortField, string> = {
  priority: 'Priority',
  dueDate: 'Due Date',
  createdDate: 'Created Date',
  alphabetical: 'Alphabetical',
} as const;

/**
 * Sort direction labels for UI
 */
export const SORT_DIRECTION_LABELS: Record<SortDirection, string> = {
  asc: 'Ascending',
  desc: 'Descending',
} as const;

/**
 * Sort direction icons for UI
 */
export const SORT_DIRECTION_ICONS: Record<SortDirection, string> = {
  asc: '↑',
  desc: '↓',
} as const;

/**
 * Tie-breaker configuration for each sort field
 *
 * Defines the chain of tie-breakers applied when primary sort values are equal.
 * Format: [field, direction]
 */
export const TIE_BREAKER_CONFIG: Record<SortField, Array<[SortField, SortDirection]>> = {
  priority: [
    ['dueDate', 'asc'],
    ['createdDate', 'desc'],
    ['alphabetical', 'asc'],
  ],
  dueDate: [
    ['priority', 'desc'],
    ['createdDate', 'desc'],
    ['alphabetical', 'asc'],
  ],
  createdDate: [
    ['priority', 'desc'],
    ['dueDate', 'asc'],
    ['alphabetical', 'asc'],
  ],
  alphabetical: [
    ['priority', 'desc'],
    ['dueDate', 'asc'],
    ['createdDate', 'desc'],
  ],
} as const;
