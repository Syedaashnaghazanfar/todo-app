/**
 * SortControls Component
 *
 * Sort controls for task lists with four sort options:
 * 1. Priority (VERY_IMPORTANT first)
 * 2. Due Date (soonest first)
 * 3. Created Date (newest first)
 * 4. Alphabetical (A-Z)
 *
 * Features:
 * - Active sort indicator (purple highlight)
 * - Ascending/descending toggle (arrow icon)
 * - Responsive design (buttons on desktop, dropdown on mobile)
 * - Tie-breaking rules applied automatically
 *
 * @module components/tasks/SortControls
 */

'use client';

import React from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import type { SortField, SortDirection, SortState } from '@/lib/skills/task-sorting';

/**
 * SortControls props
 */
interface SortControlsProps {
  /** Current sort state */
  sortState: SortState;
  /** Callback when sort field is changed */
  onSortFieldChange: (field: SortField) => void;
  /** Callback when sort direction is toggled */
  onToggleDirection: () => void;
  /** Optional className for additional styling */
  className?: string;
}

/**
 * Sort field options with labels and icons
 */
const SORT_OPTIONS: Array<{ value: SortField; label: string; description: string }> = [
  { value: 'PRIORITY', label: 'Priority', description: 'VERY IMPORTANT first' },
  { value: 'DUE_DATE', label: 'Due Date', description: 'Soonest first' },
  { value: 'CREATED_DATE', label: 'Created', description: 'Newest first' },
  { value: 'ALPHABETICAL', label: 'A-Z', description: 'Alphabetical order' },
];

/**
 * SortControls component
 *
 * Renders sort controls with active sort indicator and direction toggle.
 *
 * @example
 * <SortControls
 *   sortState={{ field: 'PRIORITY', direction: 'DESC' }}
 *   onSortFieldChange={(field) => handleSortFieldChange(field)}
 *   onToggleDirection={() => handleToggleDirection()}
 * />
 *
 * @param props - Component props
 * @returns SortControls element
 */
export function SortControls({
  sortState,
  onSortFieldChange,
  onToggleDirection,
  className = '',
}: SortControlsProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Sort Field Buttons (Desktop) */}
      <div className="hidden md:flex items-center gap-2">
        {SORT_OPTIONS.map((option) => (
          <SortButton
            key={option.value}
            label={option.label}
            description={option.description}
            active={sortState.field === option.value}
            onClick={() => onSortFieldChange(option.value)}
          />
        ))}
      </div>

      {/* Sort Field Dropdown (Mobile) */}
      <div className="md:hidden">
        <select
          value={sortState.field}
          onChange={(e) => onSortFieldChange(e.target.value as SortField)}
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Direction Toggle */}
      <button
        onClick={onToggleDirection}
        className="flex items-center justify-center p-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition-colors"
        title={`Sort ${sortState.direction === 'ASC' ? 'ascending' : 'descending'} (click to toggle)`}
      >
        {sortState.direction === 'ASC' ? (
          <ArrowUp size={18} className="text-gray-600" />
        ) : (
          <ArrowDown size={18} className="text-gray-600" />
        )}
      </button>
    </div>
  );
}

/**
 * SortButton component
 *
 * Renders a sort option button with active state.
 */
function SortButton({
  label,
  description,
  active,
  onClick,
}: {
  label: string;
  description: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      title={description}
      className={`
        px-4 py-2 rounded-lg text-sm font-medium transition-all
        ${
          active
            ? 'bg-purple-600 text-white shadow-md'
            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
        }
      `}
    >
      {label}
    </button>
  );
}

/**
 * SortInfo component
 *
 * Displays current sort information with human-readable text.
 */
export function SortInfo({ sortState }: { sortState: SortState }) {
  const option = SORT_OPTIONS.find((opt) => opt.value === sortState.field);
  const directionLabel = sortState.direction === 'ASC' ? 'ascending' : 'descending';

  return (
    <div className="text-xs text-gray-500">
      Sorted by <span className="font-semibold text-gray-700">{option?.label || sortState.field}</span>{' '}
      <span className="text-gray-400">({directionLabel})</span>
    </div>
  );
}

export default SortControls;
