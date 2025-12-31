# Quick Start Guide: Skills & Subagents Architecture

**Feature**: Skills & Subagents Architecture Implementation
**Date**: 2025-12-16
**Target Audience**: Developers implementing or contributing to this feature

## Overview

This guide provides everything needed to get started with the Skills & Subagents Architecture implementation, including setup, architecture overview, key concepts, and common workflows.

## Prerequisites

### Required Software
- **Node.js 20.x**: For Next.js 16 compatibility
- **npm or yarn**: Package manager
- **Git**: Version control
- **Modern browser**: Chrome, Firefox, Safari, or Edge (last 3 years)

### Required Knowledge
- TypeScript basics (types, interfaces, enums)
- React 19 (hooks, components, JSX)
- Next.js 16 App Router (app directory, server/client components)
- TailwindCSS utility classes
- localStorage API basics

### Optional Knowledge (Helpful)
- Zustand state management
- Jest + React Testing Library
- Framer Motion animations
- Recharts visualizations

## Project Structure

```
frontend/todo-app/
├── app/                          # Next.js App Router pages
│   ├── tasks/                    # Task management pages
│   ├── notifications/            # Notification history page
│   └── layout.tsx                # Root layout (add notification bell)
├── components/                   # React components
│   ├── tasks/                    # Task-related components
│   ├── notifications/            # Notification components
│   └── ui/                       # Shared UI components (shadcn/ui)
├── lib/                          # Business logic and utilities
│   ├── skills/                   # 9 skill engines (pure functions)
│   └── storage/                  # localStorage abstraction
├── hooks/                        # React hooks (state + side effects)
├── types/                        # TypeScript type definitions
├── utils/                        # Helper functions
└── tests/                        # Test files (unit, component, integration)

specs/007-skills-subagents-architecture/
├── spec.md                       # Feature requirements (WHAT)
├── plan.md                       # Implementation plan (HOW)
├── data-model.md                 # Entity definitions
├── contracts/                    # JSON schemas
│   ├── task.schema.json
│   ├── notification.schema.json
│   ├── filter-state.schema.json
│   └── sort-state.schema.json
└── quickstart.md                 # This file (getting started)
```

## Installation

### 1. Clone Repository and Checkout Branch
```bash
git fetch --all
git checkout 007-skills-subagents-architecture
```

### 2. Install Dependencies
```bash
cd frontend/todo-app
npm install
```

### 3. Verify Installation
```bash
# Check all required dependencies are present
npm list react next typescript tailwindcss lucide-react framer-motion zustand

# Expected output: All dependencies listed without errors
```

### 4. Run Development Server
```bash
npm run dev

# Server should start on http://localhost:3000
```

### 5. Run Tests (Optional)
```bash
npm test                # Run all tests
npm run test:watch      # Run tests in watch mode
npm run test:coverage   # Generate coverage report
```

## Architecture Overview

### Multi-Agent Architecture

This feature follows the Phase-2 Master Agent Constitution with 4 specialized subagents:

| Subagent | Responsibility | Components |
|----------|----------------|------------|
| **task-organization-agent** | Task CRUD, search, filter, sort, tags | TaskList, TaskForm, SearchBar, FilterPanel, SortControls |
| **task-intelligence-agent** | Temporal evaluation, notification triggering | useTemporalEvaluation, useNotificationTrigger, temporal-evaluation.ts, notification-trigger.ts |
| **notification-experience-agent** | Notification UI, storage, management | NotificationBell, NotificationDropdown, notification-persistence.ts |
| **frontend-experience-agent** | Visual consistency, purple theme, design system | PriorityBadge, TagChip, RelativeTime, animations |

### Skill Architecture

9 specialized skill engines (pure TypeScript functions) implement core business logic:

1. **priority-classification.ts**: Classify tasks into 4 priority levels (VERY_IMPORTANT, HIGH, MEDIUM, LOW)
2. **task-tagging.ts**: Validate tag assignments (max 5, no duplicates, standard categories only)
3. **task-search.ts**: Search tasks with relevance ranking (title > description > tags)
4. **task-filter.ts**: Filter tasks with cumulative AND logic
5. **task-sorting.ts**: Sort tasks with tie-breaking rules
6. **temporal-evaluation.ts**: Detect overdue/urgent tasks, format relative time
7. **notification-trigger.ts**: Trigger notifications for VERY IMPORTANT tasks
8. **notification-persistence.ts**: Store notifications in localStorage (50-item limit)
9. **notification-ui.ts**: Notification UI utilities (bell icon, dropdown, badge)

