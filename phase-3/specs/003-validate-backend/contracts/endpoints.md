# API Endpoint Contracts: Backend Validation Testing

**Feature**: 003-validate-backend | **Date**: 2025-12-11 | **Version**: 1.0

## Overview

This document specifies the API endpoint contracts that will be validated during the backend testing phase. All 9 endpoints are part of the existing 002-backend-task-management implementation.

## Base URL

```
http://localhost:8000/api/v1
```

## Error Response Format (All Endpoints)

All endpoints follow the standard response format:

```json
{
  "success": false,
  "data": null,
  "popup": "Optional user-facing message",
  "error": "Error description for logging/debugging"
}
```

**HTTP Status Codes**:
- **200 OK**: Successful GET/PUT/PATCH
- **201 Created**: Successful POST
- **400 Bad Request**: Invalid UUID format, malformed JSON
- **404 Not Found**: Resource doesn't exist
- **422 Unprocessable Entity**: Validation error (title too long, empty title, etc.)
- **500 Internal Server Error**: Unexpected server error

---

## CRUD Endpoints (7 total)

### 1. Create Task

**Endpoint**: `POST /tasks`
**Status Code**: 201 Created

**Request**:

```json
{
  "title": "Complete project documentation",
  "description": "Write comprehensive README and API docs"
}
```

**Validation**:
- title: required, 1-255 characters, non-empty
- description: optional, ≤5000 characters

**Response (Success)**:

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Complete project documentation",
    "description": "Write comprehensive README and API docs",
    "is_completed": false,
    "created_at": "2025-12-11T10:30:00Z",
    "updated_at": "2025-12-11T10:30:00Z",
    "completed_at": null
  },
  "popup": "TASK_CREATED",
  "error": null
}
```

**Response (Validation Error)**:

```json
{
  "success": false,
  "data": null,
  "popup": null,
  "error": "Title must be between 1 and 255 characters"
}
```

**Side Effects**:
- Creates task_history entry with action_type=CREATED

---

### 2. List All Tasks

**Endpoint**: `GET /tasks`
**Status Code**: 200 OK

**Query Parameters**: None

**Response (Success)**:

```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Complete project documentation",
      "description": "Write comprehensive README and API docs",
      "is_completed": false,
      "created_at": "2025-12-11T10:30:00Z",
      "updated_at": "2025-12-11T10:30:00Z",
      "completed_at": null
    },
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "title": "Deploy to production",
      "description": null,
      "is_completed": true,
      "created_at": "2025-12-11T09:00:00Z",
      "updated_at": "2025-12-11T11:00:00Z",
      "completed_at": "2025-12-11T11:00:00Z"
    }
  ],
  "popup": null,
  "error": null
}
```

**Ordering**:
- Incomplete tasks first (is_completed=false)
- Completed tasks second (is_completed=true)
- Within each group: sorted by created_at DESC (newest first)

**Response (Empty)**:

```json
{
  "success": true,
  "data": [],
  "popup": null,
  "error": null
}
```

---

### 3. Get Single Task

**Endpoint**: `GET /tasks/{id}`
**Status Code**: 200 OK (or 404 Not Found)

**Path Parameters**:
- id: UUID string (e.g., 550e8400-e29b-41d4-a716-446655440000)

**Response (Success)**:

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Complete project documentation",
    "description": "Write comprehensive README and API docs",
    "is_completed": false,
    "created_at": "2025-12-11T10:30:00Z",
    "updated_at": "2025-12-11T10:30:00Z",
    "completed_at": null
  },
  "popup": null,
  "error": null
}
```

**Response (Not Found)**:

```json
{
  "success": false,
  "data": null,
  "popup": null,
  "error": "Task not found"
}
```

**Response (Invalid UUID)**:

```json
{
  "success": false,
  "data": null,
  "popup": null,
  "error": "Invalid UUID format"
}
```

---

### 4. Update Task

**Endpoint**: `PUT /tasks/{id}`
**Status Code**: 200 OK

**Path Parameters**:
- id: UUID string

**Request** (partial update):

```json
{
  "title": "Updated task title"
}
```

or

```json
{
  "description": "Updated description only"
}
```

or

```json
{
  "title": "Updated title",
  "description": "Updated description"
}
```

**Validation**:
- title: optional, 1-255 characters if provided
- description: optional, ≤5000 characters if provided
- At least one field must be provided

**Response (Success)**:

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Updated task title",
    "description": "Write comprehensive README and API docs",
    "is_completed": false,
    "created_at": "2025-12-11T10:30:00Z",
    "updated_at": "2025-12-11T10:45:00Z",
    "completed_at": null
  },
  "popup": "TASK_UPDATED",
  "error": null
}
```

**Side Effects**:
- Updates updated_at timestamp to current UTC time
- Creates task_history entry with action_type=UPDATED

---

### 5. Delete Task

**Endpoint**: `DELETE /tasks/{id}`
**Status Code**: 200 OK

**Path Parameters**:
- id: UUID string

**Response (Success)**:

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "message": "Task deleted successfully"
  },
  "popup": "TASK_DELETED",
  "error": null
}
```

**Response (Not Found)**:

```json
{
  "success": false,
  "data": null,
  "popup": null,
  "error": "Task not found"
}
```

**Side Effects**:
- Deletes task from tasks table
- Retains all history entries in task_history (RESTRICT FK design)
- Creates task_history entry with action_type=DELETED (if implemented)

---

### 6. Mark Task as Complete

**Endpoint**: `PATCH /tasks/{id}/complete`
**Status Code**: 200 OK

**Path Parameters**:
- id: UUID string

**Request**: Empty body (no JSON required)

