# Feature Specification: Recurring Reminder System

**Feature Branch**: `012-recurring-reminders`
**Created**: 2026-01-10
**Status**: Draft
**Input**: User description: "🔁 Recurring Reminder System - Build an automated background reminder engine that monitors ONLY VERY_IMPORTANT tasks and sends progressively urgent notifications as deadlines approach. Runs 24/7 without user interaction. Never spams. Never duplicates. Stops instantly when task is completed."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Progressive Deadline Alerts (Priority: P1)

As a user who creates VERY_IMPORTANT tasks with deadlines, I want to receive multiple reminders as the deadline approaches so that I never forget critical tasks even if I'm busy when the first reminder arrives.

**Why this priority**: This is the core value proposition - preventing users from missing critical deadlines through progressive escalation. Without this, the feature has no purpose.

**Independent Test**: Can be fully tested by creating a single VERY_IMPORTANT task due in 7 hours and verifying that 5 notifications are received at the correct intervals (6h, 3h, 1h, 30m, 15m). Delivers immediate value by protecting users from forgetting one critical task.

**Acceptance Scenarios**:

1. **Given** I create a VERY_IMPORTANT task due in 8 hours, **When** 6 hours remain until the deadline, **Then** I receive a notification "⏰ Task '[title]' due in 6 hours"
2. **Given** I received the 6-hour reminder, **When** 3 hours remain until the deadline, **Then** I receive a notification "⚠️ Task '[title]' due in 3 hours"
3. **Given** I received the 3-hour reminder, **When** 1 hour remains until the deadline, **Then** I receive a notification "🚨 URGENT: Task '[title]' due in 1 hour"
4. **Given** I received the 1-hour reminder, **When** 30 minutes remain until the deadline, **Then** I receive a notification "🔴 CRITICAL: Task '[title]' due in 30 minutes"
5. **Given** I received the 30-minute reminder, **When** 15 minutes remain until the deadline, **Then** I receive a notification "🚨🚨 FINAL WARNING: Task '[title]' due in 15 minutes!"
6. **Given** I have received any reminder notification, **When** I read or dismiss it, **Then** future reminders continue to be sent (reading does not stop the reminder sequence)

---

### User Story 2 - Automatic Reminder Lifecycle (Priority: P1)

As a user managing multiple VERY_IMPORTANT tasks, I want the reminder system to automatically start monitoring new tasks and stop monitoring completed tasks without any manual configuration so that I never have to think about enabling or disabling reminders.

**Why this priority**: Automation is essential for a "set it and forget it" experience. Manual configuration would defeat the purpose of preventing forgetfulness.

**Independent Test**: Can be fully tested by creating a VERY_IMPORTANT task, receiving one reminder, completing the task, and verifying no further reminders arrive. Delivers value by preventing notification spam for completed work.

**Acceptance Scenarios**:

1. **Given** I create a new VERY_IMPORTANT task with a due date within 6 hours, **When** the background job runs (within 10 minutes), **Then** the task is automatically included in reminder monitoring
2. **Given** I am receiving reminders for a VERY_IMPORTANT task, **When** I mark the task as COMPLETED, **Then** all future reminders for that task immediately stop
3. **Given** I complete a task before receiving any reminders, **When** the background job checks for upcoming deadlines, **Then** no reminders are created for the completed task
4. **Given** I have multiple VERY_IMPORTANT tasks with different deadlines, **When** the background job runs, **Then** reminders are correctly scheduled for each task independently

---

### User Story 3 - Zero Duplicate Notifications (Priority: P1)

As a user receiving critical reminders, I want each reminder threshold (6h, 3h, 1h, 30m, 15m) to trigger exactly once per task so that I'm not overwhelmed with duplicate notifications that reduce the urgency signal.

**Why this priority**: Duplicate notifications create alert fatigue and train users to ignore notifications. This is critical for maintaining the effectiveness of the reminder system.

