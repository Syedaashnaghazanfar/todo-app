---
description: "Implementation task breakdown for Backend Task Management Module"
---

# Tasks: Backend Task Management Module

**Input**: Design documents from `/specs/002-backend-task-management/`
**Prerequisites**: plan.md (complete), spec.md (7 user stories, 20 FR), data-model.md, contracts/task-endpoints.md, contracts/analytics-history.md
**Tests**: Contract tests (22+ acceptance scenarios) + integration tests included per user story

**Organization**: Tasks are grouped by user story (P1 → P1 → P1 → P1 → P1 → P2 → P2) to enable independent implementation and testing of each story.

## Format: `- [ ] [ID] [P?] [Story] Description with file path`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., [US1], [US2])
- Include exact file paths in descriptions

## Path Conventions

- Backend project: `backend/` at repository root
- Source code: `backend/src/` (models, schemas, services, api, database)
- Tests: `backend/tests/` (contract, integration, unit)
- Configuration: `backend/config.py`, `backend/main.py`, `backend/requirements.txt`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create project structure per implementation plan in backend/
- [x] T002 Initialize Python 3.11+ project with FastAPI dependencies in backend/requirements.txt
- [x] T003 [P] Create main.py entry point with FastAPI app initialization and CORS configuration in backend/main.py
- [x] T004 [P] Create config.py with environment variable management (DATABASE_URL, DEBUG, HOST, PORT, LOG_LEVEL, FRONTEND_URL) in backend/config.py
- [x] T005 [P] Create .env.example template with all required environment variables in backend/.env.example

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T006 Create SQLAlchemy base class in backend/src/database/base.py
- [x] T007 Create database connection configuration with connection pooling (NullPool for Neon) in backend/src/database/connection.py
- [x] T008 [P] Create get_db() dependency function for FastAPI in backend/src/api/dependencies.py
- [x] T009 Initialize Alembic migrations framework with env.py and script.py.mako in backend/alembic/
- [x] T010 [P] Create base response wrapper utility in backend/src/utils/response.py with `{success, data, popup, error}` format
- [x] T011 [P] Create custom exception classes and FastAPI exception handlers in backend/src/exceptions/handlers.py
- [x] T012 [P] Create input validation utilities in backend/src/utils/validators.py (title, description, UUID, pagination)
- [x] T013 [P] Create timestamp utility functions for UTC timezone handling in backend/src/utils/timestamps.py
- [x] T014 Create API v1 router structure in backend/src/api/v1/__init__.py with route includes

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Create New Task (Priority: P1) 🎯 MVP

**Goal**: Enable users to create new tasks via POST /tasks endpoint with validation, database persistence, and history logging

**Independent Test**: POST /tasks with title creates task in database, returns success=true with TASK_CREATED popup, and creates history entry with action=CREATED

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T015 [P] [US1] Contract test for POST /tasks endpoint in backend/tests/contract/test_tasks_create.py (3 scenarios: create with title+description, create title-only, reject empty title)
- [x] T016 [P] [US1] Contract test for validation errors (reject title > 255 chars, reject description > 5000 chars) in backend/tests/contract/test_tasks_create.py
- [x] T017 [P] [US1] Integration test for task creation workflow in backend/tests/integration/test_task_workflow.py (verify database insert, history logging, response format)

### Implementation for User Story 1

- [x] T018 [P] [US1] Create Task model with id, title, description, is_completed, created_at, updated_at, completed_at fields in backend/src/models/task.py
- [x] T019 [P] [US1] Create TaskHistory model with history_id, task_id, action_type (enum), description, timestamp in backend/src/models/task_history.py
- [x] T020 [P] [US1] Create TaskCreate and TaskResponse pydantic schemas in backend/src/schemas/task.py
- [x] T021 [P] [US1] Create HistoryResponse pydantic schema in backend/src/schemas/history.py
- [x] T022 [US1] Implement TaskService.create_task() in backend/src/services/task_service.py with validation and transaction handling
- [x] T023 [US1] Implement HistoryService.log_action() in backend/src/services/history_service.py to create history entries
- [x] T024 [US1] Implement POST /tasks endpoint in backend/src/api/v1/tasks.py with request validation, response formatting, error handling
- [x] T025 [US1] Add logging and error handling for task creation (500 errors, constraint violations)
- [x] T026 [US1] Create initial Alembic migration for tasks and task_history tables in backend/alembic/versions/0001_initial_schema.py

