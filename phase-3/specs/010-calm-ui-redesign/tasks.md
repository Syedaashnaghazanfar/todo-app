# Tasks: Calm UI Redesign

**Input**: Design documents from `/specs/010-calm-ui-redesign/`
**Prerequisites**: plan.md (completed), spec.md (completed)
**Output**: `/sp.tasks` command execution

**Organization**: Tasks are grouped into 12 task groups as specified, then mapped to user stories for independent testing.

## Format: `[ID] [P?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **Story Labels**: [US1] Dashboard, [US2] Tasks, [US3] Theme, [US4] Tags, [US5] Analytics, [US6] Notifications, [US7] History, [US8] Settings, [US9] Chat, [US10] Auth
- Include exact file paths in descriptions

---

## Phase 1: Theme & Design System

**Purpose**: Establish the calm design foundation with colors, spacing, typography, and theme infrastructure.

### Design Tokens Setup

- [X] T001 Create color tokens in `lib/theme/colors.ts` defining calm dark theme colors (#0F1117, #1A1D2E, #242838, no pure black)
- [X] T002 Add light theme color tokens to `lib/theme/colors.ts` (#F8FAFC, #F1F5F9, #FFFFFF, no pure white)
- [X] T003 Define semantic color tokens in `lib/theme/colors.ts` (primary, secondary, muted, accent, destructive, border, ring)
- [X] T004 Create spacing scale in `lib/theme/tokens.ts` (xs=4px, sm=8px, md=16px, lg=24px, xl=32px, 2xl=48px, 3xl=64px)
- [X] T005 Define typography scale in `lib/theme/tokens.ts` (xs=12px, sm=14px, base=16px, lg=18px, xl=20px, 2xl=24px, 3xl=30px, 4xl=36px)
- [X] T006 Create border radius tokens in `lib/theme/tokens.ts` (sm=6px, md=8px, lg=12px, xl=16px, full=9999px)
- [X] T007 Define shadow tokens in `lib/theme/tokens.ts` (sm, md, lg, xl - calm shadows, no glow effects)

### Theme CSS Variables

- [X] T008 Replace existing cyberpunk colors in `styles/globals.css` with calm theme CSS custom properties
- [X] T009 Add light theme `.light` class overrides in `styles/globals.css`
- [X] T010 Implement per-page accent color CSS variables in `styles/globals.css` (Dashboard=Purple, Tasks=Cyan, Analytics=Green, History=Amber, Notifications=Pink, Settings=Indigo, Chat=Violet)
- [X] T011 Add CSS transition properties for smooth theme switching in `styles/globals.css`
- [X] T012 Ensure no pure black (#000000 or #030014) backgrounds in dark theme via CSS validation

### Theme Toggle Implementation

- [X] T013 Enhance `hooks/useTheme.ts` to use new design tokens from `lib/theme/`
- [X] T014 Add theme transition class to prevent flash during theme switching in `hooks/useTheme.ts`
- [X] T015 Implement system preference detection with fallback to saved preference in `hooks/useTheme.ts`
- [X] T016 Verify localStorage persistence works across sessions in `hooks/useTheme.ts`

### Accessibility Validation

- [X] T017 Validate dark theme contrast ratios (WCAG AA minimum 4.5:1) for text on backgrounds
- [X] T018 Validate light theme contrast ratios (WCAG AA minimum 4.5:1) for text on backgrounds
- [X] T019 Add reduced-motion detection hook in `hooks/useReducedMotion.ts`
- [X] T020 Apply reduced-motion CSS overrides in `styles/globals.css` for `prefers-reduced-motion`

**Done when**: Theme toggle works smoothly, no pure black/white backgrounds, both themes pass WCAG AA contrast, reduced motion is respected.

---

## Phase 2: Global Layout & Navigation

**Purpose**: Create the app-wide layout structure that works across all authenticated pages.

### Main Layout Components

- [X] T021 Create `components/layout/Sidebar.tsx` with collapsible navigation links (Dashboard, Tasks, Analytics, History, Notifications, Settings, Chat)
- [X] T022 Create `components/layout/TopBar.tsx` with page title, user menu, and theme toggle button
- [X] T023 Create `components/layout/PageContainer.tsx` as consistent wrapper for page content
- [X] T024 Implement sidebar collapse/expand state in `components/layout/Sidebar.tsx`

### Navigation Behavior

- [X] T025 Add active state styling to navigation items in `components/layout/Sidebar.tsx`
- [X] T026 Implement navigation click handlers that route to correct pages in `components/layout/Sidebar.tsx`
- [X] T027 Add keyboard navigation support (Tab, Enter) to sidebar items in `components/layout/Sidebar.tsx`

### Responsive Behavior

- [X] T028 Make sidebar collapsible on tablet (<1024px) in `components/layout/Sidebar.tsx`
- [X] T029 Convert sidebar to drawer/modal on mobile (<768px) in `components/layout/Sidebar.tsx`
- [X] T030 Ensure top bar adapts to mobile viewport in `components/layout/TopBar.tsx`
- [X] T031 Test layout on all breakpoints (mobile <768px, tablet <1024px, desktop >=1024px)

### Per-Page Accent Colors

- [X] T032 Create accent color context/hook for managing page-specific colors
- [X] T033 Apply accent color to sidebar active state in `components/layout/Sidebar.tsx`
- [X] T034 Apply accent color to buttons and interactive elements in `components/layout/TopBar.tsx`
- [X] T035 Add accent color CSS variables that update per route in `styles/globals.css`

**Done when**: App is navigable, sidebar works on all screen sizes, active states are visible, per-page accent colors apply correctly.

---

## Phase 3: Dashboard (Home Page) - User Story 1

**Purpose**: Replace hero layout with dashboard widgets showing welcome, stats, progress, and quick task access.

**Independent Test**: Log in and immediately see personalized greeting, task counts, progress chart, important tasks, and due soon tasks.

### Dashboard Layout

- [X] T036 [US1] Create `components/dashboard/WelcomeHeader.tsx` with user name and current date
- [X] T037 [US1] Create `components/dashboard/StatsOverview.tsx` with 4 compact stat cards (Due Today, Overdue, Completed, Total)
- [X] T038 [US1] Create `components/dashboard/ProgressChart.tsx` using Recharts donut chart for completion distribution
- [X] T039 [US1] Create `components/dashboard/ImportantTasks.tsx` displaying up to 5 high-priority tasks
- [X] T040 [US1] Create `components/dashboard/DueSoonTasks.tsx` displaying up to 5 tasks sorted by due date

### Dashboard Page Assembly

- [X] T041 [US1] Replace hero-based `app/page.tsx` with dashboard layout
- [X] T042 [US1] Connect `app/page.tsx` to user data from authenticated backend
- [X] T043 [US1] Fetch task counts for stats overview from backend API
- [X] T044 [US1] Fetch important tasks (priority: VERY_IMPORTANT, HIGH) from backend API
- [X] T045 [US1] Fetch due soon tasks sorted by due date from backend API

### Quick Actions

- [X] T046 [US1] Create quick action buttons in dashboard for common actions (New Task, View All Tasks)
- [X] T047 [US1] Style quick actions area with consistent spacing in `components/dashboard/`

### Empty & Edge States

- [X] T048 [US1] Add empty state component for no tasks scenario in dashboard
- [X] T049 [US1] Handle all tasks completed celebration state
- [X] T050 [US1] Handle many overdue tasks with prominent but calm count display

**Done when**: Dashboard shows personalized greeting, all 4 stat cards, donut chart, important tasks, due soon tasks - all dynamically loaded from backend.

---

## Phase 4: Tasks Page (Core Experience) - User Story 2

**Purpose**: Build clean, scannable task management with sidebar filters and hover-revealed actions.

**Independent Test**: Open tasks page, view tasks, filter by project/priority/date/tag, create task, complete task, edit task, delete task.

### Tasks Page Layout

- [X] T051 [US2] Create `components/tasks/FilterPanel.tsx` with collapsible sections for Projects, Priority, Due Date, Tags
- [X] T052 [US2] Implement filter toggle behavior in `components/tasks/FilterPanel.tsx`
- [X] T053 [US2] Create `components/tasks/SearchBar.tsx` for task search functionality
- [X] T054 [US2] Build task list container layout in `components/tasks/TaskList.tsx`

### Task Card Design

- [X] T055 [US2] Create `components/tasks/TaskCard.tsx` with calm solid design (no glassmorphism)
- [X] T056 [US2] Display checkbox, title, due date, priority badge, tags on task card
- [X] T057 [US2] Add priority badge with subtle styling (not bright neon)
- [X] T058 [US2] Implement hover state in `components/tasks/TaskCard.tsx` revealing Edit and Delete buttons

### Task Interactions

- [X] T059 [US2] Add checkbox spring animation using Framer Motion in `components/tasks/TaskCard.tsx`
- [X] T060 [US2] Add strikethrough animation on task completion in `components/tasks/TaskCard.tsx`
- [X] T061 [US2] Connect checkbox click to backend API for task status update
- [X] T062 [US2] Connect Edit button to open task form modal
- [X] T063 [US2] Connect Delete button to remove task API call

### Task Form Modal

- [X] T064 [US2] Create `components/tasks/TaskForm.tsx` with clean form (title, description, due date, priority, tags)
- [X] T065 [US2] Implement priority selector dropdown in `components/tasks/TaskForm.tsx`
- [X] T066 [US2] Implement tag selector with checkboxes in `components/tasks/TaskForm.tsx`
- [X] T067 [US2] Connect form submission to create/update task API

**Done when**: Tasks page has sidebar filters, scannable task list, calm task cards, hover actions work, checkbox animation is satisfying (<300ms).

---

## Phase 5: Tag Icon System - User Story 4

**Purpose**: Implement selective icons for category tags only, keeping custom tags text-only.

**Independent Test**: Create tasks with Work, Learning, Health, Finance, Urgent tags and custom tags. Verify category tags show icons, custom tags show no icons.

### Tag Icon Configuration

- [X] T068 [US4] Create `lib/theme/tagCategories.ts` with category tag definitions (Work=Briefcase, Learning=BookOpen, Health=Heart, Finance=DollarSign, Urgent=AlertTriangle)
- [X] T069 [US4] Add `isCategoryTag()` helper function to check if tag is category type
- [X] T070 [US4] Add `getTagIcon()` function to return appropriate Lucide icon component

### Tag Chip Component

- [X] T071 [US4] Create `components/tasks/TagChip.tsx` with conditional icon rendering
- [X] T072 [US4] Add icon component alongside tag text for category tags in `components/tasks/TagChip.tsx`
- [X] T073 [US4] Ensure custom tags render as text only (no icon) in `components/tasks/TagChip.tsx`
- [X] T074 [US4] Style tag icons with consistent sizing and spacing in `components/tasks/TagChip.tsx`

### Tag Usage in Task Cards

- [X] T075 [US4] Update `components/tasks/TaskCard.tsx` to use TagChip component
- [X] T076 [US4] Verify tags render correctly in both light and dark themes
- [X] T077 [US4] Ensure tag readability meets contrast requirements in both themes

**Done when**: Category tags (Work, Learning, Health, Finance, Urgent) show icons. Custom tags show as text only. Both themes render tags correctly.

---

## Phase 6: Analytics Page - User Story 5

**Purpose**: Build calm analytics visualization with stats overview, charts, and weekly/monthly toggle.

**Independent Test**: Visit analytics page, see 4 metric cards, view weekly bar chart, view completion donut chart, toggle between weekly/monthly views.

### Analytics Stats

- [X] T078 [US5] Create `components/analytics/MetricCard.tsx` for stat display (Total Tasks, Completed, Pending, This Week)
- [X] T079 [US5] Build stats overview section in `components/analytics/`
- [X] T080 [US5] Fetch analytics data from backend API for metric cards

### Analytics Charts

- [X] T081 [US5] Create `components/analytics/WeeklyChart.tsx` using Recharts bar chart (tasks created vs completed)
- [X] T082 [US5] Create `components/analytics/CompletionChart.tsx` using Recharts donut chart with center percentage
- [X] T083 [US5] Style charts with calm, muted colors (no neon)
- [X] T084 [US5] Connect charts to analytics data from backend API

### Chart Controls

- [X] T085 [US5] Implement weekly/monthly view toggle in analytics page
- [X] T086 [US5] Add charts collapse/expand functionality
- [X] T087 [US5] Ensure charts section doesn't overwhelm the page visually

### Analytics Page Assembly

- [X] T088 [US5] Assemble analytics page at `app/analytics/page.tsx` with stats cards and charts
- [X] T089 [US5] Apply green accent color (per-page accent) to analytics elements

**Done when**: Analytics page shows 4 metric cards, weekly bar chart, completion donut chart, weekly/monthly toggle works, charts are calm and readable.

---

## Phase 7: History Page - User Story 7

**Purpose**: Create timeline-style history grouped by date with collapsible sections and color-coded actions.

**Independent Test**: View history page, see activities grouped by date, collapse/expand date groups, see color-coded action types.

### History Components

- [X] T090 [US7] Create `components/history/HistoryTimeline.tsx` as container for grouped history entries
- [X] T091 [US7] Create `components/history/HistoryEntry.tsx` for single activity item
- [X] T092 [US7] Implement date grouping logic (Today, Yesterday, Last Week, Older)

### History Entry Styling

- [X] T093 [US7] Color-code entries by action type: Created (green), Completed (blue), Updated (amber), Deleted (red)
- [X] T094 [US7] Add collapse/expand functionality for date groups in `components/history/HistoryTimeline.tsx`
- [X] T095 [US7] Show item count in collapsed date headers
- [X] T096 [US7] Add smooth animation for expand/collapse in `components/history/HistoryTimeline.tsx`

### Delete & Actions

- [X] T097 [US7] Add delete button that appears on hover for history entries
- [X] T098 [US7] Connect delete to history delete API (if available)
- [X] T099 [US7] Add empty state when no history exists

### History Page Assembly

- [X] T100 [US7] Assemble history page at `app/history/page.tsx`
- [X] T101 [US7] Apply amber accent color (per-page accent) to history elements

**Done when**: History shows date-grouped timeline, entries are color-coded, date sections collapse/expand, delete works on hover.

---

## Phase 8: Notifications Page - User Story 6

**Purpose**: Build clean notification feed with unread indicators, priority cues, and filtering.

**Independent Test**: View notifications page, distinguish read vs unread, filter by All/Unread/Read, mark notifications as read.

### Notification Components

- [X] T102 [US6] Create `components/notifications/NotificationList.tsx` as container for notifications
- [X] T103 [US6] Create `components/notifications/NotificationItem.tsx` for single notification
- [X] T104 [US6] Add visual indicator for unread notifications (dot or background highlight)

### Notification Features

- [X] T105 [US6] Implement filter tabs (All, Unread, Read) in notifications page
- [X] T106 [US6] Connect click to mark notification as read API
- [X] T107 [US6] Add "Mark all as read" button with API integration
- [X] T108 [US6] Apply priority-based visual cues (subtle color accent for urgent/important)

### Notification Styling

- [X] T109 [US6] Ensure notifications are readable and unobtrusive
- [X] T110 [US6] Style priority notifications with subtle red tint (not alarming)
- [X] T111 [US6] Add empty state when no notifications exist

### Notifications Page Assembly

- [X] T112 [US6] Assemble notifications page at `app/notifications/page.tsx`
- [X] T113 [US6] Apply pink accent color (per-page accent) to notification elements

**Done when**: Notifications page shows list with unread indicators, filter tabs work, mark as read functions, priority cues are subtle.

---

## Phase 9: Settings Page - User Story 8

**Purpose**: Create structured settings page with appearance, account, data, and session sections.

**Independent Test**: View settings page, toggle theme, change preferences, clear history with confirmation, logout with confirmation.

### Settings Sections

- [X] T114 [US8] Create settings page layout at `app/settings/page.tsx` with clear sections
- [X] T115 [US8] Build Appearance section with theme toggle and layout preferences
- [X] T116 [US8] Build Account section with password change option
- [X] T117 [US8] Build Data section with clear history option
- [X] T118 [US8] Build Session section with logout confirmation

### Settings Controls

- [X] T119 [US8] Implement theme toggle in Appearance section
- [X] T120 [US8] Add layout preference toggles
- [X] T121 [US8] Create change password modal with form
- [X] T122 [US8] Create clear history confirmation dialog using SweetAlert2
- [X] T123 [US8] Create logout confirmation dialog using SweetAlert2

### Settings Styling

- [X] T124 [US8] Apply indigo accent color (per-page accent) to settings elements
- [X] T125 [US8] Ensure consistent styling with global theme behavior
- [X] T126 [US8] Add clear labels and descriptions for all settings

**Done when**: Settings page has 4 clear sections, theme toggle works, all confirmation dialogs function, styling is consistent.

---

## Phase 10: Chat Page - User Story 9

**Purpose**: Build focused chat interface with per-page accent color, subtle background, and readable messages.

**Independent Test**: Open chat page, send message, receive response, see typing indicator, clear conversation with confirmation.

### Chat Components

- [X] T127 [US9] Create `components/chat/ChatInterface.tsx` as chat page container
- [X] T128 [US9] Style chat header with violet accent color (per-page accent)
- [X] T129 [US9] Add subtle animated background to chat area
- [X] T130 [US9] Style user messages on right with accent color background
- [X] T131 [US9] Style assistant messages on left with neutral color background

### Chat Interactions

- [X] T132 [US9] Implement typing indicator component
- [X] T133 [US9] Style message timestamps
- [X] T134 [US9] Add clear conversation button with confirmation dialog
- [X] T135 [US9] Ensure chat feels integrated with overall app design

### Chat Page Assembly

- [X] T136 [US9] Assemble chat page at `app/chat/page.tsx`
- [X] T137 [US9] Apply violet accent color to send button and header
- [X] T138 [US9] Verify chat is accessible and readable

**Done when**: Chat page uses violet accent color, messages are styled (user right, assistant left), typing indicator appears, clear works with confirmation.

---

## Phase 11: Login & Signup Pages - User Story 10

**Purpose**: Design calm auth pages with glassmorphic cards, subtle gradients, and smooth transitions.

**Independent Test**: View login page, view signup page, submit form, switch between pages with smooth transition.

### Auth Components

- [X] T139 [US10] Create `components/auth/AuthCard.tsx` as glassmorphic card container
- [X] T140 [US10] Create `components/auth/LoginForm.tsx` for login form
- [X] T141 [US10] Create `components/auth/SignupForm.tsx` for signup form
- [X] T142 [US10] Style centered auth card on gradient background

### Auth Features

- [X] T143 [US10] Add subtle animated gradient background to auth pages
- [X] T144 [US10] Implement smooth transitions between login and signup
- [X] T145 [US10] Add loading state on form submission
- [X] T146 [US10] Create "Sign up" link on login page
- [X] T147 [US10] Create "Sign in" link on signup page

### Auth Page Assembly

- [X] T148 [US10] Assemble login page at `app/login/page.tsx`
- [X] T149 [US10] Assemble signup page at `app/signup/page.tsx`
- [X] T150 [US10] Ensure both light and dark theme compatibility
- [X] T151 [US10] Verify auth forms work with existing Better Auth integration

**Done when**: Login and signup pages show glassmorphic cards, gradient background animates subtly, page transitions are smooth, both themes work.

---

## Phase 12: Motion, Polish & Accessibility

**Purpose**: Apply consistent physics-based animations, keyboard navigation, focus states, and final visual polish.

### Animation System

- [X] T152 Create `lib/theme/animations.ts` with Framer Motion spring variants (gentle, responsive, snappy)
- [X] T153 Add `fadeIn`, `slideUp`, `scaleIn` animation variants to `lib/theme/animations.ts`
- [X] T154 Apply consistent spring animations to button hover states
- [X] T155 Apply consistent spring animations to modal open/close
- [X] T156 Apply consistent spring animations to toggle switches

### Reduced Motion

- [X] T157 Use `useReducedMotion` hook to disable animations when preference is set
- [X] T158 Add CSS fallback for animations when reduced motion is enabled
- [X] T159 Verify all interactive elements work without animation

### Keyboard Navigation

- [X] T160 Ensure all interactive elements are focusable via Tab
- [X] T161 Add visible focus states to all buttons, inputs, and links
- [X] T162 Implement skip-to-content link for accessibility
- [X] T163 Test keyboard navigation flow through entire application

### Focus States

- [X] T164 Apply consistent focus ring styling across all interactive elements
- [X] T165 Ensure focus states meet WCAG 2.1 requirements (visible indicator)
- [X] T166 Add focus visible-only styles to avoid visual clutter

### Visual Polish

- [X] T167 Review and adjust spacing consistency across all components
- [X] T168 Review and adjust typography hierarchy and readability
- [X] T169 Review and adjust color consistency across both themes
- [X] T170 Test all edge cases (empty states, loading states, error states)
- [X] T171 Final cross-browser testing (Chrome, Firefox, Safari, Edge)

**Done when**: All animations are physics-based, reduced motion works, keyboard navigation is complete, focus states are visible, spacing/colors are consistent.

---

## Dependencies & Execution Order

### Phase Dependencies

| Phase | Depends On | Blocks |
|-------|------------|--------|
| Phase 1: Theme & Design | None | All subsequent phases |
| Phase 2: Layout & Navigation | Phase 1 | All user story phases |
| Phase 3: Dashboard (US1) | Phase 2 | - |
| Phase 4: Tasks (US2) | Phase 2 | - |
| Phase 5: Tags (US4) | Phase 4 | US2 task cards |
| Phase 6: Analytics (US5) | Phase 2 | - |
| Phase 7: History (US7) | Phase 2 | - |
| Phase 8: Notifications (US6) | Phase 2 | - |
| Phase 9: Settings (US8) | Phase 2 | - |
| Phase 10: Chat (US9) | Phase 2 | - |
| Phase 11: Auth (US10) | Phase 2 | - |
| Phase 12: Polish | All User Stories | Final delivery |

### User Story Priorities

- **P1 (Must Have)**: US1 Dashboard, US2 Tasks, US3 Theme, US4 Tags
- **P2 (Should Have)**: US5 Analytics, US6 Notifications, US10 Auth
- **P3 (Nice to Have)**: US7 History, US8 Settings, US9 Chat

### Parallel Opportunities

All tasks marked [P] within a phase can run in parallel:
- Phase 1 tokens (T001-T007) can run in parallel
- Phase 1 CSS variables (T008-T012) can run in parallel
- Phase 2 layout components (T021-T024) can run in parallel
- Dashboard components (T036-T040) can run in parallel
- Task card elements (T055-T058) can run in parallel
- Analytics cards and charts can run in parallel
- History components (T090-T091) can run in parallel

---

## Implementation Strategy

### MVP First (P1 Stories Only)

1. Complete Phase 1: Theme & Design System
2. Complete Phase 2: Layout & Navigation
3. Complete Phase 3: Dashboard (US1)
4. Complete Phase 4: Tasks Page (US2)
5. Complete Phase 5: Tag Icon System (US4)
6. **STOP and VALIDATE**: P1 functionality is complete
7. Deploy/demo MVP

### Incremental Delivery

1. Complete Foundation (Phases 1-2) → Base ready
2. Add US1 (Phase 3) → Dashboard works → Deploy
3. Add US2 (Phase 4) → Task management works → Deploy
4. Add US4 (Phase 5) → Tags with icons → Deploy
5. Continue with P2 and P3 stories

### Parallel Team Strategy

With multiple developers:
1. Team completes Phases 1-2 together
2. Once Foundation is done:
   - Developer A: Dashboard (US1)
   - Developer B: Tasks (US2)
   - Developer C: Analytics (US5) + Auth (US10)
3. Stories complete and integrate independently

---

## Summary

| Metric | Value |
|--------|-------|
| Total Tasks | 171 |
| Theme & Design (Phase 1) | 20 tasks |
| Layout & Navigation (Phase 2) | 15 tasks |
| Dashboard (US1) | 15 tasks |
| Tasks Page (US2) | 17 tasks |
| Tag Icon System (US4) | 10 tasks |
| Analytics (US5) | 12 tasks |
| History (US7) | 12 tasks |
| Notifications (US6) | 12 tasks |
| Settings (US8) | 13 tasks |
| Chat (US9) | 12 tasks |
| Auth Pages (US10) | 13 tasks |
| Motion & Polish (Phase 12) | 20 tasks |

### MVP Scope (P1 Only)
- Phases 1-5: Theme, Layout, Dashboard, Tasks, Tags
- Total: 77 tasks
- Delivers: Calm UI, working theme toggle, dashboard, task management with tag icons

### Completion Criteria

All 10 user stories are independently testable when their phases complete. Final delivery when Phase 12 (Polish) is complete:
- Calm, modern UI implemented
- Dark and light themes work flawlessly
- Dashboard guides attention effectively
- Tasks are fast to scan and manage
- Icons enhance meaning without clutter
- UI feels production-ready and trustworthy
