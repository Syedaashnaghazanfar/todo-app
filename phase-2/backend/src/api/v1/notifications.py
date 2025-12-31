"""Notification API endpoints"""
from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session
from uuid import UUID
from src.api.dependencies import get_db, get_current_user_id
from src.schemas.notification import NotificationResponse, NotificationListResponse
from src.services.notification_service import NotificationService
from src.utils.response import success_response

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("", response_model=NotificationListResponse)
async def get_notifications(
    unread: bool = Query(False, description="Filter to unread notifications only"),
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """
    Get notifications for the authenticated user.

    Args:
        unread: If True, return only unread notifications (read_at IS NULL)
        db: Database session (injected)
        user_id: Current user ID (injected from JWT)

    Returns:
        NotificationListResponse with notifications, unread_count, and total_count
    """
    # Get notifications
    notifications = NotificationService.get_notifications(
        db=db,
        user_id=user_id,
        unread_only=unread,
        limit=50
    )

    # Get counts
    unread_count = NotificationService.get_unread_count(db, user_id)
    total_count = len(notifications)

    # Convert to response schemas
    notification_responses = [
        NotificationResponse.from_orm(n).dict() for n in notifications
    ]

    return {
        "notifications": notification_responses,
        "unread_count": unread_count,
        "total_count": total_count
    }


@router.patch("/{notification_id}/read", response_model=NotificationResponse)
async def mark_notification_as_read(
    notification_id: UUID,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """
    Mark a specific notification as read.

    Args:
        notification_id: Notification UUID
        db: Database session (injected)
        user_id: Current user ID (injected from JWT)

    Returns:
        Updated notification with read_at timestamp

    Raises:
        HTTPException 403: If notification belongs to different user
        HTTPException 404: If notification does not exist
    """
    notification = NotificationService.mark_as_read(db, notification_id, user_id)
    return NotificationResponse.from_orm(notification).dict()


@router.patch("/mark-all-read")
async def mark_all_notifications_as_read(
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """
    Mark all user's unread notifications as read.

    Args:
        db: Database session (injected)
        user_id: Current user ID (injected from JWT)

    Returns:
        Count of notifications marked as read
    """
    count = NotificationService.mark_all_as_read(db, user_id)
    return success_response({
        "count": count,
        "message": f"{count} notifications marked as read"
    })


@router.get("/unread/count")
async def get_unread_count(
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """
    Get count of unread notifications for the authenticated user.

    Args:
        db: Database session (injected)
        user_id: Current user ID (injected from JWT)

    Returns:
        Unread notification count
    """
    count = NotificationService.get_unread_count(db, user_id)
    return success_response({"count": count})
