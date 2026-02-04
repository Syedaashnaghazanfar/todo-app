/**
 * Task Tagging Skill
 *
 * Validates and sanitizes task tags according to business rules:
 * - Maximum 5 tags per task
 * - No duplicate tags
 * - All tags must be from standard categories (Work, Personal, Shopping, Health, Finance, Learning, Urgent)
 *
 * Pure functions with comprehensive error reporting for user feedback.
 *
 * @module lib/skills/task-tagging
 */

import { MAX_TAGS_PER_TASK, isValidTag, STANDARD_TAGS } from '@/utils/tagCategories';
import type { TagCategory } from '@/utils/tagCategories';

/**
 * Tag validation result
 */
export interface TagValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validate tags array against all business rules
 *
 * Validation Rules:
 * 1. Maximum 5 tags per task
 * 2. No duplicate tags
 * 3. All tags must be from standard categories
 *
 * @param tags - Array of tag names to validate
 * @returns Validation result with valid flag and error messages
 *
 * @example
 * validateTags(['Work', 'Urgent'])
 * // Returns: { valid: true, errors: [] }
 *
 * validateTags(['Work', 'Work', 'Personal'])
 * // Returns: { valid: false, errors: ['Duplicate tags are not allowed'] }
 *
 * validateTags(['Work', 'Personal', 'Shopping', 'Health', 'Finance', 'Learning'])
 * // Returns: { valid: false, errors: ['Maximum 5 tags allowed per task'] }
 */
