from sqlalchemy.orm import Session
from sqlalchemy import desc
from uuid import UUID
from datetime import datetime
from fastapi import HTTPException, status
from src.models.task_history import TaskHistory, ActionType
from src.utils.timestamps import get_week_boundaries

class HistoryService:
    """Service for history and analytics operations with user isolation"""

    @staticmethod
    def get_history_paginated(
        db: Session,
        user_id: str,
        page: int = 1,
        limit: int = 10,
        offset: int = None,
        task_id: UUID = None,
        action_type: str = None
    ):
        """
        Get paginated history with filtering, scoped to user.

        Args:
            db: Database session
            user_id: User UUID to filter history
            page: Page number (default 1)
            limit: Items per page (default 10)
            offset: Optional offset for pagination
            task_id: Optional task ID filter
            action_type: Optional action type filter

        Returns:
            Dict with items and pagination metadata
        """
        query = db.query(TaskHistory).filter(
            TaskHistory.user_id == user_id
        ).order_by(desc(TaskHistory.timestamp))

        if task_id:
            query = query.filter(TaskHistory.task_id == task_id)

        if action_type:
            query = query.filter(TaskHistory.action_type == action_type)

        total_count = query.count()

        # Handle pagination
        if offset is not None:
            items = query.offset(offset).limit(limit).all()
            current_page = (offset // limit) + 1
        else:
            items = query.offset((page - 1) * limit).limit(limit).all()
            current_page = page

        total_pages = (total_count + limit - 1) // limit

        return {
            "items": items,
            "pagination": {
                "total_count": total_count,
                "total_pages": total_pages,
                "current_page": current_page,
                "page_size": limit,
                "has_next": current_page < total_pages,
                "has_prev": current_page > 1
            }
        }

    @staticmethod
    def get_weekly_stats(db: Session, user_id: str):
        """
        Get weekly and overall statistics for a specific user.

        Args:
            db: Database session
            user_id: User UUID to filter statistics

        Returns:
            Dict with weekly and total statistics
        """
        from src.models.task import Task

        week_start, week_end = get_week_boundaries()

        # Total statistics (scoped to user)
        total_tasks = db.query(Task).filter(Task.user_id == user_id).count()
        total_completed = db.query(Task).filter(
            Task.user_id == user_id,
            Task.is_completed == True
        ).count()
        total_incomplete = db.query(Task).filter(
            Task.user_id == user_id,
            Task.is_completed == False
        ).count()

        # Weekly statistics (scoped to user)
        tasks_created_this_week = db.query(Task).filter(
            Task.user_id == user_id,
            Task.created_at >= week_start,
            Task.created_at <= week_end
        ).count()

        tasks_completed_this_week = db.query(Task).filter(
            Task.user_id == user_id,
            Task.completed_at >= week_start,
            Task.completed_at <= week_end
        ).count()

        return {
            "tasks_created_this_week": tasks_created_this_week,
            "tasks_completed_this_week": tasks_completed_this_week,
            "total_completed": total_completed,
            "total_incomplete": total_incomplete,
            "week_start": week_start,
            "week_end": week_end,
            "total_tasks": total_tasks
        }

    @staticmethod
    def delete_history_entry(db: Session, history_id: UUID, user_id: str) -> bool:
        """
        Delete a specific history entry, verifying user ownership.

        Args:
            db: Database session
            history_id: History entry UUID
            user_id: User UUID to verify ownership

        Returns:
            True if deleted successfully, False if not found

        Raises:
            HTTPException 403: If history entry belongs to different user
        """
        # Get history entry
        history = db.query(TaskHistory).filter(TaskHistory.history_id == history_id).first()

        if not history:
            return False

        # Verify ownership
        if history.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access forbidden: You do not have permission to delete this history entry"
            )

        # Delete history entry
        db.delete(history)
        db.commit()
        return True
