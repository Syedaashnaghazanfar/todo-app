# Dapr Integration Examples

These examples support the `dapr-integration` Skill for Phase V.

They demonstrate **Full Dapr** implementation with all 5 building blocks:
1. Pub/Sub (Kafka)
2. State Store (PostgreSQL)
3. Jobs API (Scheduled reminders)
4. Secrets Management (Kubernetes/Cloud vaults)
5. Service Invocation (mTLS)

All examples use **HTTP APIs** to communicate with Dapr sidecar (port 3500).

---

## Example 1 – Publish Task Event via Dapr Pub/Sub

**Goal:** Publish a task completion event to Kafka topic via Dapr Pub/Sub.

```python
# backend/src/events/publisher.py
import httpx
import uuid
from datetime import datetime
from typing import Literal

class EventPublisher:
    """Publish events to Kafka via Dapr Pub/Sub."""
    
    def __init__(
        self,
        pubsub_name: str = "kafka-pubsub",
        dapr_port: int = 3500
    ):
        self.pubsub_name = pubsub_name
        self.dapr_url = f"http://localhost:{dapr_port}"
    
    async def publish_task_event(
        self,
        event_type: Literal["task.created", "task.updated", "task.completed", "task.deleted"],
        task_id: int,
        user_id: str,
        payload: dict
    ) -> None:
        """Publish task event to task-events topic."""
        event = {
            "event_id": str(uuid.uuid4()),
            "event_type": event_type,
            "event_version": "1.0",
            "task_id": task_id,
            "user_id": user_id,  # Required for user isolation and partitioning
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "payload": payload
        }
        
        url = f"{self.dapr_url}/v1.0/publish/{self.pubsub_name}/task-events"
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                url,
                json=event,
                headers={"Content-Type": "application/json"}
            )
            response.raise_for_status()

# Usage in task service
publisher = EventPublisher()

# When task is marked complete
await publisher.publish_task_event(
    event_type="task.completed",
    task_id=123,
    user_id="user-456",
    payload={
        "task_id": 123,
        "completed_at": "2025-12-29T10:00:00Z",
        "recurring_pattern": "DAILY"
    }
)
```

---

## Example 2 – Subscribe to Events via Dapr Pub/Sub

**Goal:** Subscribe to task events and process them in a microservice.

```python
# services/recurring_task_service/main.py
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
import httpx

app = FastAPI()

@app.post("/dapr/subscribe")
async def subscribe():
    """Dapr subscription endpoint - returns topics to subscribe to."""
    return [
        {
            "pubsubname": "kafka-pubsub",
            "topic": "task-events",
            "route": "/api/events/task-events",
            "metadata": {
                "rawPayload": "false"  # Dapr wraps in CloudEvents
            }
        }
    ]

@app.post("/api/events/task-events")
async def handle_task_event(request: Request):
    """Handle task event from Dapr Pub/Sub."""
    cloud_event = await request.json()
    
    # Extract event data from CloudEvents format
    event_data = cloud_event.get("data", {})
    event_type = event_data.get("event_type")
    user_id = event_data.get("user_id")
    task_id = event_data.get("task_id")
    
    # User isolation check
    if not user_id:
        return JSONResponse(
            {"status": "error", "message": "Missing user_id"},
            status_code=400
        )
    
    # Process event based on type
    if event_type == "task.completed":
        await handle_task_completed(event_data)
    elif event_type == "task.created":
        await handle_task_created(event_data)
    
    return JSONResponse({"status": "success"})

async def handle_task_completed(event_data: dict):
    """Process task completion event."""
    task_id = event_data.get("task_id")
    user_id = event_data.get("user_id")
    payload = event_data.get("payload", {})
    
    # Check if recurring task
    if payload.get("recurring_pattern"):
        # Trigger next occurrence creation
        await create_next_occurrence(task_id, user_id, payload)
```

---

## Example 3 – Save Conversation State via Dapr State Store

**Goal:** Save chatbot conversation history to PostgreSQL via Dapr State Store.

