"""
Tests for the Task model in the Todo In-Memory Python Console Application.
"""

import pytest
from src.models.task import Task


def test_task_creation_with_valid_parameters():
    """Test creating a Task object with valid parameters."""
    task = Task(id=1, title="Test Task", description="Test Description", status="incomplete")

    assert task.id == 1
    assert task.title == "Test Task"
    assert task.description == "Test Description"
    assert task.status == "incomplete"


def test_task_creation_with_empty_title_raises_error():
    """Test that creating a Task object with an empty title raises a ValueError."""
    with pytest.raises(ValueError, match="Title cannot be empty"):
        Task(id=1, title="", description="Test Description", status="incomplete")

    with pytest.raises(ValueError, match="Title cannot be empty"):
        Task(id=1, title="   ", description="Test Description", status="incomplete")  # Only whitespace


def test_task_creation_with_invalid_status_raises_error():
    """Test that creating a Task object with an invalid status raises a ValueError."""
    with pytest.raises(ValueError, match="Status must be either 'complete' or 'incomplete'"):
        Task(id=1, title="Test Task", description="Test Description", status="invalid")

    with pytest.raises(ValueError, match="Status must be either 'complete' or 'incomplete'"):
        Task(id=1, title="Test Task", description="Test Description", status="done")


def test_task_repr_method_returns_proper_string():
    """Test that the Task object's __repr__ method returns the proper string."""
    task = Task(id=1, title="Test Task", description="Test Description", status="incomplete")

    expected_repr = "Task(id=1, title='Test Task', description='Test Description', status='incomplete')"
    assert repr(task) == expected_repr


def test_task_equality_comparison_works():
    """Test that Task object equality comparison works correctly."""
    task1 = Task(id=1, title="Test Task", description="Test Description", status="incomplete")
    task2 = Task(id=1, title="Test Task", description="Test Description", status="incomplete")
    task3 = Task(id=2, title="Test Task", description="Test Description", status="incomplete")

    # Same attributes should be equal
    assert task1 == task2

    # Different attributes should not be equal
    assert task1 != task3
    assert task1 != "not a task"