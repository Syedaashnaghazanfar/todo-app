# Backend Validation & Testing Quickstart

**Feature**: 003-validate-backend | **Date**: 2025-12-11

## Quick Links

- **Specification**: [spec.md](./spec.md) - Feature requirements
- **Implementation Plan**: [plan.md](./plan.md) - Validation phases
- **Database Schema**: [data-model.md](./data-model.md) - Tables, constraints, indexes
- **API Contracts**: [contracts/endpoints.md](./contracts/endpoints.md) - 9 endpoint specifications

## Prerequisites

Before starting validation, ensure:

```bash
# 1. Navigate to backend directory
cd backend

# 2. Verify Python version
python --version
# Expected: Python 3.8+

# 3. Verify dependencies installed
pip list | grep -E "fastapi|sqlalchemy|alembic|pytest"
# Expected: All present

# 4. Verify .env file configured
cat .env | grep DATABASE_URL
# Expected: Valid Neon PostgreSQL URL

# 5. Verify Alembic configured
ls alembic/
# Expected: env.py, versions/ directory
```

## Validation Phases

### Phase 0: Environment Check (5 min)

```bash
# Check Python version
python --version

# Check dependencies
pip list | grep -E "fastapi|sqlalchemy|alembic|pytest|httpx"

# Check .env file
cat .env | head -5

# Test database connectivity (optional)
python -c "
import os
from sqlalchemy import create_engine
db_url = os.getenv('DATABASE_URL')
engine = create_engine(db_url, echo=False)
with engine.connect() as conn:
    result = conn.execute('SELECT 1 as test')
    print('Database connection:', result.fetchone())
"
```

### Phase 1: Database Migrations (10 min)

```bash
# Run Alembic migrations to create tables
alembic upgrade head
# Expected: "Successfully applied [timestamp] initial schema"

# Verify migrations applied
alembic current
# Expected: Shows current revision (head)

# Verify schema created (optional)
psql $DATABASE_URL -c "
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
"
# Expected: Shows 'tasks' and 'task_history' tables

# Verify constraints exist
psql $DATABASE_URL -c "
SELECT constraint_name, constraint_type
FROM information_schema.constraint_column_usage
WHERE table_name IN ('tasks', 'task_history');
"
# Expected: Shows FK and CHECK constraints

# Verify indexes exist
psql $DATABASE_URL -c "
SELECT indexname FROM pg_indexes
WHERE tablename IN ('tasks', 'task_history');
"
# Expected: Shows 7 indexes (3 on tasks + 4 on task_history)
```

### Phase 2: Server Startup (5 min)

```bash
# Terminal 1: Start the backend server
python main.py
# Expected: "INFO:     Uvicorn running on http://0.0.0.0:8000"

# Terminal 2: Test health endpoint (while server running)
curl http://localhost:8000/api/v1/health
# Expected: {"status": "healthy", "service": "todo-app-backend"}

# Access Swagger UI
open http://localhost:8000/api/docs
# Or: curl http://localhost:8000/api/docs
# Expected: Loads Swagger interactive API documentation with 9 endpoints
```

### Phase 3: Manual Endpoint Testing (30 min)

Use cURL, Postman, or httpx to test each endpoint:

#### 3a. Create Task

```bash
curl -X POST http://localhost:8000/api/v1/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Task 1",
    "description": "This is a test task"
  }'
# Expected: 201 Created with task object and UUID id

# Save the id for next tests
TASK_ID="<id-from-response>"
```

#### 3b. List Tasks

```bash
curl http://localhost:8000/api/v1/tasks
# Expected: 200 OK with array of tasks (incomplete first)
```

#### 3c. Get Single Task

```bash
curl http://localhost:8000/api/v1/tasks/$TASK_ID
# Expected: 200 OK with specific task
```

#### 3d. Update Task

```bash
curl -X PUT http://localhost:8000/api/v1/tasks/$TASK_ID \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Test Task 1"
  }'
# Expected: 200 OK with updated task, newer updated_at timestamp
```

#### 3e. Mark Complete

```bash
curl -X PATCH http://localhost:8000/api/v1/tasks/$TASK_ID/complete
# Expected: 200 OK with is_completed=true, completed_at timestamp set
```

#### 3f. Mark Incomplete

```bash
curl -X PATCH http://localhost:8000/api/v1/tasks/$TASK_ID/incomplete
# Expected: 200 OK with is_completed=false, completed_at=null
```

#### 3g. Get History

```bash
curl "http://localhost:8000/api/v1/history?page=1&limit=10"
# Expected: 200 OK with array of history entries, pagination metadata

# Filter by task
curl "http://localhost:8000/api/v1/history?task_id=$TASK_ID"
# Expected: Shows only history for this task
```

#### 3h. Get Weekly Stats

```bash
curl http://localhost:8000/api/v1/stats/weekly
# Expected: 200 OK with weekly_start, weekly_end, total_tasks, completed_tasks, completion_rate
```

#### 3i. Delete Task

```bash
curl -X DELETE http://localhost:8000/api/v1/tasks/$TASK_ID
# Expected: 200 OK with success message

# Verify deleted
curl http://localhost:8000/api/v1/tasks/$TASK_ID
# Expected: 404 Not Found
```

#### 3j. Input Validation Tests

```bash
# Test empty title
curl -X POST http://localhost:8000/api/v1/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": ""}'
# Expected: 422 Unprocessable Entity with error

# Test invalid UUID
curl http://localhost:8000/api/v1/tasks/invalid-uuid
# Expected: 400 Bad Request

# Test oversized title
curl -X POST http://localhost:8000/api/v1/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "'$(python -c "print(\"x\" * 300)\")'}'
# Expected: 422 with validation error
```

