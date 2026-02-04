/**
 * TaskItem Component
 *
 * Displays a single task with priority badge, tags, and action buttons.
 *
 * Features:
 * - Priority badge with color coding
 * - Tag chips with category styling
 * - Due date display with relative time
 * - Status toggle (checkbox)
 * - Edit and delete action buttons
 * - Hover effects and responsive design
 *
 * @module components/tasks/TaskItem
 */

'use client';

import React, { useState } from 'react';
import { Edit2, Trash2, CheckCircle2, Circle, Clock } from 'lucide-react';
import type { Task } from '@/types/task.types';
import { STATUS_LABELS } from '@/types/task.types';
import { PriorityBadge } from './PriorityBadge';
import { TagChipList } from './TagChip';
import { formatRelativeTime, isOverdue } from '@/utils/timeUtils';

/**
 * TaskItem props
 */
interface TaskItemProps {
  /** Task to display */
  task: Task;
  /** Optional callback when edit button is clicked */
  onEdit?: () => void;
  /** Optional callback when delete button is clicked */
  onDelete?: () => void;
  /** Optional callback when status toggle is clicked */
  onToggleStatus?: () => void;
  /** Optional className for additional styling */
  className?: string;
}

/**
 * TaskItem component
 *
 * Renders a task card with all details and action buttons.
 *
 * @example
 * <TaskItem
 *   task={task}
 *   onEdit={() => handleEdit(task.id)}
 *   onDelete={() => handleDelete(task.id)}
 *   onToggleStatus={() => handleToggle(task.id)}
 * />
 *
 * @param props - Component props
 * @returns Task item element
 */
