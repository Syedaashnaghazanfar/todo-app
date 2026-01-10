# Data Model: Backend Task Management

**Feature**: Task Management Module for Todo App Phase-2
**Database**: Neon PostgreSQL
**ORM**: SQLAlchemy 2.0+
**Migrations**: Alembic

## Entity Relationship Diagram

```
┌─────────────────────┐
│      tasks          │
├─────────────────────┤
│ id (UUID, PK)      │
│ title (String)     │
│ description (Text) │
│ is_completed (Bool)│
│ created_at (TS)    │
│ updated_at (TS)    │
│ completed_at (TS)  │
└────────────┬────────┘
             │ 1
             │
             │ M
             │
    ┌────────▼─────────────────┐
    │    task_history          │
    ├──────────────────────────┤
    │ history_id (UUID, PK)    │
    │ task_id (UUID, FK)       │
    │ action_type (Enum)       │
    │ description (Text)       │
    │ timestamp (TS)           │
    └──────────────────────────┘

    Cascade Delete: task_id
    (history retained even after task deletion)
```

## Entity Details

### Task

**Purpose**: Represents a user-created task item with completion tracking.

**Fields**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier for the task |
| title | VARCHAR(255) | NOT NULL, CHECK length > 0 | Task title or name |
| description | TEXT | NULL, CHECK length <= 5000 | Optional detailed description |
| is_completed | BOOLEAN | NOT NULL, DEFAULT false | Completion status flag |
| created_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | UTC creation timestamp |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP, ON UPDATE CURRENT_TIMESTAMP | UTC last modification timestamp |
| completed_at | TIMESTAMP | NULL | UTC timestamp when marked complete, NULL if incomplete |

**Validation Rules**:

- `title` must be non-empty string (1-255 characters)
- `description` optional but max 5000 characters if provided
- `is_completed` is boolean (true/false only)
- `completed_at` must be NULL if `is_completed=false`, must have value if `is_completed=true`
- Timestamps always in UTC, no timezone conversion needed for storage

**Indexes**:

- PRIMARY: `id`
- COMMON: `is_completed, created_at DESC` (for list queries)
- SEARCH: `created_at DESC` (for dashboard/stats)

**State Transitions**:

```
Initial: is_completed=false, completed_at=NULL, created_at=now
         ↓
Mark Complete: is_completed=true, completed_at=now
         ↓
Mark Incomplete: is_completed=false, completed_at=NULL
         ↓
Delete: Remove from tasks table, history retained in task_history
```

### TaskHistory

**Purpose**: Immutable audit log capturing all changes to tasks for compliance, debugging, and analytics.

**Fields**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| history_id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique history entry identifier |
| task_id | UUID | FOREIGN KEY tasks(id) ON DELETE CASCADE, NOT NULL | Reference to the task (cascade: keeps history if task deleted) |
| action_type | VARCHAR(50) | NOT NULL, ENUM (CREATED, UPDATED, DELETED, COMPLETED, INCOMPLETED) | Type of action performed |
| description | TEXT | NULL | Optional change details (e.g., "title changed from X to Y") |
| timestamp | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | UTC when action occurred |

**Validation Rules**:

- `action_type` must be one of exactly 5 values: CREATED, UPDATED, DELETED, COMPLETED, INCOMPLETED
- `description` is optional, should contain human-readable details about the change
- `timestamp` always in UTC
- **IMMUTABLE**: Once created, history records cannot be updated or deleted

**Indexes**:

