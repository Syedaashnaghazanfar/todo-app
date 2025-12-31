'use client';
import { useState, useCallback } from 'react';
import apiClient, { HistoryEntry, PaginationMeta } from '@/services/api';

export interface HistoryFilters {
  task_id?: string;
  action_type?: string;
}

export interface UseHistoryReturn {
  entries: HistoryEntry[];
  loading: boolean;
  error: string | null;
  pagination: PaginationMeta;
  fetchHistory: (page?: number, filters?: HistoryFilters) => Promise<void>;
  clearError: () => void;
}

export function useHistory(): UseHistoryReturn {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    limit: 20,
    total_count: 0,
    total_pages: 1,
    has_next: false,
    has_prev: false,
  });

  const fetchHistory = useCallback(async (page = 1, filters?: HistoryFilters) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.getHistory(
        page,
        20,
        filters?.task_id,
        filters?.action_type
      );
      setEntries(response.data);
      setPagination(response.pagination);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch history';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return { entries, loading, error, pagination, fetchHistory, clearError };
}
