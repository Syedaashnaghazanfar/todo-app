"""
MCP Server for task management operations (Phase III).

This module implements an MCP server using FastMCP from official MCP SDK.
The server exposes task operations as MCP tools callable by AI agents.

Architecture:
- MCP Server runs as separate process (stdio transport)
- Agent connects via MCPServerStdio transport
- Tools use @mcp.tool() decorator (NOT @function_tool)
- Tools are stateless - all state in database
- FastMCP is part of official MCP Python SDK (mcp.server.fastmcp)
"""

from typing import Literal, Optional
from mcp.server.fastmcp import FastMCP
from uuid import UUID

# Import from Phase 2 structure (backend.*)
from backend.database.connection import get_db
from backend.services.task_service import TaskService

# Create FastMCP instance (part of official MCP Python SDK)
mcp = FastMCP("task-management-server")


@mcp.tool()
def add_task(
    user_id: str,
    title: str,
    description: Optional[str] = None,
    priority: Optional[str] = None,
) -> dict:
    """
    Create a new task for a user.

    MCP Tool Contract:
    - Purpose: Add task to user's todo list
    - Stateless: All state persisted to database
    - User Isolation: Enforced via user_id parameter

    Args:
        user_id: User's unique identifier (string UUID from Better Auth)
        title: Task title (required, max 200 characters)
        description: Task description (optional, max 1000 characters)
        priority: Task priority level ("low", "medium", "high", "very_important")

    Returns:
        dict: Task creation result
            - task_id (str): Created task UUID
            - status (str): "created"
            - title (str): Task title
            - priority (str): Assigned priority level

    Example:
        >>> add_task(user_id="user-123", title="Buy groceries", priority="high")
        {"task_id": "550e8400-e29b-41d4-a716-446655440000", "status": "created", "title": "Buy groceries", "priority": "HIGH"}
    """
    db = next(get_db())
    try:
        # Validate and normalize priority
        priority_map = {
            "low": "LOW",
            "medium": "MEDIUM",
            "high": "HIGH",
            "very_important": "VERY_IMPORTANT",
            "very important": "VERY_IMPORTANT",
        }

        if priority:
            normalized_priority = priority_map.get(priority.lower())
            if not normalized_priority:
                normalized_priority = "MEDIUM"
        else:
            # TaskService will auto-classify based on title/due_date
            normalized_priority = None

        # Create task using TaskService
        # Note: TaskService will auto-classify priority if not provided
        task = TaskService.create_task(
            db=db,
            user_id=user_id,
            title=title,
            description=description,
            due_date=None,  # Chat doesn't support due_date yet
            tags=[]  # Chat doesn't support tags yet
        )

        # If priority was explicitly provided, override auto-classification
        if normalized_priority:
            task.priority = normalized_priority
            db.commit()
            db.refresh(task)

        # Return MCP tool response (plain dict, not TextContent)
        return {
            "task_id": str(task.id),
            "status": "created",
            "title": task.title,
            "priority": task.priority,
        }
    finally:
        db.close()


@mcp.tool()
def list_tasks(
    user_id: str,
    status: Literal["all", "pending", "completed"] = "all",
) -> dict:
    """
    Retrieve tasks from user's todo list.

    MCP Tool Contract:
    - Purpose: List tasks with optional status filtering
    - Stateless: Queries database on each invocation
    - User Isolation: Enforced via user_id parameter

    Args:
        user_id: User's unique identifier
        status: Filter by completion status (default: "all")
            - "all": All tasks
            - "pending": Incomplete tasks only
            - "completed": Completed tasks only

    Returns:
        dict: Task list result
            - tasks (list): Array of task objects
            - count (int): Total number of tasks returned

    Example:
        >>> list_tasks(user_id="user-123", status="pending")
        {"tasks": [...], "count": 2}
    """
    db = next(get_db())
    try:
        # Get all tasks for user
        all_tasks = TaskService.get_all_tasks(db=db, user_id=user_id)

        # Filter by status
        if status == "pending":
            filtered_tasks = [t for t in all_tasks if not t.is_completed]
        elif status == "completed":
            filtered_tasks = [t for t in all_tasks if t.is_completed]
        else:  # "all"
            filtered_tasks = all_tasks

        # Convert tasks to dict format
        task_list = [
            {
                "id": str(task.id),
                "title": task.title,
                "description": task.description,
                "is_completed": task.is_completed,
                "priority": task.priority,
                "created_at": task.created_at.isoformat() if task.created_at else None,
            }
            for task in filtered_tasks
        ]

        # Return MCP tool response
        return {
            "tasks": task_list,
            "count": len(task_list),
        }
    finally:
        db.close()