**Response (Success)**:

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Complete project documentation",
    "description": "Write comprehensive README and API docs",
    "is_completed": true,
    "created_at": "2025-12-11T10:30:00Z",
    "updated_at": "2025-12-11T10:50:00Z",
    "completed_at": "2025-12-11T10:50:00Z"
  },
  "popup": "TASK_COMPLETED",
  "error": null
}
```

**Response (Already Completed)**:
- Either succeeds idempotently (returns same data) or returns error
- Behavior determined by implementation

**Side Effects**:
- Sets is_completed=true
- Sets completed_at to current UTC timestamp
- Updates updated_at timestamp
- Creates task_history entry with action_type=COMPLETED

---

### 7. Mark Task as Incomplete

**Endpoint**: `PATCH /tasks/{id}/incomplete`
**Status Code**: 200 OK

**Path Parameters**:
- id: UUID string

**Request**: Empty body (no JSON required)

**Response (Success)**:

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Complete project documentation",
    "description": "Write comprehensive README and API docs",
    "is_completed": false,
    "created_at": "2025-12-11T10:30:00Z",
    "updated_at": "2025-12-11T10:55:00Z",
    "completed_at": null
  },
  "popup": "TASK_INCOMPLETE",
  "error": null
}
```

**Side Effects**:
- Sets is_completed=false
- Clears completed_at to null
- Updates updated_at timestamp
- Creates task_history entry with action_type=INCOMPLETED

---

## Analytics Endpoints (2 total)

### 8. Get Paginated History

**Endpoint**: `GET /history`
**Status Code**: 200 OK

**Query Parameters**:
- page: integer, ≥1, default=1
- limit: integer, 1-100, default=10
- task_id: UUID (optional) - filter by specific task
- action_type: string (optional) - filter by action type (CREATED, UPDATED, DELETED, COMPLETED, INCOMPLETED)

**Example Request**:

```
GET /history?page=1&limit=10&task_id=550e8400-e29b-41d4-a716-446655440000&action_type=COMPLETED
```

**Response (Success)**:

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "history_id": "770e8400-e29b-41d4-a716-446655440002",
        "task_id": "550e8400-e29b-41d4-a716-446655440000",
        "action_type": "COMPLETED",
        "description": "Task marked as complete",
        "timestamp": "2025-12-11T10:50:00Z"
      },
      {
        "history_id": "770e8400-e29b-41d4-a716-446655440001",
        "task_id": "550e8400-e29b-41d4-a716-446655440000",
        "action_type": "CREATED",
        "description": "Task created via API",
        "timestamp": "2025-12-11T10:30:00Z"
      }
    ],
    "pagination": {
      "total_count": 2,
      "total_pages": 1,
      "current_page": 1,
      "page_size": 10,
      "has_next": false,
      "has_prev": false
    }
  },
  "popup": null,
  "error": null
}
```

**Response (Empty Results)**:

```json
{
  "success": true,
  "data": {
    "items": [],
    "pagination": {
      "total_count": 0,
      "total_pages": 0,
      "current_page": 1,
      "page_size": 10,
      "has_next": false,
      "has_prev": false
    }
  },
  "popup": null,
  "error": null
}
```

**Sorting**: By timestamp DESC (newest first)

---

### 9. Get Weekly Statistics

**Endpoint**: `GET /stats/weekly`
**Status Code**: 200 OK

**Query Parameters**: None

**Response (Success)**:

```json
{
  "success": true,
  "data": {
    "weekly_start": "2025-12-08T00:00:00Z",
    "weekly_end": "2025-12-14T23:59:59Z",
    "total_tasks": 8,
    "completed_tasks": 5,
    "completion_rate": 62.5
  },
  "popup": null,
  "error": null
}
```

**Response (No Data)**:

```json
{
  "success": true,
  "data": {
    "weekly_start": "2025-12-08T00:00:00Z",
    "weekly_end": "2025-12-14T23:59:59Z",
    "total_tasks": 0,
    "completed_tasks": 0,
    "completion_rate": 0
  },
  "popup": null,
  "error": null
}
```

**Week Calculation**:
- Starts: Monday of current week at 00:00:00 UTC
- Ends: Sunday of current week at 23:59:59 UTC
- Example: Week of Dec 8-14, 2025 (Monday-Sunday UTC)

**Completion Rate Calculation**:
- Formula: (completed_tasks / total_tasks) × 100
- Handles edge case: 0/0 = 0%

---

## Health & Status Endpoints (1 total, bonus)

### Health Check

**Endpoint**: `GET /health`
**Status Code**: 200 OK

**Response**:

```json
{
  "status": "healthy",
  "service": "todo-app-backend"
}
```

---

## Testing Validation Points

For each endpoint, validate:

1. **Successful Request**: Returns 201/200 with correct response format
2. **Invalid Input**: Returns 400/422 with error message
3. **Not Found**: Returns 404 when resource doesn't exist (CRUD endpoints)
4. **Validation Rules**: All constraints enforced (title length, UUID format, etc.)
5. **History Logging**: Task operations create appropriate history entries
6. **Pagination**: Correct page/offset calculations and metadata
7. **Ordering**: Tasks ordered correctly (incomplete first); history ordered by timestamp DESC
8. **CORS Headers**: Requests from http://localhost:3000 return CORS headers

---

## Summary

- **9 API endpoints** fully specified
- **Standard JSON response format** with success flag, data, popup, error fields
- **Comprehensive validation** covering CRUD, analytics, and error cases
- **Immutable audit trail** through task_history with CREATED, UPDATED, DELETED, COMPLETED, INCOMPLETED actions
- **Paginated results** with metadata (total_count, total_pages, has_next, has_prev)
- **UTC timezone** for all timestamps
- **Error handling** with appropriate HTTP status codes and descriptive messages
