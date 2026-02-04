/**
 * useMCPMetrics Hook Tests
 *
 * Unit tests for useMCPMetrics custom hook using React Testing Library and Jest.
 * Tests cover data fetching, loading states, error handling, and polling behavior.
 *
 * @see /specs/001-phase2-homepage-ui/spec.md - Phase 6: T054
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useMCPMetrics } from '@/hooks/useMCPMetrics';
import { mcpClient } from '@/services/mcpClient';

// Mock the mcpClient
jest.mock('@/services/mcpClient', () => ({
  mcpClient: {
    fetchMetrics: jest.fn(),
  },
}));

const mockMcpClient = mcpClient as jest.Mocked<typeof mcpClient>;

describe('useMCPMetrics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('initially sets loading state to true', () => {
    const { result } = renderHook(() => useMCPMetrics());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.state).toBe('loading');
  });

  it('fetches metrics on mount', async () => {
    const mockMetrics = {
      metrics: [
        {
          id: 'active_users',
          label: 'Active Users',
          value: 1234,
          unit: 'users',
          trend: '+12%',
          chartType: 'line',
        }
      ],
      timestamp: new Date().toISOString(),
    };

    mockMcpClient.fetchMetrics.mockResolvedValue(mockMetrics);

    const { result } = renderHook(() => useMCPMetrics());

    // Wait for the async operation to complete
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockMcpClient.fetchMetrics).toHaveBeenCalledWith('day', 10);
    expect(result.current.metrics).toEqual(mockMetrics);
    expect(result.current.state).toBe('success');
  });

  it('handles errors gracefully', async () => {
    const mockError = new Error('Failed to fetch metrics');
    mockMcpClient.fetchMetrics.mockRejectedValue(mockError);

    const { result } = renderHook(() => useMCPMetrics());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBe('Failed to fetch metrics');
    expect(result.current.state).toBe('error');
  });

  it('updates metrics on polling interval', async () => {
    const firstMetrics = {
      metrics: [{ id: 'users1', label: 'Users 1', value: 100, unit: 'count' }],
      timestamp: new Date().toISOString(),
    };

    const secondMetrics = {
      metrics: [{ id: 'users2', label: 'Users 2', value: 200, unit: 'count' }],
      timestamp: new Date().toISOString(),
    };

    mockMcpClient.fetchMetrics
      .mockResolvedValueOnce(firstMetrics)
      .mockResolvedValueOnce(secondMetrics);

    const { result } = renderHook(() => useMCPMetrics(1000)); // 1 second polling

    // Initial fetch
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Fast-forward time to trigger polling
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    // Wait for the second fetch to complete
    await waitFor(() => {
      expect(result.current.metrics?.metrics[0].id).toBe('users2');
    });

    expect(mockMcpClient.fetchMetrics).toHaveBeenCalledTimes(2);
  });

  it('allows manual refetch', async () => {
    const firstMetrics = {
      metrics: [{ id: 'users1', label: 'Users 1', value: 100, unit: 'count' }],
      timestamp: new Date().toISOString(),
    };

    const secondMetrics = {
      metrics: [{ id: 'users2', label: 'Users 2', value: 200, unit: 'count' }],
      timestamp: new Date().toISOString(),
    };

    mockMcpClient.fetchMetrics
      .mockResolvedValueOnce(firstMetrics)
      .mockResolvedValueOnce(secondMetrics);

    const { result } = renderHook(() => useMCPMetrics());

    // Wait for initial fetch
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Manual refetch
    await act(async () => {
      await result.current.refetch();
    });

    expect(mockMcpClient.fetchMetrics).toHaveBeenCalledTimes(2);
    expect(result.current.metrics).toEqual(secondMetrics);
  });

  it('defaults to 15 second polling interval', () => {
    mockMcpClient.fetchMetrics.mockResolvedValue({
      metrics: [],
      timestamp: new Date().toISOString(),
    });

    renderHook(() => useMCPMetrics());

    // Check that setTimeout was called with the default interval
    expect(setInterval).toHaveBeenCalledWith(expect.any(Function), 15000);
  });

  it('uses provided polling interval', () => {
    mockMcpClient.fetchMetrics.mockResolvedValue({
      metrics: [],
      timestamp: new Date().toISOString(),
    });

    renderHook(() => useMCPMetrics(5000));

    expect(setInterval).toHaveBeenCalledWith(expect.any(Function), 5000);
  });
});