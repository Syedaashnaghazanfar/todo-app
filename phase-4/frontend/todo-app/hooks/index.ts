/**
 * Hooks Index
 *
 * Central export point for all custom React hooks.
 * Import hooks using: import { useTheme, useResponsive } from "@/hooks";
 */

// Theme hooks
export { useTheme, useSystemTheme, ThemeProvider } from "./useTheme";

// Responsive hooks
export {
  useResponsive,
  useBreakpoint,
  useMediaQuery,
  useViewportSize,
  useIsMobile,
  useIsTablet,
  useIsDesktop,
  useOrientation,
} from "./useResponsive";
