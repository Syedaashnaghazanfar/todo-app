/**
 * useSort Hook
 *
 * Custom hook for task sorting with localStorage persistence.
 * Wraps sort logic with convenience methods and state management.
 *
 * Features:
 * - Sort state management
 * - Sort field and direction controls
 * - Ascending/descending toggle
 * - localStorage persistence
 * - Tie-breaking rules
 *
 * @module hooks/useSort
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import type { Task } from '@/types/task.types';
import type { SortField, SortDirection } from '@/lib/skills/task-sorting';
import {
  sortTasks,
  toggleSortDirection as toggleDirectionHelper,
  getRecommendedDirection,
  DEFAULT_SORT_STATE,
  type SortState,
} from '@/lib/skills/task-sorting';

/**
 * localStorage key for sort persistence
 */
const SORT_STORAGE_KEY = 'todo-app-sort';

/**
 * useSort hook return type
 */
export interface UseSortReturn {
  /** Current sort state */
  sortState: SortState;
  /** Sorted tasks */
  sortedTasks: Task[];

  /** Set sort field (keeps current direction) */
  setSortField: (field: SortField) => void;
  /** Set sort direction */
  setSortDirection: (direction: SortDirection) => void;
  /** Toggle sort direction (asc <-> desc) */
  toggleDirection: () => void;
  /** Set complete sort state */
  setSortState: (state: SortState) => void;
  /** Reset to default sort */
  resetSort: () => void;
  /** Check if using default sort */
  isDefaultSort: boolean;
}

/**
 * Custom hook for task sorting with persistence
 *
 * Manages sort state with localStorage persistence and provides
 * convenience methods for sort manipulation.
 *
 * @param tasks - Tasks to sort
 * @returns Sort state and control methods
 *
 * @example
 * const { sortedTasks, setSortField, toggleDirection, isDefaultSort } = useSort(tasks);
 *
 * // Change sort field
 * setSortField('DUE_DATE');
 *
 * // Toggle direction
 * toggleDirection();
 *
 * // Reset to default
 * resetSort();
 */
export function useSort(tasks: Task[]): UseSortReturn {
  // Initialize sort state from localStorage
  const [sortState, setSortStateInternal] = useState<SortState>(() => {
    return loadSortFromStorage();
  });

  // Save sort state to localStorage whenever it changes
  useEffect(() => {
    saveSortToStorage(sortState);
  }, [sortState]);

  // Apply sort to tasks
  const sortedTasks = useMemo(() => {
    return sortTasks(tasks, sortState);
  }, [tasks, sortState]);

  // Check if using default sort
  const isDefaultSort = useMemo(() => {
    return (
      sortState.field === DEFAULT_SORT_STATE.field &&
      sortState.direction === DEFAULT_SORT_STATE.direction
    );
  }, [sortState]);

  /**
   * Set sort field (keeps current direction)
   */
  const setSortField = useCallback((field: SortField) => {
    setSortStateInternal((prev) => ({
      ...prev,
      field,
    }));
  }, []);

  /**
   * Set sort direction
   */
  const setSortDirection = useCallback((direction: SortDirection) => {
    setSortStateInternal((prev) => ({
      ...prev,
      direction,
    }));
  }, []);

  /**
   * Toggle sort direction
   */
  const toggleDirection = useCallback(() => {
    setSortStateInternal((prev) => ({
      ...prev,
      direction: toggleDirectionHelper(prev.direction),
    }));
  }, []);

  /**
   * Set complete sort state
   */
  const setSortState = useCallback((state: SortState) => {
    setSortStateInternal(state);
  }, []);

  /**
   * Reset to default sort
   */
  const resetSort = useCallback(() => {
    setSortStateInternal(DEFAULT_SORT_STATE);
  }, []);

  return {
    sortState,
    sortedTasks,
    setSortField,
    setSortDirection,
    toggleDirection,
    setSortState,
    resetSort,
    isDefaultSort,
  };
}

/**
 * Load sort state from localStorage
 *
 * @returns Sort state from storage or default state
 */
function loadSortFromStorage(): SortState {
  // Check if we're running on the client side (not SSR)
  if (typeof window === 'undefined') {
    return DEFAULT_SORT_STATE;
  }

  try {
    const saved = localStorage.getItem(SORT_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...DEFAULT_SORT_STATE,
        ...parsed,
      };
    }
  } catch (error) {
    console.error('Failed to load sort state from localStorage:', error);
  }

  return DEFAULT_SORT_STATE;
}

/**
 * Save sort state to localStorage
 *
 * @param sortState - Sort state to save
 */
function saveSortToStorage(sortState: SortState): void {
  try {
    localStorage.setItem(SORT_STORAGE_KEY, JSON.stringify(sortState));
  } catch (error) {
    console.error('Failed to save sort state to localStorage:', error);
  }
}

export default useSort;
