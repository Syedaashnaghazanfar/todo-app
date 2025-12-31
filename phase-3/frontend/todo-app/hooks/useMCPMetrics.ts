/**
 * useMCPMetrics Hook
 *
 * Custom React hook for fetching and monitoring MCP metrics data.
 * Implements interval polling to update metrics every 15 seconds.
 * Handles loading, error, and fallback states with proper cleanup.
 *
 * Usage:
 * const { metrics, isLoading, error, refetch } = useMCPMetrics(15000);
 *
 * @see /specs/001-phase2-homepage-ui/spec.md - Phase 6: T048
 */

import { useState, useEffect, useCallback } from 'react';
import { mcpClient } from '@/services/mcpClient';
import type { MetricsResponse, ApiResponse, RequestState } from '@/types';

export interface UseMCPMetricsReturn {
  metrics: MetricsResponse | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  state: RequestState;
}

/**
 * Custom hook to fetch and monitor MCP metrics data
 * @param pollingInterval - Interval in milliseconds to poll for updates (default: 15000ms/15s)
 * @returns Object containing metrics data, loading state, error state, and refetch function
 */
export const useMCPMetrics = (pollingInterval: number = 15000): UseMCPMetricsReturn => {
  const [metrics, setMetrics] = useState<MetricsResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<RequestState>('idle');

  // Fetch metrics function
  const fetchMetrics = useCallback(async () => {
    setIsLoading(true);
    setState('loading');
    setError(null);

    try {
      const metricsData = await mcpClient.fetchMetrics('day', 10); // Default to daily metrics, limit 10
      setMetrics(metricsData);
      setState('success');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch metrics';
      setError(errorMessage);
      setState('error');
      console.error('Error fetching MCP metrics:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch and setup polling
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    // Initial fetch
    fetchMetrics();

    // Set up polling interval
    intervalId = setInterval(() => {
      fetchMetrics();
    }, pollingInterval);

    // Cleanup function to clear interval
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [pollingInterval, fetchMetrics]);

  // Return metrics, loading state, error, and refetch function
  return {
    metrics,
    isLoading,
    error,
    refetch: fetchMetrics,
    state
  };
};