export function validateTags(tags: string[]): TagValidationResult {
  const errors: string[] = [];

  // Rule 1: Check maximum count (5 tags)
  if (tags.length > MAX_TAGS_PER_TASK) {
    errors.push(`Maximum ${MAX_TAGS_PER_TASK} tags allowed per task`);
  }

  // Rule 2: Check for duplicates
  const uniqueTags = new Set(tags);
  if (uniqueTags.size !== tags.length) {
    errors.push('Duplicate tags are not allowed');
  }

  // Rule 3: Check all tags are from standard categories
  const invalidTags = tags.filter((tag) => !isValidTag(tag));
  if (invalidTags.length > 0) {
    errors.push(`Invalid tags: ${invalidTags.join(', ')}. Must be one of: ${STANDARD_TAGS.map((t) => t.name).join(', ')}`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Sanitize tags array by removing duplicates and invalid tags
 *
 * This function automatically fixes common tag issues:
 * - Removes duplicate tags (keeps first occurrence)
 * - Filters out invalid tags (not in standard categories)
 * - Limits to first 5 tags if more than max
 *
 * Use this for auto-correcting user input without showing errors.
 *
 * @param tags - Array of tag names to sanitize
 * @returns Sanitized array of valid, unique tags (max 5)
 *
 * @example
 * sanitizeTags(['Work', 'Work', 'Personal'])
 * // Returns: ['Work', 'Personal']
 *
 * sanitizeTags(['Work', 'InvalidTag', 'Personal'])
 * // Returns: ['Work', 'Personal']
 *
 * sanitizeTags(['Work', 'Personal', 'Shopping', 'Health', 'Finance', 'Learning'])
 * // Returns: ['Work', 'Personal', 'Shopping', 'Health', 'Finance'] (limited to 5)
 */
export function sanitizeTags(tags: string[]): string[] {
  // Remove duplicates (keep first occurrence)
  const uniqueTags = Array.from(new Set(tags));

  // Filter out invalid tags
  const validTags = uniqueTags.filter((tag) => isValidTag(tag));

  // Limit to MAX_TAGS_PER_TASK
  return validTags.slice(0, MAX_TAGS_PER_TASK);
}

/**
 * Check if adding a new tag would exceed maximum
 *
 * @param existingTags - Current tags on the task
 * @param newTag - Tag to be added
 * @returns True if adding tag would exceed maximum, false otherwise
 *
 * @example
 * wouldExceedMaxTags(['Work', 'Personal', 'Shopping', 'Health', 'Finance'], 'Learning')
 * // Returns: true (would be 6 tags)
 *
 * wouldExceedMaxTags(['Work', 'Personal'], 'Shopping')
 * // Returns: false (would be 3 tags)
 */
export function wouldExceedMaxTags(existingTags: string[], newTag: string): boolean {
  // Don't count if tag already exists (would be a duplicate, not an addition)
  if (existingTags.includes(newTag)) {
    return false;
  }

  return existingTags.length >= MAX_TAGS_PER_TASK;
}

/**
 * Check if a tag is already assigned to the task
 *
 * @param existingTags - Current tags on the task
 * @param tag - Tag to check
 * @returns True if tag already exists, false otherwise
 *
 * @example
 * isDuplicateTag(['Work', 'Personal'], 'Work')
 * // Returns: true
 *
 * isDuplicateTag(['Work', 'Personal'], 'Shopping')
 * // Returns: false
 */
export function isDuplicateTag(existingTags: string[], tag: string): boolean {
  return existingTags.includes(tag);
}

/**
 * Get available tags that can be added to a task
 *
 * Returns tags that are:
 * - From standard categories
 * - Not already assigned to the task
 * - Would not exceed maximum when added
 *
 * @param existingTags - Current tags on the task
 * @returns Array of available tag names
 *
 * @example
 * getAvailableTags(['Work', 'Personal'])
 * // Returns: ['Shopping', 'Health', 'Finance', 'Learning', 'Urgent']
 *
 * getAvailableTags(['Work', 'Personal', 'Shopping', 'Health', 'Finance'])
 * // Returns: [] (max tags reached)
 */
export function getAvailableTags(existingTags: string[]): TagCategory[] {
  // If max tags reached, no tags available
  if (existingTags.length >= MAX_TAGS_PER_TASK) {
    return [];
  }

  // Return standard tags not already in use
  return STANDARD_TAGS.filter((tag) => !existingTags.includes(tag.name)).map((tag) => tag.name);
}

/**
 * Validate a single tag before adding
 *
 * Checks if a single tag can be added to existing tags.
 * Use this for real-time validation during tag input.
 *
 * @param existingTags - Current tags on the task
 * @param newTag - Tag to validate
 * @returns Validation result with specific error message
 *
 * @example
 * validateSingleTag(['Work', 'Personal'], 'Shopping')
 * // Returns: { valid: true, errors: [] }
 *
 * validateSingleTag(['Work', 'Personal'], 'Work')
 * // Returns: { valid: false, errors: ['Tag "Work" is already added'] }
 *
 * validateSingleTag(['Work', 'Personal', 'Shopping', 'Health', 'Finance'], 'Learning')
 * // Returns: { valid: false, errors: ['Maximum 5 tags allowed per task'] }
 */
export function validateSingleTag(existingTags: string[], newTag: string): TagValidationResult {
  const errors: string[] = [];

  // Check if tag is from standard categories
  if (!isValidTag(newTag)) {
    errors.push(`"${newTag}" is not a valid tag. Must be one of: ${STANDARD_TAGS.map((t) => t.name).join(', ')}`);
  }

  // Check if tag is duplicate
  if (isDuplicateTag(existingTags, newTag)) {
    errors.push(`Tag "${newTag}" is already added`);
  }

  // Check if would exceed maximum
  if (wouldExceedMaxTags(existingTags, newTag)) {
    errors.push(`Maximum ${MAX_TAGS_PER_TASK} tags allowed per task`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Sort tags by standard category order
 *
 * Ensures consistent tag display order across the app.
 * Standard order: Work, Personal, Shopping, Health, Finance, Learning, Urgent
 *
 * @param tags - Array of tag names to sort
 * @returns Sorted array of tag names
 *
 * @example
 * sortTagsByStandardOrder(['Urgent', 'Work', 'Personal'])
 * // Returns: ['Work', 'Personal', 'Urgent']
 */
export function sortTagsByStandardOrder(tags: string[]): string[] {
  const standardOrder: string[] = STANDARD_TAGS.map((t) => t.name);

  return tags.slice().sort((a, b) => {
    const indexA = standardOrder.indexOf(a as any);
    const indexB = standardOrder.indexOf(b as any);

    // If both are standard tags, sort by standard order
    if (indexA !== -1 && indexB !== -1) {
      return indexA - indexB;
    }

    // If only one is standard, standard tag comes first
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;

    // If neither are standard (shouldn't happen), sort alphabetically
    return a.localeCompare(b);
  });
}
