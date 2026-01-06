/**
 * Tasks Page - Cyberpunk Neon Elegance Theme
 *
 * Enhanced with glassmorphism and neon effects.
 * Preserves all task management functionality and backend integration.
 *
 * BUGFIX: Added useProtectedRoute to prevent redirect loop after logout
 */

'use client';

import React, { useState } from 'react';
import { Plus, ListTodo, SlidersHorizontal, TrendingUp, ArrowLeft, Filter, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { TaskModal } from '@/components/tasks/TaskModal';
import { FilterDropdown } from '@/components/tasks/FilterDropdown';
import { TaskList, TaskListSummary } from '@/components/tasks/TaskList';
import { SortControls } from '@/components/tasks/SortControls';
import { TaskListSkeleton } from '@/components/shared/LoadingSkeleton';
import MetricCard from '@/components/analytics/MetricCard';
import { ChatPanel } from '@/components/chat/ChatPanel';
import { useTasks } from '@/hooks/useTasks';
import { useFilters } from '@/hooks/useFilters';
import { useSort } from '@/hooks/useSort';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { PurpleSpinner } from '@/components/shared/PurpleSpinner';
import { GlassCard } from '@/components/ui/glass-card';
import { NeonButton } from '@/components/ui/neon-button';
import { fadeInUp, staggerContainer } from '@/lib/animations';
import type { Task, TaskStatus, Priority } from '@/types/task.types';


/**
 * Tasks page component
 */
export default function TasksPage() {
  const router = useRouter();
  const { isLoading: authLoading } = useProtectedRoute();
  const { tasks, loading, createTask, updateTask, deleteTask, toggleTaskStatus } = useTasks();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Apply filters
  const {
    filterState,
    filteredTasks,
    activeFilterCount,
    toggleStatusFilter,
    togglePriorityFilter,
    setDueDateFilter,
    toggleTagFilter,
    clearAllFilters,
  } = useFilters(tasks);

  // Apply sorting to filtered tasks
  const {
    sortState,
    sortedTasks,
    setSortField,
    toggleDirection,
  } = useSort(filteredTasks);

  // Show loading spinner while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <PurpleSpinner size="lg" />
      </div>
    );
  }

  /**
   * Handle create task
   */
  const handleCreateTask = async (taskData: Partial<Task>) => {
    await createTask({
      title: taskData.title!,
      description: taskData.description,
      due_date: taskData.dueDate,
      tags: taskData.tags,
    });
    setShowCreateModal(false);
  };

  /**
   * Handle update task
   */
  const handleUpdateTask = async (taskData: Partial<Task>) => {
    if (!editingTask) return;
    await updateTask(editingTask.id, {
      title: taskData.title!,
      description: taskData.description,
      due_date: taskData.dueDate,
      tags: taskData.tags,
    });
    setEditingTask(null);
  };

  /**
   * Handle delete task
   */
  const handleDeleteTask = async (taskId: string) => {
    await deleteTask(taskId);
  };

  /**
   * Handle toggle status
   */
  const handleToggleStatus = async (taskId: string) => {
    await toggleTaskStatus(taskId);
  };

  /**
   * Handle edit task
   */
  const handleEditTask = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      setEditingTask(task);
    }
  };

  // Calculate stats for metric cards
  const completedTasks = tasks.filter(t => t.status === 'COMPLETED').length;
  const incompleteTasks = tasks.length - completedTasks;
  const todayTasks = tasks.filter(t => {
    if (!t.dueDate) return false;
    const today = new Date().toDateString();
    const taskDate = new Date(t.dueDate).toDateString();
    return today === taskDate;
  }).length;

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Vibrant Animated Neon Background */}

      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => router.push("/")}
          className="mb-6 flex items-center gap-2 var(--text-secondary) hover:var(--text-secondary) font-medium transition-all duration-300 hover:gap-3 focus:outline-none focus:ring-2 focus:ring-var(--accent-tasks)/50 rounded px-2 py-1"
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </motion.button>

        {/* Page Header */}
        <motion.div
          initial="initial"
          animate="animate"
          variants={staggerContainer}
          className="mb-10"
        >
          <motion.div variants={fadeInUp} className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-[var(--bg-elevated)]/30 backdrop-blur-sm border border-[var(--border)]/30 rounded-xl shadow-[0_0_20px_rgba(139,92,246,0.3)]">
              <ListTodo className="h-8 w-8 var(--text-secondary) drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
            </div>
            <div>
              <h1
                className="text-4xl md:text-5xl font-bold var(--text-inverted)"
                style={{
                  background: 'linear-gradient(135deg, #c4b5fd 0%, #a78bfa 50%, #3b82f6 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Tasks
              </h1>
              <p className="var(--text-secondary) mt-1 flex items-center gap-2">
                <TrendingUp size={16} className="var(--text-secondary)" />
                Organize and manage your tasks with smart priority classification
              </p>
            </div>
          </motion.div>
        </motion.div>

        {/* Metric Cards - Like Analytics Page */}
        {tasks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="Total Tasks"
                value={tasks.length}
                type="total"
              />
              <MetricCard
                title="Completed"
                value={completedTasks}
                type="completed"
              />
              <MetricCard
                title="Incomplete"
                value={incompleteTasks}
                type="incomplete"
              />
              <MetricCard
                title="Due Today"
                value={todayTasks}
                type="created"
              />
            </div>
          </motion.div>
        )}

        {/* Action Bar - Create Task & Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-6"
        >
          {/* Create Task Button */}
          <NeonButton
            variant="primary"
            size="lg"
            glow
            icon={<Plus className="w-5 h-5" />}
            onClick={() => setShowCreateModal(true)}
            className="flex-1 sm:flex-none"
          >
            Create New Task
          </NeonButton>

          {/* Filter Dropdown */}
          <div className="flex-1">
            <FilterDropdown
              filters={{
                status: filterState.status as TaskStatus[],
                priority: filterState.priority as Priority[],
                dueDate: 'all' as 'all' | 'overdue' | 'today' | 'this_week', // TODO: Map from filterState
              }}
              onStatusChange={(status) => {
                status.forEach(s => toggleStatusFilter(s));
              }}
              onPriorityChange={(priority) => {
                priority.forEach(p => togglePriorityFilter(p));
              }}
              onDueDateChange={(dueDate) => {
                // FilterDropdown uses single value, but useFilters expects array-based toggle
                // For now, just use setDueDateFilter
                console.log('Due date filter changed:', dueDate);
              }}
              onClearAll={clearAllFilters}
            />
          </div>
        </motion.div>

        {/* Sort Controls */}
        {sortedTasks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-6"
          >
            <SortControls
              sortState={sortState}
              onSortFieldChange={setSortField}
              onToggleDirection={toggleDirection}
            />
          </motion.div>
        )}

        {/* Task List with Loading State */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {loading ? (
            <TaskListSkeleton count={5} />
          ) : (
            <TaskList
              tasks={sortedTasks}
              onToggleStatus={handleToggleStatus}
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
              loading={false}
            />
          )}
        </motion.div>

        {/* Task Modals */}
        <TaskModal
          open={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateTask}
        />
        <TaskModal
          open={!!editingTask}
          onClose={() => setEditingTask(null)}
          onSubmit={handleUpdateTask}
          task={editingTask || undefined}
        />

        {/* Floating Chat Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="fixed bottom-8 right-8 z-30"
        >
          <button
            onClick={() => setIsChatOpen(true)}
            className="p-4 bg-gradient-to-br background: linear-gradient(135deg, var(--accent-tasks), #2563eb) rounded-full box-shadow: var(--shadow-lg) box-shadow: var(--shadow-xl) transition-all duration-300 hover:scale-110 group"
            aria-label="Open AI chat assistant"
          >
            <MessageCircle className="w-6 h-6 var(--text-inverted) group-hover:rotate-12 transition-transform" />
          </button>
        </motion.div>

        {/* Chat Panel */}
        <ChatPanel isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
      </div>
    </div>
  );
}
