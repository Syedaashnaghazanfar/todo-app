/**
 * useMCPStatus Hook
 *
 * Custom React hook for fetching and monitoring MCP server status.
 * Implements interval polling to update status every 10 seconds.
 * Handles loading, error, and fallback states with proper cleanup.
 *
 * Usage:
 * const { status, isLoading, error, refetch } = useMCPStatus(10000);
 *
 * @see /specs/001-phase2-homepage-ui/spec.md - Phase 5: T034
 */

import { useState, useEffect, useCallback } from 'react';
import { mcpClient } from '@/services/mcpClient';
import type { SystemStatus } from '@/types';

export interface UseMCPStatusReturn {
  status: SystemStatus | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook to fetch and monitor MCP server status
 * @param pollingInterval - Interval in milliseconds to poll for updates (default: 10000ms/10s)
 * @returns Object containing status data, loading state, error state, and refetch function
 */
export const useMCPStatus = (pollingInterval: number = 10000): UseMCPStatusReturn => {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch status function
  const fetchStatus = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const systemStatus = await mcpClient.fetchStatus();
      setStatus(systemStatus);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch system status';
      setError(errorMessage);
      console.error('Error fetching MCP status:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch and setup polling
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    // Initial fetch
    fetchStatus();

    // Set up polling interval
    intervalId = setInterval(() => {
      fetchStatus();
    }, pollingInterval);

    // Cleanup function to clear interval
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [pollingInterval, fetchStatus]);

  // Return status, loading state, error, and refetch function
  return {
    status,
    isLoading,
    error,
    refetch: fetchStatus
  };
};