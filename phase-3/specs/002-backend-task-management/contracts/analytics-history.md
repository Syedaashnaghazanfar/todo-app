# Analytics & History API Contracts

**API Version**: v1 (prefix: `/api/v1`)
**Response Format**: Consistent JSON wrapper (see task-endpoints.md)

## GET /history

**Purpose**: Retrieve paginated task history with filtering and sorting.

**Query Parameters**:

| Parameter | Type | Default | Constraints | Description |
|-----------|------|---------|-------------|-------------|
| page | integer | 1 | ≥ 1 | Page number (1-indexed) |
| limit | integer | 10 | 1-100 | Items per page |
| offset | integer | - | ≥ 0 | Alternative to page (skip this many items) |
| task_id | UUID | - | Optional | Filter by specific task |
| action_type | string | - | Optional, one of: CREATED, UPDATED, DELETED, COMPLETED, INCOMPLETED | Filter by action type |

**Pagination**: Use either `page` + `limit` OR `offset` + `limit`. If both provided, `page` takes precedence.

**Response (Success - 200)**:

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "history_id": "660e8400-e29b-41d4-a716-446655440100",
        "task_id": "550e8400-e29b-41d4-a716-446655440000",
        "action_type": "COMPLETED",
        "description": "Task marked as completed",
        "timestamp": "2025-12-11T12:00:00Z"
      },
      {
        "history_id": "660e8400-e29b-41d4-a716-446655440101",
        "task_id": "550e8400-e29b-41d4-a716-446655440000",
        "action_type": "UPDATED",
        "description": "Title changed from 'Buy' to 'Buy groceries'",
        "timestamp": "2025-12-11T10:45:00Z"
      },
      {
        "history_id": "660e8400-e29b-41d4-a716-446655440102",
        "task_id": "550e8400-e29b-41d4-a716-446655440000",
        "action_type": "CREATED",
        "description": "Task created by user",
        "timestamp": "2025-12-11T10:30:00Z"
      }
    ],
    "pagination": {
      "total_count": 3,
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

**Response (Invalid Pagination - 400)**:

```json
{
  "success": false,
  "data": null,
  "popup": null,
  "error": "limit must be between 1 and 100"
}
```

**Acceptance Tests**:

- ✓ Return paginated history sorted by timestamp descending (newest first)
- ✓ Default page size is 10
- ✓ Custom page size works (1-100)
- ✓ Pagination metadata includes total_count, total_pages, current_page
- ✓ has_next and has_prev flags are accurate
- ✓ Offset parameter works as alternative to page
- ✓ Filter by task_id returns only that task's history
- ✓ Filter by action_type returns only matching actions
- ✓ Reject page < 1
- ✓ Reject limit < 1 or > 100
- ✓ Return empty items array when no results match
- ✓ History entries never return update errors (immutable)

**Example Requests**:

```bash
# Get first page of history
GET /api/v1/history?page=1&limit=10

# Get second page with custom size
GET /api/v1/history?page=2&limit=20

# Get history for specific task
GET /api/v1/history?task_id=550e8400-e29b-41d4-a716-446655440000

# Get only COMPLETED actions
GET /api/v1/history?action_type=COMPLETED

# Get updates only for specific task
GET /api/v1/history?task_id=550e8400-e29b-41d4-a716-446655440000&action_type=UPDATED

# Use offset instead of page
GET /api/v1/history?offset=20&limit=10
```

---

## GET /stats/weekly

**Purpose**: Return task analytics for the current week and overall statistics.

**Query Parameters**: None required

**Response (Success - 200)**:

```json
{
  "success": true,
  "data": {
    "tasks_created_this_week": 5,
    "tasks_completed_this_week": 3,
    "total_completed": 12,
    "total_incomplete": 8,
    "week_start": "2025-12-08T00:00:00Z",
    "week_end": "2025-12-14T23:59:59Z",
    "total_tasks": 20
  },
  "popup": null,
  "error": null
}
```

**Response Fields**:

| Field | Type | Description |
|-------|------|-------------|
| tasks_created_this_week | integer | Tasks created in current week (Mon-Sun) |
| tasks_completed_this_week | integer | Tasks marked complete in current week |
| total_completed | integer | All completed tasks (across all time) |
| total_incomplete | integer | All incomplete tasks (across all time) |
| week_start | ISO 8601 timestamp | Monday 00:00:00 UTC of current week |
| week_end | ISO 8601 timestamp | Sunday 23:59:59 UTC of current week |
| total_tasks | integer | Grand total of all tasks |

**Week Definition**: Monday 00:00 UTC through Sunday 23:59 UTC

**Acceptance Tests**:

- ✓ Return accurate count of tasks created this week
- ✓ Return accurate count of tasks completed this week
- ✓ Return accurate total_completed across all weeks
- ✓ Return accurate total_incomplete across all weeks
- ✓ Week boundaries correctly defined (Monday-Sunday)
- ✓ Timezone handling (all dates in UTC)
- ✓ Return 0 for all counts when no tasks exist
- ✓ Deleted tasks excluded from counts
- ✓ Completed tasks counted only once
- ✓ week_start and week_end are accurate

**Example Calculations**:

If today is 2025-12-11 (Wednesday):
- Current week: 2025-12-08 (Monday) to 2025-12-14 (Sunday)
- tasks_created_this_week: Sum of tasks with created_at in current week
- tasks_completed_this_week: Sum of tasks with completed_at in current week
- total_completed: Count of all tasks where is_completed=true
- total_incomplete: Count of all tasks where is_completed=false

**Response (Empty State - 200)**:

```json
{
  "success": true,
  "data": {
    "tasks_created_this_week": 0,
    "tasks_completed_this_week": 0,
    "total_completed": 0,
    "total_incomplete": 0,
    "week_start": "2025-12-08T00:00:00Z",
    "week_end": "2025-12-14T23:59:59Z",
    "total_tasks": 0
  },
  "popup": null,
  "error": null
}
```

---

## Summary

| Endpoint | Purpose | Query Params | Pagination |
|----------|---------|--------------|-----------|
| GET /history | Paginated history with filters | page, limit, offset, task_id, action_type | Yes (page-based) |
| GET /stats/weekly | Weekly and total statistics | None | No |

**Total Endpoints**: 2 analytics/history endpoints
**Combined with Task CRUD**: 9 total API endpoints
