# Data Model: Backend API Database Schema Validation

**Feature**: 003-validate-backend | **Date**: 2025-12-11

## Overview

This document specifies the database schema that will be validated during the backend API testing phase. The schema is already implemented in the 002-backend-task-management feature and will be verified through Alembic migrations.

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────┐
│                      TASKS                          │
├─────────────────────────────────────────────────────┤
│ PK  id (UUID)                                       │
│     title (VARCHAR 255) [NOT NULL]                  │
│     description (TEXT) [NULLABLE]                   │
│     is_completed (BOOLEAN) [NOT NULL, DEFAULT=false]│
│     created_at (TIMESTAMP) [NOT NULL, DEFAULT=NOW] │
│     updated_at (TIMESTAMP) [NOT NULL, DEFAULT=NOW] │
│     completed_at (TIMESTAMP) [NULLABLE]             │
│                                                     │
│ Indexes:                                            │
│   - idx_tasks_is_completed (is_completed)           │
│   - idx_tasks_created_at (created_at DESC)          │
│   - idx_tasks_updated_at (updated_at DESC)          │
└─────────────────────────────────────────────────────┘
                          │
                          │ 1:N (RESTRICT)
                          │
┌─────────────────────────────────────────────────────┐
│                  TASK_HISTORY                       │
├─────────────────────────────────────────────────────┤
│ PK  history_id (UUID)                               │
│ FK  task_id (UUID) [NOT NULL, RESTRICT on delete]   │
│     action_type (ENUM) [NOT NULL]                   │
│       - CREATED                                     │
│       - UPDATED                                     │
│       - DELETED                                     │
│       - COMPLETED                                   │
│       - INCOMPLETED                                 │
│     description (TEXT) [NULLABLE]                   │
│     timestamp (TIMESTAMP) [NOT NULL, DEFAULT=NOW]   │
│                                                     │
│ Indexes:                                            │
│   - idx_task_history_task_id (task_id)              │
│   - idx_task_history_action_type (action_type)      │
│   - idx_task_history_timestamp (timestamp DESC)     │
│   - idx_task_history_task_action (task_id, action)  │
└─────────────────────────────────────────────────────┘
```

## Entity Definitions

### Task (tasks table)

**Purpose**: Represents a single to-do item with completion tracking and timestamps.

**Fields**:

| Field | Type | Constraints | Purpose |
|-------|------|-------------|---------|
| id | UUID | PRIMARY KEY, DEFAULT=uuid_v4() | Distributed ID generation |
| title | VARCHAR(255) | NOT NULL | Task title/description (1-255 chars) |
| description | TEXT | NULLABLE, MAX=5000 | Detailed task description |
| is_completed | BOOLEAN | NOT NULL, DEFAULT=false | Task completion status |
| created_at | TIMESTAMP | NOT NULL, DEFAULT=NOW | Task creation time (UTC) |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT=NOW | Last update time (UTC) |
| completed_at | TIMESTAMP | NULLABLE | Task completion time (UTC) |

**Check Constraints** (3 total):

1. **task_title_not_empty**: `LENGTH(TRIM(title)) > 0`
   - Ensures title is not empty after trimming whitespace

2. **task_description_max_length**: `LENGTH(description) <= 5000`
   - Ensures description doesn't exceed 5000 characters

3. **task_completed_at_consistency**: `(is_completed = true AND completed_at IS NOT NULL) OR (is_completed = false AND completed_at IS NULL)`
   - Ensures completed_at is set only when task is completed
   - Prevents inconsistent state

**Indexes** (3 total):

1. **idx_tasks_is_completed**: `(is_completed)`
   - Optimizes queries filtering by completion status (e.g., listing incomplete tasks)

2. **idx_tasks_created_at**: `(created_at DESC)`
   - Optimizes sorting tasks by creation time

3. **idx_tasks_updated_at**: `(updated_at DESC)`
   - Optimizes sorting tasks by update time

**Validation Rules**:

- Title must be 1-255 characters, non-empty after trim
- Description must be ≤5000 characters
- is_completed is boolean (true/false)
- Timestamps are UTC datetime with automatic tracking
- completed_at is null when is_completed=false, set when is_completed=true

**Example**:

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Complete project documentation",
  "description": "Write comprehensive README and API docs",
  "is_completed": false,
  "created_at": "2025-12-11T10:30:00Z",
  "updated_at": "2025-12-11T10:30:00Z",
  "completed_at": null
}
```

---

### TaskHistory (task_history table)

**Purpose**: Immutable audit log recording all changes to tasks for accountability and analytics.

**Fields**:

| Field | Type | Constraints | Purpose |
|-------|------|-------------|---------|
| history_id | UUID | PRIMARY KEY, DEFAULT=uuid_v4() | Unique history entry ID |
| task_id | UUID | FOREIGN KEY → tasks.id (RESTRICT) | Reference to task being modified |
| action_type | ENUM | NOT NULL | Type of action performed |
| description | TEXT | NULLABLE | Additional context about the action |
| timestamp | TIMESTAMP | NOT NULL, DEFAULT=NOW | When the action occurred (UTC) |

**Action Types** (5 total):

1. **CREATED**: Task created with initial title/description
2. **UPDATED**: Task title/description modified
3. **DELETED**: Task deleted from tasks table
4. **COMPLETED**: Task marked as complete (is_completed=true, completed_at set)
5. **INCOMPLETED**: Task marked as incomplete (is_completed=false, completed_at cleared)

