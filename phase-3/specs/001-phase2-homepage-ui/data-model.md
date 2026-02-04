# Data Model: Phase 2 Homepage UI

**Date**: 2025-12-10
**Feature**: Phase 2 Homepage UI
**Status**: Complete

## Entity Definitions

### 1. HeroSection

**Purpose**: Main landing section with headline, description, and primary CTA

**Type Definition** (TypeScript):
```typescript
interface HeroSection {
  headline: string;        // e.g., "Welcome to Phase 2"
  description: string;     // Brief value proposition
  ctaText: string;        // e.g., "Get Started"
  ctaLink: string;        // Navigation target
  backgroundImage?: string; // Optional: hero background
  theme: "dark" | "light"; // Purple theme variant
}
```

**Validation Rules**:
- headline: Required, 5-100 characters
- description: Required, 10-500 characters
- ctaText: Required, 2-20 characters
- ctaLink: Required, valid URL path
- theme: Must match constitution's purple theme

**State Transitions**: Static; no state changes during session

---

### 2. QuickActionCard

**Purpose**: Clickable card providing quick access to main features

**Type Definition** (TypeScript):
```typescript
interface QuickActionCard {
  id: string;              // Unique identifier
  title: string;          // Feature name
  description: string;    // Brief explanation
  icon: LucideIcon;       // React component from Lucide
  link: string;           // Navigation target
  badge?: string;         // Optional: "New", "Beta", etc.
  loading?: boolean;      // Optional: loading state
}
```

**Collection**:
```typescript
type QuickActionCards = QuickActionCard[];
```

**Validation Rules**:
- id: Required, unique, alphanumeric + underscore
- title: Required, 2-30 characters
- description: Required, 5-150 characters
- icon: Must be valid Lucide component
- link: Valid URL path, absolute or relative
- badge: Optional, 2-20 characters

**State Transitions**:
- `loading=false` → `loading=true` (on click, waiting for navigation)
- `loading=true` → Card becomes disabled, shows loading indicator
- Navigation occurs after brief animation

**UI Behavior**:
- Hover: Scale +5%, shadow deepens, cursor → pointer
- Active/Click: Loading spinner appears; disabled state
- Focus: Keyboard outline visible (accessibility)

---

### 3. SystemStatus

**Purpose**: Represents health status of MCP servers and backend services

**Type Definition** (TypeScript):
```typescript
interface ServerStatus {
  name: string;              // e.g., "Analytics MCP"
  status: "healthy" | "degraded" | "offline";
  lastChecked: ISO8601Date;  // e.g., "2025-12-10T14:30:00Z"
  uptime?: number;           // Percentage, 0-100
  latency?: number;          // ms
  message?: string;          // Optional status message
}

interface SystemStatus {
  servers: ServerStatus[];
  overallStatus: "healthy" | "degraded" | "offline";
  lastUpdated: ISO8601Date;
}
```

**Validation Rules**:
- status: Must be one of enum values
- lastChecked: Valid ISO8601 timestamp
- uptime: 0-100, numeric
- latency: >= 0, numeric
- message: Optional, max 200 characters

**State Transitions**:
1. Initial Load: `{ loading: true }`
2. Fetch Success: `{ servers: [...], overallStatus, lastUpdated }`
3. Fetch Error: `{ servers: [], overallStatus: "offline", error: string }`
4. Auto-Refresh (10s): Fetch new data, animate color transition
5. User Hover: Show tooltip with detailed info

**Color Mapping** (TailwindCSS):
```
healthy  → bg-green-500  (Lucide: CheckCircle)
degraded → bg-yellow-500 (Lucide: AlertCircle)
offline  → bg-red-500    (Lucide: XCircle)
```

---

### 4. StatsPlaceholder

**Purpose**: Reserved container for charts and metrics (populated by Chart Visualizer Sub-Agent)

**Type Definition** (TypeScript):
```typescript
interface StatsPlaceholder {
  id: string;              // Unique identifier
  label: string;           // e.g., "Monthly Users"
  subtitle?: string;       // Optional: unit or description
  dimensions: {
    width: "full" | "half" | "third"; // Responsive width
    height: "small" | "medium" | "large";
  };
  chartType?: "line" | "bar" | "pie" | "area"; // Optional: type hint
  dataSource?: string;      // Optional: MCP endpoint
  loading?: boolean;        // Loading state
}

type StatsPlaceholders = StatsPlaceholder[];
```

**Validation Rules**:
- id: Required, unique, alphanumeric
- label: Required, 2-50 characters
- dimensions.width: One of enum values
- dimensions.height: One of enum values
- chartType: Optional, one of enum values
- dataSource: Optional, valid URL path

**State Transitions**:
1. Initial: `{ loading: true, dataSource: "/mcp/metrics" }`
2. Data Received: Chart Visualizer renders; `loading: false`
3. Error: Show placeholder with "no data" message

**Responsive Behavior**:
- Mobile: `width: "full"` (single column)
- Tablet: `width: "half"` (2-column grid)
- Desktop: `width: "third"` (3-column grid)

---

### 5. NavigationLink

**Purpose**: Represents a link in header, sidebar, or footer

**Type Definition** (TypeScript):
```typescript
interface NavigationLink {
  id: string;              // Unique identifier
  label: string;           // Display text
  href: string;            // Link target
  icon?: LucideIcon;       // Optional: Lucide icon
  active?: boolean;        // Current page indicator
  external?: boolean;      // Opens in new tab if true
  children?: NavigationLink[]; // Nested links (for menus)
}

interface Navigation {
  header: NavigationLink[];
  sidebar: NavigationLink[];
  footer: NavigationLink[];
}
```

