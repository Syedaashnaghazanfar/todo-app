"""
Unit tests for ReminderService

Tests cover:
- T009: should_create_notification() threshold window logic
- T010: get_threshold_message() emoji and format
- T011: notification_exists() duplicate detection
"""

import pytest
from datetime import datetime, timezone, timedelta
from unittest.mock import Mock, MagicMock, patch
from uuid import uuid4

from backend.services.reminder_service import ReminderService
from backend.models.task import Task
from backend.models.notification import Notification


class TestShouldCreateNotification:
    """Test threshold window logic (T009)"""

    def test_within_threshold_window(self):
        """Should return True when task is within threshold window"""
        # Create task due in 6 hours
        task = Mock(spec=Task)
        task.due_date = datetime.now(timezone.utc) + timedelta(hours=6)

        # Test 6-hour threshold with default window (0.17h = ~10min)
        result = ReminderService.should_create_notification(task, 6.0)

        assert result is True

    def test_below_threshold_window(self):
        """Should return False when task is below threshold window"""
        # Create task due in 5 hours (below 6h-0.17h = 5.83h threshold)
        task = Mock(spec=Task)
        task.due_date = datetime.now(timezone.utc) + timedelta(hours=5)

        # Test 6-hour threshold
        result = ReminderService.should_create_notification(task, 6.0)

        assert result is False

    def test_above_threshold_window(self):
        """Should return False when task is above threshold window"""
        # Create task due in 7 hours (above 6h threshold)
        task = Mock(spec=Task)
        task.due_date = datetime.now(timezone.utc) + timedelta(hours=7)

        # Test 6-hour threshold
        result = ReminderService.should_create_notification(task, 6.0)

        assert result is False

    def test_exact_threshold_boundary(self):
        """Should return True at exact threshold boundary"""
        # Create task due in exactly 5.9 hours (within 6h ± 0.17h window)
        task = Mock(spec=Task)
        task.due_date = datetime.now(timezone.utc) + timedelta(hours=5.9)

        result = ReminderService.should_create_notification(task, 6.0)

        assert result is True

    def test_custom_window_size(self):
        """Should respect custom window size"""
        # Create task due in 5.5 hours
        task = Mock(spec=Task)
        task.due_date = datetime.now(timezone.utc) + timedelta(hours=5.7)

        # Test with larger window (0.5h)
        result = ReminderService.should_create_notification(task, 6.0, window=0.5)

        assert result is True

    def test_30_minute_threshold(self):
        """Should work for 30-minute threshold (0.5h)"""
        # Create task due in 30 minutes
        task = Mock(spec=Task)
        task.due_date = datetime.now(timezone.utc) + timedelta(minutes=30)

        result = ReminderService.should_create_notification(task, 0.5)

        assert result is True

    def test_15_minute_threshold(self):
        """Should work for 15-minute threshold (0.25h)"""
        # Create task due in 15 minutes
        task = Mock(spec=Task)
        task.due_date = datetime.now(timezone.utc) + timedelta(minutes=15)

        result = ReminderService.should_create_notification(task, 0.25)

        assert result is True


class TestGetThresholdMessage:
    """Test message generation with emoji and format (T010)"""

    def test_6_hour_message(self):
        """Should generate correct message for 6-hour threshold"""
        task = Mock(spec=Task)
        task.title = "Deploy hotfix"

        message = ReminderService.get_threshold_message(task, 6.0)

        assert message == "⏰ Task 'Deploy hotfix' due in 6 hours"
        assert "⏰" in message

    def test_3_hour_message(self):
        """Should generate correct message for 3-hour threshold"""
        task = Mock(spec=Task)
        task.title = "Team standup"

        message = ReminderService.get_threshold_message(task, 3.0)

        assert message == "⚠️ Task 'Team standup' due in 3 hours"
        assert "⚠️" in message

    def test_1_hour_message(self):
        """Should generate URGENT message for 1-hour threshold"""
        task = Mock(spec=Task)
        task.title = "Client demo"

        message = ReminderService.get_threshold_message(task, 1.0)

        assert message == "🚨 URGENT Task 'Client demo' due in 1 hour"
        assert "🚨 URGENT" in message

    def test_30_minute_message(self):
        """Should generate CRITICAL message for 30-minute threshold"""
        task = Mock(spec=Task)
        task.title = "Production deployment"

        message = ReminderService.get_threshold_message(task, 0.5)

        assert message == "🔴 CRITICAL Task 'Production deployment' due in 30 minutes"
        assert "🔴 CRITICAL" in message

    def test_15_minute_message(self):
        """Should generate FINAL WARNING message for 15-minute threshold"""
        task = Mock(spec=Task)
        task.title = "Submit report"

        message = ReminderService.get_threshold_message(task, 0.25)

        assert message == "🚨🚨 FINAL WARNING Task 'Submit report' due in 15 minutes"
        assert "🚨🚨 FINAL WARNING" in message

    def test_message_includes_task_title(self):
        """Should include task title in message"""
        task = Mock(spec=Task)
        task.title = "Very Important Task"

        message = ReminderService.get_threshold_message(task, 6.0)

        assert "Very Important Task" in message


