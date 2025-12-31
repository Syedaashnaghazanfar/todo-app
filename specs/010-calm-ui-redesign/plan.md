# Implementation Plan: Calm UI Redesign

**Branch**: `010-calm-ui-redesign` | **Date**: 2025-12-30 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification for calm, modern, dashboard-first UI redesign

## Summary

Implement a calm, modern, production-ready UI redesign for the Phase 3 Todo application. This focuses exclusively on frontend work without backend changes. The redesign transforms the current "cyberpunk neon" aesthetic into a calm, dashboard-centric experience with full dark/light theme support. Key changes include: removing hero sections in favor of dashboard widgets, implementing intentional color palettes (no pure black/white), adding per-page accent colors, and creating physics-based animations via Framer Motion.

## Technical Context

**Language/Version**: TypeScript 5.x, Next.js 16.0.10, React 19.2.1
**Primary Dependencies**: Next.js 16, React 19, Tailwind CSS 4, Framer Motion 12, Recharts 3, Lucide React, Zustand 5, Better Auth 1.4
**Storage**: localStorage (theme preference only), API-driven data
**Testing**: Jest 30, React Testing Library 16
**Target Platform**: Web (desktop, tablet, mobile responsive)
**Project Type**: Single web application (Next.js App Router)
**Performance Goals**: < 300ms theme transitions, < 500ms task list render, < 300ms checkbox animation
**Constraints**: No backend changes, no hardcoded user data, no mock data required, UI/UX only
**Scale/Scope**: 9 pages (Home, Tasks, Analytics, History, Notifications, Settings, Chat, Login, Signup), ~30 components

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Check | Status | Notes |
|-------|--------|-------|
| Uses MCP tools when available | N/A | No MCP tools needed for UI-only work |
| Delegates UI to sub-agents | N/A | This is planning work, not implementation |
| Uses purple theme | YES | Purple as global theme accent, per-page accent colors |
| Uses Lucide React icons | YES | Existing icon library confirmed |
| Uses Tailwind CSS + Framer Motion | YES | Existing dependencies confirmed |
| No hardcoded secrets | N/A | Frontend-only work |
| Safety/installation rules | PASS | All dependencies already installed |

**Result**: GATE PASSED - Constitution compliance confirmed for frontend-only work

## Project Structure

### Documentation (this feature)

```text
specs/010-calm-ui-redesign/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (design direction, color system)
├── quickstart.md        # Phase 1 output (theme system reference)
└── tasks.md             # Phase 2 output (/sp.tasks command)
```

### Source Code (repository root)

```text
phase-3/frontend/todo-app/
├── app/                          # Next.js App Router pages
│   ├── layout.tsx                # Root layout (ThemeProvider, AuthProvider)
│   ├── page.tsx                  # Dashboard (Home)
│   ├── tasks/page.tsx            # Tasks management
│   ├── analytics/page.tsx        # Analytics dashboard
│   ├── history/page.tsx          # Task history timeline
│   ├── notifications/page.tsx    # Notifications feed
│   ├── settings/page.tsx         # Settings sections
│   ├── chat/page.tsx             # AI chat interface
│   ├── login/page.tsx            # Auth page
│   └── signup/page.tsx           # Auth page
├── components/                    # React components
│   ├── shared/                   # Shared UI primitives
│   │   ├── Button.tsx            # Physics-based button
│   │   ├── Card.tsx              # Calm card design
│   │   ├── Input.tsx             # Styled input
│   │   └── Modal.tsx             # Dialog component
│   ├── layout/                   # Layout components (NEW)
│   │   ├── Sidebar.tsx           # Collapsible sidebar navigation
│   │   ├── TopBar.tsx            # Top navigation with theme toggle
│   │   └── PageContainer.tsx     # Consistent page wrapper
│   ├── dashboard/                # Dashboard components (NEW)
│   │   ├── WelcomeHeader.tsx     # User greeting with date
│   │   ├── StatsOverview.tsx     # Task count cards
│   │   ├── ProgressChart.tsx     # Donut chart visualization
│   │   ├── ImportantTasks.tsx    # Priority task list
│   │   └── DueSoonTasks.tsx      # Upcoming task list
│   ├── tasks/                    # Task components
│   │   ├── TaskCard.tsx          # Task item with hover actions
│   │   ├── TaskList.tsx          # Task list container
│   │   ├── TaskForm.tsx          # Create/edit task modal
│   │   ├── FilterPanel.tsx       # Sidebar filters
│   │   └── TagChip.tsx           # Tag with conditional icons
│   ├── analytics/                # Analytics components
│   │   ├── MetricCard.tsx        # Stats display
│   │   ├── WeeklyChart.tsx       # Bar chart
│   │   └── CompletionChart.tsx   # Donut chart
│   ├── history/                  # History components
│   │   ├── HistoryTimeline.tsx   # Date-grouped timeline
│   │   └── HistoryEntry.tsx      # Single activity item
│   ├── notifications/            # Notification components
│   │   ├── NotificationList.tsx  # Feed container
│   │   └── NotificationItem.tsx  # Single notification
│   ├── chat/                     # Chat components
│   │   └── ChatInterface.tsx     # Chat page layout
│   ├── auth/                     # Auth components
│   │   ├── AuthCard.tsx          # Glassmorphic card
│   │   ├── LoginForm.tsx         # Login form
│   │   └── SignupForm.tsx        # Signup form
│   └── ui/                       # Shadcn UI primitives
├── hooks/                        # React hooks
│   ├── useTheme.ts               # Existing theme management
│   ├── useTasks.ts               # Task data hooks
│   ├── useStats.ts               # Stats data hooks
│   └── useReducedMotion.ts       # Reduced motion detection
├── lib/                          # Utilities
│   ├── theme/
│   │   ├── tokens.ts             # Design tokens (colors, spacing)
│   │   ├── colors.ts             # Color palette definitions
│   │   ├── typography.ts         # Typography scale
│   │   └── animations.ts         # Framer Motion variants
│   └── utils.ts                  # Class merging utilities
├── styles/
│   ├── globals.css               # CSS variables (THEME SYSTEM)
│   └── colors.ts                 # Color palette exports
├── types/
│   ├── task.types.ts             # Task entity types
│   ├── components.ts             # Component prop types
│   └── ui.ts                     # UI utility types
└── tailwind.config.ts            # Tailwind configuration

tests/
├── components/                   # Component tests
└── hooks/                        # Hook tests
```

