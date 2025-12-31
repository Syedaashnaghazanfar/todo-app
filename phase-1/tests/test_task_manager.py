"""
Tests for the TaskManager in the Todo In-Memory Python Console Application.
"""

import pytest
from src.models.task import Task
from src.managers.task_manager import TaskManager


def test_add_creates_task_with_unique_id():
    """Test that adding tasks creates them with unique sequential IDs."""
    manager = TaskManager()

    task1 = manager.add_task("Task 1")
    task2 = manager.add_task("Task 2")

    assert task1.id == 1
    assert task2.id == 2
    assert task1.title == "Task 1"
    assert task2.title == "Task 2"


def test_get_all_tasks_returns_all_tasks():
    """Test that get_all_tasks returns all added tasks."""
    manager = TaskManager()

    manager.add_task("Task 1")
    manager.add_task("Task 2")
    manager.add_task("Task 3")

    tasks = manager.get_all_tasks()

    assert len(tasks) == 3
    assert tasks[0].title == "Task 1"
    assert tasks[1].title == "Task 2"
    assert tasks[2].title == "Task 3"


def test_get_task_by_id_returns_correct_task():
    """Test that get_task_by_id returns the correct task."""
    manager = TaskManager()

    task = manager.add_task("Test Task")

    found_task = manager.get_task_by_id(task.id)

    assert found_task is not None
    assert found_task.id == task.id
    assert found_task.title == task.title


def test_get_task_by_id_returns_none_for_nonexistent_task():
    """Test that get_task_by_id returns None for non-existent task."""
    manager = TaskManager()

    result = manager.get_task_by_id(999)

    assert result is None


def test_update_task_successfully():
    """Test that update_task successfully updates task fields."""
    manager = TaskManager()

    task = manager.add_task("Original Title", "Original Description")

    success = manager.update_task(task.id, title="New Title", description="New Description")

    assert success is True
    updated_task = manager.get_task_by_id(task.id)
    assert updated_task.title == "New Title"
    assert updated_task.description == "New Description"


def test_update_task_returns_false_for_nonexistent_task():
    """Test that update_task returns False when task doesn't exist."""
    manager = TaskManager()

    success = manager.update_task(999, title="New Title")

    assert success is False


def test_update_task_with_empty_title_raises_error():
    """Test that updating a task with empty title raises ValueError."""
    manager = TaskManager()

    task = manager.add_task("Original Title")

    with pytest.raises(ValueError, match="Title cannot be empty"):
        manager.update_task(task.id, title="")


def test_delete_task_successfully():
    """Test that delete_task successfully removes a task."""
    manager = TaskManager()

    task = manager.add_task("Test Task")
    initial_tasks = manager.get_all_tasks()
    assert len(initial_tasks) == 1

    success = manager.delete_task(task.id)

    assert success is True
    remaining_tasks = manager.get_all_tasks()
    assert len(remaining_tasks) == 0


def test_delete_task_returns_false_for_nonexistent_task():
    """Test that delete_task returns False when task doesn't exist."""
    manager = TaskManager()

    success = manager.delete_task(999)

    assert success is False


def test_mark_task_status_successfully():
    """Test that mark_task_status successfully updates task status."""
    manager = TaskManager()

    task = manager.add_task("Test Task")
    assert task.status == "incomplete"

    success = manager.mark_task_status(task.id, "complete")

    assert success is True
    updated_task = manager.get_task_by_id(task.id)
    assert updated_task.status == "complete"


def test_mark_task_status_returns_false_for_nonexistent_task():
    """Test that mark_task_status returns False when task doesn't exist."""
    manager = TaskManager()

    success = manager.mark_task_status(999, "complete")

    assert success is False


def test_mark_task_status_with_invalid_status_raises_error():
    """Test that mark_task_status with invalid status raises ValueError."""
    manager = TaskManager()

    task = manager.add_task("Test Task")

    with pytest.raises(ValueError, match="Status must be either 'complete' or 'incomplete'"):
        manager.mark_task_status(task.id, "invalid")