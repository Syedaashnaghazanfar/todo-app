# Microservices Patterns Examples

These examples support the `microservices-patterns` Skill for Phase V.

They demonstrate microservices architecture patterns for event-driven systems.

---

## Example 1 – Recurring Task Service

**Goal:** Microservice that consumes task completion events and creates next occurrences.

```python
# services/recurring_task_service/main.py
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from dapr_integration import DaprClient
from rrule_recurring_tasks import RRuleParser

app = FastAPI()
dapr = DaprClient()
parser = RRuleParser()

@app.post("/dapr/subscribe")
async def subscribe():
    return [{
        "pubsubname": "kafka-pubsub",
        "topic": "task-events",
        "route": "/api/events/task-events"
    }]

@app.post("/api/events/task-events")
async def handle_task_event(request: Request):
    cloud_event = await request.json()
    event_data = cloud_event.get("data", {})
    
    # User isolation
    user_id = event_data.get("user_id")
    if not user_id:
        return JSONResponse({"status": "error"}, status_code=400)
    
    # Process task completion
    if event_data.get("event_type") == "task.completed":
        await handle_task_completed(event_data, user_id)
    
    return JSONResponse({"status": "success"})

async def handle_task_completed(event_data: dict, user_id: str):
    """Create next occurrence for recurring task."""
    task_id = event_data.get("task_id")
    payload = event_data.get("payload", {})
    recurring_pattern = payload.get("recurring_pattern")
    
    if not recurring_pattern:
        return  # Not a recurring task
    
    # Calculate next occurrence
    next_occurrence = parser.calculate_next(
        pattern=recurring_pattern,
        dtstart=datetime.utcnow().replace(tzinfo=timezone.utc),
        end_date=payload.get("recurring_end_date")
    )
    
    if next_occurrence:
        # Create next occurrence via backend service
        await dapr.invoke_service(
            app_id="backend",
            method="api/tasks",
            data={
                "title": payload.get("title"),
                "user_id": user_id,
                "recurring_pattern": recurring_pattern,
                "next_occurrence": next_occurrence.isoformat(),
                "parent_task_id": task_id
            }
        )
```

---

## Example 2 – Notification Service

**Goal:** Microservice that sends reminder notifications.

```python
# services/notification_service/main.py
from fastapi import FastAPI, Request
from dapr_integration import DaprClient
import smtplib

app = FastAPI()
dapr = DaprClient()

@app.post("/dapr/subscribe")
async def subscribe():
    return [{
        "pubsubname": "kafka-pubsub",
        "topic": "reminders",
        "route": "/api/events/reminders"
    }]

@app.post("/api/events/reminders")
async def handle_reminder(request: Request):
    cloud_event = await request.json()
    event_data = cloud_event.get("data", {})
    
    user_id = event_data.get("user_id")
    task_id = event_data.get("task_id")
    payload = event_data.get("payload", {})
    
    # Get user email from backend
    user = await dapr.invoke_service(
        app_id="backend",
        method=f"api/users/{user_id}"
    )
    
    # Send email notification
    await send_email(
        to=user["email"],
        subject=f"Reminder: {payload.get('title')}",
        body=f"Task '{payload.get('title')}' is due at {payload.get('due_at')}"
    )
    
    # Update reminder_sent flag
    await dapr.invoke_service(
        app_id="backend",
        method=f"api/tasks/{task_id}/reminder-sent",
        data={"reminder_sent": True}
    )
    
    return {"status": "success"}
```

---

## Example 3 – Service Health Checks

**Goal:** Health check endpoints for Kubernetes probes.

```python
@app.get("/health")
async def health_check():
    """Liveness probe."""
    return {"status": "healthy", "service": "recurring-task-service"}

@app.get("/health/ready")
async def readiness_check():
    """Readiness probe - check dependencies."""
    try:
        # Check Dapr sidecar
        dapr_health = await httpx.get("http://localhost:3500/v1.0/healthz")
        if dapr_health.status_code != 200:
            return {"status": "not ready"}, 503
        
        # Check database (if needed)
        # ...
        
        return {"status": "ready"}
    except Exception as e:
        return {"status": "not ready", "error": str(e)}, 503
```

---

## Example 4 – Idempotent Service Operations

**Goal:** Ensure service operations are idempotent.