```python
# backend/src/services/chatkit_store.py
import httpx
from typing import List, Dict

class DaprStateStore:
    """Save/get state via Dapr State Store."""
    
    def __init__(self, store_name: str = "statestore", dapr_port: int = 3500):
        self.store_name = store_name
        self.dapr_url = f"http://localhost:{dapr_port}"
    
    async def save_conversation(
        self,
        conversation_id: str,
        user_id: str,
        messages: List[Dict]
    ) -> None:
        """Save conversation history to state store."""
        key = f"conversation-{user_id}-{conversation_id}"
        value = {
            "conversation_id": conversation_id,
            "user_id": user_id,
            "messages": messages,
            "updated_at": datetime.utcnow().isoformat() + "Z"
        }
        
        url = f"{self.dapr_url}/v1.0/state/{self.store_name}"
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                url,
                json=[{
                    "key": key,
                    "value": value
                }],
                headers={"Content-Type": "application/json"}
            )
            response.raise_for_status()
    
    async def get_conversation(
        self,
        conversation_id: str,
        user_id: str
    ) -> Dict | None:
        """Get conversation history from state store."""
        key = f"conversation-{user_id}-{conversation_id}"
        url = f"{self.dapr_url}/v1.0/state/{self.store_name}/{key}"
        
        async with httpx.AsyncClient() as client:
            response = await client.get(url)
            if response.status_code == 404:
                return None
            response.raise_for_status()
            return response.json()

# Usage
state_store = DaprStateStore()

# Save conversation
await state_store.save_conversation(
    conversation_id="conv-123",
    user_id="user-456",
    messages=[
        {"role": "user", "content": "Create a task"},
        {"role": "assistant", "content": "Task created"}
    ]
)

# Get conversation
conversation = await state_store.get_conversation(
    conversation_id="conv-123",
    user_id="user-456"
)
```

---

## Example 4 – Schedule Reminder via Dapr Jobs API

**Goal:** Schedule an exact-time reminder using Dapr Jobs API.

```python
# backend/src/services/notification_service.py
import httpx
from datetime import datetime, timedelta

class ReminderScheduler:
    """Schedule reminders using Dapr Jobs API."""
    
    def __init__(self, dapr_port: int = 3500):
        self.dapr_url = f"http://localhost:{dapr_port}"
    
    async def schedule_reminder(
        self,
        task_id: int,
        remind_at: datetime,
        user_id: str
    ) -> None:
        """Schedule a one-time reminder job."""
        import json
        job_name = f"reminder-task-{task_id}"
        url = f"{self.dapr_url}/v1.0-alpha1/jobs/{job_name}"
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                url,
                json={
                    "dueTime": remind_at.strftime("%Y-%m-%dT%H:%M:%SZ"),  # RFC3339 format
                    "data": json.dumps({  # Dapr expects data as JSON string
                        "type": "reminder",
                        "task_id": task_id,
                        "user_id": user_id
                    })
                },
                headers={"Content-Type": "application/json"}
            )
            response.raise_for_status()

# Usage: Schedule reminder 1 hour before due date
due_date = datetime(2025, 12, 29, 16, 0, 0, tzinfo=timezone.utc)
remind_at = due_date - timedelta(hours=1)

scheduler = ReminderScheduler()
# Schedule reminder using dueTime (one-time execution)
await scheduler.schedule_reminder(
    task_id=123,
    remind_at=remind_at,  # ISO 8601 format: "2025-12-29T16:00:00Z"
    user_id="user-456"
)

# Or schedule recurring reminder using schedule
await scheduler.schedule_reminder_recurring(
    task_id=123,
    schedule="@every 1h",  # Every hour
    user_id="user-456",
    repeats=24  # Repeat 24 times
)
```

---

## Example 5 – Handle Job Callback

**Goal:** Handle Dapr Jobs API callback when scheduled job fires.

```python
# backend/src/api/jobs.py
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from kafka_event_driven import EventPublisher

app = FastAPI()
publisher = EventPublisher()

@app.post("/api/jobs/trigger")
async def handle_job_trigger(request: Request):
    """Dapr calls this endpoint when scheduled job fires."""
    job_data = await request.json()
    
    job_name = job_data.get("jobName")
    job_data_payload = job_data.get("data", {})
    
    if job_data_payload.get("type") == "reminder":
        task_id = job_data_payload.get("task_id")
        user_id = job_data_payload.get("user_id")
        
        # Publish reminder event via Dapr Pub/Sub
        await publisher.publish_reminder_event(
            event_type="reminder.due",
            task_id=task_id,
            user_id=user_id,
            payload={
                "task_id": task_id,
                "remind_at": job_data.get("dueTime")
            }
        )
    
    return JSONResponse({"status": "SUCCESS"})
```

