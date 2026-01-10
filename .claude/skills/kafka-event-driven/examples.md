# Kafka Event-Driven Architecture Examples

These examples support the `kafka-event-driven` Skill for Phase V.

They demonstrate event-driven patterns using **Dapr Pub/Sub** (which abstracts Kafka).

---

## Example 1 – Event Publisher Service

**Goal:** Create a reusable event publisher that publishes to Kafka via Dapr.

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
            "user_id": user_id,  # Required for partitioning
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "payload": payload
        }
        
        url = f"{self.dapr_url}/v1.0/publish/{self.pubsub_name}/task-events"
        
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=event)
            response.raise_for_status()

# Usage
publisher = EventPublisher()
await publisher.publish_task_event(
    event_type="task.completed",
    task_id=123,
    user_id="user-456",
    payload={"completed_at": "2025-12-29T10:00:00Z"}
)
```

---

## Example 2 – Event Consumer Service

**Goal:** Subscribe to events and process them in a microservice.

```python
# services/recurring_task_service/main.py
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

app = FastAPI()

@app.post("/dapr/subscribe")
async def subscribe():
    """Dapr subscription endpoint."""
    return [
        {
            "pubsubname": "kafka-pubsub",
            "topic": "task-events",
            "route": "/api/events/task-events"
        }
    ]

@app.post("/api/events/task-events")
async def handle_task_event(request: Request):
    """Handle task event from Kafka."""
    cloud_event = await request.json()
    event_data = cloud_event.get("data", {})
    
    # User isolation check
    user_id = event_data.get("user_id")
    if not user_id:
        return JSONResponse({"status": "error"}, status_code=400)
    
    # Process event
    if event_data.get("event_type") == "task.completed":
        await handle_task_completed(event_data)
    
    return JSONResponse({"status": "success"})
```

---

## Example 3 – Event Schema with Versioning

**Goal:** Versioned event schemas for compatibility.

```python
# backend/src/events/schemas.py
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Literal

class TaskEvent(BaseModel):
    """Versioned task event schema."""
    event_id: str = Field(..., description="Unique event identifier")
    event_type: Literal["task.created", "task.updated", "task.completed", "task.deleted"]
    event_version: str = Field(default="1.0")
    task_id: int
    user_id: str = Field(..., description="Required for user isolation")
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    payload: dict

# Usage
event = TaskEvent(
    event_id=str(uuid.uuid4()),
    event_type="task.completed",
    task_id=123,
    user_id="user-456",
    payload={"completed_at": "2025-12-29T10:00:00Z"}
)
```

---

## Example 4 – Dead Letter Queue Handler

**Goal:** Handle failed events and move to DLQ.

```python
# backend/src/events/dlq_handler.py
from enum import Enum
from typing import Dict, List

class EventType(str, Enum):
    TASK_COMPLETION = "task.completed"
    REMINDER = "reminder.due"
    TASK_UPDATE = "task.updated"

RETRY_STRATEGIES: Dict[EventType, List[int]] = {
    EventType.TASK_COMPLETION: [30, 300, 1800],  # 30s, 5min, 30min
    EventType.REMINDER: [1, 2, 4, 8, 16, 32, 64, 128, 256, 512],
    EventType.TASK_UPDATE: [1, 2, 4, 8, 16],
}

class DLQHandler:
    """Handle failed events and move to DLQ."""
    
    async def handle_failed_event(
        self,
        event: dict,
        error: Exception,
        retry_count: int
    ) -> None:
        """Move failed event to DLQ after max retries."""
        event_type = EventType(event.get("event_type"))
        max_retries = len(RETRY_STRATEGIES[event_type])
        
        if retry_count >= max_retries:
            await self.publish_to_dlq(event, error, retry_count)
        else:
            delay = RETRY_STRATEGIES[event_type][retry_count]
            await asyncio.sleep(delay)
            await self.retry_event(event, retry_count + 1)