@mcp.tool()
def complete_task(
    user_id: str,
    task_id: str,
) -> dict:
    """
    Mark a task as complete.

    MCP Tool Contract:
    - Purpose: Toggle task completion status to completed
    - Stateless: Updates database and returns result
    - User Isolation: Enforced via user_id parameter

    Args:
        user_id: User's unique identifier
        task_id: Task UUID to mark as complete

    Returns:
        dict: Task completion result
            - task_id (str): Updated task UUID
            - status (str): "completed"
            - title (str): Task title

    Example:
        >>> complete_task(user_id="user-123", task_id="550e8400-e29b-41d4-a716-446655440000")
        {"task_id": "550e8400-e29b-41d4-a716-446655440000", "status": "completed", "title": "Call dentist"}
    """
    db = next(get_db())
    try:
        # Parse UUID
        task_uuid = UUID(task_id)

        # Mark task as complete
        updated_task = TaskService.mark_complete(
            db=db,
            task_id=task_uuid,
            user_id=user_id
        )

        return {
            "task_id": str(updated_task.id),
            "status": "completed",
            "title": updated_task.title,
        }
    except ValueError as e:
        return {
            "error": True,
            "message": f"Invalid task ID format: {task_id}",
            "code": "VALIDATION_ERROR"
        }
    except Exception as e:
        return {
            "error": True,
            "message": str(e),
            "code": "TASK_NOT_FOUND"
        }
    finally:
        db.close()


@mcp.tool()
def delete_task(
    user_id: str,
    task_id: str,
) -> dict:
    """
    Remove a task from the list.

    MCP Tool Contract:
    - Purpose: Permanently delete a task
    - Stateless: Removes from database
    - User Isolation: Enforced via user_id parameter

    Args:
        user_id: User's unique identifier
        task_id: Task UUID to delete

    Returns:
        dict: Task deletion result
            - task_id (str): Deleted task UUID
            - status (str): "deleted"
            - title (str): Task title

    Example:
        >>> delete_task(user_id="user-123", task_id="550e8400-e29b-41d4-a716-446655440000")
        {"task_id": "550e8400-e29b-41d4-a716-446655440000", "status": "deleted", "title": "Old task"}
    """
    db = next(get_db())
    try:
        # Parse UUID
        task_uuid = UUID(task_id)

        # Get task before deleting (to return title)
        task = TaskService.get_task(
            db=db,
            task_id=task_uuid,
            user_id=user_id
        )

        task_title = task.title

        # Delete task
        TaskService.delete_task(
            db=db,
            task_id=task_uuid,
            user_id=user_id
        )

        return {
            "task_id": str(task_uuid),
            "status": "deleted",
            "title": task_title,
        }
    except ValueError as e:
        return {
            "error": True,
            "message": f"Invalid task ID format: {task_id}",
            "code": "VALIDATION_ERROR"
        }
    except Exception as e:
        return {
            "error": True,
            "message": str(e),
            "code": "TASK_NOT_FOUND"
        }
    finally:
        db.close()


