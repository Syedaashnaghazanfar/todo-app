/**
 * TagChip Component
 *
 * Displays a task tag with category-specific styling, optional icons, and remove functionality.
 *
 * Design Specs:
 * - Border radius: 16px (rounded-2xl)
 * - Subtle backgrounds with category-specific colors
 * - Category tags show icons (Work=Briefcase, Learning=BookOpen, Health=Heart, Finance=DollarSign, Urgent=AlertTriangle)
 * - Custom tags display as text only
 * - Optional remove button (X icon) visible on hover
 *
 * @module components/tasks/TagChip
 */

import React from 'react';
import { motion } from 'framer-motion';
import { X, Briefcase, BookOpen, Heart, DollarSign, AlertTriangle, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * TagChip props
 */
interface TagChipProps {
  /** Tag name */
  tag: string;
  /** Tag size */
  size?: 'sm' | 'md' | 'lg';
  /** Whether to show icon for category tags */
  showIcon?: boolean;
  /** Optional callback when remove button is clicked */
  onRemove?: () => void;
  /** Optional className for additional styling */
  className?: string;
}

// Category tag configuration with icons
const categoryConfig: Record<string, {
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
}> = {
  Work: { icon: Briefcase, color: '#3B82F6', bgColor: 'oklch(0.932 0.059 251)' },
  Learning: { icon: BookOpen, color: '#10B981', bgColor: 'oklch(0.945 0.045 156)' },
  Health: { icon: Heart, color: '#EF4444', bgColor: 'oklch(0.956 0.043 25)' },
  Finance: { icon: DollarSign, color: '#10B981', bgColor: 'oklch(0.945 0.045 156)' },
  Urgent: { icon: AlertTriangle, color: '#F59E0B', bgColor: 'oklch(0.954 0.048 70)' },
};

const sizeConfig = {
  sm: { chip: 'px-1.5 py-0.5 text-xs', icon: 'w-3 h-3' },
  md: { chip: 'px-2.5 py-1 text-xs', icon: 'w-3.5 h-3.5' },
  lg: { chip: 'px-3 py-1.5 text-sm', icon: 'w-4 h-4' },
};

/**
 * TagChip component
 *
 * Renders a tag chip with category-specific styling and icons.
 * Category tags show icons; custom tags display as text only.
 *
 * @example
 * <TagChip tag="Work" />
 * // Renders: Blue chip with briefcase icon and "Work" text
 *
 * <TagChip tag="CustomTag" showIcon={false} />
 * // Renders: Gray chip with "CustomTag" text only
 *
 * <TagChip tag="Urgent" onRemove={() => handleRemove('Urgent')} />
 * // Renders: Amber chip with alert icon and X button on hover
 *
 * @param props - Component props
 * @returns Tag chip element
 */
export function TagChip({
  tag,
  size = 'md',
  showIcon = true,
  onRemove,
  className = '',
}: TagChipProps) {
  const normalizedTag = tag.charAt(0).toUpperCase() + tag.slice(1).toLowerCase();
  const category = categoryConfig[normalizedTag];
  const isCategoryTag = !!category;

  const textColor = category?.color || 'var(--text-secondary)';
  const bgColor = category?.bgColor || 'var(--muted)';
  const Icon = category?.icon || Tag;

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-medium',
        'transition-all duration-200 hover:opacity-80',
        sizeConfig[size].chip,
        className
      )}
      style={{
        color: textColor,
        backgroundColor: bgColor,
        border: `1px solid ${textColor}30`,
      }}
    >
      {showIcon && isCategoryTag && (
        <Icon className={cn('flex-shrink-0', sizeConfig[size].icon)} />
      )}
      <span>{tag}</span>
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="group inline-flex items-center justify-center ml-0.5 opacity-60 transition-opacity hover:opacity-100 focus:outline-none"
          aria-label={`Remove ${tag} tag`}
          type="button"
        >
          <X
            size={12}
            className="transition-colors group-hover:text-red-500"
            strokeWidth={2.5}
          />
        </button>
      )}
    </motion.span>
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
