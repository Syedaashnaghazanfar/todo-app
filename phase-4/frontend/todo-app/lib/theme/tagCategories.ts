/**
 * Tag Categories Configuration
 * Phase 3 Todo App - UI Redesign
 *
 * Defines which tags display icons and their associated icon mappings.
 * Category tags show icons; custom tags display as text only.
 */

import {
  Briefcase,
  BookOpen,
  Heart,
  DollarSign,
  AlertTriangle,
  Tag,
} from 'lucide-react';

/* ========================================
   CATEGORY TAG DEFINITIONS
   Tags that display icons in the UI
   ======================================== */

export const TAG_CATEGORIES = {
  Work: {
    icon: Briefcase,
    color: 'blue',
    label: 'Work',
  },
  Learning: {
    icon: BookOpen,
    color: 'green',
    label: 'Learning',
  },
  Health: {
    icon: Heart,
    color: 'red',
    label: 'Health',
  },
  Finance: {
    icon: DollarSign,
    color: 'emerald',
    label: 'Finance',
  },
  Urgent: {
    icon: AlertTriangle,
    color: 'amber',
    label: 'Urgent',
  },
} as const;

/* ========================================
   HELPER FUNCTIONS
   ======================================== */

/**
 * Check if a tag is a category tag that should display an icon
 */
export function isCategoryTag(tag: string): boolean {
  const normalizedTag = tag.charAt(0).toUpperCase() + tag.slice(1).toLowerCase();
  return normalizedTag in TAG_CATEGORIES;
}

/**
 * Get the category tag configuration
 */
export function getCategoryTagConfig(tag: string) {
  const normalizedTag = tag.charAt(0).toUpperCase() + tag.slice(1).toLowerCase();
  if (normalizedTag in TAG_CATEGORIES) {
    return TAG_CATEGORIES[normalizedTag as keyof typeof TAG_CATEGORIES];
  }
  return null;
}

/**
 * Get the icon component for a category tag
 * Returns null for custom/non-category tags
 */
export function getTagIcon(tag: string) {
  const config = getCategoryTagConfig(tag);
  return config?.icon ?? null;
}

/**
 * Get the color for a category tag
 * Returns null for custom/non-category tags
 */
export function getTagColor(tag: string) {
  const config = getCategoryTagConfig(tag);
  return config?.color ?? null;
}

/**
 * Get all category tag names
 */
export function getCategoryTagNames(): string[] {
  return Object.keys(TAG_CATEGORIES);
}

/**
 * Normalize a tag name for consistent comparison
 */
export function normalizeTagName(tag: string): string {
  return tag.charAt(0).toUpperCase() + tag.slice(1).toLowerCase();
}

/* ========================================
   TYPE EXPORTS
   ======================================== */

export type TagCategory = keyof typeof TAG_CATEGORIES;
export type TagColor = 'blue' | 'green' | 'red' | 'emerald' | 'amber' | 'gray';
