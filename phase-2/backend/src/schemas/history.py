from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from uuid import UUID
from src.models.task_history import ActionType

class HistoryResponse(BaseModel):
    """Schema for single history entry"""
    history_id: UUID
    task_id: Optional[UUID]  # Nullable - preserved after task deletion
    task_title: str  # Task title preserved for reference
    action_type: ActionType
    description: Optional[str]
    timestamp: datetime

    class Config:
        from_attributes = True

class PaginationMetadata(BaseModel):
    """Pagination metadata"""
    total_count: int
    total_pages: int
    current_page: int
    page_size: int
    has_next: bool
    has_prev: bool

class PaginatedHistoryResponse(BaseModel):
    """Schema for paginated history response"""
    items: List[HistoryResponse]
    pagination: PaginationMetadata

class WeeklyStatsResponse(BaseModel):
    """Schema for weekly statistics"""
    tasks_created_this_week: int
    tasks_completed_this_week: int
    total_completed: int
    total_incomplete: int
    week_start: datetime
    week_end: datetime
    total_tasks: int
