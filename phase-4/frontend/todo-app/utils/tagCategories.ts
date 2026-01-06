/**
 * Tag Category Constants
 *
 * Defines the 7 standard tag categories for task organization.
 * Tags are predefined (not user-created) and provide categorical organization.
 *
 * @module utils/tagCategories
 */

/**
 * Standard tag category names (case-sensitive)
 */
export type TagCategory = 'Work' | 'Personal' | 'Shopping' | 'Health' | 'Finance' | 'Learning' | 'Urgent';

/**
 * Tag interface for metadata
 *
 * @property name - Tag category name (from TagCategory enum)
 * @property color - Hex color for visual display
 * @property description - Brief explanation of category usage
 */
export interface Tag {
  name: TagCategory;
  color: string;
  description: string;
}

/**
 * Standard tag catalog (7 predefined categories)
 *
 * Tags are hardcoded and cannot be created by users.
 * Each task can have up to 5 tags (max), no duplicates.
 *
 * Color palette:
 * - Work: #3B82F6 (blue) - Professional, business-related
 * - Personal: #10B981 (green) - Life, hobbies, self-care
 * - Shopping: #F59E0B (amber) - Errands, purchases
 * - Health: #EF4444 (red) - Medical, fitness, wellness
 * - Finance: #8B5CF6 (purple) - Money, bills, budgeting
 * - Learning: #EC4899 (pink) - Education, courses, reading
 * - Urgent: #DC2626 (dark red) - Time-sensitive, immediate attention
 */
export const STANDARD_TAGS: Tag[] = [
  {
    name: 'Work',
    color: '#3B82F6',
    description: 'Work-related tasks, projects, meetings',
  },
  {
    name: 'Personal',
    color: '#10B981',
    description: 'Personal life, hobbies, self-care',
  },
  {
    name: 'Shopping',
    color: '#F59E0B',
    description: 'Errands, purchases, groceries',
  },
  {
    name: 'Health',
    color: '#EF4444',
    description: 'Medical appointments, fitness, wellness',
  },
  {
    name: 'Finance',
    color: '#8B5CF6',
    description: 'Bills, budgeting, financial planning',
  },
  {
    name: 'Learning',
    color: '#EC4899',
    description: 'Education, courses, reading',
  },
  {
    name: 'Urgent',
    color: '#DC2626',
    description: 'Time-sensitive tasks requiring immediate attention',
  },
] as const;

/**
 * Tag color mapping (readonly)
 */
export const TAG_COLORS: Record<TagCategory, string> = {
  Work: '#3B82F6',
  Personal: '#10B981',
  Shopping: '#F59E0B',
  Health: '#EF4444',
  Finance: '#8B5CF6',
  Learning: '#EC4899',
  Urgent: '#DC2626',
} as const;

/**
 * Tag background color mapping (10% opacity for subtle backgrounds)
 */
export const TAG_BG_COLORS: Record<TagCategory, string> = {
  Work: 'rgba(59, 130, 246, 0.1)',
  Personal: 'rgba(16, 185, 129, 0.1)',
  Shopping: 'rgba(245, 158, 11, 0.1)',
  Health: 'rgba(239, 68, 68, 0.1)',
  Finance: 'rgba(139, 92, 246, 0.1)',
  Learning: 'rgba(236, 72, 153, 0.1)',
  Urgent: 'rgba(220, 38, 38, 0.1)',
} as const;

/**
 * Maximum tags per task (validation rule)
 */
export const MAX_TAGS_PER_TASK = 5;

/**
 * Get tag metadata by name
 *
 * @param name - Tag category name
 * @returns Tag object with color and description, or undefined if not found
 */
export function getTagByName(name: string): Tag | undefined {
  return STANDARD_TAGS.find((tag) => tag.name === name);
}

/**
 * Get tag color by name
 *
 * @param name - Tag category name
 * @returns Hex color string, or default gray if not found
 */
export function getTagColor(name: string): string {
  return TAG_COLORS[name as TagCategory] || '#6B7280';
}

/**
 * Get tag background color by name
 *
 * @param name - Tag category name
 * @returns RGBA color string, or default gray if not found
 */
export function getTagBgColor(name: string): string {
  return TAG_BG_COLORS[name as TagCategory] || 'rgba(107, 114, 128, 0.1)';
}

/**
 * Validate tag name against standard categories
 *
 * @param name - Tag name to validate
 * @returns True if tag name is valid (case-sensitive), false otherwise
 */
export function isValidTag(name: string): boolean {
  return STANDARD_TAGS.some((tag) => tag.name === name);
}

/**
 * Validate tags array against rules
 *
 * Rules:
 * - Maximum 5 tags per task
 * - All tags must be from standard categories
 * - No duplicate tags
 *
 * @param tags - Array of tag names to validate
 * @returns Object with isValid flag and error message if invalid
 */
export function validateTags(tags: string[]): { isValid: boolean; error?: string } {
  // Check max length
  if (tags.length > MAX_TAGS_PER_TASK) {
    return { isValid: false, error: `Maximum ${MAX_TAGS_PER_TASK} tags allowed` };
  }

  // Check for duplicates
  const uniqueTags = new Set(tags);
  if (uniqueTags.size !== tags.length) {
    return { isValid: false, error: 'Duplicate tags are not allowed' };
  }

  // Check all tags are valid
  const invalidTags = tags.filter((tag) => !isValidTag(tag));
  if (invalidTags.length > 0) {
    return { isValid: false, error: `Invalid tags: ${invalidTags.join(', ')}` };
  }

  return { isValid: true };
}
