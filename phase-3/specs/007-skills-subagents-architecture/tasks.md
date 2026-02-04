# Tasks: Skills & Subagents Architecture Implementation

**Input**: Design documents from `/specs/007-skills-subagents-architecture/`
**Prerequisites**: plan.md, spec.md, data-model.md, contracts/, research.md, quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

**Path Convention**: This is a Next.js web application. All paths use `frontend/todo-app/` prefix.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, etc.)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and directory structure for Skills & Subagents Architecture

**Task Count**: 7 tasks

- [X] T001 Create directory structure: `frontend/todo-app/lib/skills/` for 9 skill engines
- [X] T002 [P] Create directory structure: `frontend/todo-app/components/tasks/` for task components
- [X] T003 [P] Create directory structure: `frontend/todo-app/components/notifications/` for notification components
- [X] T004 [P] Create directory structure: `frontend/todo-app/hooks/` for custom React hooks (already exists)
- [X] T005 [P] Create directory structure: `frontend/todo-app/types/` for TypeScript type definitions (already exists)
- [X] T006 [P] Create directory structure: `frontend/todo-app/utils/` for utility functions (already exists)
- [X] T007 [P] Create directory structure: `frontend/todo-app/lib/storage/` for localStorage abstraction
- [X] T007b [P] Create directory structure: `frontend/todo-app/stores/` for Zustand stores

**Checkpoint**: ✅ Directory structure ready for implementation

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core type definitions, constants, and utilities that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

**Task Count**: 12 tasks

### Type Definitions (Parallel)

- [X] T008 [P] Create Task type definition in `frontend/todo-app/types/task.types.ts`
- [X] T009 [P] Create Notification type definition in `frontend/todo-app/types/notification.types.ts`
- [X] T010 [P] Create FilterState type definition in `frontend/todo-app/types/filter.types.ts`
- [X] T011 [P] Create SortState type definition in `frontend/todo-app/types/sort.types.ts`

### Constants and Utilities (Parallel)

- [X] T012 [P] Create priority color constants in `frontend/todo-app/utils/priorityColors.ts`
- [X] T013 [P] Create standard tag categories in `frontend/todo-app/utils/tagCategories.ts`
- [X] T014 [P] Create time utility functions (formatRelativeTime, formatDuration) in `frontend/todo-app/utils/timeUtils.ts`

### localStorage Abstraction (Sequential)

- [X] T015 Create localStorage abstraction layer in `frontend/todo-app/lib/storage/localStorage.ts` (with quota detection and error handling)
- [X] T016 [P] Create Zustand store for tasks in `frontend/todo-app/stores/taskStore.ts` (**IMPORTANT: NO localStorage middleware - data from backend API**)
- [X] T017 [P] Create Zustand store for filters in `frontend/todo-app/stores/filterStore.ts` (WITH localStorage middleware)
- [X] T018 [P] Create Zustand store for sort state in `frontend/todo-app/stores/sortStore.ts` (WITH localStorage middleware)
- [X] T019 [P] Create Zustand store for notifications in `frontend/todo-app/stores/notificationStore.ts` (WITH localStorage middleware)

### Additional Hooks (Parallel)

- [X] T019a [P] Create useSearch hook in `frontend/todo-app/hooks/useSearch.ts` (300ms debounce)
- [X] T019b [P] Create useFilters hook in `frontend/todo-app/hooks/useFilters.ts` (filter state management)
- [X] T019c [P] Create useTasks hook in `frontend/todo-app/hooks/useTasks.ts` (task CRUD operations with auto-classification)

**Checkpoint**: ✅ Foundation complete - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Task Creation with Smart Priority Classification (Priority: P1) 🎯 MVP

**Goal**: Enable users to create tasks with automatic priority detection and visual styling

**Independent Test**: Create tasks with different urgency keywords ("urgent", "ASAP", "critical") and due dates, then verify correct priority classification (VERY IMPORTANT, HIGH, MEDIUM, LOW) with proper visual styling (purple, red, yellow, gray).

**Task Count**: 9 tasks

### Skill Engines (Parallel)

- [X] T020 [P] [US1] Implement priority classification algorithm in `frontend/todo-app/lib/skills/priority-classification.ts` (urgency keywords + due date proximity)
- [X] T021 [P] [US1] Implement task tagging validation in `frontend/todo-app/lib/skills/task-tagging.ts` (max 5 tags, no duplicates, standard categories only)

