# MCP Tools Contract: Task Management

**Feature**: 009-ai-chatbot
**Date**: 2025-12-22

## Overview

This document defines the MCP tool contracts for the AI chatbot's task management operations. All tools are implemented using FastMCP from the Official MCP Python SDK per Constitution P3-I.

## Tool Contracts

### 1. add_task

**Purpose**: Create a new task for a user.

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "user_id": {
      "type": "string",
      "description": "User's unique identifier from JWT"
    },
    "title": {
      "type": "string",
      "maxLength": 255,
      "description": "Task title (required)"
    },
    "description": {
      "type": "string",
      "maxLength": 5000,
      "description": "Task description (optional)"
    },
    "priority": {
      "type": "string",
      "enum": ["LOW", "MEDIUM", "HIGH", "VERY_IMPORTANT"],
      "default": "MEDIUM",
      "description": "Task priority level"
    }
  },
  "required": ["user_id", "title"]
}
```

**Output Schema**:
```json
{
  "type": "object",
  "properties": {
    "task_id": {
      "type": "string",
      "format": "uuid",
      "description": "Created task UUID"
    },
    "status": {
      "type": "string",
      "const": "created"
    },
    "title": {
      "type": "string",
      "description": "Task title"
    },
    "priority": {
      "type": "string",
      "description": "Assigned priority"
    }
  }
}
```

**Example**:
```python
# Input
add_task(
    user_id="user-123-uuid",
    title="Buy groceries",
    description="Milk, eggs, bread",
    priority="HIGH"
)

# Output
{
    "task_id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "created",
    "title": "Buy groceries",
    "priority": "HIGH"
}
```

---

### 2. list_tasks

**Purpose**: Retrieve tasks from user's todo list.

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "user_id": {
      "type": "string",
      "description": "User's unique identifier from JWT"
    },
    "status": {
      "type": "string",
      "enum": ["all", "pending", "completed"],
      "default": "all",
      "description": "Filter by completion status"
    }
  },
  "required": ["user_id"]
}
```

**Output Schema**:
```json
{
  "type": "object",
  "properties": {
    "tasks": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": { "type": "string", "format": "uuid" },
          "title": { "type": "string" },
          "description": { "type": "string" },
          "is_completed": { "type": "boolean" },
          "priority": { "type": "string" },
          "created_at": { "type": "string", "format": "date-time" }
        }
      }
    },
    "count": {
      "type": "integer",
      "description": "Total tasks returned"
    }
  }
}
```

**Example**:
```python
# Input
list_tasks(user_id="user-123-uuid", status="pending")

# Output
{
    "tasks": [
        {
            "id": "550e8400-e29b-41d4-a716-446655440000",
            "title": "Buy groceries",
            "description": "Milk, eggs, bread",
            "is_completed": False,
            "priority": "HIGH",
            "created_at": "2025-12-22T10:30:00Z"
        },
        {
            "id": "550e8400-e29b-41d4-a716-446655440001",
            "title": "Call dentist",
            "description": None,
            "is_completed": False,
            "priority": "MEDIUM",
            "created_at": "2025-12-22T09:15:00Z"
        }
    ],
    "count": 2
}
```

---

### 3. complete_task

**Purpose**: Mark a task as complete.

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "user_id": {
      "type": "string",
      "description": "User's unique identifier from JWT"
    },
    "task_id": {
      "type": "string",
      "format": "uuid",
      "description": "Task UUID to mark as complete"
    }
  },
  "required": ["user_id", "task_id"]
}
```

**Output Schema**:
```json
{
  "type": "object",
  "properties": {
    "task_id": {
      "type": "string",
      "format": "uuid"
    },
    "status": {
      "type": "string",
      "const": "completed"
    },
    "title": {
      "type": "string"
    }
  }
}
```

**Example**:
```python
# Input
complete_task(
    user_id="user-123-uuid",
    task_id="550e8400-e29b-41d4-a716-446655440000"
)

