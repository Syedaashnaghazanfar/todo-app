# Tasks: Backend API Validation & Testing

**Feature**: 003-validate-backend | **Branch**: 003-validate-backend | **Date**: 2025-12-11
**Input**: Design documents from `/specs/003-validate-backend/`
**Spec Reference**: [spec.md](./spec.md) | **Plan Reference**: [plan.md](./plan.md)

## Overview

This feature validates the completed 002-backend-task-management backend implementation through systematic testing. No code modification required; only validation and testing of existing implementation.

**Total Tasks**: 47 tasks across 6 phases
- Phase 1 (Setup): 5 tasks
- Phase 2 (Foundational): 7 tasks
- Phase 3 (US1 - Database): 9 tasks
- Phase 4 (US2 - Server): 8 tasks
- Phase 5 (US3 - CRUD): 12 tasks
- Phase 6 (US4-5 - Analytics): 6 tasks

**MVP Scope**: Complete Phase 1-4 for minimum viable validation (database + server working)

---

## Format: `- [ ] [ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files/systems, no dependencies)
- **[Story]**: Which user story (US1, US2, US3, US4, US5)
- **File paths**: Exact locations for verification

---

## Phase 1: Setup (Environment & Prerequisites)

**Purpose**: Verify environment prerequisites are in place
**Parallel Opportunities**: All 5 tasks can run in parallel (different validation targets)
**Duration**: 10-15 minutes

- [ ] T001 [P] Verify Python version is 3.8+ (check: `python --version`)
- [ ] T002 [P] Verify all dependencies installed (check: `pip list | grep -E "fastapi|sqlalchemy|alembic|pytest"`)
- [ ] T003 [P] Verify .env file exists and DATABASE_URL configured (check: `cat .env | grep DATABASE_URL`)
- [ ] T004 [P] Verify backend directory structure exists (check: `ls backend/`)
- [ ] T005 [P] Verify Alembic configured (check: `ls -la backend/alembic/`)

**Checkpoint**: ✅ Environment prerequisites verified; proceed to foundational phase

---

## Phase 2: Foundational (Database & Server Infrastructure)

**Purpose**: Verify database and server infrastructure is ready for testing
**Dependencies**: Phase 1 complete
**Parallel Opportunities**: T006 and T007 can run in parallel (database and server setup independent)
**Duration**: 15-20 minutes

- [ ] T006 [P] [Setup] Verify database connectivity (execute: `python -c "from sqlalchemy import create_engine; engine = create_engine(os.getenv('DATABASE_URL')); engine.connect()"`)
- [ ] T007 [P] [Setup] Verify Alembic migration infrastructure ready (execute: `alembic current` shows valid state)
- [ ] T008 [Setup] Document current database state before migrations (execute: `alembic heads` and record revision)
- [ ] T009 [Setup] Verify backend entry point exists (check: `test -f backend/main.py && echo "OK"`)
- [ ] T010 [Setup] Verify config module loads correctly (execute: `python -c "from backend.config import DATABASE_URL; print('Config OK')"`)
- [ ] T011 [Setup] Create test data directory if needed (mkdir: `backend/tests/fixtures/`)
- [ ] T012 [Setup] Document backend code structure (ls: `backend/src/`, verify models, services, api directories)

**Checkpoint**: ✅ Infrastructure verified; ready for user story testing

---

## Phase 3: User Story 1 - Database Migration and Setup (Priority: P1)

**Goal**: Initialize Neon PostgreSQL database with all required tables, schemas, constraints, and indexes

**Independent Test**: Run `alembic upgrade head` and verify tables created with correct schema

**Acceptance Criteria**:
- tasks table created with 7 columns and 3 check constraints
- task_history table created with 5 columns and RESTRICT FK
- All 7 indexes created (3 on tasks + 4 on task_history)
- Migration is idempotent (can rerun safely)

**Duration**: 10-15 minutes
**Parallel Opportunities**: T014-T018 can run in parallel after migrations complete (different schema validations)

### Database Migration Validation

- [ ] T013 [US1] Run Alembic migrations: `cd backend && alembic upgrade head` (expect: "Successfully applied... initial schema")
- [ ] T014 [P] [US1] Verify tasks table created (query: `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'tasks'`)
- [ ] T015 [P] [US1] Verify task_history table created (query: `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'task_history'`)
- [ ] T016 [P] [US1] Verify 7 columns on tasks table (query: `SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'tasks'` expect: 7)
- [ ] T017 [P] [US1] Verify 5 columns on task_history table (query: `SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'task_history'` expect: 5)
- [ ] T018 [P] [US1] Verify 3 check constraints on tasks table (query: `SELECT constraint_name FROM information_schema.constraint_column_usage WHERE table_name = 'tasks' AND constraint_type = 'CHECK'` expect: 3)
- [ ] T019 [P] [US1] Verify RESTRICT FK on task_history (query: `SELECT constraint_name FROM information_schema_referential_constraints WHERE table_name = 'task_history'`)
- [ ] T020 [P] [US1] Verify 7 indexes created (query: `SELECT COUNT(*) FROM pg_indexes WHERE tablename IN ('tasks', 'task_history')` expect: 7)
- [ ] T021 [US1] Document migration result: Record revision, timestamp, table counts (capture: `alembic current`)

