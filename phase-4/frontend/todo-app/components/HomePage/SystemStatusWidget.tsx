/**
 * SystemStatusWidget Component
 *
 * Displays real-time MCP server health status with color-coded indicators and automatic updates.
 * Shows overall system status and individual server statuses with health indicators.
 * Implements polling to update status every 10 seconds with loading states and error handling.
 *
 * Usage:
 * <SystemStatusWidget refreshInterval={10000} />
 *
 * @see /specs/001-phase2-homepage-ui/spec.md - Phase 5: T035
 */

import React from 'react';
import { useMCPStatus } from '@/hooks/useMCPStatus';
import { StatusIndicator } from '../shared/StatusIndicator';
import { LoadingState } from '../shared/LoadingState';
import { cn } from '@/lib/utils';

export interface SystemStatusWidgetProps {
  refreshInterval?: number;
  className?: string;
}

/**
 * SystemStatusWidget Component
 *
 * Displays real-time MCP server health status with color-coded indicators and automatic updates.
 */
export const SystemStatusWidget: React.FC<SystemStatusWidgetProps> = ({
  refreshInterval = 10000,
  className
}) => {
  const { status, isLoading, error, refetch } = useMCPStatus(refreshInterval);

  // Show loading state if data is being fetched
  if (isLoading && !status) {
    return (
      <div className={cn("bg-white dark:bg-purple-900/30 rounded-xl border border-purple-200 dark:border-purple-700 p-6", className)}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-purple-800 dark:text-purple-200">
            System Status
          </h3>
          <StatusIndicator status="loading" showIcon={false} />
        </div>
        <LoadingState className="h-24 w-full" />
      </div>
    );
  }

  // Show error state if there was an error fetching data
  if (error) {
    return (
      <div className={cn("bg-white dark:bg-purple-900/30 rounded-xl border border-purple-200 dark:border-purple-700 p-6", className)}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-purple-800 dark:text-purple-200">
            System Status
          </h3>
          <StatusIndicator status="error" showIcon={false} />
        </div>
        <div className="text-center py-8">
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Unable to fetch system status
          </p>
          <button
            onClick={refetch}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // If we have status data, display it
  if (status) {
    return (
      <div className={cn("bg-white dark:bg-purple-900/30 rounded-xl border border-purple-200 dark:border-purple-700 p-6", className)}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-purple-800 dark:text-purple-200">
            System Status
          </h3>
          <StatusIndicator status={status.overallStatus} showIcon={false} />
        </div>

        <div className="space-y-3">
          {status.servers.map((server, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-purple-50/50 dark:bg-purple-950/30 rounded-lg border border-purple-100 dark:border-purple-800"
            >
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-3 ${
                  server.status === 'healthy' ? 'bg-green-500' :
                  server.status === 'degraded' ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}></div>
                <span className="text-purple-800 dark:text-purple-200 font-medium">
                  {server.name}
                </span>
              </div>

              <div className="text-right text-sm text-gray-600 dark:text-gray-300">
                <div>
                  {server.uptime !== undefined && (
                    <span>{server.uptime.toFixed(2)}% uptime</span>
                  )}
                </div>
                <div>
                  {server.latency !== undefined && (
                    <span>{server.latency}ms</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-purple-100 dark:border-purple-800 text-xs text-gray-500 dark:text-gray-400">
          Last updated: {new Date(status.lastUpdated).toLocaleTimeString()}
        </div>
      </div>
    );
  }

  // Fallback loading state if we have status but still loading
  return (
    <div className={cn("bg-white dark:bg-purple-900/30 rounded-xl border border-purple-200 dark:border-purple-700 p-6", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-purple-800 dark:text-purple-200">
          System Status
        </h3>
        <StatusIndicator status="loading" showIcon={false} />
      </div>
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex items-center justify-between p-3 bg-purple-50/50 dark:bg-purple-950/30 rounded-lg border border-purple-100 dark:border-purple-800"
          >
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-gray-300 animate-pulse mr-3"></div>
              <div className="h-4 w-24 bg-gray-300 rounded animate-pulse"></div>
            </div>
            <div className="h-4 w-16 bg-gray-300 rounded animate-pulse"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

SystemStatusWidget.displayName = 'SystemStatusWidget';