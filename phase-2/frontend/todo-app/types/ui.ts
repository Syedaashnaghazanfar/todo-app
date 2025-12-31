/**
 * UI Utility Type Definitions
 *
 * Common UI-related types used across components for consistency.
 */

/**
 * Responsive breakpoint types
 * mobile: < 640px
 * tablet: 640px - 1024px
 * desktop: > 1024px
 */
export type Breakpoint = "mobile" | "tablet" | "desktop";

/**
 * Responsive breakpoint state
 */
export interface ResponsiveState {
  /** Current breakpoint */
  readonly breakpoint: Breakpoint;

  /** Mobile device (< 640px) */
  readonly isMobile: boolean;

  /** Tablet device (640-1024px) */
  readonly isTablet: boolean;

  /** Desktop device (> 1024px) */
  readonly isDesktop: boolean;

  /** Viewport width in pixels */
  readonly width: number;

  /** Viewport height in pixels */
  readonly height: number;
}

/**
 * Generic loading states
 */
export type LoadingState = "idle" | "loading" | "success" | "error";

/**
 * Component status types
 */
export type Status = "loading" | "success" | "error" | "warning" | "info";

/**
 * UI component variants
 */
export type Variant = "primary" | "secondary" | "ghost" | "outline";

/**
 * UI component sizes
 */
export type Size = "sm" | "md" | "lg" | "xl";

/**
 * Theme mode
 */
export type ThemeMode = "light" | "dark";

/**
 * Position types for tooltips, popovers, etc.
 */
export type Position = "top" | "bottom" | "left" | "right";

/**
 * Alignment types
 */
export type Alignment = "start" | "center" | "end";

/**
 * Animation types
 */
export type Animation = "fade" | "slide" | "scale" | "none";

/**
 * Color palette with semantic tokens
 */
export interface ColorPalette {
  /** Primary purple color (#8B5CF6 - Violet-500) */
  readonly primary: string;

  /** Primary hover state (#7C3AED - Violet-600) */
  readonly primaryHover: string;

  /** Secondary purple color (#6D28D9 - Violet-700) */
  readonly secondary: string;

  /** Accent purple color (#A78BFA - Violet-400) */
  readonly accent: string;

  /** Background color (light: #FFFFFF, dark: #0F172A) */
  readonly background: string;

  /** Surface color (light: #F8FAFC, dark: #1E293B) */
  readonly surface: string;

  /** Text color (light: #1E293B, dark: #F8FAFC) */
  readonly text: string;

  /** Secondary text color (lower contrast) */
  readonly textSecondary: string;

  /** Border color (light: #E2E8F0, dark: #334155) */
  readonly border: string;

  /** Success color (#10B981 - Green-500) */
  readonly success: string;

  /** Warning color (#F59E0B - Amber-500) */
  readonly warning: string;

  /** Error color (#EF4444 - Red-500) */
  readonly error: string;

  /** Info color (#3B82F6 - Blue-500) */
  readonly info: string;
}

/**
 * Theme configuration
 */
export interface Theme {
  /** Color palette */
  readonly palette: ColorPalette;

  /** Theme mode (light or dark) */
  readonly mode: ThemeMode;

  /** Spacing scale (in pixels) */
  readonly spacing: {
    readonly xs: number;
    readonly sm: number;
    readonly md: number;
    readonly lg: number;
    readonly xl: number;
    readonly xxl: number;
  };

  /** Border radius scale */
  readonly borderRadius: {
    readonly sm: string;
    readonly md: string;
    readonly lg: string;
    readonly full: string;
  };

  /** Typography scale */
  readonly typography: {
    readonly fontFamily: string;
    readonly fontSize: {
      readonly xs: string;
      readonly sm: string;
      readonly md: string;
      readonly lg: string;
      readonly xl: string;
      readonly xxl: string;
    };
    readonly fontWeight: {
      readonly normal: number;
      readonly medium: number;
      readonly semibold: number;
      readonly bold: number;
    };
  };

  /** Shadow scale */
  readonly shadows: {
    readonly sm: string;
    readonly md: string;
    readonly lg: string;
    readonly xl: string;
  };

  /** Transition durations (in ms) */
  readonly transitions: {
    readonly fast: number;
    readonly normal: number;
    readonly slow: number;
  };
}

/**
 * Icon mapping for the 8-icon system
 * Maps semantic categories to Lucide icon names
 */
export interface IconMapping {
  /** Status: healthy/success */
  readonly statusHealthy: string;

  /** Status: degraded/warning */
  readonly statusDegraded: string;

  /** Status: offline/error */
  readonly statusOffline: string;

  /** Action: navigate/external link */
  readonly actionNavigate: string;

  /** Action: refresh/reload */
  readonly actionRefresh: string;

  /** Data: chart/analytics */
  readonly dataChart: string;

  /** Data: metric/number */
  readonly dataMetric: string;

  /** UI: menu/hamburger */
  readonly uiMenu: string;
}

/**
 * Z-index layers for consistent stacking
 */
export enum ZIndex {
  Base = 0,
  Dropdown = 1000,
  Sticky = 1100,
  Fixed = 1200,
  Overlay = 1300,
  Modal = 1400,
  Popover = 1500,
  Tooltip = 1600,
}

/**
 * Spacing utilities
 */
export type Spacing = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16 | 20 | 24 | 32 | 40 | 48 | 56 | 64;

/**
 * Grid column spans
 */
export type ColumnSpan = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | "full";
