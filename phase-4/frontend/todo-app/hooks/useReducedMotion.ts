/**
 * useReducedMotion Hook
 *
 * Detects user's reduced motion preference from system settings.
 * Used to disable or reduce animations for users who prefer less motion.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const shouldReduceMotion = useReducedMotion();
 *
 *   return (
 *     <div className={shouldReduceMotion ? '' : 'animate-fade-in'}>
 *       Content
 *     </div>
 *   );
 * }
 * ```
 */

import { useState, useEffect } from 'react';

/**
 * Check if the user prefers reduced motion
 * Defaults to false (no reduction) if the API is not available
 */
function getInitialReducedMotion(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  // Check for matchMedia support
  if (!window.matchMedia) {
    return false;
  }

  // Check for reduced motion preference
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  return mediaQuery.matches;
}

/**
 * Hook to detect reduced motion preference
 *
 * @returns boolean - true if user prefers reduced motion
 */
export function useReducedMotion(): boolean {
  const [shouldReduceMotion, setShouldReduceMotion] = useState(
    getInitialReducedMotion
  );

  useEffect(() => {
    // Handle SSR case
    if (typeof window === 'undefined' || !window.matchMedia) {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    // Update state when preference changes
    const handler = (event: MediaQueryListEvent) => {
      setShouldReduceMotion(event.matches);
    };

    // Support older browsers
    const legacyHandler = (event: MediaQueryListEvent) => {
      handler(event);
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler);
      return () => {
        mediaQuery.removeEventListener('change', handler);
      };
    }

    // Older browsers (deprecated)
    if (mediaQuery.addListener) {
      mediaQuery.addListener(legacyHandler);
      return () => {
        mediaQuery.removeListener(legacyHandler);
      };
    }
  }, []);

  return shouldReduceMotion;
}

/**
 * Get animation duration based on reduced motion preference
 *
 * @param fullDuration - The full animation duration
 * @param reducedDuration - The reduced animation duration (default: 0.01ms)
 * @returns The appropriate duration based on user preference
 */
export function getAnimationDuration(
  fullDuration: string,
  reducedDuration: string = '0.01ms'
): string {
  if (typeof window === 'undefined') {
    return fullDuration;
  }

  const prefersReduced = window.matchMedia?.(
    '(prefers-reduced-motion: reduce)'
  )?.matches;

  return prefersReduced ? reducedDuration : fullDuration;
}

/**
 * Check if animations should be completely disabled
 */
export function shouldDisableAnimations(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  return window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
}
