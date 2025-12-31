# Tasks: Phase 2 Homepage UI

**Input**: Design documents from `/specs/001-phase2-homepage-ui/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅
**Status**: Ready for implementation

**Organization**: Tasks organized by user story (P1, P2) to enable independent implementation and testing. Each story is independently testable and deliverable.

## Format: `- [ ] [ID] [P?] [Story] Description with file path`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story (US1, US2, US3, US4)
- **File paths**: Exact locations for all created/modified files

## Path Conventions

- **Frontend**: `frontend/src/` (React, TypeScript)
- **Styles**: `frontend/src/styles/` (TailwindCSS, theme)
- **Components**: `frontend/src/components/`
- **Tests**: `frontend/tests/`

---

## Phase 1: Setup (Project Infrastructure)

**Purpose**: Frontend project initialization, dependencies, and base structure

- [ ] T001 Initialize frontend project with React 18+, TypeScript 5.x, and Vite/Next.js in `frontend/`
- [ ] T002 Install core dependencies: TailwindCSS 3.x, Lucide Icons, Framer Motion 11+, Recharts in `frontend/package.json`
- [ ] T003 [P] Configure TailwindCSS with custom purple theme palette in `frontend/src/styles/tailwind.config.ts`
- [ ] T004 [P] Create global styles with accessibility support in `frontend/src/styles/globals.css` (focus states, reduced motion)
- [ ] T005 [P] Setup TypeScript configuration with strict mode in `frontend/tsconfig.json`
- [ ] T006 [P] Configure ESLint and Prettier for code quality in `frontend/.eslintrc` and `frontend/.prettierrc`
- [ ] T007 Setup testing infrastructure (Vitest, React Testing Library) in `frontend/`

**Checkpoint**: Frontend project structure ready - components can now be built

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST complete before any user story implementation

**⚠️ CRITICAL**: No user story work begins until this phase is complete

- [ ] T008 Create project directory structure for components in `frontend/src/components/` (HomePage, shared subdirectories)
- [ ] T009 [P] Create theme context provider with purple color palette in `frontend/src/hooks/useTheme.ts`
- [ ] T010 [P] Create responsive hook for breakpoint detection in `frontend/src/hooks/useResponsive.ts`
- [ ] T011 [P] Create MCP client service for API communication in `frontend/src/services/mcpClient.ts`
- [ ] T012 [P] Create type definitions for components, MCP data, and UI in `frontend/src/types/` (components.ts, mcp.ts, ui.ts)
- [ ] T013 Create base shared components: Card, Button, StatusIndicator, LoadingState in `frontend/src/components/shared/`
- [ ] T014 [P] Create Navigation component with responsive header in `frontend/src/components/HomePage/Navigation.tsx`
- [ ] T015 [P] Create Sidebar component with collapsible behavior in `frontend/src/components/HomePage/Sidebar.tsx`
- [ ] T016 [P] Create Footer component with links and branding in `frontend/src/components/HomePage/Footer.tsx`

**Checkpoint**: All foundational infrastructure ready - user stories can now be implemented in parallel

---

## Phase 3: User Story 1 - View Homepage Landing Page (Priority: P1) 🎯 MVP

**Goal**: Display a visually appealing homepage with hero section that establishes trust and guides users to key actions

**Independent Test**: Navigate to `/` and verify hero section renders with headline, description, CTA button, purple theme styling, and responsive layout on mobile/tablet/desktop

**Acceptance Criteria**:
1. Hero section displays with clear headline and descriptive text
2. Primary CTA button visible with purple-600 styling and hover effects
3. Layout responsive: full-width mobile, centered tablet/desktop
4. All text readable with proper contrast ratios (WCAG AAA)
5. Smooth fade-in animations on page load

**Implementation Tasks**:

- [ ] T017 [US1] Create HeroSection component in `frontend/src/components/HomePage/HeroSection.tsx` with headline, description, CTA props
- [ ] T018 [P] [US1] Implement Framer Motion fade-in + slide-up animation for hero content in `frontend/src/components/HomePage/HeroSection.tsx`
- [ ] T019 [P] [US1] Apply purple theme styling using TailwindCSS in `frontend/src/components/HomePage/HeroSection.tsx` (bg-gradient, text colors)
- [ ] T020 [P] [US1] Create HomePage container component in `frontend/src/components/HomePage/HomePage.tsx` that orchestrates Navigation, HeroSection, Sidebar, Footer
- [ ] T021 [P] [US1] Create responsive mobile-first layout for HomePage in `frontend/src/components/HomePage/HomePage.tsx` (sm, md, lg breakpoints)
- [ ] T022 [US1] Create unit tests for HeroSection component in `frontend/tests/components/HomePage/HeroSection.test.tsx` (snapshot, prop validation)
- [ ] T023 [US1] Create unit tests for HomePage container in `frontend/tests/components/HomePage/HomePage.test.tsx` (component composition)
- [ ] T024 [P] [US1] Create route/page file that renders HomePage in `frontend/src/pages/index.tsx` (or `app/page.tsx` for Next.js)

**Deliverable**: Homepage loads at `/` with hero section, navigation, responsive layout, animations, and proper styling

---

## Phase 4: User Story 2 - Access Quick-Action Cards (Priority: P1)

**Goal**: Provide quick-access cards for main features with intuitive navigation and responsive grid layout

**Independent Test**: Verify at least 3 cards render with icons, titles, descriptions, and links. Click cards to verify navigation. Verify responsive grid (1 col mobile, 2 col tablet, 3 col desktop)

**Acceptance Criteria**:
1. At least 3 quick-action cards visible with distinct icons, titles, descriptions
2. Each card clickable with hover effects (scale, shadow)
3. Grid layout responsive: 1 column (mobile), 2 columns (tablet), 3 columns (desktop)
4. Icons from Lucide library, consistent styling
5. Links navigate to correct feature pages
6. Smooth staggered animation on page load

**Implementation Tasks**:

- [X] T025 [US2] Create QuickActionCard component in `frontend/src/components/HomePage/QuickActionCards.tsx` accepting icon, title, description, link props
- [X] T026 [P] [US2] Implement Framer Motion staggered animation for card entrance in `frontend/src/components/HomePage/QuickActionCards.tsx` (container + item variants)
- [X] T027 [P] [US2] Create card hover effects: scale, shadow, cursor pointer in `frontend/src/components/shared/Card.tsx`
- [X] T028 [P] [US2] Apply purple theme to card components in `frontend/src/components/HomePage/QuickActionCards.tsx` (border, hover colors)
- [X] T029 [US2] Define quick-action card data structure (icons, titles, descriptions, links) in `frontend/src/data/quickActionCards.ts` or inline in component
- [X] T030 [US2] Create responsive grid layout for QuickActionCards in `frontend/src/components/HomePage/QuickActionCards.tsx` (grid-cols-1 md:grid-cols-2 lg:grid-cols-3)
- [X] T031 [P] [US2] Add keyboard navigation support to cards in `frontend/src/components/HomePage/QuickActionCards.tsx` (Tab, Enter focus handling)
- [X] T032 [US2] Create unit tests for QuickActionCard component in `frontend/tests/components/HomePage/QuickActionCards.test.tsx`
- [ ] T033 [P] [US2] Create integration tests for card navigation in `frontend/tests/integration/cardNavigation.test.tsx`

**Deliverable**: Homepage displays 3+ quick-action cards with responsive grid, icons, hover effects, animations, and working navigation links

---

## Phase 5: User Story 3 - View System Status Widget (Priority: P2)

**Goal**: Display real-time MCP server health status with color-coded indicators and automatic updates

**Independent Test**: Verify widget fetches MCP status, displays correct health indicator colors, updates every 10 seconds without page reload, shows tooltips on hover

**Acceptance Criteria**:
1. System status widget displays connection status to MCP servers
2. Color-coded indicators: green (healthy), yellow (degraded), red (offline)
3. Status updates every 10 seconds automatically
4. Graceful fallback if MCP unavailable (display "offline" state)
5. Hover tooltips show additional details (uptime %, latency)
6. Respects WCAG AAA contrast ratios

**Implementation Tasks**:

- [X] T034 [US3] Create useMCPStatus hook to fetch MCP server status in `frontend/src/hooks/useMCPStatus.ts` (interval polling every 10s)
- [X] T035 [P] [US3] Create SystemStatusWidget component in `frontend/src/components/HomePage/SystemStatusWidget.tsx` using useMCPStatus hook
- [X] T036 [P] [US3] Implement StatusIndicator component in `frontend/src/components/shared/StatusIndicator.tsx` with color mapping (healthy=green, degraded=yellow, offline=red)
- [X] T037 [P] [US3] Create mcpClient service methods (fetchStatus) in `frontend/src/services/mcpClient.ts` calling `/api/mcp/status` endpoint
- [X] T038 [US3] Add loading state UI (skeleton loader) in SystemStatusWidget in `frontend/src/components/HomePage/SystemStatusWidget.tsx`
- [X] T039 [US3] Add error handling and fallback UI for MCP unavailability in `frontend/src/components/HomePage/SystemStatusWidget.tsx`
- [X] T040 [P] [US3] Create tooltip component for status details in `frontend/src/components/shared/Tooltip.tsx` or use Framer Motion
- [X] T041 [P] [US3] Apply purple theme styling to widget in `frontend/src/components/HomePage/SystemStatusWidget.tsx`
- [ ] T042 [US3] Create unit tests for useMCPStatus hook in `frontend/tests/hooks/useMCPStatus.test.tsx` (mock fetch, polling behavior)
- [ ] T043 [P] [US3] Create unit tests for SystemStatusWidget in `frontend/tests/components/HomePage/SystemStatusWidget.test.tsx`
- [ ] T044 [US3] Create integration tests for MCP data fetching in `frontend/tests/integration/mcpIntegration.test.tsx`

**Deliverable**: System status widget displays real-time MCP server health with color-coded indicators, auto-updates, and graceful error handling

---

## Phase 6: User Story 4 - View Stats Preview Area (Priority: P2)

**Goal**: Create placeholder containers for charts ready for Chart Visualizer Sub-Agent integration

**Independent Test**: Verify placeholder containers render with correct labels, dimensions, and responsive spacing. Verify sizing is correct for future chart integration

**Acceptance Criteria**:
1. Placeholder containers display with proper labels
2. Responsive dimensions: full width (mobile), half width (tablet), third width (desktop)
3. Skeleton loader shown while awaiting chart data
4. Containers properly sized for Recharts integration
5. Consistent purple theme styling with data-model specs

**Implementation Tasks**:

- [X] T045 [US4] Create StatsPreviewArea component in `frontend/src/components/HomePage/StatsPreviewArea.tsx` with placeholder logic
- [X] T046 [P] [US4] Create StatsPlaceholder sub-component in `frontend/src/components/HomePage/StatsPreviewArea.tsx` for individual stat containers
- [X] T047 [P] [US4] Define stats data structure in `frontend/src/types/mcp.ts` matching data-model (id, label, dimensions, chartType)
- [X] T048 [P] [US4] Create useMCPMetrics hook to fetch metrics in `frontend/src/hooks/useMCPMetrics.ts` calling `/api/mcp/metrics`
- [X] T049 [US4] Create responsive grid layout for stats in `frontend/src/components/HomePage/StatsPreviewArea.tsx` (grid-cols-1 md:grid-cols-2 lg:grid-cols-3)
- [X] T050 [P] [US4] Add skeleton loader for stats containers in `frontend/src/components/shared/LoadingState.tsx` (shimmer animation)
- [X] T051 [US4] Create error boundary for stats section in `frontend/src/components/HomePage/StatsPreviewArea.tsx`
- [X] T052 [P] [US4] Apply purple theme styling to stat containers in `frontend/src/components/HomePage/StatsPreviewArea.tsx`
- [X] T053 [US4] Create unit tests for StatsPreviewArea in `frontend/tests/components/HomePage/StatsPreviewArea.test.tsx`
- [X] T054 [P] [US4] Create unit tests for useMCPMetrics hook in `frontend/tests/hooks/useMCPMetrics.test.tsx`
- [X] T055 [US4] Create placeholder fixture for Chart Visualizer integration in `frontend/src/components/HomePage/StatsPreviewArea.tsx` (comments showing expected chart prop types)

**Deliverable**: Stats preview area with responsive placeholder containers, skeleton loaders, and documented interface for Chart Visualizer Sub-Agent

---

## Phase 7: Cross-Cutting Concerns & Polish

**Purpose**: Accessibility, performance, browser compatibility, responsive edge cases

**Testing & Verification**:

- [ ] T056 Run accessibility audit using axe-core in `frontend/tests/a11y/` (verify WCAG AAA compliance)
- [ ] T057 [P] Verify keyboard navigation for all interactive elements in `frontend/` (Tab, Enter, Escape)
- [ ] T058 [P] Test homepage on Chrome, Firefox, Safari, Edge browsers
- [ ] T059 [P] Test responsive design on iOS (iPhone), Android (Chrome mobile), iPad (tablet)
- [ ] T060 Test performance: Lighthouse score 85+, page load < 2s on 4G, TTI < 100ms
- [ ] T061 [P] Test with prefers-reduced-motion enabled (animations disabled)
- [ ] T062 [P] Test dark mode support if applicable (contrast verification)

**Responsive Edge Cases**:

- [ ] T063 [P] Test layout on 320px mobile screens (single column, full-width)
- [ ] T064 [P] Test layout on 640px tablet screens (2-column grid)
- [ ] T065 [P] Test layout on 1024px desktop screens (3-column grid)
- [ ] T066 [P] Test layout on 2560px ultra-wide screens (max-width container)

**Component Polish**:

- [X] T067 Add loading states to all async components (skeleton loaders, spinners)
- [X] T068 Add error handling and retry logic for MCP data fetching in `frontend/src/services/mcpClient.ts`
- [X] T069 Implement progressive enhancement (graceful degradation if JS disabled)
- [X] T070 [P] Optimize bundle size: code splitting, lazy loading for heavy components
- [X] T071 [P] Add analytics/tracking points (optional, for A/B testing)
- [X] T072 Create documentation: component usage guide in `frontend/COMPONENT_GUIDE.md`
- [X] T073 Update README with setup instructions in `frontend/README.md`

**Final Integration**:

- [ ] T074 Deploy homepage to staging environment
- [ ] T075 Create PR for Phase 2 Homepage UI with checklist of completed features
- [ ] T076 Conduct final QA and acceptance testing

**Checkpoint**: All user stories complete, accessibility verified, performance targets met, ready for production deployment

---

## Dependency Graph & Execution Strategy

### Critical Path (Must Complete In Order)

```
Phase 1 Setup → Phase 2 Foundational → Phase 3 & 4 (Parallel) → Phase 5 & 6 (Parallel) → Phase 7 Polish
```

### Parallel Execution Opportunities

**Phase 3 & 4 can run simultaneously** (both P1, independent components):
- User Story 1 (Hero Section): Tasks T017-T024
- User Story 2 (Quick-Action Cards): Tasks T025-T033

**Phase 5 & 6 can run simultaneously** (both P2, independent components):
- User Story 3 (System Status Widget): Tasks T034-T044
- User Story 4 (Stats Preview): Tasks T045-T055

**Within each phase, [P] marked tasks can run in parallel**:
- T003-T006 (Setup phase)
- T009-T016 (Foundational phase)
- T018-T021 (Hero section styling tasks)
- T026-T028 (Card styling tasks)
- T035-T037 (Status widget foundation)
- T046-T048 (Stats structure)
- T057-T065 (Testing and edge cases)

### Recommended Implementation Order

1. **Day 1-2**: Phase 1 (Setup) - T001-T007
2. **Day 2-3**: Phase 2 (Foundational) - T008-T016
3. **Day 3-5**: Phase 3 (Hero Section MVP) - T017-T024 ← Deploy first MVP
4. **Day 5-7**: Phase 4 (Quick-Action Cards) - T025-T033 + Phase 3 integration tests
5. **Day 7-9**: Phase 5 & 6 in parallel (MCP integration) - T034-T055
6. **Day 9-10**: Phase 7 (Polish, testing, accessibility) - T056-T073
7. **Day 10-11**: Final QA, deployment - T074-T076

### MVP Definition

**Minimum Viable Product (Phase 3 + Phase 2):**
- ✅ Project setup and dependencies
- ✅ Foundational infrastructure (hooks, services, shared components)
- ✅ Hero section with navigation and footer
- ✅ Responsive layout (mobile/tablet/desktop)
- ✅ Purple theme applied
- ✅ Animations working

**Deliverable**: A functional homepage that welcomes users and establishes the brand. Can be deployed to staging after ~3-4 days.

**Post-MVP Enhancements** (Phase 4-6):
- Quick-action cards for feature access
- Real-time MCP system status widget
- Placeholder stats area for Chart Visualizer integration

---

## Sub-Agent Delegation Map

| Task Range | Sub-Agent | Trigger | Deliverables |
|------------|-----------|---------|--------------|
| T003-T006 | Theme Sub-Agent | "Configure purple theme in TailwindCSS" | `tailwind.config.ts`, color palette, contrast verification |
| T017-T021, T026-T028, T040, T052 | Theme Sub-Agent | "Apply purple theme to [component]" | Component styling, color mappings, WCAG AAA verification |
| T017, T025, T035, T045 | UI Builder Sub-Agent | "Generate [ComponentName] React component" | Component TSX, prop types, structure |
| T020, T024 | UI Builder Sub-Agent | "Create HomePage container orchestrating components" | Container component, composition logic |
| T031, T032, T043, T053 | Frontend Data Integrator | "Create tests for [component] and MCP integration" | Test files, mock data, assertions |
| T034, T037-T039, T048, T050-T051 | Frontend Data Integrator | "Transform [MCP endpoint] data into props for [component]" | Service methods, data transformation, error handling |
| (Future) | Chart Visualizer Sub-Agent | "Render charts in StatsPreviewArea placeholder containers" | Chart components, Recharts integration |

---

## Testing & Acceptance Criteria

### Manual Testing Checklist

- [ ] Homepage loads at `/` with all sections visible
- [ ] Hero section displays with headline, description, CTA
- [ ] Navigation header responsive on mobile/tablet/desktop
- [ ] Quick-action cards (3+) visible with icons and labels
- [ ] Card hover effects work (scale, shadow, color change)
- [ ] System status widget fetches and displays status
- [ ] Status updates every 10 seconds without page reload
- [ ] Stats placeholder containers visible with proper dimensions
- [ ] All text meets 7:1 contrast ratio (WCAG AAA)
- [ ] Keyboard navigation works (Tab through all elements, Enter to activate)
- [ ] Page load < 2 seconds on 4G network
- [ ] Lighthouse score 85+
- [ ] No console errors in browser dev tools

### Automated Testing

- Unit tests for all components (snapshot + behavior)
- Hook tests (mocking fetch, state changes)
- Integration tests for MCP data flow
- Accessibility tests (axe-core, WCAG AAA validation)
- E2E tests for user workflows (navigate, click, verify updates)

---

## Success Metrics

| Metric | Target | Verification |
|--------|--------|--------------|
| Page Load Time | < 2 seconds | Lighthouse metrics |
| TTI (Time to Interactive) | < 100ms | Lighthouse metrics |
| Lighthouse Score | 85+ | Lighthouse audit |
| WCAG AAA Compliance | 100% | axe-core audit |
| Link Accuracy | 100% | Manual + E2E tests |
| MCP Status Update Latency | < 10 seconds | Hook tests + manual |
| Keyboard Navigation | All interactive elements | Manual testing |
| Browser Coverage | Chrome, Firefox, Safari, Edge | Cross-browser testing |
| Mobile Responsiveness | 320px-2560px | Responsive testing |

---

## File Structure Summary

```
frontend/
├── src/
│   ├── components/
│   │   ├── HomePage/
│   │   │   ├── HomePage.tsx (main container)
│   │   │   ├── HeroSection.tsx
│   │   │   ├── QuickActionCards.tsx
│   │   │   ├── SystemStatusWidget.tsx
│   │   │   ├── StatsPreviewArea.tsx
│   │   │   ├── Navigation.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Footer.tsx
│   │   └── shared/
│   │       ├── Card.tsx
│   │       ├── Button.tsx
│   │       ├── StatusIndicator.tsx
│   │       ├── Tooltip.tsx
│   │       └── LoadingState.tsx
│   ├── hooks/
│   │   ├── useTheme.ts
│   │   ├── useResponsive.ts
│   │   ├── useMCPStatus.ts
│   │   └── useMCPMetrics.ts
│   ├── services/
│   │   └── mcpClient.ts
│   ├── styles/
│   │   ├── globals.css
│   │   └── tailwind.config.ts
│   ├── types/
│   │   ├── components.ts
│   │   ├── mcp.ts
│   │   └── ui.ts
│   ├── data/
│   │   └── quickActionCards.ts (optional)
│   ├── pages/
│   │   └── index.tsx or app/page.tsx
│   └── App.tsx or layout.tsx
├── tests/
│   ├── components/HomePage/
│   ├── hooks/
│   ├── integration/
│   ├── a11y/
│   └── fixtures/
├── package.json
├── tsconfig.json
├── .eslintrc
├── .prettierrc
└── README.md
```

---

## Notes for Implementation

1. **Sub-Agent Coordination**: Activate Theme Sub-Agent first for color palette, then UI Builder for components, then Data Integrator for MCP integration
2. **Testing Strategy**: Tests are marked as optional per specification; only include if team adopts TDD approach
3. **Performance**: Lazy-load heavy components (charts, status widget) to meet 2-second load target
4. **Accessibility**: All colors, buttons, forms must support WCAG AAA - Theme Sub-Agent will verify
5. **MCP Integration**: Use contract specs in `/contracts/openapi.yaml` for endpoint definitions
6. **Progressive Enhancement**: Page should be usable even if JS fails to load or MCP servers are unavailable

---

**Ready for implementation!** Follow the task checklist and use sub-agent delegation for optimal results.