**Structure Decision**: Next.js App Router structure with feature-based component organization. Layout components in dedicated folder, feature components in their respective folders, shared UI primitives in components/ui.

## Complexity Tracking

> N/A - No constitution violations requiring justification. The existing codebase already follows the planned structure pattern.

---

# Phase 0: Research & Design Direction

## Research Tasks

### R1: Calm Design System Definition

**Question**: What defines "calm" vs "cyberpunk" aesthetic, and what specific design tokens (colors, spacing, typography) should be used?

**Current State**: Existing theme uses cyberpunk neon colors with glow effects and high contrast.

**Required Decisions**:
- Define calm color palette (intentional, not auto-inverted)
- Define spacing scale for calm whitespace
- Define typography hierarchy for readability
- Establish motion principles (physics-based, subtle)

**Deliverable**: Design tokens document specifying all CSS custom properties

### R2: Per-Page Accent Color System

**Question**: How to implement per-page accent colors (Dashboard=Purple, Tasks=Cyan, etc.) while maintaining visual coherence?

**Current State**: Single purple theme across all pages.

**Per Spec (A-008)**:
- Dashboard = Purple
- Tasks = Cyan
- Analytics = Green
- History = Amber
- Notifications = Pink
- Settings = Indigo
- Chat = Violet

**Required Decisions**:
- CSS custom property strategy for accent colors
- How accent colors apply to interactive elements
- Color contrast validation for accessibility

**Deliverable**: Accent color system with CSS variable mappings

### R3: Tag Icon System

**Question**: How to implement selective tag icons (icons only for category tags)?

**Category Tags** (show icons): Work, Learning, Health, Finance, Urgent
**Custom Tags** (text only): Everything else

**Required Decisions**:
- Tag type classification logic
- Icon mapping configuration
- Conditional rendering in TagChip component

**Deliverable**: Tag icon configuration and component logic

### R4: Animation & Motion Strategy

**Question**: How to implement physics-based animations with Framer Motion while respecting reduced-motion preferences?

**Required Decisions**:
- Spring animation configurations (stiffness, damping)
- Reduced motion fallback strategy
- Animation timing targets (< 300ms for interactions)

**Deliverable**: Animation variants and hook for motion preferences

---

# Phase 1: Design & Contracts

## Design Deliverables

### D1: Design Tokens (colors.ts, tokens.ts)

Define CSS custom properties for:

