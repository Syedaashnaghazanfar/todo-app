# Data Model: Skills & Subagents Architecture

**Feature**: Skills & Subagents Architecture Implementation
**Date**: 2025-12-16
**Status**: Complete

## Overview

This document defines all data entities, their properties, relationships, validation rules, and state transitions for the Skills & Subagents Architecture. All entities are stored client-side in localStorage with JSON serialization.

## Entity Definitions

### 1. Task Entity

**Purpose**: Represents a single todo item with auto-classification, tags, and temporal metadata.

**Storage Key**: `tasks` (array of Task objects in localStorage)

**Type Definition**:
```typescript
interface Task {
  // Identity
  id: string;                          // UUID v4, generated client-side

  // Core Properties
  title: string;                       // Required, 1-200 characters
  description?: string;                // Optional, max 2000 characters
  dueDate?: string;                    // Optional, ISO 8601 datetime (YYYY-MM-DDTHH:mm:ss.sssZ)

  // Classification (Auto-computed)
  priority: Priority;                  // VERY_IMPORTANT | HIGH | MEDIUM | LOW
  status: TaskStatus;                  // NOT_STARTED | IN_PROGRESS | COMPLETED

  // Organization
  tags: string[];                      // Array of tag names, max 5, from standard categories

  // Metadata
  createdAt: string;                   // ISO 8601 datetime, auto-generated
  updatedAt: string;                   // ISO 8601 datetime, auto-updated

  // Computed Fields (Not Persisted, Calculated at Runtime)
  isOverdue?: boolean;                 // Calculated: dueDate < now
  isUrgent?: boolean;                  // Calculated: dueDate within 6 hours
  isUpcoming?: boolean;                // Calculated: dueDate within 24 hours
  relativeTime?: string;               // Calculated: "in 2 hours", "3 days ago"
}

type Priority = 'VERY_IMPORTANT' | 'HIGH' | 'MEDIUM' | 'LOW';

type TaskStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
```

**Property Details**:

| Property | Type | Required | Validation | Default |
|----------|------|----------|------------|---------|
| id | string | Yes | UUID v4 format | crypto.randomUUID() |
| title | string | Yes | Length: 1-200 chars, non-empty | - |
| description | string | No | Max 2000 chars | undefined |
| dueDate | string | No | ISO 8601, future or past date | undefined |
| priority | Priority | Yes | Enum value | AUTO (via classifyPriority) |
| status | TaskStatus | Yes | Enum value | NOT_STARTED |
| tags | string[] | Yes | Max 5, from standard categories | [] |
| createdAt | string | Yes | ISO 8601 | new Date().toISOString() |
| updatedAt | string | Yes | ISO 8601 | new Date().toISOString() |

**Validation Rules**:

1. **title**: Must be non-empty after trimming whitespace
2. **title**: Maximum 200 characters
3. **description**: Maximum 2000 characters if provided
4. **dueDate**: Must be valid ISO 8601 datetime if provided
5. **tags**: Maximum 5 tags per task
6. **tags**: Each tag must be from standard categories (see Tag entity)
7. **tags**: No duplicate tags
8. **priority**: Auto-computed, cannot be manually set (see Priority Classification Rules)
9. **status**: Must be one of three enum values
10. **createdAt**: Immutable after creation
11. **updatedAt**: Auto-updated on any property change

**Priority Classification Rules** (implemented in lib/skills/priority-classification.ts):

```
IF (title contains urgency keyword) AND (dueDate within 6 hours OR no dueDate):
  THEN priority = VERY_IMPORTANT
ELSE IF dueDate within 6 hours:
  THEN priority = VERY_IMPORTANT
ELSE IF dueDate within 24 hours:
  THEN priority = HIGH
ELSE IF dueDate within 1 week:
  THEN priority = MEDIUM
ELSE:
  THEN priority = LOW

Urgency keywords: "urgent", "ASAP", "critical", "important", "emergency" (case-insensitive)
```

**State Transitions**:

```
Task Lifecycle:
  NOT_STARTED → IN_PROGRESS → COMPLETED
  NOT_STARTED → COMPLETED (skip IN_PROGRESS)
  IN_PROGRESS → NOT_STARTED (revert)
  COMPLETED → NOT_STARTED (reopen)
  COMPLETED → IN_PROGRESS (resume)

Valid transitions:
  - User can move between any status at any time
  - No automatic status transitions (manual only)
```

**Computed Fields** (calculated at runtime, not persisted):

- **isOverdue**: `dueDate && new Date(dueDate) < new Date()`
- **isUrgent**: `dueDate && (new Date(dueDate) - new Date()) < 6 * 60 * 60 * 1000`
- **isUpcoming**: `dueDate && (new Date(dueDate) - new Date()) < 24 * 60 * 60 * 1000`
- **relativeTime**: Calculated via `lib/utils/timeUtils.ts` (e.g., "in 2 hours", "3 days ago")

**Example**:
```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "title": "Urgent: Fix production bug",
  "description": "Critical bug affecting checkout flow",
  "dueDate": "2025-12-16T18:00:00.000Z",
  "priority": "VERY_IMPORTANT",
  "status": "IN_PROGRESS",
  "tags": ["Work", "Urgent"],
  "createdAt": "2025-12-16T10:00:00.000Z",
  "updatedAt": "2025-12-16T10:30:00.000Z"
}
```

---

### 2. Tag Entity

**Purpose**: Represents a standard category for task organization. Tags are predefined (not user-created).

**Storage**: Not persisted separately. Tag names are embedded in Task entity. Tag metadata (colors, descriptions) is hardcoded in `lib/utils/tagCategories.ts`.

**Type Definition**:
```typescript
interface Tag {
  name: TagCategory;                   // Enum of 7 standard categories
  color: string;                       // Hex color for visual display
  description: string;                 // Brief explanation of category usage
}

type TagCategory = 'Work' | 'Personal' | 'Shopping' | 'Health' | 'Finance' | 'Learning' | 'Urgent';
```

**Standard Tag Catalog**:

| Name | Color | Description |
|------|-------|-------------|
| Work | #3B82F6 (blue) | Work-related tasks, projects, meetings |
| Personal | #10B981 (green) | Personal life, hobbies, self-care |
| Shopping | #F59E0B (amber) | Errands, purchases, groceries |
| Health | #EF4444 (red) | Medical appointments, fitness, wellness |
| Finance | #8B5CF6 (purple) | Bills, budgeting, financial planning |
| Learning | #EC4899 (pink) | Education, courses, reading |
| Urgent | #DC2626 (dark red) | Time-sensitive tasks requiring immediate attention |

**Validation Rules**:

1. **name**: Must be one of 7 standard categories (enum)
2. **name**: Case-sensitive (e.g., "work" is invalid, "Work" is valid)
3. **Maximum 5 tags per task** (enforced in Task validation)
4. **No duplicate tags per task** (enforced in Task validation)

**Usage**:
- Tags are assigned to tasks via `Task.tags: string[]`
- Tag autocomplete shows all 7 standard categories
- User cannot create custom tags (spec requirement)

**Example**:
```typescript
// Hardcoded in lib/utils/tagCategories.ts
export const STANDARD_TAGS: Tag[] = [
  { name: 'Work', color: '#3B82F6', description: 'Work-related tasks, projects, meetings' },
  { name: 'Personal', color: '#10B981', description: 'Personal life, hobbies, self-care' },
  // ... remaining 5 categories
];
```

---

### 3. Notification Entity

**Purpose**: Represents a notification event triggered for VERY IMPORTANT tasks due within 6 hours.

**Storage Key**: `notifications` (array of Notification objects in localStorage)

**Type Definition**:
```typescript
interface Notification {
  // Identity
  id: string;                          // UUID v4, generated client-side
  taskId: string;                      // Foreign key reference to Task.id

  // Content
  message: string;                     // Notification text, e.g., "Task 'Fix bug' due in 2 hours"

  // Metadata
  timestamp: string;                   // ISO 8601 datetime, when notification was created
  read: boolean;                       // Whether user has marked as read
  priority: Priority;                  // Inherited from task for styling (VERY_IMPORTANT only)
}
```

**Property Details**:

| Property | Type | Required | Validation | Default |
|----------|------|----------|------------|---------|
| id | string | Yes | UUID v4 format | crypto.randomUUID() |
| taskId | string | Yes | Must reference existing Task.id | - |
| message | string | Yes | Max 500 characters | AUTO (generated from task) |
| timestamp | string | Yes | ISO 8601 | new Date().toISOString() |
| read | boolean | Yes | true or false | false |
| priority | Priority | Yes | Enum value | VERY_IMPORTANT |

**Validation Rules**:

1. **taskId**: Must reference an existing task (foreign key constraint)
2. **message**: Maximum 500 characters
3. **priority**: Always VERY_IMPORTANT (only VERY_IMPORTANT tasks trigger notifications per spec)
4. **timestamp**: Immutable after creation
5. **read**: Can be toggled by user (false → true only, no reset to false)

**Lifecycle Rules**:

1. **Creation**: Notification created when:
   - Task priority = VERY_IMPORTANT
   - Task status ≠ COMPLETED
   - Task due within 6 hours
   - No notification for this task in last 10 minutes (duplicate prevention)

2. **Deletion**: Notification deleted when:
   - Associated task is deleted (cascade delete)
   - Notification count exceeds 50 (delete oldest)

3. **Retention**: Maximum 50 notifications stored (FIFO queue)

**Message Format**:
```
Pattern: "Task '{taskTitle}' due {relativeTime}"
Examples:
  - "Task 'Fix production bug' due in 2 hours"
  - "Task 'Complete report' due in 30 minutes"
  - "Task 'Meeting with client' overdue by 1 hour"
```

**Example**:
```json
{
  "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
  "taskId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "message": "Task 'Urgent: Fix production bug' due in 2 hours",
  "timestamp": "2025-12-16T16:00:00.000Z",
  "read": false,
  "priority": "VERY_IMPORTANT"
}
```

---

### 4. FilterState Entity

**Purpose**: Represents active filter selections with cumulative AND logic.

**Storage Key**: `filterState` (single FilterState object in localStorage, managed by Zustand)

**Type Definition**:
```typescript
interface FilterState {
  // Filter Categories
  status: TaskStatus[];                // Selected status values (multi-select)
  priority: Priority[];                // Selected priority values (multi-select)
  dueDate: DueDateFilter[];            // Selected due date ranges (multi-select)
}

type DueDateFilter = 'overdue' | 'today' | 'this_week' | 'this_month' | 'no_due_date';
```

**Property Details**:

| Property | Type | Required | Validation | Default |
|----------|------|----------|------------|---------|
| status | TaskStatus[] | Yes | Array of enum values | [] (no filter) |
| priority | Priority[] | Yes | Array of enum values | [] (no filter) |
| dueDate | DueDateFilter[] | Yes | Array of enum values | [] (no filter) |

**Validation Rules**:

1. **status**: Can contain 0-3 values (NOT_STARTED, IN_PROGRESS, COMPLETED)
2. **priority**: Can contain 0-4 values (VERY_IMPORTANT, HIGH, MEDIUM, LOW)
3. **dueDate**: Can contain 0-5 values (overdue, today, this_week, this_month, no_due_date)
4. **No duplicate values** within each array
5. **Empty arrays** = no filter applied for that category

**Filter Logic** (cumulative AND):

```
filteredTasks = tasks.filter(task => {
  // Status filter (OR within category)
  if (filterState.status.length > 0) {
    if (!filterState.status.includes(task.status)) return false;
  }

  // Priority filter (OR within category)
  if (filterState.priority.length > 0) {
    if (!filterState.priority.includes(task.priority)) return false;
  }

  // Due Date filter (OR within category)
  if (filterState.dueDate.length > 0) {
    const matchesDueDate = filterState.dueDate.some(filter => {
      // Implementation in lib/skills/task-filter.ts
    });
    if (!matchesDueDate) return false;
  }

  return true; // Passes all filters (AND logic)
});
```

**Due Date Filter Definitions**:

| Filter | Condition |
|--------|-----------|
| overdue | dueDate < now |
| today | dueDate within today (00:00 to 23:59) |
| this_week | dueDate within next 7 days from now |
| this_month | dueDate within current calendar month |
| no_due_date | dueDate === undefined or null |