### UI Components (Sequential, depends on T020, T021)

- [X] T022 [US1] Create PriorityBadge component in `frontend/todo-app/components/tasks/PriorityBadge.tsx` (4px border radius, 2px 8px padding, 600 font weight, 12px font size, color-coded)
- [X] T023 [US1] Create TagChip component in `frontend/todo-app/components/tasks/TagChip.tsx` (16px border radius, subtle backgrounds, contrasting text)
- [X] T024 [US1] Create TaskForm component in `frontend/todo-app/components/tasks/TaskForm.tsx` (title, description, dueDate, tags with autocomplete)
- [X] T025 [US1] Create TaskItem component in `frontend/todo-app/components/tasks/TaskItem.tsx` (displays task with PriorityBadge and TagChips)
- [X] T026 [US1] Create TaskList component in `frontend/todo-app/components/tasks/TaskList.tsx` (renders list of TaskItem components)

### Hooks and Pages (Sequential, depends on T022-T026)

- [X] T027 [US1] Integrate backend API calls into useTasks hook for real persistence
- [X] T028 [US1] Create main tasks page in `frontend/todo-app/app/tasks/page.tsx` (TaskList + TaskForm integration)

**Checkpoint**: ✅ User Story 1 complete - users can create, view, and manage tasks with auto-classification

---

## Phase 4: User Story 2 - Task Organization with Tags and Categories (Priority: P1)

**Goal**: Enable users to categorize tasks with standard tags for organization by life areas

**Independent Test**: Create tasks and assign tags from 7 standard categories (Work, Personal, Shopping, Health, Finance, Learning, Urgent), verify tag validation (max 5 tags, no duplicates), confirm visual display with proper styling.

**Task Count**: 3 tasks

**Note**: Most US2 functionality is already implemented in US1 (TagChip, task tagging). This phase adds remaining features.

### Enhancements (Parallel)

- [ ] T029 [P] [US2] Add tag autocomplete to TaskForm in `frontend/todo-app/components/tasks/TaskForm.tsx` (show 7 standard categories)
- [ ] T030 [P] [US2] Add tag validation feedback in TaskForm (display "Maximum 5 tags per task" and "Tag already added" messages)
- [ ] T031 [P] [US2] Add tag filter chips to TaskList in `frontend/todo-app/components/tasks/TaskList.tsx` (filter by selected tags)

**Checkpoint**: User Story 2 complete - users can organize tasks with tags and filter by categories

---

## Phase 5: User Story 3 - Search Tasks with Relevance Ranking (Priority: P2)

**Goal**: Enable users to search across tasks by title, description, and tags with relevance ranking

**Independent Test**: Create 30+ tasks with various titles, descriptions, and tags. Search for keywords and verify results are ranked by relevance (title matches first, then description, then tags), limited to top 50 matches, with 300ms debounce on input.

**Task Count**: 4 tasks

### Skill Engine and Hook (Parallel)

- [X] T032 [P] [US3] Implement task search algorithm in `frontend/todo-app/lib/skills/task-search.ts` (case-insensitive, relevance ranking: title > description > tags, top 50 limit)
- [X] T033 [P] [US3] useSearch hook already created (✅ complete in Phase 2)

### UI Components (Sequential, depends on T032)

- [X] T034 [US3] Create SearchBar component in `frontend/todo-app/components/tasks/SearchBar.tsx` (debounced input with search icon, keyboard shortcuts Ctrl+K/Cmd+K, character count)
- [X] T035 [US3] Integrate SearchBar into TaskList component in `frontend/todo-app/components/tasks/TaskList.tsx` (filter tasks by search results, highlight matching text with <mark> tags, empty state for no results)

**Checkpoint**: ✅ User Story 3 complete - users can search tasks with relevance-based results

---

## Phase 6: User Story 4 - Filter and Sort Tasks (Priority: P2)

**Goal**: Enable users to filter tasks by status, priority, due date and sort by different criteria

**Independent Test**: Create 25+ tasks with varying status, priority, due dates, and tags. Apply multiple filters simultaneously (e.g., Status=In Progress AND Priority=HIGH) and verify cumulative AND logic. Test all 4 sort options with ascending/descending toggles and verify stable sorting with tie-breaking.

