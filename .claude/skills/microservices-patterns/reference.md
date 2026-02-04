# Microservices Patterns Reference

This reference document supports the `microservices-patterns` Skill for Phase V.

It standardizes **microservices architecture patterns** for event-driven systems.

---

## 1. Scope of This Reference

This file focuses on **microservices patterns**:

- Service-to-service communication (Dapr Service Invocation)
- User isolation patterns
- Idempotency patterns
- Event-driven service design
- Health checks
- Error handling and retries
- Service configuration

---

## 2. Service-to-Service Communication

### Dapr Service Invocation

**Endpoint:** `POST /v1.0/invoke/{appId}/method/{method}`

```python
url = f"http://localhost:3500/v1.0/invoke/{app_id}/method/{method}"
response = await httpx.post(url, json=data)
```

**Benefits:**
- Automatic service discovery
- Built-in mTLS
- Retry and timeout policies
- Distributed tracing

---

## 3. User Isolation

### Always Include user_id

```python
# ✅ Good
data = {"user_id": user_id, "task_id": task_id}

# ❌ Bad
data = {"task_id": task_id}  # Missing user_id
```

### Filter by user_id in Database

```python
statement = select(Task).where(Task.user_id == user_id)
```

---

## 4. Idempotency

### Idempotency Key

```python
idempotency_key = f"{operation}-{task_id}-{timestamp}"
```

### Check Before Operation

```python
existing = await dapr.get_state(f"operation-{idempotency_key}")
if existing:
    return existing  # Already processed
```

---

## 5. Event-Driven Service Design

### Subscribe to Events

```python
@app.post("/dapr/subscribe")
async def subscribe():
    return [{
        "pubsubname": "kafka-pubsub",
        "topic": "task-events",
        "route": "/api/events/task-events"
    }]
```

### Process Events

```python
@app.post("/api/events/task-events")
async def handle_event(request: Request):
    cloud_event = await request.json()
    event_data = cloud_event.get("data", {})
    # Process event
```

---

## 6. Health Checks

### Liveness Probe

```python
@app.get("/health")
async def health():
    return {"status": "healthy"}
```

### Readiness Probe

```python
@app.get("/health/ready")
async def ready():
    # Check dependencies
    return {"status": "ready"}
```

---

## 7. Error Handling

### Retry with Exponential Backoff

```python
async def retry(operation, max_retries=3):
    for attempt in range(max_retries):
        try:
            return await operation()
        except Exception:
            if attempt == max_retries - 1:
                raise
            await asyncio.sleep(2 ** attempt)
```

---

## 8. Service Configuration

### Environment Variables

```python
class ServiceConfig(BaseSettings):
    service_name: str
    dapr_port: int = 3500
    
    class Config:
        env_prefix = "SERVICE_"
```

---

## References

- [Dapr Service Invocation](https://docs.dapr.io/reference/api/service_invocation_api/)
- [Microservices Patterns](https://microservices.io/patterns/)

