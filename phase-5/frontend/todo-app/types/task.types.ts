/**
 * Task Entity Type Definitions
 *
 * Defines the core Task interface with auto-classification, tags, and temporal metadata.
 * All tasks are stored client-side in localStorage with JSON serialization.
 *
 * @module types/task.types
 */

/**
 * Priority levels for task classification (auto-computed based on due date and urgency keywords)
 */
export type Priority = 'VERY_IMPORTANT' | 'HIGH' | 'MEDIUM' | 'LOW';

/**
 * Task lifecycle status (user-controlled)
 */
export type TaskStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';

/**
 * Task entity representing a single todo item
 *
 * @property id - UUID v4 identifier, generated client-side
 * @property title - Required, 1-200 characters
 * @property description - Optional, max 2000 characters
 * @property dueDate - Optional, ISO 8601 datetime (YYYY-MM-DDTHH:mm:ss.sssZ)
 * @property priority - Auto-computed based on due date and urgency keywords
 * @property status - User-controlled lifecycle status
 * @property tags - Array of tag names from standard categories (max 5)
 * @property createdAt - ISO 8601 datetime, auto-generated, immutable
 * @property updatedAt - ISO 8601 datetime, auto-updated on changes
 *
 * Computed fields (not persisted, calculated at runtime):
 * @property isOverdue - True if dueDate < now
 * @property isUrgent - True if dueDate within 6 hours
 * @property isUpcoming - True if dueDate within 24 hours
 * @property relativeTime - Human-readable relative time (e.g., "in 2 hours", "3 days ago")
 */
export interface Task {
  // Identity
  id: string;

  // Core Properties
  title: string;
  description?: string;
  dueDate?: string;

  // Classification (Auto-computed)
  priority: Priority;
  status: TaskStatus;

  // Organization
  tags: string[];

  // Metadata
  createdAt: string;
  updatedAt: string;

  // Computed Fields (Not Persisted, Calculated at Runtime)
  isOverdue?: boolean;
  isUrgent?: boolean;
  isUpcoming?: boolean;
  relativeTime?: string;
}

/**
 * Priority order for sorting (descending: VERY_IMPORTANT -> LOW)
 */
export const PRIORITY_ORDER: Record<Priority, number> = {
  VERY_IMPORTANT: 4,
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1,
} as const;

/**
 * Status display labels for UI
 */
export const STATUS_LABELS: Record<TaskStatus, string> = {
  NOT_STARTED: 'Not Started',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
} as const;

/**
 * Priority display labels for UI
 */
export const PRIORITY_LABELS: Record<Priority, string> = {
  VERY_IMPORTANT: 'Very Important',
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low',
} as const;

/**
 * Urgency keywords for auto-classification (case-insensitive)
 */
export const URGENCY_KEYWORDS = [
  'urgent',
  'asap',
  'critical',
  'important',
  'emergency',
] as const;
