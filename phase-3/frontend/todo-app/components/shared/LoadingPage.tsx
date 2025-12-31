/**
 * LoadingPage Component
 *
 * Full-page loading component with purple spinner and optional message.
 * Used for initial page loads, route transitions, and async operations.
 *
 * Usage:
 * <LoadingPage message="Loading your content..." />
 * <LoadingPage size="lg" />
 *
 * @see /specs/001-phase2-homepage-ui/spec.md - Phase 7: T067
 */

import React from 'react';
import { PurpleSpinner } from './PurpleSpinner';
import { cn } from '@/lib/utils';

export interface LoadingPageProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * LoadingPage Component
 *
 * Full-page loading component with purple spinner and optional message.
 */
export const LoadingPage: React.FC<LoadingPageProps> = ({
  message = 'Loading...',
  size = 'lg',
  className
}) => {
  return (
    <div
      className={cn(
        'min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-950/20 flex items-center justify-center p-4',
        className
      )}
      role="progressbar"
      aria-label={message}
    >
      <div className="flex flex-col items-center">
        <PurpleSpinner size={size} label={message} />
      </div>
    </div>
  );
};

LoadingPage.displayName = 'LoadingPage';