from sqlalchemy import Column, String, Text, Boolean, DateTime, CheckConstraint, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from src.database.base import Base
from datetime import datetime
import uuid

class Task(Base):
    __tablename__ = "tasks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    is_completed = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    completed_at = Column(DateTime, nullable=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)

    # New fields for Skills & Subagents Architecture
    priority = Column(String(20), nullable=False, default='LOW')
    tags = Column(JSONB, nullable=False, default=list)
    due_date = Column(DateTime(timezone=True), nullable=True)
    status = Column(String(20), nullable=False, default='NOT_STARTED')

    # Relationships
    user = relationship("User", back_populates="tasks")
    notifications = relationship("Notification", back_populates="task", cascade="all, delete-orphan")

    __table_args__ = (
        CheckConstraint('length(trim(title)) > 0', name='task_title_not_empty'),
        CheckConstraint('length(description) <= 5000', name='task_description_max_length'),
        CheckConstraint(
            '(is_completed = true AND completed_at IS NOT NULL) OR (is_completed = false AND completed_at IS NULL)',
            name='task_completed_at_consistency'
        ),
        CheckConstraint(
            "status IN ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED')",
            name='task_status_check'
        ),
        CheckConstraint(
            "priority IN ('VERY_IMPORTANT', 'HIGH', 'MEDIUM', 'LOW')",
            name='task_priority_check'
        ),
    )

    @property
    def is_very_important(self) -> bool:
        """Check if task has VERY_IMPORTANT priority"""
        return self.priority == 'VERY_IMPORTANT'

    def __repr__(self):
        return f"<Task(id={self.id}, title={self.title}, priority={self.priority}, status={self.status})>"