- PRIMARY: `history_id`
- FOREIGN KEY: `task_id` (enables fast lookup of task's history)
- COMMON: `timestamp DESC` (for pagination and ordered retrieval)
- SEARCH: `action_type, timestamp DESC` (for filtering by action)

**Cascade Behavior**:

- ON DELETE CASCADE from tasks: History entries are RETAINED (using CASCADE but with trigger-based logic to mark task_id as deleted reference)
- Actually: Use ON DELETE SET NULL with NOT NULL constraint removed, OR keep CASCADE but rely on application logic to handle orphaned records

**Action Type Meanings**:

- **CREATED**: Task was created. Description: initial task details
- **UPDATED**: Task was edited (title/description). Description: what changed (e.g., "title: 'old' -> 'new'")
- **DELETED**: Task was permanently removed. Description: task details before deletion
- **COMPLETED**: Task marked as complete. Description: completion timestamp
- **INCOMPLETED**: Task marked as incomplete. Description: "reverted from completed"

## Relationships

**Task ↔ TaskHistory (1:M)**

- One Task can have many history entries
- Each history entry references exactly one Task
- Cascade behavior: Deleting a task does NOT delete its history (audit trail must be retained)
- Foreign key: `task_history.task_id → tasks.id` with `ON DELETE RESTRICT` or triggers to prevent orphaning

## Database Constraints & Integrity

**Task Constraints**:

```sql
-- Check constraints
ALTER TABLE tasks ADD CONSTRAINT task_title_not_empty
  CHECK (length(trim(title)) > 0);

ALTER TABLE tasks ADD CONSTRAINT task_description_max_length
  CHECK (length(description) <= 5000);

-- Completed state validation
ALTER TABLE tasks ADD CONSTRAINT task_completed_at_consistency
  CHECK ((is_completed = true AND completed_at IS NOT NULL)
      OR (is_completed = false AND completed_at IS NULL));
```

**TaskHistory Constraints**:

```sql
-- Action type must be valid
ALTER TABLE task_history ADD CONSTRAINT history_valid_action_type
  CHECK (action_type IN ('CREATED', 'UPDATED', 'DELETED', 'COMPLETED', 'INCOMPLETED'));

-- Task reference with cascade (history retained)
ALTER TABLE task_history ADD CONSTRAINT fk_task_history_task_id
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE RESTRICT;
```

## Query Patterns

**High-frequency queries** (must be optimized):

1. Get all incomplete tasks sorted by creation:
   ```sql
   SELECT * FROM tasks WHERE is_completed = false ORDER BY created_at DESC;
   ```
   Index: `(is_completed, created_at DESC)`

2. Get task history for a specific task:
   ```sql
   SELECT * FROM task_history WHERE task_id = ? ORDER BY timestamp DESC;
   ```
   Index: `(task_id, timestamp DESC)` (foreign key index)

3. Get stats for current week:
   ```sql
   SELECT COUNT(*), SUM(CASE WHEN is_completed THEN 1 ELSE 0 END) FROM tasks
   WHERE created_at >= DATE_TRUNC('week', NOW());
   ```
   Index: `(created_at)`

4. Paginated history with offset:
   ```sql
   SELECT * FROM task_history ORDER BY timestamp DESC LIMIT 10 OFFSET 0;
   ```
   Index: `(timestamp DESC)`

## Migration Strategy

**Initial Migration (v0001)**:
- Create `tasks` table with all fields, indexes, constraints
- Create `task_history` table with all fields, indexes, foreign key relationship

**Future Migrations** (version incrementally):
- Schema changes use Alembic with `alembic revision --autogenerate`
- Down-migrations must be tested before deployment
- Zero-downtime migrations preferred (add column nullable first, populate, then add NOT NULL)

## Performance Considerations

**Connection Pool**:
- Min: 5 connections (development)
- Max: 20 connections (production, respecting Neon limits)
- Timeout: 30 seconds
- Idle timeout: 5 minutes

**Transaction Isolation**:
- Read Committed (default PostgreSQL): Sufficient for task management
- Task-specific operations: Single transaction per API call
- History logging: Synchronous after task transaction commits
- Timeout: 15 seconds per transaction

**Concurrency**:
- Database-level row locking prevents lost updates
- Last-write-wins for simultaneous edits (acceptable for MVP)
- UUID primary keys enable distributed ID generation

**Data Retention**:
- No automatic purging (retention indefinite)
- History never deleted (audit trail permanent)
- Tasks soft-delete possible via is_deleted flag (not implemented in MVP)
