---
id: 0002
title: recurring-reminder-architectural-plan
stage: plan
date: 2026-01-10
surface: agent
model: claude-sonnet-4-5-20250929
feature: 012-recurring-reminders
branch: 012-recurring-reminders
user: ashna
command: /sp.plan
labels: ["architecture", "apscheduler", "background-jobs", "fastapi-integration", "context7-research"]
links:
  spec: specs/012-recurring-reminders/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/012-recurring-reminders/plan.md
tests:
  - Constitution Check (PASSED with HPA warning)
---

## Prompt

```text
use context7 mcp for APScheduler library to be implemented properly
```

## Response snapshot

Created comprehensive architectural plan for Recurring Reminder System using APScheduler with FastAPI:

**Architecture Decision**: BackgroundScheduler (not AsyncScheduler)
- Runs in separate thread (non-blocking)
- Avoids async complexity in job functions
- Simplifies database session management with context managers
- Integrates with FastAPI lifespan for automatic startup/shutdown

**Key Design Decisions** (from Context7 APScheduler research):

1. **Scheduler Integration**: FastAPI `@asynccontextmanager` lifespan pattern
2. **Session Management**: Use existing `get_db_context()` (matches `tasks/cleanup.py`)
3. **Duplicate Prevention**: Database query (no schema changes)
4. **Error Handling**: Try/except in jobs (APScheduler catches exceptions)
5. **Threshold Windows**: 5.83h-6h for 6-hour threshold (accounts for 10-min interval)

**Technology Stack**:
- APScheduler 3.10+ (BackgroundScheduler class)
- IntervalTrigger (every 10 minutes)
- PostgreSQL (existing tables - no migrations)
- pytest + pytest-mock for testing

**Constitution Compliance**:
- ✅ All Phase 3 and Phase 4 principles satisfied
- ⚠️ HPA Limitation: Multiple replicas would duplicate schedulers
- **Mitigation**: Single replica recommended for Phase 4
- **Future**: Distributed scheduler with shared datastore

**Project Structure**:
- **New**: `services/reminder_service.py`, `tasks/reminder_scheduler.py`
- **Modified**: `main.py` (lifespan), `config/settings.py` (env vars)
- **Frontend**: No changes (existing polling handles new notifications)

**Performance Targets**:
- Process 1,000 tasks in <2 seconds
- Job execution <500ms
- Database query <100ms per task

**Research Findings** (Context7):
- FastAPI lifespan + APScheduler best practices
- BackgroundScheduler vs AsyncScheduler tradeoffs
- Database session management in threaded jobs
- Misfire grace time and max_instances configuration
- Error handling patterns (exceptions logged, not propagated)

## Outcome

- ✅ Impact: Complete architectural plan with APScheduler integration strategy, constitution compliance analysis, component architecture diagrams, execution flows, and implementation appendices. Ready for task generation.
- 🧪 Tests: Constitution Check PASSED (all Phase 3/4 principles satisfied with HPA limitation documented)
- 📁 Files: plan.md (623 lines) with research, design, contracts, and appendices
- 🔁 Next prompts: `/sp.tasks` (generate implementation tasks) or continue with Phase 1 artifacts (research.md, data-model.md, contracts/, quickstart.md)
- 🧠 Reflection: Context7 MCP integration was highly effective - APScheduler documentation provided clear patterns for FastAPI integration, session management, and error handling. The decision to use BackgroundScheduler (thread-based) over AsyncScheduler simplifies implementation significantly by avoiding async complexity in job functions.

## Evaluation notes (flywheel)

- Failure modes observed: Initial spec directory numbering conflict (010 vs 012) - resolved by renaming directories and updating branch
- Graders run and results (PASS/FAIL): Constitution Check PASSED (all gates), HPA limitation documented as acceptable for Phase 4
- Prompt variant (if applicable): Standard /sp.plan with Context7 MCP research integration
- Next experiment (smallest change to try): Proceed to `/sp.tasks` to generate detailed implementation tasks OR create Phase 1 artifacts (research.md, data-model.md, contracts/) before tasks