export function TaskItem({ task, onEdit, onDelete, onToggleStatus, className = '' }: TaskItemProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isCompleted = task.status === 'COMPLETED';
  const taskIsOverdue = task.dueDate ? isOverdue(task.dueDate) : false;
  const relativeTime = task.dueDate ? formatRelativeTime(task.dueDate) : null;

  /**
   * Handle delete with confirmation
   */
  const handleDelete = () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      // Auto-cancel after 3 seconds
      setTimeout(() => setShowDeleteConfirm(false), 3000);
      return;
    }

    onDelete?.();
    setShowDeleteConfirm(false);
  };

  /**
   * Get status icon based on task status
   */
  const StatusIcon = isCompleted ? CheckCircle2 : Circle;

  // Priority glow colors - MORE VIBRANT
  const priorityGlow = {
    VERY_IMPORTANT: 'shadow-[0_0_25px_rgba(168,85,247,0.5)] border-primary-500/50',
    HIGH: 'shadow-[0_0_20px_rgba(59,130,246,0.4)] border-neon-blue/40',
    MEDIUM: 'shadow-[0_0_15px_rgba(6,182,212,0.3)] border-neon-cyan/30',
    LOW: 'shadow-[0_0_12px_rgba(16,185,129,0.25)] border-neon-green/25',
  };

  // Status-based border colors - MORE VIBRANT
  const statusBorderColor = isCompleted
    ? 'border-neon-green/50 shadow-[0_0_20px_rgba(16,185,129,0.4)]'
    : '';

  return (
    <div
      className={`group relative rounded-lg border-2 p-4 transition-all duration-300 ${
        isCompleted
          ? `bg-white/5 ${statusBorderColor} opacity-70`
          : 'bg-white/5 backdrop-blur-sm border-white/10'
      } ${!isCompleted && task.priority ? priorityGlow[task.priority] : ''}
      hover:bg-white/10 hover:scale-[1.02] hover:shadow-xl ${className}`}
    >
      {/* Header: Title and Priority Badge */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1 min-w-0">
          <h3
            className={`text-base font-semibold ${
              isCompleted ? 'line-through text-text-muted' : 'text-text-primary'
            }`}
          >
            {task.title}
          </h3>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <PriorityBadge priority={task.priority} />
          {/* Status toggle button */}
          {onToggleStatus && (
            <button
              onClick={onToggleStatus}
              className="text-text-secondary hover:text-neon-green transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/50 rounded"
              aria-label={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
              title={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
            >
              <StatusIcon size={20} className={isCompleted ? 'fill-neon-green text-neon-green drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]' : ''} />
            </button>
          )}
        </div>
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-sm text-text-secondary mb-3 line-clamp-2">{task.description}</p>
      )}

      {/* Tags */}
      {task.tags.length > 0 && (
        <div className="mb-3">
          <TagChipList tags={task.tags} />
        </div>
      )}

      {/* Footer: Due Date and Actions */}
      <div className="flex items-center justify-between gap-3 pt-3 border-t border-white/10">
        {/* Due date with relative time */}
        <div className="flex items-center gap-2 text-sm">
          {relativeTime && (
            <div
              className={`flex items-center gap-1.5 ${
                taskIsOverdue ? 'text-neon-red font-semibold' : 'text-text-secondary'
              }`}
            >
              <Clock size={14} className={taskIsOverdue ? 'animate-pulse' : ''} />
              <span>
                {taskIsOverdue ? 'Overdue: ' : ''}
                {relativeTime}
              </span>
            </div>
          )}
          {!relativeTime && <span className="text-text-muted text-xs">No due date</span>}
        </div>

        {/* Action buttons (visible on hover or always on mobile) */}
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 sm:opacity-100 transition-opacity">
          {/* Edit button */}
          {onEdit && (
            <button
              onClick={onEdit}
              className="p-1.5 text-text-secondary hover:text-neon-blue hover:bg-neon-blue/10 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/50"
              aria-label="Edit task"
              title="Edit task"
            >
              <Edit2 size={16} />
            </button>
          )}

          {/* Delete button with confirmation */}
          {onDelete && (
            <button
              onClick={handleDelete}
              className={`p-1.5 rounded transition-all duration-200 focus:outline-none focus:ring-2 ${
                showDeleteConfirm
                  ? 'text-neon-red bg-neon-red/20 ring-2 ring-neon-red shadow-[0_0_10px_rgba(239,68,68,0.3)]'
                  : 'text-text-secondary hover:text-neon-red hover:bg-neon-red/10 focus:ring-neon-red/50'
              }`}
              aria-label={showDeleteConfirm ? 'Click again to confirm deletion' : 'Delete task'}
              title={showDeleteConfirm ? 'Click again to confirm' : 'Delete task'}
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      {/* VERY_IMPORTANT pulse indicator */}
      {task.priority === 'VERY_IMPORTANT' && !isCompleted && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(139,92,246,0.8)]" />
      )}
    </div>
  );
}

/**
 * Compact TaskItem variant for dense lists
 *
 * Shows less detail, optimized for scanning many tasks.
 */
export function TaskItemCompact({ task, onEdit, onDelete, onToggleStatus, className = '' }: TaskItemProps) {
  const isCompleted = task.status === 'COMPLETED';
  const StatusIcon = isCompleted ? CheckCircle2 : Circle;

  return (
    <div className={`flex items-center gap-3 p-3 rounded-md border border-gray-200 bg-white hover:bg-gray-50 transition-colors ${className}`}>
      {/* Status toggle */}
      {onToggleStatus && (
        <button
          onClick={onToggleStatus}
          className="text-gray-400 hover:text-purple-600 transition-colors flex-shrink-0"
          aria-label={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
        >
          <StatusIcon size={18} className={isCompleted ? 'fill-purple-600 text-purple-600' : ''} />
        </button>
      )}

      {/* Title and priority */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium truncate ${isCompleted ? 'line-through text-gray-500' : 'text-gray-900'}`}>
            {task.title}
          </span>
          <PriorityBadge priority={task.priority} />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {onEdit && (
          <button
            onClick={onEdit}
            className="p-1 text-gray-400 hover:text-purple-600 transition-colors"
            aria-label="Edit task"
          >
            <Edit2 size={14} />
          </button>
        )}
        {onDelete && (
          <button
            onClick={onDelete}
            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
            aria-label="Delete task"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

export default TaskItem;
