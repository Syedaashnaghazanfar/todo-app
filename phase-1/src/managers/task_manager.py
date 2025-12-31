"""
Task Manager for the Todo In-Memory Python Console Application.

This module defines the TaskManager class which handles in-memory storage
and operations for tasks (add, get, update, delete).
"""

from typing import List, Optional
from src.models.task import Task


class TaskManager:
    """
    Manages the in-memory storage and operations for tasks.

    This class handles all CRUD operations for tasks in memory.
    It maintains the list of tasks and provides methods to manipulate them.
    """

    def __init__(self):
        """Initialize the TaskManager with an empty list of tasks."""
        self._tasks: List[Task] = []
        self._next_id: int = 1

    def add_task(self, title: str, description: str = "") -> Task:
        """
        Add a new task to the in-memory store.

        Args:
            title: Title of the task (required)
            description: Description of the task (optional)

        Returns:
            Task: The newly created task with assigned ID

        Raises:
            ValueError: If title is empty
        """
        task = Task(id=self._next_id, title=title, description=description, status="incomplete")
        self._tasks.append(task)
        self._next_id += 1
        return task

    def get_all_tasks(self) -> List[Task]:
        """
        Get all tasks from the in-memory store.

        Returns:
            List[Task]: List of all tasks
        """
        return self._tasks.copy()

    def get_task_by_id(self, task_id: int) -> Optional[Task]:
        """
        Get a task by its ID.

        Args:
            task_id: ID of the task to retrieve

        Returns:
            Task: The task with the given ID, or None if not found
        """
        for task in self._tasks:
            if task.id == task_id:
                return task
        return None

    def update_task(self, task_id: int, title: Optional[str] = None, description: Optional[str] = None) -> bool:
        """
        Update an existing task.

        Args:
            task_id: ID of the task to update
            title: New title (optional)
            description: New description (optional)

        Returns:
            bool: True if task was updated, False if task not found
        """
        task = self.get_task_by_id(task_id)
        if task is None:
            return False

        if title is not None:
            if not title.strip():
                raise ValueError("Title cannot be empty")
            task.title = title

        if description is not None:
            task.description = description

        return True

    def delete_task(self, task_id: int) -> bool:
        """
        Delete a task by its ID.

        Args:
            task_id: ID of the task to delete

        Returns:
            bool: True if task was deleted, False if task not found
        """
        task = self.get_task_by_id(task_id)
        if task is None:
            return False

        self._tasks.remove(task)
        return True

    def mark_task_status(self, task_id: int, status: str) -> bool:
        """
        Update the status of a task.

        Args:
            task_id: ID of the task to update
            status: New status ('complete' or 'incomplete')

        Returns:
            bool: True if task status was updated, False if task not found

        Raises:
            ValueError: If status is not 'complete' or 'incomplete'
        """
        if status not in ["complete", "incomplete"]:
            raise ValueError("Status must be either 'complete' or 'incomplete'")

        task = self.get_task_by_id(task_id)
        if task is None:
            return False

        task.status = status
        return True