**Independent Test**: Can be fully tested by creating a VERY_IMPORTANT task and verifying that over multiple background job runs (every 10 minutes), each of the 5 threshold notifications is created exactly once. Delivers value by maintaining high signal-to-noise ratio.

**Acceptance Scenarios**:

1. **Given** a VERY_IMPORTANT task has 6 hours until deadline, **When** the background job runs multiple times within the 6-hour threshold window (5.83h - 6h), **Then** only one "6 hours" notification is created
2. **Given** a notification has been created for a specific threshold (e.g., "3 hours"), **When** the background job checks the same task again, **Then** the system detects the existing notification and skips creating a duplicate
3. **Given** a task receives all 5 reminders (6h, 3h, 1h, 30m, 15m), **When** I count the total notifications for that task, **Then** exactly 5 notifications exist (no duplicates)

---

### User Story 4 - Overdue Task Notifications (Priority: P2)

As a user who may miss deadlines despite reminders, I want to be notified when a VERY_IMPORTANT task becomes overdue so that I can take corrective action or communicate delays to stakeholders.

**Why this priority**: This extends the reminder system's value beyond prevention to also handling the failure case. Lower priority than core reminders because it addresses edge cases rather than the primary workflow.

**Independent Test**: Can be fully tested by creating a VERY_IMPORTANT task with a due date 10 minutes in the future, waiting for it to become overdue, and verifying an overdue notification is created. Delivers value by ensuring even missed deadlines are visible.

**Acceptance Scenarios**:

1. **Given** a VERY_IMPORTANT task has passed its due date, **When** the background job runs, **Then** a notification "❌ OVERDUE: Task '[title]' is now overdue!" is created
2. **Given** a task is overdue and the overdue notification exists, **When** the background job runs again, **Then** no duplicate overdue notifications are created (same duplicate prevention logic)
3. **Given** I complete an overdue task, **When** the background job runs, **Then** no further overdue notifications are created

---

### User Story 5 - System Resilience Across Restarts (Priority: P2)

As a system administrator or user relying on critical reminders, I want the reminder system to automatically resume monitoring all VERY_IMPORTANT tasks after a server restart so that reminders continue without manual intervention.

**Why this priority**: System reliability is important but secondary to core functionality. Most systems run continuously in production, making restarts infrequent.

**Independent Test**: Can be fully tested by creating a VERY_IMPORTANT task, stopping the backend server, restarting it, and verifying reminders resume correctly. Delivers value by ensuring high availability.

**Acceptance Scenarios**:

1. **Given** the backend server is restarted, **When** the application initializes, **Then** the background scheduler automatically starts
2. **Given** VERY_IMPORTANT tasks exist in the database with future deadlines, **When** the background scheduler starts after a restart, **Then** it immediately checks all tasks and creates any overdue reminders
3. **Given** a reminder was scheduled before a restart, **When** the system comes back online, **Then** the reminder is sent at the correct threshold (no reminders are lost)

---

### Edge Cases

- **What happens when a task is created after the 6-hour mark but before 3 hours?** The first reminder will be sent at the next applicable threshold (3h, not 6h). Users will not receive reminders for thresholds that have already passed.

- **What happens when the background job is delayed or skipped?** The system uses threshold windows (e.g., 5.83h - 6h for the 6-hour reminder) to ensure reminders are sent even if the job runs slightly early or late. If a job is skipped entirely, the next run will catch overdue thresholds.

- **What happens when a user reads a notification?** Reading or dismissing a notification does NOT stop future reminders. The reminder sequence continues independently of user interaction with the notification UI.

- **What happens when clock drift occurs across servers?** All time calculations use UTC (timezone.utc) to ensure consistency across distributed systems. Deadlines and reminder thresholds are calculated using UTC, eliminating timezone-related bugs.

- **What happens when a task's due date is changed?** If a task's due date is updated, the system recalculates the time until deadline on the next background job run and creates appropriate reminders based on the new due date. Previously sent reminders remain in the notification history.

