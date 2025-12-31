/**
 * Notifications Page
 *
 * Displays all notifications for the user with mark as read functionality.
 *
 * Features:
 * - List all notifications
 * - Filter: All / Unread / Read
 * - Mark as read on click
 * - Mark all as read button
 * - Empty state
 * - Loading state
 *
 * @module app/notifications/page
 */

'use client';

import React, { useEffect, useState } from 'react';
import { ArrowLeft, Bell, CheckCheck, Inbox } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import apiClient from '@/services/api';

interface Notification {
  id: string;
  task_id: string;
  message: string;
  priority: string;
  created_at: string;
  read_at: string | null;
}

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [unreadCount, setUnreadCount] = useState(0);

  /**
   * Fetch notifications from backend
   */
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getNotifications(filter === 'unread');
      setNotifications(response.notifications);
      setUnreadCount(response.unread_count);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      Swal.fire({
        icon: 'error',
        title: 'Error Loading Notifications',
        text: err instanceof Error ? err.message : 'Failed to fetch notifications',
        confirmButtonColor: '#8B5CF6',
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch notifications on mount
   */
  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  /**
   * Mark notification as read
   */
  const markAsRead = async (id: string) => {
    try {
      await apiClient.markNotificationAsRead(id);
      // Refresh notifications
      await fetchNotifications();
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  /**
   * Mark all notifications as read
   */
  const markAllAsRead = async () => {
    try {
      await apiClient.markAllNotificationsAsRead();
      Swal.fire({
        icon: 'success',
        title: 'All Marked as Read',
        text: 'All notifications have been marked as read.',
        timer: 2000,
        showConfirmButton: false,
        toast: true,
        position: 'top-end',
      });
      await fetchNotifications();
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  /**
   * Filter notifications by read status
   */
  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return !n.read_at;
    if (filter === 'read') return !!n.read_at;
    return true;
  });

  /**
   * Format timestamp
   */
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => router.push('/')}
          className="mb-6 flex items-center gap-2 var(--accent-notifications) dark:text-[var(--accent-notifications)] hover:var(--accent-notifications) dark:hover:var(--accent-notifications) font-medium transition-colors group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </motion.button>

        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-10"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-gradient-to-br from-[var(--accent-notifications)] to-[var(--accent-notifications-hover)] rounded-xl shadow-lg">
              <Bell className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1
                className="text-5xl font-bold text-white"
                style={{
                  background: 'linear-gradient(135deg, var(--accent-notifications), #ec4899)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Notifications
              </h1>
              <p className="text-[var(--text-secondary)] dark:text-[var(--text-secondary)] mt-1">
                Stay updated on your important tasks
              </p>
            </div>
          </div>

          {/* Stats and Actions */}
          <div className="flex items-center justify-between gap-4 mt-6">
            <div className="flex gap-4">
              <div className="text-sm text-[var(--text-secondary)] dark:text-[var(--text-secondary)]">
                <span className="font-semibold text-gray-900 dark:text-gray-100">{filteredNotifications.length}</span> notifications
                {unreadCount > 0 && (
                  <span className="ml-2 inline-flex items-center px-2 py-1 text-xs font-semibold var(--accent-notifications) bg-[var(--accent-notifications-muted)] rounded-full">
                    {unreadCount} unread
                  </span>
                )}
              </div>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium var(--accent-notifications) hover:var(--accent-notifications) hover:bg-purple-50 rounded-lg transition-colors"
              >
                <CheckCheck size={16} />
                Mark all as read
              </button>
            )}
          </div>
        </motion.div>

        {/* Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6 flex gap-2 dark:bg-gray-800 dark:bg-gray-800 p-2 rounded-xl border border-[var(--border)] dark:border-[var(--border)] shadow-md"
        >
          {(['all', 'unread', 'read'] as const).map((filterOption) => (
            <button
              key={filterOption}
              onClick={() => setFilter(filterOption)}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                filter === filterOption
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                  : 'text-[var(--text-secondary)] dark:text-[var(--text-secondary)] hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
            </button>
          ))}
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-purple-600 border-r-transparent mb-3" />
              <p className="text-sm text-[var(--text-secondary)]">Loading notifications...</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredNotifications.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="dark:bg-gray-800 dark:bg-gray-800 p-12 rounded-xl border border-[var(--border)] dark:border-[var(--border)] shadow-md text-center"
          >
            <Inbox size={64} className="mx-auto var(--accent-notifications) mb-4" />
            <h3
              className="text-xl font-semibold mb-2 text-white"
              style={{
                background: 'linear-gradient(135deg, var(--accent-notifications), #ec4899)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {filter === 'all' ? 'No notifications yet' : `No ${filter} notifications`}
            </h3>
            <p className="text-sm text-[var(--text-secondary)] dark:text-[var(--text-secondary)]">
              {filter === 'all'
                ? "You'll receive notifications for VERY IMPORTANT tasks due within 6 hours."
                : `Switch to "All" to see all notifications.`}
            </p>
          </motion.div>
        )}

        {/* Notifications List */}
        {!loading && filteredNotifications.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-3"
          >
            {filteredNotifications.map((notification, index) => {
              const isUnread = !notification.read_at;
              const isVeryImportant = notification.priority === 'VERY_IMPORTANT';

              return (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                  onClick={() => isUnread && markAsRead(notification.id)}
                  className={`p-4 rounded-xl border shadow-sm transition-all cursor-pointer ${
                    isUnread
                      ? 'dark:bg-gray-800 dark:bg-gray-800 border-purple-200 dark:border-purple-800 hover:shadow-md'
                      : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 opacity-70'
                  } ${isVeryImportant && isUnread ? 'ring-2 ring-purple-300' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div
                      className={`p-2 rounded-lg ${
                        isVeryImportant ? 'bg-[var(--accent-notifications-muted)] dark:bg-purple-900' : 'bg-gray-100 dark:bg-gray-800'
                      }`}
                    >
                      <Bell
                        size={20}
                        className={isVeryImportant ? 'var(--accent-notifications) dark:text-[var(--accent-notifications)]' : 'text-[var(--text-secondary)] dark:text-gray-400'}
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm mb-1 ${
                          isUnread
                            ? 'text-gray-900 dark:text-gray-100 font-semibold'
                            : 'text-[var(--text-secondary)] dark:text-gray-400'
                        }`}
                      >
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{formatTime(notification.created_at)}</p>
                    </div>

                    {/* Unread indicator */}
                    {isUnread && (
                      <div className="w-2 h-2 bg-purple-600 rounded-full flex-shrink-0 mt-1.5" />
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
}
