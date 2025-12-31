"""
Tests for the List Tasks feature in the Todo In-Memory Python Console Application.
"""

import pytest
from src.managers.task_manager import TaskManager


def test_list_tasks_returns_all_tasks():
    """Test that the list command returns all tasks."""
    manager = TaskManager()

    manager.add_task("Task 1", "Description 1")
    manager.add_task("Task 2", "Description 2")
    manager.add_task("Task 3", "Description 3")

    tasks = manager.get_all_tasks()

    assert len(tasks) == 3
    assert tasks[0].title == "Task 1"
    assert tasks[1].title == "Task 2"
    assert tasks[2].title == "Task 3"


def test_list_tasks_with_empty_list():
    """Test that the list command handles empty list correctly."""
    manager = TaskManager()

    tasks = manager.get_all_tasks()

    assert len(tasks) == 0
    assert tasks == []


def test_list_tasks_preserves_order():
    """Test that the list command preserves the order of tasks."""
    manager = TaskManager()

    task3 = manager.add_task("Task 3")
    task1 = manager.add_task("Task 1")
    task2 = manager.add_task("Task 2")

    tasks = manager.get_all_tasks()

    # Tasks should be returned in the order they were added to the internal list
    assert tasks[0].id == 1  # task3
    assert tasks[1].id == 2  # task1
    assert tasks[2].id == 3  # task2