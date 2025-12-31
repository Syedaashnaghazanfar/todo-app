"""Notification model for task notifications"""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from src.database import Base


class Notification(Base):
    """Notification model for VERY_IMPORTANT task alerts"""
    __tablename__ = "notifications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    task_id = Column(UUID(as_uuid=True), ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    message = Column(Text, nullable=False)
    priority = Column(String(20), nullable=False)
    created_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)
    read_at = Column(DateTime(timezone=True), nullable=True, index=True)

    # Relationships
    task = relationship("Task", back_populates="notifications")
    user = relationship("User", back_populates="notifications")

    @property
    def is_read(self) -> bool:
        """Check if notification has been read"""
        return self.read_at is not None

    def __repr__(self):
        return f"<Notification(id={self.id}, task_id={self.task_id}, user_id={self.user_id}, is_read={self.is_read})>"
