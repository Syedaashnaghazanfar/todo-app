from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from datetime import datetime
from uuid import UUID

class TaskCreate(BaseModel):
    """Schema for creating a new task"""
    title: str = Field(..., min_length=1, max_length=255, description="Task title (required, 1-255 chars)")
    description: Optional[str] = Field(None, max_length=5000, description="Task description (optional, max 5000 chars)")
    due_date: Optional[datetime] = Field(None, description="Task due date (optional, ISO 8601 datetime)")
    tags: Optional[List[str]] = Field(default=[], description="Task tags (max 5 tags from standard categories)")

    @field_validator('tags')
    @classmethod
    def validate_tags_length(cls, v):
        """Ensure max 5 tags"""
        if v and len(v) > 5:
            raise ValueError('Maximum 5 tags allowed per task')
        return v or []

class TaskUpdate(BaseModel):
    """Schema for updating a task"""
    title: Optional[str] = Field(None, min_length=1, max_length=255, description="Updated task title")
    description: Optional[str] = Field(None, max_length=5000, description="Updated task description")
    due_date: Optional[datetime] = Field(None, description="Updated due date")
    tags: Optional[List[str]] = Field(None, description="Updated tags (max 5)")
    status: Optional[str] = Field(None, description="Updated status (NOT_STARTED | IN_PROGRESS | COMPLETED)")

    @field_validator('tags')
    @classmethod
    def validate_tags_length(cls, v):
        """Ensure max 5 tags"""
        if v and len(v) > 5:
            raise ValueError('Maximum 5 tags allowed per task')
        return v

    @field_validator('status')
    @classmethod
    def validate_status(cls, v):
        """Ensure valid status enum"""
        if v and v not in ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED']:
            raise ValueError("Status must be one of: NOT_STARTED, IN_PROGRESS, COMPLETED")
        return v

class TaskResponse(BaseModel):
    """Schema for task response"""
    id: UUID
    title: str
    description: Optional[str]
    is_completed: bool
    created_at: datetime
    updated_at: datetime
    completed_at: Optional[datetime]
    user_id: Optional[str]

    # New fields for Skills & Subagents Architecture
    priority: str = Field(..., description="Task priority (VERY_IMPORTANT | HIGH | MEDIUM | LOW)")
    tags: List[str] = Field(default=[], description="Task tags")
    due_date: Optional[datetime] = Field(None, description="Task due date")
    status: str = Field(..., description="Task status (NOT_STARTED | IN_PROGRESS | COMPLETED)")

    class Config:
        from_attributes = True
