from sqlalchemy import Column, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from backend.database.base import Base
from datetime import datetime, timezone
import uuid

class RecurringTaskSeries(Base):
    """
    Represents a series of recurring tasks.
    Each series defines a template and recurrence pattern for generating task instances.
    """
    __tablename__ = "recurring_task_series"

    series_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    # Template for generating new task instances
    # Contains: title, description, priority, tags, etc.
    base_task_template = Column(JSONB, nullable=False)

    # RRULE string defining recurrence pattern
    # Examples: "FREQ=DAILY;INTERVAL=1", "FREQ=WEEKLY;BYDAY=MO,WE,FR"
    recurrence_pattern = Column(Text, nullable=False)

    # Whether this series is active (soft delete)
    is_active = Column(Boolean, default=True, nullable=False)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc).replace(tzinfo=None), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc).replace(tzinfo=None),
                       onupdate=lambda: datetime.now(timezone.utc).replace(tzinfo=None), nullable=False)

    # Relationships
    user = relationship("User", back_populates="recurring_task_series")
    tasks = relationship("Task", back_populates="recurring_series", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<RecurringTaskSeries(series_id={self.series_id}, user_id={self.user_id}, is_active={self.is_active})>"
