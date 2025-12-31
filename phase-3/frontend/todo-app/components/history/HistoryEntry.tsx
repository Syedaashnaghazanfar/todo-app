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

interface HistoryEntryProps {
  entry: HistoryEntryType;
  index?: number;
  onDelete?: (historyId: string) => void;
}

/**
 * Get action badge styling based on action type - Neon Edition
 */
function getActionBadge(actionType: string) {
  switch (actionType) {
    case "CREATED":
      return {
        color: "bg-neon-green/20",
        dotColor: "bg-neon-green",
        textColor: "text-neon-green",
        borderColor: "border-neon-green/60",
        glowColor: "shadow-[0_0_35px_rgba(16,185,129,0.7)]",
        timelineColor: "from-neon-green/50 via-neon-green/25",
        icon: <Plus size={16} className="drop-shadow-[0_0_12px_rgba(16,185,129,0.9)]" />,
      };
    case "UPDATED":
      return {
        color: "bg-neon-blue/20",
        dotColor: "bg-neon-blue",
        textColor: "text-neon-blue",
        borderColor: "border-neon-blue/60",
        glowColor: "shadow-[0_0_35px_rgba(59,130,246,0.7)]",
        timelineColor: "from-neon-blue/50 via-neon-blue/25",
        icon: <Edit size={16} className="drop-shadow-[0_0_12px_rgba(59,130,246,0.9)]" />,
      };
    case "COMPLETED":
      return {
        color: "bg-neon-yellow/20",
        dotColor: "bg-neon-yellow",
        textColor: "text-neon-yellow",
        borderColor: "border-neon-yellow/60",
        glowColor: "shadow-[0_0_35px_rgba(245,158,11,0.7)]",
        timelineColor: "from-neon-yellow/50 via-neon-yellow/25",
        icon: <CheckCircle2 size={16} className="drop-shadow-[0_0_12px_rgba(245,158,11,0.9)]" />,
      };
    case "INCOMPLETED":
      return {
        color: "bg-neon-blue/20",
        dotColor: "bg-neon-blue",
        textColor: "text-neon-blue",
        borderColor: "border-neon-blue/50",
        glowColor: "shadow-[0_0_30px_rgba(59,130,246,0.6)]",
        timelineColor: "from-neon-blue/40 via-neon-blue/20",
        icon: <Circle size={16} className="drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]" />,
      };
    case "DELETED":
      return {
        color: "bg-neon-red/20",
        dotColor: "bg-neon-red",
        textColor: "text-neon-red",
        borderColor: "border-neon-red/60",
        glowColor: "shadow-[0_0_35px_rgba(239,68,68,0.7)]",
        timelineColor: "from-neon-red/50 via-neon-red/25",
        icon: <Trash2 size={16} className="drop-shadow-[0_0_12px_rgba(239,68,68,0.9)]" />,
      };
    default:
      return {
        color: "bg-white/10",
        dotColor: "bg-text-muted",
        textColor: "text-text-muted",
        borderColor: "border-white/10",
        glowColor: "shadow-sm",
        timelineColor: "from-white/20 via-white/10",
        icon: <Clock size={16} />,
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
      className="relative pl-10 pb-8 last:pb-0"
    >
      {/* Timeline Line with gradient */}
      <div className={`absolute left-3.5 top-0 bottom-0 w-0.5 bg-gradient-to-b ${badge.timelineColor} to-transparent`} />

      {/* Timeline Dot with neon glow */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: index * 0.05 + 0.2, type: "spring", stiffness: 200 }}
        className={`absolute left-0 top-2 w-7 h-7 rounded-full ${badge.dotColor} flex items-center justify-center ring-4 ring-bg-dark ${badge.glowColor}`}
      >
        <div className="text-white">{badge.icon}</div>
      </motion.div>

      {/* Entry Card with glassmorphism */}
      <motion.div
        whileHover={{ scale: 1.01, x: 4 }}
        className={`bg-white/5 backdrop-blur-sm rounded-xl ${badge.glowColor} hover:bg-white/8 transition-all duration-300 border-2 ${badge.borderColor} overflow-hidden`}
      >
        <div className="p-5">
          <div className="flex items-start justify-between gap-4 mb-3">
            {/* Action Badge and Task Title */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${badge.color} ${badge.textColor} border ${badge.borderColor}`}>
                  {badge.icon}
                  {action_type}
                </span>
              </div>
              {/* Task Title */}
              <h3 className="text-base font-semibold text-text-primary truncate">
                {task_title || 'Unknown Task'}
              </h3>
            </div>

            {/* Actions: Timestamp and Delete Button */}
            <div className="flex items-start gap-3 flex-shrink-0">
              {/* Timestamp */}
              <div className="text-right">
                <div className="text-sm font-semibold text-text-primary">{formattedDate}</div>
                <div className="text-xs text-text-secondary flex items-center justify-end gap-1 mt-1">
                  <Clock size={12} />
                  {formattedTime}
                </div>
              </div>

              {/* Delete/Clear Button */}
              {onDelete && (
                <button
                  onClick={() => onDelete(history_id)}
                  className="p-1.5 text-text-secondary hover:text-neon-red hover:bg-neon-red/10 rounded transition-all duration-200 group"
                  aria-label="Clear this history entry"
                  title="Clear this history entry"
                >
                  <X size={16} className="group-hover:scale-110 transition-transform" />
                </button>
              )}
            </div>
          </div>

          {/* Task ID (smaller, optional) */}
          {task_id && (
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-medium text-primary-400 bg-primary-500/10 px-2 py-1 rounded border border-primary-500/20">
                Task ID
              </span>
              <code className="text-xs font-mono text-text-muted bg-white/5 px-2 py-1 rounded border border-white/10">
                {task_id.substring(0, 8)}...
              </code>
            </div>
          )}

          {/* Description */}
          {description && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.05 + 0.3 }}
              className="text-sm text-text-secondary leading-relaxed pl-3 border-l-2 border-primary-500/30 ml-2"
            >
              {description}
            </motion.p>
          )}
        </div>

        {/* Gradient Overlay at Bottom */}
        <div className={`h-1 bg-gradient-to-r ${badge.timelineColor} to-transparent`} />
      </motion.div>
    </motion.div>
  );
}