**Example**:
```json
{
  "status": ["IN_PROGRESS"],
  "priority": ["VERY_IMPORTANT", "HIGH"],
  "dueDate": ["today", "overdue"]
}
```
*Interpretation*: Show tasks that are IN_PROGRESS AND (VERY_IMPORTANT OR HIGH) AND (due today OR overdue)

---

### 5. SortState Entity

**Purpose**: Represents active sort configuration with tie-breaking rules.

**Storage Key**: `sortState` (single SortState object in localStorage, managed by Zustand)

**Type Definition**:
```typescript
interface SortState {
  field: SortField;                    // Sort field (Priority, Due Date, Created Date, Alphabetical)
  direction: SortDirection;            // Ascending or descending
}

type SortField = 'priority' | 'dueDate' | 'createdDate' | 'alphabetical';
type SortDirection = 'asc' | 'desc';
```

**Property Details**:

| Property | Type | Required | Validation | Default |
|----------|------|----------|------------|---------|
| field | SortField | Yes | Enum value | 'priority' |
| direction | SortDirection | Yes | Enum value | 'desc' |

**Default Sort**: Priority descending (VERY_IMPORTANT first)

**Sort Field Definitions**:

| Field | Primary Sort | Tie-Breaker 1 | Tie-Breaker 2 | Tie-Breaker 3 |
|-------|--------------|---------------|---------------|---------------|
| priority | Priority | Due Date (asc) | Created Date (desc) | Title (asc) |
| dueDate | Due Date | Priority (desc) | Created Date (desc) | Title (asc) |
| createdDate | Created Date | Priority (desc) | Due Date (asc) | Title (asc) |
| alphabetical | Title | Priority (desc) | Due Date (asc) | Created Date (desc) |

**Priority Order** (descending):
1. VERY_IMPORTANT
2. HIGH
3. MEDIUM
4. LOW

**Null Handling**:
- Tasks without due dates sort last in ascending order, first in descending order
- Tasks without descriptions sort as empty strings

**Example**:
```json
{
  "field": "priority",
  "direction": "desc"
}
```
*Interpretation*: Sort by Priority (VERY_IMPORTANT first), tie-break by Due Date (soonest first), then Created Date (newest first), then Title (A-Z)

---

## Entity Relationships

### Task ↔ Notification (One-to-Many)

- **Relationship**: One Task can have multiple Notifications
- **Foreign Key**: Notification.taskId → Task.id
- **Cascade Delete**: When Task is deleted, all associated Notifications are deleted
- **Referential Integrity**: Notification.taskId must reference existing Task.id

### Task ↔ Tag (Many-to-Many via Embedded Array)

- **Relationship**: One Task can have up to 5 Tags, one Tag can be on many Tasks
- **Implementation**: Tags embedded as string array in Task.tags
- **No Join Table**: Tags are not separate entities, just references to standard categories

### FilterState ↔ Task (Filtering Operation)

- **Relationship**: FilterState defines criteria for selecting Tasks
- **Operation**: Filtering is computed at runtime, not persisted
- **No Foreign Keys**: FilterState contains enum values, not Task IDs

### SortState ↔ Task (Sorting Operation)

- **Relationship**: SortState defines order for displaying Tasks
- **Operation**: Sorting is computed at runtime, not persisted
- **No Foreign Keys**: SortState contains field name and direction

---

## Data Access Patterns

### Create Task
```typescript
const newTask: Task = {
  id: crypto.randomUUID(),
  title: 'Complete project report',
  description: 'Final report for Q4 project',
  dueDate: '2025-12-20T17:00:00.000Z',
  priority: classifyPriority({ title: 'Complete project report', dueDate: '2025-12-20T17:00:00.000Z' }),
  status: 'NOT_STARTED',
  tags: ['Work'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// Persist to localStorage
const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
tasks.push(newTask);
localStorage.setItem('tasks', JSON.stringify(tasks));
```

