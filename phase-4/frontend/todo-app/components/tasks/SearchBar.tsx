/**
 * SearchBar Component
 *
 * Provides search input with debounced input handling and calm styling.
 *
 * Features:
 * - Search icon (Lucide Search)
 * - Clear button (X icon) when query present
 * - 300ms debounce visualization (loading spinner)
 * - Keyboard shortcut (Ctrl+K or Cmd+K to focus)
 * - Placeholder text
 * - Calm design with per-page accent colors
 *
 * @module components/tasks/SearchBar
 */

'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  /** Current search value */
  value: string;
  /** Callback when search value changes */
  onChange: (value: string) => void;
  /** Optional callback when search is cleared */
  onClear?: () => void;
  /** Optional placeholder text */
  placeholder?: string;
  /** Optional className for additional styling */
  className?: string;
  /** Whether search is actively debouncing */
  isDebouncing?: boolean;
  /** Show filter button */
  showFilters?: boolean;
  /** Filter button click handler */
  onFilterClick?: () => void;
  /** Active filter count */
  activeFilterCount?: number;
}

/**
 * SearchBar component
 *
 * Renders search input with debounce indicator and keyboard shortcuts.
 *
 * @example
 * <SearchBar
 *   value={searchQuery}
 *   onChange={setSearchQuery}
 *   onClear={clearSearch}
 *   isDebouncing={isDebouncing}
 * />
 *
 * @param props - Component props
 * @returns Search bar element
 */