**Validation Rules**:
- id: Required, unique
- label: Required, 1-50 characters
- href: Required, valid URL (relative or absolute)
- icon: Optional, valid Lucide component
- active: Boolean (derived from current route)
- external: Boolean (controls target="_blank")

**State Transitions**:
- Hover: Background/color change, icon animates
- Click: Navigate; `active=true` on target page
- Mobile: Sidebar collapses to hamburger menu

**Accessibility**:
- Keyboard: Tab through all links, Enter to navigate
- Screen Reader: Label describes destination
- Focus State: Clear outline or background change

---

### 6. ThemeContext (Global State)

**Purpose**: Centralize purple theme configuration and dark mode toggle

**Type Definition** (TypeScript):
```typescript
interface ThemeContext {
  palette: {
    primary: string;      // #8B5CF6 (Violet-500)
    primaryHover: string; // #7C3AED (Violet-600)
    secondary: string;    // #6D28D9 (Violet-700)
    accent: string;       // #A78BFA (Violet-400)
    background: string;   // #FFFFFF or #0F172A
    surface: string;      // #F8FAFC or #1E293B
    text: string;         // #000000 or #FFFFFF
    border: string;       // #E2E8F0 or #334155
  };
  mode: "light" | "dark";
  toggleDarkMode: () => void;
}
```

**Validation Rules**:
- All colors: Valid hex or rgb format
- mode: One of enum values

**State Transitions**:
- User toggles dark mode: Theme switches globally
- All components re-render with new palette
- Preference saved to localStorage

---

## Relationships & Dependencies

```
HomePage
├── HeroSection
├── QuickActionCards[]
│   └── (Each card can navigate to features)
├── SystemStatusWidget
│   └── SystemStatus (from MCP endpoint)
├── StatsPreviewArea
│   ├── StatsPlaceholder[] (containers ready for Chart Visualizer)
│   └── (Will receive chart data from Chart Visualizer Sub-Agent)
├── Navigation
│   ├── header: NavigationLink[]
│   ├── sidebar: NavigationLink[]
│   └── footer: NavigationLink[]
└── ThemeContext (global, all components consume)
```

## Data Flow

### MCP Server Status Flow

```
1. Page Load
   ↓
2. useMCPStatus Hook (component mount)
   ↓
3. Fetch /mcp/status endpoint
   ↓
4. Frontend Data Integrator transforms response
   → SystemStatus type validation
   → Color mapping (healthy/degraded/offline)
   ↓
5. SystemStatusWidget renders with color-coded indicators
   ↓
6. Auto-refresh every 10 seconds
   → Animate color transitions
   → Update lastUpdated timestamp
```

### Stats Placeholder Flow

```
1. Page Load
   ↓
2. StatsPlaceholder components render with skeleton loaders
   ↓
3. Chart Visualizer Sub-Agent receives data
   ↓
4. Transforms data into chart-ready format
   ↓
5. Renders chart components in placeholder containers
   ↓
6. Animations smooth in charts
```

## API Contracts Integration

### GET /mcp/status

**Request**:
```
GET /api/mcp/status
Accept: application/json
```

**Response (200 OK)**:
```json
{
  "servers": [
    {
      "name": "Analytics MCP",
      "status": "healthy",
      "lastChecked": "2025-12-10T14:30:00Z",
      "uptime": 99.95,
      "latency": 45
    },
    {
      "name": "Auth MCP",
      "status": "healthy",
      "lastChecked": "2025-12-10T14:30:00Z",
      "uptime": 100,
      "latency": 12
    }
  ],
  "overallStatus": "healthy",
  "lastUpdated": "2025-12-10T14:30:00Z"
}
```

### GET /mcp/metrics

**Request**:
```
GET /api/mcp/metrics
Accept: application/json
```

**Response (200 OK)**:
```json
{
  "metrics": [
    {
      "id": "active_users",
      "label": "Active Users",
      "value": 1234,
      "unit": "users",
      "trend": "+12%"
    },
    {
      "id": "api_calls",
      "label": "API Calls (24h)",
      "value": 50000,
      "unit": "calls",
      "trend": "+8%"
    }
  ],
  "timestamp": "2025-12-10T14:30:00Z"
}
```

## Type Safety & Validation

**Validation Strategy**:
1. **Runtime Validation**: Use TypeScript interfaces + runtime checks
2. **Component Props**: Define PropTypes or Zod schemas
3. **API Responses**: Validate against contracts in API layer
4. **Error Handling**: Fallback to default values if validation fails

**Example Validation (using Zod)**:
```typescript
import { z } from "zod";

const SystemStatusSchema = z.object({
  servers: z.array(
    z.object({
      name: z.string().min(1).max(100),
      status: z.enum(["healthy", "degraded", "offline"]),
      lastChecked: z.string().datetime(),
      uptime: z.number().min(0).max(100).optional(),
      latency: z.number().min(0).optional(),
    })
  ),
  overallStatus: z.enum(["healthy", "degraded", "offline"]),
  lastUpdated: z.string().datetime(),
});
```

## Next Steps

1. **Phase 1**: Generate API contracts (OpenAPI spec)
2. **Phase 1**: Create component quickstart guide
3. **Phase 2**: Generate tasks for component development
4. **Implementation**: Start building components with sub-agents

---

**Approval**: Data model complete and ready for contract generation
