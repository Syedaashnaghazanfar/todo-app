"""Service layer for notification operations"""
from sqlalchemy.orm import Session
from sqlalchemy import desc
from uuid import UUID
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import HTTPException, status
from backend.models.notification import Notification


class NotificationService:
    """Service for notification operations with user isolation"""

    @staticmethod
    def create_notification(
        db: Session,
        task_id: UUID,
        user_id: str,
        message: str,
        priority: str
    ) -> Notification:
        """
        Create a new notification record.

        Args:
            db: Database session
            task_id: Task UUID reference
            user_id: User UUID who owns this notification
            message: Notification message text
            priority: Task priority for UI styling

        Returns:
            Created notification instance
        """
        # Create notification
        notification = Notification(
            task_id=task_id,
            user_id=user_id,
            message=message,
            priority=priority,
            created_at=datetime.now(timezone.utc)
        )

        db.add(notification)
        db.commit()
        db.refresh(notification)

        # Auto-prune if user has >50 notifications
        NotificationService.prune_old_notifications(db, user_id, max_count=50)

        return notification

    @staticmethod
    def get_notifications(
        db: Session,
        user_id: str,
        unread_only: bool = False,
        limit: int = 50
    ) -> List[Notification]:
        """
        Get user's notifications ordered by created_at DESC.

        Args:
            db: Database session
            user_id: User UUID to filter notifications
            unread_only: If True, filter where read_at IS NULL
            limit: Maximum number of notifications to return (default: 50)

        Returns:
            List of notifications owned by the user
        """
        query = db.query(Notification).filter(Notification.user_id == user_id)

        if unread_only:
            query = query.filter(Notification.read_at.is_(None))

        return query.order_by(desc(Notification.created_at)).limit(limit).all()

    @staticmethod
    def get_unread_count(db: Session, user_id: str) -> int:
        """
        Count unread notifications for a user.

        Args:
            db: Database session
            user_id: User UUID

        Returns:
            Count of unread notifications
        """
        return db.query(Notification).filter(
            Notification.user_id == user_id,
            Notification.read_at.is_(None)
        ).count()

    @staticmethod
    def mark_as_read(db: Session, notification_id: UUID, user_id: str) -> Notification:
        """
        Mark notification as read (set read_at timestamp).

        Args:
            db: Database session
            notification_id: Notification UUID
            user_id: User UUID to verify ownership

        Returns:
            Updated notification instance

        Raises:
            HTTPException 403: If notification belongs to different user
            HTTPException 404: If notification does not exist
        """
        notification = db.query(Notification).filter(Notification.id == notification_id).first()

        if not notification:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Notification not found"
            )

        # Verify ownership
        if notification.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access forbidden: You do not have permission to access this notification"
            )

        # Set read_at timestamp if not already read
        if notification.read_at is None:
            notification.read_at = datetime.now(timezone.utc)
            db.commit()
            db.refresh(notification)

        return notification

    @staticmethod
    def mark_all_as_read(db: Session, user_id: str) -> int:
        """
        Mark all user's unread notifications as read.

        Args:
            db: Database session
            user_id: User UUID

        Returns:
            Count of notifications marked as read
        """
        updated_count = db.query(Notification).filter(
            Notification.user_id == user_id,
            Notification.read_at.is_(None)
        ).update(
            {"read_at": datetime.now(timezone.utc)},
            synchronize_session=False
        )

        db.commit()
        return updated_count

    @staticmethod
    def delete_by_task(db: Session, task_id: UUID) -> int:
        """
        Delete all notifications for a task.
        Note: This should happen automatically via CASCADE, but provided for clarity.

        Args:
            db: Database session
            task_id: Task UUID

        Returns:
            Count of notifications deleted
        """
        deleted_count = db.query(Notification).filter(
            Notification.task_id == task_id
        ).delete(synchronize_session=False)

        db.commit()
        return deleted_count

    @staticmethod
    def prune_old_notifications(db: Session, user_id: str, max_count: int = 50) -> int:
        """
        Keep only the latest max_count notifications per user.
        Deletes oldest read notifications first.
        Never deletes unread notifications.

        Args:
            db: Database session
            user_id: User UUID
            max_count: Maximum notifications to retain (default: 50)

        Returns:
            Count of notifications deleted
        """
        # Get total count
        total_count = db.query(Notification).filter(
            Notification.user_id == user_id
        ).count()

        if total_count <= max_count:
            return 0  # No pruning needed

        # Get read notifications ordered by created_at ASC (oldest first)
        read_notifications = db.query(Notification).filter(
            Notification.user_id == user_id,
            Notification.read_at.isnot(None)
        ).order_by(Notification.created_at.asc()).all()

        # Calculate how many to delete
        to_delete_count = total_count - max_count

        # Delete oldest read notifications
        deleted_count = 0
        for notification in read_notifications[:to_delete_count]:
            db.delete(notification)
            deleted_count += 1

        db.commit()
        return deleted_count
