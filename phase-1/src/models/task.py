"""
Task model for the Todo In-Memory Python Console Application.

This module defines the Task class which represents individual todo items
in the application. Each task has an ID, title, description, and status.
"""

from typing import Union
from dataclasses import dataclass


@dataclass
class Task:
    """
    Represents a single todo task in the application.

    Attributes:
        id: Unique identifier for the task
        title: Title of the task (required)
        description: Optional description of the task
        status: Status of the task, either 'complete' or 'incomplete'
    """

    id: int
    title: str
    description: str = ""
    status: str = "incomplete"

    def __post_init__(self):
        """Validate the task attributes after initialization."""
        if not self.title.strip():
            raise ValueError("Title cannot be empty")

        if self.status not in ["complete", "incomplete"]:
            raise ValueError("Status must be either 'complete' or 'incomplete'")

    def __repr__(self) -> str:
        """Return a string representation of the task."""
        return f"Task(id={self.id}, title='{self.title}', description='{self.description}', status='{self.status}')"

    def __eq__(self, other) -> bool:
        """Check equality between two Task objects."""
        if not isinstance(other, Task):
            return False
        return (self.id == other.id and
                self.title == other.title and
                self.description == other.description and
                self.status == other.status)