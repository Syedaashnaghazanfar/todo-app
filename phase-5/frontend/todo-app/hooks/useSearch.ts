/**
 * useSearch Hook
 *
 * Custom hook for search functionality with 300ms debounce.
 * Optimizes search performance by preventing excessive re-renders.
 *
 * Features:
 * - 300ms debounce delay
 * - Controlled input state
 * - Debounced query for search execution
 *
 * @module hooks/useSearch
 */

import { useState, useEffect } from 'react';

/**
 * Search debounce delay in milliseconds
 */
const SEARCH_DEBOUNCE_DELAY = 300;

/**
 * useSearch hook return type
 */
export interface UseSearchReturn {
  /** Current search input value (updates immediately) */
  searchQuery: string;
  /** Debounced search query (updates after delay) */
  debouncedQuery: string;
  /** Set search query (controlled input) */
  setSearchQuery: (query: string) => void;
  /** Clear search query */
  clearSearch: () => void;
  /** Whether search is actively debouncing */
  isDebouncing: boolean;
}

/**
 * Custom hook for debounced search functionality
 *
 * Provides controlled search input with debounce to prevent excessive
 * search operations while user is typing.
 *
 * @param initialQuery - Optional initial search query (default: '')
 * @param delay - Optional debounce delay in ms (default: 300)
 * @returns Search state and control methods
 *
 * @example
 * const { searchQuery, debouncedQuery, setSearchQuery, clearSearch } = useSearch();
 *
 * // In component:
 * <input
 *   value={searchQuery}
 *   onChange={(e) => setSearchQuery(e.target.value)}
 * />
 *
 * // Use debouncedQuery for actual search:
 * const results = searchTasks(tasks, debouncedQuery);
 */
export function useSearch(
  initialQuery: string = '',
  delay: number = SEARCH_DEBOUNCE_DELAY
): UseSearchReturn {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [isDebouncing, setIsDebouncing] = useState(false);

  // Debounce search query
  useEffect(() => {
    // Set debouncing flag
    if (searchQuery !== debouncedQuery) {
      setIsDebouncing(true);
    }

    // Set up debounce timer
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setIsDebouncing(false);
    }, delay);

    // Cleanup timer on query change
    return () => {
      clearTimeout(timer);
    };
  }, [searchQuery, delay]);

  /**
   * Clear search query (immediate)
   */
  const clearSearch = () => {
    setSearchQuery('');
    setDebouncedQuery('');
    setIsDebouncing(false);
  };

  return {
    searchQuery,
    debouncedQuery,
    setSearchQuery,
    clearSearch,
    isDebouncing,
  };
}

/**
 * Hook for search with history tracking
 *
 * Extends useSearch with search history management (recent searches).
 *
 * @param maxHistory - Maximum number of history items to keep (default: 10)
 * @returns Search state with history
 *
 * @example
 * const { searchQuery, debouncedQuery, history, addToHistory } = useSearchWithHistory();
 */
export function useSearchWithHistory(maxHistory: number = 10) {
  const search = useSearch();
  const [history, setHistory] = useState<string[]>([]);

  /**
   * Add query to search history
   */
  const addToHistory = (query: string) => {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      return;
    }

    setHistory((prev) => {
      // Remove duplicate if exists
      const filtered = prev.filter((item) => item !== trimmedQuery);

      // Add to start of history
      const updated = [trimmedQuery, ...filtered];

      // Limit to max history
      return updated.slice(0, maxHistory);
    });
  };

  /**
   * Clear search history
   */
  const clearHistory = () => {
    setHistory([]);
  };

  return {
    ...search,
    history,
    addToHistory,
    clearHistory,
  };
}

export default useSearch;