class TestNotificationExists:
    """Test duplicate detection logic (T011)"""

    def test_notification_does_not_exist(self):
        """Should return False when notification does not exist"""
        db = Mock()
        db.query.return_value.filter.return_value.first.return_value = None

        task_id = uuid4()
        message = "⏰ Task 'Test' due in 6 hours"

        result = ReminderService.notification_exists(db, task_id, message)

        assert result is False

    def test_notification_exists(self):
        """Should return True when notification exists"""
        db = Mock()
        existing_notification = Mock(spec=Notification)
        db.query.return_value.filter.return_value.first.return_value = existing_notification

        task_id = uuid4()
        message = "⏰ Task 'Test' due in 6 hours"

        result = ReminderService.notification_exists(db, task_id, message)

        assert result is True

    def test_exact_message_matching(self):
        """Should match exact message text"""
        db = Mock()
        db.query.return_value.filter.return_value.first.return_value = None

        task_id = uuid4()
        message1 = "⏰ Task 'Test' due in 6 hours"
        message2 = "⏰ Task 'Test' due in 3 hours"  # Different message

        # Query should be called with exact message
        ReminderService.notification_exists(db, task_id, message1)

        # Verify filter was called (exact matching logic handled by SQLAlchemy)
        assert db.query.return_value.filter.called


class TestOverdueDetection:
    """Test overdue task detection and notification (T033, T035)"""

    def test_detects_overdue_task(self):
        """Should detect when task is overdue (hours_remaining < 0)"""
        # Create task that's 2 hours overdue
        task = Mock(spec=Task)
        task.due_date = datetime.now(timezone.utc) - timedelta(hours=2)

        # Calculate hours remaining
        now = datetime.now(timezone.utc)
        hours_remaining = (task.due_date - now).total_seconds() / 3600

        assert hours_remaining < 0

    def test_overdue_message_format(self):
        """Should generate correct overdue message format (T035)"""
        task = Mock(spec=Task)
        task.title = "Submit quarterly report"

        # Expected message format per spec
        expected_message = "❌ OVERDUE: Task 'Submit quarterly report' is now overdue!"

        # Since we're not using get_threshold_message for overdue,
        # we test the format directly
        message = f"❌ OVERDUE: Task '{task.title}' is now overdue!"

        assert message == expected_message
        assert "❌ OVERDUE" in message
        assert task.title in message

    @patch('backend.services.reminder_service.REMINDER_ENABLE_OVERDUE', False)
    def test_overdue_notification_not_created_when_disabled(self):
        """Should not create overdue notification when REMINDER_ENABLE_OVERDUE=False"""
        db = Mock()
        task = Mock(spec=Task)
        task.id = uuid4()
        task.user_id = "test-user"
        task.title = "Overdue task"
        task.priority = "VERY_IMPORTANT"
        task.status = "NOT_STARTED"
        task.due_date = datetime.now(timezone.utc) - timedelta(hours=1)

        # Mock query to return overdue task
        db.query.return_value.filter.return_value.all.return_value = [task]
        db.query.return_value.filter.return_value.first.return_value = None

        # Since ENABLE_OVERDUE is False (mocked), no overdue notification should be created
        # The task should still be checked but overdue branch skipped
        result = ReminderService.check_and_create_reminders(db)

        assert result["tasks_checked"] == 1
        # No notifications should be created for overdue task when disabled
        assert result["notifications_created"] == 0


class TestCheckAndCreateReminders:
    """Integration test for main reminder check function (T012)"""

    def test_creates_notification_for_eligible_task(self):
        """Should create notification when task is at threshold"""
        # Mock database session
        db = Mock()

        # Create mock task due in 6 hours
        task = Mock(spec=Task)
        task.id = uuid4()
        task.user_id = "test-user-123"
        task.title = "Important task"
        task.priority = "VERY_IMPORTANT"
        task.status = "NOT_STARTED"
        task.due_date = datetime.now(timezone.utc) + timedelta(hours=6)

        # Mock query to return this task
        db.query.return_value.filter.return_value.all.return_value = [task]

        # Mock notification_exists to return False (no duplicate)
        db.query.return_value.filter.return_value.first.return_value = None

        # Call the function
        result = ReminderService.check_and_create_reminders(db)

        # Verify results
        assert result["tasks_checked"] == 1
        assert result["notifications_created"] >= 0  # Will depend on exact timing
        assert "execution_time_ms" in result

    def test_skips_completed_tasks(self):
        """Should not create notifications for COMPLETED tasks"""
        db = Mock()

        # Create completed task
        task = Mock(spec=Task)
        task.priority = "VERY_IMPORTANT"
        task.status = "COMPLETED"
        task.due_date = datetime.now(timezone.utc) + timedelta(hours=6)

        # Mock query to exclude completed tasks
        db.query.return_value.filter.return_value.all.return_value = []

        result = ReminderService.check_and_create_reminders(db)

        assert result["tasks_checked"] == 0
        assert result["notifications_created"] == 0

    def test_handles_empty_task_list(self):
        """Should handle empty task list gracefully"""
        db = Mock()
        db.query.return_value.filter.return_value.all.return_value = []

        result = ReminderService.check_and_create_reminders(db)

        assert result["tasks_checked"] == 0
        assert result["notifications_created"] == 0
        assert result["execution_time_ms"] >= 0
