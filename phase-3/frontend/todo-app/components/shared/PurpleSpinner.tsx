/**
 * PurpleSpinner Component
 *
 * A custom animated spinner with purple theme for loading states.
 * Features a cute, smooth animation with purple color scheme.
 *
 * Usage:
 * <PurpleSpinner size="md" />
 * <PurpleSpinner size="lg" className="text-purple-600" />
 *
 * @see /specs/001-phase2-homepage-ui/spec.md - Phase 7: T067
 */

import React from 'react';
import { cn } from '@/lib/utils';

export interface PurpleSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
}

/**
 * PurpleSpinner Component
 *
 * A custom animated spinner with purple theme for loading states.
 */
export const PurpleSpinner: React.FC<PurpleSpinnerProps> = ({
  size = 'md',
  className,
  label = 'Loading...'
}) => {
  // Size configurations
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <svg
        className={cn(
          sizeClasses[size],
          'animate-spin text-purple-600',
          className
        )}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-label={label}
        role="status"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
      {label && (
        <span className="mt-2 text-sm text-purple-600 dark:text-purple-400">
          {label}
        </span>
      )}
    </div>
  );
};

PurpleSpinner.displayName = 'PurpleSpinner';