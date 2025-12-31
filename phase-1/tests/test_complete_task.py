"""
Tests for the Mark Complete/Incomplete feature in the Todo In-Memory Python Console Application.
"""


def test_mark_complete_success_case():
    """Test the success case for marking a task as complete."""
    from src.managers.task_manager import TaskManager

    manager = TaskManager()
    task = manager.add_task("Test Task")
    assert task.status == "incomplete"

    success = manager.mark_task_status(task.id, "complete")

    assert success is True
    updated_task = manager.get_task_by_id(task.id)
    assert updated_task.status == "complete"


def test_mark_incomplete_success_case():
    """Test the success case for marking a task as incomplete."""
    from src.managers.task_manager import TaskManager

    manager = TaskManager()
    task = manager.add_task("Test Task")
    # Mark as complete first
    manager.mark_task_status(task.id, "complete")
    assert task.status == "complete"

    success = manager.mark_task_status(task.id, "incomplete")

    assert success is True
    updated_task = manager.get_task_by_id(task.id)
    assert updated_task.status == "incomplete"


def test_mark_complete_validation():
    """Test that the mark complete command validates input properly."""
    from src.managers.task_manager import TaskManager
    import pytest

    manager = TaskManager()
    task = manager.add_task("Test Task")

    # Test that invalid status raises an error
    with pytest.raises(ValueError, match="Status must be either 'complete' or 'incomplete'"):
        manager.mark_task_status(task.id, "invalid")


def test_mark_complete_nonexistent_task():
    """Test that marking status of a non-existent task returns False."""
    from src.managers.task_manager import TaskManager

    manager = TaskManager()

    success = manager.mark_task_status(999, "complete")

    assert success is False