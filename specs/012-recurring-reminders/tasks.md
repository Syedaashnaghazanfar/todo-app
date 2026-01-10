# Tasks: Recurring Reminder System

**Input**: Design documents from `/specs/012-recurring-reminders/`
**Prerequisites**: plan.md ✅, spec.md ✅

**Tests**: Test tasks are included per spec requirement (P3-VII: Testing Requirements)

**Organization**: Tasks grouped by user story to enable independent implementation and testing

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4, US5)
- Include exact file paths in descriptions

## Path Conventions

This project follows the **Web application** structure:
- Backend: `phase-4/backend/src/backend/`
- Frontend: No changes (existing notification system reused)
- Tests: `phase-4/backend/tests/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and dependency installation

- [X] T001 Add apscheduler==3.10.4 to phase-4/backend/requirements.txt
- [X] T002 Install dependencies with `uv sync` in phase-4/backend/
- [X] T003 [P] Add configuration constants to phase-4/backend/src/backend/config/settings.py (REMINDER_CHECK_INTERVAL, REMINDER_ENABLE_OVERDUE, REMINDER_THRESHOLDS)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core reminder infrastructure that all user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T004 Create ReminderService class skeleton in phase-4/backend/src/backend/services/reminder_service.py
- [X] T005 [P] Create check_reminders_job function skeleton in phase-4/backend/src/backend/tasks/reminder_scheduler.py
- [X] T006 [P] Configure APScheduler BackgroundScheduler in phase-4/backend/src/backend/tasks/reminder_scheduler.py with UTC timezone and job_defaults (max_instances=1, misfire_grace_time=300, coalesce=True)
- [X] T007 Integrate scheduler with FastAPI lifespan in phase-4/backend/src/backend/main.py using @asynccontextmanager pattern
- [X] T008 Add scheduler startup and shutdown logging to phase-4/backend/src/backend/main.py lifespan

**Checkpoint**: Foundation ready - scheduler starts/stops with FastAPI, job registered but does nothing yet

---

## Phase 3: User Story 1 - Progressive Deadline Alerts (Priority: P1) 🎯 MVP

**Goal**: Users receive 5 escalating reminders (6h, 3h, 1h, 30m, 15m) as VERY_IMPORTANT task deadlines approach

**Independent Test**: Create VERY_IMPORTANT task due in 7 hours → Verify 5 notifications appear at correct intervals

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T009 [P] [US1] Unit test for should_create_notification() threshold window logic in phase-4/backend/tests/unit/services/test_reminder_service.py
- [X] T010 [P] [US1] Unit test for get_threshold_message() emoji and format in phase-4/backend/tests/unit/services/test_reminder_service.py
- [X] T011 [P] [US1] Unit test for notification_exists() duplicate detection in phase-4/backend/tests/unit/services/test_reminder_service.py
- [X] T012 [P] [US1] Integration test for check_and_create_reminders() with mock database in phase-4/backend/tests/integration/test_reminder_integration.py

### Implementation for User Story 1

- [X] T013 [P] [US1] Implement should_create_notification(task, threshold_hours, window=0.17) method in phase-4/backend/src/backend/services/reminder_service.py
- [X] T014 [P] [US1] Implement get_threshold_message(task, threshold_hours) method with emojis (⏰, ⚠️, 🚨, 🔴, 🚨🚨) in phase-4/backend/src/backend/services/reminder_service.py
- [X] T015 [P] [US1] Implement notification_exists(db, task_id, message) method in phase-4/backend/src/backend/services/reminder_service.py
- [X] T016 [US1] Implement check_and_create_reminders(db) method with VERY_IMPORTANT task query and threshold loop in phase-4/backend/src/backend/services/reminder_service.py (depends on T013, T014, T015)
- [X] T017 [US1] Wire check_reminders_job() to call ReminderService.check_and_create_reminders() with database session in phase-4/backend/src/backend/tasks/reminder_scheduler.py
- [X] T018 [US1] Add comprehensive logging to check_reminders_job() (start, task count, notification count, duration, errors) in phase-4/backend/src/backend/tasks/reminder_scheduler.py
- [X] T019 [US1] Add try/except error handling to check_reminders_job() in phase-4/backend/src/backend/tasks/reminder_scheduler.py

**Checkpoint**: Create VERY_IMPORTANT task → Background job creates 5 notifications at correct thresholds

---

## Phase 4: User Story 2 - Automatic Reminder Lifecycle (Priority: P1)

**Goal**: Reminders automatically start for new tasks and stop when tasks are completed - zero user configuration required

**Independent Test**: Create VERY_IMPORTANT task → Get 1 reminder → Complete task → Verify no future reminders

### Tests for User Story 2

- [X] T020 [P] [US2] Unit test for task filtering logic (priority, status, due_date checks) in phase-4/backend/tests/unit/services/test_reminder_service.py
- [X] T021 [P] [US2] Integration test for completed task stopping reminders in phase-4/backend/tests/integration/test_reminder_integration.py
- [X] T022 [P] [US2] Integration test for multiple tasks with independent reminders in phase-4/backend/tests/integration/test_reminder_integration.py

### Implementation for User Story 2

- [X] T023 [P] [US2] Add task status filtering (skip COMPLETED tasks) to check_and_create_reminders() in phase-4/backend/src/backend/services/reminder_service.py
- [X] T024 [P] [US2] Add task priority filtering (ONLY VERY_IMPORTANT) to check_and_create_reminders() query in phase-4/backend/src/backend/services/reminder_service.py
- [X] T025 [US2] Add task due_date NULL check to check_and_create_reminders() query in phase-4/backend/src/backend/services/reminder_service.py
- [X] T026 [US2] Add logging for filtered task count (completed, non-VERY_IMPORTANT, no due_date) in phase-4/backend/src/backend/services/reminder_service.py

**Checkpoint**: Completed tasks don't create new reminders, only VERY_IMPORTANT tasks monitored

---

## Phase 5: User Story 3 - Zero Duplicate Notifications (Priority: P1)

**Goal**: Each threshold (6h, 3h, 1h, 30m, 15m) triggers exactly once per task - no duplicates

**Independent Test**: Create VERY_IMPORTANT task → Wait for multiple job runs → Verify exactly 5 notifications (no duplicates)

### Tests for User Story 3

- [X] T027 [P] [US3] Unit test for duplicate prevention with existing notification in phase-4/backend/tests/unit/services/test_reminder_service.py
- [X] T028 [P] [US3] Integration test for multiple job runs creating no duplicates in phase-4/backend/tests/integration/test_reminder_integration.py
- [X] T029 [P] [US3] Edge case test for threshold window boundary conditions (5.83h, 6h) in phase-4/backend/tests/unit/services/test_reminder_service.py

### Implementation for User Story 3

- [X] T030 [P] [US3] Implement exact message matching in notification_exists() query (WHERE task_id=X AND message=Y) in phase-4/backend/src/backend/services/reminder_service.py
- [X] T031 [US3] Add duplicate check before notification creation in check_and_create_reminders() loop in phase-4/backend/src/backend/services/reminder_service.py
- [X] T032 [US3] Add logging for skipped duplicate notifications in phase-4/backend/src/backend/services/reminder_service.py

**Checkpoint**: Running job multiple times in threshold window creates notification only once

---

## Phase 6: User Story 4 - Overdue Task Notifications (Priority: P2)

**Goal**: Users are notified when VERY_IMPORTANT tasks become overdue (missed deadline)

**Independent Test**: Create VERY_IMPORTANT task due in 10 minutes → Wait for overdue → Verify overdue notification created

### Tests for User Story 4

- [X] T033 [P] [US4] Unit test for overdue detection logic (hours_remaining < 0) in phase-4/backend/tests/unit/services/test_reminder_service.py
- [X] T034 [P] [US4] Integration test for overdue notification creation in phase-4/backend/tests/integration/test_reminder_integration.py
- [X] T035 [P] [US4] Unit test for overdue notification message format ("❌ OVERDUE") in phase-4/backend/tests/unit/services/test_reminder_service.py

### Implementation for User Story 4

- [X] T036 [P] [US4] Add REMINDER_ENABLE_OVERDUE check to configuration in phase-4/backend/src/backend/config/settings.py
- [X] T037 [P] [US4] Implement overdue detection (hours_remaining < 0) in check_and_create_reminders() loop in phase-4/backend/src/backend/services/reminder_service.py
- [X] T038 [P] [US4] Add overdue message generation ("❌ OVERDUE: Task 'X' is now overdue!") in get_threshold_message() in phase-4/backend/src/backend/services/reminder_service.py
- [X] T039 [US4] Add duplicate prevention for overdue notifications in check_and_create_reminders() in phase-4/backend/src/backend/services/reminder_service.py
- [X] T040 [US4] Add logging for overdue notifications created in phase-4/backend/src/backend/services/reminder_service.py

**Checkpoint**: Overdue tasks trigger single overdue notification when REMINDER_ENABLE_OVERDUE=true

---

## Phase 7: User Story 5 - System Resilience Across Restarts (Priority: P2)

**Goal**: Scheduler automatically resumes monitoring after backend restart - no manual intervention

**Independent Test**: Create VERY_IMPORTANT task → Stop backend → Start backend → Verify reminders resume

### Tests for User Story 5

- [X] T041 [P] [US5] Integration test for scheduler startup in FastAPI lifespan in phase-4/backend/tests/integration/test_reminder_scheduler.py
- [X] T042 [P] [US5] Integration test for scheduler shutdown in FastAPI lifespan in phase-4/backend/tests/integration/test_reminder_scheduler.py
- [X] T043 [P] [US5] Integration test for scheduler state recovery from database in phase-4/backend/tests/integration/test_reminder_scheduler.py

### Implementation for User Story 5

- [X] T044 [P] [US5] Add scheduler startup logging (scheduler started, job registered, interval) in phase-4/backend/src/backend/main.py lifespan
- [X] T045 [P] [US5] Add scheduler shutdown logging (scheduler stopped, jobs flushed) in phase-4/backend/src/backend/main.py lifespan
- [X] T046 [P] [US5] Add error handling for scheduler startup failures in phase-4/backend/src/backend/main.py lifespan
- [X] T047 [US5] Verify database session cleanup on scheduler shutdown in phase-4/backend/src/backend/tasks/reminder_scheduler.py
- [X] T048 [US5] Add health check for scheduler status (optional) in phase-4/backend/src/backend/api/v1/health.py

**Checkpoint**: Restart backend → Scheduler starts automatically, resumes checking tasks from database

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Code quality, documentation, and production readiness

- [X] T049 [P] Add comprehensive docstrings to ReminderService methods in phase-4/backend/src/backend/services/reminder_service.py
- [X] T050 [P] Add comprehensive docstrings to scheduler functions in phase-4/backend/src/backend/tasks/reminder_scheduler.py
- [X] T051 [P] Create quickstart.md with local testing guide in specs/012-recurring-reminders/quickstart.md
- [X] T052 [P] Add database query optimization indexes (priority, status, due_date) documentation in specs/012-recurring-reminders/plan.md Appendix B
- [X] T053 Verify all tests pass with `pytest phase-4/backend/tests/`
- [X] T054 Run linting and type checking on reminder service code
- [X] T055 Update phase-4/SERVICES_STATUS.md with reminder scheduler status (if applicable)
- [X] T056 [P] Document HPA limitation (single replica recommended) in deployment documentation
- [X] T057 Add monitoring metrics logging (job execution time, tasks checked, notifications created) to check_reminders_job()

---

## Dependencies & Execution Strategy

### User Story Dependency Graph

```
Setup (Phase 1)
    ↓
