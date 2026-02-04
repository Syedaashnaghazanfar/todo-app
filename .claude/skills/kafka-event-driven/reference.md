# Kafka Event-Driven Architecture Reference

This reference document supports the `kafka-event-driven` Skill for Phase V.

It standardizes **event-driven architecture patterns** using Kafka via Dapr Pub/Sub.

---

## 1. Scope of This Reference

This file focuses on **event-driven patterns**:

- Event schema design and versioning
- Producer patterns (publishing via Dapr)
- Consumer patterns (subscribing via Dapr)
- Partitioning strategies (user_id-based)
- Dead letter queue (DLQ) handling
- Retry strategies
- Idempotency patterns

All examples use **Dapr Pub/Sub** to abstract Kafka.

---

## 2. Event Schema Design

### Versioned Event Schema

```python
class TaskEvent(BaseModel):
    event_id: str
    event_type: Literal["task.created", "task.updated", "task.completed", "task.deleted"]
    event_version: str = "1.0"
    task_id: int
    user_id: str  # Required
    timestamp: datetime
    payload: dict
```

### Event Schema Registry

```python
EVENT_SCHEMAS = {
    "task.created": TaskEvent,
    "task.completed": TaskEvent,
    "reminder.due": ReminderEvent,
}
```

---

## 3. Kafka Topics (Phase V)

### Required Topics

1. **task-events** - All task CRUD operations
2. **reminders** - Reminder scheduling and delivery
3. **task-updates** - Real-time client sync

### Topic Configuration

```yaml
topics:
  - name: task-events
    partitions: 12
    retention.ms: 604800000  # 7 days (local)
    # retention.ms: 2592000000  # 30 days (cloud)
```

---

## 4. Publishing Events (via Dapr)

### API Endpoint

```
POST /v1.0/publish/{pubsubName}/{topic}
```

### Example

```python
url = "http://localhost:3500/v1.0/publish/kafka-pubsub/task-events"
await httpx.post(url, json={
    "event_type": "task.completed",
    "user_id": "user-456",
    "task_id": 123
})
```

---

## 5. Consuming Events (via Dapr)

### Subscription Endpoint

```python
@app.post("/dapr/subscribe")
async def subscribe():
    return [{
        "pubsubname": "kafka-pubsub",
        "topic": "task-events",
        "route": "/api/events/task-events"
    }]
```

### Event Handler

```python
@app.post("/api/events/task-events")
async def handle_event(request: Request):
    cloud_event = await request.json()
    event_data = cloud_event.get("data", {})
    # Process event
```

---

## 6. Partitioning Strategy

### User ID Partitioning

Events are partitioned by `user_id` to ensure:
- Events for same user are processed in order
- Parallel processing across users
- User isolation

```python
# Always include user_id
event = {"user_id": user_id, "task_id": task_id}
```

---

## 7. Dead Letter Queue (DLQ)

### Retry Strategies

```python
RETRY_STRATEGIES = {
    "task.completed": [30, 300, 1800],  # 30s, 5min, 30min
    "reminder.due": [1, 2, 4, 8, 16, 32, 64, 128, 256, 512],
    "task.updated": [1, 2, 4, 8, 16],
}
```

### DLQ Publishing

```python
# Move to DLQ after max retries
await publish_event("dlq", failed_event)
```

---

## 8. Idempotency

### Idempotency Key

```python
event_id = f"{event_type}-{task_id}-{timestamp}"
```

### Check Before Processing

```python
processed = await dapr.get_state(f"event-processed-{event_id}")
if processed:
    return  # Already processed
```

---

## 9. CloudEvents Format

Dapr wraps events in CloudEvents:

```json
{
  "specversion": "1.0",
  "type": "task.completed",
  "source": "todo-service",
  "id": "event-id-123",
  "data": {
    "event_type": "task.completed",
    "task_id": 123
  }
}
```

---

## 10. Best Practices

1. **Always include user_id** for partitioning
2. **Version your events** for compatibility
3. **Use idempotency keys** to prevent duplicates
4. **Implement retry logic** with exponential backoff
5. **Handle DLQ** for failed events
6. **Extract from CloudEvents** format

---

## References

- [Dapr Pub/Sub API](https://docs.dapr.io/reference/api/pubsub_api/)
- [CloudEvents Specification](https://cloudevents.io/)
- [Kafka Python Client](https://kafka-python.readthedocs.io/)

