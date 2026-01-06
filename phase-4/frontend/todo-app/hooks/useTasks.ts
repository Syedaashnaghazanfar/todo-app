/**
 * useTasks Hook
 *
 * Manages tasks via backend API using the apiClient service.
 *
 * Features:
 * - Fetch all tasks from backend API
 * - Create new task with backend API
 * - Update existing task with backend API
 * - Delete task with backend API
 * - Toggle task status (NOT_STARTED → IN_PROGRESS → COMPLETED)
 * - Automatic cookie-based authentication
 * - Error handling with SweetAlert2
 * - Loading states
 *
 * @module hooks/useTasks
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Swal from 'sweetalert2';
import apiClient from '@/services/api';
import type { Task as APITask } from '@/services/api';
import type { Task, TaskStatus, Priority } from '@/types/task.types';

/**
 * Task creation data (without auto-computed fields)
 */
export interface CreateTaskData {
  title: string;
  description?: string;
  due_date?: string;
  tags?: string[];
}

/**
 * Task update data (partial updates)
 */
export interface UpdateTaskData {
  title?: string;
  description?: string;
  due_date?: string;
  tags?: string[];
  status?: TaskStatus;
}

/**
 * useTasks hook return type
 */
export interface UseTasksReturn {
  // State
  tasks: Task[];
  loading: boolean;
  error: string | null;

  // Actions
  createTask: (data: CreateTaskData) => Promise<void>;
  updateTask: (id: string, updates: UpdateTaskData) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTaskStatus: (id: string) => Promise<void>;
  refreshTasks: () => Promise<void>;
}

/**
 * Convert API task (snake_case) to frontend task (camelCase)
 */
function convertApiTaskToFrontend(apiTask: APITask): Task {
  return {
    id: apiTask.id,
    title: apiTask.title,
    description: apiTask.description || undefined,
    priority: apiTask.priority as Priority,
    status: apiTask.status as TaskStatus,
    tags: apiTask.tags || [],
    dueDate: apiTask.due_date || undefined,
    createdAt: apiTask.created_at,
    updatedAt: apiTask.updated_at,
  };
}

/**
 * Custom hook for task management with backend API integration
 *
 * Fetches tasks from backend API and provides CRUD operations.
 *
 * @example
 * const { tasks, loading, createTask, updateTask, deleteTask, toggleTaskStatus } = useTasks();
 *
 * // Create new task
 * await createTask({
 *   title: 'Urgent: Fix production bug',
 *   due_date: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
 *   tags: ['Work', 'Urgent'],
 * });
 *
 * // Update task
 * await updateTask(taskId, {
 *   title: 'Normal: Fix bug',
 *   status: 'IN_PROGRESS',
 * });
 *
 * // Toggle status: NOT_STARTED → IN_PROGRESS → COMPLETED → NOT_STARTED
 * await toggleTaskStatus(taskId);
 *
 * @returns Task management methods and state
 */
