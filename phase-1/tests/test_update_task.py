"""
Tests for the Update Task feature in the Todo In-Memory Python Console Application.
"""


def test_update_task_success_case():
    """Test the success case for updating a task."""
    from src.managers.task_manager import TaskManager

    manager = TaskManager()
    original_task = manager.add_task("Original Title", "Original Description")

    success = manager.update_task(original_task.id, title="New Title", description="New Description")

    assert success is True
    updated_task = manager.get_task_by_id(original_task.id)
    assert updated_task.title == "New Title"
    assert updated_task.description == "New Description"


def test_update_task_validation():
    """Test that the update command validates input properly."""
    from src.managers.task_manager import TaskManager

    manager = TaskManager()
    task = manager.add_task("Original Title")

    # Test that updating with empty title raises an error
    import pytest
    with pytest.raises(ValueError, match="Title cannot be empty"):
        manager.update_task(task.id, title="")


def test_update_nonexistent_task():
    """Test that updating a non-existent task returns False."""
    from src.managers.task_manager import TaskManager

    manager = TaskManager()

    success = manager.update_task(999, title="New Title")

    assert success is False