# Output
{
    "task_id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "completed",
    "title": "Buy groceries"
}
```

**Error Cases**:
- Task not found: Returns error dict with message
- Task belongs to different user: Returns 403 error

---

### 4. delete_task

**Purpose**: Remove a task from the list.

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "user_id": {
      "type": "string",
      "description": "User's unique identifier from JWT"
    },
    "task_id": {
      "type": "string",
      "format": "uuid",
      "description": "Task UUID to delete"
    }
  },
  "required": ["user_id", "task_id"]
}
```

**Output Schema**:
```json
{
  "type": "object",
  "properties": {
    "task_id": {
      "type": "string",
      "format": "uuid"
    },
    "status": {
      "type": "string",
      "const": "deleted"
    },
    "title": {
      "type": "string"
    }
  }
}
```

**Example**:
```python
# Input
delete_task(
    user_id="user-123-uuid",
    task_id="550e8400-e29b-41d4-a716-446655440000"
)

# Output
{
    "task_id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "deleted",
    "title": "Buy groceries"
}
```

---

### 5. update_task

**Purpose**: Modify task title, description, or priority.

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "user_id": {
      "type": "string",
      "description": "User's unique identifier from JWT"
    },
    "task_id": {
      "type": "string",
      "format": "uuid",
      "description": "Task UUID to update"
    },
    "title": {
      "type": "string",
      "maxLength": 255,
      "description": "New task title (optional)"
    },
    "description": {
      "type": "string",
      "maxLength": 5000,
      "description": "New task description (optional)"
    },
    "priority": {
      "type": "string",
      "enum": ["LOW", "MEDIUM", "HIGH", "VERY_IMPORTANT"],
      "description": "New priority level (optional)"
    }
  },
  "required": ["user_id", "task_id"]
}
```

**Output Schema**:
```json
{
  "type": "object",
  "properties": {
    "task_id": {
      "type": "string",
      "format": "uuid"
    },
    "status": {
      "type": "string",
      "const": "updated"
    },
    "title": {
      "type": "string"
    }
  }
}
```

**Example**:
```python
# Input
update_task(
    user_id="user-123-uuid",
    task_id="550e8400-e29b-41d4-a716-446655440000",
    title="Buy groceries and fruits",
    priority="HIGH"
)

# Output
{
    "task_id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "updated",
    "title": "Buy groceries and fruits"
}
```

---

## Implementation Requirements

### Constitution Compliance

Per Constitution P3-III (MCP Tool Design):
- ✅ Each tool performs exactly one logical operation
- ✅ Tools do not maintain state between invocations
- ✅ Tools delegate to existing `TaskService` for database operations
- ✅ Tools return structured dict responses, not formatted strings
- ✅ Database sessions properly closed in finally blocks

Per Constitution P3-IV (User Isolation Security):
- ✅ All tool parameters include `user_id` from JWT context
- ✅ All database queries filter by `user_id`
- ✅ Tools never allow cross-user data access
- ✅ Failed user validation returns error, not empty results

### FastMCP Implementation Pattern

```python
from mcp.server.fastmcp import FastMCP
from src.services.task_service import TaskService
from src.database.connection import get_db

mcp = FastMCP("task-management-server")

@mcp.tool()
def add_task(user_id: str, title: str, description: str = None, priority: str = "MEDIUM") -> dict:
    """Create a new task for a user."""
    db = next(get_db())
    try:
        task = TaskService.create_task(
            db=db,
            title=title,
            description=description,
            user_id=user_id,
            # Priority mapped from agent detection
        )
        return {
            "task_id": str(task.id),
            "status": "created",
            "title": task.title,
            "priority": task.priority
        }
    finally:
        db.close()
```

### Error Handling

All tools return structured error responses:
```python
{
    "error": True,
    "message": "Task not found",
    "code": "TASK_NOT_FOUND"
}
```

Error codes:
- `TASK_NOT_FOUND` - Task ID does not exist
- `ACCESS_DENIED` - Task belongs to different user
- `VALIDATION_ERROR` - Invalid input parameters
- `DATABASE_ERROR` - Database operation failed
