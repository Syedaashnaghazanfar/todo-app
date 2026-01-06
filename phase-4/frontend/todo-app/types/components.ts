/**
 * Component Prop Type Definitions
 *
 * Type definitions for all React component props in Phase 2 Homepage UI.
 * These interfaces define the contract between data sources and components.
 *
 * @see /specs/001-phase2-homepage-ui/data-model.md
 */

import { LucideIcon } from "lucide-react";
import type { ChartType } from "./mcp";

/**
 * HomePage Component Props
 */
export interface HomePageProps {
  /** Optional: Initial loading state */
  readonly initialLoading?: boolean;
}

/**
 * HeroSection Component Props
 */
export interface HeroSectionProps {
  /** Main headline text (5-100 characters) */
  readonly headline: string;

  /** Brief value proposition (10-500 characters) */
  readonly description: string;

  /** Call-to-action button text (2-20 characters) */
  readonly ctaText: string;

  /** Navigation target for CTA */
  readonly ctaLink: string;

  /** Optional: hero background image URL */
  readonly backgroundImage?: string;

  /** Theme variant for hero section */
  readonly theme?: "dark" | "light";
}

/**
 * QuickActionCard Component Props
 */
export interface QuickActionCardProps {
  /** Unique identifier */
  readonly id: string;

  /** Feature name (2-30 characters) */
  readonly title: string;

  /** Brief explanation (5-150 characters) */
  readonly description: string;

  /** Lucide icon component */
  readonly icon: LucideIcon;

  /** Navigation target */
  readonly link: string;

  /** Optional: badge text (e.g., "New", "Beta") */
  readonly badge?: string;

  /** Optional: loading state */
  readonly loading?: boolean;

  /** Optional: click handler */
  readonly onClick?: () => void;
}

/**
 * QuickActionGrid Component Props
 */
export interface QuickActionGridProps {
  /** Array of quick action cards */
  readonly cards: readonly QuickActionCardProps[];

  /** Optional: grid layout columns (responsive) */
  readonly columns?: {
    readonly mobile?: number;
    readonly tablet?: number;
    readonly desktop?: number;
  };
}

/**
 * SystemStatusWidget Component Props
 */
export interface SystemStatusWidgetProps {
  /** Optional: custom refresh interval in ms (default 10000) */
  readonly refreshInterval?: number;

  /** Optional: show detailed metrics */
  readonly showDetails?: boolean;

  /** Optional: compact mode */
  readonly compact?: boolean;
}

/**
 * ServerStatusIndicator Component Props
 */
export interface ServerStatusIndicatorProps {
  /** Server name */
  readonly name: string;

  /** Health status */
  readonly status: "healthy" | "degraded" | "offline";

  /** Optional: uptime percentage */
  readonly uptime?: number;

  /** Optional: latency in ms */
  readonly latency?: number;

  /** Optional: status message */
  readonly message?: string;

  /** Optional: show tooltip on hover */
  readonly showTooltip?: boolean;
}

/**
 * StatsPreviewArea Component Props
 */
export interface StatsPreviewAreaProps {
  /** Optional: grid layout mode */
  readonly layout?: "grid" | "carousel";

  /** Optional: number of placeholder slots */
  readonly slots?: number;
}

/**
 * StatsPlaceholder Component Props
 */
export interface StatsPlaceholderProps {
  /** Unique identifier */
  readonly id: string;

  /** Metric label (2-50 characters) */
  readonly label: string;

  /** Optional: subtitle or unit description */
  readonly subtitle?: string;

  /** Responsive width configuration */
  readonly dimensions: {
    readonly width: "full" | "half" | "third";
    readonly height: "small" | "medium" | "large";
  };

  /** Optional: chart type hint for visualizer */
  readonly chartType?: ChartType;

  /** Optional: MCP endpoint for data source */
  readonly dataSource?: string;

  /** Optional: loading state */
  readonly loading?: boolean;
}

/**
 * NavigationLink Component Props
 */
