/**
 * Notification Sync Utilities
 *
 * Utilities for syncing notifications between backend and frontend store.
 * Provides immediate feedback without waiting for polling cycle.
 *
 * @module lib/notifications/notificationSync
 */

import apiClient from '@/services/api';
import { useNotificationStore } from '@/stores/notificationStore';

/**
 * Fetch and sync notifications from backend to store
 *
 * Useful for immediate updates after creating VERY_IMPORTANT tasks
 * without waiting for the polling cycle.
 *
 * @returns Promise that resolves when sync is complete
 */
export async function syncNotifications(): Promise<void> {
  try {
    // Fetch notifications from backend
    const response = await apiClient.getNotifications(false);
    const backendNotifications = response.notifications || [];

    // Get store actions
    const { addNotification } = useNotificationStore.getState();

    // Transform and add each notification
    for (const backendNotif of backendNotifications) {
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
    }
  } catch (error) {
    console.error('Failed to sync notifications:', error);
    // Don't throw - silent failure is acceptable for sync
  }
}

/**
 * Fetch unread count from backend
 *
 * @returns Promise that resolves with unread count
 */
export async function fetchUnreadCount(): Promise<number> {
  try {
    const response = await apiClient.getNotifications(true); // unread only
    return response.unread_count || 0;
  } catch (error) {
    console.error('Failed to fetch unread count:', error);
    return 0;
  }
}

/**
 * Check if a task qualifies for notification
 *
 * Returns true if task should trigger a notification based on:
 * - Priority is VERY_IMPORTANT
 * - Has a due date within 6 hours
 *
 * @param priority - Task priority
 * @param dueDate - Task due date (ISO string)
 * @returns true if task qualifies for notification
 */
export function shouldNotifyForTask(
  priority: string,
  dueDate?: string
): boolean {
  if (priority !== 'VERY_IMPORTANT') {
    return false;
  }

  if (!dueDate) {
    return false;
  }

  const now = new Date();
  const due = new Date(dueDate);
  const diffMs = due.getTime() - now.getTime();
  const sixHoursMs = 6 * 60 * 60 * 1000;

  return diffMs >= 0 && diffMs <= sixHoursMs;
}