**Foreign Key Constraint**:

- **task_id → tasks.id**: RESTRICT on delete
  - Prevents deletion of a task that has history entries
  - Ensures referential integrity (orphaned history is not possible)
  - Task can only be deleted if no history entries exist (which is never, since CREATED entry exists)
  - Design: TaskHistory is immutable; task deletion creates DELETED history entry, but FK constraint prevents physical deletion if history exists

**Indexes** (4 total):

1. **idx_task_history_task_id**: `(task_id)`
   - Optimizes queries filtering history by task

2. **idx_task_history_action_type**: `(action_type)`
   - Optimizes queries filtering history by action type

3. **idx_task_history_timestamp**: `(timestamp DESC)`
   - Optimizes sorting history by time (newest first)

4. **idx_task_history_task_action**: `(task_id, action_type)`
   - Composite index for filtering by task AND action type

**Validation Rules**:

- task_id must reference valid task in tasks table
- action_type must be one of 5 enum values (CREATED, UPDATED, DELETED, COMPLETED, INCOMPLETED)
- description is optional but recommended for context
- timestamp is automatically set to UTC time of entry creation

**Example**:

```json
{
  "history_id": "660e8400-e29b-41d4-a716-446655440000",
  "task_id": "550e8400-e29b-41d4-a716-446655440000",
  "action_type": "CREATED",
  "description": "Task created via API",
  "timestamp": "2025-12-11T10:30:00Z"
}
```

## Database Constraints & Integrity

### Check Constraints (3 on tasks table)

1. **Non-empty title**: Prevents blank or whitespace-only titles
2. **Description length limit**: Enforces 5000 character maximum
3. **completed_at consistency**: Ensures logical consistency between is_completed and completed_at

### Foreign Key Constraints (1 on task_history table)

1. **RESTRICT delete**: task_history.task_id → tasks.id
   - Prevents orphaned history if task is deleted
   - Design decision: Use RESTRICT to maintain audit trail integrity
   - Impact: Tasks cannot be deleted if they have history (which is always true)
   - Workaround: Delete history entries first (if needed), then delete task

### Unique Constraints

- None (by design): Multiple identical titles allowed; tasks distinguished by UUID

## Query Patterns & Performance

### Frequently Used Queries

1. **List incomplete tasks**:
   - Query: `SELECT * FROM tasks WHERE is_completed = false ORDER BY created_at DESC`
   - Index: idx_tasks_is_completed
   - Expected rows: Varies; pagination limit 100 max

2. **Get task by ID**:
   - Query: `SELECT * FROM tasks WHERE id = ?`
   - Index: Primary key (id)
   - Expected rows: 0 or 1

3. **Get history for task**:
   - Query: `SELECT * FROM task_history WHERE task_id = ? ORDER BY timestamp DESC LIMIT 10`
   - Index: idx_task_history_task_id
   - Expected rows: 5-100 (depending on task age)

4. **Get weekly statistics**:
   - Query: `SELECT COUNT(*) as total, COUNT(CASE WHEN is_completed THEN 1 END) as completed FROM tasks WHERE created_at >= ? AND created_at <= ?`
   - Index: idx_tasks_created_at
   - Expected rows: 1 (aggregation)

5. **Filter history by action type**:
   - Query: `SELECT * FROM task_history WHERE action_type = ? ORDER BY timestamp DESC LIMIT 10`
   - Index: idx_task_history_action_type
   - Expected rows: 10-50

### Performance Targets

- **Single row retrieval**: <10ms
- **List query with filtering**: <50ms for 100 rows
- **History pagination**: <50ms for page of 10 items
- **Weekly statistics**: <100ms
- **Full table scan**: Not expected (all queries use indexes)

## Validation Checklist

During validation phase, verify:

- [ ] **Table Creation**: Both tables exist with correct names
- [ ] **Column Definitions**: All columns present with correct types
- [ ] **Check Constraints**: All 3 constraints on tasks table enforced
- [ ] **Foreign Keys**: RESTRICT FK on task_history.task_id → tasks.id
- [ ] **Indexes**: All 7 indexes created and accessible (3 on tasks + 4 on task_history)
- [ ] **Default Values**: Timestamps and UUIDs auto-populated
- [ ] **Nullable Constraints**: description and completed_at correctly nullable
- [ ] **NOT NULL Constraints**: title, is_completed, created_at, updated_at on tasks; all fields on task_history

## Data Retention & Migration Strategy

**Data Retention Policy**:
- Tasks retained indefinitely (no automatic cleanup)
- History retained indefinitely as immutable audit trail
- Soft deletes not implemented (hard delete removes task but retains history)

**Migration Path**:
- Version 0001_initial_schema.py creates initial schema
- No data migration needed (new database initialization)
- Idempotent: Can rerun migrations safely

## Summary

The database schema is optimized for the task management use case with:
- **Simplicity**: 2 tables, clear relationships
- **Integrity**: 3 check constraints, 1 RESTRICT FK
- **Performance**: 7 indexes on frequently queried columns
- **Auditability**: Immutable history table with all action types
- **Scalability**: UUID keys for distributed ID generation, NullPool for serverless optimization

This schema is validated as part of the 003-validate-backend feature through Alembic migration verification and schema introspection queries.
