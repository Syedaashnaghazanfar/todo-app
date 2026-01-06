/**
 * Calm Design System - Design Tokens
 * Phase 3 Todo App - UI Redesign
 *
 * Defines spacing, typography, border radius, and shadow tokens
 * for consistent, calm UI across the application.
 */

/* ========================================
   SPACING SCALE
   Calm whitespace for comfortable visual hierarchy
   ======================================== */

export const spacing = {
  xs: '4px',      // 0.25rem - Tight spacing, icon gaps
  sm: '8px',      // 0.5rem  - Small component spacing
  md: '16px',     // 1rem    - Default component spacing
  lg: '24px',     // 1.5rem  - Section spacing
  xl: '32px',     // 2rem    - Large section spacing
  '2xl': '48px',  // 3rem    - Page section spacing
  '3xl': '64px',  // 4rem    - Major page divisions
} as const;

/* ========================================
   TYPOGRAPHY SCALE
   Readable hierarchy for calm visual presentation
   ======================================== */

export const typography = {
  // Font sizes
  fontSize: {
    xs: '12px',      // 0.75rem  - Captions, metadata
    sm: '14px',      // 0.875rem - Secondary text, labels
    base: '16px',    // 1rem     - Body text, paragraphs
    lg: '18px',      // 1.125rem - Large body text
    xl: '20px',      // 1.25rem  - Section headings
    '2xl': '24px',   // 1.5rem   - Page headings
    '3xl': '30px',   // 1.875rem - Major headings
    '4xl': '36px',   // 2.25rem  - Display text
  },

  // Font weights
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  // Line heights
  lineHeight: {
    tight: 1.2,      // Headings
    normal: 1.5,     // Body text
    relaxed: 1.75,   // Long text, comfortable reading
  },

  // Letter spacing
  letterSpacing: {
    tight: '-0.025em',   // Headings
    normal: '0',         // Body text
    wide: '0.025em',     // Caps, small text
  },
}

/* ========================================
   BORDER RADIUS SCALE
   Soft, approachable corners
   ======================================== */

export const borderRadius = {
  sm: '6px',       // 0.375rem - Small elements, badges
  md: '8px',       // 0.5rem   - Default, buttons, inputs
  lg: '12px',      // 0.75rem  - Cards, modals
  xl: '16px',      // 1rem     - Large cards, panels
  full: '9999px',  //          - Pills, avatars, circular
} as const;

/* ========================================
   SHADOW SCALE
   Calm shadows, no neon glow effects
   ======================================== */

export const shadows = {
  sm: '0 1px 2px rgba(0, 0, 0, 0.05)',           // Subtle depth
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',       // Default card shadow
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',     // Elevated elements
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',     // Modals, dropdowns
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)', // Heavy depth
} as const;

/* ========================================
   Z-INDEX SCALE
   Layered component stacking
   ======================================== */

export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  modal: 1200,
  popover: 1300,
  tooltip: 1400,
  toast: 1500,
} as const;

/* ========================================
   BREAKPOINTS
   Responsive design breakpoints
   ======================================== */

export const breakpoints = {
  sm: '640px',     // Small tablets
  md: '768px',     // Tablets
  lg: '1024px',    // Desktop
  xl: '1280px',    // Large desktop
  '2xl': '1536px', // Extra large
} as const;

/* ========================================
   TRANSITIONS
   Smooth, physics-based timing
   ======================================== */

export const transitions = {
  fast: '150ms ease-out',
  normal: '300ms ease-out',
  slow: '500ms ease-out',
} as const;

/* ========================================
   TYPE EXPORTS
   ======================================== */

export type Spacing = keyof typeof spacing;
export type BorderRadius = keyof typeof borderRadius;
export type Shadow = keyof typeof shadows;
export type ZIndex = keyof typeof zIndex;
export type Breakpoint = keyof typeof breakpoints;
