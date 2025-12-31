/**
 * TaskList Component
 *
 * Displays a list of tasks with grouping, filtering, search, and empty state handling.
 *
 * Features:
 * - Search bar with 300ms debounce and text highlighting
 * - Renders list of TaskItem components
 * - Optional grouping by status (Not Started, In Progress, Completed)
 * - Empty state with helpful message
 * - No search results state
 * - Loading state support
 * - Responsive grid layout
 * - Result count display
 *
 * @module components/tasks/TaskList
 */

'use client';

import React, { useMemo } from 'react';
import { ClipboardList, Edit2, Trash2, CheckCircle2, Circle, Clock } from 'lucide-react';
import type { Task, TaskStatus } from '@/types/task.types';
import { STATUS_LABELS } from '@/types/task.types';
import { TaskItem } from './TaskItem';
import { SearchBar } from './SearchBar';
import { PriorityBadge } from './PriorityBadge';
import { TagChipList } from './TagChip';
import { searchTasks, highlightText } from '@/lib/skills/task-search';
import { useSearch } from '@/hooks/useSearch';
import { formatRelativeTime, isOverdue } from '@/utils/timeUtils';

/**
 * TaskList props
 */
interface TaskListProps {
  /** Tasks to display (optional, defaults to all tasks from store) */
  tasks: Task[];
  /** Optional callback when edit button is clicked */
  onEdit?: (taskId: string) => void;
  /** Optional callback when delete button is clicked */
  onDelete?: (taskId: string) => void;
  /** Optional callback when status toggle is clicked */
  onToggleStatus?: (taskId: string) => void;
  /** Whether to group tasks by status */
  groupByStatus?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Optional className for additional styling */
  className?: string;
  /** Whether to show search bar */
  showSearch?: boolean;
}

/**
 * TaskList component
 *
 * Renders a list of tasks with optional grouping, search, and actions.
 *
 * @example
 * <TaskList
 *   tasks={tasks}
 *   onEdit={(id) => handleEdit(id)}
 *   onDelete={(id) => handleDelete(id)}
 *   onToggleStatus={(id) => handleToggleStatus(id)}
 *   showSearch={true}
 * />
 *
 * <TaskList
 *   tasks={filteredTasks}
 *   groupByStatus={true}
 * />
 *
 * @param props - Component props
 * @returns Task list element
 */