---

## Example 6 – Get Secret via Dapr Secrets API

**Goal:** Retrieve database password from Kubernetes secrets via Dapr.

```python
# backend/src/config.py
import httpx
from pydantic_settings import BaseSettings

class DaprSecrets:
    """Get secrets via Dapr Secrets API."""
    
    def __init__(self, store_name: str = "kubernetes-secrets", dapr_port: int = 3500):
        self.store_name = store_name
        self.dapr_url = f"http://localhost:{dapr_port}"
    
    async def get_secret(
        self,
        secret_name: str,
        key: str | None = None
    ) -> str:
        """Get secret from Dapr secret store."""
        url = f"{self.dapr_url}/v1.0/secrets/{self.store_name}/{secret_name}"
        
        async with httpx.AsyncClient() as client:
            response = await client.get(url)
            response.raise_for_status()
            secrets = response.json()
            
            if key:
                return secrets.get(key)
            return secrets

# Usage: Get database password
secrets = DaprSecrets()
db_password = await secrets.get_secret(
    secret_name="database-credentials",
    key="password"
)

# Use in connection string
connection_string = f"postgresql://user:{db_password}@host:5432/db"
```

---

## Example 7 – Invoke Service via Dapr Service Invocation

**Goal:** Call another microservice via Dapr Service Invocation with mTLS.

```python
# services/recurring_task_service/service_invocation.py
import httpx

async def invoke_backend_service(
    method: str,
    data: dict | None = None,
    dapr_port: int = 3500
) -> dict:
    """Invoke backend service via Dapr Service Invocation."""
    app_id = "backend"
    url = f"http://localhost:{dapr_port}/v1.0/invoke/{app_id}/method/{method}"
    
    async with httpx.AsyncClient() as client:
        if data:
            response = await client.post(url, json=data)
        else:
            response = await client.get(url)
        response.raise_for_status()
        return response.json()

# Usage: Create next occurrence via backend service
result = await invoke_backend_service(
    method="api/tasks",
    data={
        "title": "Daily standup",
        "user_id": "user-456",
        "recurring_pattern": "DAILY",
        "next_occurrence": "2025-12-30T10:00:00Z",
        "parent_task_id": 123
    }
)
```

---

## Example 8 – Complete Dapr Integration (All 5 Building Blocks)

**Goal:** Full Dapr integration example showing all building blocks together.

