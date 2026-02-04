"""
Event Publisher Template - Publish events to Kafka via Dapr Pub/Sub.

This template provides a reusable event publisher for Phase V.
Copy this file to your project and customize as needed.
"""

import httpx
import uuid
from datetime import datetime
from typing import Literal, Dict, Any, Optional


class EventPublisher:
    """
    Publish events to Kafka topics via Dapr Pub/Sub.
    
    Supports:
    - Task events (task-events topic)
    - Reminder events (reminders topic)
    - Task updates (task-updates topic)
    """
    
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
        payload: Dict[str, Any]
    ) -> None:
        """
        Publish task event to task-events topic.
        
        Args:
            event_type: Type of task event
            task_id: Task ID
            user_id: User ID (required for partitioning)
            payload: Event-specific data
        """
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
    
    async def publish_reminder_event(
        self,
        event_type: Literal["reminder.scheduled", "reminder.due", "reminder.cancelled"],
        task_id: int,
        user_id: str,
        payload: Dict[str, Any]
    ) -> None:
        """Publish reminder event to reminders topic."""
        event = {
            "event_id": str(uuid.uuid4()),
            "event_type": event_type,
            "event_version": "1.0",
            "task_id": task_id,
            "user_id": user_id,
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "payload": payload
        }
        
        url = f"{self.dapr_url}/v1.0/publish/{self.pubsub_name}/reminders"
        
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=event)
            response.raise_for_status()
    
    async def publish_task_update(
        self,
        task_id: int,
        user_id: str,
        payload: Dict[str, Any]
    ) -> None:
        """Publish task update to task-updates topic (for real-time sync)."""
        event = {
            "event_id": str(uuid.uuid4()),
            "event_type": "task.updated",
            "event_version": "1.0",
            "task_id": task_id,
            "user_id": user_id,
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "payload": payload
        }
        
        url = f"{self.dapr_url}/v1.0/publish/{self.pubsub_name}/task-updates"
        
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=event)
            response.raise_for_status()


# ==================== Usage Examples ====================

async def example_usage():
    """Example usage of EventPublisher."""
    publisher = EventPublisher()
    
    # Publish task completion
    await publisher.publish_task_event(
        event_type="task.completed",
        task_id=123,
        user_id="user-456",
        payload={
            "completed_at": "2025-12-29T10:00:00Z",
            "recurring_pattern": "DAILY"
        }
    )
    
    # Publish reminder
    await publisher.publish_reminder_event(
        event_type="reminder.due",
        task_id=123,
        user_id="user-456",
        payload={
            "due_at": "2025-12-29T16:00:00Z",
            "title": "Daily standup"
        }
    )
    
    # Publish task update (for real-time sync)
    await publisher.publish_task_update(
        task_id=123,
        user_id="user-456",
        payload={
            "title": "Updated task title",
            "updated_fields": ["title"]
        }
    )