**Task Count**: 7 tasks

### Skill Engines (Parallel)

- [ ] T036 [P] [US4] Implement task filter logic in `frontend/todo-app/lib/skills/task-filter.ts` (cumulative AND logic, 3 filter types: Status, Priority, Due Date)
- [ ] T037 [P] [US4] Implement task sorting algorithm in `frontend/todo-app/lib/skills/task-sorting.ts` (4 sort options with tie-breaking: Priority → Due Date → Created Date → Title)

### Hooks (Parallel, depends on T036, T037)

- [ ] T038 [P] [US4] useFilters hook already created (✅ complete in Phase 2)
- [ ] T039 [P] [US4] Create useSort hook in `frontend/todo-app/hooks/useSort.ts` (sort state management, ascending/descending toggle, localStorage persistence)

### UI Components (Sequential, depends on T038, T039)

- [ ] T040 [US4] Create FilterPanel component in `frontend/todo-app/components/tasks/FilterPanel.tsx` (3 filter categories with multi-select, active filter chips)
- [ ] T041 [US4] Create SortControls component in `frontend/todo-app/components/tasks/SortControls.tsx` (4 sort options, ascending/descending toggle)
- [ ] T042 [US4] Integrate FilterPanel and SortControls into TaskList in `frontend/todo-app/components/tasks/TaskList.tsx` (apply filters and sorts to task list)

**Checkpoint**: User Story 4 complete - users can filter and sort tasks with advanced criteria

---

## Phase 7: User Story 5 - Time-Based Task Intelligence (Priority: P2)

**Goal**: Enable automatic detection of overdue/urgent tasks and display relative time

**Independent Test**: Create tasks with various due dates (past, within 6 hours, within 24 hours, next week). Wait for temporal evaluation loop (runs every 60 seconds) and verify tasks are correctly marked as overdue, urgent, or upcoming with relative time displays ("in 2 hours", "3 days ago").

**Task Count**: 4 tasks

### Skill Engine and Hook (Parallel)

- [ ] T043 [P] [US5] Implement temporal evaluation algorithm in `frontend/todo-app/lib/skills/temporal-evaluation.ts` (detect overdue/urgent/upcoming, calculate relative time)
- [ ] T044 [P] [US5] Create useTemporalEvaluation hook in `frontend/todo-app/hooks/useTemporalEvaluation.ts` (60-second setInterval loop, update task states)

### UI Components (Sequential, depends on T043, T044)

- [ ] T045 [US5] Create RelativeTime component in `frontend/todo-app/components/tasks/RelativeTime.tsx` (displays "in 2 hours", "3 days ago", with color coding for overdue)
- [ ] T046 [US5] Integrate RelativeTime and temporal states into TaskItem in `frontend/todo-app/components/tasks/TaskItem.tsx` (show overdue/urgent badges, relative time)

**Checkpoint**: User Story 5 complete - users see automatic temporal intelligence with relative time displays

---

## Phase 8: User Story 6 - Smart Notifications for Critical Tasks (Priority: P3)

**Goal**: Enable notifications for VERY IMPORTANT tasks due within 6 hours

**Independent Test**: Create VERY IMPORTANT tasks with due dates within 6 hours. Verify notifications trigger immediately and repeat every 10 minutes while app is open. Mark task complete or let due time pass and verify notifications stop. Check duplicate prevention (no notifications within 10-minute window).

**Task Count**: 3 tasks

### Skill Engines (Parallel)

- [ ] T047 [P] [US6] Implement notification trigger logic in `frontend/todo-app/lib/skills/notification-trigger.ts` (VERY IMPORTANT tasks only, 10-minute repeat, duplicate prevention with in-memory Map)
- [ ] T048 [P] [US6] Implement notification persistence in `frontend/todo-app/lib/skills/notification-persistence.ts` (backend API storage, 50-notification limit, cascade delete on task deletion)

### Hook (Sequential, depends on T047, T048)

- [ ] T049 [US6] Create useNotificationTrigger hook in `frontend/todo-app/hooks/useNotificationTrigger.ts` (integrates with useTemporalEvaluation, triggers notifications every 60 seconds)

