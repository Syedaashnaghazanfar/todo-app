"""
Schemas for Recurring Task Series

Phase 5: Enterprise Cloud Infrastructure - Recurring Task Lifecycle Management
"""
from pydantic import BaseModel, Field, validator
from typing import Optional, Dict, Any, List
from datetime import datetime
from uuid import UUID


class RecurringTaskSeriesBase(BaseModel):
    """Base schema for recurring task series"""
    base_task_template: Dict[str, Any] = Field(
        ...,
        description="Template for generating task instances (title, description, priority, tags)"
    )
    recurrence_pattern: str = Field(
        ...,
        description="RRULE string (e.g., 'FREQ=DAILY;INTERVAL=1' or 'FREQ=WEEKLY;BYDAY=MO,WE,FR')"
    )

    @validator("base_task_template")
    def validate_template(cls, v):
        """Validate that template has required fields"""
        if not v.get("title"):
            raise ValueError("base_task_template must include 'title'")
        return v

    @validator("recurrence_pattern")
    def validate_rrule(cls, v):
        """Validate RRULE string format"""
        if not v or not v.strip():
            raise ValueError("recurrence_pattern cannot be empty")

        # Basic RRULE validation
        v = v.strip().upper()
        if not v.startswith("FREQ="):
            raise ValueError("recurrence_pattern must start with FREQ=")

        valid_freqs = ["DAILY", "WEEKLY", "MONTHLY", "YEARLY"]
        freq_part = v.split(";")[0].replace("FREQ=", "")
        if freq_part not in valid_freqs:
            raise ValueError(f"FREQ must be one of: {', '.join(valid_freqs)}")

        return v


class RecurringTaskSeriesCreate(RecurringTaskSeriesBase):
    """Schema for creating a recurring task series"""
    pass


class RecurringTaskSeriesResponse(RecurringTaskSeriesBase):
    """Schema for recurring task series response"""
    series_id: UUID
    user_id: str
    is_active: bool
    created_at: datetime
    updated_at: datetime
    first_task_id: Optional[UUID] = Field(
        None,
        description="ID of the first task instance generated"
    )

    class Config:
        from_attributes = True


class RecurringTaskSeriesUpdate(BaseModel):
    """Schema for updating a recurring task series"""
    base_task_template: Optional[Dict[str, Any]] = None
    recurrence_pattern: Optional[str] = None
    is_active: Optional[bool] = None

    @validator("base_task_template")
    def validate_template(cls, v):
        """Validate that template has required fields if provided"""
        if v is not None and not v.get("title"):
            raise ValueError("base_task_template must include 'title'")
        return v

    @validator("recurrence_pattern")
    def validate_rrule(cls, v):
        """Validate RRULE string format if provided"""
        if v is None:
            return v

        v = v.strip().upper()
        if not v.startswith("FREQ="):
            raise ValueError("recurrence_pattern must start with FREQ=")

        valid_freqs = ["DAILY", "WEEKLY", "MONTHLY", "YEARLY"]
        freq_part = v.split(";")[0].replace("FREQ=", "")
        if freq_part not in valid_freqs:
            raise ValueError(f"FREQ must be one of: {', '.join(valid_freqs)}")

        return v
