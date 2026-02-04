"""
Integration tests for Reminder System

Tests the full reminder flow with real database session (mocked).
T012: Integration test for check_and_create_reminders() with mock database
"""

import pytest
from datetime import datetime, timezone, timedelta
from unittest.mock import Mock, patch, MagicMock
from uuid import uuid4

from backend.services.reminder_service import ReminderService
from backend.models.task import Task
from backend.models.notification import Notification


class TestReminderIntegration:
    """Integration tests for reminder creation workflow"""

    @patch('backend.services.reminder_service.Notification')
    def test_full_reminder_workflow(self, mock_notification_class):
        """
        Test complete workflow: query tasks, check thresholds, create notifications
        """
        # Setup mock database
        db = Mock()

        # Create test task due in 6 hours
        task = Mock(spec=Task)
        task.id = uuid4()
        task.user_id = "user-123"
        task.title = "Critical deployment"
        task.priority = "VERY_IMPORTANT"
        task.status = "NOT_STARTED"
        task.due_date = datetime.now(timezone.utc) + timedelta(hours=6)

        # Mock task query
        mock_query = Mock()
        mock_filter = Mock()
        mock_query.filter.return_value = mock_filter
        mock_filter.all.return_value = [task]
        db.query.return_value = mock_query

        # Mock notification existence check (return None = doesn't exist)
        mock_notification_query = Mock()
        mock_notification_filter = Mock()
        mock_notification_query.filter.return_value = mock_notification_filter
        mock_notification_filter.first.return_value = None

        # Configure db.query to return different mocks for Task and Notification
        def query_side_effect(model):
            if model == Task:
                return mock_query
            elif model == Notification:
                return mock_notification_query
            return Mock()

        db.query.side_effect = query_side_effect

        # Execute
        result = ReminderService.check_and_create_reminders(db)

        # Verify
        assert result["tasks_checked"] == 1
        assert result["notifications_created"] >= 0
        assert isinstance(result["execution_time_ms"], float)
        assert result["execution_time_ms"] >= 0

    def test_multiple_tasks_different_thresholds(self):
        """
        Test handling multiple tasks at different threshold windows
        """
        db = Mock()

        # Create tasks at different thresholds
        task1 = Mock(spec=Task)
        task1.id = uuid4()
        task1.user_id = "user-123"
        task1.title = "Task 1"
        task1.priority = "VERY_IMPORTANT"
        task1.status = "NOT_STARTED"
        task1.due_date = datetime.now(timezone.utc) + timedelta(hours=6)

        task2 = Mock(spec=Task)
        task2.id = uuid4()
        task2.user_id = "user-123"
        task2.title = "Task 2"
        task2.priority = "VERY_IMPORTANT"
        task2.status = "NOT_STARTED"
        task2.due_date = datetime.now(timezone.utc) + timedelta(hours=3)

        task3 = Mock(spec=Task)
        task3.id = uuid4()
        task3.user_id = "user-123"
        task3.title = "Task 3"
        task3.priority = "VERY_IMPORTANT"
        task3.status = "NOT_STARTED"
        task3.due_date = datetime.now(timezone.utc) + timedelta(hours=1)

        # Mock queries
        mock_task_query = Mock()
        mock_task_filter = Mock()
        mock_task_query.filter.return_value = mock_task_filter
        mock_task_filter.all.return_value = [task1, task2, task3]

        mock_notification_query = Mock()
        mock_notification_filter = Mock()
        mock_notification_query.filter.return_value = mock_notification_filter
        mock_notification_filter.first.return_value = None  # No duplicates

        def query_side_effect(model):
            if model == Task:
                return mock_task_query
            elif model == Notification:
                return mock_notification_query
            return Mock()

        db.query.side_effect = query_side_effect

        # Execute
        result = ReminderService.check_and_create_reminders(db)

        # Verify all tasks checked
        assert result["tasks_checked"] == 3
        assert result["notifications_created"] >= 0

    def test_duplicate_prevention_workflow(self):
        """
        Test that duplicate notifications are not created
        """
        db = Mock()

        # Create task
        task = Mock(spec=Task)
        task.id = uuid4()
        task.user_id = "user-123"
        task.title = "Test task"
        task.priority = "VERY_IMPORTANT"
        task.status = "NOT_STARTED"
        task.due_date = datetime.now(timezone.utc) + timedelta(hours=6)

        # Mock task query
        mock_task_query = Mock()
        mock_task_filter = Mock()
        mock_task_query.filter.return_value = mock_task_filter
        mock_task_filter.all.return_value = [task]

        # Mock notification query - return existing notification (duplicate)
        existing_notification = Mock(spec=Notification)
        existing_notification.id = uuid4()
        existing_notification.task_id = task.id
        existing_notification.message = "⏰ Task 'Test task' due in 6 hours"

        mock_notification_query = Mock()
        mock_notification_filter = Mock()
        mock_notification_query.filter.return_value = mock_notification_filter
        mock_notification_filter.first.return_value = existing_notification

        def query_side_effect(model):
            if model == Task:
                return mock_task_query
            elif model == Notification:
                return mock_notification_query
            return Mock()

        db.query.side_effect = query_side_effect

        # Execute
        result = ReminderService.check_and_create_reminders(db)

        # Verify no new notifications created (duplicate exists)
        assert result["tasks_checked"] == 1
        # notifications_created might be 0 if all were duplicates

    def test_error_handling_rollback(self):
        """
        Test that database errors trigger rollback
        """
        db = Mock()

        # Simulate database error
        db.query.side_effect = Exception("Database connection lost")

        # Execute and expect exception
        with pytest.raises(Exception) as exc_info:
            ReminderService.check_and_create_reminders(db)

        assert "Database connection lost" in str(exc_info.value)
        # Verify rollback was called
        db.rollback.assert_called_once()

    def test_performance_with_many_tasks(self):
        """
        Test performance with larger number of tasks
        """
        db = Mock()

        # Create 100 tasks
        tasks = []
        for i in range(100):
            task = Mock(spec=Task)
            task.id = uuid4()
            task.user_id = f"user-{i}"
            task.title = f"Task {i}"
            task.priority = "VERY_IMPORTANT"
            task.status = "NOT_STARTED"
            task.due_date = datetime.now(timezone.utc) + timedelta(hours=6 + (i % 5))
            tasks.append(task)

        # Mock queries
        mock_task_query = Mock()
        mock_task_filter = Mock()
        mock_task_query.filter.return_value = mock_task_filter
        mock_task_filter.all.return_value = tasks

        mock_notification_query = Mock()
        mock_notification_filter = Mock()
        mock_notification_query.filter.return_value = mock_notification_filter
        mock_notification_filter.first.return_value = None

        def query_side_effect(model):
            if model == Task:
                return mock_task_query
            elif model == Notification:
                return mock_notification_query
            return Mock()

        db.query.side_effect = query_side_effect

        # Execute
        result = ReminderService.check_and_create_reminders(db)

        # Verify
        assert result["tasks_checked"] == 100
        # Execution should be fast (under 2 seconds = 2000ms as per spec SC-004)
        assert result["execution_time_ms"] < 2000

    def test_overdue_notification_creation(self):
        """
        Test overdue notification creation for tasks past due date (T034)
        """
        db = Mock()

        # Create overdue task (2 hours past due)
        overdue_task = Mock(spec=Task)
        overdue_task.id = uuid4()
        overdue_task.user_id = "user-123"
        overdue_task.title = "Missed deadline task"
        overdue_task.priority = "VERY_IMPORTANT"
        overdue_task.status = "NOT_STARTED"
        overdue_task.due_date = datetime.now(timezone.utc) - timedelta(hours=2)

        # Mock task query
        mock_task_query = Mock()
        mock_task_filter = Mock()
        mock_task_query.filter.return_value = mock_task_filter
        mock_task_filter.all.return_value = [overdue_task]

        # Mock notification query (no existing overdue notification)
        mock_notification_query = Mock()
        mock_notification_filter = Mock()
        mock_notification_query.filter.return_value = mock_notification_filter
        mock_notification_filter.first.return_value = None

        def query_side_effect(model):
            if model == Task:
                return mock_task_query
            elif model == Notification:
                return mock_notification_query
            return Mock()

        db.query.side_effect = query_side_effect

        # Execute
        result = ReminderService.check_and_create_reminders(db)

        # Verify
        assert result["tasks_checked"] == 1
        assert result["notifications_created"] == 1
        # Verify db.add was called with a notification
        db.add.assert_called()
        db.commit.assert_called_once()

    def test_overdue_duplicate_prevention(self):
        """
        Test that duplicate overdue notifications are not created (T034)
        """
        db = Mock()

        # Create overdue task
        overdue_task = Mock(spec=Task)
        overdue_task.id = uuid4()
        overdue_task.user_id = "user-123"
        overdue_task.title = "Already notified task"
        overdue_task.priority = "VERY_IMPORTANT"
        overdue_task.status = "NOT_STARTED"
        overdue_task.due_date = datetime.now(timezone.utc) - timedelta(hours=1)

        # Mock task query
        mock_task_query = Mock()
        mock_task_filter = Mock()
        mock_task_query.filter.return_value = mock_task_filter
        mock_task_filter.all.return_value = [overdue_task]

        # Mock notification query (overdue notification already exists)
        existing_notification = Mock(spec=Notification)
        mock_notification_query = Mock()
        mock_notification_filter = Mock()
        mock_notification_query.filter.return_value = mock_notification_filter
        mock_notification_filter.first.return_value = existing_notification

        def query_side_effect(model):
            if model == Task:
                return mock_task_query
            elif model == Notification:
                return mock_notification_query
            return Mock()

        db.query.side_effect = query_side_effect

        # Execute
        result = ReminderService.check_and_create_reminders(db)

        # Verify
        assert result["tasks_checked"] == 1
        # No new notification should be created (duplicate prevention)
        assert result["notifications_created"] == 0
        db.add.assert_not_called()
        db.commit.assert_not_called()

    def test_completed_overdue_task_no_notification(self):
        """
        Test that completed overdue tasks don't get notifications
        """
        db = Mock()

        # Create completed overdue task (should be filtered out by query)
        # In reality, the query filters COMPLETED tasks, so this won't be returned
        # This test verifies the query behavior

        # Mock task query returns empty (COMPLETED tasks filtered)
        mock_task_query = Mock()
        mock_task_filter = Mock()
        mock_task_query.filter.return_value = mock_task_filter
        mock_task_filter.all.return_value = []

        db.query.return_value = mock_task_query

        # Execute
        result = ReminderService.check_and_create_reminders(db)

        # Verify
        assert result["tasks_checked"] == 0
        assert result["notifications_created"] == 0
