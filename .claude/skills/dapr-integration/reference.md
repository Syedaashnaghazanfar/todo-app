# Dapr Integration Reference

This reference document supports the `dapr-integration` Skill for Phase V.

It standardizes **how to integrate Dapr building blocks** into microservices using HTTP APIs.

---

## 1. Scope of This Reference

This file focuses on **Dapr HTTP API patterns**:

- Pub/Sub API for event publishing/subscription
- State Store API for key-value state management
- Jobs API for scheduled job execution
- Secrets API for credential management
- Service Invocation API for service-to-service calls

All examples use **HTTP/JSON** to communicate with Dapr sidecar (port 3500).

---

## 2. Dapr Sidecar Configuration

### Default Port

Dapr sidecar runs on port **3500** by default.

```python
DAPR_PORT = 3500
DAPR_URL = f"http://localhost:{DAPR_PORT}"
```

### Kubernetes Deployment with Dapr

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
spec:
  template:
    metadata:
      annotations:
        dapr.io/enabled: "true"
        dapr.io/app-id: "backend"
        dapr.io/app-port: "8000"
        dapr.io/config: "dapr-config"
    spec:
      containers:
        - name: backend
          image: backend:latest
          env:
            - name: DAPR_HTTP_PORT
              value: "3500"
```

---

## 3. Pub/Sub API Reference

### Publish Event

**Endpoint:** `POST /v1.0/publish/{pubsubName}/{topic}`

```python
url = f"http://localhost:3500/v1.0/publish/{pubsub_name}/{topic}"
response = await httpx.post(url, json=event_data)
```

**Parameters:**
- `pubsubName`: Name of Dapr Pub/Sub component (e.g., "kafka-pubsub")
- `topic`: Kafka topic name (e.g., "task-events")
- `event_data`: JSON event payload

**Example:**
```python
await httpx.post(
    "http://localhost:3500/v1.0/publish/kafka-pubsub/task-events",
    json={
        "event_type": "task.completed",
        "task_id": 123,
        "user_id": "user-456"
    }
)
```

### Subscribe to Events

**Endpoint:** `POST /dapr/subscribe` (in your app)

Your service must expose a subscription endpoint:

```python
@app.post("/dapr/subscribe")
async def subscribe():
    return [
        {
            "pubsubname": "kafka-pubsub",
            "topic": "task-events",
            "route": "/api/events/task-events"
        }
    ]
```

**Event Handler:**
```python
@app.post("/api/events/task-events")
async def handle_event(request: Request):
    cloud_event = await request.json()
    event_data = cloud_event.get("data", {})
    # Process event
    return {"status": "success"}
```

---

## 4. State Store API Reference

### Save State

**Endpoint:** `POST /v1.0/state/{storeName}`

```python
url = f"http://localhost:3500/v1.0/state/{store_name}"
response = await httpx.post(
    url,
    json=[{
        "key": "conversation-123",
        "value": {"messages": [...]}
    }]
)
```

### Get State

**Endpoint:** `GET /v1.0/state/{storeName}/{key}`

```python
url = f"http://localhost:3500/v1.0/state/{store_name}/{key}"
response = await httpx.get(url)
state = response.json()
```

### Delete State

**Endpoint:** `DELETE /v1.0/state/{storeName}/{key}`

```python
url = f"http://localhost:3500/v1.0/state/{store_name}/{key}"
response = await httpx.delete(url)
```

---

## 5. Jobs API Reference

### Schedule Job

**Endpoint:** `POST /v1.0-alpha1/jobs/{jobName}`

```python
url = f"http://localhost:3500/v1.0-alpha1/jobs/{job_name}"
response = await httpx.post(
    url,
    json={
        "dueTime": "2025-12-29T16:00:00Z",  # ISO 8601
        "data": {
            "type": "reminder",
            "task_id": 123
        }
    }
)
```

**Job Callback:**
Dapr calls your app's endpoint when job fires:

```python
@app.post("/api/jobs/trigger")
async def handle_job_trigger(request: Request):
    job_data = await request.json()
    # Process job
    return {"status": "SUCCESS"}
```

---

## 6. Secrets API Reference

### Get Secret

**Endpoint:** `GET /v1.0/secrets/{storeName}/{secretName}`

```python
url = f"http://localhost:3500/v1.0/secrets/{store_name}/{secret_name}"
response = await httpx.get(url)
secrets = response.json()
password = secrets.get("password")
```

**With Key:**
```python
# Get specific key from secret
url = f"http://localhost:3500/v1.0/secrets/{store_name}/{secret_name}?key=password"
response = await httpx.get(url)
password = response.json()
```

---

## 7. Service Invocation API Reference

### Invoke Service

**Endpoint:** `POST /v1.0/invoke/{appId}/method/{methodName}`

```python
url = f"http://localhost:3500/v1.0/invoke/{app_id}/method/{method}"
response = await httpx.post(url, json=data)
result = response.json()
```

**Example:**
```python
result = await httpx.post(
    "http://localhost:3500/v1.0/invoke/backend/method/api/tasks",
    json={"task_id": 123}
)
```

---

## 8. Component Configuration

### Pub/Sub Component (Kafka)

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: kafka-pubsub
spec:
  type: pubsub.kafka
  version: v1
  metadata:
    - name: brokers
      value: "kafka:9092"
    - name: consumerGroup
      value: "todo-service"
```

### State Store Component (PostgreSQL)

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: statestore
spec:
  type: state.postgresql
  version: v1
  metadata:
    - name: connectionString
      value: "host=postgresql port=5432 user=postgres password=*** dbname=todo"
```

### Secrets Component (Kubernetes)

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: kubernetes-secrets
spec:
  type: secretstores.kubernetes
  version: v1
```

---

## 9. Error Handling Patterns

### Retry with Exponential Backoff

```python
async def retry_dapr_call(operation, max_retries=3):
    for attempt in range(max_retries):
        try:
            return await operation()
        except httpx.HTTPError:
            if attempt == max_retries - 1:
                raise
            await asyncio.sleep(2 ** attempt)
```

### Health Check

```python
@app.get("/health/dapr")
async def dapr_health():
    """Check Dapr sidecar health."""
    try:
        response = await httpx.get("http://localhost:3500/v1.0/healthz")
        return {"status": "healthy" if response.status_code == 200 else "unhealthy"}
    except Exception:
        return {"status": "unhealthy"}, 503
```

---

## 10. Best Practices

### 1. Always Include user_id

```python
# ✅ Good
event = {"user_id": user_id, "task_id": task_id}

# ❌ Bad
event = {"task_id": task_id}  # Missing user_id
```

### 2. Use Idempotency Keys

```python
event_id = f"{event_type}-{task_id}-{timestamp}"
```

### 3. Handle CloudEvents Format

Dapr wraps events in CloudEvents:

```python
cloud_event = await request.json()
event_data = cloud_event.get("data", {})
```

### 4. UTC Timestamps

```python
timestamp = datetime.utcnow().isoformat() + "Z"
```

---

## References

- [Dapr API Reference](https://docs.dapr.io/reference/api/)
- [Dapr Pub/Sub API](https://docs.dapr.io/reference/api/pubsub_api/)
- [Dapr State Store API](https://docs.dapr.io/reference/api/state_api/)
- [Dapr Secrets API](https://docs.dapr.io/reference/api/secrets_api/)
- [Dapr Service Invocation API](https://docs.dapr.io/reference/api/service_invocation_api/)

