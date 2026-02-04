/**
 * PriorityBadge Component
 *
 * Displays task priority with color-coded styling according to design system specifications.
 *
 * Design Specs:
 * - Border radius: 4px (rounded)
 * - Padding: 2px 8px (px-2 py-0.5)
 * - Font weight: 600 (font-semibold)
 * - Font size: 12px (text-xs)
 * - Color-coded backgrounds using PRIORITY_COLORS
 *
 * @module components/tasks/PriorityBadge
 */

import React from 'react';
import type { Priority } from '@/types/task.types';
import { PRIORITY_LABELS } from '@/types/task.types';
import { getPriorityColor, getPriorityBgColor } from '@/utils/priorityColors';

/**
 * PriorityBadge props
 */
interface PriorityBadgeProps {
  /** Priority level (VERY_IMPORTANT, HIGH, MEDIUM, LOW) */
  priority: Priority;
  /** Optional className for additional styling */
  className?: string;
}

/**
 * PriorityBadge component
 *
 * Renders a color-coded badge displaying the task priority level.
 *
 * @example
 * <PriorityBadge priority="VERY_IMPORTANT" />
 * // Renders: Purple badge with "Very Important" text
 *
 * <PriorityBadge priority="HIGH" />
 * // Renders: Red badge with "High" text
 *
 * @param props - Component props
 * @returns Priority badge element
 */
export function PriorityBadge({ priority, className = '' }: PriorityBadgeProps) {
  const color = getPriorityColor(priority);
  const bgColor = getPriorityBgColor(priority);
  const label = PRIORITY_LABELS[priority];

  // Neon glow based on priority
  const glowStyles = {
    VERY_IMPORTANT: 'shadow-[0_0_10px_rgba(168,85,247,0.4)]',
    HIGH: 'shadow-[0_0_8px_rgba(59,130,246,0.3)]',
    MEDIUM: 'shadow-[0_0_6px_rgba(6,182,212,0.3)]',
    LOW: 'shadow-[0_0_4px_rgba(16,185,129,0.2)]',
  };

  return (
    <span
      className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold transition-all duration-200 hover:scale-105 ${glowStyles[priority]} ${className}`}
      style={{
        color: color,
        backgroundColor: bgColor,
        border: `1px solid ${color}60`, // 60 = ~40% opacity
      }}
      aria-label={`Priority: ${label}`}
    >
      {label}
    </span>
  );
}

/**
 * Priority badge with pulse animation for VERY_IMPORTANT tasks
 *
 * Used to draw attention to critical tasks.
 *
 * @example
 * <PriorityBadgeWithPulse priority="VERY_IMPORTANT" />
 * // Renders: Purple badge with pulsing animation
 */
export function PriorityBadgeWithPulse({ priority, className = '' }: PriorityBadgeProps) {
  const shouldPulse = priority === 'VERY_IMPORTANT';

  return (
    <span className={shouldPulse ? 'animate-pulse' : ''}>
      <PriorityBadge priority={priority} className={className} />
    </span>
  );
}

export default PriorityBadge;
