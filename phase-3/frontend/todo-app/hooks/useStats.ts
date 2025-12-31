'use client';
import { useState, useCallback } from 'react';
import apiClient, { WeeklyStats } from '@/services/api';

export interface UseStatsReturn {
  stats: WeeklyStats | null;
  loading: boolean;
  error: string | null;
  fetchStats: () => Promise<void>;
  clearError: () => void;
}

export function useStats(): UseStatsReturn {
  const [stats, setStats] = useState<WeeklyStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.getWeeklyStats();
      setStats(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch stats';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return { stats, loading, error, fetchStats, clearError };
}