- **What happens when multiple tasks reach the same threshold simultaneously?** The background job processes all tasks independently in a single run, creating all necessary reminders. The frontend notification system displays them sequentially (one modal at a time) with the unread count showing the total.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST run a background job every 10 minutes (configurable via CHECK_INTERVAL) that queries all VERY_IMPORTANT tasks with due dates
- **FR-002**: System MUST calculate time remaining until each task's due date using UTC timezone
- **FR-003**: System MUST create notifications at exactly these thresholds: 6 hours, 3 hours, 1 hour, 30 minutes, 15 minutes before due date
- **FR-004**: System MUST include escalating urgency indicators in notification messages (⏰, ⚠️, 🚨, 🔴, 🚨🚨)
- **FR-005**: System MUST prevent duplicate notifications by checking for existing notifications with identical task_id and message before creating new ones
- **FR-006**: System MUST immediately stop creating reminders for tasks when their status changes to COMPLETED
- **FR-007**: System MUST NOT create reminders for tasks with priority other than VERY_IMPORTANT
- **FR-008**: System MUST NOT create reminders for tasks without a due date
- **FR-009**: System MUST create overdue notifications when ENABLE_OVERDUE configuration is true and a VERY_IMPORTANT task passes its due date
- **FR-010**: System MUST automatically start the background scheduler on application startup without manual intervention
- **FR-011**: System MUST wrap all scheduler operations in try/catch blocks to prevent crashes from propagating
- **FR-012**: System MUST log every notification creation event for debugging and audit purposes
- **FR-013**: System MUST use threshold windows (e.g., 5.83h - 6h) to account for the 10-minute job interval and ensure reminders are sent
- **FR-014**: System MUST auto-delete notifications older than 48 hours (configurable) to prevent unbounded database growth
- **FR-015**: System MUST persist reminder state in the database (not in memory) to survive server restarts

### Key Entities

- **Background Scheduler**: Coordinates the execution of the reminder checking job every 10 minutes. Starts on application startup and runs continuously until shutdown.

- **Reminder Check Job**: The recurring task that queries all VERY_IMPORTANT tasks, calculates time until deadline, determines which notifications to create, and enforces duplicate prevention logic.

- **Notification Threshold**: Represents a specific time interval before a deadline (6h, 3h, 1h, 30m, 15m) along with its associated message template, emoji, and urgency level.

- **Reminder State**: The collection of all notifications created for a task, used to determine which thresholds have already been triggered and prevent duplicates.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users receive exactly 5 reminder notifications per VERY_IMPORTANT task (6h, 3h, 1h, 30m, 15m) with zero duplicates
- **SC-002**: Reminders are delivered within 10 minutes of reaching each threshold (6h ± 10min, 3h ± 10min, etc.)
- **SC-003**: Completing a task stops all future reminders within 10 minutes (next background job run)
- **SC-004**: The system processes 1,000 VERY_IMPORTANT tasks in under 2 seconds per background job run
- **SC-005**: Notifications persist in the database and remain accessible for 48 hours before auto-deletion
- **SC-006**: The background scheduler resumes automatically within 5 seconds of application restart with zero manual intervention
- **SC-007**: Users cannot trigger duplicate notifications through any sequence of actions (creating, editing, or deleting tasks)
- **SC-008**: 100% of VERY_IMPORTANT tasks with due dates are monitored by the reminder system without user configuration
- **SC-009**: The system logs all reminder creation events with sufficient detail for debugging (task_id, threshold, timestamp)
- **SC-010**: Overdue notifications are created within 10 minutes of a task passing its due date (when ENABLE_OVERDUE=true)

## Assumptions *(derived from user input)*

- **Background Job Frequency**: The system runs checks every 10 minutes by default (CHECK_INTERVAL=10m). This is a reasonable balance between reminder timeliness and system resource usage.

- **Notification Retention**: Notifications are auto-deleted after 48 hours to prevent unbounded database growth while preserving recent history for debugging and user review.

