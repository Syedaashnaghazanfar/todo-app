/**
 * TaskModal Component
 *
 * Glassmorphism dialog for creating and editing tasks with cyberpunk neon styling.
 *
 * Features:
 * - Glass background with backdrop blur
 * - Neon-styled form inputs
 * - Priority selection with color-coded badges
 * - Tag selection with category chips
 * - Date picker with neon accents
 * - Animated entrance/exit
 * - Form validation with neon error states
 *
 * @module components/tasks/TaskModal
 */

'use client';

import React, { useState, useEffect } from 'react';
import { X, Calendar, Tag as TagIcon, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Task, Priority } from '@/types/task.types';
import { PRIORITY_LABELS } from '@/types/task.types';
import { STANDARD_TAGS } from '@/utils/tagCategories';
import { getPriorityColor, getPriorityBgColor } from '@/utils/priorityColors';

/**
 * TaskModal props
 */
interface TaskModalProps {
  /** Whether the modal is open */
  open: boolean;
  /** Callback when modal should close */
  onClose: () => void;
  /** Callback when task is submitted */
  onSubmit: (task: Partial<Task>) => Promise<void>;
  /** Task to edit (if editing) */
  task?: Task;
  /** Trigger button element */
  trigger?: React.ReactNode;
}

/**
 * TaskModal component
 *
 * Renders a glassmorphism modal for creating/editing tasks.
 *
 * @example
 * <TaskModal
 *   open={showModal}
 *   onClose={() => setShowModal(false)}
 *   onSubmit={handleCreate}
 * />
 *
 * @param props - Component props
 * @returns Task modal element
 */
export function TaskModal({ open, onClose, onSubmit, task, trigger }: TaskModalProps) {
  const isEditing = !!task;

  // Form state
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [priority, setPriority] = useState<Priority>(task?.priority || 'MEDIUM');
  const [dueDate, setDueDate] = useState(task?.dueDate || '');
  const [selectedTags, setSelectedTags] = useState<string[]>(task?.tags || []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Reset form when task changes
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setPriority(task.priority);
      setDueDate(task.dueDate || '');
      setSelectedTags(task.tags || []);
    } else {
      setTitle('');
      setDescription('');
      setPriority('MEDIUM');
      setDueDate('');
      setSelectedTags([]);
    }
    setError('');
  }, [task, open]);

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    if (title.length > 200) {
      setError('Title must be less than 200 characters');
      return;
    }

    if (description.length > 1000) {
      setError('Description must be less than 1000 characters');
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        dueDate: dueDate || undefined,
        tags: selectedTags,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save task');
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Toggle tag selection
   */
  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const content = (
    <DialogContent className="sm:max-w-[600px] bg-bg-card/80 backdrop-blur-xl border-2 border-primary-500/50 shadow-[0_0_50px_rgba(139,92,246,0.5)]">
      <DialogHeader>
        <DialogTitle
          className="text-2xl font-bold text-white"
          style={{
            background: 'linear-gradient(135deg, #c4b5fd 0%, #a78bfa 50%, #3b82f6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          {isEditing ? 'Edit Task' : 'Create New Task'}
        </DialogTitle>
        <DialogDescription className="text-text-secondary">
          {isEditing ? 'Update task details below' : 'Fill in the details to create a new task'}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-6 mt-4">
        {/* Error message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 p-3 bg-neon-red/10 border border-neon-red/30 rounded-lg text-neon-red text-sm"
          >
            <AlertCircle size={16} />
            <span>{error}</span>
          </motion.div>
        )}

        {/* Title input */}
        <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-semibold text-text-primary">
            Title <span className="text-neon-red">*</span>
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter task title..."
            className="w-full px-4 py-3 bg-white/5 border-2 border-primary-500/30 rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/70 shadow-[0_0_15px_rgba(139,92,246,0.2)] focus:shadow-[0_0_25px_rgba(139,92,246,0.4)] transition-all duration-200"
            maxLength={200}
            required
          />
          <p className="text-xs text-text-muted text-right">{title.length}/200</p>
        </div>

        {/* Description input */}
        <div className="space-y-2">
          <label htmlFor="description" className="text-sm font-semibold text-text-primary">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add task description (optional)..."
            rows={4}
            className="w-full px-4 py-3 bg-white/5 border-2 border-primary-500/30 rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/70 shadow-[0_0_15px_rgba(139,92,246,0.2)] focus:shadow-[0_0_25px_rgba(139,92,246,0.4)] transition-all duration-200 resize-none"
            maxLength={1000}
          />
          <p className="text-xs text-text-muted text-right">{description.length}/1000</p>
        </div>

        {/* Priority and Due Date row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Priority select */}
          <div className="space-y-2">
            <label htmlFor="priority" className="text-sm font-semibold text-text-primary">
              Priority
            </label>
            <Select value={priority} onValueChange={(value) => setPriority(value as Priority)}>
              <SelectTrigger className="w-full bg-white/5 border-white/10 text-text-primary focus:ring-primary-500/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-bg-card border-white/10">
                {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
                  <SelectItem
                    key={value}
                    value={value}
                    className="text-text-primary hover:bg-white/5 focus:bg-white/10"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: getPriorityColor(value as Priority) }}
                      />
                      {label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Due date input */}
          <div className="space-y-2">
            <label htmlFor="dueDate" className="text-sm font-semibold text-text-primary">
              Due Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
              <input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/5 border-2 border-primary-500/30 rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/70 shadow-[0_0_15px_rgba(139,92,246,0.2)] focus:shadow-[0_0_25px_rgba(139,92,246,0.4)] transition-all duration-200"
              />
            </div>
          </div>
        </div>

        {/* Tags section */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-text-primary flex items-center gap-2">
            <TagIcon size={16} />
            Tags
          </label>
          <div className="flex flex-wrap gap-2">
            {STANDARD_TAGS.map((tag) => {
              const isSelected = selectedTags.includes(tag.name);
              return (
                <button
                  key={tag.name}
                  type="button"
                  onClick={() => toggleTag(tag.name)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                    isSelected
                      ? 'bg-primary-500/20 text-primary-300 border-2 border-primary-500/50 shadow-[0_0_10px_rgba(139,92,246,0.3)]'
                      : 'bg-white/5 text-text-secondary border border-white/10 hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  {tag.name}
                </button>
              );
            })}
          </div>
          {selectedTags.length > 0 && (
            <p className="text-xs text-text-muted">
              {selectedTags.length} tag{selectedTags.length !== 1 ? 's' : ''} selected
            </p>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-text-secondary hover:bg-white/10 hover:text-text-primary transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !title.trim()}
            className="px-6 py-2 bg-gradient-to-r from-primary-500 to-neon-blue rounded-lg text-white font-semibold hover:shadow-[0_0_20px_rgba(139,92,246,0.5)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving...' : isEditing ? 'Update Task' : 'Create Task'}
          </button>
        </div>
      </form>
    </DialogContent>
  );

  if (trigger) {
    return (
      <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
        <DialogTrigger asChild>{trigger}</DialogTrigger>
        {content}
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      {content}
    </Dialog>
  );
}

export default TaskModal;
