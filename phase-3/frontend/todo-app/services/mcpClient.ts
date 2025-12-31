/**
 * MCP Client Service
 *
 * Central API client for MCP server communication.
 * Handles requests to MCP endpoints with error handling, timeouts, and fallbacks.
 *
 * @see /specs/001-phase2-homepage-ui/contracts/openapi.yaml
 */

import type {
  SystemStatus,
  MetricsResponse,
  ErrorResponse,
  ApiResponse,
  ServerStatus,
  Metric,
} from "@/types";

/**
 * API configuration
 */
const API_CONFIG = {
  baseUrl: "/api",
  timeout: 10000, // 10 seconds
  retryAttempts: 2,
  retryDelay: 1000, // 1 second
} as const;

/**
 * Mock data for fallback when API is unavailable
 */
const MOCK_SYSTEM_STATUS: SystemStatus = {
  servers: [
    {
      name: "Analytics MCP",
      status: "healthy",
      lastChecked: new Date().toISOString(),
      uptime: 99.95,
      latency: 45,
    },
    {
      name: "Auth MCP",
      status: "healthy",
      lastChecked: new Date().toISOString(),
      uptime: 100,
      latency: 12,
    },
    {
      name: "Data MCP",
      status: "degraded",
      lastChecked: new Date().toISOString(),
      uptime: 85.5,
      latency: 2000,
      message: "High latency detected",
    },
  ],
  overallStatus: "degraded",
  lastUpdated: new Date().toISOString(),
};

const MOCK_METRICS: MetricsResponse = {
  metrics: [
    {
      id: "active_users",
      label: "Active Users",
      value: 1234,
      unit: "users",
      trend: "+12%",
      chartType: "line",
    },
    {
      id: "api_calls",
      label: "API Calls (24h)",
      value: 50000,
      unit: "calls",
      trend: "+8%",
      chartType: "bar",
    },
    {
      id: "uptime",
      label: "System Uptime",
      value: 99.95,
      unit: "%",
      trend: "+0.05%",
      chartType: "area",
    },
    {
      id: "error_rate",
      label: "Error Rate",
      value: 0.05,
      unit: "%",
      trend: "-0.02%",
      chartType: "line",
    },
  ],
  timestamp: new Date().toISOString(),
};

/**
 * Custom error class for MCP API errors
 */
class MCPError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public errorCode?: string,
  ) {
    super(message);
    this.name = "MCPError";
  }
}

/**
 * Sleep utility for retry delays
 */
const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Fetch with timeout
 */
const fetchWithTimeout = async (url: string, options: RequestInit, timeout: number): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

/**
 * Generic API request handler with error handling and retries
 */
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {},
  retries: number = API_CONFIG.retryAttempts,
): Promise<T> => {
  const url = `${API_CONFIG.baseUrl}${endpoint}`;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetchWithTimeout(
        url,
        {
          ...options,
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            ...options.headers,
          },
        },
        API_CONFIG.timeout,
      );

      // Handle non-OK responses
      if (!response.ok) {
        const errorData: ErrorResponse = await response.json().catch(() => ({
          error: "UNKNOWN_ERROR",
          message: "An unknown error occurred",
          statusCode: response.status,
        }));

        throw new MCPError(errorData.message, errorData.statusCode, errorData.error);
      }

      // Parse and return JSON response
      const data: T = await response.json();
      return data;
    } catch (error) {
      // If this was the last attempt, throw the error
      if (attempt === retries) {
        if (error instanceof MCPError) {
          throw error;
        }

        // Handle network errors, timeouts, etc.
        if (error instanceof Error) {
          if (error.name === "AbortError") {
            throw new MCPError("Request timeout", 408, "TIMEOUT");
          }
          throw new MCPError(error.message, undefined, "NETWORK_ERROR");
        }

        throw new MCPError("An unknown error occurred", undefined, "UNKNOWN_ERROR");
      }

      // Wait before retrying
      await sleep(API_CONFIG.retryDelay * (attempt + 1));
    }
  }

  // This should never be reached, but TypeScript needs it
  throw new MCPError("Max retries exceeded", undefined, "MAX_RETRIES_EXCEEDED");
};

/**
 * MCP Client API
 */