- **Overdue Notifications Enabled**: The ENABLE_OVERDUE configuration flag defaults to true, providing value for users who miss deadlines.

- **UTC Timezone**: All time calculations use UTC to ensure consistency across distributed systems and avoid timezone-related bugs.

- **Threshold Windows**: Each reminder threshold uses a window (e.g., 5.83h - 6h for 6-hour reminder) to account for the 10-minute job interval. This ensures reminders are sent even if the job runs slightly early or late.

- **No Retroactive Reminders**: If a task is created after a threshold has passed (e.g., created 4 hours before deadline), only the remaining thresholds (3h, 1h, 30m, 15m) will trigger notifications. Past thresholds are not retroactively sent.

- **Priority Filtering**: Only tasks with priority=VERY_IMPORTANT receive reminders. This is an explicit design decision to avoid notification fatigue and maintain high signal-to-noise ratio.

- **Completion Takes Precedence**: When a task is marked COMPLETED, all future reminders immediately stop. This takes precedence over any scheduled reminders.

- **Frontend Integration**: The existing notification polling system (30-second intervals) will automatically detect and display reminders created by the background job. No changes to the frontend notification UI are required.

- **Database Cascade Deletes**: When a task is deleted, all associated notifications are automatically deleted via CASCADE foreign key constraints, preventing orphaned reminders.

## Configuration *(expected environment variables)*

- **CHECK_INTERVAL**: Background job frequency (default: 10m). Format: duration string (e.g., "5m", "15m", "1h")
- **ENABLE_OVERDUE**: Whether to create notifications for overdue tasks (default: true). Values: true | false
- **NOTIFICATION_RETENTION_HOURS**: Hours before auto-deleting old notifications (default: 48). Values: positive integer

## Out of Scope

- **Custom Reminder Schedules**: Users cannot customize which thresholds to receive or create their own reminder schedules. The 5 thresholds (6h, 3h, 1h, 30m, 15m) are fixed.
- **Snooze Functionality**: Users cannot snooze or postpone reminders. Each reminder is sent exactly once at its designated threshold.
- **Email/SMS Notifications**: This feature only creates in-app notifications. Email or SMS delivery is out of scope.
- **Reminder Priorities**: All reminders for VERY_IMPORTANT tasks are treated equally. There is no sub-prioritization within reminder notifications.
- **Time Zone Customization**: All calculations use UTC. User-specific timezone preferences for reminder display are out of scope.
- **Historical Reminder Analytics**: No analytics or reporting on reminder effectiveness, completion rates after reminders, etc.

## Dependencies

- **Existing Notification System**: Requires the notification API, models, services, and frontend polling system implemented in the current phase.
- **Database**: Requires PostgreSQL with the Task and Notification tables already defined.
- **Background Job Library**: Requires APScheduler (Python) or equivalent background job scheduler library to be installed.
- **UTC Time Support**: Requires Python datetime with timezone support (datetime.timezone.utc).

## Security & Privacy

- **User Isolation**: Reminders MUST only be created for tasks belonging to the authenticated user (enforced via user_id foreign key and service-layer checks).
- **No PII in Logs**: Logging MUST NOT include sensitive task details (titles, descriptions). Only log task_id, user_id, and threshold information.
- **Database Security**: Notification records MUST be protected by the same authentication and authorization mechanisms as tasks (JWT validation).
- **No Public Access**: Reminder creation and management MUST only be accessible to the authenticated user who owns the task.

## Monitoring & Observability

- **Job Execution Logs**: Every background job run MUST log: start time, number of tasks checked, number of notifications created, execution duration.
- **Error Logs**: Any exceptions during reminder creation MUST be logged with full stack trace and context (task_id, threshold, error message).
- **Duplicate Prevention Logs**: When a duplicate notification is prevented, log the event: "Skipped duplicate notification for task {task_id} at threshold {threshold}".
- **Completion Logs**: When a task is marked COMPLETED and future reminders are stopped, log: "Stopped future reminders for completed task {task_id}".
