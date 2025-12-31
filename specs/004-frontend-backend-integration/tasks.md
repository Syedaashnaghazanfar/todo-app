# Implementation Tasks: Frontend-Backend Integration with SweetAlert2 & Recharts

**Feature**: 004-frontend-backend-integration
**Branch**: 004-frontend-backend-integration
**Date**: 2025-12-11
**Status**: Ready for Implementation

---

## Task Summary

| Phase | User Story | Priority | Task Count | Parallel Tasks |
|-------|------------|----------|------------|----------------|
| 1 | Setup | - | 4 | 2 |
| 2 | Foundational | - | 5 | 3 |
| 3 | US1: View & Manage Tasks | P1 | 3 | 1 |
| 4 | US2: Create Tasks | P1 | 4 | 2 |
| 5 | US3: Mark Complete/Incomplete | P1 | 3 | 1 |
| 6 | US4: Delete Tasks | P2 | 2 | 0 |
| 7 | US5: Edit Task Details | P2 | 4 | 2 |
| 8 | US6: View History | P3 | 5 | 3 |
| 9 | US7: Analytics Dashboard | P3 | 6 | 4 |
| 10 | Polish & Integration | - | 3 | 1 |
| **Total** | | | **39 tasks** | **19 parallel** |

---

## Phase 1: Setup (No Story Label)

**Goal**: Initialize project utilities and configurations required across all user stories.

**Dependencies**: None (blocking prerequisites for all user stories)

### Tasks

- [ ] T001 [P] Verify SweetAlert2 and Recharts installation in frontend/todo-app/package.json
- [ ] T002 [P] Create SweetAlert2 wrapper utilities in frontend/todo-app/components/notifications/alerts.ts
- [ ] T003 Create Recharts purple theme configuration in frontend/todo-app/lib/chartConfig.ts
- [ ] T004 Verify existing API client in frontend/todo-app/services/api.ts supports all required endpoints