export function SearchBar({
  value,
  onChange,
  onClear,
  placeholder = 'Search tasks by title, description, or tags...',
  className = '',
  isDebouncing = false,
  showFilters = false,
  onFilterClick,
  activeFilterCount = 0,
}: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  /**
   * Handle clear button click
   */
  const handleClear = useCallback(() => {
    onChange('');
    if (onClear) {
      onClear();
    }
  }, [onChange, onClear]);

  /**
   * Keyboard shortcut listener (Ctrl+K or Cmd+K)
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K or Cmd+K to focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('relative', className)}
    >
      {/* Search input wrapper */}
      <div
        className={cn(
          'flex items-center gap-2',
          'px-4 py-2.5 rounded-xl border border-[var(--border)]',
          'bg-[var(--bg-card)]',
          'transition-all duration-200',
          isFocused && 'ring-2 ring-[var(--ring)] border-transparent'
        )}
      >
        {/* Search icon (left) */}
        <div className="pointer-events-none">
          {isDebouncing ? (
            <Loader2
              size={18}
              className="animate-spin"
              style={{ color: 'var(--accent-tasks)' }}
              aria-label="Searching..."
            />
          ) : (
            <Search
              size={18}
              style={{ color: isFocused ? 'var(--accent-tasks)' : 'var(--text-muted)' }}
              aria-hidden="true"
            />
          )}
        </div>

        {/* Search input */}
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="flex-1 bg-transparent border-none outline-none text-sm"
          style={{ color: 'var(--text-primary)' }}
          aria-label="Search tasks"
        />

        {/* Right side: Clear button and filter button */}
        <div className="flex items-center gap-2">
          {/* Clear button (only show when query present) */}
          <AnimatePresence>
            {value && (
              <motion.button
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                type="button"
                onClick={handleClear}
                className="p-1 rounded-md hover:bg-[var(--bg-elevated)] transition-colors"
                style={{ color: 'var(--text-muted)' }}
                onMouseOver={(e) => (e.currentTarget.style.color = 'var(--destructive)')}
                onMouseOut={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                aria-label="Clear search"
                title="Clear search"
              >
                <X size={16} />
              </motion.button>
            )}
          </AnimatePresence>

          {/* Filter button */}
          {showFilters && (
            <div className="relative">
              <button
                type="button"
                onClick={onFilterClick}
                className={cn(
                  'p-2 rounded-lg transition-colors',
                  activeFilterCount > 0
                    ? 'bg-[var(--accent-tasks-muted)]'
                    : 'hover:bg-[var(--bg-elevated)]'
                )}
                style={{
                  color: activeFilterCount > 0
                    ? 'var(--accent-tasks)'
                    : 'var(--text-secondary)',
                }}
                aria-label="Open filters"
              >
                <Search size={16} className="w-4 h-4" />
              </button>
              {activeFilterCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[var(--accent-tasks)] text-[10px] font-bold text-white flex items-center justify-center"
                >
                  {activeFilterCount}
                </span>
              )}
            </div>
          )}

          {/* Keyboard shortcut hint */}
          <AnimatePresence>
            {!isFocused && !value && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="hidden sm:flex items-center gap-1 pointer-events-none"
              >
                <kbd
                  className="px-1.5 py-0.5 text-xs rounded"
                  style={{
                    backgroundColor: 'var(--bg-elevated)',
                    color: 'var(--text-muted)',
                  }}
                >
                  /
                </kbd>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Search status indicator */}
      <AnimatePresence>
        {isDebouncing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-1 mt-2 px-1"
            style={{ color: 'var(--text-muted)' }}
          >
            <Loader2 size={12} className="animate-spin" style={{ color: 'var(--accent-tasks)' }} />
            <span className="text-xs">Searching...</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/**
 * SearchBar with result count component
 *
 * Extends SearchBar with result count display.
 */
interface SearchBarWithCountProps extends SearchBarProps {
  /** Number of results found */
  resultCount: number;
  /** Total number of tasks */
  totalCount: number;
}

export function SearchBarWithCount({
  value,
  onChange,
  onClear,
  placeholder,
  className = '',
  isDebouncing = false,
  resultCount,
  totalCount,
  showFilters,
  onFilterClick,
  activeFilterCount,
}: SearchBarWithCountProps) {
  return (
    <div className="space-y-2">
      <SearchBar
        value={value}
        onChange={onChange}
        onClear={onClear}
        placeholder={placeholder}
        className={className}
        isDebouncing={isDebouncing}
        showFilters={showFilters}
        onFilterClick={onFilterClick}
        activeFilterCount={activeFilterCount}
      />

      {/* Result Count */}
      <AnimatePresence>
        {value && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-xs px-1"
            style={{ color: 'var(--text-secondary)' }}
          >
            Showing{' '}
            <span
              className="font-semibold"
              style={{ color: 'var(--accent-tasks)' }}
            >
              {resultCount}
            </span>{' '}
            of{' '}
            <span
              className="font-semibold"
              style={{ color: 'var(--text-primary)' }}
            >
              {totalCount}
            </span>{' '}
            task{totalCount !== 1 ? 's' : ''}
            {resultCount >= 50 && ' (showing top 50)'}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Compact SearchBar variant for smaller spaces
 *
 * Minimal version without character count or keyboard hints.
 */
export function SearchBarCompact({
  value,
  onChange,
  onClear,
  placeholder = 'Search...',
  className = '',
  isDebouncing = false,
}: SearchBarProps) {
  const handleClear = () => {
    onChange('');
    if (onClear) {
      onClear();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn('relative flex items-center', className)}
    >
      {/* Search icon */}
      <div className="absolute left-2.5 pointer-events-none">
        {isDebouncing ? (
          <Loader2
            size={16}
            className="animate-spin"
            style={{ color: 'var(--accent-tasks)' }}
          />
        ) : (
          <Search size={16} style={{ color: 'var(--text-muted)' }} />
        )}
      </div>

      {/* Search input */}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          'w-full pl-9 pr-9 py-2 rounded-lg text-sm',
          'bg-[var(--bg-card)] border border-[var(--border)]',
          'placeholder:text-text-muted',
          'focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent',
          'transition-all duration-200'
        )}
        style={{
          color: 'var(--text-primary)',
        }}
        aria-label="Search tasks"
      />

      {/* Clear button */}
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-2.5 p-0.5 rounded transition-colors"
          style={{ color: 'var(--text-muted)' }}
          onMouseOver={(e) => (e.currentTarget.style.color = 'var(--destructive)')}
          onMouseOut={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
          aria-label="Clear search"
        >
          <X size={14} />
        </button>
      )}
    </motion.div>
  );
}

export default SearchBar;
