"""
Reminder Service for Recurring Task Notifications

This service provides the core logic for the recurring reminder system.
It checks VERY_IMPORTANT tasks and creates progressive deadline notifications
(6h, 3h, 1h, 30m, 15m before due date) and overdue notifications when tasks
pass their deadline (when REMINDER_ENABLE_OVERDUE=true).

Features:
- Progressive deadline alerts with escalating urgency (⏰ → ⚠️ → 🚨 → 🔴 → 🚨🚨)
- Overdue task notifications (❌ OVERDUE)
- Automatic lifecycle management (auto-start/stop based on task status)
- Duplicate prevention using database message matching
- Configurable via environment variables
"""

from sqlalchemy.orm import Session
from uuid import UUID
from datetime import datetime, timezone
from typing import Dict, Optional
from backend.models.task import Task
from backend.models.notification import Notification
from backend.config.settings import REMINDER_THRESHOLDS, REMINDER_THRESHOLD_WINDOW, REMINDER_ENABLE_OVERDUE
import logging

logger = logging.getLogger(__name__)


class ReminderService:
    """Service for recurring reminder operations"""

    @staticmethod
    def check_and_create_reminders(db: Session) -> Dict[str, int]:
        """
        Main job function - checks all VERY_IMPORTANT tasks and creates due notifications.

        This method:
        1. Queries all VERY_IMPORTANT tasks with due dates
        2. Calculates time remaining until deadline
        3. Checks if task is overdue and creates overdue notification (if REMINDER_ENABLE_OVERDUE=true)
        4. Checks if any threshold (6h, 3h, 1h, 30m, 15m) is reached
        5. Creates notification if threshold reached and no duplicate exists

        Args:
            db: SQLAlchemy database session

        Returns:
            dict: {"tasks_checked": int, "notifications_created": int, "execution_time_ms": float}

        Raises:
            Exception: Any unexpected errors (logged, not propagated)
        """
        start_time = datetime.now(timezone.utc)
        tasks_checked = 0
        notifications_created = 0

        try:
            # Query all VERY_IMPORTANT tasks with due dates that are not completed
            tasks = db.query(Task).filter(
                Task.priority == "VERY_IMPORTANT",
                Task.status != "COMPLETED",
                Task.due_date.isnot(None)
            ).all()

            tasks_checked = len(tasks)
            logger.info(f"[ReminderJob] Checking {tasks_checked} VERY_IMPORTANT tasks")

            # Check each task against thresholds
            for task in tasks:
                # Calculate time remaining
                now = datetime.now(timezone.utc)
                hours_remaining = (task.due_date - now).total_seconds() / 3600

                # Check for overdue tasks first (if enabled)
                if hours_remaining < 0 and REMINDER_ENABLE_OVERDUE:
                    message = f"❌ OVERDUE: Task '{task.title}' is now overdue!"

                    # Check if overdue notification already exists (duplicate prevention)
                    if not ReminderService.notification_exists(db, task.id, message):
                        # Create overdue notification
                        notification = Notification(
                            task_id=task.id,
                            user_id=task.user_id,
                            message=message,
                            priority=task.priority,
                            created_at=datetime.now(timezone.utc)
                        )
                        db.add(notification)
                        notifications_created += 1
                        logger.info(f"[ReminderJob] Created OVERDUE notification for task {task.id}")
                    else:
                        logger.debug(f"[ReminderJob] Skipped duplicate overdue notification for task {task.id}")

                    # Skip threshold checks for overdue tasks
                    continue

                # Check regular thresholds for non-overdue tasks
                for threshold_hours in REMINDER_THRESHOLDS:
                    if ReminderService.should_create_notification(task, threshold_hours):
                        message = ReminderService.get_threshold_message(task, threshold_hours)

                        # Check if notification already exists (duplicate prevention)
                        if not ReminderService.notification_exists(db, task.id, message):
                            # Create notification
                            notification = Notification(
                                task_id=task.id,
                                user_id=task.user_id,
                                message=message,
                                priority=task.priority,
                                created_at=datetime.now(timezone.utc)
                            )
                            db.add(notification)
                            notifications_created += 1
                            logger.info(f"[ReminderJob] Created notification for task {task.id} at {threshold_hours}h threshold")

            # Commit all notifications
            if notifications_created > 0:
                db.commit()

            # Calculate execution time
            end_time = datetime.now(timezone.utc)
            execution_time_ms = (end_time - start_time).total_seconds() * 1000

            logger.info(f"[ReminderJob] Checked {tasks_checked} tasks, created {notifications_created} notifications in {execution_time_ms:.0f}ms")

            return {
                "tasks_checked": tasks_checked,
                "notifications_created": notifications_created,
                "execution_time_ms": execution_time_ms
            }

        except Exception as e:
            logger.error(f"[ReminderJob] Failed: {str(e)}", exc_info=True)
            db.rollback()
            raise

    @staticmethod
    def should_create_notification(task: Task, threshold_hours: float, window: Optional[float] = None) -> bool:
        """
        Determines if notification should be created for task at threshold.

        Uses threshold windows to account for the 10-minute job interval.
        Example: For 6-hour threshold with 10-min window:
            - Match if: 5.83 <= hours_remaining < 6.0

        Args:
            task: Task model instance
            threshold_hours: Threshold in hours (6.0, 3.0, 1.0, 0.5, 0.25)
            window: Window size in hours (default: REMINDER_THRESHOLD_WINDOW)

        Returns:
            bool: True if notification should be created
        """
        if window is None:
            window = REMINDER_THRESHOLD_WINDOW

        now = datetime.now(timezone.utc)
        hours_remaining = (task.due_date - now).total_seconds() / 3600

        min_hours = threshold_hours - window
        max_hours = threshold_hours

        return min_hours <= hours_remaining < max_hours

    @staticmethod
    def get_threshold_message(task: Task, threshold_hours: float) -> str:
        """
        Generates notification message for given threshold.

        Message format includes escalating urgency indicators:
        - 6h: ⏰ (clock)
        - 3h: ⚠️ (warning)
        - 1h: 🚨 (urgent)
        - 30m: 🔴 (critical)
        - 15m: 🚨🚨 (final warning)

        Args:
            task: Task model instance
            threshold_hours: Threshold in hours

        Returns:
            str: Formatted notification message
        """
        # Map thresholds to emoji and text
        threshold_map = {
            6.0: ("⏰", "6 hours"),
            3.0: ("⚠️", "3 hours"),
            1.0: ("🚨 URGENT", "1 hour"),
            0.5: ("🔴 CRITICAL", "30 minutes"),
            0.25: ("🚨🚨 FINAL WARNING", "15 minutes")
        }

        emoji, time_text = threshold_map.get(threshold_hours, ("⏰", f"{threshold_hours} hours"))
        return f"{emoji} Task '{task.title}' due in {time_text}"

    @staticmethod
    def notification_exists(db: Session, task_id: UUID, message: str) -> bool:
        """
        Checks if notification already created (duplicate prevention).

        Args:
            db: Database session
            task_id: Task UUID
            message: Exact notification message text

        Returns:
            bool: True if notification exists
        """
        existing = db.query(Notification).filter(
            Notification.task_id == task_id,
            Notification.message == message
        ).first()

        return existing is not None
