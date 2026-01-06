/**
 * HistoryEntry Component
 *
 * Displays individual history entry with color-coded action badge.
 * Shows timestamp, action type, task name, and optional description.
 *
 * Action colors: CREATED=green, UPDATED=blue, COMPLETED=purple, INCOMPLETED=yellow, DELETED=red
 *
 * @see /specs/004-frontend-backend-integration/ - History entry display
 */

"use client";

import React from "react";
import { HistoryEntry as HistoryEntryType } from "@/services/api";
import {
  Plus,
  Edit,
  CheckCircle2,
  Circle,
  Trash2,
  Clock,
  X,
} from "lucide-react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";

interface HistoryEntryProps {
  entry: HistoryEntryType;
  index?: number;
  onDelete?: (historyId: string) => void;
}

/**
 * Get action badge styling based on action type
 */
function getActionBadge(actionType: string) {
  switch (actionType) {
    case "CREATED":
      return {
        color: "bg-green-500/15",
        dotColor: "bg-green-500",
        textColor: "text-green-400",
        borderColor: "border-green-500/30",
        icon: <Plus size={14} />,
      };
    case "UPDATED":
      return {
        color: "bg-yellow-500/15",
        dotColor: "bg-yellow-500",
        textColor: "text-yellow-400",
        borderColor: "border-yellow-500/30",
        icon: <Edit size={14} />,
      };
    case "COMPLETED":
      return {
        color: "bg-pink-500/20",
        dotColor: "bg-pink-500",
        textColor: "text-pink-400",
        borderColor: "border-pink-500/40",
        icon: <CheckCircle2 size={14} />,
      };
    case "INCOMPLETED":
      return {
        color: "bg-blue-500/15",
        dotColor: "bg-blue-500",
        textColor: "text-blue-400",
        borderColor: "border-blue-500/30",
        icon: <Circle size={14} />,
      };
    case "DELETED":
      return {
        color: "bg-red-500/15",
        dotColor: "bg-red-500",
        textColor: "text-red-400",
        borderColor: "border-red-500/30",
        icon: <Trash2 size={14} />,
      };
    default:
      return {
        color: "bg-gray-500/15",
        dotColor: "bg-gray-500",
        textColor: "text-gray-400",
        borderColor: "border-gray-500/30",
        icon: <Clock size={14} />,
      };
  }
}

export default function HistoryEntry({ entry, index = 0, onDelete }: HistoryEntryProps) {
  const { action_type, task_id, task_title, description, timestamp, history_id } = entry;
  const badge = getActionBadge(action_type);

  // Format timestamp
  const date = new Date(timestamp);
  const formattedDate = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const formattedTime = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="relative pl-10 pb-6 last:pb-0"
    >
      {/* Timeline Line */}
      <div className="absolute left-3 top-3 bottom-0 w-px bg-gradient-to-b from-[var(--border)] to-transparent" />

      {/* Timeline Dot */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: index * 0.05 + 0.1, type: "spring", stiffness: 200 }}
        className={`absolute left-0 top-1 w-6 h-6 rounded-full ${badge.dotColor} flex items-center justify-center ring-4 ring-[var(--bg-dark)]`}
      >
        <div className="text-white">{badge.icon}</div>
      </motion.div>

      {/* Entry Card */}
      <GlassCard
        variant="elevated"
        className={`p-4 hover:border-[var(--primary)]/50 transition-all duration-300`}
      >
        <div className="flex items-start justify-between gap-4 mb-2">
          {/* Action Badge and Task Title */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${badge.color} ${badge.textColor} border ${badge.borderColor}`}>
                {badge.icon}
                {action_type}
              </span>
            </div>
            {/* Task Title */}
            <h3 className="text-base font-medium text-text-primary truncate">
              {task_title || 'Unknown Task'}
            </h3>
          </div>

          {/* Actions: Timestamp and Delete Button */}
          <div className="flex items-start gap-3 flex-shrink-0">
            {/* Timestamp */}
            <div className="text-right">
              <div className="text-sm text-text-primary">{formattedDate}</div>
              <div className="text-xs text-text-secondary flex items-center justify-end gap-1 mt-1">
                <Clock size={11} />
                {formattedTime}
              </div>
            </div>

            {/* Delete/Clear Button */}
            {onDelete && (
              <button
                onClick={() => onDelete(history_id)}
                className="p-1.5 text-text-secondary hover:text-red-400 hover:bg-red-500/10 rounded transition-all duration-200 group"
                aria-label="Clear this history entry"
                title="Clear this history entry"
              >
                <X size={15} className="group-hover:scale-110 transition-transform" />
              </button>
            )}
          </div>
        </div>

        {/* Task ID */}
        {task_id && (
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium text-primary-400 bg-primary-500/10 px-2 py-0.5 rounded">
              Task ID
            </span>
            <code className="text-xs font-mono text-text-muted bg-[var(--bg-dark)] px-2 py-0.5 rounded">
              {task_id.substring(0, 8)}...
            </code>
          </div>
        )}

        {/* Description */}
        {description && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.05 + 0.2 }}
            className="text-sm text-text-secondary leading-relaxed pl-3 border-l-2 border-primary-500/30 ml-1"
          >
            {description}
          </motion.p>
        )}
      </GlassCard>
    </motion.div>
  );
}
