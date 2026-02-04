/**
 * TaskCard Component
 *
 * Clean task card with checkbox, title, due date, priority badge, and tags.
 * Shows Edit/Delete buttons on hover.
 */

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Edit2, Trash2, Calendar, Tag as TagIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TagChip } from './TagChip';

interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_IMPORTANT';
  dueDate?: string;
  tags: string[];
}

interface TaskCardProps {
  task: Task;
  onToggle: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  className?: string;
}

const priorityConfig = {
  VERY_IMPORTANT: {
    label: 'Urgent',
    color: '#EF4444',
    bgColor: 'oklch(0.956 0.043 25)',
  },
  HIGH: {
    label: 'High',
    color: '#F59E0B',
    bgColor: 'oklch(0.954 0.048 70)',
  },
  MEDIUM: {
    label: 'Medium',
    color: 'var(--accent-tasks)',
    bgColor: 'var(--accent-tasks-muted)',
  },
  LOW: {
    label: 'Low',
    color: '#64748B',
    bgColor: 'oklch(0.92 0.01 250)',
  },
};

export function TaskCard({
  task,
  onToggle,
  onEdit,
  onDelete,
  className,
}: TaskCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isChecked, setIsChecked] = useState(task.completed);

  const handleToggle = () => {
    setIsChecked(!isChecked);
    onToggle(task.id);
  };

  const priority = priorityConfig[task.priority];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      whileHover={{ scale: 1.01 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        'relative rounded-xl border border-[var(--border)]',
        'bg-[var(--bg-card)] p-4',
        'transition-all duration-200',
        isChecked && 'opacity-60',
        className
      )}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={handleToggle}
          className={cn(
            'relative flex-shrink-0 w-5 h-5 rounded-md border-2',
            'transition-all duration-200',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]',
            isChecked
              ? 'bg-[var(--accent-dashboard)] border-[var(--accent-dashboard)]'
              : 'border-[var(--border)] hover:border-[var(--accent-dashboard)]'
          )}
          aria-label={isChecked ? 'Mark as incomplete' : 'Mark as complete'}
        >
          <AnimatePresence>
            {isChecked && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
              </motion.div>
            )}
          </AnimatePresence>
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <h4
            className={cn(
              'font-medium text-base mb-2',
              'transition-all duration-200',
              isChecked && 'line-through'
            )}
            style={{
              color: isChecked
                ? 'var(--text-muted)'
                : 'var(--text-primary)',
            }}
          >
            {task.title}
          </h4>

          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Priority badge */}
            <span
              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
              style={{
                backgroundColor: priority.bgColor,
                color: priority.color,
              }}
            >
              {priority.label}
            </span>

            {/* Due date */}
            {task.dueDate && (
              <span
                className="inline-flex items-center gap-1 text-xs"
                style={{ color: 'var(--text-muted)' }}
              >
                <Calendar className="w-3 h-3" />
                {new Date(task.dueDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            )}

            {/* Tags */}
            {task.tags.length > 0 && (
              <span className="flex items-center gap-1">
                <TagIcon className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />
                <div className="flex flex-wrap gap-1">
                  {task.tags.slice(0, 3).map((tag) => (
                    <TagChip key={tag} tag={tag} size="sm" />
                  ))}
                  {task.tags.length > 3 && (
                    <span
                      className="text-xs px-1"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      +{task.tags.length - 3}
                    </span>
                  )}
                </div>
              </span>
            )}
          </div>
        </div>

        {/* Actions (visible on hover) */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="flex items-center gap-1"
            >
              <button
                onClick={() => onEdit(task)}
                className="p-1.5 rounded-md hover:bg-[var(--bg-elevated)] transition-colors"
                style={{ color: 'var(--text-secondary)' }}
                aria-label="Edit task"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(task.id)}
                className="p-1.5 rounded-md hover:bg-red-500/10 transition-colors"
                style={{ color: 'var(--text-secondary)' }}
                onMouseOver={(e) => (e.currentTarget.style.color = '#EF4444')}
                onMouseOut={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
                aria-label="Delete task"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