```python
async def create_next_occurrence_idempotent(
    dapr: DaprClient,
    parent_task_id: int,
    user_id: str,
    idempotency_key: str
) -> dict:
    """Create next occurrence with idempotency check."""
    # Check if already created
    existing = await dapr.get_state(f"next-occurrence-{idempotency_key}")
    if existing:
        return existing  # Return existing task
    
    # Create new occurrence
    result = await dapr.invoke_service(
        app_id="backend",
        method="api/tasks",
        data={
            "parent_task_id": parent_task_id,
            "user_id": user_id,
            "idempotency_key": idempotency_key
        }
    )
    
    # Mark as created
    await dapr.save_state(
        f"next-occurrence-{idempotency_key}",
        {"created": True, "task_id": result["task_id"]}
    )
    
    return result
```

---

## Example 5 – User Isolation in Microservices

**Goal:** Always filter by user_id in all operations.

```python
# ✅ Good: User ID in all calls
async def get_user_tasks(user_id: str):
    result = await dapr.invoke_service(
        app_id="backend",
        method="api/tasks",
        data={"user_id": user_id}  # User ID included
    )
    return result

# ❌ Bad: Missing user_id
async def get_all_tasks():
    result = await dapr.invoke_service(
        app_id="backend",
        method="api/tasks"  # Missing user_id!
    )
    return result
```

---

## Example 6 – Service Configuration

**Goal:** Environment-based service configuration.

```python
from pydantic_settings import BaseSettings

class ServiceConfig(BaseSettings):
    service_name: str = "recurring-task-service"
    dapr_port: int = 3500
    backend_service_id: str = "backend"
    notification_service_id: str = "notification-service"
    
    class Config:
        env_prefix = "SERVICE_"

config = ServiceConfig()
```

---

## Example 7 – Error Handling with Retries

**Goal:** Retry service calls with exponential backoff.

```python
import asyncio

async def retry_service_call(
    operation,
    max_retries: int = 3,
    initial_delay: float = 1.0
) -> dict:
    """Retry service call with exponential backoff."""
    delay = initial_delay
    
    for attempt in range(max_retries):
        try:
            return await operation()
        except Exception as e:
            if attempt == max_retries - 1:
                raise
            
            await asyncio.sleep(delay)
            delay *= 2
    
    raise Exception("Max retries exceeded")

# Usage
result = await retry_service_call(
    lambda: dapr.invoke_service("backend", "api/tasks", data)
)
```

---

## Example 8 – Circuit Breaker Pattern

**Goal:** Prevent cascading failures with circuit breaker.

```python
from circuitbreaker import circuit

@circuit(failure_threshold=5, recovery_timeout=60)
async def call_backend_service(method: str, data: dict):
    """Call backend service with circuit breaker."""
    return await dapr.invoke_service("backend", method, data)
```

---

## Example 9 – Service Discovery

**Goal:** Discover services via Dapr Service Invocation.

```python
# Dapr automatically handles service discovery
# Just use app_id, no need for IP addresses

# ✅ Good: Use app_id
await dapr.invoke_service("backend", "api/tasks", data)

# ❌ Bad: Hardcode IP
await httpx.post("http://10.0.1.5:8000/api/tasks", json=data)
```

---

## Example 10 – Complete Microservice Template

**Goal:** Complete microservice with all patterns.

```python
# services/example_service/main.py
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from dapr_integration import DaprClient
from pydantic_settings import BaseSettings

class ServiceConfig(BaseSettings):
    service_name: str = "example-service"
    dapr_port: int = 3500
    
    class Config:
        env_prefix = "SERVICE_"

app = FastAPI()
config = ServiceConfig()
dapr = DaprClient(dapr_port=config.dapr_port)

@app.post("/dapr/subscribe")
async def subscribe():
    return [{
        "pubsubname": "kafka-pubsub",
        "topic": "task-events",
        "route": "/api/events/task-events"
    }]

@app.post("/api/events/task-events")
async def handle_event(request: Request):
    cloud_event = await request.json()
    event_data = cloud_event.get("data", {})
    
    # User isolation
    user_id = event_data.get("user_id")
    if not user_id:
        return JSONResponse({"status": "error"}, status_code=400)
    
    # Process event
    await process_event(event_data, user_id)
    
    return JSONResponse({"status": "success"})

@app.get("/health")
async def health():
    return {"status": "healthy", "service": config.service_name}

@app.get("/health/ready")
async def ready():
    return {"status": "ready"}
```

