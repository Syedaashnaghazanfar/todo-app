---
id: "0003"
title: "calm-ui-redesign-tasks"
stage: "tasks"
date: "2025-12-30"
surface: "agent"
model: "claude-sonnet-4-5-20250929"
feature: "010-calm-ui-redesign"
branch: "010-calm-ui-redesign"
user: "ashna"
command: "/sp.tasks Generate a clear, granular task list for implementing the frontend UI/UX redesign..."
labels: ["ui-redesign", "frontend", "tasks", "implementation"]
links:
  spec: "specs/010-calm-ui-redesign/spec.md"
  ticket: "null"
  adr: "null"
  pr: "null"
files:
  - "specs/010-calm-ui-redesign/tasks.md"
tests:
  - "null"
---

## Prompt

Generate a clear, granular task list for implementing the frontend UI/UX redesign of a Phase 3 Todo application.

Context

Backend is fully implemented and must not be changed

All data (auth, tasks, tags, analytics, notifications, chat) already exists

Tasks must focus only on frontend UI and UX execution

No backend, API, or database work

No mock data or hardcoded placeholders

The goal is to translate the UI redesign plan into concrete, actionable frontend tasks that a developer can execute step by step.

Task Writing Rules

Each task should:

Be atomic (one clear responsibility)

Be implementation-oriented, not abstract

Describe what is done, not how to code it

Be verifiable (clear completion criteria)

Avoid buzzwords and fluff

Do not write code.
Do not redesign backend logic.

Required Task Groups

Organize tasks into the following sections.

1. Theme & Design System Tasks

Create tasks for:

Defining global design tokens (colors, spacing, typography)

Implementing dark and light theme variables

Ensuring no pure black or harsh white is used

Building a reliable theme toggle with persistence

Validating contrast and accessibility for both themes

Each task should end with a clear "done when" condition.

2. Global Layout & Navigation Tasks

Create tasks for:

Implementing the main app layout (sidebar, header, content area)

Ensuring layout works across all pages

Applying per-page accent color behavior

Making layout responsive for desktop, tablet, and mobile

Ensuring navigation states are clear and accessible

3. Dashboard (Home Page) Tasks

Create tasks for:

Replacing the hero layout with a dashboard-style home

Displaying dynamic welcome and date from backend data

Building compact status overview cards

Rendering "Important" and "Due Soon" task sections

Adding a collapsible analytics summary

Implementing quick action shortcuts

Focus on hierarchy and clarity, not decoration.

4. Tasks Page (Core Experience) Tasks

Create tasks for:

Building the tasks page layout with sidebar filters

Implementing task list optimized for fast scanning

Designing calm, solid task cards (no glass)

Adding completion feedback animations

Revealing secondary actions on hover only

Displaying due dates, priorities, and tags clearly

5. Tag & Icon System Tasks (Selective Icons)

Create tasks for:

Defining which tag categories receive icons

Ensuring only category-type tags show icons

Keeping generic/custom tags text-only

Applying consistent spacing and sizing for tag icons

Ensuring tags remain readable in both themes

6. Analytics Page Tasks

Create tasks for:

Building stats overview sections

Rendering charts using existing backend data

Adding weekly/monthly toggles

Ensuring charts are visually calm and readable

Preventing analytics from overwhelming the page

7. History Page Tasks

Create tasks for:

Creating a timeline-style history layout

Grouping activity by date

Color-coding actions (create, update, complete, delete)

Implementing collapsible date sections

Making the page easy to skim

8. Notifications Page Tasks

Create tasks for:

Building a clean notifications list

Showing unread indicators clearly

Applying priority-based visual cues

Ensuring notifications are readable and unobtrusive

9. Settings Page Tasks

Create tasks for:

Structuring settings into clear sections

Implementing appearance-related controls

Adding toggles with clear labels

Ensuring consistency with global theme behavior

10. Chat Page Tasks

Create tasks for:

Designing a focused chat layout

Applying per-page accent color usage

Adding subtle animated background

Implementing message and typing indicator styling

Ensuring readability and accessibility

11. Login & Signup Page Tasks

Create tasks for:

Designing centered auth forms

Implementing glassmorphic card behavior

Adding subtle animated gradient backgrounds

Ensuring smooth transitions

Supporting both light and dark themes

12. Motion, Polish & Accessibility Tasks

