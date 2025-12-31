/**
 * ErrorFallback Component
 *
 * Fallback UI component for ErrorBoundary with purple theme.
 * Displays error information with helpful actions for users.
 *
 * Usage:
 * <ErrorFallback
 *   error={error}
 *   resetError={() => window.location.reload()}
 *   title="Something went wrong"
 *   message="We're sorry, but something went wrong. Please try again."
 * />
 *
 * @see /specs/001-phase2-homepage-ui/spec.md - Phase 7: Cross-Cutting Concerns
 */

'use client';

import React from 'react';
import { Button } from './Button';
import { cn } from '@/lib/utils';

export interface ErrorFallbackProps {
  error?: Error;
  resetError?: () => void;
  title?: string;
  message?: string;
  className?: string;
}

/**
 * ErrorFallback Component
 *
 * Fallback UI component for ErrorBoundary with purple theme.
 */
export const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetError,
  title = 'Something went wrong',
  message = 'We\'re sorry, but something went wrong. Please try again.',
  className
}) => {
  return (
    <div
      className={cn(
        'min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-950/20 flex items-center justify-center p-4',
        className
      )}
    >
      <div className="max-w-md w-full bg-white dark:bg-purple-900/30 rounded-2xl shadow-xl p-8 text-center">
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
            <svg
              className="w-8 h-8 text-red-500 dark:text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-purple-800 dark:text-purple-200 mb-2">
            {title}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            {message}
          </p>
        </div>

        {error?.message && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-left">
            <p className="text-sm text-red-700 dark:text-red-300 break-words">
              <strong>Error:</strong> {error.message}
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="primary"
            className="px-6 py-3 rounded-lg transition-all"
            onClick={resetError}
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Try Again
          </Button>

          <Button
            variant="outline"
            className="px-6 py-3 rounded-lg border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/50 transition-all"
          >
            <a href="/">
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              Back to Home
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
};

ErrorFallback.displayName = 'ErrorFallback';