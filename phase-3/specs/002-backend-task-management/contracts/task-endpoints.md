# Task API Contracts

**API Version**: v1 (prefix: `/api/v1`)
**Base URL**: `http://localhost:8000` (development)
**Authentication**: None required (Phase-2 MVP)
**Response Format**: Consistent JSON wrapper

## Response Format (All Endpoints)

```json
{
  "success": true|false,
  "data": null|object|array,
  "popup": null|"TASK_CREATED"|"TASK_UPDATED"|"TASK_COMPLETED"|"TASK_INCOMPLETE"|"TASK_DELETED",
  "error": null|"error message"
}
```

**HTTP Status Codes**:
- **200 OK**: Successful GET, PUT, PATCH request
- **201 Created**: Successful POST request
- **204 No Content**: Successful DELETE request (optional, can use 200)
- **400 Bad Request**: Validation error (malformed JSON, invalid field values)
- **404 Not Found**: Resource not found (task id doesn't exist)
- **500 Internal Server Error**: Unexpected server error

## CREATE: POST /tasks

**Purpose**: Create a new task with title and optional description.

**Request Body**:

```json
{
  "title": "Buy groceries",
  "description": "Milk, bread, eggs, cheese"
}
```

**Request Schema**:

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| title | string | Yes | 1-255 characters, non-empty |
| description | string | No | 0-5000 characters, max length |

**Response (Success - 201)**:

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Buy groceries",
    "description": "Milk, bread, eggs, cheese",
    "is_completed": false,
    "created_at": "2025-12-11T10:30:00Z",
    "updated_at": "2025-12-11T10:30:00Z",
    "completed_at": null
  },
  "popup": "TASK_CREATED",
  "error": null
}
```

**Response (Validation Error - 400)**:

```json
{
  "success": false,
  "data": null,
  "popup": null,
  "error": "title: field required (type=value_error.missing)"
}
```

**Acceptance Tests**:
- ✓ Create task with title only
- ✓ Create task with title and description
- ✓ Reject empty title
- ✓ Reject title > 255 characters
- ✓ Reject description > 5000 characters
- ✓ History entry created with action=CREATED
- ✓ Response includes popup=TASK_CREATED

---

## READ: GET /tasks

**Purpose**: Retrieve all tasks, ordered with incomplete tasks first.

**Query Parameters**: None required

**Response (Success - 200)**:

```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Buy groceries",
      "description": "Milk, bread, eggs, cheese",
      "is_completed": false,
      "created_at": "2025-12-11T10:30:00Z",
      "updated_at": "2025-12-11T10:30:00Z",
      "completed_at": null
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "title": "Finished task",
      "description": null,
      "is_completed": true,
      "created_at": "2025-12-10T14:20:00Z",
      "updated_at": "2025-12-11T11:00:00Z",
      "completed_at": "2025-12-11T11:00:00Z"
    }
  ],
  "popup": null,
  "error": null
}
```

**Response (Empty List - 200)**:

```json
{
  "success": true,
  "data": [],
  "popup": null,
  "error": null
}
```

**Acceptance Tests**:
- ✓ Return all tasks with complete metadata
- ✓ Incomplete tasks listed before completed tasks
- ✓ Empty array when no tasks exist
- ✓ Completed tasks have completed_at timestamp

---

## READ: GET /tasks/{id}

**Purpose**: Retrieve a specific task by ID.

**Path Parameters**:

| Parameter | Type | Required | Constraints |
|-----------|------|----------|-------------|
| id | UUID | Yes | Valid UUID format |

**Response (Success - 200)**:

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Buy groceries",
    "description": "Milk, bread, eggs, cheese",
    "is_completed": false,
    "created_at": "2025-12-11T10:30:00Z",
    "updated_at": "2025-12-11T10:30:00Z",
    "completed_at": null
  },
  "popup": null,
  "error": null
}
```

**Response (Not Found - 404)**:

```json
{
  "success": false,
  "data": null,
  "popup": null,
  "error": "Task not found"
}
```

**Acceptance Tests**:
- ✓ Return task with matching ID
- ✓ Return 404 for non-existent ID
- ✓ Reject invalid UUID format

---

## UPDATE: PUT /tasks/{id}

**Purpose**: Update task title and/or description.

**Path Parameters**:

| Parameter | Type | Required | Constraints |
|-----------|------|----------|-------------|
| id | UUID | Yes | Valid UUID format |

**Request Body**:

```json
{
  "title": "Buy groceries and cook dinner",
  "description": "Updated shopping list with dinner plans"
}
```

