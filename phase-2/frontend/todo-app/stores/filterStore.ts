/**
 * Filter Store (Zustand)
 *
 * Manages filter state with localStorage persistence. Provides actions for managing
 * status, priority, and due date filters with cumulative AND logic.
 *
 * @module stores/filterStore
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { devtools } from 'zustand/middleware';
import type { FilterState, DueDateFilter } from '@/types/filter.types';
import type { Priority, TaskStatus } from '@/types/task.types';
import { DEFAULT_FILTER_STATE } from '@/types/filter.types';

/**
 * Filter store state interface
 */
interface FilterStoreState {
  // State (from FilterState)
  status: TaskStatus[];
  priority: Priority[];
  dueDate: DueDateFilter[];

  // Actions - Status Filters
  setStatus: (status: TaskStatus[]) => void;
  toggleStatus: (status: TaskStatus) => void;
  clearStatusFilters: () => void;

  // Actions - Priority Filters
  setPriority: (priority: Priority[]) => void;
  togglePriority: (priority: Priority) => void;
  clearPriorityFilters: () => void;

  // Actions - Due Date Filters
  setDueDate: (dueDate: DueDateFilter[]) => void;
  toggleDueDate: (dueDate: DueDateFilter) => void;
  clearDueDateFilters: () => void;

  // Actions - Global
  clearFilters: () => void;
  hasActiveFilters: () => boolean;
}

/**
 * Custom localStorage storage for Zustand persist middleware
 *
 * Wraps native localStorage with error handling to prevent crashes
 * when localStorage is unavailable or quota is exceeded.
 */
const customStorage = createJSONStorage(() => ({
  getItem: (name: string) => {
    try {
      const item = localStorage.getItem(name);
      return item;
    } catch (error) {
      console.error('Failed to get item from localStorage:', error);
      return null;
    }
  },
  setItem: (name: string, value: string) => {
    try {
      localStorage.setItem(name, value);
    } catch (error) {
      console.error('Failed to set item in localStorage:', error);
    }
  },
  removeItem: (name: string) => {
    try {
      localStorage.removeItem(name);
    } catch (error) {
      console.error('Failed to remove item from localStorage:', error);
    }
  },
}));

/**
 * Filter store with localStorage persistence
 *
 * Storage key: 'filterState'
 * Persists: status, priority, dueDate arrays
 *
 * Filter logic:
 * - Empty arrays = no filter applied for that category
 * - OR logic within each category (e.g., [IN_PROGRESS, COMPLETED] = show either)
 * - AND logic across categories (all active categories must match)
 *
 * Usage:
 * ```typescript
 * const { status, priority, dueDate, toggleStatus, clearFilters } = useFilterStore();
 * ```
 */
export const useFilterStore = create<FilterStoreState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial State
        status: DEFAULT_FILTER_STATE.status,
        priority: DEFAULT_FILTER_STATE.priority,
        dueDate: DEFAULT_FILTER_STATE.dueDate,

        // Status Actions
        setStatus: (status: TaskStatus[]) => {
          set({ status }, false, 'setStatus');
        },

        toggleStatus: (status: TaskStatus) => {
          set(
            (state) => {
              const index = state.status.indexOf(status);
              if (index === -1) {
                // Add status
                return { status: [...state.status, status] };
              } else {
                // Remove status
                return {
                  status: state.status.filter((s) => s !== status),
                };
              }
            },
            false,
            'toggleStatus'
          );
        },

        clearStatusFilters: () => {
          set({ status: [] }, false, 'clearStatusFilters');
        },

        // Priority Actions
        setPriority: (priority: Priority[]) => {
          set({ priority }, false, 'setPriority');
        },

        togglePriority: (priority: Priority) => {
          set(
            (state) => {
              const index = state.priority.indexOf(priority);
              if (index === -1) {
                // Add priority
                return { priority: [...state.priority, priority] };
              } else {
                // Remove priority
                return {
                  priority: state.priority.filter((p) => p !== priority),
                };
              }
            },
            false,
            'togglePriority'
          );
        },

        clearPriorityFilters: () => {
          set({ priority: [] }, false, 'clearPriorityFilters');
        },

        // Due Date Actions
        setDueDate: (dueDate: DueDateFilter[]) => {
          set({ dueDate }, false, 'setDueDate');
        },

        toggleDueDate: (dueDate: DueDateFilter) => {
          set(
            (state) => {
              const index = state.dueDate.indexOf(dueDate);
              if (index === -1) {
                // Add due date filter
                return { dueDate: [...state.dueDate, dueDate] };
              } else {
                // Remove due date filter
                return {
                  dueDate: state.dueDate.filter((d) => d !== dueDate),
                };
              }
            },
            false,
            'toggleDueDate'
          );
        },

        clearDueDateFilters: () => {
          set({ dueDate: [] }, false, 'clearDueDateFilters');
        },

        // Global Actions
        clearFilters: () => {
          set(
            {
              status: [],
              priority: [],
              dueDate: [],
            },
            false,
            'clearFilters'
          );
        },

        hasActiveFilters: () => {
          const state = get();
          return (
            state.status.length > 0 ||
            state.priority.length > 0 ||
            state.dueDate.length > 0
          );
        },
      }),
      {
        name: 'filterState', // localStorage key
        storage: customStorage,
        partialize: (state) => ({
          status: state.status,
          priority: state.priority,
          dueDate: state.dueDate,
          // Exclude functions from persistence
        }),
      }
    ),
    { name: 'FilterStore' }
  )
);

/**
 * Selector hook for checking if filters are active
 */
export const useHasActiveFilters = () =>
  useFilterStore((state) => state.hasActiveFilters());

/**
 * Selector hook for getting filter counts
 */
export const useFilterCounts = () =>
  useFilterStore((state) => ({
    statusCount: state.status.length,
    priorityCount: state.priority.length,
    dueDateCount: state.dueDate.length,
    totalCount: state.status.length + state.priority.length + state.dueDate.length,
  }));

/**
 * Selector hook for getting status filters
 */
export const useStatusFilters = () => useFilterStore((state) => state.status);

/**
 * Selector hook for getting priority filters
 */
export const usePriorityFilters = () => useFilterStore((state) => state.priority);

/**
 * Selector hook for getting due date filters
 */
export const useDueDateFilters = () => useFilterStore((state) => state.dueDate);
