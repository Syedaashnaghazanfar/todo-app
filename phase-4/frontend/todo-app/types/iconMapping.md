# Icon Mapping System

**Phase 2 Homepage UI - 8-Icon System**

This document defines the standardized 8-icon system used throughout the Phase 2 Homepage UI. All components should reference these icons for consistency with the purple theme.

## Icon Library

We use [Lucide React](https://lucide.dev/) for all icons. Import icons like:

```tsx
import { CheckCircle, AlertCircle, XCircle } from "lucide-react";
```

## The 8 Core Icons

### 1. Status: Healthy/Success
**Icon**: `CheckCircle`
**Usage**: System health indicators, success states, completed actions
**Color**: `#10B981` (Green-500) or `theme.palette.success`

```tsx
import { CheckCircle } from "lucide-react";

<CheckCircle className="text-green-500" size={20} />
```

---

### 2. Status: Degraded/Warning
**Icon**: `AlertCircle`
**Usage**: Warning states, degraded performance, attention needed
**Color**: `#F59E0B` (Amber-500) or `theme.palette.warning`

```tsx
import { AlertCircle } from "lucide-react";

<AlertCircle className="text-amber-500" size={20} />
```

---

### 3. Status: Offline/Error
**Icon**: `XCircle`
**Usage**: Error states, offline status, failed operations
**Color**: `#EF4444` (Red-500) or `theme.palette.error`

```tsx
import { XCircle } from "lucide-react";

<XCircle className="text-red-500" size={20} />
```

---

### 4. Action: Navigate/External Link
**Icon**: `ExternalLink`
**Usage**: External links, navigation to new pages, quick actions
**Color**: `#8B5CF6` (Violet-500) or `theme.palette.primary`

```tsx
import { ExternalLink } from "lucide-react";

<ExternalLink className="text-purple-500" size={16} />
```

---

### 5. Action: Refresh/Reload
**Icon**: `RefreshCw`
**Usage**: Refresh actions, reload data, retry operations
**Color**: `#8B5CF6` (Violet-500) or `theme.palette.primary`

```tsx
import { RefreshCw } from "lucide-react";

<RefreshCw className="text-purple-500 animate-spin" size={16} />
```

---

### 6. Data: Chart/Analytics
**Icon**: `BarChart3`
**Usage**: Analytics, charts, data visualization, metrics
**Color**: `#8B5CF6` (Violet-500) or `theme.palette.primary`

```tsx
import { BarChart3 } from "lucide-react";

<BarChart3 className="text-purple-500" size={24} />
```

---

### 7. Data: Metric/Number
**Icon**: `Activity`
**Usage**: Live metrics, real-time data, performance indicators
**Color**: `#8B5CF6` (Violet-500) or `theme.palette.primary`

```tsx
import { Activity } from "lucide-react";

<Activity className="text-purple-500" size={20} />
```

---

### 8. UI: Menu/Hamburger
**Icon**: `Menu`
**Usage**: Mobile navigation, hamburger menu, collapsible menus
**Color**: `#1E293B` (Slate-800) or `theme.palette.text`

```tsx
import { Menu } from "lucide-react";

<Menu className="text-slate-800 dark:text-slate-50" size={24} />
```

---

## TypeScript Type Definition

Reference the `IconMapping` interface in `types/ui.ts`:

```typescript
export interface IconMapping {
  readonly statusHealthy: string;      // "CheckCircle"
  readonly statusDegraded: string;     // "AlertCircle"
  readonly statusOffline: string;      // "XCircle"
  readonly actionNavigate: string;     // "ExternalLink"
  readonly actionRefresh: string;      // "RefreshCw"
  readonly dataChart: string;          // "BarChart3"
  readonly dataMetric: string;         // "Activity"
  readonly uiMenu: string;             // "Menu"
}
```

## Usage in Components

### Example 1: System Status Widget

```tsx
import { CheckCircle, AlertCircle, XCircle } from "lucide-react";
import { useTheme } from "@/hooks";

function ServerStatusIndicator({ status }: { status: "healthy" | "degraded" | "offline" }) {
  const { theme } = useTheme();

  const iconMap = {
    healthy: <CheckCircle className="text-green-500" size={20} />,
    degraded: <AlertCircle className="text-amber-500" size={20} />,
    offline: <XCircle className="text-red-500" size={20} />,
  };

  return <div>{iconMap[status]}</div>;
}
```

### Example 2: Quick Action Card

```tsx
import { ExternalLink, BarChart3, Activity } from "lucide-react";

function QuickActionCard({ icon: Icon, title }: { icon: LucideIcon; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="text-purple-500" size={24} />
      <span>{title}</span>
    </div>
  );
}

// Usage
<QuickActionCard icon={BarChart3} title="Analytics" />
```

## Color Palette Reference

All icons should follow the purple theme palette:

| State      | Color       | Hex Code  | Tailwind Class       |
|------------|-------------|-----------|----------------------|
| Primary    | Violet-500  | #8B5CF6   | `text-purple-500`    |
| Hover      | Violet-600  | #7C3AED   | `text-purple-600`    |
| Success    | Green-500   | #10B981   | `text-green-500`     |
| Warning    | Amber-500   | #F59E0B   | `text-amber-500`     |
| Error      | Red-500     | #EF4444   | `text-red-500`       |
| Info       | Blue-500    | #3B82F6   | `text-blue-500`      |

## Icon Sizes

Standard icon sizes for consistency:

- **Small**: 16px - Inline text, badges, small buttons
- **Medium**: 20px - Default, most UI elements
- **Large**: 24px - Headers, featured actions, cards
- **XLarge**: 32px - Hero sections, empty states

```tsx
<CheckCircle size={16} /> // Small
<CheckCircle size={20} /> // Medium (default)
<CheckCircle size={24} /> // Large
<CheckCircle size={32} /> // XLarge
```

## Animation Classes

Common animation utilities for icons:

```tsx
// Spin animation (for loading/refresh)
<RefreshCw className="animate-spin" />

// Pulse animation (for attention)
<AlertCircle className="animate-pulse" />

// Bounce animation (for success)
<CheckCircle className="animate-bounce" />
```

## Accessibility

Always include appropriate ARIA labels for screen readers:

```tsx
<CheckCircle
  className="text-green-500"
  size={20}
  aria-label="Healthy status"
  role="img"
/>
```

## Dark Mode Support

Use Tailwind's dark mode classes for proper contrast:

```tsx
<Menu className="text-slate-800 dark:text-slate-50" size={24} />
```

---

**Document Version**: 1.0.0
**Last Updated**: 2025-12-10
**Maintained By**: Frontend Data Integrator Sub-Agent
