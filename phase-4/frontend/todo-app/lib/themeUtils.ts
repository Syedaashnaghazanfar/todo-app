/**
 * Theme Utilities
 *
 * Utility functions for theme management, localStorage persistence,
 * and theme-related operations across the application.
 */

import type { ThemeMode } from '@/types';

// Theme storage key
const THEME_STORAGE_KEY = 'todo-app-theme';

/**
 * Get theme preference from localStorage
 * @returns Theme mode stored in localStorage or null if not found
 */
export const getStoredTheme = (): ThemeMode | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
    return null;
  } catch (error) {
    console.warn('Failed to read theme from localStorage:', error);
    return null;
  }
};

/**
 * Save theme preference to localStorage
 * @param themeMode - Theme mode to store
 */
export const storeTheme = (themeMode: ThemeMode): void => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(THEME_STORAGE_KEY, themeMode);
  } catch (error) {
    console.warn('Failed to save theme to localStorage:', error);
  }
};

/**
 * Remove theme preference from localStorage
 */
export const clearStoredTheme = (): void => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.removeItem(THEME_STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to remove theme from localStorage:', error);
  }
};

/**
 * Get system theme preference
 * @returns User's system theme preference
 */
export const getSystemTheme = (): ThemeMode => {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return 'dark'; // Default to dark for cyberpunk theme
  }

  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'dark' : 'light';
};

/**
 * Apply theme to document element
 * @param themeMode - Theme mode to apply
 */
export const applyThemeToDocument = (themeMode: ThemeMode): void => {
  if (typeof window === 'undefined') {
    return;
  }

  const root = document.documentElement;

  if (themeMode === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
};

/**
 * Initialize theme on document load
 * @param defaultMode - Default theme mode if no preference exists
 * @returns Applied theme mode
 */
export const initializeTheme = (defaultMode: ThemeMode = 'dark'): ThemeMode => {
  // Get stored theme preference
  let themeMode = getStoredTheme();

  // If no stored preference, use system preference
  if (!themeMode) {
    themeMode = getSystemTheme();
  }

  // Apply the theme to the document
  applyThemeToDocument(themeMode);

  return themeMode;
};

/**
 * Toggle theme and update storage
 * @param currentMode - Current theme mode
 * @returns New theme mode after toggle
 */
export const toggleTheme = (currentMode: ThemeMode): ThemeMode => {
  const newMode = currentMode === 'light' ? 'dark' : 'light';
  storeTheme(newMode);
  applyThemeToDocument(newMode);
  return newMode;
};

/**
 * Set specific theme and update storage
 * @param themeMode - Theme mode to set
 */
export const setTheme = (themeMode: ThemeMode): void => {
  storeTheme(themeMode);
  applyThemeToDocument(themeMode);
};

/**
 * Check if theme is currently dark mode
 * @param themeMode - Theme mode to check
 * @returns True if theme is dark mode
 */
export const isDarkMode = (themeMode: ThemeMode): boolean => {
  return themeMode === 'dark';
};

/**
 * Check if theme is currently light mode
 * @param themeMode - Theme mode to check
 * @returns True if theme is light mode
 */
export const isLightMode = (themeMode: ThemeMode): boolean => {
  return themeMode === 'light';
};

/**
 * Get theme-specific class names
 * @param themeMode - Current theme mode
 * @param darkClass - Class to apply in dark mode
 * @param lightClass - Class to apply in light mode
 * @returns Appropriate class for current theme
 */
export const getThemeClass = (
  themeMode: ThemeMode,
  darkClass: string,
  lightClass: string
): string => {
  return isDarkMode(themeMode) ? darkClass : lightClass;
};

/**
 * Theme utility object with all functions
 */
export const themeUtils = {
  getStoredTheme,
  storeTheme,
  clearStoredTheme,
  getSystemTheme,
  applyThemeToDocument,
  initializeTheme,
  toggleTheme,
  setTheme,
  isDarkMode,
  isLightMode,
  getThemeClass,
};

export default themeUtils;