**Checkpoint**: User Story 1 fully functional - POST /tasks works end-to-end with validation, database persistence, and history logging

---

## Phase 4: User Story 2 - Mark Task Complete and Incomplete (Priority: P1)

**Goal**: Enable users to toggle task completion status via PATCH endpoints with timestamp management and history tracking

**Independent Test**: PATCH /tasks/{id}/complete sets is_completed=true with timestamp, returns TASK_COMPLETED popup, and creates history entry. PATCH /tasks/{id}/incomplete reverses this.

### Tests for User Story 2

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T027 [P] [US2] Contract test for PATCH /tasks/{id}/complete endpoint in backend/tests/contract/test_tasks_complete.py (3 scenarios: mark incomplete→complete, idempotency, 404 handling)
- [x] T028 [P] [US2] Contract test for PATCH /tasks/{id}/incomplete endpoint in backend/tests/contract/test_tasks_complete.py (3 scenarios: mark complete→incomplete, idempotency, 404 handling)
- [x] T029 [P] [US2] Integration test for completion workflow in backend/tests/integration/test_task_workflow.py (verify state transitions, timestamp management, history)

### Implementation for User Story 2

- [x] T030 [P] [US2] Create TaskResponse schema variant in backend/src/schemas/task.py (with completed_at field)
- [x] T031 [US2] Implement TaskService.mark_complete() method with is_completed=true, completed_at=now, updated_at=now in backend/src/services/task_service.py
- [x] T032 [US2] Implement TaskService.mark_incomplete() method with is_completed=false, completed_at=null, updated_at=now in backend/src/services/task_service.py
- [x] T033 [US2] Implement PATCH /tasks/{id}/complete endpoint in backend/src/api/v1/tasks.py with 404 handling and response formatting
- [x] T034 [US2] Implement PATCH /tasks/{id}/incomplete endpoint in backend/src/api/v1/tasks.py with 404 handling and response formatting
- [x] T035 [US2] Add database constraints ensuring completed_at consistency (is_completed=true → completed_at IS NOT NULL) in migration

**Checkpoint**: User Stories 1 + 2 fully functional - Task creation and completion toggling both work independently

---

## Phase 5: User Story 3 - Edit Task Details (Priority: P1)

**Goal**: Enable users to update task title and description via PUT endpoint with change tracking

**Independent Test**: PUT /tasks/{id} with new title/description updates database, returns TASK_UPDATED popup, and creates history entry with action=UPDATED

### Tests for User Story 3

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T036 [P] [US3] Contract test for PUT /tasks/{id} endpoint in backend/tests/contract/test_tasks_update.py (3 scenarios: update title only, update description only, update both)
- [x] T037 [P] [US3] Contract test for PUT validation (reject empty title, reject title > 255, reject desc > 5000, at least one field required) in backend/tests/contract/test_tasks_update.py
- [x] T038 [P] [US3] Integration test for update workflow in backend/tests/integration/test_task_workflow.py (verify partial updates, timestamp changes, history logging)

### Implementation for User Story 3

- [x] T039 [P] [US3] Create TaskUpdate pydantic schema (title optional, description optional, both optional) in backend/src/schemas/task.py
- [x] T040 [US3] Implement TaskService.update_task(id, title=None, description=None) method with partial updates in backend/src/services/task_service.py
- [x] T041 [US3] Implement PUT /tasks/{id} endpoint in backend/src/api/v1/tasks.py with validation (at least one field), 404 handling, response formatting
- [x] T042 [US3] Add validation in endpoint to reject requests with no update fields (both title and description null)
- [x] T043 [US3] Add database constraint ensuring title is not empty and description max length 5000 chars in migration

**Checkpoint**: User Stories 1 + 2 + 3 fully functional - Create, complete/incomplete, and edit all work independently

---

## Phase 6: User Story 4 - Delete Task (Priority: P1)

**Goal**: Enable users to permanently remove tasks via DELETE endpoint with cascade-safe history retention

**Independent Test**: DELETE /tasks/{id} removes task from database, returns TASK_DELETED popup, history entry persists, subsequent GET /tasks/{id} returns 404