export const mcpClient = {
  /**
   * Fetch system status of all MCP servers
   *
   * @param includeMetrics - Include detailed metrics (optional)
   * @returns System status response or mock data on failure
   *
   * @example
   * ```ts
   * const status = await mcpClient.fetchStatus();
   * console.log(status.overallStatus); // "healthy"
   * ```
   */
  async fetchStatus(includeMetrics: boolean = false): Promise<SystemStatus> {
    try {
      const queryParams = includeMetrics ? "?includeMetrics=true" : "";
      const data = await apiRequest<SystemStatus>(`/mcp/status${queryParams}`);
      return data;
    } catch (error) {
      console.warn("Failed to fetch system status, using mock data:", error);
      return MOCK_SYSTEM_STATUS;
    }
  },

  /**
   * Fetch application metrics and statistics
   *
   * @param period - Time period for metrics ("day" | "week" | "month")
   * @param limit - Maximum number of metrics to return (1-50)
   * @returns Metrics response or mock data on failure
   *
   * @example
   * ```ts
   * const metrics = await mcpClient.fetchMetrics("week", 10);
   * console.log(metrics.metrics); // Array of metric objects
   * ```
   */
  async fetchMetrics(period: "day" | "week" | "month" = "day", limit: number = 10): Promise<MetricsResponse> {
    try {
      const queryParams = new URLSearchParams({
        period,
        limit: limit.toString(),
      });

      const data = await apiRequest<MetricsResponse>(`/mcp/metrics?${queryParams}`);
      return data;
    } catch (error) {
      console.warn("Failed to fetch metrics, using mock data:", error);
      return MOCK_METRICS;
    }
  },

  /**
   * Check health of a specific MCP server
   *
   * @param serverName - Name of the MCP server to check
   * @returns Server status or null if not found
   */
  async checkServerHealth(serverName: string): Promise<ServerStatus | null> {
    try {
      const status = await this.fetchStatus();
      const server = status.servers.find((s) => s.name === serverName);
      return server || null;
    } catch (error) {
      console.error(`Failed to check health for server: ${serverName}`, error);
      return null;
    }
  },

  /**
   * Get specific metric by ID
   *
   * @param metricId - Unique metric identifier
   * @returns Metric object or null if not found
   */
  async getMetric(metricId: string): Promise<Metric | null> {
    try {
      const metrics = await this.fetchMetrics();
      const metric = metrics.metrics.find((m) => m.id === metricId);
      return metric || null;
    } catch (error) {
      console.error(`Failed to get metric: ${metricId}`, error);
      return null;
    }
  },
};

/**
 * Helper function to create ApiResponse wrapper for UI state management
 *
 * @param fetchFn - Async function that fetches data
 * @returns ApiResponse object with data, state, and error
 *
 * @example
 * ```ts
 * const response = await createApiResponse(() => mcpClient.fetchStatus());
 * if (response.isSuccess) {
 *   console.log(response.data);
 * }
 * ```
 */
export const createApiResponse = async <T>(fetchFn: () => Promise<T>): Promise<ApiResponse<T>> => {
  try {
    const data = await fetchFn();
    return {
      data,
      state: "success",
      error: null,
      isLoading: false,
      isSuccess: true,
      isError: false,
    };
  } catch (error) {
    let errorResponse: ErrorResponse;

    if (error instanceof MCPError) {
      errorResponse = {
        error: error.errorCode || "UNKNOWN_ERROR",
        message: error.message,
        statusCode: error.statusCode,
        timestamp: new Date().toISOString(),
      };
    } else if (error instanceof Error) {
      errorResponse = {
        error: "UNKNOWN_ERROR",
        message: error.message,
        timestamp: new Date().toISOString(),
      };
    } else {
      errorResponse = {
        error: "UNKNOWN_ERROR",
        message: "An unknown error occurred",
        timestamp: new Date().toISOString(),
      };
    }

    return {
      data: null,
      state: "error",
      error: errorResponse,
      isLoading: false,
      isSuccess: false,
      isError: true,
    };
  }
};

/**
 * Export error class for custom error handling
 */
export { MCPError };

/**
 * Export API configuration for testing/mocking
 */
export { API_CONFIG, MOCK_SYSTEM_STATUS, MOCK_METRICS };
