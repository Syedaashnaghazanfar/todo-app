# Data Infrastructure Documentation

**Phase 2 Homepage UI - Frontend Data Layer**

This document provides a complete overview of the data infrastructure created for the Phase 2 Homepage UI, including hooks, services, type definitions, and integration patterns.

## Table of Contents

1. [Overview](#overview)
2. [Type Definitions](#type-definitions)
3. [Hooks](#hooks)
4. [Services](#services)
5. [Theme System](#theme-system)
6. [Icon Mapping](#icon-mapping)
7. [Usage Examples](#usage-examples)
8. [Integration Guide](#integration-guide)

---

## Overview

The data infrastructure provides:

- **Type-safe interfaces** for all data flowing through the system
- **React hooks** for theme management and responsive behavior
- **MCP client service** for API communication with error handling
- **Purple theme palette** with light/dark mode support
- **8-icon system** for visual consistency

### File Structure

```
frontend/todo-app/
├── types/
│   ├── mcp.ts           # MCP API data types
│   ├── components.ts    # Component prop interfaces
│   ├── ui.ts            # UI utility types
│   ├── index.ts         # Type exports
│   └── iconMapping.md   # Icon system documentation
├── hooks/
│   ├── useTheme.ts      # Theme context and hook
│   ├── useResponsive.ts # Responsive breakpoint detection
│   └── index.ts         # Hook exports
└── services/
    └── mcpClient.ts     # MCP API client
```

---

## Type Definitions

### 1. MCP Data Types (`types/mcp.ts`)

Type definitions matching the OpenAPI contract for MCP endpoints.

#### Key Types:

**ServerStatus**
```typescript
interface ServerStatus {
  readonly name: string;
  readonly status: "healthy" | "degraded" | "offline";
  readonly lastChecked: string; // ISO 8601
  readonly uptime?: number;
  readonly latency?: number;
  readonly message?: string;
}
```

**SystemStatus**
```typescript
interface SystemStatus {
  readonly servers: readonly ServerStatus[];
  readonly overallStatus: "healthy" | "degraded" | "offline";
  readonly lastUpdated: string;
}
```

**Metric**
```typescript
interface Metric {
  readonly id: string;
  readonly label: string;
  readonly value: number;
  readonly unit: string;
  readonly trend?: string;
  readonly chartType?: "line" | "bar" | "pie" | "area";
}
```

**ApiResponse Wrapper**
```typescript
interface ApiResponse<T> {
  readonly data: T | null;
  readonly state: "idle" | "loading" | "success" | "error";
  readonly error: ErrorResponse | null;
  readonly isLoading: boolean;
  readonly isSuccess: boolean;
  readonly isError: boolean;
}
```

### 2. Component Props (`types/components.ts`)

Prop interfaces for all React components.

#### Key Interfaces:

- `HomePageProps`
- `HeroSectionProps`
- `QuickActionCardProps`
- `SystemStatusWidgetProps`
- `StatsPlaceholderProps`
- `NavigationLinkProps`
- `ButtonProps`
- `CardProps`
- `BadgeProps`
- `TooltipProps`

### 3. UI Utilities (`types/ui.ts`)

Common UI types and theme configuration.

#### Key Types:

**Breakpoint**
```typescript
type Breakpoint = "mobile" | "tablet" | "desktop";
```

**Theme**
```typescript
interface Theme {
  readonly palette: ColorPalette;
  readonly mode: "light" | "dark";
  readonly spacing: { xs: number; sm: number; md: number; /* ... */ };
  readonly borderRadius: { sm: string; md: string; /* ... */ };
  readonly typography: { /* ... */ };
  readonly shadows: { /* ... */ };
  readonly transitions: { fast: number; normal: number; slow: number };
}
```

**ColorPalette**
```typescript
interface ColorPalette {
  readonly primary: string;       // #8B5CF6
  readonly primaryHover: string;  // #7C3AED
  readonly secondary: string;     // #6D28D9
  readonly accent: string;        // #A78BFA
  readonly background: string;    // #FFFFFF (light) / #0F172A (dark)
  readonly surface: string;       // #F8FAFC (light) / #1E293B (dark)
  readonly text: string;          // #1E293B (light) / #F8FAFC (dark)
  readonly border: string;        // #E2E8F0 (light) / #334155 (dark)
  readonly success: string;       // #10B981
  readonly warning: string;       // #F59E0B
  readonly error: string;         // #EF4444
  readonly info: string;          // #3B82F6
}
```

---

## Hooks

### 1. useTheme Hook (`hooks/useTheme.ts`)

Provides theme context with purple color palette and dark mode toggle.

#### API:

```typescript
interface ThemeContextValue {
  theme: Theme;
  mode: "light" | "dark";
  toggleDarkMode: () => void;
  setMode: (mode: ThemeMode) => void;
}

const useTheme = (): ThemeContextValue;
```

#### Usage:

```tsx
import { useTheme, ThemeProvider } from "@/hooks";

// Wrap your app
function App() {
  return (
    <ThemeProvider>
      <YourApp />
    </ThemeProvider>
  );
}

// Use in components
function MyComponent() {
  const { theme, mode, toggleDarkMode } = useTheme();

  return (
    <div style={{ backgroundColor: theme.palette.background }}>
      <button onClick={toggleDarkMode}>
        {mode === "light" ? "Dark Mode" : "Light Mode"}
      </button>
    </div>
  );
}
```

#### Features:

- Purple color palette (Violet-500 primary)
- Light/dark mode support
- localStorage persistence
- System preference detection
- Tailwind dark mode integration

### 2. useResponsive Hook (`hooks/useResponsive.ts`)

Provides responsive breakpoint detection for adaptive UI.

#### API:

```typescript
interface ResponsiveState {
  readonly breakpoint: Breakpoint;
  readonly isMobile: boolean;
  readonly isTablet: boolean;
  readonly isDesktop: boolean;
  readonly width: number;
  readonly height: number;
}

const useResponsive = (debounceDelay?: number): ResponsiveState;
```

#### Breakpoints:

- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

#### Usage:

```tsx
import { useResponsive } from "@/hooks";

function MyComponent() {
  const { isMobile, isTablet, isDesktop, breakpoint } = useResponsive();

  return (
    <div>
      {isMobile && <MobileView />}
      {isTablet && <TabletView />}
      {isDesktop && <DesktopView />}
    </div>
  );
}
```

#### Additional Hooks:

```typescript
// Simplified breakpoint detection
const useBreakpoint = (): Breakpoint;

// Custom media queries
const useMediaQuery = (query: string): boolean;

// Viewport dimensions
const useViewportSize = (): { width: number; height: number };

// Convenience hooks
const useIsMobile = (): boolean;
const useIsTablet = (): boolean;
const useIsDesktop = (): boolean;

// Orientation detection
const useOrientation = (): "portrait" | "landscape";
```

---

## Services

### MCP Client Service (`services/mcpClient.ts`)

Central API client for MCP server communication.

#### API:

```typescript
const mcpClient = {
  // Fetch system status
  fetchStatus(includeMetrics?: boolean): Promise<SystemStatus>;

  // Fetch metrics
  fetchMetrics(
    period?: "day" | "week" | "month",
    limit?: number
  ): Promise<MetricsResponse>;

  // Check specific server health
  checkServerHealth(serverName: string): Promise<ServerStatus | null>;

  // Get specific metric
  getMetric(metricId: string): Promise<Metric | null>;
};
```

#### Features:

- **Timeout handling**: 10-second timeout
- **Retry logic**: 2 retry attempts with exponential backoff
- **Error handling**: Typed error responses
- **Mock data fallback**: Returns mock data if API unavailable
- **Type safety**: Full TypeScript typing

#### Usage:

```tsx
import { mcpClient, createApiResponse } from "@/services/mcpClient";

// Basic usage
async function loadStatus() {
  const status = await mcpClient.fetchStatus();
  console.log(status.overallStatus); // "healthy"
}

// With ApiResponse wrapper
async function loadWithState() {
  const response = await createApiResponse(() => mcpClient.fetchStatus());

  if (response.isSuccess) {
    console.log(response.data);
  } else if (response.isError) {
    console.error(response.error);
  }
}

// Fetch metrics
async function loadMetrics() {
  const metrics = await mcpClient.fetchMetrics("week", 10);
  console.log(metrics.metrics); // Array of metric objects
}
```

#### Mock Data:

The service includes comprehensive mock data for development:

- 3 sample MCP servers (Analytics, Auth, Data)
- 4 sample metrics (Active Users, API Calls, Uptime, Error Rate)
- Realistic status indicators and trends

---

## Theme System

### Purple Theme Palette

The theme system uses a consistent purple color palette based on Tailwind's Violet scale.

#### Light Mode:

| Token          | Color       | Hex Code  | Usage                    |
|----------------|-------------|-----------|--------------------------|
| primary        | Violet-500  | #8B5CF6   | Primary actions, links   |
| primaryHover   | Violet-600  | #7C3AED   | Hover states             |
| secondary      | Violet-700  | #6D28D9   | Secondary actions        |
| accent         | Violet-400  | #A78BFA   | Highlights, accents      |
| background     | White       | #FFFFFF   | Page background          |
| surface        | Slate-50    | #F8FAFC   | Card/surface backgrounds |
| text           | Slate-800   | #1E293B   | Primary text             |
| textSecondary  | Slate-500   | #64748B   | Secondary text           |
| border         | Slate-200   | #E2E8F0   | Borders                  |

#### Dark Mode:

| Token          | Color       | Hex Code  | Usage                    |
|----------------|-------------|-----------|--------------------------|
| primary        | Violet-500  | #8B5CF6   | Primary actions, links   |
| primaryHover   | Violet-400  | #A78BFA   | Hover states (lighter)   |
| secondary      | Violet-400  | #A78BFA   | Secondary actions        |
| accent         | Violet-300  | #C4B5FD   | Highlights, accents      |
| background     | Slate-900   | #0F172A   | Page background          |
| surface        | Slate-800   | #1E293B   | Card/surface backgrounds |
| text           | Slate-50    | #F8FAFC   | Primary text             |
| textSecondary  | Slate-400   | #94A3B8   | Secondary text           |
| border         | Slate-700   | #334155   | Borders                  |

---

## Icon Mapping

The 8-icon system provides visual consistency. See `types/iconMapping.md` for complete details.

### Core Icons:

1. **CheckCircle** - Healthy/Success states
2. **AlertCircle** - Degraded/Warning states
3. **XCircle** - Offline/Error states
4. **ExternalLink** - Navigation/External links
5. **RefreshCw** - Refresh/Reload actions
6. **BarChart3** - Charts/Analytics
7. **Activity** - Metrics/Real-time data
8. **Menu** - Mobile menu/Hamburger

---

## Usage Examples

### Example 1: Theme-Aware Component

```tsx
import { useTheme } from "@/hooks";

function ThemedCard({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();

  return (
    <div
      style={{
        backgroundColor: theme.palette.surface,
        color: theme.palette.text,
        border: `1px solid ${theme.palette.border}`,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.lg,
      }}
    >
      {children}
    </div>
  );
}
```

### Example 2: Responsive Component

```tsx
import { useResponsive } from "@/hooks";

function ResponsiveGrid({ children }: { children: React.ReactNode }) {
  const { isMobile, isTablet, isDesktop } = useResponsive();

  const columns = isMobile ? 1 : isTablet ? 2 : 3;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: "1rem",
      }}
    >
      {children}
    </div>
  );
}
```

### Example 3: System Status Widget

```tsx
import { useEffect, useState } from "react";
import { mcpClient } from "@/services/mcpClient";
import { SystemStatus } from "@/types";
import { CheckCircle, AlertCircle, XCircle } from "lucide-react";

function SystemStatusWidget() {
  const [status, setStatus] = useState<SystemStatus | null>(null);

  useEffect(() => {
    const loadStatus = async () => {
      const data = await mcpClient.fetchStatus();
      setStatus(data);
    };

    loadStatus();

    // Refresh every 10 seconds
    const interval = setInterval(loadStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  if (!status) return <div>Loading...</div>;

  const iconMap = {
    healthy: <CheckCircle className="text-green-500" />,
    degraded: <AlertCircle className="text-amber-500" />,
    offline: <XCircle className="text-red-500" />,
  };

  return (
    <div>
      <h3>System Status</h3>
      {iconMap[status.overallStatus]}
      <span>{status.overallStatus}</span>

      <ul>
        {status.servers.map((server) => (
          <li key={server.name}>
            {iconMap[server.status]} {server.name} - {server.uptime}% uptime
          </li>
        ))}
      </ul>
    </div>
  );
}
```

---

## Integration Guide

### Step 1: Set Up Theme Provider

Wrap your app with `ThemeProvider` in the root layout:

```tsx
// app/layout.tsx
import { ThemeProvider } from "@/hooks";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### Step 2: Import Types

```tsx
import type {
  SystemStatus,
  MetricsResponse,
  ServerStatus,
  Theme,
} from "@/types";
```

### Step 3: Use Hooks

```tsx
import { useTheme, useResponsive } from "@/hooks";

function MyComponent() {
  const { theme, mode } = useTheme();
  const { isMobile } = useResponsive();

  // Your component logic
}
```

### Step 4: Fetch MCP Data

```tsx
import { mcpClient } from "@/services/mcpClient";

async function loadData() {
  const status = await mcpClient.fetchStatus();
  const metrics = await mcpClient.fetchMetrics();

  // Use the data
}
```

### Step 5: Use Icons

```tsx
import { CheckCircle, BarChart3 } from "lucide-react";

function IconExample() {
  return (
    <div>
      <CheckCircle className="text-green-500" size={20} />
      <BarChart3 className="text-purple-500" size={24} />
    </div>
  );
}
```

---

## Next Steps

The data infrastructure is now ready for component development. The UI Builder Sub-Agent can proceed with:

1. Creating layout components (HomePage, HeroSection)
2. Building interactive components (QuickActionCard, SystemStatusWidget)
3. Implementing stats placeholder containers
4. Adding navigation components

All components should:
- Import types from `@/types`
- Use `useTheme` for theme-aware styling
- Use `useResponsive` for adaptive layouts
- Fetch data using `mcpClient` service
- Follow the 8-icon system for visual consistency

---

**Document Version**: 1.0.0
**Last Updated**: 2025-12-10
**Created By**: Frontend Data Integrator Sub-Agent
**Status**: Complete and Ready for Component Development