### Tests for User Story 4

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T044 [P] [US4] Contract test for DELETE /tasks/{id} endpoint in backend/tests/contract/test_tasks_delete.py (3 scenarios: delete existing task, delete non-existent task, verify history retention)
- [x] T045 [P] [US4] Integration test for deletion workflow in backend/tests/integration/test_task_workflow.py (verify history entries survive deletion, counts unchanged)

### Implementation for User Story 4

- [x] T046 [US4] Implement TaskService.delete_task(id) method with transaction and cascade handling in backend/src/services/task_service.py
- [x] T047 [US4] Implement DELETE /tasks/{id} endpoint in backend/src/api/v1/tasks.py with 404 handling, response formatting, popup=TASK_DELETED
- [x] T048 [US4] Update TaskHistory model with ON DELETE RESTRICT or CASCADE behavior to retain history after task deletion
- [x] T049 [US4] Add integration test verifying history records persist after task deletion

**Checkpoint**: User Stories 1 + 2 + 3 + 4 fully functional - Full CRUD cycle complete (Create, Read, Update, Delete)

---

## Phase 7: User Story 5 - View Task List and Retrieve Tasks (Priority: P1)

**Goal**: Enable users to retrieve all tasks and individual task details via GET endpoints with proper ordering

**Independent Test**: GET /tasks returns all tasks in array with incomplete tasks before completed, GET /tasks/{id} returns specific task or 404

### Tests for User Story 5

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T050 [P] [US5] Contract test for GET /tasks endpoint in backend/tests/contract/test_tasks_list.py (3 scenarios: list all tasks, list with mixed completion states, empty list)
- [x] T051 [P] [US5] Contract test for GET /tasks/{id} endpoint in backend/tests/contract/test_tasks_list.py (2 scenarios: get existing task, get non-existent returns 404)
- [x] T052 [P] [US5] Integration test for retrieval workflow in backend/tests/integration/test_task_workflow.py (verify ordering, metadata completeness)

### Implementation for User Story 5

- [x] T053 [US5] Implement TaskService.get_all_tasks() method with ordering (incomplete first, then by created_at desc) in backend/src/services/task_service.py
- [x] T054 [US5] Implement TaskService.get_task(id) method returning single task or None in backend/src/services/task_service.py
- [x] T055 [US5] Implement GET /tasks endpoint in backend/src/api/v1/tasks.py with response formatting and empty list handling
- [x] T056 [US5] Implement GET /tasks/{id} endpoint in backend/src/api/v1/tasks.py with 404 error handling and response formatting
- [x] T057 [US5] Create database index on (is_completed, created_at DESC) for efficient list queries in migration

**Checkpoint**: All P1 User Stories (1-5) fully functional - Complete CRUD with listing and retrieval operational

---

## Phase 8: User Story 6 - View Task History with Pagination (Priority: P2)

**Goal**: Enable users to retrieve paginated audit log of all task actions with filtering and sorting

**Independent Test**: GET /history?page=1&limit=10 returns exactly 10 items with pagination metadata, GET /history?task_id=X returns only that task's history, sorted by timestamp descending

### Tests for User Story 6

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T058 [P] [US6] Contract test for GET /history endpoint in backend/tests/contract/test_history.py (5 scenarios: pagination, filtering by task_id, filtering by action_type, offset pagination, invalid pagination)
- [x] T059 [P] [US6] Integration test for history workflow in backend/tests/integration/test_task_workflow.py (verify all actions logged, immutability, counts accuracy)

### Implementation for User Story 6

- [x] T060 [P] [US6] Create HistoryResponse and PaginatedHistory pydantic schemas in backend/src/schemas/history.py with pagination metadata
- [x] T061 [US6] Implement HistoryService.get_history_paginated(page, limit, offset, task_id, action_type) in backend/src/services/history_service.py
- [x] T062 [US6] Implement GET /history endpoint in backend/src/api/v1/history.py with query parameter handling, validation, pagination response
- [x] T063 [US6] Add validation for pagination parameters (page ≥ 1, limit 1-100) in endpoint or service layer
- [x] T064 [US6] Create database indexes on (task_id, timestamp DESC) and (timestamp DESC) for history queries in migration

**Checkpoint**: P2 User Story 6 functional - History pagination with filtering operational

---

## Phase 9: User Story 7 - View Weekly Dashboard Statistics (Priority: P2)

