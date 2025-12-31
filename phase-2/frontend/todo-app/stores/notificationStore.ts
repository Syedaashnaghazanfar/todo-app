/**
 * Notification Store (Zustand)
 *
 * Manages notification state with localStorage persistence. Provides actions for
 * notification management with automatic 50-item FIFO limit enforcement.
 *
 * @module stores/notificationStore
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { devtools } from 'zustand/middleware';
import type { Notification } from '@/types/notification.types';
import { NOTIFICATION_CONFIG } from '@/types/notification.types';

/**
 * Notification store state interface
 */
interface NotificationState {
  // State
  notifications: Notification[];
  unreadCount: number;

  // Actions
  addNotification: (notification: Notification) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  deleteNotificationsByTaskId: (taskId: string) => void;
  clearNotifications: () => void;
  getUnreadNotifications: () => Notification[];
  getAllNotifications: () => Notification[];
  getNotificationsByTaskId: (taskId: string) => Notification[];
}

/**
 * Custom localStorage storage for Zustand persist middleware
 *
 * Wraps native localStorage with error handling to prevent crashes
 * when localStorage is unavailable or quota is exceeded.
 */
const customStorage = createJSONStorage(() => ({
  getItem: (name: string) => {
    try {
      const item = localStorage.getItem(name);
      return item;
    } catch (error) {
      console.error('Failed to get item from localStorage:', error);
      return null;
    }
  },
  setItem: (name: string, value: string) => {
    try {
      localStorage.setItem(name, value);
    } catch (error) {
      console.error('Failed to set item in localStorage:', error);
      if (
        error instanceof DOMException &&
        (error.name === 'QuotaExceededError' || (error as { code?: number }).code === 22)
      ) {
        console.warn(
          'localStorage quota exceeded for notifications. Consider clearing old notifications.'
        );
      }
    }
  },
  removeItem: (name: string) => {
    try {
      localStorage.removeItem(name);
    } catch (error) {
      console.error('Failed to remove item from localStorage:', error);
    }
  },
}));

/**
 * Calculate unread notification count
 *
 * @param notifications - Array of notifications
 * @returns Number of unread notifications
 */
function calculateUnreadCount(notifications: Notification[]): number {
  return notifications.filter((n) => !n.read).length;
}

/**
 * Enforce 50-notification limit (FIFO queue)
 *
 * @param notifications - Array of notifications
 * @returns Array with at most 50 notifications (oldest removed first)
 */
function enforceNotificationLimit(notifications: Notification[]): Notification[] {
  if (notifications.length <= NOTIFICATION_CONFIG.MAX_NOTIFICATIONS) {
    return notifications;
  }

  // Sort by timestamp (oldest first) and remove oldest
  const sorted = [...notifications].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  return sorted.slice(sorted.length - NOTIFICATION_CONFIG.MAX_NOTIFICATIONS);
}

/**
 * Notification store with localStorage persistence
 *
 * Storage key: 'notifications'
 * Persists: notifications array
 * Limit: 50 notifications (FIFO queue, oldest removed first)
 *
 * Usage:
 * ```typescript
 * const { notifications, unreadCount, addNotification, markAsRead } = useNotificationStore();
 * ```
 */
export const useNotificationStore = create<NotificationState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial State
        notifications: [],
        unreadCount: 0,

        // Actions
        addNotification: (notification: Notification) => {
          set(
            (state) => {
              // Check for duplicate (same task, within 10-minute window)
              const existingNotification = state.notifications.find(
                (n) =>
                  n.taskId === notification.taskId &&
                  new Date(notification.timestamp).getTime() -
                    new Date(n.timestamp).getTime() <
                    NOTIFICATION_CONFIG.DUPLICATE_PREVENTION_WINDOW
              );

              if (existingNotification) {
                console.log(
                  `Duplicate notification prevented for task ${notification.taskId}`
                );
                return state;
              }

              // Add notification and enforce limit
              const updatedNotifications = enforceNotificationLimit([
                ...state.notifications,
                notification,
              ]);

              return {
                notifications: updatedNotifications,
                unreadCount: calculateUnreadCount(updatedNotifications),
              };
            },
            false,
            'addNotification'
          );
        },

        markAsRead: (id: string) => {
          set(
            (state) => {
              const updatedNotifications = state.notifications.map((n) =>
                n.id === id ? { ...n, read: true } : n
              );

              return {
                notifications: updatedNotifications,
                unreadCount: calculateUnreadCount(updatedNotifications),
              };
            },
            false,
            'markAsRead'
          );
        },

        markAllAsRead: () => {
          set(
            (state) => ({
              notifications: state.notifications.map((n) => ({ ...n, read: true })),
              unreadCount: 0,
            }),
            false,
            'markAllAsRead'
          );
        },

        deleteNotification: (id: string) => {
          set(
            (state) => {
              const updatedNotifications = state.notifications.filter(
                (n) => n.id !== id
              );

              return {
                notifications: updatedNotifications,
                unreadCount: calculateUnreadCount(updatedNotifications),
              };
            },
            false,
            'deleteNotification'
          );
        },

        deleteNotificationsByTaskId: (taskId: string) => {
          set(
            (state) => {
              const updatedNotifications = state.notifications.filter(
                (n) => n.taskId !== taskId
              );

              return {
                notifications: updatedNotifications,
                unreadCount: calculateUnreadCount(updatedNotifications),
              };
            },
            false,
            'deleteNotificationsByTaskId'
          );
        },

        clearNotifications: () => {
          set(
            {
              notifications: [],
              unreadCount: 0,
            },
            false,
            'clearNotifications'
          );
        },

        getUnreadNotifications: () => {
          return get().notifications.filter((n) => !n.read);
        },

        getAllNotifications: () => {
          return get().notifications;
        },

        getNotificationsByTaskId: (taskId: string) => {
          return get().notifications.filter((n) => n.taskId === taskId);
        },
      }),
      {
        name: 'notifications', // localStorage key
        storage: customStorage,
        partialize: (state) => ({
          notifications: state.notifications,
          // unreadCount is computed on hydration
        }),
        // Recompute unreadCount after hydration
        onRehydrateStorage: () => (state) => {
          if (state) {
            state.unreadCount = calculateUnreadCount(state.notifications);
          }
        },
      }
    ),
    { name: 'NotificationStore' }
  )
);

/**
 * Selector hook for getting unread count
 */
export const useUnreadCount = () =>
  useNotificationStore((state) => state.unreadCount);

/**
 * Selector hook for getting unread notifications
 */
export const useUnreadNotifications = () =>
  useNotificationStore((state) => state.notifications.filter((n) => !n.read));

/**
 * Selector hook for getting notification count
 */
export const useNotificationCount = () =>
  useNotificationStore((state) => state.notifications.length);

/**
 * Selector hook for checking if notifications limit is reached
 */
export const useIsNotificationLimitReached = () =>
  useNotificationStore(
    (state) => state.notifications.length >= NOTIFICATION_CONFIG.MAX_NOTIFICATIONS
  );
