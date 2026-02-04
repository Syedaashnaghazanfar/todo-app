/**
 * Type Definitions Index
 *
 * Central export point for all type definitions.
 * Import types using: import { TypeName } from "@/types";
 */

// MCP Data Types
export type {
  ServerHealthStatus,
  ServerStatus,
  SystemStatus,
  ChartType,
  Metric,
  MetricsResponse,
  ErrorResponse,
  RequestState,
  ApiResponse,
} from "./mcp";

// Component Prop Types
export type {
  HomePageProps,
  HeroSectionProps,
  QuickActionCardProps,
  QuickActionGridProps,
  SystemStatusWidgetProps,
  ServerStatusIndicatorProps,
  StatsPreviewAreaProps,
  StatsPlaceholderProps,
  NavigationLinkProps,
  NavigationProps,
  ButtonProps,
  CardProps,
  BadgeProps,
  TooltipProps,
  LoadingSpinnerProps,
  EmptyStateProps,
  ErrorStateProps,
} from "./components";

// UI Utility Types
export type {
  Breakpoint,
  ResponsiveState,
  LoadingState,
  Status,
  Variant,
  Size,
  ThemeMode,
  Position,
  Alignment,
  Animation,
  ColorPalette,
  Theme,
  IconMapping,
  Spacing,
  ColumnSpan,
} from "./ui";

export { ZIndex } from "./ui";