### Phase 4: Automated Test Execution (15 min)

```bash
# Run all tests with verbose output
pytest tests/ -v

# Expected output shows:
# - 30+ contract tests PASSED (API endpoints)
# - 3+ integration tests PASSED (workflows)
# - 7+ unit tests PASSED (services, validators)
# - ====== XXX passed in XXs ======

# Run specific test file
pytest tests/contract/test_tasks_create.py -v

# Run with coverage report
pytest tests/ --cov=src --cov-report=term-missing
# Expected: 80%+ coverage of src code

# Run specific test
pytest tests/contract/test_tasks_create.py::test_create_task_success -v
```

## Validation Checklist

Use this checklist to track completion:

### Database Layer
- [ ] Alembic migrations run successfully
- [ ] `tasks` table exists with 7 columns
- [ ] `task_history` table exists with 5 columns
- [ ] 3 check constraints on tasks table present
- [ ] 1 RESTRICT foreign key on task_history present
- [ ] 7 indexes present and accessible
- [ ] Database supports schema introspection queries

### Server & Health
- [ ] Server starts without errors on port 8000
- [ ] GET /health returns status "healthy"
- [ ] GET /docs loads Swagger UI
- [ ] CORS headers present for localhost:3000 requests
- [ ] All 9 endpoints listed in Swagger UI

### CRUD Operations
- [ ] POST /tasks creates task with UUID
- [ ] GET /tasks returns all tasks (incomplete first)
- [ ] GET /tasks/{id} returns single task or 404
- [ ] PUT /tasks/{id} updates title/description only
- [ ] PATCH /tasks/{id}/complete sets completed_at
- [ ] PATCH /tasks/{id}/incomplete clears completed_at
- [ ] DELETE /tasks/{id} removes task (history retained)
- [ ] Each operation creates history entry

### History & Analytics
- [ ] GET /history returns paginated results
- [ ] GET /history?task_id={id} filters by task
- [ ] GET /history?action_type=COMPLETED filters correctly
- [ ] Pagination metadata accurate (total_count, has_next, etc.)
- [ ] GET /stats/weekly returns UTC week boundaries
- [ ] Completion rate calculated correctly

### Validation & Error Handling
- [ ] Empty title returns 422 error
- [ ] Invalid UUID returns 400 error
- [ ] Oversized title returns 422 error
- [ ] Missing required fields return 422 error
- [ ] 404 returned for non-existent tasks
- [ ] Invalid JSON returns 400 error

### Test Execution
- [ ] pytest runs without errors
- [ ] Contract tests all pass (30+ scenarios)
- [ ] Integration tests all pass (3+ workflows)
- [ ] Unit tests all pass (7+ tests)
- [ ] Coverage report shows 80%+ coverage
- [ ] No test failures or warnings

## Common Commands Reference

```bash
# Database
alembic upgrade head                    # Run migrations
alembic current                         # Show current migration
psql $DATABASE_URL -c "SELECT ..."     # Run SQL query

# Server
python main.py                          # Start dev server
Ctrl+C                                  # Stop server

# Testing
pytest tests/ -v                        # Run all tests verbose
pytest tests/ -k "create"               # Run tests matching pattern
pytest tests/ --cov=src                 # With coverage report
pytest tests/contract/ -v               # Run contract tests only

# API
curl http://localhost:8000/api/v1/tasks              # GET request
curl -X POST http://localhost:8000/api/v1/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Task"}'               # POST request

# Check installation
pip list                                # Show installed packages
python --version                        # Show Python version
```

## Troubleshooting

### Database Connection Error

```
Error: could not connect to server: Connection refused
```

**Solution**:
1. Verify DATABASE_URL in .env is correct
2. Check Neon PostgreSQL credentials
3. Ensure internet connection active
4. Test connection: `psql $DATABASE_URL -c "SELECT 1"`

### Migration Fails

```
Error: FAILED: Table 'tasks' already exists
```

**Solution**:
1. Check if migrations already applied: `alembic current`
2. If already at head, skip migration
3. If reset needed: manually drop tables and rerun migrations

### Server Won't Start

```
OSError: [Errno 98] Address already in use
```

**Solution**:
1. Kill existing process on port 8000: `lsof -ti :8000 | xargs kill -9`
2. Or change APP_PORT in .env to different port
3. Restart with: `python main.py`

### Import Errors

```
ModuleNotFoundError: No module named 'fastapi'
```

**Solution**:
1. Verify venv activated
2. Reinstall dependencies: `pip install -r requirements.txt`
3. Check pip version: `pip --version`

## Success Criteria

✅ **Validation Complete When**:
1. All migrations apply successfully
2. Server starts without errors
3. All 9 endpoints respond correctly
4. All 40+ pytest tests pass
5. Input validation rejects invalid requests
6. History entries created for all operations
7. No errors in database constraints
8. CORS configured for frontend integration
9. All checklist items completed

---

## Next Steps

After successful validation:

1. **Create Tasks**: Run `/sp.tasks` to generate implementation tasks (if needed)
2. **Frontend Integration**: Begin frontend API client integration
3. **Deployment**: Move to production environment testing
4. **Load Testing**: Conduct performance testing with concurrent users

---

**Estimated Total Time**: 60-90 minutes for complete validation
**Resources**: Python 3.8+, PostgreSQL client, curl or Postman, pytest
**Success Indicators**: All tests pass, no errors, complete checklist
