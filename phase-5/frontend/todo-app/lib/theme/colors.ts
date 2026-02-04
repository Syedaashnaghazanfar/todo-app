/**
 * Calm Design System - Color Tokens
 * Phase 3 Todo App - UI Redesign
 *
 * Defines calm color palettes for dark and light themes.
 * No pure black (#000000 or #030014) or pure white (#FFFFFF) for backgrounds.
 * All colors are intentionally designed for calm, production-ready UI.
 */

/* ========================================
   DARK THEME - CALM PALETTE
   No pure black, uses rich dark colors
   ======================================== */

export const darkThemeColors = {
  // Background layers (dark, not pure black)
  bgDarkest: '#0F1117',   // Deepest background - page root
  bgDark: '#1A1D2E',      // Main background - content areas
  bgCard: '#242838',       // Card surfaces
  bgElevated: '#2D3142',   // Elevated surfaces (hover, dropdowns)

  // Text colors (high contrast for readability)
  textPrimary: '#F8FAFC',     // Primary text - high contrast
  textSecondary: '#94A3B8',   // Secondary text - muted
  textMuted: '#64748B',       // Muted text - lowest priority

  // Border colors
  border: 'oklch(1 0 0 / 0.1)',           // Subtle border
  borderHover: 'oklch(1 0 0 / 0.15)',     // Hover border

  // Interactive colors
  primary: '#8B5CF6',       // Purple-500 - primary actions
  primaryForeground: '#FFFFFF',
  secondary: '#3B3F4F',     // Secondary interactive
  secondaryForeground: '#F8FAFC',
  accent: '#A78BFA',        // Purple-400 - accents
  accentForeground: '#FFFFFF',
  muted: '#2D3142',         // Muted backgrounds
  mutedForeground: '#94A3B8',
}

/* ========================================
   LIGHT THEME - CALM PALETTE
   No pure white, uses soft off-whites
   ======================================== */

export const lightThemeColors = {
  // Background layers (soft, not pure white)
  bgLightMain: '#F8FAFC',   // Main background - page root
  bgLightCard: '#FFFFFF',   // Card surfaces (can be white)
  bgLightElevated: '#F1F5F9', // Elevated surfaces

  // Text colors (dark for contrast)
  textPrimary: '#0F1117',   // Primary text - high contrast
  textSecondary: '#64748B', // Secondary text - muted
  textMuted: '#94A3B8',     // Muted text - lowest priority

  // Border colors
  border: '#E2E8F0',        // Light gray border
  borderHover: '#CBD5E1',   // Hover border

  // Interactive colors
  primary: '#8B5CF6',       // Purple-500 - primary actions
  primaryForeground: '#FFFFFF',
  secondary: '#E2E8F0',     // Secondary interactive
  secondaryForeground: '#0F1117',
  accent: '#A78BFA',        // Purple-400 - accents
  accentForeground: '#FFFFFF',
  muted: '#F1F5F9',         // Muted backgrounds
  mutedForeground: '#64748B',
}

/* ========================================
   PER-PAGE ACCENT COLORS
   Each page uses a single accent color
   ======================================== */

export const pageAccents = {
  dashboard: {
    DEFAULT: '#8B5CF6',     // Purple
    light: 'oklch(0.869 0.125 293.71)',
    muted: 'oklch(0.962 0.035 293.71)',
  },
  tasks: {
    DEFAULT: '#06B6D4',     // Cyan
    light: 'oklch(0.878 0.126 192.52)',
    muted: 'oklch(0.958 0.045 192.52)',
  },
  analytics: {
    DEFAULT: '#10B981',     // Green
    light: 'oklch(0.868 0.137 156.49)',
    muted: 'oklch(0.954 0.045 156.49)',
  },
  history: {
    DEFAULT: '#F59E0B',     // Amber
    light: 'oklch(0.865 0.121 70.52)',
    muted: 'oklch(0.954 0.048 70.52)',
  },
  notifications: {
    DEFAULT: '#EC4899',     // Pink
    light: 'oklch(0.863 0.151 352.25)',
    muted: 'oklch(0.956 0.043 352.25)',
  },
  settings: {
    DEFAULT: '#6366F1',     // Indigo
    light: 'oklch(0.855 0.144 262.52)',
    muted: 'oklch(0.953 0.035 262.52)',
  },
  chat: {
    DEFAULT: '#7C3AED',     // Violet
    light: 'oklch(0.847 0.158 284.45)',
    muted: 'oklch(0.953 0.032 284.45)',
  },
}

/* ========================================
   SEMANTIC COLOR TOKENS
   Mapped to semantic names for consistent usage
   ======================================== */

export const semanticColors = {
  // Backgrounds
  background: {
    dark: darkThemeColors.bgDark,
    light: lightThemeColors.bgLightMain,
  },
  foreground: {
    dark: darkThemeColors.textPrimary,
    light: lightThemeColors.textPrimary,
  },
  card: {
    dark: darkThemeColors.bgCard,
    light: lightThemeColors.bgLightCard,
  },
  cardForeground: {
    dark: darkThemeColors.textPrimary,
    light: lightThemeColors.textPrimary,
  },
  popover: {
    dark: darkThemeColors.bgElevated,
    light: lightThemeColors.bgLightCard,
  },
  popoverForeground: {
    dark: darkThemeColors.textPrimary,
    light: lightThemeColors.textPrimary,
  },

  // Primary (brand color)
  primary: {
    DEFAULT: darkThemeColors.primary,
    foreground: darkThemeColors.primaryForeground,
  },
  primaryForeground: {
    DEFAULT: darkThemeColors.primaryForeground,
    dark: darkThemeColors.primaryForeground,
    light: lightThemeColors.primaryForeground,
  },

  // Secondary
  secondary: {
    DEFAULT: darkThemeColors.secondary,
    foreground: darkThemeColors.secondaryForeground,
  },
  secondaryForeground: {
    DEFAULT: darkThemeColors.secondaryForeground,
    dark: darkThemeColors.secondaryForeground,
    light: lightThemeColors.secondaryForeground,
  },

  // Muted
  muted: {
    DEFAULT: darkThemeColors.muted,
    foreground: darkThemeColors.mutedForeground,
  },
  mutedForeground: {
    DEFAULT: darkThemeColors.mutedForeground,
    dark: darkThemeColors.mutedForeground,
    light: lightThemeColors.mutedForeground,
  },

  // Accent
  accent: {
    DEFAULT: darkThemeColors.accent,
    foreground: darkThemeColors.accentForeground,
  },
  accentForeground: {
    DEFAULT: darkThemeColors.accentForeground,
    dark: darkThemeColors.accentForeground,
    light: lightThemeColors.accentForeground,
  },

  // Destructive (error states)
  destructive: {
    DEFAULT: '#EF4444',     // Red
    foreground: '#FFFFFF',
  },
  destructiveForeground: {
    DEFAULT: '#FFFFFF',
  },

  // Borders and inputs
  border: {
    dark: darkThemeColors.border,
    light: lightThemeColors.border,
  },
  input: {
    dark: darkThemeColors.border,
    light: lightThemeColors.border,
  },
  ring: {
    DEFAULT: darkThemeColors.primary,
  },
}

/* ========================================
   TYPE EXPORTS
   ======================================== */

export type DarkThemeColors = typeof darkThemeColors;
export type LightThemeColors = typeof lightThemeColors;
export type PageAccents = typeof pageAccents;
export type SemanticColors = typeof semanticColors;
