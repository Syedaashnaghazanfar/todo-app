/**
 * Notification Debugger Component
 *
 * Displays real-time notification system status for debugging.
 * Shows polling status, notification count, and recent activity.
 *
 * @module components/notifications/NotificationDebugger
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useNotificationStore } from '@/stores/notificationStore';
import { useNotificationPolling } from '@/hooks/useNotificationPolling';
import apiClient from '@/services/api';

export function NotificationDebugger() {
  const notifications = useNotificationStore((state) => state.notifications);
  const unreadCount = useNotificationStore((state) => state.unreadCount);
  const [backendCount, setBackendCount] = useState<number | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const { isPolling, lastFetchTime, error } = useNotificationPolling({
    enabled: false, // Don't double-poll
  });

  // Fetch backend notification count
  useEffect(() => {
    const fetchBackendCount = async () => {
      try {
        const response = await apiClient.getNotifications(false);
        setBackendCount(response.total_count);
        setLastError(null);
      } catch (err) {
        setLastError(err instanceof Error ? err.message : 'Unknown error');
        setBackendCount(null);
      }
    };

    fetchBackendCount();
    const interval = setInterval(fetchBackendCount, 10000); // Every 10 seconds

    return () => clearInterval(interval);
  }, []);

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 p-3 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 transition-colors z-50"
        title="Show Notification Debugger"
      >
        🐛
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-gray-900 text-white p-4 rounded-lg shadow-2xl z-50 max-h-96 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg">🔔 Notification Debugger</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </div>

      {/* Status */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-400">Polling Status:</span>
          <span className={isPolling ? 'text-green-400' : 'text-gray-400'}>
            {isPolling ? '🟢 Active' : '⚪ Idle'}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-400">Last Fetch:</span>
          <span className="text-white">
            {lastFetchTime ? new Date(lastFetchTime).toLocaleTimeString() : 'Never'}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-400">Store Count:</span>
          <span className="text-white">{notifications.length}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-400">Unread Count:</span>
          <span className="text-purple-400 font-bold">{unreadCount}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-400">Backend Count:</span>
          <span className="text-white">
            {backendCount !== null ? backendCount : '...'}
          </span>
        </div>

        {(error || lastError) && (
          <div className="mt-3 p-2 bg-red-900/50 rounded text-red-200 text-xs">
            <div className="font-bold">Error:</div>
            <div>{error?.message || lastError}</div>
          </div>
        )}
      </div>

      {/* Recent Notifications */}
      <div className="mt-4">
        <h4 className="font-semibold mb-2 text-gray-300">Recent Notifications:</h4>
        {notifications.length === 0 ? (
          <div className="text-gray-500 text-xs">No notifications</div>
        ) : (
          <div className="space-y-2">
            {notifications.slice(0, 5).map((notif) => (
              <div
                key={notif.id}
                className="p-2 bg-gray-800 rounded text-xs border-l-2"
                style={{
                  borderColor: notif.priority === 'VERY_IMPORTANT' ? '#a78bfa' : '#6b7280'
                }}
              >
                <div className="flex justify-between items-start">
                  <span className="font-semibold text-purple-400">
                    {notif.priority}
                  </span>
                  {!notif.read && (
                    <span className="text-purple-400">🔴 Unread</span>
                  )}
                </div>
                <div className="text-gray-300 mt-1">{notif.message}</div>
                <div className="text-gray-500 text-xs mt-1">
                  {new Date(notif.timestamp).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="mt-4 space-y-2">
        <button
          onClick={async () => {
            const { addNotification } = useNotificationStore.getState();
            addNotification({
              id: crypto.randomUUID(),
              taskId: crypto.randomUUID(),
              message: 'Test notification ' + Date.now(),
              timestamp: new Date().toISOString(),
              read: false,
              priority: 'VERY_IMPORTANT',
            });
          }}
          className="w-full px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded text-sm"
        >
          Add Test Notification
        </button>

        <button
          onClick={() => {
            const { clearNotifications } = useNotificationStore.getState();
            clearNotifications();
          }}
          className="w-full px-3 py-2 bg-red-600 hover:bg-red-700 rounded text-sm"
        >
          Clear All Notifications
        </button>
      </div>
    </div>
  );
}
