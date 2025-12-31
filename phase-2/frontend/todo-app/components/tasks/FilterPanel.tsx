/**
 * FilterPanel Component
 *
 * Multi-dimensional filter interface for tasks with three filter categories:
 * 1. Status (NOT_STARTED, IN_PROGRESS, COMPLETED)
 * 2. Priority (VERY_IMPORTANT, HIGH, MEDIUM, LOW)
 * 3. Due Date (OVERDUE, TODAY, THIS_WEEK, THIS_MONTH, NO_DUE_DATE, ALL)
 *
 * Features:
 * - Multi-select within categories (OR logic within category)
 * - Cumulative AND logic across categories
 * - Active filter chips with remove buttons
 * - Clear all filters button
 * - Responsive design (drawer on mobile, panel on desktop)
 *
 * @module components/tasks/FilterPanel
 */

'use client';

import React from 'react';
import { X, Filter } from 'lucide-react';
import type { TaskStatus, Priority } from '@/types/task.types';
import { STATUS_LABELS, PRIORITY_LABELS } from '@/types/task.types';
import type { FilterState, DueDateFilter } from '@/lib/skills/task-filter';
import { countActiveFilters } from '@/lib/skills/task-filter';

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
 * FilterPanel component
 *
 * Renders a filter panel with three filter categories and active filter chips.
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

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-gray-600" />
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Filters
            {activeFilterCount > 0 && (
              <span className="ml-2 inline-flex items-center justify-center w-6 h-6 text-xs font-semibold text-purple-600 bg-purple-100 rounded-full">
                {activeFilterCount}
              </span>
            )}
          </h3>
        </div>
        {activeFilterCount > 0 && (
          <button
            onClick={onClearAll}
            className="text-xs font-semibold text-red-600 hover:text-red-700 transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Active Filter Chips */}
      {activeFilterCount > 0 && (
        <div className="mb-4 pb-4 border-b border-gray-200">
          <div className="flex flex-wrap gap-2">
            {filterState.status.map((status) => (
              <FilterChip
                key={`status-${status}`}
                label={STATUS_LABELS[status]}
                onRemove={() => onToggleStatus(status)}
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
              />
            ))}
          </div>
        </div>
      )}

      {/* Filter Sections */}
      <div className="space-y-4">
        {/* Status Filter */}
        <FilterSection title="Status">
          <div className="space-y-2">
            {STATUS_OPTIONS.map((status) => (
              <CheckboxItem
                key={status}
                label={STATUS_LABELS[status]}
                checked={filterState.status.includes(status)}
                onChange={() => onToggleStatus(status)}
              />
            ))}
          </div>
        </FilterSection>

        {/* Priority Filter */}
        <FilterSection title="Priority">
          <div className="space-y-2">
            {PRIORITY_OPTIONS.map((priority) => (
              <CheckboxItem
                key={priority}
                label={PRIORITY_LABELS[priority]}
                checked={filterState.priority.includes(priority)}
                onChange={() => onTogglePriority(priority)}
                variant={priority === 'VERY_IMPORTANT' ? 'purple' : 'default'}
              />
            ))}
          </div>
        </FilterSection>

        {/* Due Date Filter */}
        <FilterSection title="Due Date">
          <div className="space-y-2">
            {DUE_DATE_OPTIONS.map((option) => (
              <RadioItem
                key={option.value}
                label={option.label}
                checked={filterState.dueDate === option.value}
                onChange={() => onSetDueDate(option.value)}
              />
            ))}
          </div>
        </FilterSection>
      </div>
    </div>
  );
}

/**
 * FilterSection component
 *
 * Renders a section within the filter panel with a title.
 */
function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
        {title}
      </h4>
      {children}
    </div>
  );
}

/**
 * CheckboxItem component
 *
 * Renders a checkbox option for multi-select filters.
 */
function CheckboxItem({
  label,
  checked,
  onChange,
  variant = 'default',
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
  variant?: 'default' | 'purple';
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer group">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className={`w-4 h-4 rounded border-gray-300 ${
          variant === 'purple'
            ? 'text-purple-600 focus:ring-purple-500'
            : 'text-blue-600 focus:ring-blue-500'
        }`}
      />
      <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
        {label}
      </span>
    </label>
  );
}

/**
 * RadioItem component
 *
 * Renders a radio option for single-select filters.
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
    <label className="flex items-center gap-2 cursor-pointer group">
      <input
        type="radio"
        checked={checked}
        onChange={onChange}
        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
      />
      <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
        {label}
      </span>
    </label>
  );
}

/**
 * FilterChip component
 *
 * Renders an active filter chip with a remove button.
 */
function FilterChip({
  label,
  onRemove,
  variant = 'default',
}: {
  label: string;
  onRemove: () => void;
  variant?: 'default' | 'purple';
}) {
  const baseClasses = 'inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium transition-all';
  const variantClasses =
    variant === 'purple'
      ? 'bg-purple-100 text-purple-700 border border-purple-200 hover:bg-purple-200'
      : 'bg-blue-100 text-blue-700 border border-blue-200 hover:bg-blue-200';

  return (
    <span className={`${baseClasses} ${variantClasses}`}>
      {label}
      <button
        onClick={onRemove}
        className="text-current hover:text-red-600 transition-colors"
        aria-label={`Remove ${label} filter`}
      >
        <X size={14} />
      </button>
    </span>
  );
}

export default FilterPanel;
