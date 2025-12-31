/**
 * TaskForm Component
 *
 * Form for creating and editing tasks with validation.
 *
 * Features:
 * - Title input (required, 1-200 chars)
 * - Description textarea (optional, max 2000 chars)
 * - Due date input (datetime-local)
 * - Tags multi-select with autocomplete from standard categories
 * - Auto-priority classification on submit
 * - Validation with user-friendly error messages
 *
 * @module components/tasks/TaskForm
 */

'use client';

import React, { useState, FormEvent } from 'react';
import { Calendar, Tag as TagIcon, X } from 'lucide-react';
import type { Task } from '@/types/task.types';
import { classifyPriority } from '@/lib/skills/priority-classification';
import { validateSingleTag, getAvailableTags } from '@/lib/skills/task-tagging';
import { TagChip } from './TagChip';
import { STANDARD_TAGS } from '@/utils/tagCategories';

/**
 * TaskForm props
 */
interface TaskFormProps {
  /** Optional task to edit (if undefined, creates new task) */
  task?: Task;
  /** Callback when task is submitted */
  onSubmit: (task: Task) => void;
  /** Optional callback when form is cancelled */
  onCancel?: () => void;
  /** Optional submit button text (default: "Create Task" or "Update Task") */
  submitLabel?: string;
  /** Optional className for additional styling */
  className?: string;
}

/**
 * TaskForm component
 *
 * Handles task creation and editing with validation and auto-classification.
 *
 * @example
 * <TaskForm
 *   onSubmit={(task) => createTask(task)}
 * />
 * // Renders: Form for creating a new task
 *
 * <TaskForm
 *   task={existingTask}
 *   onSubmit={(task) => updateTask(task)}
 *   onCancel={() => setEditMode(false)}
 * />
 * // Renders: Form for editing existing task with cancel button
 *
 * @param props - Component props
 * @returns Task form element
 */
