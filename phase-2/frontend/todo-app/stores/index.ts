/**
 * Store Exports
 *
 * Central export file for all Zustand stores.
 *
 * @module stores
 */

// Task Store
export {
  useTaskStore,
  useTaskCount,
  useTasksLoading,
  useTaskError,
} from './taskStore';

// Filter Store
export {
  useFilterStore,
  useHasActiveFilters,
  useFilterCounts,
  useStatusFilters,
  usePriorityFilters,
  useDueDateFilters,
} from './filterStore';

// Sort Store
export {
  useSortStore,
  useSortField,
  useSortDirection,
  useCurrentSortState,
  useIsDefaultSort,
} from './sortStore';

// Notification Store
export {
  useNotificationStore,
  useUnreadCount,
  useUnreadNotifications,
  useNotificationCount,
  useIsNotificationLimitReached,
} from './notificationStore';

// Type exports
export type { Task } from '@/types/task.types';
export type { Notification } from '@/types/notification.types';
export type { FilterState, DueDateFilter } from '@/types/filter.types';
export type { SortState, SortField, SortDirection } from '@/types/sort.types';
