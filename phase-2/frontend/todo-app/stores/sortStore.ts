/**
 * Sort Store (Zustand)
 *
 * Manages sort state with localStorage persistence. Provides actions for managing
 * sort field and direction with stable tie-breaking rules.
 *
 * @module stores/sortStore
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { devtools } from 'zustand/middleware';
import type { SortState, SortField, SortDirection } from '@/types/sort.types';
import { DEFAULT_SORT_STATE } from '@/types/sort.types';

/**
 * Sort store state interface
 */
interface SortStoreState {
  // State (from SortState)
  field: SortField;
  direction: SortDirection;

  // Actions
  setField: (field: SortField) => void;
  setDirection: (direction: SortDirection) => void;
  toggleDirection: () => void;
  setSortState: (sortState: SortState) => void;
  resetSort: () => void;
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
 * Sort store with localStorage persistence
 *
 * Storage key: 'sortState'
 * Persists: field and direction
 * Default: { field: 'priority', direction: 'desc' } (VERY_IMPORTANT tasks first)
 *
 * Sort fields with automatic tie-breakers:
 * - priority: Priority → Due Date (asc) → Created Date (desc) → Title (asc)
 * - dueDate: Due Date → Priority (desc) → Created Date (desc) → Title (asc)
 * - createdDate: Created Date → Priority (desc) → Due Date (asc) → Title (asc)
 * - alphabetical: Title → Priority (desc) → Due Date (asc) → Created Date (desc)
 *
 * Usage:
 * ```typescript
 * const { field, direction, setField, toggleDirection } = useSortStore();
 * ```
 */
export const useSortStore = create<SortStoreState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial State (Priority descending, VERY_IMPORTANT first)
        field: DEFAULT_SORT_STATE.field,
        direction: DEFAULT_SORT_STATE.direction,

        // Actions
        setField: (field: SortField) => {
          set({ field }, false, 'setField');
        },

        setDirection: (direction: SortDirection) => {
          set({ direction }, false, 'setDirection');
        },

        toggleDirection: () => {
          set(
            (state) => ({
              direction: state.direction === 'asc' ? 'desc' : 'asc',
            }),
            false,
            'toggleDirection'
          );
        },

        setSortState: (sortState: SortState) => {
          set(
            {
              field: sortState.field,
              direction: sortState.direction,
            },
            false,
            'setSortState'
          );
        },

        resetSort: () => {
          set(
            {
              field: DEFAULT_SORT_STATE.field,
              direction: DEFAULT_SORT_STATE.direction,
            },
            false,
            'resetSort'
          );
        },
      }),
      {
        name: 'sortState', // localStorage key
        storage: customStorage,
        partialize: (state) => ({
          field: state.field,
          direction: state.direction,
          // Exclude functions from persistence
        }),
      }
    ),
    { name: 'SortStore' }
  )
);

/**
 * Selector hook for getting sort field
 */
export const useSortField = () => useSortStore((state) => state.field);

/**
 * Selector hook for getting sort direction
 */
export const useSortDirection = () => useSortStore((state) => state.direction);

/**
 * Selector hook for getting complete sort state
 */
export const useCurrentSortState = () =>
  useSortStore((state) => ({
    field: state.field,
    direction: state.direction,
  }));

/**
 * Selector hook for checking if using default sort
 */
export const useIsDefaultSort = () =>
  useSortStore(
    (state) =>
      state.field === DEFAULT_SORT_STATE.field &&
      state.direction === DEFAULT_SORT_STATE.direction
  );