export function TaskForm({ task, onSubmit, onCancel, submitLabel, className = '' }: TaskFormProps): React.ReactElement {
  const isEditMode = !!task;

  // Form state
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [dueDate, setDueDate] = useState(task?.dueDate ? formatDateForInput(task.dueDate) : '');
  const [tags, setTags] = useState<string[]>(task?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);

  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});

  /**
   * Validate form fields
   */
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Title validation
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      newErrors.title = 'Title is required';
    } else if (trimmedTitle.length > 200) {
      newErrors.title = 'Title must be 200 characters or less';
    }

    // Description validation
    if (description.length > 2000) {
      newErrors.description = 'Description must be 2000 characters or less';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();
    const dueDateISO = dueDate ? new Date(dueDate).toISOString() : undefined;

    // Auto-classify priority
    const priority = classifyPriority({
      title: trimmedTitle,
      dueDate: dueDateISO,
    });

    // Create task object
    const newTask: Task = {
      id: task?.id || crypto.randomUUID(),
      title: trimmedTitle,
      description: trimmedDescription || undefined,
      dueDate: dueDateISO,
      priority,
      status: task?.status || 'NOT_STARTED',
      tags,
      createdAt: task?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSubmit(newTask);

    // Reset form if creating new task
    if (!isEditMode) {
      setTitle('');
      setDescription('');
      setDueDate('');
      setTags([]);
      setErrors({});
    }
  };

  /**
   * Handle tag addition
   */
  const handleAddTag = (tag: string) => {
    const validation = validateSingleTag(tags, tag);

    if (!validation.valid) {
      setErrors({ ...errors, tags: validation.errors[0] });
      return;
    }

    setTags([...tags, tag]);
    setTagInput('');
    setShowTagSuggestions(false);
    setErrors({ ...errors, tags: '' });
  };

  /**
   * Handle tag removal
   */
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
    setErrors({ ...errors, tags: '' });
  };

  /**
   * Get filtered tag suggestions based on input
   */
  const getTagSuggestions = (): string[] => {
    const availableTags = getAvailableTags(tags);

    if (!tagInput.trim()) {
      return availableTags;
    }

    const lowerInput = tagInput.toLowerCase();
    return availableTags.filter((tag) => tag.toLowerCase().includes(lowerInput));
  };

  const tagSuggestions = getTagSuggestions();

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-6 ${className}`}>
      {/* Title Input */}
      <div>
        <label htmlFor="task-title" className="block text-sm font-semibold var(--text-primary) mb-1">
          Title <span className="var(--destructive)">*</span>
        </label>
        <input
          id="task-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter task title..."
          className={`w-full rounded-md border ${errors.title ? 'border-red-500' : 'border-[var(--border)]'} px-4 py-2 text-sm focus:border-[var(--accent-tasks)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-tasks-muted)] transition-colors`}
          maxLength={200}
        />
        {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title}</p>}
        <p className="mt-1 text-xs style={{ color: 'var(--text-muted)' }}">{title.length}/200 characters</p>
      </div>

      {/* Description Textarea */}
      <div>
        <label htmlFor="task-description" className="block text-sm font-semibold var(--text-primary) mb-1">
          Description
        </label>
        <textarea
          id="task-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add additional details..."
          rows={3}
          className={`w-full rounded-md border ${errors.description ? 'border-red-500' : 'border-[var(--border)]'} px-4 py-2 text-sm focus:border-[var(--accent-tasks)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-tasks-muted)] transition-colors resize-none`}
          maxLength={2000}
        />
        {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description}</p>}
        <p className="mt-1 text-xs style={{ color: 'var(--text-muted)' }}">{description.length}/2000 characters</p>
      </div>

      {/* Due Date Input */}
      <div>
        <label htmlFor="task-due-date" className="block text-sm font-semibold var(--text-primary) mb-1">
          Due Date
        </label>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 style={{ color: 'var(--text-muted)' }}" size={18} />
          <input
            id="task-due-date"
            type="datetime-local"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full rounded-md border border-[var(--border)] pl-11 pr-4 py-2 text-sm focus:border-[var(--accent-tasks)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-tasks-muted)] transition-colors"
          />
        </div>
        <p className="mt-1 text-xs style={{ color: 'var(--text-muted)' }}">Optional: Set a deadline for this task</p>
      </div>

      {/* Tags Input */}
      <div>
        <label htmlFor="task-tags" className="block text-sm font-semibold var(--text-primary) mb-1">
          Tags
        </label>

        {/* Display current tags */}
        {tags.length > 0 && (
          <div className="mb-2">
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <TagChip key={tag} tag={tag} onRemove={() => handleRemoveTag(tag)} />
              ))}
            </div>
          </div>
        )}

        {/* Tag input with autocomplete */}
        {tags.length < 5 && (
          <div className="relative">
            <TagIcon className="absolute left-3 top-1/2 -translate-y-1/2 style={{ color: 'var(--text-muted)' }}" size={18} />
            <input
              id="task-tags"
              type="text"
              value={tagInput}
              onChange={(e) => {
                setTagInput(e.target.value);
                setShowTagSuggestions(true);
              }}
              onFocus={() => setShowTagSuggestions(true)}
              onBlur={() => setTimeout(() => setShowTagSuggestions(false), 200)}
              placeholder="Add tags..."
              className="w-full rounded-md border border-[var(--border)] pl-11 pr-4 py-2 text-sm focus:border-[var(--accent-tasks)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-tasks-muted)] transition-colors"
            />

            {/* Tag suggestions dropdown */}
            {showTagSuggestions && tagSuggestions.length > 0 && (
              <div className="absolute z-10 mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--bg-card)] shadow-lg max-h-48 overflow-y-auto">
                {tagSuggestions.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleAddTag(tag)}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-[var(--bg-elevated)] transition-colors flex items-center gap-2"
                  >
                    <span className="var(--text-primary)">{tag}</span>
                    <span className="text-xs style={{ color: 'var(--text-muted)' }}">({STANDARD_TAGS.find((t) => t.name === tag)?.description})</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {errors.tags && <p className="mt-1 text-xs text-red-600">{errors.tags}</p>}
        <p className="mt-1 text-xs style={{ color: 'var(--text-muted)' }}">
          {tags.length}/5 tags • Select from standard categories: Work, Personal, Shopping, Health, Finance, Learning, Urgent
        </p>
      </div>

      {/* Form Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          className="flex-1 rounded-md [var(--accent-tasks)] px-4 py-2 text-sm font-semibold [var(--text-inverted)] shadow-sm backgroundColor='var(--accent-tasks-hover)' focus:outline-none focus:ring-2 focus:ring-[var(--accent-tasks)] focus:ring-offset-2 transition-colors"
        >
          {submitLabel || (isEditMode ? 'Update Task' : 'Create Task')}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-[var(--border)] bg-[var(--bg-card)] px-4 py-2 text-sm font-semibold var(--text-primary) shadow-sm hover:bg-[var(--bg-elevated)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-tasks)] focus:ring-offset-2 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

/**
 * Format ISO 8601 datetime for datetime-local input
 */
function formatDateForInput(isoString: string): string {
  try {
    const date = new Date(isoString);
    // Format: YYYY-MM-DDTHH:mm
    return date.toISOString().slice(0, 16);
  } catch (error) {
    console.error('Error formatting date for input:', error);
    return '';
  }
}

export default TaskForm;
