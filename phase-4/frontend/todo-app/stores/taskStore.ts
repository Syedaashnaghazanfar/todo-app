/**
 * Task Store (Zustand)
 *
 * Manages task state with localStorage persistence. Provides actions for CRUD operations
 * on tasks with automatic priority classification and timestamp updates.
 *
 * @module stores/taskStore
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { devtools } from 'zustand/middleware';
import type { Task } from '@/types/task.types';

/**
 * Task store state interface
 */
interface TaskState {
  // State
  tasks: Task[];
  loading: boolean;
  error: string | null;

  // Actions
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  getTasks: () => Task[];
  getTaskById: (id: string) => Task | undefined;
  setTasks: (tasks: Task[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearTasks: () => void;
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
      // Check if quota exceeded
      if (
        error instanceof DOMException &&
        (error.name === 'QuotaExceededError' || (error as { code?: number }).code === 22)
      ) {
        console.warn(
          'localStorage quota exceeded. Consider clearing completed tasks.'
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
 * Task store with localStorage persistence
 *
 * Storage key: 'tasks'
 * Persists: tasks array only (loading and error are transient)
 *
 * Usage:
 * ```typescript
 * const { tasks, addTask, updateTask, deleteTask } = useTaskStore();
 * ```
 */
export const useTaskStore = create<TaskState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial State
        tasks: [],
        loading: false,
        error: null,

        // Actions
        addTask: (task: Task) => {
          set(
            (state) => ({
              tasks: [...state.tasks, task],
              error: null,
            }),
            false,
            'addTask'
          );
        },

        updateTask: (id: string, updates: Partial<Task>) => {
          set(
            (state) => {
              const taskIndex = state.tasks.findIndex((t) => t.id === id);
              if (taskIndex === -1) {
                console.warn(`Task with id "${id}" not found`);
                return state;
              }

              const updatedTasks = [...state.tasks];
              updatedTasks[taskIndex] = {
                ...updatedTasks[taskIndex],
                ...updates,
                updatedAt: new Date().toISOString(),
              };

              return {
                tasks: updatedTasks,
                error: null,
              };
            },
            false,
            'updateTask'
          );
        },

        deleteTask: (id: string) => {
          set(
            (state) => ({
              tasks: state.tasks.filter((t) => t.id !== id),
              error: null,
            }),
            false,
            'deleteTask'
          );
        },

        getTasks: () => {
          return get().tasks;
        },

        getTaskById: (id: string) => {
          return get().tasks.find((t) => t.id === id);
        },

        setTasks: (tasks: Task[]) => {
          set(
            {
              tasks,
              error: null,
            },
            false,
            'setTasks'
          );
        },

        setLoading: (loading: boolean) => {
          set({ loading }, false, 'setLoading');
        },

        setError: (error: string | null) => {
          set({ error }, false, 'setError');
        },

        clearTasks: () => {
          set(
            {
              tasks: [],
              error: null,
            },
            false,
            'clearTasks'
          );
        },
      }),
      {
        name: 'tasks', // localStorage key
        storage: customStorage,
        partialize: (state) => ({
          tasks: state.tasks,
          // Exclude loading and error from persistence
        }),
      }
    ),
    { name: 'TaskStore' }
  )
);

/**
 * Selector hook for getting tasks count
 */
export const useTaskCount = () => useTaskStore((state) => state.tasks.length);

/**
 * Selector hook for checking if tasks are loading
 */
export const useTasksLoading = () => useTaskStore((state) => state.loading);

/**
 * Selector hook for getting task error
 */
export const useTaskError = () => useTaskStore((state) => state.error);
