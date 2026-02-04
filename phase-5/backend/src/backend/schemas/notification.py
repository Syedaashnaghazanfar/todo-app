"""Pydantic schemas for notifications"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from uuid import UUID


class NotificationCreate(BaseModel):
    """Schema for creating a new notification"""
    task_id: UUID = Field(..., description="Task ID reference")
    message: str = Field(..., min_length=1, max_length=500, description="Notification message")
    priority: str = Field(..., description="Task priority for styling (VERY_IMPORTANT | HIGH | MEDIUM | LOW)")


class NotificationResponse(BaseModel):
    """Schema for notification response"""
    id: UUID
    task_id: UUID
    user_id: str
    message: str
    priority: str
    created_at: datetime
    read_at: Optional[datetime] = None
    is_read: bool = Field(..., description="Computed from read_at")

    class Config:
        from_attributes = True


class NotificationListResponse(BaseModel):
    """Schema for notification list response"""
    notifications: List[NotificationResponse]
    unread_count: int = Field(..., description="Count of unread notifications")
    total_count: int = Field(..., description="Total count of notifications")
