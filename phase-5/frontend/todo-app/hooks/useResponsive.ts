"use client";

/**
 * useResponsive Hook
 *
 * Provides responsive breakpoint detection for adaptive UI rendering.
 * Detects viewport size changes and returns current breakpoint state.
 *
 * Breakpoints:
 * - mobile: < 640px
 * - tablet: 640px - 1024px
 * - desktop: > 1024px
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { isMobile, isTablet, isDesktop, breakpoint } = useResponsive();
 *
 *   return (
 *     <div>
 *       {isMobile && <MobileView />}
 *       {isTablet && <TabletView />}
 *       {isDesktop && <DesktopView />}
 *     </div>
 *   );
 * }
 * ```
 */

import { useState, useEffect, useMemo } from "react";
import type { Breakpoint, ResponsiveState } from "@/types";

/**
 * Breakpoint pixel values
 */
const BREAKPOINTS = {
  mobile: 640,
  tablet: 1024,
} as const;

/**
 * Determine current breakpoint based on width
 */
const getBreakpoint = (width: number): Breakpoint => {
  if (width < BREAKPOINTS.mobile) {
    return "mobile";
  }
  if (width < BREAKPOINTS.tablet) {
    return "tablet";
  }
  return "desktop";
};

/**
 * Get viewport dimensions
 */
const getViewportDimensions = () => {
  if (typeof window === "undefined") {
    return { width: 1024, height: 768 }; // Default for SSR
  }

  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
};

/**
 * Debounce function for performance optimization
 */
const debounce = <T extends (...args: any[]) => void>(fn: T, delay: number): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      fn(...args);
      timeoutId = null;
    }, delay);
  };
};

/**
 * useResponsive Hook
 *
 * Tracks viewport size and returns responsive state.
 * Uses debounced resize listener for performance.
 *
 * @param debounceDelay - Debounce delay in ms (default: 150ms)
 * @returns Responsive state with breakpoint information
 */
export const useResponsive = (debounceDelay: number = 150): ResponsiveState => {
  const [dimensions, setDimensions] = useState(getViewportDimensions);

  useEffect(() => {
    // Handler for resize events
    const handleResize = () => {
      setDimensions(getViewportDimensions());
    };

    // Debounced handler
    const debouncedHandler = debounce(handleResize, debounceDelay);

    // Add event listener
    window.addEventListener("resize", debouncedHandler);

    // Initial check on mount
    handleResize();

    // Cleanup
    return () => {
      window.removeEventListener("resize", debouncedHandler);
    };
  }, [debounceDelay]);

  // Calculate responsive state (memoized)
  const state: ResponsiveState = useMemo(() => {
    const breakpoint = getBreakpoint(dimensions.width);

    return {
      breakpoint,
      isMobile: breakpoint === "mobile",
      isTablet: breakpoint === "tablet",
      isDesktop: breakpoint === "desktop",
      width: dimensions.width,
      height: dimensions.height,
    };
  }, [dimensions]);

  return state;
};

/**
 * useBreakpoint Hook
 *
 * Simplified hook that only returns current breakpoint name.
 * More performant if you only need breakpoint value.
 *
 * @returns Current breakpoint
 */
export const useBreakpoint = (): Breakpoint => {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>(() => {
    if (typeof window === "undefined") {
      return "desktop"; // Default for SSR
    }
    return getBreakpoint(window.innerWidth);
  });

  useEffect(() => {
    const handleResize = () => {
      const newBreakpoint = getBreakpoint(window.innerWidth);
      setBreakpoint(newBreakpoint);
    };

    const debouncedHandler = debounce(handleResize, 150);

    window.addEventListener("resize", debouncedHandler);
    handleResize();

    return () => {
      window.removeEventListener("resize", debouncedHandler);
    };
  }, []);

  return breakpoint;
};

/**
 * useMediaQuery Hook
 *
 * Generic hook for custom media queries.
 *
 * @param query - Media query string (e.g., "(min-width: 768px)")
 * @returns Boolean indicating if media query matches
 */
export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState<boolean>(() => {
    if (typeof window === "undefined") {
      return false;
    }
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia(query);

    // Update state
    const handler = (e: MediaQueryListEvent) => {
      setMatches(e.matches);
    };

    // Set initial value
    setMatches(mediaQuery.matches);

    // Listen for changes
    mediaQuery.addEventListener("change", handler);

    return () => {
      mediaQuery.removeEventListener("change", handler);
    };
  }, [query]);

  return matches;
};

/**
 * useViewportSize Hook
 *
 * Returns current viewport dimensions.
 * Updates on resize with debouncing.
 *
 * @param debounceDelay - Debounce delay in ms (default: 150ms)
 * @returns Viewport width and height
 */
export const useViewportSize = (debounceDelay: number = 150) => {
  const [dimensions, setDimensions] = useState(getViewportDimensions);

  useEffect(() => {
    const handleResize = () => {
      setDimensions(getViewportDimensions());
    };

    const debouncedHandler = debounce(handleResize, debounceDelay);

    window.addEventListener("resize", debouncedHandler);
    handleResize();

    return () => {
      window.removeEventListener("resize", debouncedHandler);
    };
  }, [debounceDelay]);

  return dimensions;
};

/**
 * Predefined media query hooks for common breakpoints
 */

export const useIsMobile = (): boolean => {
  return useMediaQuery(`(max-width: ${BREAKPOINTS.mobile - 1}px)`);
};

export const useIsTablet = (): boolean => {
  return useMediaQuery(`(min-width: ${BREAKPOINTS.mobile}px) and (max-width: ${BREAKPOINTS.tablet - 1}px)`);
};

export const useIsDesktop = (): boolean => {
  return useMediaQuery(`(min-width: ${BREAKPOINTS.tablet}px)`);
};

/**
 * Hook for portrait/landscape orientation detection
 */
export const useOrientation = (): "portrait" | "landscape" => {
  const [orientation, setOrientation] = useState<"portrait" | "landscape">(() => {
    if (typeof window === "undefined") {
      return "portrait";
    }
    return window.innerHeight > window.innerWidth ? "portrait" : "landscape";
  });

  useEffect(() => {
    const handleResize = () => {
      setOrientation(window.innerHeight > window.innerWidth ? "portrait" : "landscape");
    };

    const debouncedHandler = debounce(handleResize, 150);

    window.addEventListener("resize", debouncedHandler);
    handleResize();

    return () => {
      window.removeEventListener("resize", debouncedHandler);
    };
  }, []);

  return orientation;
};
