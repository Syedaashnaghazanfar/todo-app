/**
 * FilterPanel Component
 *
 * Multi-dimensional filter interface for tasks with four filter categories:
 * 1. Priority (VERY_IMPORTANT, HIGH, MEDIUM, LOW)
 * 2. Status (NOT_STARTED, IN_PROGRESS, COMPLETED)
 * 3. Due Date (OVERDUE, TODAY, THIS_WEEK, THIS_MONTH, NO_DUE_DATE, ALL)
 * 4. Tags (Work, Learning, Health, Finance, Urgent)
 *
 * Features:
 * - Multi-select within categories (OR logic within category)
 * - Cumulative AND logic across categories
 * - Active filter chips with remove buttons
 * - Clear all filters button
 * - Responsive design (drawer on mobile, panel on desktop)
 * - Calm design with per-page accent colors
 *
 * @module components/tasks/FilterPanel
 */

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Filter, ChevronDown, ChevronUp, Flag, FolderKanban, Calendar, Tag } from 'lucide-react';
import type { TaskStatus, Priority } from '@/types/task.types';
import { STATUS_LABELS, PRIORITY_LABELS } from '@/types/task.types';
import type { FilterState, DueDateFilter } from '@/lib/skills/task-filter';
import { countActiveFilters } from '@/lib/skills/task-filter';
import { cn } from '@/lib/utils';
import { TagChip } from './TagChip';

/**
 * FilterPanel props
 */
interface FilterPanelProps {
  /** Current filter state */
  filterState: FilterState;
  /** Callback when status filter is toggled */
  onToggleStatus: (status: TaskStatus) => void;
  /** Callback when priority filter is toggled */
  onTogglePriority: (priority: Priority) => void;
  /** Callback when due date filter is set */
  onSetDueDate: (dueDate: DueDateFilter) => void;
  /** Callback when tag filter is toggled (optional) */
  onToggleTag?: (tag: string) => void;
  /** Callback when all filters are cleared */
  onClearAll: () => void;
  /** Optional className for additional styling */
  className?: string;
}

/**
 * Due date filter options with labels
 */
const DUE_DATE_OPTIONS: Array<{ value: DueDateFilter; label: string }> = [
  { value: 'ALL', label: 'All' },
  { value: 'OVERDUE', label: 'Overdue' },
  { value: 'TODAY', label: 'Today' },
  { value: 'THIS_WEEK', label: 'This Week' },
  { value: 'THIS_MONTH', label: 'This Month' },
  { value: 'NO_DUE_DATE', label: 'No Due Date' },
];

/**
 * Status filter options
 */
const STATUS_OPTIONS: TaskStatus[] = ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'];

/**
 * Priority filter options
 */
const PRIORITY_OPTIONS: Priority[] = ['VERY_IMPORTANT', 'HIGH', 'MEDIUM', 'LOW'];

/**
 * Category tags for tag filter
 */
const TAG_OPTIONS = ['Work', 'Learning', 'Health', 'Finance', 'Urgent'];

/**
 * FilterSection component with collapsible behavior
 */
interface FilterSectionProps {
  title: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
}

