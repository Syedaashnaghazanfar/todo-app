/**
 * Priority Color Constants
 *
 * Defines color mappings for each priority level for consistent visual styling.
 * Colors are in hex format and follow the purple-red accent theme.
 *
 * @module utils/priorityColors
 */

import type { Priority } from '@/types/task.types';

/**
 * Priority color mapping - Cyberpunk Neon Edition
 *
 * Colors:
 * - VERY_IMPORTANT: #A855F7 (neon-purple) - High contrast, urgent attention
 * - HIGH: #3B82F6 (neon-blue) - Alert, important
 * - MEDIUM: #06B6D4 (neon-cyan) - Moderate attention
 * - LOW: #10B981 (neon-green) - Minimal attention
 */
export const PRIORITY_COLORS: Record<Priority, string> = {
  VERY_IMPORTANT: '#A855F7',
  HIGH: '#3B82F6',
  MEDIUM: '#06B6D4',
  LOW: '#10B981',
} as const;

/**
 * Priority background color mapping (lighter variants for backgrounds)
 *
 * Colors are 15% opacity versions of primary colors for neon glow effect
 */
export const PRIORITY_BG_COLORS: Record<Priority, string> = {
  VERY_IMPORTANT: 'rgba(168, 85, 247, 0.15)',
  HIGH: 'rgba(59, 130, 246, 0.15)',
  MEDIUM: 'rgba(6, 182, 212, 0.15)',
  LOW: 'rgba(16, 185, 129, 0.15)',
} as const;

/**
 * Priority border color mapping (for cards, badges, etc.)
 *
 * Colors are 40% opacity versions of primary colors for visible neon borders
 */
export const PRIORITY_BORDER_COLORS: Record<Priority, string> = {
  VERY_IMPORTANT: 'rgba(168, 85, 247, 0.4)',
  HIGH: 'rgba(59, 130, 246, 0.4)',
  MEDIUM: 'rgba(6, 182, 212, 0.4)',
  LOW: 'rgba(16, 185, 129, 0.4)',
} as const;

/**
 * Get color for a priority level
 *
 * @param priority - The priority level
 * @returns Hex color string
 */
export function getPriorityColor(priority: Priority): string {
  return PRIORITY_COLORS[priority];
}

/**
 * Get background color for a priority level
 *
 * @param priority - The priority level
 * @returns RGBA color string
 */
export function getPriorityBgColor(priority: Priority): string {
  return PRIORITY_BG_COLORS[priority];
}

/**
 * Get border color for a priority level
 *
 * @param priority - The priority level
 * @returns RGBA color string
 */
export function getPriorityBorderColor(priority: Priority): string {
  return PRIORITY_BORDER_COLORS[priority];
}
