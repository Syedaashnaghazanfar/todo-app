/**
 * useFilters Hook
 *
 * Custom hook for task filtering with localStorage persistence.
 * Wraps filter logic with convenience methods and state management.
 *
 * Features:
 * - Filter state management
 * - Toggle filters (status, priority, tag)
 * - Set due date filter
 * - Clear all filters
 * - Active filter count
 * - localStorage persistence
 *
 * @module hooks/useFilters
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import type { Task, TaskStatus, Priority } from '@/types/task.types';
import type { FilterState, DueDateFilter } from '@/lib/skills/task-filter';
import {
  filterTasks,
  countActiveFilters,
  hasActiveFilters,
  clearAllFilters as clearFiltersHelper,
  toggleStatusFilter as toggleStatusHelper,
  togglePriorityFilter as togglePriorityHelper,
  setDueDateFilter as setDueDateHelper,
  toggleTagFilter as toggleTagHelper,
  DEFAULT_FILTER_STATE,
} from '@/lib/skills/task-filter';

/**
 * localStorage key for filter persistence
 */
const FILTER_STORAGE_KEY = 'todo-app-filters';

/**
 * useFilters hook return type
 */
export interface UseFiltersReturn {
  /** Current filter state */
  filterState: FilterState;
  /** Filtered tasks */
  filteredTasks: Task[];
  /** Number of active filters */
  activeFilterCount: number;
  /** Whether any filters are active */
  hasFilters: boolean;

  /** Toggle status filter */
  toggleStatusFilter: (status: TaskStatus) => void;
  /** Toggle priority filter */
  togglePriorityFilter: (priority: Priority) => void;
  /** Set due date filter */
  setDueDateFilter: (dueDate: DueDateFilter) => void;
  /** Toggle tag filter */
  toggleTagFilter: (tag: string) => void;
  /** Clear all filters */
  clearAllFilters: () => void;
  /** Set entire filter state */
  setFilterState: (state: FilterState) => void;
}

/**
 * Custom hook for task filtering with persistence
 *
 * Manages filter state with localStorage persistence and provides
 * convenience methods for filter manipulation.
 *
 * @param tasks - Tasks to filter
 * @returns Filter state and control methods
 *
 * @example
 * const { filteredTasks, toggleStatusFilter, clearAllFilters, activeFilterCount } = useFilters(tasks);
 *
 * // Toggle status filter
 * toggleStatusFilter('IN_PROGRESS');
 *
 * // Clear all filters
 * clearAllFilters();
 */
export function useFilters(tasks: Task[]): UseFiltersReturn {
  // Initialize filter state from localStorage
  const [filterState, setFilterState] = useState<FilterState>(() => {
    return loadFiltersFromStorage();
  });

  // Save filter state to localStorage whenever it changes
  useEffect(() => {
    saveFiltersToStorage(filterState);
  }, [filterState]);

  // Apply filters to tasks
  const filteredTasks = useMemo(() => {
    return filterTasks(tasks, filterState);
  }, [tasks, filterState]);

  // Calculate active filter count
  const activeFilterCount = useMemo(() => {
    return countActiveFilters(filterState);
  }, [filterState]);

  // Check if any filters are active
  const hasFilters = useMemo(() => {
    return hasActiveFilters(filterState);
  }, [filterState]);

  /**
   * Toggle status filter
   */
  const toggleStatus = useCallback((status: TaskStatus) => {
    setFilterState((prev) => toggleStatusHelper(prev, status));
  }, []);

  /**
   * Toggle priority filter
   */
  const togglePriority = useCallback((priority: Priority) => {
    setFilterState((prev) => togglePriorityHelper(prev, priority));
  }, []);

  /**
   * Set due date filter
   */
  const setDueDate = useCallback((dueDate: DueDateFilter) => {
    setFilterState((prev) => setDueDateHelper(prev, dueDate));
  }, []);

  /**
   * Toggle tag filter
   */
  const toggleTag = useCallback((tag: string) => {
    setFilterState((prev) => toggleTagHelper(prev, tag));
  }, []);

  /**
   * Clear all filters
   */
  const clearAll = useCallback(() => {
    setFilterState(clearFiltersHelper());
  }, []);

  return {
    filterState,
    filteredTasks,
    activeFilterCount,
    hasFilters,
    toggleStatusFilter: toggleStatus,
    togglePriorityFilter: togglePriority,
    setDueDateFilter: setDueDate,
    toggleTagFilter: toggleTag,
    clearAllFilters: clearAll,
    setFilterState,
  };
}

/**
 * Load filters from localStorage
 *
 * @returns Filter state from storage or default state
 */
function loadFiltersFromStorage(): FilterState {
  // Check if we're running on the client side (not SSR)
  if (typeof window === 'undefined') {
    return DEFAULT_FILTER_STATE;
  }

  try {
    const saved = localStorage.getItem(FILTER_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...DEFAULT_FILTER_STATE,
        ...parsed,
      };
    }
  } catch (error) {
    console.error('Failed to load filters from localStorage:', error);
  }

  return DEFAULT_FILTER_STATE;
}

/**
 * Save filters to localStorage
 *
 * @param filterState - Filter state to save
 */
function saveFiltersToStorage(filterState: FilterState): void {
  try {
    localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(filterState));
  } catch (error) {
    console.error('Failed to save filters to localStorage:', error);
  }
}

export default useFilters;
