"""
CloudEvents Schema Models for Phase V Event-Driven Architecture

All events follow CloudEvents v1.0 specification:
- id: Unique event identifier (UUID)
- type: Event type (e.g., task.created, task.completed)
- source: Service that generated the event
- time: Event timestamp (ISO 8601 UTC)
- datacontenttype: Content type of data field (application/json)
- data: Event payload
"""

from datetime import datetime
from typing import Any, Dict, Literal, Optional
from uuid import UUID, uuid4

from pydantic import BaseModel, Field


class CloudEvent(BaseModel):
    """Base CloudEvents v1.0 envelope"""

    id: str = Field(default_factory=lambda: str(uuid4()), description="Unique event identifier")
    type: str = Field(..., description="Event type")
    source: str = Field(..., description="Service that generated the event")
    specversion: Literal["1.0"] = "1.0"
    time: datetime = Field(default_factory=datetime.utcnow, description="Event timestamp")
    datacontenttype: str = "application/json"
    data: Dict[str, Any] = Field(..., description="Event payload")

    class Config:
        json_schema_extra = {
            "example": {
                "id": "550e8400-e29b-41d4-a716-446655440000",
                "type": "task.created",
                "source": "backend-api",
                "specversion": "1.0",
                "time": "2026-01-14T10:00:00Z",
                "datacontenttype": "application/json",
                "data": {"task_id": "123", "user_id": "user-456"},
            }
        }


# Task Operation Events (topic: task-operations)


class TaskCreatedEventData(BaseModel):
    """Data payload for task.created event"""

    task_id: UUID
    user_id: str
    title: str
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    priority: str = "MEDIUM"
    tags: list[str] = Field(default_factory=list)
    is_recurring: bool = False
    series_id: Optional[UUID] = None
    recurrence_pattern: Optional[str] = None
    created_at: datetime


class TaskCompletedEventData(BaseModel):
    """Data payload for task.completed event"""

    task_id: UUID
    user_id: str
    series_id: Optional[UUID] = None
    completed_at: datetime
    recurrence_pattern: Optional[str] = None  # For recurring task generation


class TaskUpdatedEventData(BaseModel):
    """Data payload for task.updated event"""

    task_id: UUID
    user_id: str
    updated_fields: Dict[str, Any]  # Only fields that changed
    updated_at: datetime


class TaskDeletedEventData(BaseModel):
    """Data payload for task.deleted event"""

    task_id: UUID
    user_id: str
    series_id: Optional[UUID] = None
    deleted_at: datetime


# Alert Events (topic: alerts)


class AlertScheduledEventData(BaseModel):
    """Data payload for alert.scheduled event"""

    alert_id: UUID
    task_id: UUID
    user_id: str
    scheduled_times: list[datetime]  # Multiple reminder times
    reminder_type: Literal["email", "push", "both"] = "email"
    task_title: str
    task_due_date: Optional[datetime] = None


class AlertCancelledEventData(BaseModel):
    """Data payload for alert.cancelled event"""

    alert_id: UUID
    task_id: UUID
    user_id: str
    reason: Literal["task_completed", "task_deleted", "user_cancelled"]
    cancelled_at: datetime


# Helper functions to create CloudEvents


def create_task_created_event(
    task_id: UUID,
    user_id: str,
    title: str,
    description: Optional[str] = None,
    due_date: Optional[datetime] = None,
    priority: str = "MEDIUM",
    tags: Optional[list[str]] = None,
    is_recurring: bool = False,
    series_id: Optional[UUID] = None,
    recurrence_pattern: Optional[str] = None,
) -> CloudEvent:
    """Create task.created CloudEvent"""
    return CloudEvent(
        type="task.created",
        source="backend-api",
        data=TaskCreatedEventData(
            task_id=task_id,
            user_id=user_id,
            title=title,
            description=description,
            due_date=due_date,
            priority=priority,
            tags=tags or [],
            is_recurring=is_recurring,
            series_id=series_id,
            recurrence_pattern=recurrence_pattern,
            created_at=datetime.utcnow(),
        ).model_dump(mode="json"),
    )


def create_task_completed_event(
    task_id: UUID,
    user_id: str,
    series_id: Optional[UUID] = None,
    recurrence_pattern: Optional[str] = None,
) -> CloudEvent:
    """Create task.completed CloudEvent"""
    return CloudEvent(
        type="task.completed",
        source="backend-api",
        data=TaskCompletedEventData(
            task_id=task_id,
            user_id=user_id,
            series_id=series_id,
            completed_at=datetime.utcnow(),
            recurrence_pattern=recurrence_pattern,
        ).model_dump(mode="json"),
    )


def create_task_updated_event(
    task_id: UUID, user_id: str, updated_fields: Dict[str, Any]
) -> CloudEvent:
    """Create task.updated CloudEvent"""
    return CloudEvent(
        type="task.updated",
        source="backend-api",
        data=TaskUpdatedEventData(
            task_id=task_id,
            user_id=user_id,
            updated_fields=updated_fields,
            updated_at=datetime.utcnow(),
        ).model_dump(mode="json"),
    )


def create_task_deleted_event(
    task_id: UUID, user_id: str, series_id: Optional[UUID] = None
) -> CloudEvent:
    """Create task.deleted CloudEvent"""
    return CloudEvent(
        type="task.deleted",
        source="backend-api",
        data=TaskDeletedEventData(
            task_id=task_id,
            user_id=user_id,
            series_id=series_id,
            deleted_at=datetime.utcnow(),
        ).model_dump(mode="json"),
    )


def create_alert_scheduled_event(
    alert_id: UUID,
    task_id: UUID,
    user_id: str,
    scheduled_times: list[datetime],
    reminder_type: str,
    task_title: str,
    task_due_date: Optional[datetime] = None,
) -> CloudEvent:
    """Create alert.scheduled CloudEvent"""
    return CloudEvent(
        type="alert.scheduled",
        source="backend-api",
        data=AlertScheduledEventData(
            alert_id=alert_id,
            task_id=task_id,
            user_id=user_id,
            scheduled_times=scheduled_times,
            reminder_type=reminder_type,  # type: ignore
            task_title=task_title,
            task_due_date=task_due_date,
        ).model_dump(mode="json"),
    )


def create_alert_cancelled_event(
    alert_id: UUID, task_id: UUID, user_id: str, reason: str
) -> CloudEvent:
    """Create alert.cancelled CloudEvent"""
    return CloudEvent(
        type="alert.cancelled",
        source="backend-api",
        data=AlertCancelledEventData(
            alert_id=alert_id,
            task_id=task_id,
            user_id=user_id,
            reason=reason,  # type: ignore
            cancelled_at=datetime.utcnow(),
        ).model_dump(mode="json"),
    )