export function useTasks(): UseTasksReturn {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch all tasks from backend API
   */
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const apiTasks = await apiClient.getTasks();

      // Convert API tasks to frontend format
      const convertedTasks: Task[] = apiTasks.map(convertApiTaskToFrontend);

      setTasks(convertedTasks);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch tasks';
      setError(errorMessage);
      console.error('Error fetching tasks:', err);

      // Show error to user
      Swal.fire({
        icon: 'error',
        title: 'Error Loading Tasks',
        text: errorMessage,
        confirmButtonColor: '#8B5CF6',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch tasks on mount - only if authenticated
   */
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  
  useEffect(() => {
    // Only fetch tasks if authentication is confirmed
    if (!authLoading && isAuthenticated) {
      fetchTasks();
    }
  }, [fetchTasks, isAuthenticated, authLoading]);

  /**
   * Create new task via backend API
   */
  const createTask = useCallback(
    async (data: CreateTaskData): Promise<void> => {
      try {
        setLoading(true);

        const createdTask = await apiClient.createTask(
          data.title,
          data.description,
          data.due_date,
          data.tags
        );

        // Convert to frontend format
        const convertedTask = convertApiTaskToFrontend(createdTask);

        // Add to tasks list
        setTasks((prev) => [convertedTask, ...prev]);

        // Show success message
        Swal.fire({
          icon: 'success',
          title: 'Task Created!',
          text: `"${createdTask.title}" has been created with ${createdTask.priority} priority.`,
          timer: 2000,
          showConfirmButton: false,
          toast: true,
          position: 'top-end',
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to create task';
        setError(errorMessage);
        console.error('Error creating task:', err);

        Swal.fire({
          icon: 'error',
          title: 'Error Creating Task',
          text: errorMessage,
          confirmButtonColor: '#8B5CF6',
        });
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Update task via backend API
   */
  const updateTask = useCallback(
    async (id: string, updates: UpdateTaskData): Promise<void> => {
      try {
        setLoading(true);

        const updatedTask = await apiClient.updateTask(id, {
          ...(updates.title && { title: updates.title }),
          ...(updates.description !== undefined && { description: updates.description }),
          ...(updates.due_date !== undefined && { due_date: updates.due_date }),
          ...(updates.tags && { tags: updates.tags }),
          ...(updates.status && { status: updates.status }),
        });

        // Convert to frontend format
        const convertedTask = convertApiTaskToFrontend(updatedTask);

        // Update tasks list
        setTasks((prev) => prev.map((task) => (task.id === id ? convertedTask : task)));

        // Show success message
        Swal.fire({
          icon: 'success',
          title: 'Task Updated!',
          text: `"${updatedTask.title}" has been updated.`,
          timer: 2000,
          showConfirmButton: false,
          toast: true,
          position: 'top-end',
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to update task';
        setError(errorMessage);
        console.error('Error updating task:', err);

        Swal.fire({
          icon: 'error',
          title: 'Error Updating Task',
          text: errorMessage,
          confirmButtonColor: '#8B5CF6',
        });
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Delete task via backend API
   */
  const deleteTask = useCallback(
    async (id: string): Promise<void> => {
      // Find task for confirmation message
      const task = tasks.find((t) => t.id === id);
      const taskTitle = task?.title || 'this task';

      // Confirm deletion
      const result = await Swal.fire({
        title: 'Delete Task?',
        text: `Are you sure you want to delete "${taskTitle}"? This action cannot be undone.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#EF4444',
        cancelButtonColor: '#6B7280',
        confirmButtonText: 'Yes, delete it',
        cancelButtonText: 'Cancel',
      });

      if (!result.isConfirmed) {
        return;
      }

      try {
        setLoading(true);

        await apiClient.deleteTask(id);

        // Remove from tasks list
        setTasks((prev) => prev.filter((task) => task.id !== id));

        // Show success message
        Swal.fire({
          icon: 'success',
          title: 'Task Deleted!',
          text: `"${taskTitle}" has been deleted.`,
          timer: 2000,
          showConfirmButton: false,
          toast: true,
          position: 'top-end',
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to delete task';
        setError(errorMessage);
        console.error('Error deleting task:', err);

        Swal.fire({
          icon: 'error',
          title: 'Error Deleting Task',
          text: errorMessage,
          confirmButtonColor: '#8B5CF6',
        });
      } finally {
        setLoading(false);
      }
    },
    [tasks]
  );

  /**
   * Toggle task status: COMPLETED ↔ NOT_STARTED (using dedicated backend endpoints)
   */
  const toggleTaskStatus = useCallback(
    async (id: string): Promise<void> => {
      const task = tasks.find((t) => t.id === id);
      if (!task) return;

      try {
        setLoading(true);

        // Use dedicated complete/incomplete endpoints
        let updatedTask: APITask;
        if (task.status === 'COMPLETED') {
          // Mark as incomplete
          updatedTask = await apiClient.incompleteTask(id);
        } else {
          // Mark as complete (from NOT_STARTED or IN_PROGRESS)
          updatedTask = await apiClient.completeTask(id);
        }

        // Convert to frontend format
        const convertedTask = convertApiTaskToFrontend(updatedTask);

        // Update tasks list
        setTasks((prev) => prev.map((t) => (t.id === id ? convertedTask : t)));

        // Show success message
        const statusMessage = convertedTask.status === 'COMPLETED' ? 'completed' : 'marked as incomplete';
        Swal.fire({
          icon: 'success',
          title: `Task ${statusMessage}!`,
          text: `"${convertedTask.title}" has been ${statusMessage}.`,
          timer: 2000,
          showConfirmButton: false,
          toast: true,
          position: 'top-end',
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to toggle task status';
        setError(errorMessage);
        console.error('Error toggling task status:', err);

        Swal.fire({
          icon: 'error',
          title: 'Error Updating Status',
          text: errorMessage,
          confirmButtonColor: '#8B5CF6',
        });
      } finally {
        setLoading(false);
      }
    },
    [tasks]
  );

  /**
   * Manually refresh tasks from backend
   */
  const refreshTasks = useCallback(async () => {
    await fetchTasks();
  }, [fetchTasks]);

  return {
    tasks,
    loading,
    error,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskStatus,
    refreshTasks,
  };
}

export default useTasks;
