/**
 * LazyComponent Wrapper
 *
 * Higher-order component for lazy loading with suspense and fallback UI.
 * Helps optimize bundle size through code splitting.
 *
 * Usage:
 * const LazyStatsPreviewArea = LazyComponent(() => import('./StatsPreviewArea'));
 * <Suspense fallback={<PurpleSpinner />}>
 *   <LazyStatsPreviewArea />
 * </Suspense>
 *
 * @see /specs/001-phase2-homepage-ui/spec.md - Phase 7: T070
 */

import React, { lazy, Suspense, ComponentType } from 'react';
import { LoadingPage } from './LoadingPage';

interface LazyComponentProps {
  fallback?: React.ReactNode;
  [key: string]: any;
}

/**
 * LazyComponent Wrapper
 *
 * Creates a lazy-loaded component with fallback UI.
 */
export function LazyComponent<T extends Record<string, unknown>>(
  importFunc: () => Promise<{ default: ComponentType<T> }>,
  fallback?: React.ReactNode
) {
  const LazyComponent = lazy(importFunc);

  return function LazyComponentWrapper(props: T) {
    return (
      <Suspense fallback={fallback || <LoadingPage message="Loading component..." />}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}

/**
 * LazyLoad Component
 *
 * A component that wraps lazy loading functionality with error boundary
 */
export const LazyLoad: React.FC<{
  importFunc: () => Promise<{ default: ComponentType<any> }>;
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
  [key: string]: any;
}> = ({ importFunc, fallback, errorFallback, ...props }) => {
  const [error, setError] = React.useState<Error | null>(null);
  const [Component, setComponent] = React.useState<ComponentType<any> | null>(null);

  React.useEffect(() => {
    const loadComponent = async () => {
      try {
        const module = await importFunc();
        setComponent(() => module.default);
        setError(null);
      } catch (err) {
        setError(err as Error);
      }
    };

    loadComponent();
  }, [importFunc]);

  if (error) {
    return errorFallback || <LoadingPage message="Failed to load component" />;
  }

  if (!Component) {
    return fallback || <LoadingPage message="Loading..." />;
  }

  return <Component {...props} />;
};

LazyLoad.displayName = 'LazyLoad';