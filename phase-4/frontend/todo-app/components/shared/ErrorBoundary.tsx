/**
 * ErrorBoundary Component
 *
 * React Error Boundary to catch JavaScript errors anywhere in the child component tree,
 * log those errors, and display a fallback UI instead of crashing the whole app.
 *
 * Usage:
 * <ErrorBoundary fallback={<div>Something went wrong</div>}>
 *   <StatsPreviewArea />
 * </ErrorBoundary>
 *
 * @see /specs/001-phase2-homepage-ui/spec.md - Phase 6: T051
 */

'use client';

import React from 'react';
import { ErrorFallback } from './ErrorFallback';
import { cn } from '@/lib/utils';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
  showPageFallback?: boolean; // If true, shows full-page error fallback instead of inline
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log the error to an error reporting service
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      // Render fallback UI if provided, otherwise render default error UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // If showPageFallback is true, show full-page error UI
      if (this.props.showPageFallback) {
        return (
          <ErrorFallback
            error={this.state.error}
            resetError={() => window.location.reload()}
          />
        );
      }

      // Otherwise show inline error UI
      return (
        <ErrorFallback
          error={this.state.error}
          resetError={() => window.location.reload()}
          className="p-0 shadow-none bg-transparent"
        />
      );
    }

    return this.props.children;
  }
}

export { ErrorBoundary };