**Request Schema**:

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| title | string | No | 1-255 characters if provided |
| description | string | No | 0-5000 characters if provided |

**Note**: At least one field (title or description) must be provided.

**Response (Success - 200)**:

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Buy groceries and cook dinner",
    "description": "Updated shopping list with dinner plans",
    "is_completed": false,
    "created_at": "2025-12-11T10:30:00Z",
    "updated_at": "2025-12-11T11:15:00Z",
    "completed_at": null
  },
  "popup": "TASK_UPDATED",
  "error": null
}
```

**Acceptance Tests**:
- ✓ Update title only
- ✓ Update description only
- ✓ Update both title and description
- ✓ Unchanged fields remain unchanged
- ✓ updated_at timestamp changes
- ✓ History entry created with action=UPDATED
- ✓ Reject empty title
- ✓ Reject title > 255 characters
- ✓ Reject description > 5000 characters

---

## DELETE: DELETE /tasks/{id}

**Purpose**: Permanently delete a task.

**Path Parameters**:

| Parameter | Type | Required | Constraints |
|-----------|------|----------|-------------|
| id | UUID | Yes | Valid UUID format |

**Response (Success - 204 No Content or 200)**:

```json
{
  "success": true,
  "data": null,
  "popup": "TASK_DELETED",
  "error": null
}
```

**Response (Not Found - 404)**:

```json
{
  "success": false,
  "data": null,
  "popup": null,
  "error": "Task not found"
}
```

**Acceptance Tests**:
- ✓ Delete existing task
- ✓ Task no longer appears in GET /tasks
- ✓ History entry created with action=DELETED
- ✓ History entries retained after task deletion
- ✓ Return 404 for non-existent ID
- ✓ Response includes popup=TASK_DELETED

---

## PATCH: PATCH /tasks/{id}/complete

**Purpose**: Mark a task as completed.

**Path Parameters**:

| Parameter | Type | Required | Constraints |
|-----------|------|----------|-------------|
| id | UUID | Yes | Valid UUID format |

**Request Body**: None required (empty body)

**Response (Success - 200)**:

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Buy groceries",
    "description": "Milk, bread, eggs, cheese",
    "is_completed": true,
    "created_at": "2025-12-11T10:30:00Z",
    "updated_at": "2025-12-11T12:00:00Z",
    "completed_at": "2025-12-11T12:00:00Z"
  },
  "popup": "TASK_COMPLETED",
  "error": null
}
```

**Acceptance Tests**:
- ✓ Set is_completed to true
- ✓ Set completed_at to current timestamp
- ✓ updated_at timestamp changes
- ✓ History entry created with action=COMPLETED
- ✓ Idempotent: calling twice has same effect
- ✓ Return 404 for non-existent ID
- ✓ Response includes popup=TASK_COMPLETED

---

## PATCH: PATCH /tasks/{id}/incomplete

**Purpose**: Mark a completed task as incomplete.

**Path Parameters**:

| Parameter | Type | Required | Constraints |
|-----------|------|----------|-------------|
| id | UUID | Yes | Valid UUID format |

**Request Body**: None required (empty body)

**Response (Success - 200)**:

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Buy groceries",
    "description": "Milk, bread, eggs, cheese",
    "is_completed": false,
    "created_at": "2025-12-11T10:30:00Z",
    "updated_at": "2025-12-11T12:15:00Z",
    "completed_at": null
  },
  "popup": "TASK_INCOMPLETE",
  "error": null
}
```

**Acceptance Tests**:
- ✓ Set is_completed to false
- ✓ Clear completed_at (set to null)
- ✓ updated_at timestamp changes
- ✓ History entry created with action=INCOMPLETED
- ✓ Idempotent: calling twice has same effect
- ✓ Return 404 for non-existent ID
- ✓ Response includes popup=TASK_INCOMPLETE

---

## Summary

| Method | Endpoint | Purpose | Status Code |
|--------|----------|---------|-------------|
| POST | /tasks | Create task | 201 |
| GET | /tasks | List all tasks | 200 |
| GET | /tasks/{id} | Get single task | 200 |
| PUT | /tasks/{id} | Update task | 200 |
| DELETE | /tasks/{id} | Delete task | 200/204 |
| PATCH | /tasks/{id}/complete | Mark complete | 200 |
| PATCH | /tasks/{id}/incomplete | Mark incomplete | 200 |

**Total Endpoints**: 7 core operations
**Response Format**: Consistent across all endpoints
**Error Handling**: Validation errors (400), not found (404), server errors (500)
