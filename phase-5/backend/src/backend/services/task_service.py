from sqlalchemy.orm import Session
from sqlalchemy import desc
from uuid import UUID, uuid4
from datetime import datetime, timedelta, timezone
from typing import List, Optional, Dict, Any
from fastapi import HTTPException, status
from backend.models.task import Task
from backend.models.task_history import TaskHistory, ActionType
from backend.models.task_event import TaskEvent
from backend.services.priority_classifier import classify_priority, reclassify_priority_on_update
from backend.services.tag_validator import validate_tags, normalize_tags
from backend.services.notification_service import NotificationService
from backend.schemas.events import (
    create_task_created_event,
    create_task_updated_event,
    create_task_deleted_event,
    create_task_completed_event,
)
from backend.services.kafka_producer import get_kafka_producer
import httpx
import os
import logging
import structlog

logger = logging.getLogger(__name__)
event_logger = structlog.get_logger(__name__)

class TaskService:
    """Service for task operations with user isolation and event publishing"""

    @staticmethod
    async def _publish_and_store_event(
        db: Session,
        event_type: str,
        task_id: UUID,
        user_id: str,
        event_data: Dict[str, Any],
        topic: str = "task-operations",
    ) -> bool:
        """
        Publish event to Kafka and store audit record.

        Args:
            db: Database session
            event_type: Event type (task.created, task.updated, etc.)
            task_id: Task UUID
            user_id: User UUID
            event_data: CloudEvent data payload
            topic: Kafka topic name

        Returns:
            True if event was published successfully, False otherwise
        """
        try:
            # Get Kafka producer
            producer = await get_kafka_producer()

            # Create CloudEvent based on type
            if event_type == "task.created":
                event = create_task_created_event(**event_data)
            elif event_type == "task.updated":
                event = create_task_updated_event(**event_data)
            elif event_type == "task.deleted":
                event = create_task_deleted_event(**event_data)
            elif event_type == "task.completed":
                event = create_task_completed_event(**event_data)
            else:
                event_logger.error("unknown_event_type", event_type=event_type)
                return False

            # Publish to Kafka
            success = await producer.produce_event(
                topic=topic,
                event=event,
                user_id=user_id,
            )

            # Store audit record
            if success:
                task_event = TaskEvent(
                    event_id=UUID(event.id),
                    event_type=event_type,
                    user_id=user_id,
                    task_id=task_id,
                    payload=event.model_dump(mode="json"),
                    published_at=event.time,
                )
                db.add(task_event)
                db.commit()

                event_logger.info(
                    "event_published_and_stored",
                    event_id=event.id,
                    event_type=event_type,
                    task_id=str(task_id),
                    user_id=user_id,
                )

            return success

        except Exception as e:
            event_logger.error(
                "event_publish_failed",
                event_type=event_type,
                task_id=str(task_id),
                error=str(e),
                exc_info=True,
            )
            return False

    @staticmethod
    async def create_task_async(
        db: Session,
        title: str,
        description: str = None,
        user_id: str = None,
        due_date: Optional[datetime] = None,
        tags: List[str] = [],
        series_id: Optional[UUID] = None,
        is_recurring: bool = False,
        recurrence_pattern: Optional[str] = None,
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
            is_completed=False,  # Maintain backward compatibility
            series_id=series_id,
            is_recurring=is_recurring,
            recurrence_pattern=recurrence_pattern,
        )

        db.add(task)
        db.commit()
        db.refresh(task)

        # Log history entry with user_id
        TaskService.log_history(db, task.id, ActionType.CREATED, "Task created", user_id, task.title)

        # Create notification if task is VERY_IMPORTANT and due within 6 hours
        TaskService.check_and_create_notification(db, task, user_id)

        # Publish task.created event
        await TaskService._publish_and_store_event(
            db=db,
            event_type="task.created",
            task_id=task.id,
            user_id=user_id,
            event_data={
                "task_id": task.id,
                "user_id": user_id,
                "title": title,
                "description": description,
                "due_date": due_date,
                "priority": priority,
                "tags": normalized_tags,
                "is_recurring": is_recurring,
                "series_id": series_id,
                "recurrence_pattern": recurrence_pattern,
            },
        )

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
                task.completed_at = datetime.now(timezone.utc).replace(tzinfo=None)
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

        task.updated_at = datetime.now(timezone.utc).replace(tzinfo=None)
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
    async def update_task_async(
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
        Update task fields with automatic priority re-classification and event publishing.

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
        old_due_date = task.due_date
        old_tags = task.tags

        # Track changes for history and event
        change_details = []
        updated_fields = {}

        # Update title if provided
        if title is not None and title != old_title:
            task.title = title
            change_details.append(f"title: '{old_title}' -> '{title}'")
            updated_fields["title"] = title

        # Update description if provided
        if description is not None and description != old_desc:
            task.description = description
            change_details.append(f"description updated")
            updated_fields["description"] = description

        # Update due_date if provided (can be explicitly None to clear)
        if due_date is not None and due_date != old_due_date:
            task.due_date = due_date
            change_details.append(f"due_date updated")
            updated_fields["due_date"] = due_date.isoformat() if due_date else None

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

            if normalized_tags != old_tags:
                task.tags = normalized_tags
                change_details.append(f"tags updated")
                updated_fields["tags"] = normalized_tags

        # Update status if provided
        if status is not None and status != old_status:
            if status not in ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED']:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Status must be one of: NOT_STARTED, IN_PROGRESS, COMPLETED"
                )

            task.status = status
            change_details.append(f"status: '{old_status}' -> '{status}'")
            updated_fields["status"] = status

            # Sync is_completed with status for backward compatibility
            if status == 'COMPLETED':
                task.is_completed = True
                task.completed_at = datetime.now(timezone.utc).replace(tzinfo=None)
            else:
                task.is_completed = False
                task.completed_at = None

        # Re-calculate priority if title or due_date changed
        if title is not None or due_date is not None:
            old_priority = task.priority
            task.priority = reclassify_priority_on_update(
                title=title,
                due_date=due_date,
                current_title=task.title,
                current_due_date=task.due_date
            )
            if task.priority != old_priority:
                change_details.append(f"priority recalculated: {task.priority}")
                updated_fields["priority"] = task.priority

        task.updated_at = datetime.now(timezone.utc).replace(tzinfo=None)
        db.commit()
        db.refresh(task)

        # Log history entry
        if change_details:
            TaskService.log_history(db, task_id, ActionType.UPDATED, "; ".join(change_details), user_id, task.title)

        # Check and create notification if task became VERY_IMPORTANT or due date changed
        if title is not None or due_date is not None:
            TaskService.check_and_create_notification(db, task, user_id)

        # Publish task.updated event only if there were actual changes
        if updated_fields:
            await TaskService._publish_and_store_event(
                db=db,
                event_type="task.updated",
                task_id=task.id,
                user_id=user_id,
                event_data={
                    "task_id": task.id,
                    "user_id": user_id,
                    "updated_fields": updated_fields,
                },
            )

        return task

    @staticmethod
    async def delete_task_async(db: Session, task_id: UUID, user_id: str) -> bool:
        """
        Delete a task with event publishing, verifying user ownership.

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

        # Store series_id before deletion
        series_id = task.series_id

        # Log history entry before deletion
        TaskService.log_history(db, task_id, ActionType.DELETED, f"Task deleted: {task.title}", user_id)

        # Publish task.deleted event before deletion
        await TaskService._publish_and_store_event(
            db=db,
            event_type="task.deleted",
            task_id=task_id,
            user_id=user_id,
            event_data={
                "task_id": task_id,
                "user_id": user_id,
                "series_id": series_id,
            },
        )

        db.delete(task)
        db.commit()
        return True

    @staticmethod
    async def mark_complete_async(db: Session, task_id: UUID, user_id: str) -> Task:
        """
        Mark task as completed with event publishing, verifying user ownership.

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
        task.completed_at = datetime.now(timezone.utc).replace(tzinfo=None)
        task.status = 'COMPLETED'  # Sync status with is_completed
        task.updated_at = datetime.now(timezone.utc).replace(tzinfo=None)
        db.commit()
        db.refresh(task)

        TaskService.log_history(db, task_id, ActionType.COMPLETED, "Task marked as completed", user_id)

        # Publish task.completed event (Phase 5 - for recurring tasks)
        await TaskService._publish_and_store_event(
            db=db,
            event_type="task.completed",
            task_id=task.id,
            user_id=user_id,
            event_data={
                "task_id": task.id,
                "user_id": user_id,
                "series_id": task.series_id,
                "recurrence_pattern": task.recurrence_pattern,
            },
        )

        return task

    @staticmethod
    def mark_complete(db: Session, task_id: UUID, user_id: str) -> Task:
        """
        Mark task as completed, verifying user ownership (synchronous version).

        Args:
            db: Database session
            task_id: Task UUID
            user_id: User UUID to verify ownership

        Returns:
            Updated task instance

        Raises:
            HTTPException 403: If task belongs to different user

        Note:
            This is the legacy synchronous version. Use mark_complete_async for
            event publishing support (Phase 5 recurring tasks).
        """
        task = TaskService.get_task(db, task_id, user_id)
        if not task:
            return None

        task.is_completed = True
        task.completed_at = datetime.now(timezone.utc).replace(tzinfo=None)
        task.status = 'COMPLETED'  # Sync status with is_completed
        task.updated_at = datetime.now(timezone.utc).replace(tzinfo=None)
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
        task.updated_at = datetime.now(timezone.utc).replace(tzinfo=None)
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
        now = datetime.now(timezone.utc).replace(tzinfo=None)
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
