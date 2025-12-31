# Implementation Plan: Phase 2 Homepage UI

**Branch**: `001-phase2-homepage-ui` | **Date**: 2025-12-10 | **Spec**: `/specs/001-phase2-homepage-ui/spec.md`
**Input**: Feature specification from `/specs/001-phase2-homepage-ui/spec.md`

**Note**: This plan outlines the architecture and design approach for the Phase 2 homepage UI with purple theme, sub-agent coordination, and MCP integration.

## Summary

Build a production-ready, responsive homepage UI using React + TypeScript with TailwindCSS purple theme, Lucide icons, and Framer Motion animations. The homepage includes a hero section, quick-action cards, system status widget (connected to MCP servers), and placeholder containers for Chart Visualizer sub-agent integration. Theme Sub-Agent enforces visual consistency; UI Builder Sub-Agent generates components; Frontend Data Integrator transforms MCP data into props.

## Technical Context

**Language/Version**: TypeScript 5.x with React 18+
**Primary Dependencies**:
  - React 18+ (UI framework)
  - Next.js 15+ (framework, if applicable to project structure)
  - TailwindCSS 3.x (styling with purple theme)
  - Lucide Icons (icon library)
  - Framer Motion 11+ (animations)
  - Recharts (chart library - for Chart Visualizer integration)

**Storage**: N/A (frontend component; data sourced from MCP servers via props)
**Testing**: Vitest/Jest for unit tests; React Testing Library for component tests
**Target Platform**: Web browser (desktop, tablet, mobile); Chrome, Firefox, Safari, Edge
**Project Type**: Web (React frontend application)
**Performance Goals**:
  - Page load: < 2 seconds on 4G
  - Interactive: < 100ms TTI (Time to Interactive)
  - Lighthouse score: 85+
  - 60fps animations/interactions

**Constraints**:
  - Must maintain WCAG AAA accessibility (contrast ratios, keyboard navigation)
  - Purple theme applied consistently across all components
  - Responsive across viewports: 320px (mobile) to 2560px (desktop)
  - MCP server status updates within 10 seconds

**Scale/Scope**:
  - Single page/component-heavy (homepage)
  - ~5-7 major component groups (hero, nav, cards, status widget, stats area, footer)
  - 15-20 reusable sub-components expected

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

From Phase-2 Master Agent Constitution (v2.0.0):

✅ **Sub-Agent Usage**: UI/React work will delegate to UI Builder Sub-Agent; theme work to Theme Sub-Agent; data transformation to Frontend Data Integrator; charts to Chart Visualizer Sub-Agent. All assignments defined in spec.md.

✅ **MCP Server Integration**: Feature spec identifies MCP server usage points (system status widget, stats data). MCP dependencies are declared; installation will be verified with user permission.

✅ **Code + UI Principles**: Purple theme enforced globally. React components, TailwindCSS, Lucide icons, Framer Motion, Recharts all specified.

✅ **Safety & Installation Rule**: Feature requires TailwindCSS, Lucide, Framer Motion, Recharts. User will be asked for permission if missing.

✅ **Communication Rules**: Feature is precisely specified; all unknowns resolved in spec. Phase-2 architecture maintained.

**Gate Status**: ✅ PASS - All constitution principles aligned with feature specification.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (/sp.plan command)
├── data-model.md        # Phase 1 output (/sp.plan command)
├── quickstart.md        # Phase 1 output (/sp.plan command)
├── contracts/           # Phase 1 output (/sp.plan command)
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
frontend/
├── src/
│   ├── components/
│   │   ├── HomePage/
│   │   │   ├── HeroSection.tsx
│   │   │   ├── QuickActionCards.tsx
│   │   │   ├── SystemStatusWidget.tsx
│   │   │   ├── StatsPreviewArea.tsx
│   │   │   ├── Navigation.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── HomePage.tsx (main container)
│   │   ├── shared/
│   │   │   ├── Card.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── StatusIndicator.tsx
│   │   │   └── LoadingState.tsx
│   ├── hooks/
│   │   ├── useMCPStatus.ts (fetch MCP server status)
│   │   ├── useResponsive.ts (responsive utilities)
│   │   └── useTheme.ts (theme context)
│   ├── styles/
│   │   ├── globals.css (TailwindCSS imports)
│   │   ├── tailwind.config.ts (purple theme config)
│   │   └── theme/
│   │       └── colors.ts (purple color palette)
│   ├── types/
│   │   ├── components.ts
│   │   ├── mcp.ts (MCP server types)
│   │   └── ui.ts
│   ├── services/
│   │   └── mcpClient.ts (MCP server communication)
│   └── pages/
│       └── index.tsx or app/page.tsx (routes)
└── tests/
    ├── components/
    │   └── HomePage/
    │       └── (component tests)
    ├── hooks/
    │   └── (hook tests)
    └── integration/
        └── (e2e tests)
```

**Structure Decision**: Web application (React frontend). Homepage is a single feature with multiple reusable sub-components. All components located under `frontend/src/components/HomePage/` with shared components in `frontend/src/components/shared/`. Hooks for MCP integration, responsive behavior, and theme management. Tests organized by component type.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
