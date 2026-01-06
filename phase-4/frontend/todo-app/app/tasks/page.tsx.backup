/**
 * Tasks Management Page
 *
 * Displays a list of tasks with CRUD operations.
 * Integrates with the backend API using the useTasks hook.
 *
 * @see /specs/001-phase2-homepage-ui/ - Frontend integration
 */

"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTasks } from "@/hooks/useTasks";
import { Task } from "@/services/api";
import { CheckCircle2, Circle, Trash2, Plus, ArrowLeft, ListTodo, TrendingUp, Edit2, Save, X } from "lucide-react";
import { showConfirm } from "@/components/notifications/alerts";
import { motion } from "framer-motion";

/**
 * Tasks Page Component
 */
export default function TasksPage() {
  const router = useRouter();

  const {
    tasks,
    loading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    completeTask,
    incompleteTask,
    deleteTask,
    clearError,
  } = useTasks();

  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDesc, setNewTaskDesc] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Fetch tasks on mount
  useEffect(() => {
    fetchTasks();
  }, []);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      setIsCreating(true);
      await createTask(newTaskTitle, newTaskDesc || undefined);
      setNewTaskTitle("");
      setNewTaskDesc("");
      // Refresh task list
      await fetchTasks();
    } catch (err) {
      console.error("Failed to create task:", err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      const task = tasks.find((t) => t.id === taskId);
      if (task?.is_completed) {
        await incompleteTask(taskId);
      } else {
        await completeTask(taskId);
      }
    } catch (err) {
      console.error("Failed to update task status:", err);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    const confirmed = await showConfirm(
      "Delete Task?",
      "This action cannot be undone."
    );
    if (confirmed) {
            try {
        await deleteTask(taskId);
      } catch (err) {
        console.error("Failed to delete task:", err);
      }
    }
  };

  const handleUpdateTask = async (taskId: string, title: string, description?: string) => {
    try {
      await updateTask(taskId, title, description);
      // Refresh task list
      await fetchTasks();
    } catch (err) {
      console.error("Failed to update task:", err);
    }
  };

  const handleViewTask = (taskId: string) => {
    router.push(`/tasks/${taskId}`);
  };

  const incompleteTasks = tasks.filter((t) => !t.is_completed);
  const completedTasks = tasks.filter((t) => t.is_completed);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header with Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => router.push("/")}
          className="mb-6 flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium transition-colors group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </motion.button>

        {/* Page Header with Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-10"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
              <ListTodo className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                My Tasks
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1 flex items-center gap-2">
                <TrendingUp size={16} className="text-purple-500" />
                Manage your tasks and stay productive
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          {!loading && tasks.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6"
            >
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md border border-purple-100 dark:border-purple-900">
                <div className="text-sm text-gray-500 dark:text-gray-400">Total Tasks</div>
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                  {tasks.length}
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md border border-purple-100 dark:border-purple-900">
                <div className="text-sm text-gray-500 dark:text-gray-400">Active</div>
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                  {incompleteTasks.length}
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md border border-purple-100 dark:border-purple-900">
                <div className="text-sm text-gray-500 dark:text-gray-400">Completed</div>
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                  {completedTasks.length}
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Error Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg shadow-sm"
          >
            <p className="font-medium">{error}</p>
            <button
              onClick={clearError}
              className="mt-2 text-sm underline hover:no-underline"
            >
              Dismiss
            </button>
          </motion.div>
        )}

        {/* Create Task Form */}
        <motion.form
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onSubmit={handleCreateTask}
          className="mb-8"
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-purple-100 dark:border-purple-900">
            <h2 className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
              Add New Task
            </h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Task title..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="w-full px-4 py-3 border-2 border-purple-200 dark:border-purple-800 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
              <textarea
                placeholder="Task description (optional)..."
                value={newTaskDesc}
                onChange={(e) => setNewTaskDesc(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border-2 border-purple-200 dark:border-purple-800 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
              <button
                type="submit"
                disabled={isCreating || !newTaskTitle.trim()}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-md hover:shadow-lg disabled:shadow-none flex items-center justify-center gap-2"
              >
                <Plus size={20} />
                {isCreating ? "Creating..." : "Create Task"}
              </button>
            </div>
          </div>
        </motion.form>

        {/* Loading State */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="inline-block">
              <div className="h-16 w-16 animate-spin rounded-full border-4 border-purple-200 border-t-purple-600 shadow-lg" />
            </div>
            <p className="mt-6 text-lg font-medium text-purple-600 dark:text-purple-400">
              Loading your tasks...
            </p>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Getting everything ready for you
            </p>
          </motion.div>
        )}

        {/* Tasks List */}
        {!loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="space-y-8"
          >
            {/* Incomplete Tasks */}
            {incompleteTasks.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6 flex items-center gap-2">
                  <Circle className="h-6 w-6 text-purple-500" />
                  Active Tasks ({incompleteTasks.length})
                </h2>
                <div className="space-y-3">
                  {incompleteTasks.map((task, index) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <TaskItem
                        task={task}
                        onToggleComplete={() => handleCompleteTask(task.id)}
                        onUpdate={handleUpdateTask}
                        onDelete={() => handleDeleteTask(task.id)}
                        onViewDetail={() => handleViewTask(task.id)}
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Completed Tasks */}
            {completedTasks.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6 flex items-center gap-2">
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                  Completed Tasks ({completedTasks.length})
                </h2>
                <div className="space-y-3">
                  {completedTasks.map((task, index) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <TaskItem
                        task={task}
                        onToggleComplete={() => handleCompleteTask(task.id)}
                        onUpdate={handleUpdateTask}
                        onDelete={() => handleDeleteTask(task.id)}
                        onViewDetail={() => handleViewTask(task.id)}
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* No Tasks - Enhanced Empty State */}
            {tasks.length === 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="text-center py-20 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-purple-100 dark:border-purple-900"
              >
                <div className="flex justify-center mb-6">
                  <div className="p-6 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-full">
                    <ListTodo className="h-16 w-16 text-purple-500" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
                  No Tasks Yet
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-lg">
                  Create your first task to get started on your productivity journey!
                </p>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

/**
 * Task Item Component
 */
interface TaskItemProps {
  task: Task;
  onToggleComplete: () => void;
  onUpdate: (taskId: string, title: string, description?: string) => Promise<void>;
  onDelete: () => void;
  onViewDetail: () => void;
}

function TaskItem({ task, onToggleComplete, onUpdate, onDelete, onViewDetail }: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!editTitle.trim()) return;

    try {
      setIsSaving(true);
      await onUpdate(task.id, editTitle, editDescription || undefined);
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to update task:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditTitle(task.title);
    setEditDescription(task.description || "");
    setIsEditing(false);
  };

  return (
    <motion.div
      whileHover={{ scale: 1.01, x: 4 }}
      transition={{ type: "spring", stiffness: 300 }}
      className={`relative bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 flex items-start gap-4 border-l-4 ${
        task.is_completed
          ? "border-green-500 dark:border-green-600"
          : "border-purple-500 dark:border-purple-600"
      } hover:shadow-xl transition-all duration-300 group overflow-hidden`}
    >
      {/* Checkbox */}
      <button
        onClick={onToggleComplete}
        className="mt-1 flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-purple-500 rounded-full transition-transform hover:scale-110"
        aria-label={task.is_completed ? "Mark incomplete" : "Mark complete"}
        disabled={isEditing}
      >
        {task.is_completed ? (
          <CheckCircle2 className="h-7 w-7 text-green-500 drop-shadow-md" />
        ) : (
          <Circle className="h-7 w-7 text-gray-400 group-hover:text-purple-500 transition-colors" />
        )}
      </button>

      {/* Content */}
      {isEditing ? (
        <div className="flex-1 min-w-0 space-y-3">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="w-full px-3 py-2 border-2 border-purple-300 dark:border-purple-700 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Task title..."
            autoFocus
          />
          <textarea
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            className="w-full px-3 py-2 border-2 border-purple-300 dark:border-purple-700 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Task description (optional)..."
            rows={3}
          />
        </div>
      ) : (
        <div className="flex-1 min-w-0 cursor-pointer" onClick={onViewDetail}>
          <h3
            className={`text-xl font-semibold mb-2 transition-colors ${
              task.is_completed
                ? "line-through text-gray-400 dark:text-gray-500"
                : "text-gray-900 dark:text-white group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-pink-600 group-hover:bg-clip-text group-hover:text-transparent"
            }`}
          >
            {task.title}
          </h3>
          {task.description && (
            <p className={`text-sm mt-2 pb-3 border-l-2 pl-3 ${
              task.is_completed
                ? "border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400"
                : "border-purple-300 dark:border-purple-700 text-gray-600 dark:text-gray-300"
            }`}>
              {task.description}
            </p>
          )}
          <div className="flex items-center gap-4 mt-3 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <div className="h-1 w-1 rounded-full bg-purple-500" />
              Created {new Date(task.created_at).toLocaleDateString()}
            </span>
            {task.is_completed && task.completed_at && (
              <span className="flex items-center gap-1">
                <div className="h-1 w-1 rounded-full bg-green-500" />
                Completed {new Date(task.completed_at).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {isEditing ? (
        <div className="flex-shrink-0 flex gap-2">
          <button
            onClick={handleSave}
            disabled={isSaving || !editTitle.trim()}
            className="text-green-600 hover:text-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 rounded-lg p-2 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Save changes"
          >
            <Save size={22} />
          </button>
          <button
            onClick={handleCancel}
            disabled={isSaving}
            className="text-gray-600 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 rounded-lg p-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Cancel editing"
          >
            <X size={22} />
          </button>
        </div>
      ) : (
        <div className="flex-shrink-0 flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}
            className="text-purple-600 hover:text-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 rounded-lg p-2 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all"
            aria-label="Edit task"
          >
            <Edit2 size={22} />
          </button>
          <button
            onClick={onDelete}
            className="text-gray-400 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 rounded-lg p-2 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
            aria-label="Delete task"
          >
            <Trash2 size={22} />
          </button>
        </div>
      )}

      {/* Bottom Accent Bar */}
      <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${
        task.is_completed
          ? "from-green-400 to-emerald-500"
          : "from-purple-400 to-pink-500"
      } rounded-b-xl opacity-0 group-hover:opacity-100 transition-opacity`} />
    </motion.div>
  );
}
