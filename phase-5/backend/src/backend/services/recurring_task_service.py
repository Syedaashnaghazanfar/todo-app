"""
Recurring Task Service

Manages recurring task series and generates initial task instances.

Phase 5: Enterprise Cloud Infrastructure - Recurring Task Lifecycle Management
"""
from sqlalchemy.orm import Session
from uuid import UUID
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from fastapi import HTTPException, status
import logging

from backend.models.recurring_task_series import RecurringTaskSeries
from backend.models.task import Task
from backend.services.task_service import TaskService

logger = logging.getLogger(__name__)


class RecurringTaskService:
    """Service for recurring task series operations"""

    @staticmethod
    def create_recurring_series(
        db: Session,
        user_id: str,
        base_task_template: Dict[str, Any],
        recurrence_pattern: str
    ) -> tuple[RecurringTaskSeries, Task]:
        """
        Create a new recurring task series and generate the first task instance.

        Args:
            db: Database session
            user_id: User UUID who owns this series
            base_task_template: Template for generating task instances
            recurrence_pattern: RRULE string defining recurrence

        Returns:
            Tuple of (created series, first task instance)

        Raises:
            HTTPException 400: If validation fails
        """
        try:
            # Create recurring task series
            series = RecurringTaskSeries(
                user_id=user_id,
                base_task_template=base_task_template,
                recurrence_pattern=recurrence_pattern,
                is_active=True
            )

            db.add(series)
            db.flush()  # Flush to get series_id before creating first task

            # Generate first task instance
            first_task = RecurringTaskService._generate_task_from_series(
                db=db,
                series=series,
                user_id=user_id
            )

            db.commit()
            db.refresh(series)
            db.refresh(first_task)

            logger.info(
                f"Created recurring series {series.series_id} with first task {first_task.id}"
            )

            return series, first_task

        except Exception as e:
            db.rollback()
            logger.error(f"Failed to create recurring series: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to create recurring series: {str(e)}"
            )

    @staticmethod
    def _generate_task_from_series(
        db: Session,
        series: RecurringTaskSeries,
        user_id: str,
        due_date: Optional[datetime] = None
    ) -> Task:
        """
        Generate a task instance from a recurring series template.

        Args:
            db: Database session
            series: Recurring task series
            user_id: User UUID
            due_date: Optional due date for the task (defaults to now)

        Returns:
            Created task instance
        """
        template = series.base_task_template

        # Use template values with defaults
        title = template.get("title", "Recurring Task")
        description = template.get("description")
        priority = template.get("priority", "MEDIUM")
        tags = template.get("tags", [])

        # Use provided due_date or default to now
        if due_date is None:
            due_date = datetime.now(timezone.utc)

        # Create task with recurring fields
        task = Task(
            title=title,
            description=description,
            user_id=user_id,
            due_date=due_date,
            tags=tags,
            priority=priority,
            status='NOT_STARTED',
            is_completed=False,
            is_recurring=True,
            series_id=series.series_id,
            recurrence_pattern=series.recurrence_pattern
        )

        db.add(task)
        db.flush()

        return task

    @staticmethod
    def get_series_by_id(
        db: Session,
        series_id: UUID,
        user_id: str
    ) -> Optional[RecurringTaskSeries]:
        """
        Get a recurring task series by ID, verifying user ownership.

        Args:
            db: Database session
            series_id: Series UUID
            user_id: User UUID to verify ownership

        Returns:
            Recurring task series if found and owned by user

        Raises:
            HTTPException 403: If series belongs to different user
            HTTPException 404: If series does not exist
        """
        series = db.query(RecurringTaskSeries).filter(
            RecurringTaskSeries.series_id == series_id
        ).first()

        if not series:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Recurring task series not found"
            )

        # Verify ownership
        if series.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access forbidden: You do not have permission to access this series"
            )

        return series

    @staticmethod
    def get_all_series(
        db: Session,
        user_id: str,
        include_inactive: bool = False
    ) -> List[RecurringTaskSeries]:
        """
        Get all recurring task series for a user.

        Args:
            db: Database session
            user_id: User UUID to filter series
            include_inactive: Whether to include inactive series

        Returns:
            List of recurring task series owned by the user
        """
        query = db.query(RecurringTaskSeries).filter(
            RecurringTaskSeries.user_id == user_id
        )

        if not include_inactive:
            query = query.filter(RecurringTaskSeries.is_active == True)

        return query.order_by(RecurringTaskSeries.created_at.desc()).all()

    @staticmethod
    def update_series(
        db: Session,
        series_id: UUID,
        user_id: str,
        base_task_template: Optional[Dict[str, Any]] = None,
        recurrence_pattern: Optional[str] = None,
        is_active: Optional[bool] = None
    ) -> RecurringTaskSeries:
        """
        Update a recurring task series.

        Args:
            db: Database session
            series_id: Series UUID
            user_id: User UUID to verify ownership
            base_task_template: New template (optional)
            recurrence_pattern: New recurrence pattern (optional)
            is_active: New active status (optional)

        Returns:
            Updated recurring task series

        Raises:
            HTTPException 403: If series belongs to different user
            HTTPException 404: If series does not exist
        """
        series = RecurringTaskService.get_series_by_id(db, series_id, user_id)

        if base_task_template is not None:
            series.base_task_template = base_task_template

        if recurrence_pattern is not None:
            series.recurrence_pattern = recurrence_pattern

        if is_active is not None:
            series.is_active = is_active

        series.updated_at = datetime.now(timezone.utc).replace(tzinfo=None)
        db.commit()
        db.refresh(series)

        logger.info(f"Updated recurring series {series_id}")

        return series

    @staticmethod
    def delete_series(
        db: Session,
        series_id: UUID,
        user_id: str
    ) -> bool:
        """
        Soft delete a recurring task series (set is_active=False).

        Note: Existing task instances are NOT deleted (preserve history).

        Args:
            db: Database session
            series_id: Series UUID
            user_id: User UUID to verify ownership

        Returns:
            True if deleted successfully

        Raises:
            HTTPException 403: If series belongs to different user
            HTTPException 404: If series does not exist
        """
        series = RecurringTaskService.get_series_by_id(db, series_id, user_id)

        # Soft delete - preserve existing task instances
        series.is_active = False
        series.updated_at = datetime.now(timezone.utc).replace(tzinfo=None)
        db.commit()

        logger.info(f"Soft deleted recurring series {series_id} (existing tasks preserved)")

        return True

    @staticmethod
    def get_series_tasks(
        db: Session,
        series_id: UUID,
        user_id: str
    ) -> List[Task]:
        """
        Get all task instances for a recurring series.

        Args:
            db: Database session
            series_id: Series UUID
            user_id: User UUID to verify ownership

        Returns:
            List of tasks belonging to the series

        Raises:
            HTTPException 403: If series belongs to different user
            HTTPException 404: If series does not exist
        """
        # Verify series ownership
        series = RecurringTaskService.get_series_by_id(db, series_id, user_id)

        # Get all tasks for this series
        tasks = db.query(Task).filter(
            Task.series_id == series_id
        ).order_by(Task.due_date.desc()).all()

        return tasks
