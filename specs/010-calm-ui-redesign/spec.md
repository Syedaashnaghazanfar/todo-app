# Feature Specification: Calm UI Redesign - Phase 3 Todo App

**Feature Branch**: `010-calm-ui-redesign`
**Created**: 2025-12-30
**Status**: Draft
**Input**: User description: Build a calm, modern, and daily-usable productivity interface for a Phase 3 Todo application.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Dashboard-First Experience (Priority: P1)

As a logged-in user, I want to see a calm, welcoming dashboard that shows me what needs my attention now, so that I can start my day focused on important tasks without feeling overwhelmed.

**Why this priority**: The dashboard is the entry point for all authenticated users. It must deliver immediate value by surfacing urgent/important tasks and providing a sense of progress. Without this, users cannot orient themselves quickly.

**Independent Test**: Can be fully tested by logging in and immediately seeing: a personalized greeting with user's name, current date, task counts (due today, overdue, completed), a progress visualization (donut chart), and quick access to important/upcoming tasks. Delivers immediate user value upon login.

**Acceptance Scenarios**:

1. **Given** a user is logged in, **When** they arrive at the home page, **Then** they see "Welcome back, {user's name}" with the current date displayed prominently.
2. **Given** a user views the dashboard, **When** they see the stats section, **Then** it displays: tasks due today (count), overdue tasks (count), completed tasks (count), and total tasks (count) - each with a relevant icon.
3. **Given** a user views the dashboard, **When** they see the progress section, **Then** they see a donut chart showing completion distribution (completed vs pending vs overdue) with a percentage display.
4. **Given** a user views the dashboard, **When** they scroll down, **Then** they see "Important Tasks" section with up to 5 tasks marked as important or high priority.
5. **Given** a user views the dashboard, **When** they scroll further, **Then** they see "Due Soon" section with up to 5 tasks sorted by due date.
6. **Given** a user views the dashboard, **When** they complete a task from the dashboard, **Then** the progress chart updates and the task gets subtle strikethrough animation.

---

### User Story 2 - Clean Task Management Interface (Priority: P1)

As a task manager, I want a clean, scannable task list with sidebar filtering and hover-revealed actions, so that I can focus on my tasks without visual clutter.

**Why this priority**: The tasks page is the core productivity surface where users spend most of their time. It must enable rapid task scanning and action without distraction.

**Independent Test**: Can be fully tested by opening the tasks page and performing: viewing tasks, filtering by project/priority/date/tag, creating a new task, completing a task, editing a task, deleting a task. Delivers core app value.

**Acceptance Scenarios**:

1. **Given** a user is on the tasks page, **When** they view the sidebar, **Then** they see collapsible sections for: Projects, Priority, Due Date, and Tags - each showing available filter options.
2. **Given** a user views the task list, **When** they see a task card, **Then** it displays: checkbox, task title, due date (if present), priority badge (subtle), and tags (with icons for category tags only).
3. **Given** a user hovers over a task card, **When** the hover state activates, **Then** Edit and Delete buttons appear on the right side of the card.
4. **Given** a user clicks a task checkbox, **When** the task completes, **Then** there is a satisfying spring animation on the checkbox and the task title gets a subtle strikethrough.
5. **Given** a user clicks "New Task", **When** the modal opens, **Then** it has a clean form with title, description, due date, priority selector, and tag selector.
6. **Given** a user creates a task with tag "Learning", **When** the task appears in the list, **Then** the tag displays with a book icon next to it.

---

### User Story 3 - Light/Dark Theme Toggle (Priority: P1)

As a user who prefers different lighting conditions, I want a working light/dark theme toggle that persists, so that I can use the app comfortably in any environment.

**Why this priority**: Theme preference is fundamental to user comfort. Both themes must be intentionally designed and fully functional. This affects every page and interaction.

