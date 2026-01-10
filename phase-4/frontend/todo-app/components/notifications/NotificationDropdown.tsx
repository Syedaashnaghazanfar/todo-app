/**
 * Notification Dropdown Component
 *
 * Dropdown panel showing recent notifications with mark as read functionality.
 * Displayed when clicking the bell icon in TopBar.
 *
 * @module components/notifications/NotificationDropdown
 */

'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCheck, Inbox, AlertCircle, Clock, ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useNotificationStore } from '@/stores/notificationStore';
import apiClient from '@/services/api';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationDropdown({ isOpen, onClose }: NotificationDropdownProps) {
  const router = useRouter();
  const notifications = useNotificationStore((state) => state.notifications);
  const markAsRead = useNotificationStore((state) => state.markAsRead);
  const unreadCount = useNotificationStore((state) => state.unreadCount);

  // Show only the 5 most recent notifications
  const recentNotifications = [...notifications]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);

  /**
   * Mark notification as read (both store and backend)
   */
  const handleMarkAsRead = async (id: string) => {
    try {
      // Update store immediately
      markAsRead(id);

      // Sync with backend
      await apiClient.markNotificationAsRead(id);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  /**
   * Mark all as read
   */
  const handleMarkAllAsRead = async () => {
    try {
      await apiClient.markAllNotificationsAsRead();

      // Update store
      const markAllAsRead = useNotificationStore.getState().markAllAsRead;
      markAllAsRead();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  /**
   * Navigate to notifications page
   */
  const handleViewAll = () => {
    onClose();
    router.push('/notifications');
  };

  /**
   * Format relative time
   */
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  /**
   * Get priority icon
   */
  const getPriorityIcon = (priority: string) => {
    if (priority === 'VERY_IMPORTANT') {
      return <AlertCircle className="w-4 h-4 text-pink-400" />;
    }
    return <Bell className="w-4 h-4 text-purple-400" />;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop for mobile */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-transparent z-40 lg:hidden"
          />

          {/* Dropdown Panel */}
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute right-0 top-full mt-2 w-96 max-w-[calc(100vw-2rem)] z-50 rounded-xl shadow-2xl overflow-hidden"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-purple-400" />
                <h3 className="font-semibold text-text-primary">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-purple-500/20 text-purple-400">
                    {unreadCount}
                  </span>
                )}
              </div>

              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs text-purple-400 hover:text-purple-300 font-medium flex items-center gap-1"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Mark all read
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {recentNotifications.length === 0 ? (
                /* Empty State */
                <div className="p-8 text-center">
                  <Inbox className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                  <p className="text-sm text-text-secondary">No notifications yet</p>
                  <p className="text-xs text-text-muted mt-1">
                    You'll be notified about important tasks
                  </p>
                </div>
              ) : (
                /* Notification Items */
                recentNotifications.map((notification, index) => {
                  const isUnread = !notification.read;
                  const isVeryImportant = notification.priority === 'VERY_IMPORTANT';

                  return (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => isUnread && handleMarkAsRead(notification.id)}
                      className={`p-4 border-b border-[var(--border)] cursor-pointer transition-all hover:bg-[var(--bg-elevated)] ${
                        isUnread ? 'bg-[var(--bg-card)]' : 'bg-[var(--bg-dark)] opacity-60'
                      } ${isVeryImportant && isUnread ? 'border-l-4 border-l-purple-500' : ''}`}
                    >
                      <div className="flex gap-3">
                        {/* Icon */}
                        <div
                          className={`p-2 rounded-lg flex-shrink-0 ${
                            isVeryImportant ? 'bg-purple-500/20' : 'bg-[var(--bg-elevated)]'
                          }`}
                        >
                          {getPriorityIcon(notification.priority)}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm mb-1 ${
                              isUnread ? 'text-text-primary font-medium' : 'text-text-secondary'
                            }`}
                          >
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-2">
                            <Clock className="w-3 h-3 text-text-muted" />
                            <span className="text-xs text-text-muted">
                              {formatTime(notification.timestamp)}
                            </span>
                          </div>
                        </div>

                        {/* Unread indicator */}
                        {isUnread && (
                          <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0 mt-1.5" />
                        )}
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            {recentNotifications.length > 0 && (
              <div className="p-3 border-t border-[var(--border)] bg-[var(--bg-elevated)]">
                <button
                  onClick={handleViewAll}
                  className="w-full px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 text-purple-400 hover:text-purple-300 hover:bg-[var(--bg-card)]"
                >
                  View all notifications
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