export interface NavigationLinkProps {
  /** Unique identifier */
  readonly id: string;

  /** Display text (1-50 characters) */
  readonly label: string;

  /** Link target */
  readonly href: string;

  /** Optional: Lucide icon */
  readonly icon?: LucideIcon;

  /** Optional: current page indicator */
  readonly active?: boolean;

  /** Optional: opens in new tab if true */
  readonly external?: boolean;

  /** Optional: nested links for menus */
  readonly children?: readonly NavigationLinkProps[];

  /** Optional: click handler */
  readonly onClick?: () => void;
}

/**
 * Navigation Component Props
 */
export interface NavigationProps {
  /** Header navigation links */
  readonly header: readonly NavigationLinkProps[];

  /** Sidebar navigation links */
  readonly sidebar: readonly NavigationLinkProps[];

  /** Footer navigation links */
  readonly footer: readonly NavigationLinkProps[];

  /** Optional: current route for active state */
  readonly currentRoute?: string;
}

/**
 * Button Component Props
 */
export interface ButtonProps {
  /** Button text or children */
  readonly children: React.ReactNode;

  /** Button variant */
  readonly variant?: "primary" | "secondary" | "ghost" | "outline";

  /** Button size */
  readonly size?: "sm" | "md" | "lg";

  /** Optional: icon (left side) */
  readonly icon?: LucideIcon;

  /** Optional: icon position */
  readonly iconPosition?: "left" | "right";

  /** Optional: loading state */
  readonly loading?: boolean;

  /** Optional: disabled state */
  readonly disabled?: boolean;

  /** Optional: click handler */
  readonly onClick?: () => void;

  /** Optional: HTML button type */
  readonly type?: "button" | "submit" | "reset";

  /** Optional: full width */
  readonly fullWidth?: boolean;
}

/**
 * Card Component Props
 */
export interface CardProps {
  /** Card content */
  readonly children: React.ReactNode;

  /** Optional: card title */
  readonly title?: string;

  /** Optional: card header content */
  readonly header?: React.ReactNode;

  /** Optional: card footer content */
  readonly footer?: React.ReactNode;

  /** Optional: hover effect */
  readonly hoverable?: boolean;

  /** Optional: clickable card */
  readonly onClick?: () => void;

  /** Optional: additional CSS classes */
  readonly className?: string;
}

/**
 * Badge Component Props
 */
export interface BadgeProps {
  /** Badge text */
  readonly children: React.ReactNode;

  /** Badge variant */
  readonly variant?: "primary" | "secondary" | "success" | "warning" | "error" | "info";

  /** Optional: size */
  readonly size?: "sm" | "md" | "lg";

  /** Optional: icon */
  readonly icon?: LucideIcon;
}

/**
 * Tooltip Component Props
 */
export interface TooltipProps {
  /** Tooltip content */
  readonly content: string | React.ReactNode;

  /** Element to attach tooltip to */
  readonly children: React.ReactNode;

  /** Optional: tooltip position */
  readonly position?: "top" | "bottom" | "left" | "right";

  /** Optional: delay before showing (ms) */
  readonly delay?: number;
}

/**
 * Loading Spinner Component Props
 */
export interface LoadingSpinnerProps {
  /** Optional: size in pixels */
  readonly size?: number;

  /** Optional: custom color */
  readonly color?: string;

  /** Optional: loading message */
  readonly message?: string;
}

/**
 * Empty State Component Props
 */
export interface EmptyStateProps {
  /** Empty state title */
  readonly title: string;

  /** Empty state description */
  readonly description: string;

  /** Optional: icon */
  readonly icon?: LucideIcon;

  /** Optional: action button */
  readonly action?: {
    readonly label: string;
    readonly onClick: () => void;
  };
}

/**
 * Error State Component Props
 */
export interface ErrorStateProps {
  /** Error title */
  readonly title: string;

  /** Error message */
  readonly message: string;

  /** Optional: retry action */
  readonly onRetry?: () => void;

  /** Optional: retry button label */
  readonly retryLabel?: string;
}
