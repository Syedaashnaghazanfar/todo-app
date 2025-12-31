from sqlalchemy.orm import Session
from sqlalchemy import desc
from uuid import UUID
from datetime import datetime, timedelta, timezone
from typing import List, Optional
from fastapi import HTTPException, status
from src.models.task import Task
from src.models.task_history import TaskHistory, ActionType
from src.services.priority_classifier import classify_priority, reclassify_priority_on_update
from src.services.tag_validator import validate_tags, normalize_tags
from src.services.notification_service import NotificationService

class TaskService:
    """Service for task operations with user isolation"""

    @staticmethod
    def create_task(
        db: Session,
        title: str,
        description: str = None,
        user_id: str = None,
        due_date: Optional[datetime] = None,
        tags: List[str] = []
    ) -> Task:
        """
        Create a new task for the authenticated user with automatic priority classification.

        Args:
            db: Database session
            title: Task title
            description: Task description (optional)
            user_id: User UUID who owns this task
            due_date: Task due date (optional)
            tags: Task tags (optional, max 5 from standard categories)

        Returns:
            Created task instance

        Raises:
            HTTPException 400: If tags are invalid
        """
        # Normalize tags
        normalized_tags = normalize_tags(tags)

        # Validate tags
        is_valid, error_message = validate_tags(normalized_tags)
        if not is_valid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=error_message
            )

        # Classify priority based on title and due_date
        priority = classify_priority(title, due_date)

        # Create task with all fields
        task = Task(
            title=title,
            description=description,
            user_id=user_id,
            due_date=due_date,
            tags=normalized_tags,
            priority=priority,
            status='NOT_STARTED',
            is_completed=False  # Maintain backward compatibility
        )

        db.add(task)
        db.commit()
        db.refresh(task)

        # Log history entry with user_id
        TaskService.log_history(db, task.id, ActionType.CREATED, "Task created", user_id, task.title)

        # Create notification if task is VERY_IMPORTANT and due within 6 hours
        TaskService.check_and_create_notification(db, task, user_id)

        return task

    @staticmethod
    def get_all_tasks(db: Session, user_id: str):
        """
        Get all tasks for a specific user, ordered with incomplete first.

        Args:
            db: Database session
            user_id: User UUID to filter tasks

        Returns:
            List of tasks owned by the user
        """
        return db.query(Task).filter(
            Task.user_id == user_id
        ).order_by(
            Task.is_completed.asc(),
            desc(Task.created_at)
        ).all()

    @staticmethod
    def get_task(db: Session, task_id: UUID, user_id: str) -> Task:
        """
        Get a specific task by ID, verifying user ownership.

        Args:
            db: Database session
            task_id: Task UUID
            user_id: User UUID to verify ownership

        Returns:
            Task instance if found and owned by user

        Raises:
            HTTPException 403: If task exists but belongs to different user
            HTTPException 404: If task does not exist
        """
        task = db.query(Task).filter(Task.id == task_id).first()

        if not task:
            return None

        # Verify ownership
        if task.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access forbidden: You do not have permission to access this task"
            )

        return task

    @staticmethod
    def update_task(
        db: Session,
        task_id: UUID,
        title: str = None,
        description: str = None,
        user_id: str = None,
        due_date: Optional[datetime] = None,
        tags: Optional[List[str]] = None,
        status: Optional[str] = None
    ) -> Task:
        """
        Update task fields with automatic priority re-classification, verifying user ownership.

        Args:
            db: Database session
            task_id: Task UUID
            title: New title (optional)
            description: New description (optional)
            user_id: User UUID to verify ownership
            due_date: New due date (optional, can be explicitly None to clear)
            tags: New tags (optional, max 5)
            status: New status (optional: NOT_STARTED | IN_PROGRESS | COMPLETED)

        Returns:
            Updated task instance

        Raises:
            HTTPException 400: If tags are invalid or status is invalid
            HTTPException 403: If task belongs to different user
        """
        task = TaskService.get_task(db, task_id, user_id)
        if not task:
            return None

        old_title = task.title
        old_desc = task.description
        old_status = task.status

        # Track changes for history
        change_details = []

        # Update title if provided
        if title is not None:
            task.title = title
            if title != old_title:
                change_details.append(f"title: '{old_title}' -> '{title}'")

        # Update description if provided
        if description is not None:
            task.description = description
            if description != old_desc:
                change_details.append(f"description updated")

        # Update due_date if provided (can be explicitly None to clear)
        if due_date is not None:
            task.due_date = due_date
            change_details.append(f"due_date updated")

        # Update tags if provided
        if tags is not None:
            normalized_tags = normalize_tags(tags)

            # Validate tags
            is_valid, error_message = validate_tags(normalized_tags)
            if not is_valid:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=error_message
                )

            task.tags = normalized_tags
            change_details.append(f"tags updated")

        # Update status if provided
        if status is not None:
            if status not in ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED']:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Status must be one of: NOT_STARTED, IN_PROGRESS, COMPLETED"
                )

            task.status = status
            change_details.append(f"status: '{old_status}' -> '{status}'")

            # Sync is_completed with status for backward compatibility
            if status == 'COMPLETED':
                task.is_completed = True
                task.completed_at = datetime.utcnow()
            else:
                task.is_completed = False
                task.completed_at = None

        # Re-calculate priority if title or due_date changed
        if title is not None or due_date is not None:
            task.priority = reclassify_priority_on_update(
                title=title,
                due_date=due_date,
                current_title=task.title,
                current_due_date=task.due_date
            )
            change_details.append(f"priority recalculated: {task.priority}")

        task.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(task)

        # Log history entry
        TaskService.log_history(db, task_id, ActionType.UPDATED, "; ".join(change_details), user_id, task.title)

        # Check and create notification if task became VERY_IMPORTANT or due date changed
        if title is not None or due_date is not None:
            TaskService.check_and_create_notification(db, task, user_id)

        return task

    @staticmethod
    def delete_task(db: Session, task_id: UUID, user_id: str) -> bool:
        """
        Delete a task, verifying user ownership.

        Args:
            db: Database session
            task_id: Task UUID
            user_id: User UUID to verify ownership

        Returns:
            True if deleted successfully

        Raises:
            HTTPException 403: If task belongs to different user
        """
        task = TaskService.get_task(db, task_id, user_id)
        if not task:
            return False

        # Log history entry before deletion
        TaskService.log_history(db, task_id, ActionType.DELETED, f"Task deleted: {task.title}", user_id)

        db.delete(task)
        db.commit()
        return True

    @staticmethod
    def mark_complete(db: Session, task_id: UUID, user_id: str) -> Task:
        """
        Mark task as completed, verifying user ownership.

        Args:
            db: Database session
            task_id: Task UUID
            user_id: User UUID to verify ownership

        Returns:
            Updated task instance

        Raises:
            HTTPException 403: If task belongs to different user
        """
        task = TaskService.get_task(db, task_id, user_id)
        if not task:
            return None

        task.is_completed = True
        task.completed_at = datetime.utcnow()
        task.status = 'COMPLETED'  # Sync status with is_completed
        task.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(task)

        TaskService.log_history(db, task_id, ActionType.COMPLETED, "Task marked as completed", user_id)

        return task

    @staticmethod
    def mark_incomplete(db: Session, task_id: UUID, user_id: str) -> Task:
        """
        Mark task as incomplete, verifying user ownership.

        Args:
            db: Database session
            task_id: Task UUID
            user_id: User UUID to verify ownership

        Returns:
            Updated task instance

        Raises:
            HTTPException 403: If task belongs to different user
        """
        task = TaskService.get_task(db, task_id, user_id)
        if not task:
            return None

        task.is_completed = False
        task.completed_at = None
        task.status = 'NOT_STARTED'  # Sync status with is_completed
        task.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(task)

        TaskService.log_history(db, task_id, ActionType.INCOMPLETED, "Task marked as incomplete", user_id)

        return task

    @staticmethod
    def log_history(db: Session, task_id: UUID, action: ActionType, description: str = None, user_id: str = None, task_title: str = None):
        """
        Log an action to task history with user tracking and task title preservation.

        Args:
            db: Database session
            task_id: Task UUID
            action: Action type enum
            description: Description of the action
            user_id: User UUID who performed the action
            task_title: Task title (for preservation after deletion)
        """
        # Get task title if not provided
        if not task_title:
            task = db.query(Task).filter(Task.id == task_id).first()
            task_title = task.title if task else "Unknown Task"

        history = TaskHistory(
            task_id=task_id,
            task_title=task_title,
            action_type=action,
            description=description,
            user_id=user_id
        )
        db.add(history)
        db.commit()

    @staticmethod
    def check_and_create_notification(db: Session, task: Task, user_id: str):
        """
        Check if task qualifies for notification and create it.

        Creates notification if:
        - Task priority is VERY_IMPORTANT
        - Task is not completed
        - Task is due within 6 hours

        Args:
            db: Database session
            task: Task to check
            user_id: User UUID
        """
        # Only create notifications for VERY_IMPORTANT tasks
        if task.priority != 'VERY_IMPORTANT':
            return

        # Don't create notifications for completed tasks
        if task.status == 'COMPLETED' or task.is_completed:
            return

        # Don't create notifications if no due date
        if not task.due_date:
            return

        # Check if due within 6 hours
        now = datetime.utcnow()
        if task.due_date.tzinfo is None:
            task_due = task.due_date.replace(tzinfo=timezone.utc)
        else:
            task_due = task.due_date

        now_aware = now.replace(tzinfo=timezone.utc if task_due.tzinfo else None)
        time_until_due = task_due - now_aware

        # Create notification if due within 6 hours
        if timedelta(0) < time_until_due <= timedelta(hours=6):
            # Calculate relative time for message
            hours = int(time_until_due.total_seconds() / 3600)
            minutes = int((time_until_due.total_seconds() % 3600) / 60)

            if hours > 0:
                relative_time = f"in {hours} hour{'s' if hours > 1 else ''}"
            else:
                relative_time = f"in {minutes} minute{'s' if minutes > 1 else ''}"

            message = f"Task '{task.title}' due {relative_time}"

            NotificationService.create_notification(
                db=db,
                task_id=task.id,
                user_id=user_id,
                message=message,
                priority=task.priority
            )
