/**
 * Notification Polling Hook
 *
 * Periodically fetches notifications from backend and updates the store.
 * Shows modal alerts for new VERY_IMPORTANT notifications.
 *
 * @module hooks/useNotificationPolling
 */

'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useNotificationStore } from '@/stores/notificationStore';
import apiClient from '@/services/api';

interface UseNotificationPollingOptions {
  enabled?: boolean;
  interval?: number; // milliseconds
  onNewNotification?: (notification: any) => void;
}

interface NotificationResponse {
  id: string;
  task_id: string;
  user_id: string;
  message: string;
  priority: string;
  created_at: string;
  read_at: string | null;
}

/**
 * Hook to poll notifications from backend and show alerts for new ones
 *
 * @param options - Polling configuration
 * @returns Polling status and control functions
 */
export function useNotificationPolling({
  enabled = true,
  interval = 30000, // 30 seconds default
  onNewNotification,
}: UseNotificationPollingOptions = {}) {
  const [isPolling, setIsPolling] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState<Date | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastNotificationIdsRef = useRef<Set<string>>(new Set());

  // Get store actions
  const addNotification = useNotificationStore((state) => state.addNotification);
  const existingNotifications = useNotificationStore((state) => state.notifications);

  /**
   * Fetch notifications from backend
   */
  const fetchNotifications = useCallback(async () => {
    if (!enabled) return;

    try {
      setIsPolling(true);
      setError(null);

      console.log('[NotificationPolling] Fetching notifications from backend...');

      // Fetch all notifications from backend
      const response = await apiClient.getNotifications(false);
      const backendNotifications: NotificationResponse[] = response.notifications || [];

      console.log('[NotificationPolling] Received', backendNotifications.length, 'notifications from backend');

      // Track current notification IDs from backend
      const currentIds = new Set(backendNotifications.map((n) => n.id));

      // Find new notifications (not in our last fetch)
      const newNotifications = backendNotifications.filter(
        (n) => !lastNotificationIdsRef.current.has(n.id)
      );

      console.log('[NotificationPolling] Found', newNotifications.length, 'new notifications');

      // Process each new notification
      for (const backendNotif of newNotifications) {
        // Transform backend notification to frontend format
        const notification = {
          id: backendNotif.id,
          taskId: backendNotif.task_id,
          message: backendNotif.message,
          timestamp: backendNotif.created_at,
          read: !!backendNotif.read_at,
          priority: backendNotif.priority as any,
        };

        // Add to store (with duplicate prevention built-in)
        addNotification(notification);

        // Trigger callback for VERY_IMPORTANT notifications
        if (backendNotif.priority === 'VERY_IMPORTANT') {
          console.log('[NotificationPolling] Triggering modal for VERY_IMPORTANT notification:', backendNotif.message);
          if (onNewNotification) {
            onNewNotification(notification);
          }
        }
      }

      // Update last known IDs
      lastNotificationIdsRef.current = currentIds;
      setLastFetchTime(new Date());
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsPolling(false);
    }
  }, [enabled, addNotification, onNewNotification]);

  /**
   * Initialize notification IDs on mount
   */
  useEffect(() => {
    // Initialize with existing notifications from store
    lastNotificationIdsRef.current = new Set(
      existingNotifications.map((n) => n.id)
    );
  }, []);

  /**
   * Start polling interval
   */
  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Fetch immediately on mount
    fetchNotifications();

    // Set up interval
    intervalRef.current = setInterval(fetchNotifications, interval);

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, interval, fetchNotifications]);

  /**
   * Manual refresh function
   */
  const refresh = useCallback(() => {
    return fetchNotifications();
  }, [fetchNotifications]);

  /**
   * Pause polling
   */
  const pause = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  /**
   * Resume polling
   */
  const resume = useCallback(() => {
    if (!intervalRef.current && enabled) {
      intervalRef.current = setInterval(fetchNotifications, interval);
    }
  }, [enabled, interval, fetchNotifications]);

  return {
    isPolling,
    lastFetchTime,
    error,
    refresh,
    pause,
    resume,
  };
}