function FilterSection({ title, icon: Icon, children, isOpen, onToggle }: FilterSectionProps) {
  return (
    <div className="mb-2">
      <button
        onClick={onToggle}
        className={cn(
          'w-full flex items-center justify-between',
          'px-3 py-2 rounded-lg',
          'hover:bg-[var(--bg-elevated)] transition-colors',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]'
        )}
      >
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
          <span className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
            {title}
          </span>
        </div>
        {isOpen ? (
          <ChevronUp className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
        ) : (
          <ChevronDown className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-1 space-y-1 px-4 pb-2">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * CheckboxItem component
 */
function CheckboxItem({
  label,
  checked,
  onChange,
  variant = 'default',
  showTag = false,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
  variant?: 'default' | 'purple' | 'cyan';
  showTag?: boolean;
}) {
  return (
    <label
      className={cn(
        'flex items-center gap-2 cursor-pointer px-2 py-1.5 rounded-md',
        'hover:bg-[var(--bg-elevated)] transition-colors'
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="w-4 h-4 rounded border-[var(--border)]"
        style={{ accentColor: 'var(--accent-tasks)' }}
      />
      {showTag ? (
        <TagChip tag={label} size="sm" />
      ) : (
        <span className="text-sm flex-1" style={{ color: 'var(--text-secondary)' }}>
          {label}
        </span>
      )}
    </label>
  );
}

/**
 * RadioItem component
 */
function RadioItem({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label
      className={cn(
        'flex items-center gap-2 cursor-pointer px-2 py-1.5 rounded-md',
        'hover:bg-[var(--bg-elevated)] transition-colors'
      )}
    >
      <input
        type="radio"
        checked={checked}
        onChange={onChange}
        className="w-4 h-4"
        style={{ accentColor: 'var(--accent-tasks)' }}
      />
      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
        {label}
      </span>
    </label>
  );
}

/**
 * FilterChip component for active filters
 */
function FilterChip({
  label,
  onRemove,
  variant = 'default',
}: {
  label: string;
  onRemove: () => void;
  variant?: 'default' | 'purple' | 'cyan';
}) {
  const variantStyles = {
    default: {
      bg: 'var(--muted)',
      text: 'var(--text-secondary)',
      border: 'var(--border)',
    },
    purple: {
      bg: 'var(--accent-dashboard-muted)',
      text: 'var(--accent-dashboard)',
      border: 'var(--accent-dashboard)',
    },
    cyan: {
      bg: 'var(--accent-tasks-muted)',
      text: 'var(--accent-tasks)',
      border: 'var(--accent-tasks)',
    },
  };

  const style = variantStyles[variant];

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
      style={{
        backgroundColor: style.bg,
        color: style.text,
        border: `1px solid ${style.border}40`,
      }}
    >
      {label}
      <button
        onClick={onRemove}
        className="ml-0.5 opacity-60 hover:opacity-100 transition-opacity"
        aria-label={`Remove ${label} filter`}
      >
        <X size={12} />
      </button>
    </motion.span>
  );
}

/**
 * FilterPanel component
 *
 * Renders a filter panel with four filter categories and active filter chips.
 *
 * @example
 * <FilterPanel
 *   filterState={filterState}
 *   onToggleStatus={(status) => handleToggleStatus(status)}
 *   onTogglePriority={(priority) => handleTogglePriority(priority)}
 *   onSetDueDate={(dueDate) => handleSetDueDate(dueDate)}
 *   onClearAll={() => handleClearAll()}
 * />
 *
 * @param props - Component props
 * @returns FilterPanel element
 */
export function FilterPanel({
  filterState,
  onToggleStatus,
  onTogglePriority,
  onSetDueDate,
  onToggleTag,
  onClearAll,
  className = '',
}: FilterPanelProps): React.ReactElement {
  const activeFilterCount = countActiveFilters(filterState);
  const [expandedSections, setExpandedSections] = useState<string[]>(['priority', 'tags']);

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  return (
    <motion.aside
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        'w-64 flex-shrink-0 hidden lg:block',
        'bg-[var(--bg-card)] rounded-xl border border-[var(--border)]',
        'overflow-hidden',
        className
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-[var(--border)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
            <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
              Filters
            </h3>
            {activeFilterCount > 0 && (
              <span
                className="inline-flex items-center justify-center w-5 h-5 text-xs font-semibold rounded-full"
                style={{
                  backgroundColor: 'var(--accent-tasks-muted)',
                  color: 'var(--accent-tasks)',
                }}
              >
                {activeFilterCount}
              </span>
            )}
          </div>
          {activeFilterCount > 0 && (
            <button
              onClick={onClearAll}
              className="text-xs font-medium transition-colors"
              style={{ color: 'var(--text-muted)' }}
              onMouseOver={(e) => (e.currentTarget.style.color = 'var(--destructive)')}
              onMouseOut={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Active Filter Chips */}
      <AnimatePresence>
        {activeFilterCount > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="p-3 border-b border-[var(--border)] overflow-hidden"
          >
            <div className="flex flex-wrap gap-1.5">
              {filterState.status.map((status) => (
                <FilterChip
                  key={`status-${status}`}
                  label={STATUS_LABELS[status]}
                  onRemove={() => onToggleStatus(status)}
                  variant="cyan"
                />
              ))}
              {filterState.priority.map((priority) => (
                <FilterChip
                  key={`priority-${priority}`}
                  label={PRIORITY_LABELS[priority]}
                  onRemove={() => onTogglePriority(priority)}
                  variant={priority === 'VERY_IMPORTANT' ? 'purple' : 'default'}
                />
              ))}
              {filterState.dueDate !== 'ALL' && (
                <FilterChip
                  label={DUE_DATE_OPTIONS.find((opt) => opt.value === filterState.dueDate)?.label || filterState.dueDate}
                  onRemove={() => onSetDueDate('ALL')}
                />
              )}
              {filterState.tags && filterState.tags.length > 0 && filterState.tags.map((tag) => (
                <FilterChip
                  key={`tag-${tag}`}
                  label={tag}
                  onRemove={() => onToggleTag?.(tag)}
                  variant="purple"
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter Sections */}
      <div className="p-2 max-h-[calc(100vh-250px)] overflow-y-auto">
        {/* Priority Filter */}
        <FilterSection
          title="Priority"
          icon={Flag}
          isOpen={expandedSections.includes('priority')}
          onToggle={() => toggleSection('priority')}
        >
          {PRIORITY_OPTIONS.map((priority) => (
            <CheckboxItem
              key={priority}
              label={PRIORITY_LABELS[priority]}
              checked={filterState.priority.includes(priority)}
              onChange={() => onTogglePriority(priority)}
              variant={priority === 'VERY_IMPORTANT' ? 'purple' : 'default'}
            />
          ))}
        </FilterSection>

        {/* Status Filter */}
        <FilterSection
          title="Status"
          icon={FolderKanban}
          isOpen={expandedSections.includes('status')}
          onToggle={() => toggleSection('status')}
        >
          {STATUS_OPTIONS.map((status) => (
            <CheckboxItem
              key={status}
              label={STATUS_LABELS[status]}
              checked={filterState.status.includes(status)}
              onChange={() => onToggleStatus(status)}
              variant="cyan"
            />
          ))}
        </FilterSection>

        {/* Due Date Filter */}
        <FilterSection
          title="Due Date"
          icon={Calendar}
          isOpen={expandedSections.includes('dueDate')}
          onToggle={() => toggleSection('dueDate')}
        >
          {DUE_DATE_OPTIONS.map((option) => (
            <RadioItem
              key={option.value}
              label={option.label}
              checked={filterState.dueDate === option.value}
              onChange={() => onSetDueDate(option.value)}
            />
          ))}
        </FilterSection>

        {/* Tags Filter */}
        <FilterSection
          title="Tags"
          icon={Tag}
          isOpen={expandedSections.includes('tags')}
          onToggle={() => toggleSection('tags')}
        >
          {TAG_OPTIONS.map((tag) => (
            <CheckboxItem
              key={tag}
              label={tag}
              checked={filterState.tags?.includes(tag) ?? false}
              onChange={() => onToggleTag?.(tag)}
              showTag={true}
            />
          ))}
        </FilterSection>
      </div>
    </motion.aside>
  );
}

export default FilterPanel;
