/**
 * FilterDropdown Component
 *
 * Glassmorphism dropdown menu for filtering tasks with neon-styled chips.
 *
 * Features:
 * - Status filters (All, Active, Completed)
 * - Priority filters (VERY_IMPORTANT, HIGH, MEDIUM, LOW)
 * - Due date filters (Overdue, Today, This Week, All)
 * - Active filter chips with removal
 * - Neon accents and glass styling
 * - Animated entrance
 *
 * @module components/tasks/FilterDropdown
 */

'use client';

import React from 'react';
import { Filter, X, CheckCircle2, Circle, AlertTriangle, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import type { TaskStatus, Priority } from '@/types/task.types';
import { STATUS_LABELS, PRIORITY_LABELS } from '@/types/task.types';
import { getPriorityColor } from '@/utils/priorityColors';

/**
 * Filter state interface
 */
export interface FilterState {
  status: TaskStatus[];
  priority: Priority[];
  dueDate: 'all' | 'overdue' | 'today' | 'this_week';
}

/**
 * FilterDropdown props
 */
interface FilterDropdownProps {
  /** Current filter state */
  filters: FilterState;
  /** Callback when status filter changes */
  onStatusChange: (status: TaskStatus[]) => void;
  /** Callback when priority filter changes */
  onPriorityChange: (priority: Priority[]) => void;
  /** Callback when due date filter changes */
  onDueDateChange: (dueDate: FilterState['dueDate']) => void;
  /** Callback to clear all filters */
  onClearAll: () => void;
  /** Optional className for additional styling */
  className?: string;
}

/**
 * Get active filter count
 */
function getActiveFilterCount(filters: FilterState): number {
  let count = 0;
  if (filters.status.length > 0) count += filters.status.length;
  if (filters.priority.length > 0) count += filters.priority.length;
  if (filters.dueDate !== 'all') count += 1;
  return count;
}

/**
 * FilterDropdown component
 *
 * Renders a dropdown menu with filter options and active filter chips.
 *
 * @example
 * <FilterDropdown
 *   filters={filterState}
 *   onStatusChange={(status) => updateFilters({ status })}
 *   onPriorityChange={(priority) => updateFilters({ priority })}
 *   onDueDateChange={(dueDate) => updateFilters({ dueDate })}
 *   onClearAll={() => clearAllFilters()}
 * />
 *
 * @param props - Component props
 * @returns Filter dropdown element
 */
export function FilterDropdown({
  filters,
  onStatusChange,
  onPriorityChange,
  onDueDateChange,
  onClearAll,
  className = '',
}: FilterDropdownProps) {
  const activeCount = getActiveFilterCount(filters);

  /**
   * Toggle status filter
   */
  const toggleStatus = (status: TaskStatus) => {
    const newStatus = filters.status.includes(status)
      ? filters.status.filter((s) => s !== status)
      : [...filters.status, status];
    onStatusChange(newStatus);
  };

  /**
   * Toggle priority filter
   */
  const togglePriority = (priority: Priority) => {
    const newPriority = filters.priority.includes(priority)
      ? filters.priority.filter((p) => p !== priority)
      : [...filters.priority, priority];
    onPriorityChange(newPriority);
  };

  /**
   * Remove a specific filter
   */
  const removeFilter = (type: 'status' | 'priority' | 'dueDate', value?: string) => {
    if (type === 'status' && value) {
      onStatusChange(filters.status.filter((s) => s !== value));
    } else if (type === 'priority' && value) {
      onPriorityChange(filters.priority.filter((p) => p !== value));
    } else if (type === 'dueDate') {
      onDueDateChange('all');
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Filter button and dropdown */}
      <div className="flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg text-text-primary hover:bg-white/10 hover:border-primary-500/30 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/50">
              <Filter size={16} className="text-primary-400" />
              <span className="font-medium">Filters</span>
              {activeCount > 0 && (
                <Badge className="ml-1 px-2 py-0.5 bg-primary-500/20 text-primary-300 border border-primary-500/50 shadow-[0_0_8px_rgba(139,92,246,0.3)]">
                  {activeCount}
                </Badge>
              )}
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="start"
            className="w-72 bg-bg-card/95 backdrop-blur-xl border border-white/10 shadow-[0_0_30px_rgba(139,92,246,0.2)]"
          >
            {/* Status filters */}
            <DropdownMenuLabel className="text-text-primary">Status</DropdownMenuLabel>
            {(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'] as TaskStatus[]).map((status) => (
              <DropdownMenuCheckboxItem
                key={status}
                checked={filters.status.includes(status)}
                onCheckedChange={() => toggleStatus(status)}
                className="text-text-secondary hover:text-text-primary hover:bg-white/5 focus:bg-white/10"
              >
                <div className="flex items-center gap-2">
                  {status === 'COMPLETED' ? (
                    <CheckCircle2 size={14} className="text-neon-green" />
                  ) : (
                    <Circle size={14} className="text-primary-400" />
                  )}
                  {STATUS_LABELS[status]}
                </div>
              </DropdownMenuCheckboxItem>
            ))}

            <DropdownMenuSeparator className="bg-white/10" />

            {/* Priority filters */}
            <DropdownMenuLabel className="text-text-primary">Priority</DropdownMenuLabel>
            {(['VERY_IMPORTANT', 'HIGH', 'MEDIUM', 'LOW'] as Priority[]).map((priority) => (
              <DropdownMenuCheckboxItem
                key={priority}
                checked={filters.priority.includes(priority)}
                onCheckedChange={() => togglePriority(priority)}
                className="text-text-secondary hover:text-text-primary hover:bg-white/5 focus:bg-white/10"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: getPriorityColor(priority) }}
                  />
                  {PRIORITY_LABELS[priority]}
                </div>
              </DropdownMenuCheckboxItem>
            ))}

            <DropdownMenuSeparator className="bg-white/10" />

            {/* Due date filters */}
            <DropdownMenuLabel className="text-text-primary">Due Date</DropdownMenuLabel>
            {[
              { value: 'all', label: 'All', icon: <Circle size={14} /> },
              { value: 'overdue', label: 'Overdue', icon: <AlertTriangle size={14} className="text-neon-red" /> },
              { value: 'today', label: 'Today', icon: <Clock size={14} className="text-neon-yellow" /> },
              { value: 'this_week', label: 'This Week', icon: <Clock size={14} className="text-neon-cyan" /> },
            ].map((option) => (
              <DropdownMenuItem
                key={option.value}
                onClick={() => onDueDateChange(option.value as FilterState['dueDate'])}
                className={`text-text-secondary hover:text-text-primary hover:bg-white/5 focus:bg-white/10 ${
                  filters.dueDate === option.value ? 'bg-white/5 text-text-primary' : ''
                }`}
              >
                <div className="flex items-center gap-2">
                  {option.icon}
                  {option.label}
                </div>
              </DropdownMenuItem>
            ))}

            {activeCount > 0 && (
              <>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem
                  onClick={onClearAll}
                  className="text-neon-red hover:bg-neon-red/10 focus:bg-neon-red/20"
                >
                  <X size={14} className="mr-2" />
                  Clear All Filters
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Clear all button (shown when filters active) */}
        {activeCount > 0 && (
          <button
            onClick={onClearAll}
            className="text-sm text-text-secondary hover:text-neon-red transition-colors duration-200"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Active filter chips */}
      <AnimatePresence mode="popLayout">
        {activeCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-wrap gap-2"
          >
            {/* Status chips */}
            {filters.status.map((status) => (
              <motion.button
                key={`status-${status}`}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                onClick={() => removeFilter('status', status)}
                className="group flex items-center gap-2 px-3 py-1.5 bg-neon-green/10 border border-neon-green/30 rounded-full text-xs font-semibold text-neon-green hover:bg-neon-green/20 hover:border-neon-green/50 transition-all duration-200"
              >
                {status === 'COMPLETED' ? <CheckCircle2 size={12} /> : <Circle size={12} />}
                <span>{STATUS_LABELS[status]}</span>
                <X size={12} className="opacity-60 group-hover:opacity-100" />
              </motion.button>
            ))}

            {/* Priority chips */}
            {filters.priority.map((priority) => (
              <motion.button
                key={`priority-${priority}`}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                onClick={() => removeFilter('priority', priority)}
                className="group flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold hover:opacity-80 transition-all duration-200"
                style={{
                  backgroundColor: `${getPriorityColor(priority)}20`,
                  borderColor: `${getPriorityColor(priority)}50`,
                  borderWidth: '1px',
                  color: getPriorityColor(priority),
                }}
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: getPriorityColor(priority) }}
                />
                <span>{PRIORITY_LABELS[priority]}</span>
                <X size={12} className="opacity-60 group-hover:opacity-100" />
              </motion.button>
            ))}

            {/* Due date chip */}
            {filters.dueDate !== 'all' && (
              <motion.button
                key="dueDate"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                onClick={() => removeFilter('dueDate')}
                className="group flex items-center gap-2 px-3 py-1.5 bg-neon-cyan/10 border border-neon-cyan/30 rounded-full text-xs font-semibold text-neon-cyan hover:bg-neon-cyan/20 hover:border-neon-cyan/50 transition-all duration-200"
              >
                <Clock size={12} />
                <span>
                  {filters.dueDate === 'overdue' && 'Overdue'}
                  {filters.dueDate === 'today' && 'Today'}
                  {filters.dueDate === 'this_week' && 'This Week'}
                </span>
                <X size={12} className="opacity-60 group-hover:opacity-100" />
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default FilterDropdown;
