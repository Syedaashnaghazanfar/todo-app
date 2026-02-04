# Data Model: Phase V Entities

**Date**: 2026-01-13 | **Phase**: Phase 0

---

## Entity Schemas

### 1. RecurringTaskSeries
Parent entity for recurring task definitions.

```python
class RecurringTaskSeries:
    series_id: UUID (PK)
    user_id: str (FK to users, indexed)
    base_task_template: JSON  # {title, description, priority, tags}
    recurrence_pattern: str  # RRULE string (e.g., "FREQ=DAILY;COUNT=30")
    recurrence_start_date: datetime (UTC)
    recurrence_end_date: datetime (UTC, nullable)
    is_active: bool (default=True)  # False when COUNT/UNTIL exhausted
    created_at: datetime (UTC)
    updated_at: datetime (UTC)
```

**Relationships**: One-to-Many with TaskInstance

### 2. TaskInstance (extends existing Task model)
Individual task or recurring task instance.

```python
class Task:
    task_id: UUID (PK)
    user_id: str (FK, indexed)
    title: str
    description: str (nullable)
    due_date: datetime (UTC, nullable)
    completed: bool (default=False)
    completed_at: datetime (UTC, nullable)
    
    # NEW: Phase V fields
    priority: Enum["VERY_IMPORTANT", "HIGH", "MEDIUM", "LOW"] (default="MEDIUM")
    tags: Array[str] (PostgreSQL array, max 7 tags)
    is_recurring: bool (default=False)
    series_id: UUID (FK to RecurringTaskSeries, nullable, indexed)
    recurrence_pattern: str (nullable, copy from series for display)
    next_occurrence: datetime (UTC, nullable)
    
    created_at: datetime (UTC)
    updated_at: datetime (UTC)
```

**Constraints**:
- UNIQUE(series_id, due_date) WHERE series_id IS NOT NULL (prevent duplicates)
- CHECK: tags array length <= 7
- INDEX: (user_id, completed, due_date) for queries

**Relationships**: 
- Many-to-One with RecurringTaskSeries (optional)
- One-to-Many with Reminder

### 3. TaskEvent
Event log for published Kafka events.

```python
class TaskEvent:
    event_id: UUID (PK, from CloudEvents id)
    event_type: str  # task.created, task.completed, task.updated, task.deleted
    user_id: str (indexed)
    task_id: UUID (FK to Task)
    series_id: UUID (nullable)
    payload: JSON  # Full CloudEvents data field
    published_at: datetime (UTC)
    processed_at: datetime (UTC, nullable)  # For tracking consumer lag
```

**Usage**: Audit trail, idempotency checking in consumers

### 4. Reminder (extends existing model)
Scheduled notification for a task.

```python
class Reminder:
    reminder_id: UUID (PK)
    task_id: UUID (FK to Task)
    user_id: str (indexed)
    scheduled_time: datetime (UTC)
    reminder_type: Enum["email", "push"]
    status: Enum["pending", "sent", "cancelled", "failed"]
    
    # NEW: Phase V field
    job_name: str (nullable)  # Dapr Jobs API job name for cancellation
    
    created_at: datetime (UTC)
    sent_at: datetime (UTC, nullable)
```

**Relationships**: Many-to-One with Task

---

## Migrations Required

### Migration 001: Add Recurring Fields to Tasks
```sql
ALTER TABLE tasks 
ADD COLUMN priority VARCHAR(20) DEFAULT 'MEDIUM',
ADD COLUMN tags TEXT[],
ADD COLUMN is_recurring BOOLEAN DEFAULT FALSE,
ADD COLUMN series_id UUID REFERENCES recurring_task_series(series_id),
ADD COLUMN recurrence_pattern TEXT,
ADD COLUMN next_occurrence TIMESTAMP;

CREATE INDEX idx_tasks_series ON tasks(series_id) WHERE series_id IS NOT NULL;
ALTER TABLE tasks ADD CONSTRAINT unique_series_due_date 
  UNIQUE (series_id, due_date) WHERE series_id IS NOT NULL;
```

### Migration 002: Create RecurringTaskSeries Table
```sql
CREATE TABLE recurring_task_series (
    series_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    base_task_template JSONB NOT NULL,
    recurrence_pattern TEXT NOT NULL,
    recurrence_start_date TIMESTAMP NOT NULL,
    recurrence_end_date TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_recurring_user ON recurring_task_series(user_id);
CREATE INDEX idx_recurring_active ON recurring_task_series(is_active) WHERE is_active = TRUE;
```

### Migration 003: Add job_name to Reminders
```sql
ALTER TABLE reminders ADD COLUMN job_name VARCHAR(255);
CREATE INDEX idx_reminders_job_name ON reminders(job_name) WHERE job_name IS NOT NULL;
```

---

**Status**: Data model complete. Ready for API contracts.
