# Feature Specification: Backend Task Management Module

**Feature Branch**: `002-backend-task-management`
**Created**: 2025-12-11
**Status**: Draft
**Input**: Implement complete backend Task Management Module for Phase-2 with FastAPI, SQLAlchemy, Neon PostgreSQL, full CRUD operations, automatic history logging, analytics endpoints, and SweetAlert2 popup integration

## User Scenarios & Testing *(mandatory)*

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.
  
  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

### User Story 1 - Create New Task (Priority: P1)

A user needs to create a new task from the frontend application. The frontend sends a POST request with task title and optional description. The backend receives the request, validates the input, creates a new task record in the database, logs the action to the history table, and returns the created task with a success flag and popup trigger.

**Why this priority**: This is the core CRUD operation that enables task management. Without the ability to add tasks, no other functionality matters.

**Independent Test**: Task creation endpoint can be tested independently by making a POST request with valid title and verifying the task appears in the database with correct metadata and a history entry is created.

**Acceptance Scenarios**:

1. **Given** a user is on the frontend task creation form, **When** they enter title "Buy groceries" and submit, **Then** the API returns `success: true`, the task is saved with `is_completed: false`, a history entry is created with action "CREATED", and a `TASK_CREATED` popup is triggered on the frontend.
2. **Given** a user submits an empty title, **When** the POST request is made, **Then** the API returns `success: false` with a validation error message.
3. **Given** a user adds a task with description, **When** the task is created, **Then** the description is stored and returned in the response.

---

### User Story 2 - Mark Task Complete and Incomplete (Priority: P1)

A user needs to toggle task completion status. The backend provides PATCH endpoints to mark tasks as complete (setting is_completed=true, completed_at timestamp) or incomplete (setting is_completed=false, clearing completed_at). Actions are logged to history and appropriate popups are triggered.

**Why this priority**: Task completion is a core feature. Users need to track accomplishments and recover from mistakes.

**Independent Test**: Both endpoints can be tested independently by calling them on appropriate task states and verifying state changes, timestamp changes, and history logging.

**Acceptance Scenarios**:

1. **Given** an incomplete task, **When** PATCH `/tasks/{id}/complete` is called, **Then** `is_completed: true`, `completed_at` is set to current timestamp, history shows "COMPLETED", and `TASK_COMPLETED` popup is returned.
2. **Given** a completed task, **When** PATCH `/tasks/{id}/incomplete` is called, **Then** `is_completed: false`, `completed_at` is null, history shows "INCOMPLETED", and `TASK_INCOMPLETE` popup is returned.
3. **Given** a task is marked complete then incomplete, **When** task is retrieved, **Then** both history entries exist and task state is correct.

---

### User Story 3 - Edit Task Details (Priority: P1)

A user needs to update task title and description. The backend receives a PUT request with updated data, validates changes, updates the task record, logs to history with details of what changed, and returns the updated task with popup trigger.

**Why this priority**: Users need to fix typos, clarify descriptions, or update task scope. This is essential for task management accuracy.

**Independent Test**: Can be tested by updating a task's title/description and verifying changes are persisted, returned correctly, and a history entry is created with action "UPDATED".

**Acceptance Scenarios**:

1. **Given** a task with title "Buy groceries", **When** PUT `/tasks/{id}` is called with new title "Buy groceries and cook dinner", **Then** the task is updated, history logs the change, and `TASK_UPDATED` popup is returned.
2. **Given** a task is updated with only description changed, **When** the request is made, **Then** title remains unchanged and `updated_at` timestamp is updated.
3. **Given** an empty title is submitted for update, **When** the PUT request is made, **Then** validation fails and `success: false` is returned.

---

### User Story 4 - Delete Task (Priority: P1)

A user needs to remove tasks permanently. The backend receives a DELETE request, removes the task from the database, logs the deletion to history, and returns confirmation with popup trigger.

**Why this priority**: Users need cleanup and removal of unwanted tasks. This completes the CRUD cycle.

**Independent Test**: Can be tested by deleting a task and verifying it no longer appears in the task list and a history entry with action "DELETED" is created.

**Acceptance Scenarios**:

1. **Given** a task with id "123", **When** DELETE `/tasks/{id}` is called, **Then** the task is removed, `TASK_DELETED` popup is returned, and history logs the deletion.
2. **Given** a deleted task, **When** GET `/tasks/{id}` is called, **Then** task is not found (404 or empty response).
3. **Given** a non-existent task id, **When** DELETE is called, **Then** `success: false` is returned.

---

### User Story 5 - View Task List and Retrieve Tasks (Priority: P1)

A user needs to retrieve all their tasks to see a list on the dashboard. The backend provides a GET endpoint that returns all tasks with their current state and metadata. Tasks should be ordered logically and include all necessary information for the frontend to display them.

**Why this priority**: Users need to see their tasks to interact with them. This enables the dashboard view and task management features.