**Checkpoint**: ✅ US1 Complete - Database tables and schema verified; 7 indexes accessible; all constraints enforced

---

## Phase 4: User Story 2 - Backend Server Startup & Health Check (Priority: P1)

**Goal**: Verify backend FastAPI server starts correctly and responds to health checks

**Independent Test**: Run `python main.py` and verify server listens on APP_PORT=8000 with CORS enabled

**Acceptance Criteria**:
- Server starts without errors on 0.0.0.0:8000
- Health check endpoint returns {"status": "healthy", "service": "todo-app-backend"}
- Swagger UI loads at /api/docs with all 9 endpoints visible
- CORS headers present for localhost:3000 requests

**Duration**: 10-15 minutes
**Parallel Opportunities**: T023-T026 can run in parallel after server starts (different endpoint checks)

### Server Startup Validation

- [ ] T022 [US2] Start backend server in background (execute: `cd backend && nohup python main.py > server.log 2>&1 &`)
- [ ] T023 [P] [US2] Test health endpoint (execute: `curl http://localhost:8000/api/v1/health` expect: `{"status":"healthy","service":"todo-app-backend"}`)
- [ ] T024 [P] [US2] Verify server listening on port 8000 (execute: `lsof -i :8000` expect: Python process listening)
- [ ] T025 [P] [US2] Test Swagger UI loads (execute: `curl -s http://localhost:8000/api/docs | grep -q "swagger" && echo "OK"`)
- [ ] T026 [P] [US2] Count endpoints in Swagger (execute: `curl -s http://localhost:8000/api/openapi.json | grep -o '"operationId"' | wc -l` expect: 9)
- [ ] T027 [US2] Test CORS headers for localhost:3000 (execute: `curl -H "Origin: http://localhost:3000" http://localhost:8000/api/v1/health -v | grep "access-control"`)
- [ ] T028 [US2] Document server startup result: Record port, startup time, CORS status (capture: server.log tail)

**Checkpoint**: ✅ US2 Complete - Server running on APP_PORT=8000; health check working; CORS configured; all 9 endpoints visible

---

## Phase 5: User Story 3 - CRUD Operations Validation (Priority: P1)

**Goal**: Manually test all CRUD endpoints to verify correct behavior, validation, and history logging

**Independent Test**: Complete task lifecycle (create → read → update → complete → incomplete → delete) and verify history entries

**Acceptance Criteria**:
- All 7 CRUD endpoints respond with correct HTTP status codes
- Input validation rejects invalid requests (empty title, invalid UUID, oversized description)
- Task operations create appropriate history entries
- Task ordering is correct (incomplete first)
- Deleted tasks retained in history

**Duration**: 25-30 minutes
**Parallel Opportunities**: T031-T035 can run in parallel (different endpoint tests after task created)

### CRUD Endpoint Validation

- [ ] T029 [US3] Create test task 1 (execute: `curl -X POST http://localhost:8000/api/v1/tasks -H "Content-Type: application/json" -d '{"title":"Test Task 1","description":"Test"}' | jq -r '.data.id'` save as TASK_ID_1)
- [ ] T030 [US3] Create test task 2 (execute: `curl -X POST http://localhost:8000/api/v1/tasks -H "Content-Type: application/json" -d '{"title":"Test Task 2"}' | jq -r '.data.id'` save as TASK_ID_2)

#### Create Task Tests

- [ ] T031 [P] [US3] Test POST /tasks success (verify: HTTP 201, response has id and title)
- [ ] T032 [P] [US3] Test POST /tasks with empty title (execute: with title="" expect: HTTP 422 Unprocessable Entity)
- [ ] T033 [P] [US3] Test POST /tasks with title >255 chars (execute: with 300-char title expect: HTTP 422)
- [ ] T034 [P] [US3] Test POST /tasks with description >5000 chars (execute: with 6000-char description expect: HTTP 422)

#### Read Task Tests

