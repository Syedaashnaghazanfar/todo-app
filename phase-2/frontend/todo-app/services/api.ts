/**
 * Backend API Client Service
 *
 * Provides typed HTTP client for communicating with FastAPI backend.
 * Handles authentication, error handling, and response transformation.
 *
 * @file services/api.ts
 * @see /specs/001-phase2-homepage-ui/ - Backend integration
 */

import axios, { AxiosError, AxiosInstance } from "axios";

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
const API_TIMEOUT = 30000; // 30 seconds (increased for database queries)

// ============================================================================
// Types & Interfaces
// ============================================================================

/**
 * Task type representing a todo item
 */
export interface Task {
  id: string;
  title: string;
  description: string | null;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  // New fields for Skills & Subagents Architecture
  priority: string;
  tags: string[];
  due_date: string | null;
  status: string;
}

/**
 * History entry type for task operations
 */
export interface HistoryEntry {
  history_id: string;
  task_id: string | null;  // Nullable - preserved after task deletion
  task_title: string;  // Task title for display
  action_type: "CREATED" | "UPDATED" | "COMPLETED" | "INCOMPLETED" | "DELETED";
  description: string | null;
  timestamp: string;
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total_count: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: PaginationMeta;
  popup: string | null;
  error: string | null;
}

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  popup: string | null;
  error: string | null;
}

/**
 * Weekly statistics
 */
export interface WeeklyStats {
  tasks_created_this_week: number;
  tasks_completed_this_week: number;
  total_completed: number;
  total_incomplete: number;
  week_start: string;
  week_end: string;
  total_tasks: number;
}

/**
 * System health status
 */
export interface HealthStatus {
  status: "healthy" | "degraded" | "down";
  service: string;
  timestamp?: string;
}