**Goal**: Enable users to see task analytics (weekly + total counts) for dashboard insights

**Independent Test**: GET /stats/weekly returns accurate tasks_created_this_week, tasks_completed_this_week, total_completed, total_incomplete counts with correct week boundaries (Monday-Sunday UTC)

### Tests for User Story 7

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T065 [P] [US7] Contract test for GET /stats/weekly endpoint in backend/tests/contract/test_stats.py (4 scenarios: normal data, empty database, deleted tasks excluded, week boundary calculation)
- [x] T066 [P] [US7] Integration test for stats workflow in backend/tests/integration/test_task_workflow.py (verify calculations accurate across multiple tasks and weeks)

### Implementation for User Story 7

- [x] T067 [P] [US7] Create WeeklyStats pydantic schema in backend/src/schemas/stats.py with all required fields
- [x] T068 [US7] Implement HistoryService.get_weekly_stats() method calculating week boundaries (Monday-Sunday UTC) in backend/src/services/history_service.py
- [x] T069 [US7] Implement query logic for tasks_created_this_week (created_at between week boundaries) in HistoryService
- [x] T070 [US7] Implement query logic for tasks_completed_this_week (completed_at between week boundaries) in HistoryService
- [x] T071 [US7] Implement GET /stats/weekly endpoint in backend/src/api/v1/stats.py with response formatting
- [x] T072 [US7] Add database indexes on (created_at) and (completed_at) for efficient stats queries in migration

**Checkpoint**: All User Stories (1-7) fully functional - Complete backend API implementation with CRUD, history pagination, and analytics

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and system-wide quality

- [x] T073 [P] Run Alembic migration on startup verification - ensure database schema initializes without errors
- [x] T074 [P] Add comprehensive error handling for all endpoints (500 errors, database connection failures, timeout handling)
- [x] T075 [P] Add request/response logging middleware in backend/src/api/middleware.py
- [x] T076 [P] Add database transaction timeout configuration (15s) in connection pool
- [x] T077 [P] Create comprehensive docstrings for all services, endpoints, and models
- [x] T078 [P] Add type hints to all functions (return types, parameter types)
- [x] T079 Add unit tests for TaskService methods in backend/tests/unit/test_task_service.py
- [x] T080 Add unit tests for HistoryService methods in backend/tests/unit/test_history_service.py
- [x] T081 Add unit tests for validation utilities in backend/tests/unit/test_validators.py
- [x] T082 Run all contract tests and verify 22+ acceptance scenarios pass
- [x] T083 Run all integration tests verifying multi-endpoint workflows
- [x] T084 Performance testing: verify CRUD responses < 100ms, concurrent requests (100+) handled without pool exhaustion
- [x] T085 CORS configuration validation: verify frontend (localhost:3000) can make cross-origin requests
- [x] T086 Update backend README.md with quick-start instructions from quickstart.md
- [x] T087 Create backend/.gitignore with venv/, __pycache__/, .env, *.pyc, *.pyo
- [x] T088 Verify .env.example includes all required variables with example values (no secrets)
- [x] T089 Run full integration test suite (pytest tests/ -v) and verify all tests pass

**Checkpoint**: Backend API production-ready with comprehensive test coverage and documentation

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-9)**: All depend on Foundational phase completion
  - P1 stories (1-5) should complete before P2 stories (6-7) for MVP validation
  - Or all can proceed in parallel if staffed
- **Polish (Phase 10)**: Depends on desired user stories being complete; integration tests require all stories working

### User Story Dependencies

- **US1 (Create Task)**: No dependencies - start after Foundational → Tests → Implementation
- **US2 (Complete/Incomplete)**: Depends on US1 for database schema, but can be coded in parallel
- **US3 (Edit Task)**: Depends on US1 for Task model, can be parallel after T018
- **US4 (Delete Task)**: Depends on US1 for Task model, can be parallel after T018
- **US5 (List/Retrieve)**: Depends on US1 for Task model, can be parallel after T018
- **US6 (History Pagination)**: Depends on any task operation (uses TaskHistory), can start after Foundational
- **US7 (Weekly Stats)**: Depends on any task operation (uses TaskHistory), can start after Foundational

### Within Each User Story

- Tests (if included) MUST be written and FAIL before implementation
- Models before services
- Services before endpoints
- Validation before endpoint integration
- Story complete before validation