- [ ] T035 [P] [US3] Test GET /tasks (verify: HTTP 200, array of tasks, incomplete first)
- [ ] T036 [P] [US3] Test GET /tasks/{id} success (verify: HTTP 200, correct task data with TASK_ID_1)
- [ ] T037 [P] [US3] Test GET /tasks with non-existent ID (execute: with invalid UUID expect: HTTP 404)
- [ ] T038 [P] [US3] Test GET /tasks with malformed UUID (execute: with "invalid-uuid" expect: HTTP 400)

#### Update Task Tests

- [ ] T039 [P] [US3] Test PUT /tasks/{id} update title only (verify: HTTP 200, title changed, updated_at changed)
- [ ] T040 [P] [US3] Test PUT /tasks/{id} update description only (verify: HTTP 200, description changed)
- [ ] T041 [P] [US3] Test PUT /tasks/{id} with invalid title length (verify: HTTP 422 error)

#### Complete/Incomplete Tests

- [ ] T042 [P] [US3] Test PATCH /tasks/{id}/complete (verify: HTTP 200, is_completed=true, completed_at timestamp set)
- [ ] T043 [P] [US3] Test PATCH /tasks/{id}/incomplete (verify: HTTP 200, is_completed=false, completed_at=null)

#### Delete Task Test

- [ ] T044 [US3] Test DELETE /tasks/{id} (verify: HTTP 200 success, task removed from list, history retained)
- [ ] T045 [US3] Verify history entries created for TASK_ID_1 (execute: `GET /history?task_id=TASK_ID_1` verify: CREATED, COMPLETED, INCOMPLETE, DELETED entries present)
- [ ] T046 [P] [US3] Test task ordering in list (verify: incomplete tasks before completed tasks)

**Checkpoint**: ✅ US3 Complete - All 7 CRUD endpoints working; input validation enforced; history entries logged; task ordering correct

---

## Phase 6: User Story 4 & 5 - History Tracking and Analytics (Priority: P2)

**Goal**: Verify history pagination and weekly statistics endpoints work correctly

**Independent Test**: Test history pagination with filters and verify weekly stats calculation

**Acceptance Criteria**:
- History pagination returns correct metadata (total_count, total_pages, has_next, has_prev)
- Filtering by task_id returns only entries for that task
- Filtering by action_type returns only matching actions
- Weekly stats include only current week (Monday-Sunday UTC)
- Completion rate calculated correctly

**Duration**: 15-20 minutes
**Parallel Opportunities**: T047-T051 can run in parallel (different pagination and filter tests)

### History Pagination Tests

- [ ] T047 [P] [US4] Test GET /history default pagination (verify: HTTP 200, page=1, limit=10, metadata present)
- [ ] T048 [P] [US4] Test GET /history with page=2 (verify: HTTP 200, correct offset, items 11-20)
- [ ] T049 [P] [US4] Test GET /history?task_id=TASK_ID_2 (verify: HTTP 200, only TASK_ID_2 history entries)
- [ ] T050 [P] [US4] Test GET /history?action_type=CREATED (verify: HTTP 200, only CREATED entries)
- [ ] T051 [P] [US4] Test GET /history entries sorted by timestamp DESC (verify: newest first, oldest last)

### Weekly Statistics Tests

- [ ] T052 [P] [US5] Test GET /stats/weekly (verify: HTTP 200, weekly_start, weekly_end, total_tasks, completed_tasks, completion_rate)
- [ ] T053 [US5] Verify weekly boundaries are UTC Monday-Sunday (check: weekly_start ends with 00:00:00Z, weekly_end ends with 23:59:59Z)

**Checkpoint**: ✅ US4-5 Complete - History pagination with metadata correct; filtering by task and action type working; weekly stats calculated correctly

---

## Phase 7: Automated Test Execution (Polish & Quality)

**Purpose**: Run existing pytest test suite to validate all scenarios
**Dependencies**: All user stories (US1-5) complete and passing
**Duration**: 10-15 minutes

### Test Execution

- [ ] T054 [P] Run contract tests: `cd backend && pytest tests/contract/ -v` (expect: 30+ passing)
- [ ] T055 [P] Run integration tests: `cd backend && pytest tests/integration/ -v` (expect: 3+ passing)
- [ ] T056 [P] Run unit tests: `cd backend && pytest tests/unit/ -v` (expect: 7+ passing)
- [ ] T057 [P] Run all tests with coverage: `cd backend && pytest tests/ --cov=src --cov-report=term-missing` (expect: 80%+ coverage)
- [ ] T058 Test execution summary: `cd backend && pytest tests/ -v --tb=short > test_results.txt 2>&1` (save results)

**Checkpoint**: ✅ All automated tests passing (40+ total); 80%+ code coverage

