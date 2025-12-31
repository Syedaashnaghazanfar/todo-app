/**
 * MetricCard Component
 *
 * Displays a metric card with icon, title, and value.
 * Used for total completed/incomplete task counts.
 *
 * Completed: CheckCircle2 icon with purple background
 * Incomplete: Circle icon with gray background
 *
 * @see /specs/004-frontend-backend-integration/ - Metric cards display
 */

"use client";

import React from "react";
import { CheckCircle2, Circle, ListTodo, Plus } from "lucide-react";
import { motion } from "framer-motion";

interface MetricCardProps {
  title: string;
  value: number;
  type: "completed" | "incomplete" | "total" | "created";
}

export default function MetricCard({ title, value, type }: MetricCardProps) {
  const config = {
    completed: {
      icon: <CheckCircle2 size={32} className="text-neon-green drop-shadow-[0_0_12px_rgba(16,185,129,0.8)]" />,
      gradient: "from-neon-green/20 to-neon-green/5",
      textColor: "text-neon-green",
      borderColor: "border-neon-green/50",
      glowColor: "shadow-[0_0_25px_rgba(16,185,129,0.4)]",
      message: "Great progress!"
    },
    incomplete: {
      icon: <Circle size={32} className="text-neon-yellow drop-shadow-[0_0_12px_rgba(245,158,11,0.8)]" />,
      gradient: "from-neon-yellow/20 to-neon-yellow/5",
      textColor: "text-neon-yellow",
      borderColor: "border-neon-yellow/50",
      glowColor: "shadow-[0_0_25px_rgba(245,158,11,0.4)]",
      message: "Keep going!"
    },
    total: {
      icon: <ListTodo size={32} className="text-primary-400 drop-shadow-[0_0_12px_rgba(168,85,247,0.8)]" />,
      gradient: "from-primary-500/20 to-primary-500/5",
      textColor: "text-primary-400",
      borderColor: "border-primary-500/50",
      glowColor: "shadow-[0_0_25px_rgba(139,92,246,0.4)]",
      message: "All tasks"
    },
    created: {
      icon: <Plus size={32} className="text-neon-cyan drop-shadow-[0_0_12px_rgba(6,182,212,0.8)]" />,
      gradient: "from-neon-cyan/20 to-neon-cyan/5",
      textColor: "text-neon-cyan",
      borderColor: "border-neon-cyan/50",
      glowColor: "shadow-[0_0_25px_rgba(6,182,212,0.4)]",
      message: "This week"
    }
  }[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.03, y: -6 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`relative bg-white/5 backdrop-blur-sm rounded-xl p-6 border-2 ${config.borderColor} ${config.glowColor} hover:bg-white/8 transition-all group overflow-hidden`}
    >
      {/* Background gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-50 group-hover:opacity-70 transition-opacity`} />

      <div className="relative z-10">
        <div className="flex items-center gap-4 mb-4">
          {/* Icon */}
          <motion.div
            whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
            transition={{ duration: 0.5 }}
            className="flex-shrink-0 w-16 h-16 rounded-xl flex items-center justify-center bg-white/5 backdrop-blur-sm border border-white/10"
          >
            {config.icon}
          </motion.div>

          {/* Content */}
          <div className="flex-1">
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              {title}
            </p>
            <motion.p
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className={`text-4xl font-bold ${config.textColor} mt-1 drop-shadow-[0_0_10px_currentColor]`}
            >
              {value}
            </motion.p>
          </div>
        </div>

        {/* Bottom Accent */}
        <div className="pt-3 border-t border-white/10">
          <div className="text-xs text-text-secondary flex items-center gap-2">
            <motion.span
              animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
              className={`h-2 w-2 rounded-full ${config.textColor}`}
            />
            <span>{config.message}</span>
          </div>
        </div>
      </div>

      {/* Hover Gradient Bar */}
      <motion.div
        initial={{ scaleX: 0 }}
        whileHover={{ scaleX: 1 }}
        transition={{ duration: 0.3 }}
        className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${config.gradient} rounded-b-xl origin-left`}
      />
    </motion.div>
  );
}