@mcp.tool()
def bulk_update_tasks(
    user_id: str,
    action: Literal["complete", "delete"] = "complete",
    filter_status: Literal["all", "pending", "completed"] = "pending",
) -> dict:
    """
    Perform bulk operations on multiple tasks at once.

    MCP Tool Contract:
    - Purpose: Update multiple tasks efficiently in a single operation
    - Stateless: All state persisted to database
    - User Isolation: Enforced via user_id parameter
    - Efficiency: Uses batch operations for optimal performance

    Args:
        user_id: User's unique identifier (string UUID from Better Auth)
        action: Bulk operation to perform (default: "complete")
            - "complete": Mark all matching tasks as completed
            - "delete": Delete all matching tasks
        filter_status: Filter which tasks to update (default: "pending")
            - "pending": Only incomplete tasks
            - "completed": Only complete tasks
            - "all": All tasks

    Returns:
        dict: Bulk operation result
            - count (int): Number of tasks updated
            - action (str): Action performed
            - message (str): Human-readable result

    Example:
        >>> bulk_update_tasks(user_id="user-123", action="complete", filter_status="pending")
        {"count": 5, "action": "completed", "message": "Marked 5 task(s) as completed"}
    """
    db = next(get_db())
    try:
        # Get all tasks for user
        all_tasks = TaskService.get_all_tasks(db=db, user_id=user_id)

        # Filter by status
        if filter_status == "pending":
            filtered_tasks = [t for t in all_tasks if not t.is_completed]
        elif filter_status == "completed":
            filtered_tasks = [t for t in all_tasks if t.is_completed]
        else:  # "all"
            filtered_tasks = all_tasks

        count = len(filtered_tasks)

        if count == 0:
            return {
                "count": 0,
                "action": action,
                "message": f"No {filter_status} tasks found to {action}",
            }

        # Perform bulk action
        if action == "complete":
            for task in filtered_tasks:
                if not task.is_completed:
                    TaskService.mark_complete(db=db, task_id=task.id, user_id=user_id)

            return {
                "count": count,
                "action": "completed",
                "message": f"Marked {count} task(s) as completed",
            }

        elif action == "delete":
            for task in filtered_tasks:
                TaskService.delete_task(db=db, task_id=task.id, user_id=user_id)

            return {
                "count": count,
                "action": "deleted",
                "message": f"Deleted {count} task(s)",
            }

        else:
            return {
                "error": True,
                "message": f"Unsupported bulk action: {action}",
                "code": "INVALID_ACTION"
            }

    finally:
        db.close()


@mcp.tool()
def set_priority(
    user_id: str,
    task_id: str,
    priority: str,
) -> dict:
    """
    Set or update a task's priority level.

    MCP Tool Contract:
    - Purpose: Update task priority level
    - Stateless: Updates database and returns result
    - User Isolation: Enforced via user_id parameter

    Args:
        user_id: User's unique identifier (string UUID from Better Auth)
        task_id: Task UUID to update
        priority: New priority level ("low", "medium", "high", "very_important")

    Returns:
        dict: Priority update result
            - task_id (str): Updated task UUID
            - status (str): "updated"
            - priority (str): New priority level
            - title (str): Task title

    Example:
        >>> set_priority(user_id="user-123", task_id="550e...", priority="high")
        {"task_id": "550e...", "status": "updated", "priority": "HIGH", "title": "Call dentist"}
    """
    db = next(get_db())
    try:
        # Parse UUID
        task_uuid = UUID(task_id)

        # Validate and normalize priority
        priority_map = {
            "low": "LOW",
            "medium": "MEDIUM",
            "high": "HIGH",
            "very_important": "VERY_IMPORTANT",
            "very important": "VERY_IMPORTANT",
        }

        normalized_priority = priority_map.get(priority.lower())
        if not normalized_priority:
            normalized_priority = "MEDIUM"

        # Get task
        task = TaskService.get_task(db=db, task_id=task_uuid, user_id=user_id)

        # Update priority
        task.priority = normalized_priority
        db.commit()
        db.refresh(task)

        return {
            "task_id": str(task.id),
            "status": "updated",
            "priority": task.priority,
            "title": task.title,
        }

    except ValueError as e:
        return {
            "error": True,
            "message": f"Invalid task ID format: {task_id}",
            "code": "VALIDATION_ERROR"
        }
    except Exception as e:
        return {
            "error": True,
            "message": str(e),
            "code": "TASK_NOT_FOUND"
        }
    finally:
        db.close()


