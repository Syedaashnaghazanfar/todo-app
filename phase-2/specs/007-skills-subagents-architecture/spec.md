# Feature Specification: Skills & Subagents Architecture Implementation

**Feature Branch**: `007-skills-subagents-architecture`
**Created**: 2025-12-16
**Status**: Draft
**Input**: User description: "Todo App Development - Skills & Subagents Architecture Implementation"

## ⚠️ CRITICAL ARCHITECTURE NOTE

**This feature MUST integrate with the existing FastAPI backend + PostgreSQL database.**

The application already has:
- **Backend**: FastAPI (Python) with PostgreSQL (Neon) database
- **Existing Task API**: `/api/v1/tasks` with CRUD endpoints
- **Existing Task Model**: `tasks` table with `id`, `title`, `description`, `is_completed`, `created_at`, `updated_at`, `completed_at`, `user_id`
- **User Authentication**: JWT-based auth with user isolation
- **History Integration**: Task completion creates history entries

**Implementation Requirements**:
1. **Backend-First**: ALL task operations (create, read, update, delete, complete) MUST go through the FastAPI backend
2. **Database Persistence**: ALL task data MUST be stored in PostgreSQL, NOT localStorage
3. **Extend Existing Model**: Add new fields (`priority`, `tags`, `due_date`, `status`) to the existing `Task` model via database migration
4. **Preserve History Integration**: Completed tasks MUST continue to create history entries (existing behavior)
5. **UI Consistency**: Maintain existing UI patterns from History and Analytics pages
6. **No Breaking Changes**: Existing task functionality must continue to work

**localStorage Usage** (client-side only):
- Filter state persistence (status, priority, due date filters)
- Sort state persistence (sort field, direction)
- Search query caching (for UX continuity)
- Notification tracking (in-memory + localStorage for unread counts)

**Backend Changes Required**:
- Extend `Task` model with: `priority` (enum), `tags` (JSON array), `due_date` (datetime), `status` (enum)
- Update Task schemas (TaskCreate, TaskUpdate, TaskResponse) with new fields
- Add auto-classification logic in TaskService (server-side priority calculation)
- Add validation for tags (max 5, standard categories only)

**Skills Architecture** (client-side):
- Priority classification: Client-side UI logic + server-side persistence
- Tag validation: Client-side + server-side validation
- Search/Filter/Sort: Client-side operations on server-fetched data
- Temporal evaluation: Client-side real-time updates
- Notifications: Client-side alerts based on server data

## 🤖 MANDATORY SUBAGENT ARCHITECTURE

**This implementation MUST use the specified subagents for their respective domains.**

### Required Subagents

1. **task-organization-agent** (Frontend Data & Organization)
   - **Responsibility**: Task CRUD operations, search, filter, sort, tag management
   - **Scope**: `frontend/todo-app/components/tasks/*`, `frontend/todo-app/hooks/useTasks.ts`, search/filter/sort UI components
   - **Key Tasks**: Implement TaskForm, TaskList, TaskItem, SearchBar, FilterPanel, SortControls components; integrate with backend API

2. **task-intelligence-agent** (Temporal & Notification Logic)
   - **Responsibility**: Temporal evaluation (overdue/urgent detection), notification triggering logic
   - **Scope**: `frontend/todo-app/lib/skills/temporal-evaluation.ts`, `frontend/todo-app/lib/skills/notification-trigger.ts`, `frontend/todo-app/hooks/useTemporalEvaluation.ts`
   - **Key Tasks**: Implement 60-second evaluation loop, detect VERY_IMPORTANT tasks due within 6 hours, trigger client-side notifications

3. **notification-experience-agent** (Notification UI & Persistence)
   - **Responsibility**: Notification UI components, backend API integration for notification storage/retrieval
   - **Scope**: `frontend/todo-app/components/notifications/*`, `frontend/todo-app/app/notifications/page.tsx`, notification backend API calls
   - **Key Tasks**: Implement NotificationBell, NotificationDropdown, NotificationItem components; integrate with backend notification endpoints

