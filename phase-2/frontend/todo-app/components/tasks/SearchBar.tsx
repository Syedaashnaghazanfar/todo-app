/**
 * SearchBar Component
 *
 * Provides search input with 300ms debounce, clear button, and keyboard shortcuts.
 *
 * Features:
 * - Search icon (Lucide Search)
 * - Clear button (X icon) when query present
 * - 300ms debounce visualization (loading spinner)
 * - Keyboard shortcut (Ctrl+K or Cmd+K to focus)
 * - Character count display
 * - Placeholder text
 *
 * @module components/tasks/SearchBar
 */

'use client';

import React, { useEffect, useRef } from 'react';
import { Search, X, Loader2 } from 'lucide-react';

/**
 * SearchBar props
 */
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
}: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  /**
   * Handle clear button click
   */
  const handleClear = () => {
    onChange('');
    if (onClear) {
      onClear();
    }
  };

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

  /**
   * Get character count color based on length
   */
  const getCharCountColor = () => {
    if (value.length === 0) return 'text-text-muted';
    if (value.length < 3) return 'text-neon-yellow';
    return 'text-neon-green';
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Search input wrapper */}
      <div className="relative flex items-center">
        {/* Search icon (left) */}
        <div className="absolute left-3 pointer-events-none">
          {isDebouncing ? (
            <Loader2 size={18} className="text-primary-400 animate-spin drop-shadow-[0_0_4px_rgba(139,92,246,0.5)]" aria-label="Searching..." />
          ) : (
            <Search size={18} className="text-text-secondary" aria-hidden="true" />
          )}
        </div>

        {/* Search input */}
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-24 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg text-text-primary placeholder:text-text-muted
            focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 focus:bg-white/8
            transition-all duration-200 hover:border-white/20 shadow-sm hover:shadow-[0_0_15px_rgba(139,92,246,0.1)]"
          aria-label="Search tasks"
        />

        {/* Right side: Character count and clear button */}
        <div className="absolute right-3 flex items-center gap-2">
          {/* Character count (only show when typing) */}
          {value.length > 0 && (
            <span className={`text-xs font-medium ${getCharCountColor()}`} aria-label={`${value.length} characters`}>
              {value.length}
            </span>
          )}

          {/* Clear button (only show when query present) */}
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-text-secondary hover:text-neon-red hover:bg-neon-red/10 rounded transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-neon-red/50"
              aria-label="Clear search"
              title="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Search status indicator */}
      {isDebouncing && (
        <div className="flex items-center gap-1 mt-2 px-1 text-xs text-text-secondary">
          <Loader2 size={12} className="animate-spin text-primary-400" />
          Searching...
        </div>
      )}
    </div>
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
      />

      {/* Result Count */}
      {value && (
        <div className="text-xs text-text-secondary px-1">
          Showing <span className="font-semibold text-primary-400">{resultCount}</span> of{' '}
          <span className="font-semibold text-text-primary">{totalCount}</span> task
          {totalCount !== 1 ? 's' : ''}
          {resultCount >= 50 && ' (showing top 50)'}
        </div>
      )}
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
    <div className={`relative flex items-center ${className}`}>
      {/* Search icon */}
      <div className="absolute left-2.5">
        {isDebouncing ? (
          <Loader2 size={16} className="text-primary-400 animate-spin drop-shadow-[0_0_4px_rgba(139,92,246,0.5)]" />
        ) : (
          <Search size={16} className="text-text-secondary" />
        )}
      </div>

      {/* Search input */}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-9 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-md text-sm text-text-primary placeholder:text-text-muted
          focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50
          transition-all duration-200 hover:border-white/20"
        aria-label="Search tasks"
      />

      {/* Clear button */}
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-2.5 p-0.5 text-text-secondary hover:text-neon-red hover:bg-neon-red/10 rounded transition-colors"
          aria-label="Clear search"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}

export default SearchBar;