**Independent Test**: Task list endpoint can be tested by verifying that multiple created tasks are returned with correct data structure and proper ordering.

**Acceptance Scenarios**:

1. **Given** a user has 5 tasks, **When** GET `/tasks` is called, **Then** all 5 tasks are returned with complete metadata (id, title, description, is_completed, timestamps).
2. **Given** tasks with mixed completion states, **When** list is retrieved, **Then** incomplete tasks are listed before completed tasks.
3. **Given** no tasks exist, **When** list is requested, **Then** empty array is returned with `success: true`.

---

### User Story 6 - View Task History with Pagination (Priority: P2)

An admin or user needs to see a paginated log of all task actions (create, update, complete, etc.). The backend provides a GET endpoint returning paginated history entries with task id, action type, description, and timestamp.

**Why this priority**: History provides audit trail for debugging and insights. It's important for advanced users but not critical for basic task management.

**Independent Test**: Can be tested by creating multiple task events and requesting history with pagination, verifying all actions are logged correctly.

**Acceptance Scenarios**:

1. **Given** 20 task events exist, **When** GET `/history?page=1&limit=10` is called, **Then** exactly 10 items are returned with pagination metadata (total_count, total_pages, current_page).
2. **Given** a task was created, updated, and completed, **When** history is requested, **Then** three entries appear with correct action_type values.
3. **Given** history is requested, **When** returned, **Then** entries are sorted by timestamp descending (newest first).

---

### User Story 7 - View Weekly Dashboard Statistics (Priority: P2)

A user needs to see analytics about their task activity. The backend provides a GET endpoint returning metrics like tasks created this week, tasks completed this week, total completed, and total incomplete to populate the dashboard analytics widget.

**Why this priority**: Analytics provide insights and motivation but aren't essential for core task management.

**Independent Test**: Can be tested by creating and completing tasks with various timestamps and requesting weekly stats, verifying calculations are accurate.

**Acceptance Scenarios**:

1. **Given** a user has 15 total tasks with 10 completed and 5 incomplete, **When** GET `/stats/weekly` is called, **Then** response includes `total_completed: 10`, `total_incomplete: 5`, and weekly counts.
2. **Given** tasks created at different weeks, **When** weekly stats are requested, **Then** only current week's tasks are counted in weekly metrics.
3. **Given** no tasks exist, **When** stats are requested, **Then** all counts return 0 with `success: true`.

---

### Edge Cases

- What happens when a task is deleted but history still references it? (Foreign key relationship should be maintained or history entry should note deleted task)
- How does the system handle concurrent updates to the same task from multiple requests? (Database-level locking or optimistic concurrency control)
- What happens if the frontend requests a task with an invalid UUID format? (Validation error with clear message)
- How are deleted tasks handled in analytics? (Should they be excluded from all counts)
- What happens if database connection fails during an operation? (Graceful error response without partial state changes)
- How does the system handle very large task descriptions (> 5000 chars)? (Validation rejection with appropriate error)
- What happens if pagination parameters are invalid (negative limit, non-numeric page)? (Validation with sensible defaults)

## Requirements *(mandatory)*

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right functional requirements.
-->

### Functional Requirements

