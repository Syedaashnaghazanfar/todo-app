# Feature Specification: Backend API Validation & Testing

**Feature Branch**: `003-validate-backend`
**Created**: 2025-12-11
**Status**: Draft
**Input**: Validate the completed backend and test all API endpoints for the Phase-2 Todo App.

## User Scenarios & Testing

### User Story 1 - Database Migration and Setup (Priority: P1)

As a DevOps engineer, I need to initialize the Neon PostgreSQL database with all required tables and schemas so that the backend has a properly structured data layer ready for operations.

**Why this priority**: Database setup is the critical foundation for all backend operations. Without successful migrations, no other functionality can be tested or deployed.

**Independent Test**: Run `alembic upgrade head` and verify that all tables (tasks, task_history) are created with correct schema, constraints, and indexes.

**Acceptance Scenarios**:

1. **Given** the backend is configured with a valid Neon DATABASE_URL, **When** `alembic upgrade head` is executed, **Then** the tasks table is created with 7 columns and 3 check constraints.
2. **Given** migrations are complete, **When** querying the information_schema, **Then** task_history table exists with proper foreign key relationships.
3. **Given** migrations are complete, **When** querying database indexes, **Then** all 6 optimized indexes are present and accessible.
4. **Given** the database has tables, **When** attempting to run migrations again, **Then** the system recognizes the migration is already applied and completes without errors.

---

### User Story 2 - Backend Server Startup & Health Check (Priority: P1)

As a developer, I need to start the FastAPI backend server locally so that I can verify it initializes correctly and is ready to accept requests.

**Why this priority**: Server startup is critical to ensure the application can run in any environment. Health checks provide immediate feedback on system readiness.

**Independent Test**: Run `python main.py` and verify that the server starts on the configured port (APP_PORT=8000) with CORS enabled and all routes registered.

**Acceptance Scenarios**:

1. **Given** the backend is configured with APP_PORT=8000, **When** running `python main.py`, **Then** the server starts without errors and listens on 0.0.0.0:8000.
2. **Given** the server is running, **When** making a GET request to `/api/v1/health`, **Then** the response is `{"status": "healthy", "service": "todo-app-backend"}`.
3. **Given** the server is running, **When** accessing `/api/docs`, **Then** the Swagger UI loads successfully and displays all 9 API endpoints.
4. **Given** a request comes from the frontend (http://localhost:3000), **When** the CORS middleware is invoked, **Then** the request is allowed and response includes proper CORS headers.

---

### User Story 3 - CRUD Operations Validation (Priority: P1)

As a QA tester, I need to manually test all CRUD endpoints so that I can verify each operation behaves correctly, validates input properly, and logs history appropriately.

**Why this priority**: CRUD operations are the core functionality of the todo app. Every endpoint must work correctly for the application to be usable.

**Independent Test**: Create a task → Read it → Update it → Mark complete/incomplete → Delete it, verifying each operation succeeds and history is logged.

**Acceptance Scenarios**:

1. **Given** the server is running, **When** POST /api/v1/tasks with `{"title": "Test Task", "description": "Test Description"}`, **Then** a task is created with UUID id and returns 201 CREATED.
2. **Given** a task exists with id=<task-id>, **When** GET /api/v1/tasks/<task-id>, **Then** the response includes all task fields with correct values.
3. **Given** a task exists with id=<task-id>, **When** PUT /api/v1/tasks/<task-id> with `{"title": "Updated"}`, **Then** only the title is updated and updated_at timestamp changes.
4. **Given** a task exists with is_completed=false, **When** PATCH /api/v1/tasks/<task-id>/complete, **Then** is_completed becomes true, completed_at is set, and a COMPLETED history entry is logged.
5. **Given** a task exists with is_completed=true, **When** PATCH /api/v1/tasks/<task-id>/incomplete, **Then** is_completed becomes false, completed_at is cleared, and an INCOMPLETED history entry is logged.
6. **Given** a task exists, **When** DELETE /api/v1/tasks/<task-id>, **Then** the task is removed from the tasks table but history entries remain intact.
7. **Given** multiple tasks exist with mixed completion states, **When** GET /api/v1/tasks, **Then** tasks are returned ordered with incomplete tasks first, followed by completed tasks.

---

### User Story 4 - History Tracking and Pagination (Priority: P2)

As a user, I need to view the history of all task operations so that I can track what happened to my tasks (create, update, complete, delete events).

**Why this priority**: History tracking is important for audit trails and user understanding of task lifecycles, but is less critical than core CRUD operations.

**Independent Test**: Perform various task operations (create, update, complete, delete) and verify that GET /api/v1/history returns paginated results with correct filtering and sorting.

**Acceptance Scenarios**:

1. **Given** 20+ task operations have been performed, **When** GET /api/v1/history?page=1&limit=10, **Then** the response includes 10 items with pagination metadata (total_count, total_pages, has_next, has_prev).
2. **Given** history has 50+ entries, **When** GET /api/v1/history?page=2&limit=10, **Then** the second page shows items 11-20 with correct offset.
3. **Given** task with id=<task-id> has multiple history entries, **When** GET /api/v1/history?task_id=<task-id>, **Then** only entries for that task are returned.
4. **Given** history has entries of different action types (CREATED, UPDATED, DELETED, COMPLETED, INCOMPLETED), **When** GET /api/v1/history?action_type=COMPLETED, **Then** only COMPLETED actions are returned.
5. **Given** history entries exist with timestamps, **When** querying without filters, **Then** entries are sorted by timestamp in descending order (newest first).

---

### User Story 5 - Analytics and Weekly Statistics (Priority: P2)

As a user, I need to view weekly statistics about my tasks so that I can understand task completion patterns and productivity trends.

**Why this priority**: Analytics provide insights but are less critical than core CRUD operations. Feature works independently from main task operations.

**Independent Test**: Create tasks with various completion dates and verify GET /api/v1/stats/weekly returns accurate counts for the current week (Monday-Sunday UTC).

**Acceptance Scenarios**:

1. **Given** tasks were created/completed in the current week, **When** GET /api/v1/stats/weekly, **Then** the response includes weekly_start, weekly_end (Monday-Sunday UTC), total_tasks, completed_tasks, and completion_rate.
2. **Given** 5 tasks exist and 3 are completed, **When** calling weekly stats, **Then** completion_rate = 60%.
3. **Given** the database has tasks from multiple weeks, **When** calling weekly stats, **Then** only tasks from the current week (Monday-Sunday UTC) are counted.
4. **Given** no tasks exist in the database, **When** calling weekly stats, **Then** response includes zero counts but maintains proper structure.

---

### User Story 6 - Input Validation and Error Handling (Priority: P1)

As a developer, I need to verify that all endpoints properly validate input and return meaningful error messages so that invalid requests are rejected before reaching the database.

**Why this priority**: Validation and error handling are critical for system stability and user experience. Poor error messages lead to confusion and support tickets.

**Independent Test**: Submit invalid data (empty titles, invalid UUIDs, missing fields) to various endpoints and verify appropriate 400/422 error responses.

**Acceptance Scenarios**:

1. **Given** POST /api/v1/tasks with empty title, **When** the request is submitted, **Then** a 422 Unprocessable Entity response is returned with a descriptive error message.
2. **Given** POST /api/v1/tasks with title exceeding 255 characters, **When** the request is submitted, **Then** validation fails and error response indicates max length constraint.
3. **Given** GET /api/v1/tasks/<invalid-uuid>, **When** the request is submitted, **Then** a 400 Bad Request is returned indicating invalid UUID format.
4. **Given** PUT /api/v1/tasks/<non-existent-id>, **When** the request is submitted, **Then** a 404 Not Found error is returned with descriptive message.
5. **Given** PATCH /api/v1/tasks/<id>/complete is called on already-completed task, **When** the request is submitted, **Then** either succeeds idempotently or returns a clear error message explaining the state.
6. **Given** any endpoint receives invalid JSON, **When** the request is submitted, **Then** a 400 Bad Request is returned with error details.

---

### Edge Cases

- What happens when the database connection drops mid-request? (Connection pooling and error handling should gracefully respond)
- What happens when a task is deleted while being edited simultaneously? (RESTRICT FK ensures consistency; proper error handling on stale requests)
- What happens when history grows to 1000+ entries? (Pagination handles large datasets; query performance remains acceptable)
- What happens when invalid pagination parameters are provided? (Validation enforces page ≥ 1, 1 ≤ limit ≤ 100)
- What happens when concurrent requests modify the same task? (Database constraints and proper locking behavior)

## Requirements

### Functional Requirements

- **FR-001**: System MUST initialize PostgreSQL database with tasks table containing: id (UUID), title (String), description (Text), is_completed (Boolean), created_at (DateTime), updated_at (DateTime), completed_at (DateTime)
- **FR-002**: System MUST initialize task_history table with: history_id (UUID), task_id (FK), action_type (Enum), description (Text), timestamp (DateTime)
- **FR-003**: System MUST create 3 check constraints on tasks table to ensure data integrity: non-empty title, max description length, completed_at consistency
- **FR-004**: System MUST create 6 database indexes for optimal query performance on frequently searched/filtered columns
- **FR-005**: System MUST expose FastAPI health check endpoint at GET /api/v1/health returning service status
- **FR-006**: System MUST implement POST /api/v1/tasks endpoint accepting title and optional description, creating task with CREATED history entry
- **FR-007**: System MUST implement GET /api/v1/tasks endpoint returning all tasks ordered (incomplete first, then by created_at descending)
- **FR-008**: System MUST implement GET /api/v1/tasks/{id} endpoint returning specific task or 404 error
- **FR-009**: System MUST implement PUT /api/v1/tasks/{id} endpoint allowing partial updates to title/description with UPDATED history entry
- **FR-010**: System MUST implement DELETE /api/v1/tasks/{id} endpoint removing task while retaining history entries
- **FR-011**: System MUST implement PATCH /api/v1/tasks/{id}/complete endpoint marking task complete with COMPLETED history entry and timestamp
- **FR-012**: System MUST implement PATCH /api/v1/tasks/{id}/incomplete endpoint marking task incomplete with INCOMPLETED history entry and clearing timestamp
- **FR-013**: System MUST implement GET /api/v1/history endpoint with pagination (page, limit parameters) and optional filtering by task_id and action_type
- **FR-014**: System MUST implement GET /api/v1/stats/weekly endpoint returning weekly statistics (start, end, total_tasks, completed_tasks, completion_rate)
- **FR-015**: System MUST validate all inputs: title length (1-255 chars), description max 5000 chars, UUIDs properly formatted, pagination bounds (page ≥ 1, limit 1-100)
- **FR-016**: System MUST return consistent JSON response format with fields: success (Boolean), data (Object), popup (String), error (String)
- **FR-017**: System MUST log all task changes to task_history table with appropriate action types and timestamps
- **FR-018**: System MUST support CORS requests from frontend URL (http://localhost:3000 and configurable FRONTEND_URL)
- **FR-019**: System MUST handle connection pooling with NullPool for Neon serverless optimization
- **FR-020**: System MUST handle database errors gracefully with meaningful error messages to client

### Key Entities

- **Task**: Represents a to-do item with title, description, completion status, timestamps, and completion tracking. Core entity driving all operations.
- **TaskHistory**: Immutable audit log recording every action taken on tasks (creation, updates, deletions, state changes) for accountability and analytics.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Database migrations complete successfully with zero errors and all 2 tables + 6 indexes created correctly (verified via schema query)
- **SC-002**: Backend server starts without errors and responds to health check within 1 second
- **SC-003**: All 9 API endpoints respond to valid requests with correct HTTP status codes and response format
- **SC-004**: All CRUD operations complete in under 100ms for single-task operations (p95 latency)
- **SC-005**: Input validation rejects 100% of invalid requests (empty titles, invalid UUIDs, oversized descriptions) with appropriate 400/422 errors
- **SC-006**: All task operations automatically generate and persist history entries with correct action types and timestamps
- **SC-007**: Pagination returns accurate metadata (total_count, current_page, has_next, has_prev) and respects limit boundaries
- **SC-008**: Weekly statistics calculation includes only current week (Monday-Sunday UTC) tasks and computes completion_rate accurately
- **SC-009**: Concurrent requests to same task are handled correctly with no data corruption or lost updates
- **SC-010**: 100% of pytest test scenarios pass (40+ test cases across contract, integration, and unit tests)

## Assumptions

- Backend code has been implemented per 002-backend-task-management specification and is not modified
- Neon PostgreSQL database credentials are configured in .env file (DATABASE_URL)
- Python 3.8+ and required dependencies (FastAPI, SQLAlchemy, pytest, etc.) are installed
- Alembic migrations are configured and migration files exist
- Frontend integration will occur in a subsequent feature after validation completes
- Manual testing uses cURL, Postman, or similar HTTP client
- Automated testing uses pytest framework with existing test infrastructure
- Analytics endpoint refers to GET /api/v1/stats/weekly (note: user description mentioned "/analytics" which is interpreted as stats endpoint)
- Weekly statistics use UTC timezone for boundaries
- Pagination defaults to page=1, limit=10, max limit=100 per implementation

## Out of Scope

- Modifying or rebuilding backend code (validation/testing only)
- Frontend integration (covered by separate feature)
- Performance load testing beyond single-instance validation
- Database backup/restore procedures
- Production deployment procedures
- Documentation updates (assumed current)