Foundational (Phase 2)
    ↓
┌─────────────────┬──────────────────┬───────────────────┐
│                 │                  │                   │
US1 (Phase 3)    US2 (Phase 4)     US3 (Phase 5)      US4 (Phase 6)
Progressive      Lifecycle          Duplicates         Overdue
Alerts           Automation         Prevention         Notifications
│                 │                  │                   │
└─────────────────┴──────────────────┴───────────────────┘
                            ↓
                     US5 (Phase 7)
                     System Resilience
                            ↓
                   Polish (Phase 8)
```

**Dependency Notes**:
- **Phase 1 & 2**: MUST complete before any user story
- **US1, US2, US3**: Can be implemented in parallel after Phase 2 (different methods in same service)
- **US4**: Depends on US1 (extends threshold logic)
- **US5**: Depends on US1 (needs working scheduler to test resilience)
- **Phase 8**: Should run after all user stories complete

### Parallel Execution Examples

**After Phase 2 completes**:
```bash
# 3 developers can work in parallel:
Dev 1: T013-T019 (US1 - Progressive Alerts)
Dev 2: T023-T026 (US2 - Lifecycle Automation)
Dev 3: T030-T032 (US3 - Duplicate Prevention)
```

**After US1-US3 complete**:
```bash
# 2 developers can work in parallel:
Dev 1: T036-T040 (US4 - Overdue Notifications)
Dev 2: T044-T048 (US5 - System Resilience)
```

**During Polish phase**:
```bash
# All tasks can run in parallel:
Dev 1: T049, T050 (Docstrings)
Dev 2: T051, T052 (Documentation)
Dev 3: T053, T054 (Testing & Linting)
Dev 4: T055, T056, T057 (Deployment docs & metrics)
```

### MVP Scope Recommendation

**Minimum Viable Product (MVP)**: Phase 1, 2, 3 only
- ✅ Setup infrastructure (T001-T003)
- ✅ Foundational scheduler (T004-T008)
- ✅ User Story 1: Progressive Deadline Alerts (T009-T019)

**Result**: Users get basic recurring reminders for VERY_IMPORTANT tasks

**Next Increments**:
- **Increment 2**: Add US2 (automatic lifecycle) - 4 tasks
- **Increment 3**: Add US3 (duplicate prevention) - 3 tasks
- **Increment 4**: Add US4 (overdue notifications) - 5 tasks
- **Increment 5**: Add US5 (system resilience) - 5 tasks
- **Final**: Polish (Phase 8) - 9 tasks

---

## Implementation Strategy

### Test-Driven Development (TDD) Approach

For each user story:
1. **Write tests FIRST** (T0XX tasks with [P] marker)
2. **Verify tests FAIL** (RED phase)
3. **Implement functionality** (T0XX tasks)
4. **Verify tests PASS** (GREEN phase)
5. **Refactor if needed** (improve code quality)

### Task Execution Order

**Sequential Execution** (recommended for single developer):
```
T001 → T002 → T003 → T004 → T005 → T006 → T007 → T008
→ T009 → T010 → T011 → T012 → T013 → ... → T057
```

**Parallel Execution** (recommended for team):
- Identify tasks with `[P]` marker
- Assign to different developers
- Merge frequently to avoid conflicts

### Checkpoint Validation

After each phase checkpoint:
- [ ] Run all tests for that user story: `pytest -k "US1"` (or US2, US3, etc.)
- [ ] Verify independent test criteria from spec.md
- [ ] Manual test: Follow "Independent Test" instructions from phase header
- [ ] Review logs for expected output
- [ ] Commit working increment to git

---

## Task Summary

**Total Tasks**: 57

**Breakdown by Phase**:
- Phase 1 (Setup): 3 tasks
- Phase 2 (Foundational): 5 tasks
- Phase 3 (US1 - Progressive Alerts): 11 tasks (4 tests + 7 implementation)
- Phase 4 (US2 - Lifecycle): 7 tasks (3 tests + 4 implementation)
- Phase 5 (US3 - Duplicates): 6 tasks (3 tests + 3 implementation)
- Phase 6 (US4 - Overdue): 8 tasks (3 tests + 5 implementation)
- Phase 7 (US5 - Resilience): 8 tasks (3 tests + 5 implementation)
- Phase 8 (Polish): 9 tasks

**Parallelizable Tasks**: 38 tasks marked with [P]

**Independent Test Criteria**:
- US1: Create task due in 7h → Get 5 notifications at intervals
- US2: Complete task → No future reminders
- US3: Multiple job runs → Exactly 5 notifications (no duplicates)
- US4: Task overdue → Get overdue notification
- US5: Restart backend → Scheduler resumes automatically

**Estimated Effort**:
- MVP (Phases 1-3): ~2-3 days (1 developer)
- Full Feature (All Phases): ~4-5 days (1 developer)
- With Team (3 developers): ~1.5-2 days (leveraging parallelization)

---

## Format Validation

✅ All 57 tasks follow strict checklist format:
- [x] Checkbox prefix `- [ ]`
- [x] Sequential Task IDs (T001-T057)
- [x] [P] markers for parallelizable tasks (38 tasks)
- [x] [Story] labels for user story phases (US1-US5)
- [x] Clear descriptions with exact file paths
- [x] Dependencies documented in graph and execution strategy

**Ready for immediate execution** - Each task is specific enough for implementation without additional context.
