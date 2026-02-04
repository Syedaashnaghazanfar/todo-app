/**
 * Notification Provider Component
 *
 * Global provider that handles notification polling and displays alerts
 * for new VERY_IMPORTANT notifications. Wrap your app with this component.
 *
 * @module components/notifications/NotificationProvider
 */

'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useNotificationPolling } from '@/hooks/useNotificationPolling';
import { NotificationModal } from './NotificationModal';

interface NotificationProviderProps {
  children: React.ReactNode;
  enabled?: boolean;
  pollingInterval?: number;
}

interface PendingNotification {
  id: string;
  taskId: string;
  message: string;
  priority: string;
}

export function NotificationProvider({
  children,
  enabled = true,
  pollingInterval = 30000, // 30 seconds
}: NotificationProviderProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [pendingNotification, setPendingNotification] = useState<PendingNotification | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Log authentication status
  useEffect(() => {
    console.log('[NotificationProvider] Auth status:', { isAuthenticated, isLoading });
  }, [isAuthenticated, isLoading]);

  /**
   * Handle new notification from polling hook
   */
  const handleNewNotification = useCallback((notification: any) => {
    // Only show modal for VERY_IMPORTANT notifications
    if (notification.priority === 'VERY_IMPORTANT') {
      setPendingNotification({
        id: notification.id,
        taskId: notification.taskId,
        message: notification.message,
        priority: notification.priority,
      });
      setIsModalOpen(true);
    }
  }, []);

  /**
   * Initialize polling - only when authenticated
   */
  useNotificationPolling({
    enabled: enabled && isAuthenticated && !isLoading,
    interval: pollingInterval,
    onNewNotification: handleNewNotification,
  });

  /**
   * Close modal
   */
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setPendingNotification(null);
  };

  /**
   * Navigate to notifications page
   */
  const handleViewAll = () => {
    router.push('/notifications');
  };

  return (
    <>
      {children}

      {/* Notification Alert Modal */}
      {pendingNotification && (
        <NotificationModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title="Important Task Alert!"
          message={pendingNotification.message}
          priority={pendingNotification.priority as any}
          onViewAll={handleViewAll}
        />
      )}
    </>
  );
}