Create tasks for:

Applying physics-based animations consistently

Respecting reduced-motion preferences

Ensuring keyboard navigation across the app

Adding visible focus states

Final spacing, alignment, and visual polish

Output Expectations

Tasks should be grouped and ordered logically

Each task should be short but specific

Tasks should be ready to drop into Linear, Jira, or GitHub Issues

No implementation code

No backend references

Success Definition

If all tasks are completed:

The app has a calm, modern UI

Dark and light themes work flawlessly

The dashboard guides attention effectively

Tasks are fast to scan and manage

Icons enhance meaning without clutter

The UI feels production-ready and trustworthy

## Response snapshot

Created comprehensive task list with 171 tasks organized into 12 phases:

1. **Phase 1: Theme & Design System** (20 tasks)
   - Design tokens (colors, spacing, typography, shadows)
   - Theme CSS variables with per-page accents
   - Theme toggle implementation with persistence
   - WCAG contrast validation

2. **Phase 2: Global Layout & Navigation** (15 tasks)
   - Sidebar, TopBar, PageContainer components
   - Navigation behavior and active states
   - Responsive breakpoints (mobile, tablet, desktop)
   - Per-page accent color integration

3. **Phase 3: Dashboard - US1** (15 tasks)
   - WelcomeHeader, StatsOverview, ProgressChart, ImportantTasks, DueSoonTasks
   - Backend data integration for task counts and lists
   - Empty and edge state handling

4. **Phase 4: Tasks Page - US2** (17 tasks)
   - FilterPanel with collapsible sections
   - TaskCard with calm solid design
   - Checkbox spring animation (<300ms)
   - TaskForm modal for create/edit

5. **Phase 5: Tag Icon System - US4** (10 tasks)
   - tagCategories.ts with icon mappings
   - TagChip component with conditional icons
   - Category tags (Work, Learning, Health, Finance, Urgent) show icons
   - Custom tags remain text-only

6. **Phase 6: Analytics - US5** (12 tasks)
   - MetricCard, WeeklyChart, CompletionChart
   - Weekly/monthly toggle
   - Calm chart styling (muted colors)

7. **Phase 7: History - US7** (12 tasks)
   - HistoryTimeline, HistoryEntry
   - Date grouping (Today, Yesterday, Last Week)
   - Color-coded actions (Created=green, Completed=blue, Updated=amber, Deleted=red)

8. **Phase 8: Notifications - US6** (12 tasks)
   - NotificationList, NotificationItem
   - Unread indicators, filter tabs
   - Mark all as read functionality

9. **Phase 9: Settings - US8** (13 tasks)
   - 4 sections: Appearance, Account, Data, Session
   - Theme toggle, password change, clear history, logout

10. **Phase 10: Chat - US9** (12 tasks)
    - ChatInterface with violet accent color
    - User messages (right, accent), assistant messages (left, neutral)
    - Typing indicator, clear conversation

11. **Phase 11: Auth Pages - US10** (13 tasks)
    - AuthCard glassmorphic design
    - LoginForm, SignupForm
    - Animated gradient background

12. **Phase 12: Motion & Polish** (20 tasks)
    - Animation variants (spring, fadeIn, slideUp, scaleIn)
    - Reduced motion support
    - Keyboard navigation, focus states
    - Visual polish and cross-browser testing

**MVP Scope (P1 only)**: 77 tasks covering Theme, Layout, Dashboard, Tasks, Tags
**P2 Stories**: Analytics, Notifications, Auth (37 tasks)
**P3 Stories**: History, Settings, Chat (36 tasks)

## Outcome

- ✅ Impact: Complete 171-task implementation plan organized by 12 phases and 10 user stories
- 🧪 Tests: Each phase has clear "Done when" completion criteria for independent testing
- 📁 Files: specs/010-calm-ui-redesign/tasks.md
- 🔁 Next prompts: Execute tasks sequentially starting with Phase 1
- 🧠 Reflection: Tasks follow atomic format with exact file paths, parallelizable tasks marked [P], story labels for traceability. No implementation code included.

## Evaluation notes (flywheel)

- Failure modes observed: "null"
- Graders run and results (PASS/FAIL): All 171 tasks follow checklist format (checkbox, ID, optional [P], optional story label, description with file path)
- Prompt variant (if applicable): "null"
- Next experiment (smallest change to try): "null"