- **FR-001**: System MUST provide a POST `/tasks` endpoint accepting title (required, max 255 chars) and description (optional, max 5000 chars), validating input, creating task with `is_completed=false`, logging history entry with `action=CREATED`, returning created task with `success=true` and `popup=TASK_CREATED`
- **FR-002**: System MUST provide a GET `/tasks` endpoint returning all tasks with id, title, description, is_completed, created_at, updated_at, completed_at timestamps ordered with incomplete tasks first
- **FR-003**: System MUST provide a GET `/tasks/{id}` endpoint returning a specific task's complete details or 404 if not found
- **FR-004**: System MUST provide a PUT `/tasks/{id}` endpoint updating task title and/or description, validating input, logging history with `action=UPDATED`, returning updated task with `success=true` and `popup=TASK_UPDATED`
- **FR-005**: System MUST provide a PATCH `/tasks/{id}/complete` endpoint setting `is_completed=true`, setting `completed_at` to current timestamp, logging history with `action=COMPLETED`, returning `success=true` and `popup=TASK_COMPLETED`
- **FR-006**: System MUST provide a PATCH `/tasks/{id}/incomplete` endpoint setting `is_completed=false`, clearing `completed_at` (setting to null), logging history with `action=INCOMPLETED`, returning `success=true` and `popup=TASK_INCOMPLETE`
- **FR-007**: System MUST provide a DELETE `/tasks/{id}` endpoint removing the task permanently, logging history with `action=DELETED`, returning `success=true` and `popup=TASK_DELETED`
- **FR-008**: System MUST provide a GET `/history` endpoint with pagination supporting `page`, `limit`, and `offset` parameters returning paginated history entries with pagination metadata (total_count, total_pages, current_page, per_page) sorted by timestamp descending
- **FR-009**: System MUST provide a GET `/stats/weekly` endpoint returning `tasks_created_this_week` (Monday-Sunday current week), `tasks_completed_this_week`, `total_completed`, `total_incomplete` metrics
- **FR-010**: System MUST validate all user inputs: title cannot be empty/null, descriptions cannot exceed 5000 chars, task ids must be valid UUIDs, pagination limits within 1-100 range, returning clear validation error messages on failure
- **FR-011**: System MUST maintain referential integrity between tasks and task_history; history records are immutable and retained even if task is deleted
- **FR-012**: System MUST support Neon PostgreSQL as database backend with proper connection pooling, error handling, and transaction management
- **FR-013**: System MUST implement CORS headers allowing requests from frontend (localhost:3000 for dev, configurable for production)
- **FR-014**: System MUST use FastAPI framework for REST API implementation with proper async/await patterns
- **FR-015**: System MUST use SQLAlchemy ORM for database operations with proper session management, transaction handling, and connection cleanup
- **FR-016**: Every API response MUST follow consistent format: `{ success: boolean, data: object|null, popup: string|null, error: string|null }` where popup values are TASK_CREATED, TASK_UPDATED, TASK_COMPLETED, TASK_INCOMPLETE, TASK_DELETED
- **FR-017**: System MUST automatically migrate database schema on startup if tables don't exist, or if `AUTO_MIGRATE=false`, must exit with clear error indicating migration is needed
- **FR-018**: System MUST log all task operations automatically to task_history without blocking request completion
- **FR-019**: System MUST support MCP server integrations as defined in root spec.md for database operations, validation, and error handling sub-agents
- **FR-020**: System MUST handle concurrent requests safely using database-level constraints and transactions to prevent race conditions

### Key Entities *(include if feature involves data)*

- **Task**: Represents a user-created task item with: id (UUID, primary key, auto-generated), title (string, required, 1-255 chars), description (text, optional, 0-5000 chars), is_completed (boolean, default false), created_at (timestamp, UTC, auto-set), updated_at (timestamp, UTC, auto-updated on any modification), completed_at (timestamp, UTC, nullable, set when marked complete, cleared when marked incomplete)
- **TaskHistory**: Represents an immutable audit log entry with: history_id (UUID, primary key, auto-generated), task_id (UUID, foreign key to Task, cascade delete behavior), action_type (enum: CREATED, UPDATED, DELETED, COMPLETED, INCOMPLETED), description (text, optional, details about the change or new values), timestamp (timestamp, UTC, auto-set, immutable)

## Success Criteria *(mandatory)*

<!--
  ACTION REQUIRED: Define measurable success criteria.
  These must be technology-agnostic and measurable.
-->

### Measurable Outcomes

- **SC-001**: All CRUD endpoints respond in under 100ms for single task operations under normal load with Neon PostgreSQL
- **SC-002**: System can handle 100 concurrent requests without connection pool exhaustion or timeout errors
- **SC-003**: History records are created with 100% reliability for all task state changes without duplication or data loss
- **SC-004**: API response format is consistent across all endpoints with success, data, and popup fields properly populated
- **SC-005**: Pagination returns accurate total_count and total_pages matching actual database record counts
- **SC-006**: Weekly statistics calculations are accurate with task counts matching actual task states in database
- **SC-007**: Input validation prevents all invalid requests and returns appropriate error messages for all error scenarios
- **SC-008**: Database schema migrations complete successfully on first application startup without manual intervention
- **SC-009**: Frontend receives correct popup flag types (TASK_CREATED, TASK_UPDATED, etc.) enabling appropriate SweetAlert2 notifications
- **SC-010**: CORS headers are properly configured allowing frontend cross-origin requests while maintaining security

## Assumptions

- Frontend runs on localhost:3000 during development; CORS is configurable for production deployment
- Task IDs are UUID v4 generated by the backend database
- "Week" is defined as Monday 00:00 through Sunday 23:59 in UTC timezone
- Pagination defaults to 10 items per page, maximum 100 items per page
- Deleted tasks are permanently removed from database (no soft delete for MVP)
- All timestamps are stored and returned in UTC
- Single user scope (no user authentication or permission checks required for Phase-2)
- MCP servers are optional integrations; system must function without them
- Concurrent request handling uses database-level locking or version control for data consistency
- History entries cannot be updated or deleted once created (immutable audit trail)

## Notes

- This specification defines API contracts and business logic without implementation details (framework specifics are for architecture/planning phases)
- The frontend is already completed and production-ready; backend must match its exact expectations for response formats and popup triggers
- Automatic history logging is a core requirement to enable the audit trail and dashboard analytics
- Database schema initialization with Alembic or similar ORM-based migrations is recommended
- Response consistency is critical for frontend reliability and error handling