@mcp.tool()
def list_tasks_by_priority(
    user_id: str,
    priority: str,
    status: Literal["all", "pending", "completed"] = "all",
) -> dict:
    """
    Retrieve tasks filtered by priority level.

    MCP Tool Contract:
    - Purpose: List tasks filtered by priority and optional completion status
    - Stateless: Queries database on each invocation
    - User Isolation: Enforced via user_id parameter

    Args:
        user_id: User's unique identifier (string UUID from Better Auth)
        priority: Priority level to filter ("low", "medium", "high", "very_important")
        status: Additional filter by completion status (default: "all")
            - "all": All tasks at this priority
            - "pending": Incomplete tasks only
            - "completed": Completed tasks only

    Returns:
        dict: Filtered task list result
            - tasks (list): Array of task objects matching priority
            - count (int): Total number of tasks returned
            - priority (str): Filter priority level
            - status (str): Filter status

    Example:
        >>> list_tasks_by_priority(user_id="user-123", priority="high", status="pending")
        {"tasks": [...], "count": 2, "priority": "high", "status": "pending"}
    """
    db = next(get_db())
    try:
        # Validate and normalize priority
        priority_map = {
            "low": "LOW",
            "medium": "MEDIUM",
            "high": "HIGH",
            "very_important": "VERY_IMPORTANT",
            "very important": "VERY_IMPORTANT",
        }

        normalized_priority = priority_map.get(priority.lower())
        if not normalized_priority:
            return {
                "error": True,
                "message": "Priority must be one of: 'low', 'medium', 'high', 'very_important'",
                "code": "INVALID_PRIORITY"
            }

        # Get all tasks for user
        all_tasks = TaskService.get_all_tasks(db=db, user_id=user_id)

        # Filter by priority
        priority_filtered = [t for t in all_tasks if t.priority == normalized_priority]

        # Filter by status
        if status == "pending":
            filtered_tasks = [t for t in priority_filtered if not t.is_completed]
        elif status == "completed":
            filtered_tasks = [t for t in priority_filtered if t.is_completed]
        else:  # "all"
            filtered_tasks = priority_filtered

        # Convert tasks to dict format
        task_list = [
            {
                "id": str(task.id),
                "title": task.title,
                "description": task.description,
                "is_completed": task.is_completed,
                "priority": task.priority,
                "created_at": task.created_at.isoformat() if task.created_at else None,
            }
            for task in filtered_tasks
        ]

        return {
            "tasks": task_list,
            "count": len(task_list),
            "priority": priority.lower(),
            "status": status,
        }

    finally:
        db.close()


@mcp.tool()
def update_task(
    user_id: str,
    task_id: str,
    title: Optional[str] = None,
    description: Optional[str] = None,
    priority: Optional[str] = None,
) -> dict:
    """
    Modify task title, description, or priority.

    MCP Tool Contract:
    - Purpose: Update task details
    - Stateless: Updates database and returns result
    - User Isolation: Enforced via user_id parameter

    Args:
        user_id: User's unique identifier
        task_id: Task UUID to update
        title: New task title (optional)
        description: New task description (optional)
        priority: New task priority (optional: "low", "medium", "high", "very_important")

    Returns:
        dict: Task update result
            - task_id (str): Updated task UUID
            - status (str): "updated"
            - title (str): Task title

    Example:
        >>> update_task(user_id="user-123", task_id="550e...", title="Buy groceries and fruits")
        {"task_id": "550e...", "status": "updated", "title": "Buy groceries and fruits"}
    """
    db = next(get_db())
    try:
        # Parse UUID
        task_uuid = UUID(task_id)

        # Validate and normalize priority if provided
        priority_map = {
            "low": "LOW",
            "medium": "MEDIUM",
            "high": "HIGH",
            "very_important": "VERY_IMPORTANT",
            "very important": "VERY_IMPORTANT",
        }

        normalized_priority = None
        if priority:
            normalized_priority = priority_map.get(priority.lower(), "MEDIUM")

        # Update task
        updated_task = TaskService.update_task(
            db=db,
            task_id=task_uuid,
            user_id=user_id,
            title=title,
            description=description,
            due_date=None,  # Chat doesn't support due_date yet
            tags=None,  # Chat doesn't support tags yet
            status=None  # Don't modify status through update
        )

        # Update priority if provided
        if normalized_priority:
            updated_task.priority = normalized_priority
            db.commit()
            db.refresh(updated_task)

        return {
            "task_id": str(updated_task.id),
            "status": "updated",
            "title": updated_task.title,
        }
    except ValueError as e:
        return {
            "error": True,
            "message": f"Invalid task ID format: {task_id}",
            "code": "VALIDATION_ERROR"
        }
    except Exception as e:
        return {
            "error": True,
            "message": str(e),
            "code": "TASK_NOT_FOUND"
        }
    finally:
        db.close()
