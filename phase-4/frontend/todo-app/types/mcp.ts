/**
 * MCP Data Types
 *
 * Type definitions for MCP API responses matching OpenAPI contract.
 * Used by mcpClient service and data transformation logic.
 *
 * @see /specs/001-phase2-homepage-ui/contracts/openapi.yaml
 */

/**
 * Server health status
 */
export type ServerHealthStatus = "healthy" | "degraded" | "offline";

/**
 * Individual MCP server status
 */
export interface ServerStatus {
  /** MCP server name (e.g., "Analytics MCP", "Auth MCP") */
  readonly name: string;

  /** Server health status */
  readonly status: ServerHealthStatus;

  /** Timestamp of last health check (ISO 8601) */
  readonly lastChecked: string;

  /** Server uptime percentage (0-100) */
  readonly uptime?: number;

  /** Average response latency in milliseconds */
  readonly latency?: number;

  /** Optional status message or error details (max 200 chars) */
  readonly message?: string;
}

/**
 * System health status across all MCP servers
 */
export interface SystemStatus {
  /** Status of individual MCP servers */
  readonly servers: readonly ServerStatus[];

  /** Overall system health */
  readonly overallStatus: ServerHealthStatus;

  /** Timestamp of last status check (ISO 8601) */
  readonly lastUpdated: string;
}

/**
 * Chart type for visualization
 */
export type ChartType = "line" | "bar" | "pie" | "area";

/**
 * Individual metric data point
 */
export interface Metric {
  /** Unique metric identifier */
  readonly id: string;

  /** Display label for metric */
  readonly label: string;

  /** Metric value */
  readonly value: number;

  /** Unit of measurement (e.g., "users", "calls", "%") */
  readonly unit: string;

  /** Optional subtitle or description */
  readonly subtitle?: string;

  /** Optional trend indicator (e.g., "+12%", "-5%") */
  readonly trend?: string;

  /** Suggested chart type for visualization */
  readonly chartType?: ChartType;
}

/**
 * Stats placeholder for chart visualization
 */
export interface StatPlaceholder {
  /** Unique identifier for the stat container */
  readonly id: string;

  /** Display label for the stat container */
  readonly label: string;

  /** Description of the stat container */
  readonly description: string;

  /** Suggested chart type for visualization */
  readonly chartType?: ChartType;

  /** Dimensions for the chart container */
  readonly dimensions?: {
    /** Width in pixels or percentage */
    width?: string | number;

    /** Height in pixels or percentage */
    height?: string | number;
  };
}

/**
 * Application metrics response
 */
export interface MetricsResponse {
  /** Array of metrics */
  readonly metrics: readonly Metric[];

  /** Timestamp when metrics were collected (ISO 8601) */
  readonly timestamp: string;
}

/**
 * Standard error response
 */
export interface ErrorResponse {
  /** Error code (e.g., "SERVICE_UNAVAILABLE") */
  readonly error: string;

  /** Human-readable error message */
  readonly message: string;

  /** HTTP status code */
  readonly statusCode?: number;

  /** Error timestamp (ISO 8601) */
  readonly timestamp?: string;
}

/**
 * API request state for async operations
 */
export type RequestState = "idle" | "loading" | "success" | "error";

/**
 * Generic API response wrapper for UI state management
 */
export interface ApiResponse<T> {
  /** Response data (null if error or loading) */
  readonly data: T | null;

  /** Request state */
  readonly state: RequestState;

  /** Error details (null if no error) */
  readonly error: ErrorResponse | null;

  /** Loading indicator */
  readonly isLoading: boolean;

  /** Success indicator */
  readonly isSuccess: boolean;

  /** Error indicator */
  readonly isError: boolean;
}