export function TaskList({
  tasks,
  onEdit,
  onDelete,
  onToggleStatus,
  groupByStatus = false,
  loading = false,
  className = '',
  showSearch = true,
}: TaskListProps) {
  // Search state
  const { searchQuery, debouncedQuery, setSearchQuery, clearSearch, isDebouncing } = useSearch();

  // Apply search filter
  const filteredTasks = useMemo(() => {
    return searchTasks(tasks, debouncedQuery);
  }, [tasks, debouncedQuery]);

  // Loading state
  if (loading) {
    return (
      <div className={`flex items-center justify-center py-12 ${className}`}>
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[var(--primary-500)] border-r-transparent mb-3" />
          <p className="text-sm text-[var(--text-secondary)]">Loading tasks...</p>
        </div>
      </div>
    );
  }

  // Empty state (no tasks at all)
  if (tasks.length === 0) {
    return (
      <div className={`flex items-center justify-center py-12 ${className}`}>
        <div className="text-center max-w-md">
          <ClipboardList size={48} className="mx-auto text-[var(--text-muted)] mb-4" />
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">No tasks yet</h3>
          <p className="text-sm text-[var(--text-secondary)]">Create your first task to get started with organizing your work.</p>
        </div>
      </div>
    );
  }

  // No search results state
  const hasSearchQuery = debouncedQuery.trim().length > 0;
  const noSearchResults = hasSearchQuery && filteredTasks.length === 0;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search Bar */}
      {showSearch && (
        <div className="mb-6">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onClear={clearSearch}
            isDebouncing={isDebouncing}
          />

          {/* Result count */}
          {hasSearchQuery && filteredTasks.length > 0 && (
            <div className="mt-3 px-1 text-sm text-[var(--text-secondary)]">
              Showing <span className="font-semibold text-[var(--primary-400)]">{filteredTasks.length}</span> of{' '}
              <span className="font-semibold text-[var(--text-primary)]">{tasks.length}</span> task
              {tasks.length !== 1 ? 's' : ''}
              {filteredTasks.length >= 50 && ' (top 50 matches)'}
            </div>
          )}
        </div>
      )}

      {/* No search results */}
      {noSearchResults && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center max-w-md">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">No tasks found</h3>
            <p className="text-sm text-[var(--text-secondary)] mb-1">
              No tasks match your search for <span className="font-semibold text-[var(--text-primary)]">"{debouncedQuery}"</span>
            </p>
            <p className="text-xs text-[var(--text-muted)] italic">Try different keywords or check your spelling</p>
            <button
              onClick={clearSearch}
              className="mt-4 px-4 py-2 text-sm font-medium text-[var(--primary-400)] hover:text-[var(--primary-300)] hover:bg-[var(--glass-bg)] rounded-md transition-colors border border-[var(--glass-border)]"
            >
              Clear search
            </button>
          </div>
        </div>
      )}

      {/* Task list */}
      {!noSearchResults && (
        <>
          {groupByStatus ? (
            <div className="space-y-8">
              {(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'] as TaskStatus[]).map((status) => {
                const statusTasks = filteredTasks.filter((task) => task.status === status);

                if (statusTasks.length === 0) {
                  return null;
                }

                return (
                  <div key={status}>
                    <h3 className="text-sm font-semibold text-[var(--text-accent)] uppercase tracking-wide mb-3 flex items-center gap-2">
                      {STATUS_LABELS[status]}
                      <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-semibold text-[var(--primary-foreground)] bg-[var(--primary-500)] rounded-full">
                        {statusTasks.length}
                      </span>
                    </h3>
                    <div className="space-y-3">
                      {statusTasks.map((task) => (
                        <TaskItemWithHighlight
                          key={task.id}
                          task={task}
                          searchQuery={debouncedQuery}
                          onEdit={onEdit ? () => onEdit(task.id) : undefined}
                          onDelete={onDelete ? () => onDelete(task.id) : undefined}
                          onToggleStatus={onToggleStatus ? () => onToggleStatus(task.id) : undefined}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTasks.map((task) => (
                <TaskItemWithHighlight
                  key={task.id}
                  task={task}
                  searchQuery={debouncedQuery}
                  onEdit={onEdit ? () => onEdit(task.id) : undefined}
                  onDelete={onDelete ? () => onDelete(task.id) : undefined}
                  onToggleStatus={onToggleStatus ? () => onToggleStatus(task.id) : undefined}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

/**
 * TaskItem wrapper with text highlighting
 *
 * Wraps TaskItem and adds search term highlighting to title and description.
 */
interface TaskItemWithHighlightProps {
  task: Task;
  searchQuery: string;
  onEdit?: () => void;
  onDelete?: () => void;
  onToggleStatus?: () => void;
}

function TaskItemWithHighlight({
  task,
  searchQuery,
  onEdit,
  onDelete,
  onToggleStatus,
}: TaskItemWithHighlightProps) {
  // If no search query, use regular TaskItem
  if (!searchQuery) {
    return (
      <TaskItem
        task={task}
        onEdit={onEdit}
        onDelete={onDelete}
        onToggleStatus={onToggleStatus}
      />
    );
  }

  // Apply highlighting
  const highlightedTitle = highlightText(task.title, searchQuery);
  const highlightedDescription = task.description ? highlightText(task.description, searchQuery) : undefined;

  // Custom TaskItem with highlighted text
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const isCompleted = task.status === 'COMPLETED';
  const taskIsOverdue = task.dueDate ? isOverdue(task.dueDate) : false;
  const relativeTime = task.dueDate ? formatRelativeTime(task.dueDate) : null;

  const handleDelete = () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      setTimeout(() => setShowDeleteConfirm(false), 3000);
      return;
    }
    onDelete?.();
    setShowDeleteConfirm(false);
  };

  const StatusIcon = isCompleted ? CheckCircle2 : Circle;

  return (
    <div
      className={`group relative rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-xl p-4 shadow-[var(--shadow-glow)] hover:shadow-[0_0_30px_rgba(139,92,246,0.3)] transition-all duration-200 ${
        isCompleted ? 'opacity-60' : ''
      } ${task.priority === 'VERY_IMPORTANT' ? 'ring-2 ring-[var(--neon-red)]' : ''}`}
    >
      {/* Header: Title and Priority Badge */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1 min-w-0">
          <h3
            className={`text-base font-semibold text-[var(--text-primary)] ${
              isCompleted ? 'line-through text-[var(--text-secondary)]' : ''
            }`}
            dangerouslySetInnerHTML={{ __html: highlightedTitle }}
          />
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <PriorityBadge priority={task.priority} />
          {onToggleStatus && (
            <button
              onClick={onToggleStatus}
              className="text-[var(--text-secondary)] hover:text-[var(--primary-400)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)] focus:ring-offset-1 rounded"
              aria-label={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
              title={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
            >
              <StatusIcon size={20} className={isCompleted ? 'fill-[var(--primary-500)] text-[var(--primary-500)]' : ''} />
            </button>
          )}
        </div>
      </div>

      {/* Description */}
      {highlightedDescription && (
        <p
          className="text-sm text-[var(--text-secondary)] mb-3 line-clamp-2"
          dangerouslySetInnerHTML={{ __html: highlightedDescription }}
        />
      )}

      {/* Tags */}
      {task.tags.length > 0 && (
        <div className="mb-3">
          <TagChipList tags={task.tags} />
        </div>
      )}

      {/* Footer: Due Date and Actions */}
      <div className="flex items-center justify-between gap-3 pt-3 border-t border-[var(--glass-border)]">
        <div className="flex items-center gap-2 text-sm">
          {relativeTime && (
            <div
              className={`flex items-center gap-1.5 ${
                taskIsOverdue ? 'text-[var(--neon-red)] font-semibold' : 'text-[var(--text-secondary)]'
              }`}
            >
              <Clock size={14} className={taskIsOverdue ? 'text-[var(--neon-red)]' : 'text-[var(--text-secondary)]'} />
              <span>
                {taskIsOverdue ? 'Overdue: ' : ''}
                {relativeTime}
              </span>
            </div>
          )}
          {!relativeTime && <span className="text-[var(--text-muted)] text-xs">No due date</span>}
        </div>

        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 sm:opacity-100 transition-opacity">
          {onEdit && (
            <button
              onClick={onEdit}
              className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--primary-400)] hover:bg-[var(--glass-highlight)] rounded transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)] focus:ring-offset-1"
              aria-label="Edit task"
              title="Edit task"
            >
              <Edit2 size={16} />
            </button>
          )}

          {onDelete && (
            <button
              onClick={handleDelete}
              className={`p-1.5 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                showDeleteConfirm
                  ? 'text-[var(--neon-red)] bg-[var(--glass-highlight)] ring-2 ring-[var(--neon-red)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--neon-red)] hover:bg-[var(--glass-highlight)] focus:ring-[var(--neon-red)]'
              }`}
              aria-label={showDeleteConfirm ? 'Click again to confirm deletion' : 'Delete task'}
              title={showDeleteConfirm ? 'Click again to confirm' : 'Delete task'}
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="absolute bottom-2 left-2">
        <span className="text-xs text-[var(--text-muted)]">{STATUS_LABELS[task.status]}</span>
      </div>

      {task.priority === 'VERY_IMPORTANT' && !isCompleted && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-[var(--neon-red)] rounded-full animate-pulse" />
      )}

      {/* Global styles for <mark> highlighting */}
      <style jsx global>{`
        mark {
          background-color: var(--neon-yellow);
          color: var(--text-primary);
          padding: 2px 4px;
          border-radius: 2px;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}

/**
 * Task count summary component
 *
 * Shows task counts by status.
 */
export function TaskListSummary({ tasks, className = '' }: { tasks: Task[]; className?: string }) {
  const notStarted = tasks.filter((t) => t.status === 'NOT_STARTED').length;
  const inProgress = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
  const completed = tasks.filter((t) => t.status === 'COMPLETED').length;
  const veryImportant = tasks.filter((t) => t.priority === 'VERY_IMPORTANT' && t.status !== 'COMPLETED').length;

  return (
    <div className={`flex gap-6 ${className}`}>
      <div className="text-sm">
        <span className="text-[var(--text-secondary)]">Total:</span>{' '}
        <span className="font-semibold text-[var(--text-primary)]">{tasks.length}</span>
      </div>
      <div className="text-sm">
        <span className="text-[var(--text-secondary)]">Not Started:</span>{' '}
        <span className="font-semibold text-[var(--text-primary)]">{notStarted}</span>
      </div>
      <div className="text-sm">
        <span className="text-[var(--text-secondary)]">In Progress:</span>{' '}
        <span className="font-semibold text-[var(--text-primary)]">{inProgress}</span>
      </div>
      <div className="text-sm">
        <span className="text-[var(--text-secondary)]">Completed:</span>{' '}
        <span className="font-semibold text-[var(--text-primary)]">{completed}</span>
      </div>
      {veryImportant > 0 && (
        <div className="text-sm">
          <span className="text-[var(--neon-red)] font-semibold">Very Important:</span>{' '}
          <span className="font-semibold text-[var(--neon-red)]">{veryImportant}</span>
        </div>
      )}
    </div>
  );
}

export default TaskList;