### Data Flow

```
User Action → React Component → Custom Hook → Skill Engine → localStorage
                                      ↓
                                  Zustand Store (state management)
                                      ↓
                                React Re-render
```

**Example: Creating a Task**
1. User fills TaskForm component
2. Component calls `useTasks().createTask(data)`
3. Hook calls `classifyPriority(data)` skill engine
4. Hook saves to localStorage via `useTaskStore`
5. Zustand triggers re-render with updated tasks
6. TaskList component displays new task

## Key Concepts

### 1. Priority Classification

Tasks are automatically classified into 4 levels based on due date and urgency keywords:

| Priority | Trigger Conditions |
|----------|-------------------|
| VERY_IMPORTANT | Due within 6 hours OR contains urgency keyword ("urgent", "ASAP", "critical") |
| HIGH | Due within 24 hours |
| MEDIUM | Due within 1 week |
| LOW | Due beyond 1 week OR no due date |

**Keywords**: "urgent", "ASAP", "critical", "important", "emergency" (case-insensitive)

**Implementation**: `lib/skills/priority-classification.ts`

### 2. Tag System

Tasks can have up to 5 tags from 7 standard categories:

| Category | Color | Usage |
|----------|-------|-------|
| Work | Blue (#3B82F6) | Work-related tasks |
| Personal | Green (#10B981) | Personal life |
| Shopping | Amber (#F59E0B) | Errands, purchases |
| Health | Red (#EF4444) | Medical, fitness |
| Finance | Purple (#8B5CF6) | Bills, budgeting |
| Learning | Pink (#EC4899) | Education |
| Urgent | Dark Red (#DC2626) | Time-sensitive |

**Validation**: Max 5 tags, no duplicates, standard categories only

**Implementation**: `lib/skills/task-tagging.ts`, `lib/utils/tagCategories.ts`

### 3. Search with Relevance Ranking

Search ranks results by relevance:
1. **Title matches** (highest relevance)
2. **Description matches** (medium relevance)
3. **Tag matches** (lowest relevance)

**Features**:
- Case-insensitive
- 300ms debounce (prevents excessive re-renders)
- Top 50 results (performance optimization)
- Highlighted matching text

**Implementation**: `lib/skills/task-search.ts`, `hooks/useSearch.ts`

### 4. Cumulative AND Filter Logic

Multiple filters apply cumulatively (AND logic):

**Example**: Status=IN_PROGRESS AND Priority=HIGH
- Shows tasks that are both IN_PROGRESS **and** HIGH priority
- Excludes tasks that are IN_PROGRESS but MEDIUM priority
- Excludes tasks that are COMPLETED but HIGH priority

**Filter Types**:
- **Status**: NOT_STARTED, IN_PROGRESS, COMPLETED
- **Priority**: VERY_IMPORTANT, HIGH, MEDIUM, LOW
- **Due Date**: overdue, today, this_week, this_month, no_due_date

**Implementation**: `lib/skills/task-filter.ts`, `hooks/useFilters.ts`

### 5. Temporal Evaluation Loop

Every 60 seconds, the system:
1. Evaluates all tasks for overdue/urgent status
2. Recalculates relative time displays ("in 2 hours", "3 days ago")
3. Triggers notifications for VERY IMPORTANT tasks due within 6 hours
4. Prevents duplicate notifications (10-minute window)

**Implementation**: `hooks/useTemporalEvaluation.ts`, `lib/skills/temporal-evaluation.ts`

**Note**: Evaluation pauses when browser tab is inactive (expected behavior per spec)

### 6. Notification System

Notifications trigger for VERY IMPORTANT tasks due within 6 hours:

**Trigger Rules**:
- Task priority = VERY_IMPORTANT
- Task status ≠ COMPLETED
- Task due within 6 hours
- No notification sent in last 10 minutes (duplicate prevention)

**Notification Flow**:
1. Temporal evaluation detects qualifying task
2. Notification triggered (stored in localStorage)
3. Bell icon displays unread count badge
4. Notification repeats every 10 minutes
5. User completes task → notifications stop

**Storage**: Maximum 50 notifications (FIFO queue)

**Implementation**: `lib/skills/notification-trigger.ts`, `lib/skills/notification-persistence.ts`

## Common Workflows

### Workflow 1: Create a New Task

```typescript
// In TaskForm component
import { useTaskStore } from '@/stores/taskStore';
import { classifyPriority } from '@/lib/skills/priority-classification';

function handleSubmit(formData) {
  const newTask = {
    id: crypto.randomUUID(),
    title: formData.title,
    description: formData.description,
    dueDate: formData.dueDate,
    priority: classifyPriority({
      title: formData.title,
      dueDate: formData.dueDate
    }),
    status: 'NOT_STARTED',
    tags: formData.tags,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  useTaskStore.getState().addTask(newTask);
}
```

### Workflow 2: Search Tasks

```typescript
// In TaskList component
import { useSearch } from '@/hooks/useSearch';
import { searchTasks } from '@/lib/skills/task-search';

function TaskList() {
  const tasks = useTaskStore((state) => state.tasks);
  const [searchQuery, setSearchQuery] = useSearch('', 300); // 300ms debounce

  const filteredTasks = searchQuery
    ? searchTasks(tasks, searchQuery)
    : tasks;

  return (
    <div>
      <SearchBar value={searchQuery} onChange={setSearchQuery} />
      {filteredTasks.map(task => <TaskItem key={task.id} task={task} />)}
    </div>
  );
}
```

### Workflow 3: Apply Filters

```typescript
// In FilterPanel component
import { useFilterStore } from '@/stores/filterStore';
import { filterTasks } from '@/lib/skills/task-filter';

function FilterPanel() {
  const tasks = useTaskStore((state) => state.tasks);
  const filterState = useFilterStore((state) => state);

  const filteredTasks = filterTasks(tasks, filterState);

  // User toggles filter
  const toggleStatusFilter = (status) => {
    useFilterStore.getState().toggleStatus(status);
  };

  return (
    <div>
      <button onClick={() => toggleStatusFilter('IN_PROGRESS')}>
        In Progress
      </button>
      {/* ... other filter controls */}
    </div>
  );
}
```

### Workflow 4: Trigger Temporal Evaluation

```typescript
// In app layout or root component
import { useTemporalEvaluation } from '@/hooks/useTemporalEvaluation';

function RootLayout() {
  useTemporalEvaluation(); // Starts 60-second loop

  return <>{children}</>;
}

// Hook implementation
function useTemporalEvaluation() {
  const tasks = useTaskStore((state) => state.tasks);

  useEffect(() => {
    const intervalId = setInterval(() => {
      tasks.forEach(task => {
        evaluateTask(task); // lib/skills/temporal-evaluation.ts
        if (shouldTriggerNotification(task)) {
          triggerNotification(task); // lib/skills/notification-trigger.ts
        }
      });
    }, 60000); // 60 seconds

    return () => clearInterval(intervalId);
  }, [tasks]);
}
```

### Workflow 5: Display Notifications

```typescript
// In NotificationBell component
import { useNotificationStore } from '@/stores/notificationStore';

function NotificationBell() {
  const notifications = useNotificationStore((state) => state.notifications);
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative">
      <Bell size={24} />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </div>
  );
}
```

## Testing Strategy

### Unit Tests (Skills)

Test pure functions in `lib/skills/`:

```typescript
// tests/skills/priority-classification.test.ts
import { classifyPriority } from '@/lib/skills/priority-classification';

describe('classifyPriority', () => {
  it('classifies urgent keyword + 6-hour deadline as VERY_IMPORTANT', () => {
    const task = {
      title: 'Urgent: Fix bug',
      dueDate: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(), // 5 hours from now
    };
    expect(classifyPriority(task)).toBe('VERY_IMPORTANT');
  });

  it('classifies no due date as LOW', () => {
    const task = { title: 'Buy groceries', dueDate: undefined };
    expect(classifyPriority(task)).toBe('LOW');
  });
});
```

### Component Tests

Test React components with React Testing Library:

```typescript
// tests/components/TaskList.test.tsx
import { render, screen } from '@testing-library/react';
import TaskList from '@/components/tasks/TaskList';

describe('TaskList', () => {
  it('renders tasks with correct priority badges', () => {
    const tasks = [
      { id: '1', title: 'Urgent task', priority: 'VERY_IMPORTANT', /* ... */ },
      { id: '2', title: 'Regular task', priority: 'LOW', /* ... */ },
    ];

    render(<TaskList tasks={tasks} />);

    expect(screen.getByText('Urgent task')).toBeInTheDocument();
    expect(screen.getByText('VERY_IMPORTANT')).toHaveClass('bg-purple-500');
  });
});
```

### Integration Tests

Test end-to-end workflows:

```typescript
// tests/integration/task-lifecycle.test.ts
test('create VERY_IMPORTANT task → triggers notification', async () => {
  // 1. Create task with "urgent" keyword + 5-hour deadline
  const task = createTask({
    title: 'Urgent: Deploy fix',
    dueDate: fiveHoursFromNow,
  });

  // 2. Verify priority classification
  expect(task.priority).toBe('VERY_IMPORTANT');

  // 3. Wait for temporal evaluation (mock 60-second interval)
  jest.advanceTimersByTime(60000);

  // 4. Verify notification triggered
  const notifications = getNotifications();
  expect(notifications).toHaveLength(1);
  expect(notifications[0].message).toContain('Urgent: Deploy fix');
});
```

## Design System Compliance

### Priority Badge Specifications

| Property | Value |
|----------|-------|
| Border radius | 4px (`rounded`) |
| Padding | 2px 8px (`px-2 py-0.5`) |
| Font weight | 600 (`font-semibold`) |
| Font size | 12px (`text-xs`) |

**Colors**:
- VERY_IMPORTANT: #8B5CF6 (purple-500)
- HIGH: #EF4444 (red-500)
- MEDIUM: #F59E0B (yellow-500)
- LOW: #6B7280 (gray-500)

### Tag Chip Specifications

| Property | Value |
|----------|-------|
| Border radius | 16px (`rounded-2xl`) |
| Background | Subtle category-specific color |
| Text color | Contrasting color |

### Notification Bell

| Property | Value |
|----------|-------|
| Icon size | 24px (`size-6`) |
| Badge | Circular, red background, white text |
| Animation | 2-second purple glow pulse on new notification |

## Troubleshooting

### Issue: localStorage Quota Exceeded

**Symptoms**: Tasks fail to save, console shows `QuotaExceededError`

**Solutions**:
1. Check localStorage usage: Chrome DevTools → Application → Storage
2. Clear completed tasks: Use "Clear completed" button in UI
3. Reduce task count below 1000

### Issue: Temporal Evaluation Not Running

**Symptoms**: Notifications not triggering, relative time not updating

**Solutions**:
1. Check browser tab is active (setInterval pauses when inactive)
2. Verify `useTemporalEvaluation` hook is mounted in root component
3. Check console for JavaScript errors blocking execution

### Issue: Search Performance Slow

**Symptoms**: Search takes >300ms, UI feels sluggish

**Solutions**:
1. Verify debounce is working (300ms delay)
2. Check task count (should be <1000 for spec compliance)
3. Profile with Chrome DevTools Performance tab
4. Consider reducing top-N limit from 50 to 25

### Issue: Filters Not Working

**Symptoms**: Tasks not filtered correctly, unexpected results

**Solutions**:
1. Verify cumulative AND logic (all filters must match)
2. Check filter state in Zustand DevTools
3. Ensure filter chips are displayed (indicates active filters)
4. Clear all filters and re-apply one at a time

## Performance Optimization Tips

1. **Debounce inputs**: Always use 300ms debounce for search
2. **Memoize expensive computations**: Use `useMemo` for filtered/sorted lists
3. **Lazy load components**: Use `React.lazy()` for routes
4. **Optimize re-renders**: Use `React.memo()` for TaskItem components
5. **Profile regularly**: Use Chrome DevTools to identify bottlenecks

## Additional Resources

- **Spec**: [spec.md](./spec.md) - Feature requirements and success criteria
- **Plan**: [plan.md](./plan.md) - Architecture decisions and implementation strategy
- **Data Model**: [data-model.md](./data-model.md) - Entity definitions and schemas
- **Contracts**: [contracts/](./contracts/) - JSON schemas for validation
- **Constitution**: [.specify/memory/constitution.md](../../.specify/memory/constitution.md) - Project principles

## Next Steps

1. Read the full [spec.md](./spec.md) to understand requirements
2. Review [plan.md](./plan.md) architecture decisions
3. Study [data-model.md](./data-model.md) entity definitions
4. Run `/sp.tasks` to generate implementation task breakdown
5. Start implementing Phase 1: Core Task Management

## Support

For questions or issues:
1. Check troubleshooting section above
2. Review architecture decisions in [plan.md](./plan.md)
3. Consult [data-model.md](./data-model.md) for data structure questions
4. Create an issue in the project repository
