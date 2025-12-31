/**
 * TagChip Component
 *
 * Displays a task tag with category-specific styling and optional remove functionality.
 *
 * Design Specs:
 * - Border radius: 16px (rounded-2xl)
 * - Subtle backgrounds with category-specific colors
 * - Contrasting text colors
 * - Optional remove button (X icon) visible on hover
 *
 * @module components/tasks/TagChip
 */

import React from 'react';
import { X } from 'lucide-react';
import { getTagColor, getTagBgColor } from '@/utils/tagCategories';

/**
 * TagChip props
 */
interface TagChipProps {
  /** Tag name from standard categories */
  tag: string;
  /** Optional callback when remove button is clicked */
  onRemove?: () => void;
  /** Optional className for additional styling */
  className?: string;
}

/**
 * TagChip component
 *
 * Renders a tag chip with category-specific styling.
 * If onRemove is provided, displays a remove button (X) that appears on hover.
 *
 * @example
 * <TagChip tag="Work" />
 * // Renders: Blue chip with "Work" text (no remove button)
 *
 * <TagChip tag="Urgent" onRemove={() => handleRemove('Urgent')} />
 * // Renders: Red chip with "Urgent" text and X button on hover
 *
 * @param props - Component props
 * @returns Tag chip element
 */
export function TagChip({ tag, onRemove, className = '' }: TagChipProps) {
  const textColor = getTagColor(tag);
  const bgColor = getTagBgColor(tag);

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-2xl px-3 py-1 text-xs font-medium transition-all duration-200 hover:opacity-80 ${className}`}
      style={{
        color: textColor,
        backgroundColor: bgColor,
        border: `1px solid ${textColor}40`, // 40 = 25% opacity in hex
      }}
    >
      <span>{tag}</span>
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="group inline-flex items-center justify-center opacity-60 transition-opacity hover:opacity-100 focus:outline-none"
          aria-label={`Remove ${tag} tag`}
          type="button"
        >
          <X
            size={14}
            className="transition-colors group-hover:text-red-600"
            strokeWidth={2.5}
          />
        </button>
      )}
    </span>
  );
}

/**
 * TagChipList component
 *
 * Renders a list of tag chips with consistent spacing.
 * Useful for displaying multiple tags on a task.
 *
 * @example
 * <TagChipList
 *   tags={['Work', 'Urgent']}
 *   onRemoveTag={(tag) => handleRemove(tag)}
 * />
 * // Renders: Two chips with remove buttons
 *
 * @param props - Component props
 * @returns List of tag chips
 */
export function TagChipList({
  tags,
  onRemoveTag,
  className = '',
}: {
  tags: string[];
  onRemoveTag?: (tag: string) => void;
  className?: string;
}) {
  if (tags.length === 0) {
    return <></>;
  }

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {tags.map((tag) => (
        <TagChip key={tag} tag={tag} onRemove={onRemoveTag ? () => onRemoveTag(tag) : undefined} />
      ))}
    </div>
  );
}

export default TagChip;