### Read Tasks (with Filtering and Sorting)
```typescript
// Load from localStorage
const tasks: Task[] = JSON.parse(localStorage.getItem('tasks') || '[]');
const filterState: FilterState = JSON.parse(localStorage.getItem('filterState') || '{"status":[],"priority":[],"dueDate":[]}');
const sortState: SortState = JSON.parse(localStorage.getItem('sortState') || '{"field":"priority","direction":"desc"}');

// Apply filters
const filteredTasks = filterTasks(tasks, filterState); // lib/skills/task-filter.ts

// Apply sort
const sortedTasks = sortTasks(filteredTasks, sortState); // lib/skills/task-sorting.ts

// Compute runtime fields
const enrichedTasks = sortedTasks.map(task => ({
  ...task,
  isOverdue: task.dueDate && new Date(task.dueDate) < new Date(),
  isUrgent: task.dueDate && (new Date(task.dueDate) - new Date()) < 6 * 60 * 60 * 1000,
  relativeTime: formatRelativeTime(task.dueDate), // lib/utils/timeUtils.ts
}));
```

### Update Task
```typescript
const tasks: Task[] = JSON.parse(localStorage.getItem('tasks') || '[]');
const taskIndex = tasks.findIndex(t => t.id === taskId);

if (taskIndex !== -1) {
  tasks[taskIndex] = {
    ...tasks[taskIndex],
    ...updates,
    updatedAt: new Date().toISOString(),
    priority: classifyPriority({ ...tasks[taskIndex], ...updates }), // Recompute priority
  };

  localStorage.setItem('tasks', JSON.stringify(tasks));
}
```

### Delete Task (with Cascade Delete of Notifications)
```typescript
// Delete task
const tasks: Task[] = JSON.parse(localStorage.getItem('tasks') || '[]');
const updatedTasks = tasks.filter(t => t.id !== taskId);
localStorage.setItem('tasks', JSON.stringify(updatedTasks));

// Cascade delete notifications
const notifications: Notification[] = JSON.parse(localStorage.getItem('notifications') || '[]');
const updatedNotifications = notifications.filter(n => n.taskId !== taskId);
localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
```

### Create Notification (with Duplicate Prevention)
```typescript
// In-memory tracking (not persisted)
const notificationTracking = new Map<string, number>(); // taskId → lastTriggered timestamp

function triggerNotification(task: Task): void {
  const now = Date.now();
  const lastTriggered = notificationTracking.get(task.id) || 0;

  // Duplicate prevention: 10-minute window
  if (now - lastTriggered < 10 * 60 * 1000) {
    return; // Skip notification (triggered recently)
  }

  // Create notification
  const notification: Notification = {
    id: crypto.randomUUID(),
    taskId: task.id,
    message: `Task '${task.title}' due ${formatRelativeTime(task.dueDate)}`,
    timestamp: new Date().toISOString(),
    read: false,
    priority: 'VERY_IMPORTANT',
  };

  // Persist notification
  const notifications: Notification[] = JSON.parse(localStorage.getItem('notifications') || '[]');
  notifications.push(notification);

  // Enforce 50-notification limit (FIFO)
  if (notifications.length > 50) {
    notifications.shift(); // Remove oldest
  }

  localStorage.setItem('notifications', JSON.stringify(notifications));

  // Update tracking
  notificationTracking.set(task.id, now);
}
```

---

## Data Migration & Versioning

**Current Version**: 1.0 (initial implementation)

**Future Considerations**:
- If data model changes, implement versioning in localStorage keys: `tasks_v1`, `tasks_v2`
- Include migration logic in app initialization: detect version, migrate data, update version
- Example: `if (localStorage.getItem('tasks') && !localStorage.getItem('tasks_v1')) { migrate() }`

**No Migration Required for Initial Release**: All entities defined in v1.

---

## Summary

- **5 Entities**: Task, Tag, Notification, FilterState, SortState
- **3 Persisted Entities**: Task, Notification, FilterState, SortState (localStorage)
- **2 Non-Persisted**: Tag (hardcoded constants), Computed Task fields (runtime)
- **1 Foreign Key**: Notification.taskId → Task.id
- **Cascade Delete**: Task deletion → Notification deletion
- **Auto-Classification**: Task priority computed on create/update
- **Validation**: 12 rules for Task, 4 for Tag usage, 5 for Notification, 5 for FilterState, 2 for SortState
- **Performance**: All operations O(n) or better, suitable for 1000 tasks