---

## Phase 8: Validation Summary & Sign-off (Polish)

**Purpose**: Document validation completion
**Duration**: 5-10 minutes

- [ ] T059 Create validation report: Document all phases completed, success counts, any failures
- [ ] T060 Verify all success criteria met: Check off 30+ validation checklist items from quickstart.md
- [ ] T061 Document environment for deployment: Record Python version, database version, dependencies, port 8000

**Checkpoint**: ✅ Validation complete; ready for next phase (frontend integration or production deployment)

---

## Execution Strategy

### MVP Scope (Minimum to Demo)
Complete **Phases 1-4** (Tasks T001-T028):
- Environment verified
- Database initialized with migrations
- Server running and healthy
- 9 endpoints accessible
- **Time**: 45-60 minutes
- **Result**: Backend ready for manual testing

### Full Validation (All Phases)
Complete **Phases 1-8** (Tasks T001-T061):
- All above +
- Full CRUD testing
- History and analytics endpoints
- Automated pytest suite
- Coverage report
- **Time**: 2-2.5 hours
- **Result**: Backend fully validated and documented

### Parallel Execution Examples

**After Phase 1 (Environment Ready)**:
- Run T006 (DB connectivity) and T007 (Alembic) in parallel

**After Phase 2 (Infrastructure Ready)**:
- Run T013 (migration) sequentially, then T014-T020 (schema verification) in parallel

**After US1 Complete (Database Ready)**:
- Run T022 (server startup) sequentially, then T023-T026 (server checks) in parallel

**After US2 Complete (Server Running)**:
- Run T029-T030 (create test tasks) sequentially, then T031-T038 (endpoint tests) in parallel

---

## Success Criteria Checklist

✅ **Database Layer**:
- [ ] Alembic migrations run successfully
- [ ] Tasks and task_history tables exist
- [ ] 3 check constraints on tasks present
- [ ] 1 RESTRICT FK on task_history present
- [ ] 7 indexes created and accessible

✅ **Server & Health**:
- [ ] Server starts on port 8000 without errors
- [ ] Health check returns "healthy" status
- [ ] Swagger UI loads with 9 endpoints
- [ ] CORS headers present for localhost:3000

✅ **CRUD Operations**:
- [ ] POST /tasks creates tasks with UUID
- [ ] GET /tasks returns all (incomplete first)
- [ ] GET /tasks/{id} returns specific or 404
- [ ] PUT /tasks/{id} updates title/description
- [ ] PATCH /tasks/{id}/complete sets completed_at
- [ ] PATCH /tasks/{id}/incomplete clears completed_at
- [ ] DELETE /tasks/{id} removes task (history retained)

✅ **History & Analytics**:
- [ ] GET /history returns paginated results
- [ ] GET /history?task_id filters by task
- [ ] GET /history?action_type filters by action
- [ ] GET /stats/weekly returns UTC week boundaries
- [ ] Completion rate calculated correctly

✅ **Input Validation & Error Handling**:
- [ ] Empty title returns 422 error
- [ ] Invalid UUID returns 400 error
- [ ] Oversized title returns 422 error
- [ ] Missing fields return 422 error
- [ ] 404 returned for non-existent tasks
- [ ] Invalid JSON returns 400 error

✅ **Automated Testing**:
- [ ] Contract tests pass (30+ scenarios)
- [ ] Integration tests pass (3+ workflows)
- [ ] Unit tests pass (7+ tests)
- [ ] Coverage report shows 80%+ coverage
- [ ] No test failures or warnings

---

## Dependencies & Order

```
Phase 1: Setup (T001-T005)
    ↓
Phase 2: Foundation (T006-T012)
    ├→ Phase 3: US1 Database (T013-T021)
    │   ↓
    └→ Phase 4: US2 Server (T022-T028)
        ├→ Phase 5: US3 CRUD (T029-T046)
        │   └→ Phase 6: US4-5 Analytics (T047-T053)
        │       ↓
        └─→ Phase 7: Testing (T054-T058)
            ↓
        Phase 8: Sign-off (T059-T061)
```

**Critical Path**: T001 → T006 → T013 → T022 → T029 → T054 → T059
**Estimated Total Time**: 2-2.5 hours for complete validation

---

## Notes

- **No Code Modification**: This validation feature tests existing 002-backend-task-management implementation
- **Database Cleanup**: Use `alembic downgrade` if you need to reset database between validation runs
- **Server Management**: Use `pkill -f "python main.py"` to stop server if needed
- **Test Isolation**: Each pytest test uses function-scoped fixtures for database cleanup
- **Production Ready**: All tested code is production-ready from 002-backend-task-management feature