**Color Tokens** (calm palette, no pure black/white):
```css
:root {
  /* Dark Theme - Calm Dark */
  --bg-darkest: #0F1117;    /* Not pure black */
  --bg-dark: #1A1D2E;       /* Not pure black */
  --bg-card: #242838;       /* Card surfaces */
  --bg-elevated: #2D3142;   /* Elevated surfaces */

  /* Light Theme - Calm Light */
  --bg-light-main: #F8FAFC; /* Not pure white */
  --bg-light-card: #FFFFFF; /* Cards (can be white) */
  --bg-light-elevated: #F1F5F9;

  /* Semantic Colors */
  --primary: #8B5CF6;       /* Purple-500 */
  --primary-foreground: #FFFFFF;
  --secondary: #F1F5F9;
  --secondary-foreground: #1E293B;
  --muted: #F8FAFC;
  --muted-foreground: #64748B;
  --accent: #A78BFA;
  --accent-foreground: #FFFFFF;
  --destructive: #EF4444;
  --destructive-foreground: #FFFFFF;
  --border: #E2E8F0;
  --input: #E2E8F0;
  --ring: #8B5CF6;

  /* Per-Page Accents (CSS variables applied per-route) */
  --page-accent: #8B5CF6;   /* Default purple */
  --page-accent-light: oklch(0.869 0.125 293.71);
  --page-accent-muted: oklch(0.962 0.035 293.71);
}

.light {
  /* Light mode semantic overrides */
}
```

**Spacing Scale**:
```css
--space-xs: 4px;
--space-sm: 8px;
--space-md: 16px;
--space-lg: 24px;
--space-xl: 32px;
--space-2xl: 48px;
--space-3xl: 64px;
```

**Typography Scale**:
```css
--font-xs: 12px;
--font-sm: 14px;
--font-base: 16px;
--font-lg: 18px;
--font-xl: 20px;
--font-2xl: 24px;
--font-3xl: 30px;
--font-4xl: 36px;
```

**Border Radius**:
```css
--radius-sm: 6px;
--radius-md: 8px;
--radius-lg: 12px;
--radius-xl: 16px;
--radius-full: 9999px;
```

**Shadows** (calm, no glow):
```css
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
```

### D2: Animation System (animations.ts)

Framer Motion variants for physics-based animations:

```typescript
// Spring configuration for interactions
export const spring = {
  gentle: { type: "spring", stiffness: 200, damping: 20 },
  responsive: { type: "spring", stiffness: 300, damping: 25 },
  snappy: { type: "spring", stiffness: 400, damping: 30 },
};

// Transition defaults
export const transition = {
  fast: { duration: 0.15 },
  normal: { duration: 0.3 },
  slow: { duration: 0.5 },
};

// Variants
export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export const slideUp = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
};
```

### D3: Tag Icon Configuration (tagCategories.ts)

```typescript
export const TAG_CATEGORIES = {
  Work: { icon: Briefcase, color: 'blue' },
  Learning: { icon: BookOpen, color: 'green' },
  Health: { icon: Heart, color: 'red' },
  Finance: { icon: DollarSign, color: 'emerald' },
  Urgent: { icon: AlertTriangle, color: 'amber' },
} as const;

export const isCategoryTag = (tag: string): boolean => {
  return Object.keys(TAG_CATEGORIES).includes(tag);
};

export const getTagIcon = (tag: string) => {
  if (!isCategoryTag(tag)) return null;
  return TAG_CATEGORIES[tag as keyof typeof TAG_CATEGORIES].icon;
};
```

### D4: Quickstart Reference (quickstart.md)

Single-page reference for developers covering:
- Theme token usage (CSS classes, Tailwind utilities)
- Component patterns (Button, Card, Modal)
- Animation usage (Framer Motion variants)
- Accent color application per page
- Tag icon system usage
- Reduced motion handling

---

## Output Summary

After Phase 0 and Phase 1 completion, the following artifacts will be generated:

| Artifact | Purpose | Location |
|----------|---------|----------|
| research.md | Design direction, color decisions, technical approach | specs/010-calm-ui-redesign/ |
| quickstart.md | Developer reference for theme tokens, components, animations | specs/010-calm-ui-redesign/ |

## Next Steps

After Phase 1 approval:
1. Run `/sp.tasks` to generate implementation tasks
2. Execute tasks in sequential order (Phase 1 → Phase 8)
3. Verify each phase meets acceptance criteria from spec.md

## Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Existing cyberpunk theme is deeply integrated | High | Incremental refactor by component/page |
| Animation performance on lower-end devices | Medium | Reduced motion support, fallback styles |
| Accessibility compliance with custom colors | Medium | WCAG contrast validation per color choice |
| Per-page accent color consistency | Low | Design token system ensures coherence |

## Dependencies

| Dependency | Status | Notes |
|------------|--------|-------|
| Next.js 16 | Installed | App Router confirmed |
| React 19 | Installed | Confirmed in package.json |
| Tailwind CSS 4 | Installed | v4 with @theme inline |
| Framer Motion 12 | Installed | For physics animations |
| Lucide React | Installed | For icons |
| Zustand | Installed | For state management |
| Recharts | Installed | For analytics charts |