**Checkpoint**: User Story 6 complete - users receive timely notifications for critical tasks

---

## Phase 9: User Story 7 - Notification Management and History (Priority: P3)

**Goal**: Enable users to view notification history, mark as read, and see unread counts

**Independent Test**: Trigger multiple notifications, navigate to /notifications page, verify notifications are stored in backend database with correct schema, test mark-as-read functionality, verify 50-notification limit with automatic pruning, and confirm deleted task notifications are removed.

**Task Count**: 7 tasks

### Skill Engine and Hook (Parallel)

- [ ] T050 [P] [US7] Implement notification UI utilities in `frontend/todo-app/lib/skills/notification-ui.ts` (getUnread, getAll, markAsRead methods via backend API)
- [ ] T051 [P] [US7] Create useNotifications hook in `frontend/todo-app/hooks/useNotifications.ts` (notification CRUD operations via backend API, unread count)

### UI Components (Sequential, depends on T050, T051)

- [ ] T052 [US7] Create NotificationItem component in `frontend/todo-app/components/notifications/NotificationItem.tsx` (16px padding, hover states, border-bottom separators, purple theme for VERY IMPORTANT)
- [ ] T053 [US7] Create NotificationDropdown component in `frontend/todo-app/components/notifications/NotificationDropdown.tsx` (320px width, max 400px height, scrollable, empty state)
- [ ] T054 [US7] Create NotificationBell component in `frontend/todo-app/components/notifications/NotificationBell.tsx` (24px bell icon, unread count badge, 2-second purple glow pulse animation)
- [ ] T055 [US7] Create notification history page in `frontend/todo-app/app/notifications/page.tsx` (full list of notifications with mark-as-read from backend)
- [ ] T056 [US7] Integrate NotificationBell into app layout in `frontend/todo-app/app/layout.tsx` (top-right header position)

**Checkpoint**: User Story 7 complete - users can manage notifications with full history

---

## Phase 10: User Story 8 - Visual Consistency and Polish (Priority: P3)

**Goal**: Ensure consistent visual design across all task management components

