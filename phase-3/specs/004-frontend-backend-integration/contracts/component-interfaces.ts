/**
 * Component Interface Contracts
 * Feature: 004-frontend-backend-integration
 * 
 * This file defines TypeScript interfaces for all React component props,
 * hook return types, and data transformation types.
 */

import { LucideIcon } from 'lucide-react';

// ============================================
// Backend API Types (from data-model.md)
// ============================================

export interface Task {
  id: string;
  title: string;
  description?: string;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export type ActionType = 'CREATED' | 'UPDATED' | 'COMPLETED' | 'INCOMPLETED' | 'DELETED';

export interface HistoryEntry {
  history_id: string;
  task_id: string;
  action_type: ActionType;
  description?: string;
  timestamp: string;
}

export interface TaskStatistics {
  tasks_created_this_week: number;
  tasks_completed_this_week: number;
  total_completed: number;
  total_incomplete: number;
  week_start: string;
  week_end: string;
}

// ============================================
// Page Component Props
// ============================================

export interface TaskDetailPageProps {
  params: { id: string };
}

export interface AnalyticsPageProps {}

export interface HistoryPageProps {}

// ============================================
// Task Components
// ============================================

export interface TaskDetailFormProps {
  task: Task;
  onSave: (updates: Partial<Task>) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
  error?: string | null;
}

// ============================================
// Analytics Components
// ============================================

export interface WeeklyChartData {
  week: string;
  completed: number;
  incomplete: number;
}

export interface WeeklyChartProps {
  data: WeeklyChartData[];
  loading: boolean;
}

export interface MetricCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  colorClass: string;
  bgClass: string;
}

export interface ActivityDataPoint {
  date: string;
  count: number;
}

export interface ActivityTimelineProps {
  data: ActivityDataPoint[];
  loading: boolean;
}

// ============================================
// History Components
// ============================================

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export interface HistoryListProps {
  entries: HistoryEntry[];
  loading: boolean;
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
}

export interface HistoryEntryProps {
  entry: HistoryEntry;
}

// ============================================
// Notification Utilities (SweetAlert2)
// ============================================

export interface AlertConfig {
  title: string;
  text?: string;
  icon: 'success' | 'error' | 'warning' | 'info' | 'question';
  confirmButtonText?: string;
  cancelButtonText?: string;
  confirmButtonColor?: string;
  showCancelButton?: boolean;
}

export interface ConfirmDialogConfig extends AlertConfig {
  showCancelButton: true;
  cancelButtonText: string;
}

// ============================================
// Hook Return Types
// ============================================

export interface HistoryFilters {
  task_id?: string;
  action_type?: ActionType;
}

export interface UseHistoryReturn {
  entries: HistoryEntry[];
  loading: boolean;
  error: string | null;
  pagination: PaginationInfo;
  fetchHistory: (page?: number, filters?: HistoryFilters) => Promise<void>;
  clearError: () => void;
}

export interface UseStatsReturn {
  stats: TaskStatistics | null;
  loading: boolean;
  error: string | null;
  fetchStats: () => Promise<void>;
  clearError: () => void;
}

// ============================================
// Chart Configuration
// ============================================

export interface ChartColors {
  purple: {
    main: string;
    light: string;
    dark: string;
    lighter: string;
  };
  gray: {
    light: string;
    medium: string;
    dark: string;
  };
}

export interface ChartConfig {
  margin: {
    top: number;
    right: number;
    left: number;
    bottom: number;
  };
  barSize: number;
  animationDuration: number;
}