4. **frontend-experience-agent** (Visual Consistency & Theme)
   - **Responsibility**: Design system compliance, purple theme enforcement, visual polish
   - **Scope**: `frontend/todo-app/components/tasks/PriorityBadge.tsx`, `frontend/todo-app/components/tasks/TagChip.tsx`, `frontend/todo-app/components/tasks/RelativeTime.tsx`, responsive design audit
   - **Key Tasks**: Ensure all components match design system specifications (colors, sizing, spacing, animations), enforce purple theme (#8B5CF6)

5. **data-processor-sub-agent** (Backend Integration & Data Transformation)
   - **Responsibility**: Backend database migration, API endpoint creation, data schema updates
   - **Scope**: `backend/src/models/task.py`, `backend/src/schemas/task.py`, `backend/src/services/task_service.py`, `backend/alembic/versions/`, notification backend model/service
   - **Key Tasks**: Extend Task model with new fields, create database migration, implement server-side priority classification, add notification endpoints

### Subagent Coordination Rules

- **Sequential Phases**: Backend changes (data-processor-sub-agent) MUST complete before frontend integration (other agents)
- **Parallel Execution**: Frontend subagents can work in parallel after backend is ready
- **Clear Handoffs**: Each subagent produces complete, tested components before handoff
- **No Overlap**: Agents must not modify files outside their assigned scope

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Task Creation with Smart Priority Classification (Priority: P1)

As a user, I need to create tasks with automatic priority detection and visual styling so that I can quickly identify urgent items without manual classification.

**Why this priority**: Core functionality that enables all other features. Without task creation and priority classification, no other organizational features can function. This is the foundation of the task management system.

**Independent Test**: Can be fully tested by creating tasks with different urgency keywords ("urgent", "ASAP", "critical") and due dates, then verifying that tasks are automatically classified into the correct priority level (VERY IMPORTANT, HIGH, MEDIUM, LOW) with proper visual styling (purple, red, yellow, gray).

**Acceptance Scenarios**:

1. **Given** I am on the task creation screen, **When** I create a task titled "Urgent: Fix production bug" with a due date 3 hours from now, **Then** the task is automatically classified as VERY IMPORTANT with purple styling (#8B5CF6)
2. **Given** I am viewing my task list, **When** I create a task with a due date 2 days away and no urgency keywords, **Then** the task is classified as MEDIUM priority with yellow styling (#F59E0B)
3. **Given** I create a task without a due date, **When** the task is saved, **Then** it is classified as LOW priority with gray styling (#6B7280)
4. **Given** I create a task with the word "critical" in the title and a due date within 6 hours, **When** the task is saved, **Then** it is classified as VERY IMPORTANT and displays a purple badge

---

### User Story 2 - Task Organization with Tags and Categories (Priority: P1)

As a user, I need to categorize tasks with standard tags so that I can organize tasks by life areas (Work, Personal, Health, etc.) and quickly filter them later.

**Why this priority**: Essential organizational feature that provides immediate value. Users can group related tasks and find them efficiently. This is critical for users managing tasks across multiple life domains.

**Independent Test**: Create tasks and assign tags from the 7 standard categories (Work, Personal, Shopping, Health, Finance, Learning, Urgent), verify tag validation (max 5 tags, no duplicates), and confirm visual display with proper styling (16px border radius, subtle backgrounds).

**Acceptance Scenarios**:

1. **Given** I am creating a new task, **When** I start typing a tag, **Then** I see autocomplete suggestions from the 7 standard categories
2. **Given** I have added 5 tags to a task, **When** I attempt to add a 6th tag, **Then** the system prevents me and displays a message "Maximum 5 tags per task"
3. **Given** I have added "Work" tag to a task, **When** I attempt to add "Work" again, **Then** the system prevents duplicate and shows "Tag already added"
4. **Given** I view a task with tags, **When** I see the tag chips, **Then** each tag has 16px border radius, appropriate background color, and contrasting text

---

### User Story 3 - Search Tasks with Relevance Ranking (Priority: P2)

As a user, I need to search across my tasks by title, description, and tags so that I can quickly find specific tasks without scrolling through my entire list.

**Why this priority**: High-value feature for users with many tasks. Improves productivity by reducing time spent finding tasks. Becomes essential as task lists grow beyond 20-30 items.

**Independent Test**: Create 30+ tasks with various titles, descriptions, and tags. Search for keywords and verify results are ranked by relevance (title matches first, then description, then tags), limited to top 50 matches, with 300ms debounce on input.

**Acceptance Scenarios**:

1. **Given** I have 30 tasks in my list, **When** I type "meeting" in the search box, **Then** I see results after 300ms that prioritize title matches over description matches
2. **Given** I search for "doctor", **When** results are displayed, **Then** tasks with "doctor" in the title appear before tasks with "doctor" in description or tags
3. **Given** I have 100 tasks matching my search, **When** results are displayed, **Then** only the top 50 most relevant matches are shown
4. **Given** I search for a keyword, **When** results appear, **Then** the matching text is highlighted in the results

---

### User Story 4 - Filter and Sort Tasks (Priority: P2)

As a user, I need to filter tasks by status, priority, and due date, and sort them by different criteria so that I can focus on specific task subsets and view them in my preferred order.

**Why this priority**: Critical for power users who need to slice their task list in different ways. Enables workflows like "show me all HIGH priority tasks due this week" or "show me all completed Work tasks".

**Independent Test**: Create 25+ tasks with varying status, priority, due dates, and tags. Apply multiple filters simultaneously (e.g., Status=In Progress AND Priority=HIGH) and verify cumulative AND logic. Test all 4 sort options with ascending/descending toggles and verify stable sorting with tie-breaking.

**Acceptance Scenarios**:

1. **Given** I have tasks in various states, **When** I apply filters for Status=In Progress AND Priority=HIGH, **Then** I see only tasks matching both criteria
2. **Given** I have applied filters, **When** I view the filter chips, **Then** each active filter is displayed as a removable chip that I can click to remove
3. **Given** I apply filters, **When** I close the app and reopen it, **Then** my filter selections are restored from localStorage
4. **Given** I sort by Priority, **When** two tasks have the same priority, **Then** they are sorted by due date as a tie-breaker
5. **Given** I sort by Due Date in ascending order, **When** I click the sort toggle, **Then** the list reverses to descending order with a visual indicator

---

### User Story 5 - Time-Based Task Intelligence (Priority: P2)

As a user, I need to see relative time displays and automatic detection of overdue/urgent tasks so that I can understand at a glance which tasks need immediate attention.this would be asked while creating the task the PRIORITYwill be also saved in the database 

**Why this priority**: Provides automatic context about task urgency without requiring manual calculation. Critical for time-sensitive task management and preventing missed deadlines.

**Independent Test**: Create tasks with various due dates (past, within 6 hours, within 24 hours, next week). Wait for temporal evaluation loop (runs every 60 seconds) and verify tasks are correctly marked as overdue, urgent, or upcoming with relative time displays ("in 2 hours", "3 days ago").

**Acceptance Scenarios**:

1. **Given** I have a task due in 2 hours, **When** the temporal evaluation runs, **Then** I see "Due in 2 hours" displayed in relative time format
2. **Given** I have a task that was due yesterday, **When** I view the task, **Then** it is marked as OVERDUE with "1 day ago" displayed
3. **Given** I have a task due in 4 hours, **When** the temporal evaluation runs, **Then** the task is classified as URGENT
4. **Given** the app is open, **When** 60 seconds pass, **Then** the temporal evaluation loop recalculates all time-based statuses automatically

---

### User Story 6 - Smart Notifications for Critical Tasks (Priority: P3)

As a user, I need to receive notifications for VERY IMPORTANT tasks due within 6 hours so that I never miss critical deadlines.

**Why this priority**: Valuable for preventing missed deadlines on critical tasks, but not required for basic task management. Enhances the user experience for time-sensitive work.

**Independent Test**: Create VERY IMPORTANT tasks with due dates within 6 hours. Verify notifications trigger immediately and repeat every 10 minutes while app is open. Mark task complete or let due time pass and verify notifications stop. Check duplicate prevention (no notifications within 10-minute window).

**Acceptance Scenarios**:

1. **Given** I have a VERY IMPORTANT task due in 5 hours, **When** the notification trigger evaluates, **Then** I receive a notification
2. **Given** I received a notification for a VERY IMPORTANT task, **When** 10 minutes pass, **Then** I receive another notification if the task is still incomplete
3. **Given** I received a notification 5 minutes ago, **When** the notification trigger runs, **Then** no duplicate notification is sent
4. **Given** I complete a VERY IMPORTANT task, **When** the next notification cycle runs, **Then** no further notifications are sent for that task
5. **Given** I have a HIGH priority task due in 3 hours, **When** the notification trigger evaluates, **Then** no notification is sent (only VERY IMPORTANT triggers notifications)

---

### User Story 7 - Notification Management and History (Priority: P3)

As a user, I need to view my notification history, mark notifications as read, and see unread counts so that I can manage my alerts and review past notifications.

**Why this priority**: Complements the notification system but is not critical for core task management. Users can still use the app effectively without notification management features.

**Independent Test**: Trigger multiple notifications, navigate to /notifications page, verify notifications are stored in localStorage with correct schema, test mark-as-read functionality, verify 50-notification limit with automatic pruning, and confirm deleted task notifications are removed.

**Acceptance Scenarios**:

1. **Given** I have 3 unread notifications, **When** I view the notification bell icon in the header, **Then** I see a badge displaying "3"
2. **Given** I click the notification bell, **When** the dropdown opens, **Then** I see a scrollable list (320px width, max 400px height) with all notifications
3. **Given** I have an unread notification, **When** I click on it, **Then** it is marked as read and the unread count decreases
4. **Given** I have 50 notifications stored, **When** a new notification is created, **Then** the oldest notification is automatically removed
5. **Given** I delete a task with associated notifications, **When** I view the notification page, **Then** those notifications are removed from the list
6. **Given** I have a VERY IMPORTANT task notification, **When** I view it, **Then** it displays with purple theme (#8B5CF6)

---

### User Story 8 - Visual Consistency and Polish (Priority: P3)

As a user, I need consistent visual design across all task management components so that the interface feels professional and cohesive.

**Why this priority**: Enhances user experience and brand perception but does not affect functionality. Users can accomplish all tasks without visual polish, though the experience is improved with it.

**Independent Test**: Audit all components for design system compliance. Verify priority chip styling (4px border radius, 2px 8px padding, 600 font weight, 12px font size), tag chip styling (16px border radius), bell icon animation (2-second purple glow pulse), color consistency (#8B5CF6, #EF4444, #F59E0B, #6B7280), and responsive behavior.

**Acceptance Scenarios**:

1. **Given** I view any priority badge, **When** I inspect the styling, **Then** it has 4px border radius, 2px 8px padding, 600 font weight, and 12px font size
2. **Given** I view tag chips, **When** I inspect them, **Then** they have 16px border radius, subtle backgrounds, and contrasting text
3. **Given** I receive a new notification, **When** the bell icon animates, **Then** I see a 2-second purple glow pulse
4. **Given** I hover over interactive elements, **When** my cursor is over them, **Then** I see consistent hover states
5. **Given** I view the app on different screen sizes, **When** I resize the window, **Then** all components respond appropriately and maintain usability

---

### Edge Cases

- What happens when a user creates a task with conflicting priority signals (e.g., "urgent" keyword but due date 3 months away)?
  - System prioritizes due date proximity over keywords for classification

- What happens when a user's system clock is incorrect?
  - Temporal evaluation uses system time, so relative displays may be inaccurate; recommend system time validation

- What happens when a user has no internet connection?
  - Core task CRUD operations require backend connection; search/filter/sort work on cached data; system shows "offline" indicator

- What happens when the backend API is unavailable?
  - System displays cached tasks (read-only mode); create/update/delete operations queue and retry when connection restores

- What happens when a user deletes a VERY IMPORTANT task that has pending notifications?
  - Notification tracking is cleared immediately when task is deleted; backend cascade deletes associated notifications

- What happens when a user has 100+ unread notifications?
  - Badge displays "99+" as maximum to prevent UI overflow

- What happens when two tasks have identical priority, due date, and creation date during sorting?
  - Alphabetical title sorting is used as final tie-breaker

- What happens when a user searches with special characters or regex patterns?
  - Search treats all input as literal text, not regex, to prevent errors

- What happens when localStorage filter/sort preferences are corrupted?
  - System detects corruption, clears invalid preferences, and resets to defaults

## Requirements *(mandatory)*

### Functional Requirements

#### Task Management Core

- **FR-001**: System MUST allow users to create tasks via backend API with fields: title (required), description (optional), due_date (optional, datetime), priority (auto-classified server-side), status (default: not_started), tags (JSON array, up to 5), and timestamps (created_at, updated_at)
- **FR-002**: System MUST implement automatic priority classification on server-side based on due date proximity and urgency keywords ("urgent", "ASAP", "critical", "important", "emergency")
- **FR-003**: System MUST classify tasks into exactly four priority levels: VERY_IMPORTANT, HIGH, MEDIUM, LOW (stored as enum in database)
- **FR-004**: System MUST apply color coding to priority levels in UI: VERY_IMPORTANT (#8B5CF6 purple), HIGH (#EF4444 red), MEDIUM (#F59E0B yellow), LOW (#6B7280 gray)
- **FR-005**: System MUST allow users to read, update, and delete tasks via backend API with immediate UI reflection and optimistic updates
- **FR-006**: System MUST persist all task data in PostgreSQL database with user_id foreign key for multi-user isolation

#### Tag System

- **FR-007**: System MUST provide exactly 7 standard tag categories: Work, Personal, Shopping, Health, Finance, Learning, Urgent
- **FR-008**: System MUST validate tag assignment with maximum 5 tags per task
- **FR-009**: System MUST prevent duplicate tags on a single task
- **FR-010**: System MUST provide tag autocomplete functionality showing only standard categories
- **FR-011**: System MUST display tag chips with 16px border radius, subtle category-specific background colors, and contrasting text

#### Search Functionality

- **FR-012**: System MUST implement case-insensitive text search across task title, description, and tags
- **FR-013**: System MUST debounce search input by 300ms to prevent excessive re-renders
- **FR-014**: System MUST rank search results by relevance: title matches first, description matches second, tag matches third
- **FR-015**: System MUST limit search results to top 50 matches for performance
- **FR-016**: System MUST highlight matching text in search results

#### Filter System

- **FR-017**: System MUST provide three filter categories: Status (not started, in progress, completed), Priority (VERY IMPORTANT, HIGH, MEDIUM, LOW), Due Date (overdue, today, this week, this month, no due date)
- **FR-018**: System MUST apply filters with cumulative AND logic (all selected filters must match)
- **FR-019**: System MUST persist filter state to localStorage and restore on app reload
- **FR-020**: System MUST display active filters as removable chips with click-to-remove functionality

#### Sort System

- **FR-021**: System MUST provide four sort options: Priority (VERY IMPORTANT first), Due Date (soonest first), Created Date (newest first), Alphabetical (A-Z)
- **FR-022**: System MUST implement stable sorting with tie-breaking rules: Priority → Due Date → Created Date → Title (alphabetical)
- **FR-023**: System MUST provide ascending/descending toggle for each sort option with visual indicator
- **FR-024**: System MUST maintain sort selection across page refreshes via localStorage

#### Temporal Intelligence

- **FR-025**: System MUST implement temporal evaluation loop that runs every 60 seconds while app is open
- **FR-026**: System MUST calculate and display relative time format for due dates: "in X hours", "in X days", "X hours ago", "X days ago"
- **FR-027**: System MUST detect overdue tasks where due date < current time
- **FR-028**: System MUST detect urgent tasks where due date is within 6 hours
- **FR-029**: System MUST detect upcoming tasks where due date is within 24 hours
- **FR-030**: System MUST detect tasks due within 1 week for informational purposes

#### Notification System

- **FR-031**: System MUST trigger notifications ONLY for VERY_IMPORTANT priority tasks that are incomplete and due within 6 hours
- **FR-032**: System MUST repeat notifications every 10 minutes while app is open for qualifying tasks (client-side evaluation)
- **FR-033**: System MUST prevent duplicate notifications within 10-minute window using client-side in-memory tracking
- **FR-034**: System MUST clear notification tracking when task is completed or due time passes
- **FR-035**: System MUST store notifications in PostgreSQL database with schema: {id, task_id (FK), user_id (FK), message, created_at, read_at (nullable), priority} with cascade delete on task deletion
- **FR-036**: System MUST implement backend API notification endpoints: GET /notifications (with ?unread=true filter), PATCH /notifications/:id/read
- **FR-037**: System MUST maintain maximum 50 notifications per user with automatic pruning of oldest read entries
- **FR-038**: System MUST remove all notifications associated with deleted tasks via database cascade delete
- **FR-039**: System MUST display all user notifications in /notifications page fetched from backend API

#### Notification UI

- **FR-040**: System MUST render notification bell icon (24px) in top-right header
- **FR-041**: System MUST display unread count badge on bell icon (circular, red background, white text, showing up to "99+")
- **FR-042**: System MUST implement 2-second purple glow pulse animation on bell icon when new notification arrives
- **FR-043**: System MUST render notification dropdown (320px width, max 400px height, scrollable) on bell icon click
- **FR-044**: System MUST display notification items with 16px padding, hover states, and border-bottom separators
- **FR-045**: System MUST apply purple theme (#8B5CF6) to VERY IMPORTANT task notifications
- **FR-046**: System MUST provide mark-as-read interaction on notification click
- **FR-047**: System MUST display empty state message when no notifications exist

#### Visual Design System

- **FR-048**: System MUST apply consistent styling to all priority badges: 4px border radius, 2px 8px padding, 600 font weight, 12px font size
- **FR-049**: System MUST implement hover states on all interactive elements with consistent color transitions
- **FR-050**: System MUST ensure color consistency across all components using design system palette
- **FR-051**: System MUST implement responsive behavior for all components across screen sizes (mobile, tablet, desktop)
- **FR-052**: System MUST use consistent animation timing curves (ease-in-out) and durations

### Key Entities

- **Task**: Represents a single todo item with properties: unique ID, title (string, required), description (string, optional), due date (ISO 8601 datetime, optional), priority (enum: VERY_IMPORTANT | HIGH | MEDIUM | LOW, auto-classified), status (enum: NOT_STARTED | IN_PROGRESS | COMPLETED, default: NOT_STARTED), tags (array of strings, max 5, from standard categories), created timestamp (ISO 8601 datetime, auto-generated), updated timestamp (ISO 8601 datetime, auto-updated)

- **Tag**: Represents a category label with properties: name (enum: Work | Personal | Shopping | Health | Finance | Learning | Urgent), color (hex code for visual display), description (brief explanation of category usage)

- **Notification**: Represents a notification event with properties: unique ID, task ID (reference to associated task), message (string describing the notification), timestamp (ISO 8601 datetime of notification creation), read status (boolean, default: false), priority (inherited from task for styling purposes)

- **Filter State**: Represents active filters with properties: status filter (array of selected status values), priority filter (array of selected priority values), due date filter (array of selected due date range values), persisted to localStorage

- **Sort State**: Represents active sort configuration with properties: sort field (enum: PRIORITY | DUE_DATE | CREATED_DATE | ALPHABETICAL), sort direction (enum: ASCENDING | DESCENDING), persisted to localStorage

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can create a task with automatic priority classification in under 30 seconds
- **SC-002**: Search results appear within 300ms of typing cessation with correctly ranked results
- **SC-003**: Filter operations complete instantly (under 100ms) even with 500+ tasks
- **SC-004**: Sort operations complete instantly (under 100ms) even with 500+ tasks
- **SC-005**: Temporal evaluation loop runs every 60 seconds without blocking UI interactions
- **SC-006**: Notifications trigger within 5 seconds of meeting criteria (VERY IMPORTANT task due within 6 hours)
- **SC-007**: Notification dropdown renders in under 200ms with up to 50 notifications
- **SC-008**: 100% of priority badges match design system specifications (verified via automated visual regression testing)
- **SC-009**: 95% of users can successfully apply multiple filters and understand cumulative AND logic without documentation
- **SC-010**: System maintains responsive performance with up to 1000 tasks stored in localStorage
- **SC-011**: Users report 40% reduction in time spent finding specific tasks (measured via user surveys)
- **SC-012**: Zero missed VERY IMPORTANT deadlines among users who enable notifications (measured over 30-day period)

## Scope & Boundaries *(mandatory)*

### In Scope

- Task CRUD operations via FastAPI backend with automatic server-side priority classification
- PostgreSQL persistence for tasks, notifications, and user associations
- Tag system with 7 standard categories and client+server validation
- Case-insensitive client-side search across title, description, and tags with relevance ranking
- Client-side filter system with Status, Priority, and Due Date categories using AND logic
- Client-side sort system with 4 sort options and ascending/descending toggles
- Client-side temporal evaluation running every 60 seconds for overdue/urgent detection
- Smart client-side notification triggers for VERY_IMPORTANT tasks due within 6 hours
- Backend notification persistence with API endpoints for retrieval and mark-as-read
- Notification UI management (bell icon, dropdown, history page)
- Visual design system compliance across all components
- localStorage persistence for UI preferences only (filters, sorts, notification unread tracking)
- Responsive UI supporting mobile, tablet, and desktop viewports
- Backend database migration to extend Task model with new fields
- History integration (completed tasks create history entries as before)

### Out of Scope

- Task sharing or collaboration features between users
- Custom tag creation beyond 7 standard categories
- Push notifications when app is closed (no service worker/web push)
- Browser notifications (OS-level notifications)
- Task recurrence or repeating tasks
- Task dependencies or subtasks
- Calendar view or timeline visualization
- Export/import functionality for tasks
- Undo/redo functionality
- Task templates
- Bulk task operations (bulk edit, bulk delete)
- Voice input or advanced accessibility features beyond basic WCAG compliance
- Real-time collaborative editing
- Task comments or activity logs beyond history entries

### Assumptions

- Users have modern browsers supporting ES2019+ JavaScript (Chrome 73+, Firefox 67+, Safari 12.1+, Edge 79+)
- Users have JavaScript enabled in their browser
- Users have stable internet connection for backend API calls (graceful degradation for intermittent connectivity)
- PostgreSQL database has sufficient capacity for 1000+ tasks per user
- System clock on user's device is reasonably accurate (within 5 minutes) for temporal evaluation
- Users understand English language for UI labels and messages
- Backend FastAPI server is deployed and accessible at configured API URL
- Notifications are acceptable as in-app only (no OS-level/push notifications)
- Standard tag categories cover 90%+ of user task categorization needs
- 50-notification history limit per user is sufficient for review needs
- Backend JWT authentication is functional and validates all requests
- History integration continues to work with new task status field (is_completed → status mapping)

### Dependencies

- No external dependencies on other features for core functionality
- Design system color palette must be established before visual polish phase
- Notification UI depends on notification trigger and persistence systems being completed first

## Constraints *(mandatory)*

### Technical Constraints

- MUST use PostgreSQL database for all task and notification persistence
- MUST integrate with existing FastAPI backend API endpoints
- MUST work with existing JWT authentication system
- MUST maintain backward compatibility with existing task history integration
- MUST support browsers released in last 3 years (Chrome, Firefox, Safari, Edge)
- MUST maintain client-side performance with up to 1000 tasks fetched from backend
- MUST keep client-side search results under 50 items for rendering performance
- MUST limit notifications to 50 per user in database with auto-pruning
- MUST complete all client-side filter/sort/search operations in under 100ms
- MUST use optimistic UI updates for perceived performance during backend API calls

### Business Constraints

- MUST complete all 5 implementation phases sequentially
- MUST test each phase before proceeding to next phase
- MUST use specified subagents for appropriate task domains
- MUST follow design system specifications exactly (colors, sizing, spacing)

### User Experience Constraints

- MUST display relative time in human-readable format (no timestamps)
- MUST prevent duplicate tags on single task
- MUST limit tags to 5 per task to avoid visual clutter
- MUST use standard tag categories only (no custom tags)
- MUST show unread notification count prominently
- MUST persist user preferences (filters, sorts) across sessions

## Non-Functional Requirements *(optional)*

### Performance

- Search operations: < 300ms response time
- Filter operations: < 100ms response time
- Sort operations: < 100ms response time
- Notification dropdown render: < 200ms
- Temporal evaluation: Complete within 5 seconds every 60-second cycle
- UI interactions: < 50ms response time for immediate feedback

### Scalability

- Support up to 1000 tasks without performance degradation
- Support up to 50 concurrent notifications
- Support up to 500 search results (limited to top 50 displayed)

### Reliability

- Zero data loss on browser refresh or unexpected closure
- Automatic recovery from localStorage corruption
- Graceful degradation when localStorage quota exceeded

### Usability

- Intuitive filter chip removal (single click)
- Visual feedback for all user actions (loading states, success/error indicators)
- Consistent keyboard shortcuts for power users
- Clear empty states for zero tasks, zero notifications, zero search results

### Maintainability

- Modular skill architecture allowing independent updates
- Clear separation between task-organization, task-intelligence, notification-experience, and frontend-experience concerns
- Consistent naming conventions across all components
- Comprehensive inline documentation for skill engines

## Security & Privacy *(optional)*

### Data Security

- All task and notification data stored in PostgreSQL database with user isolation via user_id foreign keys
- All API requests authenticated via JWT tokens (existing auth system)
- No sensitive data collection beyond task content provided by user
- Database credentials managed via environment variables (never committed to repository)
- HTTPS enforced for all API communications
- SQL injection prevented via SQLAlchemy ORM parameterized queries
- No telemetry or analytics tracking without explicit user consent

### Privacy

- User data isolated per user_id (no cross-user data access)
- No user tracking or behavioral analytics
- No third-party data sharing
- Session cookies httpOnly and secure flags enabled
- User data accessible only to authenticated user via JWT validation

## Testing Strategy *(optional)*

### Backend API Testing

- Test database migration: verify new columns (priority, tags, due_date, status) added successfully
- Test priority classification: POST /tasks with various titles/due dates, verify server calculates correct priority
- Test tag validation: POST /tasks with invalid tags (>5, duplicates, non-standard), verify 400 errors
- Test task CRUD via API: GET, POST, PUT, DELETE /tasks endpoints with JWT authentication
- Test notification endpoints: GET /notifications, PATCH /notifications/:id/read
- Test history integration: mark task complete, verify history entry created
- Test user isolation: verify users can only access their own tasks/notifications
- Test cascade deletes: delete task, verify associated notifications deleted

### Phase 1 Testing: Core Task Management

- Frontend: Create tasks via form, verify backend API calls made correctly
- Verify visual styling for all 4 priority levels returned from backend
- Test tag validation on client and server side (max 5 tags, no duplicates)
- Verify tag autocomplete shows only 7 standard categories
- Test optimistic UI updates during backend API calls
- Test error handling when backend API unavailable

### Phase 2 Testing: Search, Filter, and Sort

- Create 25+ tasks with diverse content
- Test search with keywords in title, description, and tags
- Verify relevance ranking (title > description > tags)
- Test 300ms debounce on search input
- Apply multiple filters simultaneously, verify cumulative AND logic
- Test filter chip removal
- Verify filter persistence in localStorage
- Test all 4 sort options with ascending/descending toggles
- Verify stable sorting with tie-breaking rules

### Phase 3 Testing: Temporal Intelligence

- Create tasks with due dates: past, within 6 hours, within 24 hours, next week
- Verify overdue detection
- Verify urgent task detection (within 6 hours)
- Verify relative time displays ("in 2 hours", "3 days ago")
- Verify temporal evaluation loop runs every 60 seconds
- Test VERY IMPORTANT notification triggering
- Verify 10-minute repeat interval
- Test duplicate prevention within 10-minute window
- Verify notification stops when task completed or due time passed

### Phase 4 Testing: Notification System

- Trigger multiple notifications with VERY IMPORTANT tasks
- Verify localStorage storage with correct schema
- Test getUnread(), getAll(), markAsRead(id) methods
- Verify 50-notification limit with automatic pruning
- Delete tasks and verify associated notifications removed
- Test notification dropdown rendering (320px × max 400px)
- Verify purple theme for VERY IMPORTANT notifications
- Test mark-as-read interaction
- Verify empty state display

### Phase 5 Testing: Visual Polish

- Audit all priority badges: 4px border radius, 2px 8px padding, 600 font weight, 12px font size
- Audit tag chips: 16px border radius, subtle backgrounds, contrasting text
- Test bell icon pulse animation (2-second purple glow)
- Verify hover states on all interactive elements
- Test color consistency: #8B5CF6, #EF4444, #F59E0B, #6B7280
- Test responsive behavior on mobile, tablet, desktop screen sizes
- Verify typography consistency
- Test spacing consistency (padding, margins)

## Open Questions

None. All requirements are specified with reasonable defaults where details were not provided.

## Revision History

- **2025-12-17**: MAJOR UPDATE - Corrected architecture to backend-first approach
  - Added CRITICAL ARCHITECTURE NOTE section clarifying backend integration requirements
  - Updated all functional requirements to reflect PostgreSQL persistence (not localStorage)
  - Updated notification storage to use backend API and database
  - Added MANDATORY SUBAGENT ARCHITECTURE section with 5 required subagents
  - Corrected Edge Cases, In Scope, Out of Scope, Assumptions, Constraints, and Security sections
  - Added Backend API Testing section
  - Maintained backward compatibility with existing history integration
- **2025-12-16**: Initial specification created (localStorage-only, needs correction)