```

---

## Example 5 – Idempotent Event Processing

**Goal:** Process events exactly once using idempotency keys.

```python
# services/recurring_task_service/idempotency.py
from dapr_integration import DaprClient

async def process_event_idempotent(
    dapr: DaprClient,
    event: dict
) -> bool:
    """Process event with idempotency check."""
    event_id = event.get("event_id")
    
    # Check if already processed
    processed = await dapr.get_state(f"event-processed-{event_id}")
    if processed:
        return False  # Already processed
    
    # Process event
    await handle_event(event)
    
    # Mark as processed
    await dapr.save_state(
        f"event-processed-{event_id}",
        {"processed": True, "processed_at": datetime.utcnow().isoformat() + "Z"}
    )
    return True
```

---

## Example 6 – User ID Partitioning

**Goal:** Ensure events are partitioned by user_id for ordering.

```python
# Always include user_id in event for partitioning
event = {
    "user_id": user_id,  # Used by Dapr/Kafka for partitioning
    "task_id": task_id,
    "event_type": "task.completed"
}

# Dapr automatically partitions by user_id if provided
await publisher.publish_task_event(
    event_type="task.completed",
    task_id=123,
    user_id="user-456",  # Partition key
    payload={}
)
```

---

## Example 7 – Multiple Topic Subscriptions

**Goal:** Subscribe to multiple Kafka topics.

```python
@app.post("/dapr/subscribe")
async def subscribe():
    """Subscribe to multiple topics."""
    return [
        {
            "pubsubname": "kafka-pubsub",
            "topic": "task-events",
            "route": "/api/events/task-events"
        },
        {
            "pubsubname": "kafka-pubsub",
            "topic": "reminders",
            "route": "/api/events/reminders"
        },
        {
            "pubsubname": "kafka-pubsub",
            "topic": "task-updates",
            "route": "/api/events/task-updates"
        }
    ]
```

---

## Example 8 – Event Retry with Exponential Backoff

**Goal:** Retry failed event processing with exponential backoff.

```python
import asyncio

async def retry_event_processing(
    event: dict,
    max_retries: int = 3,
    initial_delay: float = 1.0
) -> bool:
    """Retry event processing with exponential backoff."""
    delay = initial_delay
    
    for attempt in range(max_retries):
        try:
            await process_event(event)
            return True
        except Exception as e:
            if attempt == max_retries - 1:
                await move_to_dlq(event, e)
                return False
            
            await asyncio.sleep(delay)
            delay *= 2  # Exponential backoff
    
    return False
```

---

## Example 9 – Event Schema Migration

**Goal:** Migrate events between schema versions.

```python
def migrate_event(event: dict, target_version: str) -> dict:
    """Migrate event to target schema version."""
    current_version = event.get("event_version", "1.0")
    
    if current_version == target_version:
        return event
    
    # Migration from 1.0 to 1.1
    if current_version == "1.0" and target_version == "1.1":
        event["payload"]["new_field"] = None
    
    event["event_version"] = target_version
    return event
```

---

## Example 10 – Complete Event-Driven Workflow

**Goal:** End-to-end event-driven workflow.

```python
# 1. Task Service publishes event
publisher = EventPublisher()
await publisher.publish_task_event(
    event_type="task.completed",
    task_id=123,
    user_id="user-456",
    payload={"recurring_pattern": "DAILY"}
)

# 2. Recurring Task Service consumes event
@app.post("/api/events/task-events")
async def handle_task_event(request: Request):
    cloud_event = await request.json()
    event_data = cloud_event.get("data", {})
    
    if event_data.get("event_type") == "task.completed":
        # Create next occurrence
        await create_next_occurrence(event_data)
    
    return {"status": "success"}

# 3. Next occurrence creation publishes new event
await publisher.publish_task_event(
    event_type="task.created",
    task_id=124,  # New task
    user_id="user-456",
    payload={"parent_task_id": 123}
)
```