**Independent Test**: Can be fully tested by: toggling theme from dark to light and back, verifying no pure black/white backgrounds, confirming theme persists after page reload, and verifying smooth transition without flash.

**Acceptance Scenarios**:

1. **Given** a user is on any page, **When** they click the theme toggle icon, **Then** the theme switches smoothly (no flash) between dark and light modes.
2. **Given** a user switches themes, **When** they reload the page, **Then** their preferred theme persists (saved to localStorage).
3. **Given** a user views the dark theme, **When** they examine backgrounds, **Then** no background is pure black (#000000 or #030014); all use rich dark colors (e.g., #0F1117, #1A1D2E).
4. **Given** a user views the light theme, **When** they examine backgrounds, **Then** no background is pure white; all use soft off-whites (e.g., #F8FAFC, #F1F5F9).
5. **Given** a user has system preference set, **When** they first visit the app, **Then** the theme automatically matches their system preference.

---

### User Story 4 - Tag Icon System (Priority: P2)

As a task organizer, I want meaningful category tags to display icons while generic tags remain text-only, so that I can quickly scan task categories without icon overload.

**Why this priority**: Icons enhance recognition for common categories but would create noise for custom tags. This balances visual clarity with utility.

**Independent Test**: Can be fully tested by: creating tasks with category tags (Work, Learning, Health, Finance, Urgent) and custom tags, verifying category tags show icons, verifying custom tags show no icons.

**Acceptance Scenarios**:

1. **Given** a user creates a task with tag "Work", **When** the task appears in the list, **Then** the tag displays with a briefcase icon.
2. **Given** a user creates a task with tag "Learning", **When** the task appears in the list, **Then** the tag displays with a book icon.
3. **Given** a user creates a task with tag "Health", **When** the task appears in the list, **Then** the tag displays with a heart icon.
4. **Given** a user creates a task with tag "Finance", **When** the task appears in the list, **Then** the tag displays with a dollar sign icon.
5. **Given** a user creates a task with tag "Urgent", **When** the task appears in the list, **Then** the tag displays with an alert triangle icon.
6. **Given** a user creates a task with a custom tag like "ProjectAlpha", **When** the task appears in the list, **Then** the tag displays as text only (no icon).

---

### User Story 5 - Analytics Visualization (Priority: P2)

As a productivity-conscious user, I want to see my task analytics presented calmly without overwhelming charts, so that I can understand my progress at a glance.

**Why this priority**: Analytics provide value but must not dominate. They should be present but optional in focus.

**Independent Test**: Can be fully tested by: visiting the analytics page, viewing stats overview (4 metric cards), viewing weekly bar chart, viewing completion donut chart, toggling between weekly/monthly views.

**Acceptance Scenarios**:

1. **Given** a user visits the analytics page, **When** they view the top section, **Then** they see 4 metric cards: Total Tasks, Completed, Pending, This Week - each with an icon and count.
2. **Given** a user views the charts section, **When** they see the bar chart, **Then** it shows weekly activity (tasks created vs completed per day) with calm, muted colors.
3. **Given** a user views the charts section, **When** they see the donut chart, **Then** it shows completion rate with a clear percentage in the center.
4. **Given** a user is on analytics, **When** they toggle between weekly/monthly, **Then** the charts update to show the selected time period.
5. **Given** a user prefers minimal views, **When** they collapse the charts section, **Then** only stats cards remain visible.

---

### User Story 6 - Notification Management (Priority: P2)

As a busy user, I want a clear, readable notification feed with priority awareness, so that I can quickly see what needs my attention.

**Why this priority**: Notifications inform users of time-sensitive matters. They must be scannable without unnecessary animation.

**Independent Test**: Can be fully tested by: viewing notifications page, distinguishing read vs unread, filtering by all/unread/read, marking notifications as read.

**Acceptance Scenarios**:

1. **Given** a user visits the notifications page, **When** they see the list, **Then** unread notifications have a visual indicator (dot or background highlight).
2. **Given** a user views notifications, **When** they click a notification, **Then** it marks as read and the unread indicator disappears.
3. **Given** a user has unread notifications, **When** they click "Mark all as read", **Then** all notifications become read.
4. **Given** a user wants to filter, **When** they use the filter tabs, **Then** they can view All, Unread, or Read notifications.
5. **Given** a user views notifications, **When** they see priority notifications, **Then** urgent/important notifications have subtle color accent (e.g., red tint for very important).

---

### User Story 7 - History Timeline (Priority: P3)

As a reflective user, I want to see my task activity history in a timeline format, so that I can track what I've accomplished over time.

**Why this priority**: History provides insight but is less frequently accessed than tasks or dashboard. Nice to have with clear organization.

**Independent Test**: Can be fully tested by: viewing history page, seeing activities grouped by date, collapsing/expanding date groups, deleting individual history entries.

**Acceptance Scenarios**:

1. **Given** a user visits the history page, **When** they see the timeline, **Then** activities are grouped by date (Today, Yesterday, Last Week, etc.).
2. **Given** a user views a date group, **When** they click the collapse icon, **Then** the group closes and shows only the date header with item count.
3. **Given** a user views history entries, **When** they see the entry types, **Then** each entry has a type indicator: Created (green), Completed (blue), Updated (amber), Deleted (red).
4. **Given** a user wants to remove history, **When** they hover over an entry and click delete, **Then** the entry is removed with a smooth animation.

---

### User Story 8 - Settings Management (Priority: P3)

As a user who wants control over my experience, I want a simple settings page to manage appearance, account, and data, so that I can customize my app experience.

**Why this priority**: Settings are accessed infrequently but must be clear and structured when needed. Supports user autonomy.

**Independent Test**: Can be fully tested by: viewing settings page, toggling theme, changing layout preferences, clearing history, logging out.

**Acceptance Scenarios**:

1. **Given** a user visits settings, **When** they see the page, **Then** it has clear sections: Appearance, Account, Data, Session.
2. **Given** a user is in Appearance, **When** they toggle theme, **Then** the theme changes immediately.
3. **Given** a user is in Account, **When** they click "Change Password", **Then** a modal opens for password change.
4. **Given** a user is in Data, **When** they click "Clear History", **Then** a confirmation dialog appears before deletion.
5. **Given** a user is in Session, **When** they click "Logout", **Then** a confirmation dialog appears and they are logged out on confirmation.

---

### User Story 9 - Focused Chat Interface (Priority: P3)

As a user who uses the AI chat assistant, I want a calm, readable chat interface with minimal distraction, so that I can focus on my conversation.

**Why this priority**: Chat is a specialized feature for AI assistance. It should feel distinct but consistent with overall calm aesthetic.

**Independent Test**: Can be fully tested by: opening chat page, sending a message, receiving response, seeing typing indicator.

**Acceptance Scenarios**:

1. **Given** a user visits the chat page, **When** they see the interface, **Then** it uses the per-page accent color (violet) for the chat header and send button.
2. **Given** a user sends a message, **When** they wait for response, **Then** they see a subtle typing indicator.
3. **Given** a user reads chat messages, **When** they view the conversation, **Then** user messages are on the right (accent color), assistant messages on the left (neutral color).
4. **Given** a user wants to clear conversation, **When** they click clear, **Then** the chat history is cleared with confirmation.

---

### User Story 10 - Authentication Pages Redesign (Priority: P2)

As a new or returning user, I want calm, welcoming login/signup pages with glassmorphic design, so that I feel the app's calm personality from my first interaction.

**Why this priority**: Auth pages are the app's first impression. They must reflect the calm, modern aesthetic.

**Independent Test**: Can be fully tested by: viewing login page, viewing signup page, submitting form, switching between pages.

**Acceptance Scenarios**:

1. **Given** a user visits login or signup, **When** they see the page, **Then** there's a centered glassmorphic card on a subtle animated gradient background.
2. **Given** a user fills the form, **When** they submit, **Then** there's a smooth loading state and transition on success.
3. **Given** a user is on login, **When** they click "Sign up" link, **Then** there's a smooth transition to the signup page.
4. **Given** a user is on signup, **When** they click "Sign in" link, **Then** there's a smooth transition to the login page.

---

### Edge Cases

- **No tasks exist**: Dashboard shows empty state with encouraging message and "Create your first task" button.
- **All tasks completed**: Dashboard shows celebration state with "All caught up!" message.
- **Many overdue tasks**: Dashboard shows overdue count prominently but not alarmingly.
- **No notifications**: Notifications page shows empty state with helpful message.
- **No history**: History page shows empty state explaining what gets tracked.
- **Slow network**: Loading states use consistent spinners; content gracefully appears when ready.
- **Reduced motion preference**: Animations respect system reduced-motion setting.
- **Mobile view**: Sidebar becomes drawer; dashboard stats stack vertically; touch targets remain large.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The UI MUST dynamically consume user data from the existing authenticated backend (user profile, tasks, stats, analytics, notifications).
- **FR-002**: The UI MUST NOT hardcode any user-specific data, names, or analytics values.
- **FR-003**: The UI MUST NOT modify backend code, API endpoints, database schemas, or authentication logic.
- **FR-004**: The dashboard MUST display a personalized greeting with the logged-in user's name.
- **FR-005**: The dashboard MUST show task counts for: due today, overdue, completed, and total.
- **FR-006**: The dashboard MUST display a progress visualization (donut chart) showing completion distribution.
- **FR-007**: The dashboard MUST display two task sections: "Important Tasks" and "Due Soon" with up to 5 tasks each.
- **FR-008**: The tasks page MUST have a collapsible sidebar with filter sections for: Projects, Priority, Due Date, and Tags.
- **FR-009**: The tasks page MUST display task cards with: checkbox, title, due date, priority badge, and tags.
- **FR-010**: The tasks page MUST reveal Edit and Delete actions only on hover.
- **FR-011**: Task completion MUST trigger a satisfying spring animation on the checkbox.
- **FR-012**: The UI MUST support light and dark themes that are intentionally designed (not auto-inverted).
- **FR-013**: The UI MUST NOT use pure black (#000000 or #030014) or pure white (#FFFFFF) for backgrounds.
- **FR-014**: Theme preference MUST persist across sessions using localStorage.
- **FR-015**: Theme transitions MUST be smooth without visual flash.
- **FR-016**: Each page MUST use a single accent color applied consistently to interactive elements and highlights.
- **FR-017**: Tags MUST display icons only for meaningful category tags: Work, Learning, Health, Finance, Urgent.
- **FR-018**: Custom or generic tags MUST display as text only (no icons).
- **FR-019**: Tag icons MUST be: Work = Briefcase, Learning = Book, Health = Heart, Finance = Dollar, Urgent = AlertTriangle.
- **FR-020**: All animations MUST be physics-based (spring-like) and used for confirmation, not distraction.
- **FR-021**: The UI MUST respect the `prefers-reduced-motion` system setting.
- **FR-022**: Analytics page MUST display 4 metric cards with icons and counts.
- **FR-023**: Analytics page MUST show weekly activity bar chart and completion donut chart.
- **FR-024**: Analytics page MUST have weekly/monthly view toggle.
- **FR-025**: Notifications page MUST display unread/read status with visual indicators.
- **FR-026**: Notifications page MUST support filtering by All/Unread/Read.
- **FR-027**: History page MUST group activities by date with collapsible sections.
- **FR-028**: History page MUST color-code entries by action type (Created, Completed, Updated, Deleted).
- **FR-029**: Settings page MUST have clear sections: Appearance, Account, Data, Session.
- **FR-030**: Chat page MUST use per-page accent color (violet) for consistent theming.
- **FR-031**: Login and Signup pages MUST use glassmorphic cards with subtle animated gradient backgrounds.
- **FR-032**: All colors MUST be driven by CSS design tokens (CSS custom properties).
- **FR-033**: The UI MUST use Lucide React icons consistently.

### Key Entities

- **User**: The authenticated user whose data is displayed. Attributes: id, name, email (from backend).
- **Task**: The core entity being managed. Attributes: id, title, description, status, priority, dueDate, tags (from backend).
- **Tag**: Category labels for tasks. Attributes: id, name, category (Work, Personal, Learning, etc.).
- **Notification**: System alerts for the user. Attributes: id, message, priority, readAt, createdAt (from backend).
- **HistoryEntry**: Audit trail of task actions. Attributes: id, action type, task title, timestamp (from backend).
- **AnalyticsStats**: Aggregated metrics. Attributes: total, completed, pending, thisWeek, etc. (from backend).
- **ThemePreference**: User's theme choice. Attributes: mode (light/dark), persisted (boolean).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can orient themselves within 3 seconds of seeing the dashboard (greeting visible, stats scannable, important tasks visible).
- **SC-002**: 95% of users can complete a task creation flow without assistance (clear form, intuitive actions).
- **SC-003**: Theme toggle works instantly with smooth transition (under 300ms) and persists after page reload.
- **SC-004**: Task list renders with all visible elements (checkbox, title, due date, tags) within 500ms of data load.
- **SC-005**: Checkbox completion animation completes within 300ms with satisfying spring feel.
- **SC-006**: Both light and dark themes use intentional colors (no pure black/white) and pass WCAG AA contrast requirements.
- **SC-007**: Category tags show icons while custom tags show only text, verified by visual inspection.
- **SC-008**: All animations respect `prefers-reduced-motion` setting (no animation when enabled).
- **SC-009**: The interface feels calm and uncluttered, with no visual noise or overwhelming decoration (qualitative user feedback).
- **SC-010**: Users can find any primary action (create task, view analytics, change theme) within 2 clicks from any page.

## Assumptions

The following assumptions were made to fill gaps in the specification:

- **A-001**: The existing backend API provides all required data endpoints (user profile, tasks with filters, stats, analytics, notifications, history). No new endpoints needed.
- **A-002**: Lucide React is the preferred icon library (widely used, consistent style, good TypeScript support).
- **A-003**: CSS custom properties (CSS variables) will be used for all design tokens to enable easy theming.
- **A-004**: Framer Motion or CSS animations with spring timing functions will be used for physics-based animations.
- **A-005**: Tag categories map to icons as follows: Work → Briefcase, Learning → BookOpen, Health → Heart, Finance → DollarSign, Urgent → AlertTriangle.
- **A-006**: Dark theme uses rich dark colors: #0F1117 (primary), #1A1D2E (secondary), #242838 (tertiary).
- **A-007**: Light theme uses soft off-whites: #F8FAFC (primary), #F1F5F9 (secondary), #FFFFFF (tertiary).
- **A-008**: Per-page accent colors are: Dashboard = Purple, Tasks = Cyan, Analytics = Green, History = Amber, Notifications = Pink, Settings = Indigo, Chat = Violet.
- **A-009**: The existing component library (NeonButton, GlassCard, etc.) will be enhanced rather than replaced.
- **A-010**: Mobile responsiveness uses responsive breakpoints (mobile < 768px, tablet < 1024px, desktop ≥ 1024px).

## Out of Scope

- Backend API changes or new endpoints
- Database schema modifications
- Authentication logic changes
- Chat/AI backend functionality
- Real-time WebSocket updates for chat
- Push notifications
- Email or external integrations
- Performance optimization beyond UI animations
- Accessibility audit beyond basic requirements
- Internationalization/localization
