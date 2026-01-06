from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Enum, CheckConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from backend.database.base import Base
from datetime import datetime, timezone
import uuid
import enum

class ActionType(str, enum.Enum):
    CREATED = "CREATED"
    UPDATED = "UPDATED"
    DELETED = "DELETED"
    COMPLETED = "COMPLETED"
    INCOMPLETED = "INCOMPLETED"

class TaskHistory(Base):
    __tablename__ = "task_history"

    history_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    task_id = Column(UUID(as_uuid=True), nullable=True, index=True)  # Nullable - preserved after task deletion
    task_title = Column(String(255), nullable=False)  # Store task title for reference after deletion
    action_type = Column(Enum(ActionType), nullable=False)
    description = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc).replace(tzinfo=None), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)

    # Relationships
    user = relationship("User", back_populates="history")

    __table_args__ = (
        CheckConstraint(
            "action_type IN ('CREATED', 'UPDATED', 'DELETED', 'COMPLETED', 'INCOMPLETED')",
            name='history_valid_action_type'
        ),
    )

    def __repr__(self):
        return f"<TaskHistory(history_id={self.history_id}, task_id={self.task_id}, action={self.action_type})>"