**Independent Test**: Audit all components for design system compliance. Verify priority chip styling (4px border radius, 2px 8px padding, 600 font weight, 12px font size), tag chip styling (16px border radius), bell icon animation (2-second purple glow pulse), color consistency (#8B5CF6, #EF4444, #F59E0B, #6B7280), and responsive behavior.

**Task Count**: 9 tasks

### Design System Audit (Parallel)

- [ ] T057 [P] [US8] Audit PriorityBadge component for design system compliance in `frontend/todo-app/components/tasks/PriorityBadge.tsx` (verify 4px border radius, 2px 8px padding, 600 font weight, 12px font size)
- [ ] T058 [P] [US8] Audit TagChip component for design system compliance in `frontend/todo-app/components/tasks/TagChip.tsx` (verify 16px border radius, subtle backgrounds, contrasting text)
- [ ] T059 [P] [US8] Audit NotificationBell animation in `frontend/todo-app/components/notifications/NotificationBell.tsx` (verify 2-second purple glow pulse with Framer Motion)
- [ ] T060 [P] [US8] Verify color consistency across all components (VERY IMPORTANT: #8B5CF6, HIGH: #EF4444, MEDIUM: #F59E0B, LOW: #6B7280)

### Responsive Design (Parallel)

- [ ] T061 [P] [US8] Add responsive breakpoints to TaskList component in `frontend/todo-app/components/tasks/TaskList.tsx` (mobile 320px+, tablet 768px+, desktop 1024px+)
- [ ] T062 [P] [US8] Add responsive breakpoints to TaskForm component in `frontend/todo-app/components/tasks/TaskForm.tsx`
- [ ] T063 [P] [US8] Add responsive breakpoints to FilterPanel component in `frontend/todo-app/components/tasks/FilterPanel.tsx`
- [ ] T064 [P] [US8] Add responsive breakpoints to NotificationDropdown component in `frontend/todo-app/components/notifications/NotificationDropdown.tsx`

### Hover States and Animations (Parallel)

- [ ] T065 [P] [US8] Add consistent hover states to all interactive elements (TaskItem, FilterPanel buttons, SortControls, NotificationItem) using TailwindCSS utility classes

**Checkpoint**: User Story 8 complete - all components meet design system specifications

---

## Phase 11: Polish & Cross-Cutting Concerns

**Purpose**: Final integration, error handling, and edge case management

**Task Count**: 7 tasks

### Error Handling (Parallel)

- [ ] T066 [P] Add localStorage quota detection to localStorage abstraction in `frontend/todo-app/lib/storage/localStorage.ts` (try-catch on setItem, display warning at 80% capacity)
- [ ] T067 [P] Add localStorage corruption detection and recovery in `frontend/todo-app/lib/storage/localStorage.ts` (detect invalid JSON, clear and reinitialize)
- [ ] T068 [P] Add error boundary component in `frontend/todo-app/components/ErrorBoundary.tsx` (catch React errors, display user-friendly message)

### Performance Optimization (Parallel)

- [ ] T069 [P] Add memoization to TaskList filtering and sorting in `frontend/todo-app/components/tasks/TaskList.tsx` (React.useMemo for expensive operations)
- [ ] T070 [P] Add React.memo to TaskItem component in `frontend/todo-app/components/tasks/TaskItem.tsx` (prevent unnecessary re-renders)
- [ ] T071 [P] Profile search performance with 1000-task dataset and optimize if needed (target: <300ms)

### Final Integration

- [ ] T072 Verify all user stories work together end-to-end (create tasks → filter → search → sort → notifications → visual consistency)

**Checkpoint**: Feature complete - all user stories implemented, tested, and polished

---

## Task Summary

**Total Tasks**: 75 tasks across 11 phases

**Tasks by Phase**:
- Phase 1 (Setup): 8 tasks ✅ COMPLETE
- Phase 2 (Foundational): 15 tasks ✅ COMPLETE
- Phase 3 (US1 - P1): 9 tasks ✅ COMPLETE
- Phase 4 (US2 - P1): 3 tasks (NEXT)
- Phase 5 (US3 - P2): 4 tasks ✅ COMPLETE
- Phase 6 (US4 - P2): 7 tasks
- Phase 7 (US5 - P2): 4 tasks
- Phase 8 (US6 - P3): 3 tasks
- Phase 9 (US7 - P3): 7 tasks
- Phase 10 (US8 - P3): 9 tasks
- Phase 11 (Polish): 7 tasks

**Completed**: 36 tasks
**Remaining**: 39 tasks

**Tasks by User Story**:
- US1 (Task Creation): 9 tasks ✅ COMPLETE
- US2 (Task Organization): 3 tasks (NEXT)
- US3 (Search): 4 tasks ✅ COMPLETE
- US4 (Filter/Sort): 7 tasks
- US5 (Temporal Intelligence): 4 tasks
- US6 (Notifications): 3 tasks
- US7 (Notification Management): 7 tasks
- US8 (Visual Polish): 9 tasks

**Parallelization Opportunities**:
- Phase 1: 7 parallel tasks ✅
- Phase 2: 14 parallel tasks ✅
- Phase 3 (US1): 2 parallel tasks ✅
- Phase 4 (US2): 3 parallel tasks (T029-T031)
- Phase 5 (US3): 2 parallel tasks ✅
- Phase 6 (US4): 2 parallel tasks (T036-T037)
- Phase 7 (US5): 2 parallel tasks (T043-T044)
- Phase 8 (US6): 2 parallel tasks (T047-T048)
- Phase 9 (US7): 2 parallel tasks (T050-T051)
- Phase 10 (US8): 9 parallel tasks (T057-T065)
- Phase 11 (Polish): 6 parallel tasks (T066-T071)

**Total Parallel Tasks**: 51 tasks can run in parallel (68% of all tasks)

---

## Dependencies

### User Story Completion Order

```
Phase 1 (Setup) ✅ → Phase 2 (Foundational) ✅
                      ↓
                 Phase 3 (US1 - P1) ✅ MVP COMPLETE
                      ↓
        ┌─────────────┴──────────────┬──────────────┬──────────────┐
        ↓                            ↓              ↓              ↓
    Phase 4 (US2 - P1) 🎯      Phase 5 (US3 - P2)✅ Phase 6 (US4 - P2)  Phase 7 (US5 - P2)
        NEXT                                        ↓              ↓
                                 Phase 8 (US6 - P3)  Phase 9 (US7 - P3)
                                      ↓              ↓
                                 Phase 10 (US8 - P3) ──────────────┘
                                      ↓
                                 Phase 11 (Polish)
```

### Story Dependencies

- **US1 (Task Creation)**: ✅ COMPLETE - MVP delivered
- **US2 (Task Organization)**: Depends on US1 (extends task creation with tags) - NEXT
- **US3 (Search)**: ✅ COMPLETE - Independent, implemented in parallel
- **US4 (Filter/Sort)**: Independent - can implement in parallel with US2
- **US5 (Temporal Intelligence)**: Independent - can implement in parallel with US2, US3, US4
- **US6 (Notifications)**: Depends on US5 (uses temporal evaluation)
- **US7 (Notification Management)**: Depends on US6 (manages notifications)
- **US8 (Visual Polish)**: Depends on all previous stories (audits all components)

### Critical Path

```
Setup ✅ → Foundational ✅ → US1 ✅ → US3 ✅ → US2 → US8 → Polish
```

**Critical Path Duration**: ~19 tasks (assuming no parallelization)
**With Parallelization**: ~8-10 major sequential steps

---

## Phase 5 Implementation Summary

**Status**: ✅ COMPLETE

**What Was Implemented**:

1. **Skill Engine** (T032):
   - `lib/skills/task-search.ts`: Search algorithm with relevance ranking
     - Case-insensitive partial matching across title, description, and tags
     - Multi-token AND logic (all tokens must match)
     - Relevance scoring: exact title match (100), partial title (50), description (10), tags (5)
     - Top 50 result limit for performance
     - `highlightText()` function for <mark> tag highlighting

2. **Hook** (T033):
   - `hooks/useSearch.ts`: Already complete from Phase 2
     - 300ms debounce delay
     - Returns searchQuery, debouncedQuery, setSearchQuery, clearSearch, isDebouncing

3. **UI Components** (T034-T035):
   - `components/tasks/SearchBar.tsx`: Full-featured search input
     - Search icon (Lucide Search) with spinner during debounce
     - Clear button (X icon) when query present
     - Keyboard shortcut (Ctrl+K or Cmd+K) to focus input
     - Character count display (color-coded: yellow <3 chars, green ≥3 chars)
     - Debounce status indicator
     - Keyboard hint below input
   - `components/tasks/TaskList.tsx`: Enhanced with search integration
     - SearchBar at top (optional via showSearch prop)
     - Result count display ("Showing 12 of 45 tasks")
     - No search results empty state with clear button
     - TaskItemWithHighlight wrapper component
     - <mark> tag highlighting for matched text (yellow background #FEF3C7, dark amber text #92400E)
     - dangerouslySetInnerHTML for highlighted title and description

**Features Delivered**:
- Search tasks by title, description, or tags
- 300ms debounce prevents excessive re-renders
- Relevance ranking (title matches ranked highest)
- Top 50 results limit
- Multi-token AND logic ("urgent report" requires both words)
- Keyboard shortcuts (Ctrl+K/Cmd+K)
- Character count display
- Debounce loading indicator
- Highlighted matched text with <mark> tags
- Empty state for no search results
- Result count display
- Clear search button

**Architecture Highlights**:
- Pure search function (no side effects)
- useMemo for performance optimization
- Separate TaskItemWithHighlight component for search results
- dangerouslySetInnerHTML for HTML highlighting (XSS-safe via highlightText escaping)
- styled-jsx global for <mark> styling
- Keyboard event listener with cleanup
- Responsive design maintained

**Next Steps**:
Phase 4 (User Story 2 - Task Organization) or Phase 6 (User Story 4 - Filter/Sort) can now begin in parallel.

---

## Implementation Strategy

### MVP First (Recommended)

**Phase 3 (US1) COMPLETE** ✅ delivers a working product:
- Users can create tasks
- Tasks auto-classify into 4 priority levels
- Tasks display with color-coded badges
- Tasks can be tagged with 7 standard categories
- Tasks persist in backend PostgreSQL database

**Phase 5 (US3) COMPLETE** ✅ adds search capability:
- Users can search tasks by any field
- Results ranked by relevance
- Matched text highlighted
- 300ms debounce for performance

**Benefits**:
- Fastest time to value
- Early user feedback
- Foundation for all other stories
- Validates architecture decisions

### Incremental Delivery

After MVP, deliver stories incrementally by priority:
1. **Week 1-3**: US1 (MVP) ✅ COMPLETE → Deploy for user testing
2. **Week 4**: US3 (Search) ✅ COMPLETE → Deploy with search capability
3. **Week 5**: US2 (Tags) → Deploy for organizational testing
4. **Week 6-7**: US4 (Filter/Sort) → Deploy for power user testing
5. **Week 8**: US5 (Temporal Intelligence) → Deploy for deadline tracking testing
6. **Week 9-10**: US6 (Notifications) + US7 (Management) → Deploy for alert testing
7. **Week 11**: US8 (Polish) → Final deployment

### Parallel Team Execution

With multiple developers:
- **Developer 1**: US1 ✅ → US3 ✅ → US5 (Temporal) → US6 (Notifications)
- **Developer 2**: US2 (Tags) → US7 (Notification Management)
- **Developer 3**: US4 (Filter/Sort) → US8 (Visual Polish)

All developers work in parallel after foundational phase complete.

---

## Testing Strategy

**Note**: This feature specification does not explicitly request tests. Testing strategy is documented here for reference but test tasks are NOT included in the task list above.

### Recommended Testing Approach

1. **Manual Testing**: Test each user story's acceptance scenarios as you complete them
2. **Integration Testing**: Verify user stories work together (Phase 11, T072)
3. **Optional Unit Tests**: If desired, add tests for skill engines (pure functions are easy to test)

### If Tests Are Required (Future)

Add these task types to each user story phase:
- Contract tests for skill engines (lib/skills/*.test.ts)
- Component tests for UI (components/**/*.test.tsx)
- Integration tests for user journeys (tests/integration/*.test.ts)

**Example Test Tasks** (not included above):
- T0XX [P] [US1] Unit test priority classification in `tests/skills/priority-classification.test.ts`
- T0XX [P] [US1] Component test TaskForm in `tests/components/TaskForm.test.tsx`
- T0XX [US1] Integration test task creation flow in `tests/integration/task-creation.test.ts`

---

## Success Criteria

### Per-Story Validation

After completing each user story, verify:

**US1**: ✅ Can create tasks with auto-classification and visual styling
**US2**: Can tag tasks with validation and filtering
**US3**: ✅ Can search tasks with relevance ranking
**US4**: Can filter and sort tasks with complex criteria
**US5**: See automatic temporal intelligence and relative time
**US6**: Receive notifications for critical tasks
**US7**: Manage notification history and unread counts
**US8**: All components meet design system specifications

### Overall Validation (Phase 11, T072)

1. Create 50+ tasks with various priorities, tags, and due dates
2. Verify auto-classification works correctly
3. Search for keywords and verify relevance ranking ✅
4. Apply multiple filters simultaneously and verify AND logic
5. Sort by different criteria and verify tie-breaking
6. Verify temporal evaluation runs every 60 seconds
7. Verify notifications trigger for VERY IMPORTANT tasks
8. Verify notification management (mark as read, history)
9. Verify visual consistency across all components
10. Test responsive behavior on mobile, tablet, desktop

### Performance Validation

- Search: <300ms with 1000 tasks ✅
- Filter: <100ms with 500 tasks
- Sort: <100ms with 500 tasks
- Temporal evaluation: <5 seconds per cycle
- UI interactions: <50ms response time
- Notification dropdown: <200ms render time

---

## Notes

- **All tasks follow strict checklist format**: `- [ ] [ID] [P?] [Story?] Description with file path`
- **User stories are independent**: Each can be implemented and tested separately
- **MVP is US1**: ✅ COMPLETE - Delivers working product in shortest time
- **Search is US3**: ✅ COMPLETE - Adds powerful search capability
- **Parallelization optimized**: 68% of tasks can run in parallel
- **Backend-first approach**: Tasks stored in PostgreSQL, filters/sorts in localStorage
- **Purple theme enforced**: Per Phase-2 Master Agent Constitution (#8B5CF6)
- **9 skill engines**: Pure TypeScript functions for business logic
- **4 subagents**: Mapped to implementation domains (plan.md)
