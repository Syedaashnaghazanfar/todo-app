"""
TaskEvent Model for Phase V Event-Driven Architecture

Stores event audit trail for all published task events.
Used for debugging, compliance, and event replay scenarios.

Event Flow:
1. Task operation occurs (create, update, delete, complete)
2. Event is published to Kafka via Dapr Pub/Sub
3. TaskEvent record is created for audit trail
4. Consumers process event from Kafka topic
"""

from sqlalchemy import Column, String, Text, DateTime, Index, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from backend.database.base import Base
from datetime import datetime, timezone
import uuid


class TaskEvent(Base):
    """
    Event audit log for task operations.

    Stores all published events for debugging and compliance.
    Indexed by user_id, task_id, event_type, and published_at for efficient querying.
    """
    __tablename__ = "task_events"

    # Primary Key
    event_id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        comment="Unique event identifier (matches CloudEvents ID)"
    )

    # Event Metadata
    event_type = Column(
        Text,
        nullable=False,
        comment="Event type: task.created | task.updated | task.deleted | task.completed"
    )

    # Foreign Keys
    user_id = Column(
        String(36),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        comment="User who triggered the event"
    )

    task_id = Column(
        UUID(as_uuid=True),
        ForeignKey("tasks.id", ondelete="CASCADE"),
        nullable=True,  # Null if task is deleted
        index=True,
        comment="Task that was modified"
    )

    # Event Payload (CloudEvents data field)
    payload = Column(
        JSONB,
        nullable=False,
        comment="Full event payload in CloudEvents format"
    )

    # Timestamps
    published_at = Column(
        DateTime,
        nullable=False,
        default=lambda: datetime.now(timezone.utc).replace(tzinfo=None),
        index=True,
        comment="When event was published to Kafka"
    )

    created_at = Column(
        DateTime,
        nullable=False,
        default=lambda: datetime.now(timezone.utc).replace(tzinfo=None),
        comment="When this audit record was created"
    )

    # Relationships
    user = relationship("User", foreign_keys=[user_id])
    task = relationship("Task", foreign_keys=[task_id])

    # Table Arguments: Composite indexes for common query patterns
    __table_args__ = (
        Index('idx_task_event_user', 'user_id', 'created_at'),
        Index('idx_task_event_task', 'task_id', 'created_at'),
        Index('idx_task_event_type', 'event_type', 'created_at'),
        Index('idx_task_event_published', 'published_at'),
    )

    def __repr__(self):
        return (
            f"<TaskEvent(event_id={self.event_id}, "
            f"event_type={self.event_type}, "
            f"user_id={self.user_id}, "
            f"task_id={self.task_id}, "
            f"published_at={self.published_at})>"
        )