// ============================================================================
// API Client Class
// ============================================================================

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: API_TIMEOUT,
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true, // Include cookies in all requests
    });

    // Add request interceptor to include Authorization header
    this.client.interceptors.request.use(
      (config) => {
        // Get token from localStorage
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor for error handling and 401 detection
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        console.error("API Error:", error.message);

        // Handle 401 Unauthorized - session expired
        if (error.response?.status === 401) {
          // Dynamically import to avoid circular dependencies
          const { sessionExpired } = await import("@/utils/authAlerts");

          // Show session expired alert
          await sessionExpired();

          // Redirect to login page
          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // ========================================================================
  // Health Check Endpoints
  // ========================================================================

  /**
   * Check backend health status
   */
  async getHealth(): Promise<HealthStatus> {
    try {
      const response = await this.client.get<ApiResponse<HealthStatus>>("/health");
      return response.data.data;
    } catch (error) {
      console.error("Health check failed:", error);
      return { status: "down", service: "todo-app-backend" };
    }
  }

  // ========================================================================
  // Task Endpoints (CRUD Operations)
  // ========================================================================

  /**
   * Fetch all tasks
   */
  async getTasks(): Promise<Task[]> {
    try {
      const response = await this.client.get<ApiResponse<Task[]>>("/tasks");
      return response.data.data || [];
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
      throw error;
    }
  }

  /**
   * Fetch a single task by ID
   */
  async getTask(id: string): Promise<Task> {
    try {
      const response = await this.client.get<ApiResponse<Task>>(`/tasks/${id}`);
      return response.data.data;
    } catch (error) {
      console.error(`Failed to fetch task ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create a new task
   */
  async createTask(
    title: string,
    description?: string,
    due_date?: string,
    tags?: string[]
  ): Promise<Task> {
    try {
      const response = await this.client.post<ApiResponse<Task>>("/tasks", {
        title,
        ...(description && { description }),
        ...(due_date && { due_date }),
        ...(tags && tags.length > 0 && { tags }),
      });
      return response.data.data;
    } catch (error) {
      console.error("Failed to create task:", error);
      throw error;
    }
  }

  /**
   * Update an existing task
   */
  async updateTask(
    id: string,
    updates: Partial<{
      title: string;
      description: string;
      due_date: string;
      tags: string[];
      status: string;
    }>
  ): Promise<Task> {
    try {
      const response = await this.client.put<ApiResponse<Task>>(`/tasks/${id}`, updates);
      return response.data.data;
    } catch (error) {
      console.error(`Failed to update task ${id}:`, error);
      throw error;
    }
  }

  /**
   * Mark task as complete
   */
  async completeTask(id: string): Promise<Task> {
    try {
      const response = await this.client.patch<ApiResponse<Task>>(`/tasks/${id}/complete`);
      return response.data.data;
    } catch (error) {
      console.error(`Failed to complete task ${id}:`, error);
      throw error;
    }
  }

  /**
   * Mark task as incomplete
   */
  async incompleteTask(id: string): Promise<Task> {
    try {
      const response = await this.client.patch<ApiResponse<Task>>(`/tasks/${id}/incomplete`);
      return response.data.data;
    } catch (error) {
      console.error(`Failed to mark task incomplete ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a task
   */
  async deleteTask(id: string): Promise<void> {
    try {
      await this.client.delete(`/tasks/${id}`);
    } catch (error) {
      console.error(`Failed to delete task ${id}:`, error);
      throw error;
    }
  }

  // ========================================================================
  // History Endpoints
  // ========================================================================

  /**
   * Fetch task history with pagination and filtering
   */
  async getHistory(
    page: number = 1,
    limit: number = 10,
    taskId?: string,
    actionType?: string
  ): Promise<PaginatedResponse<HistoryEntry>> {
    try {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", limit.toString());
      if (taskId) params.append("task_id", taskId);
      if (actionType) params.append("action_type", actionType);

      const response = await this.client.get<ApiResponse<{ items: HistoryEntry[], pagination: any }>>(
        `/history?${params.toString()}`
      );

      // Transform nested response and map backend field names to frontend expectations
      const backendPagination = response.data.data.pagination;
      return {
        success: response.data.success,
        data: response.data.data.items,
        pagination: {
          page: backendPagination.current_page,
          limit: backendPagination.page_size,
          total_count: backendPagination.total_count,
          total_pages: backendPagination.total_pages,
          has_next: backendPagination.has_next,
          has_prev: backendPagination.has_prev,
        },
        popup: response.data.popup,
        error: response.data.error,
      };
    } catch (error) {
      console.error("Failed to fetch history:", error);
      throw error;
    }
  }

  /**
   * Delete a specific history entry
   */
  async deleteHistoryEntry(historyId: string): Promise<void> {
    try {
      await this.client.delete(`/history/${historyId}`);
    } catch (error) {
      console.error(`Failed to delete history entry ${historyId}:`, error);
      throw error;
    }
  }

  // ========================================================================
  // Statistics Endpoints
  // ========================================================================

  /**
   * Fetch weekly statistics
   */
  async getWeeklyStats(): Promise<WeeklyStats> {
    try {
      const response = await this.client.get<ApiResponse<WeeklyStats>>("/stats/weekly");
      return response.data.data;
    } catch (error) {
      console.error("Failed to fetch weekly stats:", error);
      throw error;
    }
  }

  // ========================================================================
  // Notification Endpoints
  // ========================================================================

  /**
   * Fetch notifications for authenticated user
   */
  async getNotifications(unreadOnly: boolean = false): Promise<{
    notifications: any[];
    unread_count: number;
    total_count: number;
  }> {
    try {
      const params = new URLSearchParams();
      if (unreadOnly) params.append('unread', 'true');

      const response = await this.client.get(`/notifications?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      throw error;
    }
  }

  /**
   * Mark notification as read
   */
  async markNotificationAsRead(notificationId: string): Promise<any> {
    try {
      const response = await this.client.patch(`/notifications/${notificationId}/read`);
      return response.data.data || response.data;
    } catch (error) {
      console.error(`Failed to mark notification ${notificationId} as read:`, error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllNotificationsAsRead(): Promise<{ count: number }> {
    try {
      const response = await this.client.patch('/notifications/mark-all-read');
      return response.data.data;
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      throw error;
    }
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(): Promise<number> {
    try {
      const response = await this.client.get<ApiResponse<{ count: number }>>('/notifications/unread/count');
      return response.data.data.count;
    } catch (error) {
      console.error('Failed to get unread count:', error);
      throw error;
    }
  }
}

// ============================================================================
// Singleton Export
// ============================================================================

// Create and export singleton instance
const apiClient = new ApiClient();
export default apiClient;

// Also export the class for testing purposes
export { ApiClient };