```python
# backend/src/integrations/dapr_client.py
import httpx
from typing import Dict, List, Optional
from datetime import datetime

class DaprClient:
    """Complete Dapr client with all 5 building blocks."""
    
    def __init__(
        self,
        dapr_port: int = 3500,
        pubsub_name: str = "kafka-pubsub",
        state_store_name: str = "statestore",
        secrets_store_name: str = "kubernetes-secrets"
    ):
        self.dapr_url = f"http://localhost:{dapr_port}"
        self.pubsub_name = pubsub_name
        self.state_store_name = state_store_name
        self.secrets_store_name = secrets_store_name
    
    # 1. Pub/Sub
    async def publish_event(self, topic: str, event: dict) -> None:
        """Publish event via Dapr Pub/Sub."""
        url = f"{self.dapr_url}/v1.0/publish/{self.pubsub_name}/{topic}"
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=event)
            response.raise_for_status()
    
    # 2. State Store
    async def save_state(self, key: str, value: dict) -> None:
        """Save state via Dapr State Store."""
        url = f"{self.dapr_url}/v1.0/state/{self.state_store_name}"
        async with httpx.AsyncClient() as client:
            response = await client.post(
                url,
                json=[{"key": key, "value": value}]
            )
            response.raise_for_status()
    
    async def get_state(self, key: str) -> Optional[dict]:
        """Get state via Dapr State Store."""
        url = f"{self.dapr_url}/v1.0/state/{self.state_store_name}/{key}"
        async with httpx.AsyncClient() as client:
            response = await client.get(url)
            if response.status_code == 404:
                return None
            response.raise_for_status()
            return response.json()
    
    # 3. Jobs API
    async def schedule_job(
        self,
        job_name: str,
        due_time: str,
        data: dict
    ) -> None:
        """Schedule job via Dapr Jobs API."""
        url = f"{self.dapr_url}/v1.0-alpha1/jobs/{job_name}"
        async with httpx.AsyncClient() as client:
            response = await client.post(
                url,
                json={"dueTime": due_time, "data": data}
            )
            response.raise_for_status()
    
    # 4. Secrets
    async def get_secret(self, secret_name: str, key: Optional[str] = None) -> str:
        """Get secret via Dapr Secrets API."""
        url = f"{self.dapr_url}/v1.0/secrets/{self.secrets_store_name}/{secret_name}"
        async with httpx.AsyncClient() as client:
            response = await client.get(url)
            response.raise_for_status()
            secrets = response.json()
            return secrets.get(key) if key else secrets
    
    # 5. Service Invocation
    async def invoke_service(
        self,
        app_id: str,
        method: str,
        data: Optional[dict] = None
    ) -> dict:
        """Invoke service via Dapr Service Invocation."""
        url = f"{self.dapr_url}/v1.0/invoke/{app_id}/method/{method}"
        async with httpx.AsyncClient() as client:
            if data:
                response = await client.post(url, json=data)
            else:
                response = await client.get(url)
            response.raise_for_status()
            return response.json()

# Usage: Complete workflow
dapr = DaprClient()

# 1. Publish event
await dapr.publish_event("task-events", {
    "event_type": "task.completed",
    "task_id": 123,
    "user_id": "user-456"
})

# 2. Save state
await dapr.save_state("conversation-123", {
    "messages": [{"role": "user", "content": "Hello"}]
})

# 3. Schedule reminder
await dapr.schedule_job(
    "reminder-123",
    "2025-12-29T16:00:00Z",
    {"task_id": 123, "user_id": "user-456"}
)

# 4. Get secret
db_password = await dapr.get_secret("database-credentials", "password")

# 5. Invoke service
result = await dapr.invoke_service("backend", "api/tasks", {"task_id": 123})
```

---

## Example 9 – Error Handling and Retries

**Goal:** Robust error handling with retry logic for Dapr operations.

```python
import httpx
import asyncio
from typing import Callable, Any

async def retry_dapr_operation(
    operation: Callable,
    max_retries: int = 3,
    initial_delay: float = 1.0,
    backoff_factor: float = 2.0
) -> Any:
    """Retry Dapr operation with exponential backoff."""
    delay = initial_delay
    
    for attempt in range(max_retries):
        try:
            return await operation()
        except httpx.HTTPError as e:
            if attempt == max_retries - 1:
                raise  # Last attempt, raise exception
            
            await asyncio.sleep(delay)
            delay *= backoff_factor
    
    raise Exception("Max retries exceeded")

# Usage
async def publish_with_retry():
    publisher = EventPublisher()
    await retry_dapr_operation(
        lambda: publisher.publish_task_event(
            event_type="task.completed",
            task_id=123,
            user_id="user-456",
            payload={}
        ),
        max_retries=3
    )
```

---

## Example 10 – Idempotent Event Processing

**Goal:** Process events exactly once using idempotency keys.

```python
# services/recurring_task_service/idempotency.py
from dapr_integration import DaprClient
from datetime import datetime

async def process_event_idempotent(
    dapr: DaprClient,
    event: dict
) -> bool:
    """Process event with idempotency check."""
    event_id = event.get("event_id")
    
    if not event_id:
        return False  # Invalid event
    
    # Check if already processed
    processed = await dapr.get_state(f"event-processed-{event_id}")
    
    if processed:
        return False  # Already processed, skip
    
    # Process event
    try:
        await handle_event(event)
        
        # Mark as processed
        await dapr.save_state(
            f"event-processed-{event_id}",
            {
                "processed": True,
                "processed_at": datetime.utcnow().isoformat() + "Z"
            }
        )
        return True
    except Exception as e:
        # Don't mark as processed on error
        raise
```