**Completion Criteria**:
- ✅ SweetAlert2 (v11.26.4+) and Recharts (v3.5.1+) confirmed installed
- ✅ alerts.ts exports: showSuccess(), showError(), showConfirm() with purple theme (#7c3aed)
- ✅ chartConfig.ts exports: CHART_COLORS (purple palette), CHART_CONFIG (margins, sizes)
- ✅ api.ts has methods: getTasks(), getTask(), createTask(), updateTask(), completeTask(), incompleteTask(), deleteTask()

---

## Phase 2: Foundational (No Story Label)

**Goal**: Extend API client and create custom hooks that serve multiple user stories.

**Dependencies**: Phase 1 complete

### Tasks

- [ ] T005 [P] Add getHistory() method to frontend/todo-app/services/api.ts for history pagination
- [ ] T006 [P] Add getWeeklyStats() method to frontend/todo-app/services/api.ts for analytics
- [ ] T007 [P] Create useHistory custom hook in frontend/todo-app/hooks/useHistory.ts
- [ ] T008 Create useStats custom hook in frontend/todo-app/hooks/useStats.ts
- [ ] T009 Extend useTasks hook in frontend/todo-app/hooks/useTasks.ts to integrate SweetAlert2 notifications

**Completion Criteria**:
- ✅ getHistory() accepts page, limit, task_id, action_type parameters; returns HistoryEntry[]
- ✅ getWeeklyStats() returns TaskStatistics with weekly metrics
- ✅ useHistory hook provides: entries, loading, error, pagination, fetchHistory(), clearError()
- ✅ useStats hook provides: stats, loading, error, fetchStats(), clearError()
- ✅ useTasks hook calls SweetAlert2 for all CRUD operations (create, update, delete, complete, incomplete)

---

## Phase 3: User Story 1 - View & Manage All Tasks (P1 MVP)

**Goal**: Display all tasks from backend on `/tasks` page with active/completed sections.

**Why P1**: Core functionality - users cannot use the app without viewing tasks. This is the MVP foundation.

**Independent Test**: Navigate to `/tasks`, verify all tasks display correctly with active/completed sections, check empty state message.

**Dependencies**: Phase 2 complete

### Tasks

- [ ] T010 [US1] Verify existing /tasks page in frontend/todo-app/app/tasks/page.tsx displays tasks correctly
- [ ] T011 [P] [US1] Add empty state handling to /tasks page: "No tasks yet. Create one to get started!"
- [ ] T012 [US1] Verify task list groups by is_completed status (active vs completed sections)

**Acceptance Criteria**:
- ✅ `/tasks` page loads and displays all tasks from backend
- ✅ Active tasks (is_completed=false) display in "Active Tasks" section
- ✅ Completed tasks (is_completed=true) display in "Completed Tasks" section
- ✅ Each task shows: title, description (if any), creation date, completion status
- ✅ Empty state message displays when tasks array is empty
- ✅ Page responsive on mobile (375px), tablet (768px), desktop (1920px)

---

## Phase 4: User Story 2 - Create New Tasks (P1 MVP)

**Goal**: Allow users to create tasks with title and optional description, showing SweetAlert2 success notification.

**Why P1**: Core CRUD operation - users must be able to create tasks. Essential for daily usage.

**Independent Test**: Fill form with title "Buy groceries", click create, see SweetAlert2 success "Task Created Successfully!", verify task appears in active list.

**Dependencies**: Phase 3 complete (requires /tasks page to display created tasks)

### Tasks

- [ ] T013 [US2] Verify create task form in frontend/todo-app/app/tasks/page.tsx has title and description inputs
- [ ] T014 [P] [US2] Add form validation to disable "Create Task" button when title is empty
- [ ] T015 [P] [US2] Integrate SweetAlert2 success notification on successful task creation
- [ ] T016 [US2] Add SweetAlert2 error notification when backend returns error during creation

**Acceptance Criteria**:
- ✅ User can enter task title (required) and description (optional)
- ✅ "Create Task" button disabled when title is empty
- ✅ On submit: POST request sent to `/tasks` endpoint
- ✅ Success: SweetAlert2 displays "Task Created Successfully!" with purple confirm button
- ✅ Success: Task appears immediately in "Active Tasks" section without page reload
- ✅ Error: SweetAlert2 displays error message from backend
- ✅ Form clears after successful creation

---

## Phase 5: User Story 3 - Mark Complete/Incomplete (P1 MVP)

**Goal**: Toggle task completion status with instant UI update and SweetAlert2 confirmation.

**Why P1**: Core interaction - users need quick way to mark progress. Most frequently used feature.

**Independent Test**: Click completion icon on active task, see instant move to completed section, verify SweetAlert2 "Task Marked Complete!", click again to mark incomplete.

**Dependencies**: Phase 4 complete (requires tasks to exist for toggling)

### Tasks

- [ ] T017 [US3] Verify completion toggle icon in frontend/todo-app/app/tasks/page.tsx (Circle for incomplete, CheckCircle2 for complete)
- [ ] T018 [P] [US3] Add SweetAlert2 notifications for complete ("Task Marked Complete!") and incomplete ("Task Marked Incomplete!")
- [ ] T019 [US3] Verify instant UI update moves task between active/completed sections without page reload

**Acceptance Criteria**:
- ✅ Click icon on active task → sends PATCH `/tasks/{id}/complete`
- ✅ Task immediately moves to "Completed Tasks" section with checkmark icon
- ✅ SweetAlert2 displays "Task Marked Complete!" with purple confirm button
- ✅ Click checkmark on completed task → sends PATCH `/tasks/{id}/incomplete`
- ✅ Task immediately returns to "Active Tasks" section with circle icon
- ✅ SweetAlert2 displays "Task Marked Incomplete!" with purple confirm button
- ✅ UI updates within 500ms of user click (no page reload)

---

## Phase 6: User Story 4 - Delete Tasks (P2 Important)

**Goal**: Allow users to delete tasks with SweetAlert2 confirmation dialog to prevent accidental deletion.

**Why P2**: Important for data management but less critical than create/complete. Users can live without it briefly.

**Independent Test**: Click delete icon, see SweetAlert2 confirmation "Are you sure?", click confirm, verify task removed from UI and backend.

**Dependencies**: Phase 5 complete (requires tasks to exist for deletion)

### Tasks

- [ ] T020 [US4] Verify delete icon in frontend/todo-app/app/tasks/page.tsx triggers confirmation dialog
- [ ] T021 [US4] Add SweetAlert2 confirmation dialog before deletion and success notification after

**Acceptance Criteria**:
- ✅ Click delete icon → SweetAlert2 confirmation dialog appears
- ✅ Dialog shows: "Are you sure you want to delete this task?" with Yes/Cancel buttons
- ✅ Click Cancel → dialog closes, task not deleted
- ✅ Click Yes → sends DELETE `/tasks/{id}` request
- ✅ Success: Task removed from UI immediately
- ✅ Success: SweetAlert2 displays "Task Deleted Successfully!" with purple confirm button
- ✅ Error: SweetAlert2 displays error message if deletion fails

---

## Phase 7: User Story 5 - Edit Task Details (P2 Important)

**Goal**: Navigate to `/tasks/[id]` detail page to edit task title and description with save/cancel actions.

**Why P2**: Important but less critical than creation/completion. Users can create new tasks instead if needed temporarily.

**Independent Test**: Click task to navigate to `/tasks/{id}`, click Edit, modify title/description, click Save, see SweetAlert2 "Task Updated Successfully!", verify changes persist.

**Dependencies**: Phase 6 complete

### Tasks

- [ ] T022 [US5] Create task detail page in frontend/todo-app/app/tasks/[id]/page.tsx with view mode
- [ ] T023 [P] [US5] Create TaskDetailForm component in frontend/todo-app/components/tasks/TaskDetailForm.tsx with edit mode
- [ ] T024 [P] [US5] Add edit mode toggle: "Edit" button → form inputs → "Save"/"Cancel" buttons
- [ ] T025 [US5] Integrate SweetAlert2 success notification "Task Updated Successfully!" on save

**Acceptance Criteria**:
- ✅ Click task on `/tasks` page → navigates to `/tasks/{id}` detail page
- ✅ Detail page displays: task title, description, creation date, completion status (view mode)
- ✅ Click "Edit" button → form inputs replace read-only display (edit mode)
- ✅ User can modify title and description fields
- ✅ Click "Save" → sends PUT `/tasks/{id}` with updated values
- ✅ Success: SweetAlert2 displays "Task Updated Successfully!" with purple confirm button
- ✅ Success: Returns to view mode showing updated task
- ✅ Click "Cancel" → discards changes, returns to view mode
- ✅ Navigate back to `/tasks` → updated task displays correctly

---

## Phase 8: User Story 6 - View History (P3 Nice-to-Have)

**Goal**: Display chronological log of all task operations on `/history` page with pagination.

**Why P3**: Nice-to-have feature. Valuable for tracking but not essential for daily task management.

**Independent Test**: Navigate to `/history`, verify chronological list displays (CREATED, UPDATED, COMPLETED, INCOMPLETED, DELETED), test Previous/Next pagination buttons.

**Dependencies**: Phase 7 complete

### Tasks

- [ ] T026 [US6] Create history page in frontend/todo-app/app/history/page.tsx
- [ ] T027 [P] [US6] Create HistoryList component in frontend/todo-app/components/history/HistoryList.tsx
- [ ] T028 [P] [US6] Create HistoryEntry component in frontend/todo-app/components/history/HistoryEntry.tsx
- [ ] T029 [P] [US6] Add pagination controls (Previous/Next buttons) to HistoryList component
- [ ] T030 [US6] Integrate useHistory hook to fetch and display history entries (20 per page)

**Acceptance Criteria**:
- ✅ Navigate to `/history` → page loads with chronological list
- ✅ Each entry displays: timestamp, action type (badge), task name, optional description
- ✅ Entries sorted by timestamp DESC (newest first)
- ✅ Pagination displays: "Page X of Y" with Previous/Next buttons
- ✅ Previous button disabled on page 1
- ✅ Next button disabled on last page
- ✅ Click Next → fetches page 2, updates display
- ✅ Click Previous → fetches previous page, updates display
- ✅ Action type badges color-coded (CREATED=green, UPDATED=blue, COMPLETED=purple, DELETED=red)
- ✅ Empty state displays: "No history yet" when no entries exist

---

## Phase 9: User Story 7 - Analytics Dashboard (P3 Nice-to-Have)

**Goal**: Display analytics dashboard with Recharts visualizations (weekly bar chart, metrics, activity timeline) using purple theme.

**Why P3**: Motivational feature that provides insights. Valuable but not essential for basic task management.

**Independent Test**: Navigate to `/analytics`, verify weekly completed/incomplete bar chart renders with purple colors, check total metrics cards display, verify activity timeline chart shows operations over time.

**Dependencies**: Phase 8 complete

### Tasks

- [ ] T031 [US7] Create analytics page in frontend/todo-app/app/analytics/page.tsx
- [ ] T032 [P] [US7] Create WeeklyChart component in frontend/todo-app/components/analytics/WeeklyChart.tsx with Recharts BarChart
- [ ] T033 [P] [US7] Create MetricCard component in frontend/todo-app/components/analytics/MetricCard.tsx for stats display
- [ ] T034 [P] [US7] Create ActivityTimeline component in frontend/todo-app/components/analytics/ActivityTimeline.tsx with Recharts LineChart
- [ ] T035 [P] [US7] Integrate useStats hook to fetch weekly statistics from GET /stats/weekly
- [ ] T036 [US7] Add "Refresh" button to analytics page to manually reload data

**Acceptance Criteria**:
- ✅ Navigate to `/analytics` → page loads with dashboard
- ✅ Weekly bar chart displays completed vs incomplete tasks for current week
- ✅ Bar chart uses purple theme colors from chartConfig.ts (main #7c3aed, light #a78bfa)
- ✅ Chart wrapped in ResponsiveContainer for mobile responsiveness
- ✅ Metric cards display:
  - Total Completed Tasks (with CheckCircle2 icon, purple background)
  - Total Incomplete Tasks (with Circle icon, gray background)
- ✅ Activity timeline shows task operations over time (line chart)
- ✅ Click "Refresh" button → refetches stats, updates all charts
- ✅ Loading spinner displays during data fetch
- ✅ Empty state displays: "No data available" when stats are empty
- ✅ All charts responsive on mobile, tablet, desktop viewports

---

## Phase 10: Polish & Integration (No Story Label)

**Goal**: Ensure overall system quality, responsive design, and cross-story integration.

**Dependencies**: All user story phases complete (Phase 3-9)

### Tasks

- [ ] T037 [P] Verify responsive design on all pages (mobile 375px, tablet 768px, desktop 1920px)
- [ ] T038 Verify purple theme consistency (#7c3aed) across all SweetAlert2 modals and Recharts charts
- [ ] T039 Verify HomePage and Hero section remain unchanged (no modifications to existing pages)

**Completion Criteria**:
- ✅ All 4 pages (/tasks, /tasks/[id], /history, /analytics) responsive on all viewports
- ✅ All SweetAlert2 modals use purple confirm button (#7c3aed)
- ✅ All Recharts visualizations use purple color palette from chartConfig.ts
- ✅ HomePage (/) and Hero section unchanged and functional
- ✅ Navigation between pages works correctly
- ✅ No console errors in browser DevTools
- ✅ All CRUD operations work end-to-end

---

## Dependencies & Execution Flow

### Critical Path (MVP)
```
Phase 1 (Setup) → Phase 2 (Foundational) → Phase 3 (US1 View) → Phase 4 (US2 Create) → Phase 5 (US3 Complete)
```

### Full Feature Completion
```
MVP Path → Phase 6 (US4 Delete) → Phase 7 (US5 Edit) → Phase 8 (US6 History) → Phase 9 (US7 Analytics) → Phase 10 (Polish)
```

### User Story Independence

**Independent Stories** (can be developed in parallel after Foundational):
- US1 (View Tasks) - Independent
- US2 (Create Tasks) - Depends on US1 (needs page to display created tasks)
- US3 (Complete/Incomplete) - Depends on US2 (needs tasks to toggle)
- US4 (Delete) - Depends on US3 (needs tasks to delete)
- US5 (Edit) - Independent of US4 (can develop in parallel)
- US6 (History) - Independent (separate page)
- US7 (Analytics) - Independent (separate page)

**Parallel Development Opportunities**:
- After Phase 2: US6 and US7 can start in parallel with MVP path
- After Phase 4: US5 can start while working on US4
- All [P] marked tasks within a phase can run concurrently

---

## Implementation Strategy

### MVP Delivery (Phases 1-5)
- **Goal**: Deliver core task management functionality
- **User Stories**: US1 (View), US2 (Create), US3 (Complete/Incomplete)
- **Timeline**: Priority 1 - Implement first
- **Value**: Users can view, create, and mark tasks complete - essential workflow

### Enhanced Features (Phases 6-7)
- **Goal**: Add task editing and deletion
- **User Stories**: US4 (Delete), US5 (Edit)
- **Timeline**: Priority 2 - Implement after MVP
- **Value**: Full CRUD operations, better task management

### Insights & Tracking (Phases 8-9)
- **Goal**: Add history logging and analytics visualizations
- **User Stories**: US6 (History), US7 (Analytics)
- **Timeline**: Priority 3 - Implement after core features
- **Value**: Task tracking, performance insights, motivational charts

### Quality Assurance (Phase 10)
- **Goal**: Ensure system-wide quality and consistency
- **Timeline**: Final phase before deployment
- **Value**: Professional, polished user experience

---

## Parallel Execution Examples

### Phase 1: Setup (2 parallel tasks)
```bash
# Can run simultaneously (different files):
T001 (verify package.json) || T002 (create alerts.ts)
```

### Phase 2: Foundational (3 parallel tasks)
```bash
# Can run simultaneously (different files):
T005 (api.ts history method) || T006 (api.ts stats method) || T007 (useHistory.ts)
```

### Phase 4: User Story 2 (2 parallel tasks)
```bash
# Can run simultaneously (different concerns):
T014 (form validation) || T015 (SweetAlert2 success)
```

### Phase 9: User Story 7 (4 parallel tasks)
```bash
# Can run simultaneously (different components):
T032 (WeeklyChart) || T033 (MetricCard) || T034 (ActivityTimeline) || T035 (useStats hook)
```

---

## Testing Strategy

### Manual Testing Workflow

Each user story has "Independent Test" criteria documented in spec.md. Test in priority order:

1. **US1 Test**: Navigate to `/tasks`, verify task list displays with active/completed sections
2. **US2 Test**: Create task "Buy groceries", see SweetAlert2 success, verify appears in list
3. **US3 Test**: Click completion icon, see instant UI update, verify SweetAlert2 notification
4. **US4 Test**: Click delete, confirm in dialog, verify task removed
5. **US5 Test**: Click task, navigate to detail page, edit title, save, verify SweetAlert2 success
6. **US6 Test**: Navigate to `/history`, verify chronological list, test pagination
7. **US7 Test**: Navigate to `/analytics`, verify charts render with purple theme

### Automated Testing (Optional)

If tests are requested, add test tasks before implementation tasks in each phase:

```
- [ ] T0XX [P] [USX] Write test for [component] in frontend/todo-app/tests/[component].test.tsx
```

---

## File Modifications Summary

### New Files (17 total)
- `components/notifications/alerts.ts` - SweetAlert2 wrapper
- `lib/chartConfig.ts` - Recharts purple theme
- `app/tasks/[id]/page.tsx` - Task detail page
- `components/tasks/TaskDetailForm.tsx` - Edit form
- `app/history/page.tsx` - History log page
- `components/history/HistoryList.tsx` - History list
- `components/history/HistoryEntry.tsx` - History entry
- `hooks/useHistory.ts` - History state hook
- `app/analytics/page.tsx` - Analytics dashboard
- `components/analytics/WeeklyChart.tsx` - Bar chart
- `components/analytics/MetricCard.tsx` - Metric display
- `components/analytics/ActivityTimeline.tsx` - Line chart
- `hooks/useStats.ts` - Stats state hook

### Modified Files (3 total)
- `services/api.ts` - Add getHistory(), getWeeklyStats()
- `hooks/useTasks.ts` - Integrate SweetAlert2
- `app/tasks/page.tsx` - Add SweetAlert2 notifications, empty state

### Preserved Files (DO NOT MODIFY)
- `app/page.tsx` - HomePage
- `components/HomePage/*` - All HomePage components

---

## Success Metrics

| Metric | Target | Validation |
|--------|--------|------------|
| Total Tasks | 39 | ✅ All phases documented |
| Parallel Tasks | 19 (49%) | ✅ [P] markers applied |
| User Stories | 7 (3 P1, 2 P2, 2 P3) | ✅ All mapped to phases |
| New Pages | 3 (/tasks/[id], /history, /analytics) | ✅ Tasks T022, T026, T031 |
| New Components | 8 | ✅ Tasks T023, T027-T028, T032-T034 |
| New Hooks | 2 (useHistory, useStats) | ✅ Tasks T007, T008 |
| SweetAlert2 Integration | 6 operations | ✅ Tasks T002, T015-T016, T018, T021, T025 |
| Recharts Integration | 2 charts | ✅ Tasks T032, T034 |

---

## Risk Mitigation

| Risk | Mitigation Task |
|------|----------------|
| SweetAlert2 styling conflicts | T002 creates centralized wrapper with purple theme |
| Recharts not responsive | T032, T034 use ResponsiveContainer wrapper |
| Existing pages broken | T039 validates HomePage/Hero unchanged |
| Theme inconsistency | T038 validates purple theme across all components |

---

**Tasks Status**: ✅ READY FOR IMPLEMENTATION
**Total Tasks**: 39 tasks organized by user story priority
**Parallel Opportunities**: 19 tasks (49%) marked [P] for concurrent execution
**MVP Scope**: Phases 1-5 (Tasks T001-T019) deliver core task management

*Tasks generated 2025-12-11 using spec-driven development workflow*