### Parallel Opportunities

**Phase 1 (Setup)**: All tasks can run in parallel (independent files)
- T003, T004, T005 all create separate config files

**Phase 2 (Foundational)**: Most tasks can run in parallel
- Database setup: T006-T009 (sequential: base → connection → dependency → alembic)
- Utils: T010-T013 can run in parallel with database setup
- Router: T014 depends on utils but can start after T010

**Phase 3-9 (User Stories)**: All tests can run in parallel within a story
- T015-T017 (US1 tests) can all run in parallel
- T018-T020 (US1 models/schemas) can run in parallel
- T021-T025 (US1 services/endpoints) must sequence: models → services → endpoints

**Within Stories**: Models first (parallel), then Services (sequential after models), then Endpoints (sequential after services)

---

## Parallel Example: Complete Foundational Phase

```bash
# Sequential: Database layer setup (blocking)
Task: T006 Create SQLAlchemy base
Task: T007 Create database connection (depends T006)
Task: T008 Create get_db() dependency (depends T007)
Task: T009 Initialize Alembic (depends T006)

# Parallel: Utils and middleware (no dependencies)
Task: T010 Response wrapper utility
Task: T011 Exception handlers
Task: T012 Input validators
Task: T013 Timestamp utilities

# Sequential: API router (depends on utils)
Task: T014 Create API v1 router structure (depends T010)

Result: Foundational phase complete in ~3 sequential chains + parallel utils
```

---

## Parallel Example: User Story 1 (Create Task)

```bash
# Phase 3 Parallel: Tests can all run in parallel
pytest backend/tests/contract/test_tasks_create.py
pytest backend/tests/contract/test_tasks_create_validation.py
pytest backend/tests/integration/test_task_workflow.py

# Phase 3 Parallel: Models and schemas can run in parallel
T018: Create Task model
T019: Create TaskHistory model
T020: Create TaskCreate schema
T021: Create TaskResponse schema

# Sequential: Services then endpoints (dependencies)
T022: Implement TaskService.create_task() (depends T018, T019, T020)
T023: Implement HistoryService.log_action() (depends T019)
T024: Implement POST /tasks endpoint (depends T022, T023)
T025: Add error handling (depends T024)
T026: Create migration (depends T018, T019)

Result: User Story 1 complete with tests + implementation
```

---

## Implementation Strategy

### MVP First (User Stories 1-5 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3-7: User Stories 1-5 (Create, Complete/Incomplete, Edit, Delete, List/Retrieve)
4. **STOP and VALIDATE**: Test all 5 stories together (complete CRUD cycle)
5. **Deploy/Demo MVP**: All core functionality working

### Incremental Delivery (Add Analytics)

6. Complete Phase 8-9: User Stories 6-7 (History pagination, Weekly stats)
7. **Validate**: Test analytics with existing data
8. **Deploy/Demo**: Full feature set

### Polish and Optimization (Phase 10)

9. Complete Phase 10: Comprehensive testing, documentation, performance optimization, security hardening
10. **Final Validation**: All 89 tasks complete, all tests passing (22+ contract + integration tests), quickstart verified

---

## Summary

| Metric | Count |
|--------|-------|
| Total Tasks | 89 |
| Setup Tasks | 5 |
| Foundational Tasks | 9 |
| US1 Tasks | 12 |
| US2 Tasks | 8 |
| US3 Tasks | 9 |
| US4 Tasks | 4 |
| US5 Tasks | 6 |
| US6 Tasks | 5 |
| US7 Tasks | 6 |
| Polish Tasks | 17 |
| **Parallelizable [P] Tasks** | **42** |
| **Sequential Tasks** | **47** |
| Contract Test Scenarios | 22+ |
| Integration Test Scenarios | 7+ |
| MVP Scope (US1-5) | 44 tasks |
| Full Scope (US1-7) | 55 tasks |

---

## Notes

- [P] tasks = different files, no dependencies (safe to parallelize)
- [US#] label = maps task to specific user story for traceability
- Each user story is independently completable and testable
- Verify tests fail before implementing (TDD approach)
- Commit after each task or logical group
- Stop at checkpoints to validate independently
- Foundation phase (T001-T014) is critical blocker
- MVP is complete after US1-5; analytics (US6-7) are incremental additions
