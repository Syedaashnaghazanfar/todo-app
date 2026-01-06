"use client";

/**
 * useTheme Hook
 *
 * Provides theme context with purple color palette and dark mode toggle.
 * Manages global theme state and persists preference to localStorage.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { theme, toggleDarkMode } = useTheme();
 *
 *   return (
 *     <div style={{ backgroundColor: theme.palette.background }}>
 *       <button onClick={toggleDarkMode}>
 *         {theme.mode === 'light' ? 'Dark Mode' : 'Light Mode'}
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 */

import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import type { Theme, ThemeMode, ColorPalette } from "@/types";

/**
 * Theme context shape
 */
interface ThemeContextValue {
  theme: Theme;
  mode: ThemeMode;
  toggleDarkMode: () => void;
  setMode: (mode: ThemeMode) => void;
}

/**
 * Light mode color palette - Cyberpunk Neon Elegance
 */
const lightPalette: ColorPalette = {
  primary: "#8B5CF6", // Primary purple
  primaryHover: "#7C3AED", // Darker purple for hover
  secondary: "#A78BFA", // Light purple accent
  accent: "#A855F7", // Neon purple
  background: "#F8F7FF", // Light main background
  surface: "#FFFFFF", // Light card background
  text: "#1E1B4B", // Dark text
  textSecondary: "#64748B", // Gray secondary text
  border: "#E2E8F0", // Light gray border
  success: "#10B981", // Green for success
  warning: "#F59E0B", // Amber for warning
  error: "#EF4444", // Red for error
  info: "#3B82F6", // Blue for info
};

/**
 * Dark mode color palette - Cyberpunk Neon Elegance
 */
const darkPalette: ColorPalette = {
  primary: "#A78BFA", // Lighter purple for dark mode contrast
  primaryHover: "#C4B5FD", // Even lighter purple for hover
  secondary: "#1A1A2E", // Dark elevated surface
  accent: "#A855F7", // Neon purple accent
  background: "#0A0A1A", // Main dark background
  surface: "#0F0F23", // Card backgrounds
  text: "#F8FAFC", // Light text
  textSecondary: "#94A3B8", // Secondary text
  border: "#334155", // Darker border
  success: "#10B981", // Green for success
  warning: "#F59E0B", // Amber for warning
  error: "#EF4444", // Red for error
  info: "#06B6D4", // Cyan for info (neon accent)
};

/**
 * Base theme configuration (mode-independent)
 */
const baseTheme = {
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: "0.25rem", // 4px
    md: "0.5rem", // 8px
    lg: "0.75rem", // 12px
    full: "9999px",
  },
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    fontSize: {
      xs: "0.75rem", // 12px
      sm: "0.875rem", // 14px
      md: "1rem", // 16px
      lg: "1.125rem", // 18px
      xl: "1.25rem", // 20px
      xxl: "1.5rem", // 24px
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },
  shadows: {
    sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
    xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
  },
  transitions: {
    fast: 150,
    normal: 300,
    slow: 500,
  },
};

/**
 * Create theme object based on mode
 */
const createTheme = (mode: ThemeMode): Theme => ({
  ...baseTheme,
  palette: mode === "light" ? lightPalette : darkPalette,
  mode,
});

/**
 * Theme context
 */
const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

/**
 * Local storage key for theme preference
 */
const THEME_STORAGE_KEY = "todo-app-theme";

/**
 * Get initial theme mode from localStorage or system preference
 */
const getInitialMode = (): ThemeMode => {
  // Check if running in browser
  if (typeof window === "undefined") {
    return "dark"; // Default to dark for cyberpunk theme
  }

  // Check localStorage
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === "light" || stored === "dark") {
    return stored;
  }

  // Check system preference
  if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }

  return "dark"; // Default to dark for cyberpunk theme
};

/**
 * ThemeProvider Component Props
 */
interface ThemeProviderProps {
  children: React.ReactNode;
  initialMode?: ThemeMode;
}

/**
 * ThemeProvider Component
 *
 * Wraps app with theme context provider.
 * Should be placed at the root of the component tree.
 *
 * @example
 * ```tsx
 * function App() {
 *   return (
 *     <ThemeProvider>
 *       <YourApp />
 *     </ThemeProvider>
 *   );
 * }
 * ```
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children, initialMode }) => {
  const [mode, setModeState] = useState<ThemeMode>(initialMode ?? "dark");

  // Initialize theme from storage/system on mount
  useEffect(() => {
    if (!initialMode) {
      setModeState(getInitialMode());
    }
  }, [initialMode]);

  // Persist theme changes to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(THEME_STORAGE_KEY, mode);

      // Update document class for Tailwind dark mode
      const root = document.documentElement;
      if (mode === "dark") {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    }
  }, [mode]);

  // Create theme object (memoized to prevent unnecessary re-renders)
  const theme = useMemo(() => createTheme(mode), [mode]);

  // Toggle between light and dark mode
  const toggleDarkMode = () => {
    setModeState((prev) => (prev === "light" ? "dark" : "light"));
  };

  // Set specific mode
  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
  };

  const value: ThemeContextValue = {
    theme,
    mode,
    toggleDarkMode,
    setMode,
  };

  return React.createElement(ThemeContext.Provider, { value }, children);
};

/**
 * useTheme Hook
 *
 * Access theme context in any component.
 * Must be used within ThemeProvider.
 *
 * @returns Theme context value with current theme and mode controls
 * @throws Error if used outside ThemeProvider
 */
export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
};

/**
 * Hook to detect system dark mode preference
 * Useful for showing a "use system theme" option
 */
export const useSystemTheme = (): ThemeMode => {
  const [systemTheme, setSystemTheme] = useState<ThemeMode>("light");

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    // Set initial value
    setSystemTheme(mediaQuery.matches ? "dark" : "light");

    // Listen for changes
    const handler = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? "dark" : "light");
    };

    mediaQuery.addEventListener("change", handler);

    return () => {
      mediaQuery.removeEventListener("change", handler);
    };
  }, []);

  return systemTheme;
};
