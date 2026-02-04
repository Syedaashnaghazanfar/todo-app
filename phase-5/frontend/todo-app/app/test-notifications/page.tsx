/**
 * Notification Test Page
 *
 * Test page for debugging and verifying notification system.
 * Shows real-time status and allows manual testing.
 *
 * @module app/test-notifications/page
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useNotificationStore } from '@/stores/notificationStore';
import { useNotificationPolling } from '@/hooks/useNotificationPolling';
import apiClient from '@/services/api';
import { NotificationModal } from '@/components/notifications/NotificationModal';
import { useRouter } from 'next/navigation';

export default function TestNotificationsPage() {
  const router = useRouter();
  const notifications = useNotificationStore((state) => state.notifications);
  const unreadCount = useNotificationStore((state) => state.unreadCount);
  const addNotification = useNotificationStore((state) => state.addNotification);
  const clearNotifications = useNotificationStore((state) => state.clearNotifications);

  const [backendNotifications, setBackendNotifications] = useState<any[]>([]);
  const [backendError, setBackendError] = useState<string | null>(null);
  const [showTestModal, setShowTestModal] = useState(false);
  const [testTaskData, setTestTaskData] = useState({
    title: 'URGENT: Test notification task',
    due_hours: 3,
  });

  const { isPolling, lastFetchTime, error: pollingError } = useNotificationPolling({
    enabled: false, // Don't interfere with global polling
  });

  // Fetch backend notifications
  const fetchBackendNotifications = async () => {
    try {
      const response = await apiClient.getNotifications(false);
      setBackendNotifications(response.notifications || []);
      setBackendError(null);
    } catch (err) {
      setBackendError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  useEffect(() => {
    fetchBackendNotifications();
  }, []);

  // Create test task
  const createTestTask = async () => {
    try {
      const dueDate = new Date();
      dueDate.setHours(dueDate.getHours() + testTaskData.due_hours);

      await apiClient.createTask(
        testTaskData.title,
        'This is a test task to trigger notifications',
        dueDate.toISOString(),
        ['Urgent']
      );

      alert('Test task created! Check if notification appears.');

      // Refresh after 2 seconds
      setTimeout(fetchBackendNotifications, 2000);
    } catch (err) {
      alert('Error creating task: ' + (err instanceof Error ? err.message : 'Unknown'));
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-900 text-white">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
          🔔 Notification System Test Page
        </h1>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="p-6 bg-gray-800 rounded-lg border border-purple-500/30">
            <div className="text-gray-400 text-sm mb-2">Frontend Store</div>
            <div className="text-4xl font-bold text-purple-400">{notifications.length}</div>
            <div className="text-gray-400 text-sm mt-2">Total Notifications</div>
          </div>

          <div className="p-6 bg-gray-800 rounded-lg border border-pink-500/30">
            <div className="text-gray-400 text-sm mb-2">Unread Count</div>
            <div className="text-4xl font-bold text-pink-400">{unreadCount}</div>
            <div className="text-gray-400 text-sm mt-2">Unread Notifications</div>
          </div>

          <div className="p-6 bg-gray-800 rounded-lg border border-blue-500/30">
            <div className="text-gray-400 text-sm mb-2">Backend Count</div>
            <div className="text-4xl font-bold text-blue-400">{backendNotifications.length}</div>
            <div className="text-gray-400 text-sm mt-2">From API</div>
          </div>
        </div>

        {/* Polling Status */}
        <div className="p-6 bg-gray-800 rounded-lg mb-8">
          <h2 className="text-xl font-bold mb-4">Polling Status</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Is Polling:</span>
              <span className={isPolling ? 'text-green-400' : 'text-gray-400'}>
                {isPolling ? '🟢 Active' : '⚪ Idle'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Last Fetch:</span>
              <span>{lastFetchTime ? new Date(lastFetchTime).toLocaleTimeString() : 'Never'}</span>
            </div>
            {pollingError && (
              <div className="mt-3 p-3 bg-red-900/50 rounded text-red-200">
                <div className="font-bold">Polling Error:</div>
                <div className="text-sm">{pollingError.message}</div>
              </div>
            )}
          </div>
        </div>

        {/* Test Actions */}
        <div className="p-6 bg-gray-800 rounded-lg mb-8">
          <h2 className="text-xl font-bold mb-4">Test Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Create Test Task */}
            <div className="p-4 bg-gray-700 rounded">
              <h3 className="font-bold mb-3">Create VERY_IMPORTANT Task</h3>
              <input
                type="text"
                value={testTaskData.title}
                onChange={(e) => setTestTaskData({ ...testTaskData, title: e.target.value })}
                className="w-full px-3 py-2 bg-gray-600 rounded mb-2"
                placeholder="Task title"
              />
              <input
                type="number"
                value={testTaskData.due_hours}
                onChange={(e) => setTestTaskData({ ...testTaskData, due_hours: parseInt(e.target.value) })}
                className="w-full px-3 py-2 bg-gray-600 rounded mb-2"
                placeholder="Hours until due"
              />
              <button
                onClick={createTestTask}
                className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded"
              >
                Create Task
              </button>
            </div>

            {/* Manual Store Actions */}
            <div className="p-4 bg-gray-700 rounded">
              <h3 className="font-bold mb-3">Manual Store Actions</h3>
              <button
                onClick={() => {
                  addNotification({
                    id: crypto.randomUUID(),
                    taskId: crypto.randomUUID(),
                    message: `Test notification at ${new Date().toLocaleTimeString()}`,
                    timestamp: new Date().toISOString(),
                    read: false,
                    priority: 'VERY_IMPORTANT',
                  });
                }}
                className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 rounded mb-2"
              >
                Add Test Notification to Store
              </button>
              <button
                onClick={() => setShowTestModal(true)}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded mb-2"
              >
                Show Test Modal
              </button>
              <button
                onClick={clearNotifications}
                className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 rounded"
              >
                Clear All Notifications
              </button>
            </div>
          </div>
        </div>

        {/* Backend Notifications */}
        <div className="p-6 bg-gray-800 rounded-lg mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Backend Notifications</h2>
            <button
              onClick={fetchBackendNotifications}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded text-sm"
            >
              Refresh
            </button>
          </div>
          {backendError ? (
            <div className="p-4 bg-red-900/50 rounded text-red-200">
              <div className="font-bold">Error:</div>
              <div className="text-sm">{backendError}</div>
            </div>
          ) : backendNotifications.length === 0 ? (
            <div className="text-gray-400">No notifications from backend</div>
          ) : (
            <div className="space-y-2">
              {backendNotifications.map((notif) => (
                <div
                  key={notif.id}
                  className="p-3 bg-gray-700 rounded border-l-4"
                  style={{ borderColor: notif.priority === 'VERY_IMPORTANT' ? '#a78bfa' : '#6b7280' }}
                >
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-purple-400">{notif.priority}</span>
                    {!notif.read_at && <span className="text-pink-400">🔴 Unread</span>}
                  </div>
                  <div className="text-white mt-1">{notif.message}</div>
                  <div className="text-gray-400 text-sm mt-1">
                    Created: {new Date(notif.created_at).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Frontend Store Notifications */}
        <div className="p-6 bg-gray-800 rounded-lg mb-8">
          <h2 className="text-xl font-bold mb-4">Frontend Store Notifications</h2>
          {notifications.length === 0 ? (
            <div className="text-gray-400">No notifications in store</div>
          ) : (
            <div className="space-y-2">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className="p-3 bg-gray-700 rounded border-l-4"
                  style={{ borderColor: notif.priority === 'VERY_IMPORTANT' ? '#a78bfa' : '#6b7280' }}
                >
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-purple-400">{notif.priority}</span>
                    {!notif.read && <span className="text-pink-400">🔴 Unread</span>}
                  </div>
                  <div className="text-white mt-1">{notif.message}</div>
                  <div className="text-gray-400 text-sm mt-1">
                    {new Date(notif.timestamp).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Back Button */}
        <button
          onClick={() => router.push('/')}
          className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded"
        >
          ← Back to Dashboard
        </button>
      </div>

      {/* Test Modal */}
      <NotificationModal
        isOpen={showTestModal}
        onClose={() => setShowTestModal(false)}
        title="Test Notification Modal"
        message="This is a test notification to verify the modal is working correctly!"
        priority="VERY_IMPORTANT"
        onViewAll={() => {
          setShowTestModal(false);
          router.push('/notifications');
        }}
      />
    </div>
  );
}
