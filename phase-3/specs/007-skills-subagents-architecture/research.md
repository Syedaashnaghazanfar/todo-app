# Research & Design Decisions: Skills & Subagents Architecture

**Feature**: Skills & Subagents Architecture Implementation
**Date**: 2025-12-16
**Status**: Complete

## Overview

This document consolidates research findings and design decisions for implementing the Skills & Subagents Architecture. All architecture decisions have been documented in [plan.md](./plan.md) in the "Architecture Decisions" section. This research phase identified no external unknowns requiring investigation, as all technologies are already present in the project.

## Technology Stack Analysis

### Frontend Technologies (Existing)
- **React 19.2.1**: Latest stable version, already in use
- **Next.js 16.0.10**: App Router architecture, server components support
- **TypeScript 5.x**: Strict mode enabled for type safety
- **TailwindCSS 4.x**: Utility-first CSS framework per constitution
- **Lucide React 0.556.0**: Icon library per constitution
- **Framer Motion 12.23.26**: Animation library for transitions
- **Zustand 5.0.9**: Lightweight state management with localStorage middleware
- **Jest 30.2.0 + React Testing Library 16.3.0**: Testing infrastructure

### Backend Technologies (Existing, Not Modified)
- **FastAPI 0.124.0**: Python async web framework
- **PostgreSQL (Neon)**: Serverless Postgres database
- **SQLAlchemy + Alembic**: ORM and migrations

**Decision**: Use existing technologies exclusively. No new dependencies required.

## Storage Strategy Research

### localStorage API Analysis

**Capacity**:
- Minimum quota: 5MB (most browsers)
- Chrome/Edge: 10MB
- Firefox: 10MB
- Safari: 5MB

**Estimated Data Size**:
- Task entity: ~500 bytes (with title, description, tags, timestamps)
- 1000 tasks: ~500KB
- Notification entity: ~200 bytes
- 50 notifications: ~10KB
- **Total estimated**: ~510KB for maximum capacity (1000 tasks + 50 notifications)

**Conclusion**: localStorage is sufficient for requirements. Risk of quota exceeded is low.

### Browser Compatibility

| Browser | Min Version | localStorage Support | setInterval Support | ES2019+ Support |
|---------|-------------|----------------------|---------------------|-----------------|
| Chrome | 4+ | ✅ | ✅ | ✅ (v73+) |
| Firefox | 3.5+ | ✅ | ✅ | ✅ (v67+) |
| Safari | 4+ | ✅ | ✅ | ✅ (v12.1+) |
| Edge | 12+ | ✅ | ✅ | ✅ (v79+) |

**Conclusion**: Target modern browsers (last 3 years). ES2019 stable sort guaranteed.

## Performance Considerations

### Search Complexity Analysis

**Algorithm**: O(n × m) where n = tasks, m = search terms
- 1000 tasks × 3 search terms = 3000 operations
- With early exit at 50 matches: ~50-500 operations average case
- Estimated time: <100ms on modern browsers

**Optimization Strategies**:
- Debounce input (300ms) to reduce unnecessary searches
- Limit results to top 50 for rendering performance
- Use memoization for repeated searches
- Cache lowercase conversions

**Conclusion**: Custom search algorithm meets <300ms requirement.

### Filter Performance Analysis

**Algorithm**: O(n × f) where n = tasks, f = active filters
- 500 tasks × 3 filters = 1500 operations
- Each filter is simple boolean check: O(1)
- Estimated time: <50ms on modern browsers

**Optimization Strategies**:
- Chain Array.filter for readability
- Short-circuit evaluation (if first filter fails, skip remaining)
- Use Zustand for automatic re-render optimization

**Conclusion**: Array.filter chaining meets <100ms requirement.

### Sort Performance Analysis

**Algorithm**: O(n log n) with 4-level comparator
- 500 tasks: ~4500 comparisons (log2(500) ≈ 9, 500 × 9 = 4500)
- Each comparison: 4 levels max (Priority → Due Date → Created → Title)
- Estimated time: <20ms on modern browsers

**Optimization Strategies**:
- Use native Array.sort (highly optimized)
- Minimize comparator complexity (inline checks)
- Cache sort results until state changes

**Conclusion**: Array.sort with multi-level comparator meets <100ms requirement.

### Temporal Evaluation Performance Analysis

**Algorithm**: O(n) where n = tasks
- 1000 tasks: 1000 date comparisons + priority recalculations
- Each iteration: Date.now() comparison (O(1)) + classification logic (O(1))
- Estimated time: <1 second on modern browsers

**Optimization Strategies**:
- Cache Date.now() at loop start (single call)
- Skip evaluation for tasks without due dates
- Use requestIdleCallback for non-critical operations
- Profile with 1000-task dataset before deployment

**Conclusion**: setInterval every 60 seconds is feasible. Target <5 seconds per cycle.

## Design Pattern Research

### Skill Architecture Patterns

**Pattern Evaluated**: Pure functional modules vs class-based architecture

**Decision**: Pure TypeScript modules in `lib/skills/`

**Rationale**:
- Skills are stateless, deterministic algorithms
- Pure functions are easy to test (no mocks, no setup)
- Functional composition aligns with React hooks
- Clear separation: business logic (skills) vs UI (components)

**Example Structure**:
```typescript
// lib/skills/priority-classification.ts
export type Priority = 'VERY_IMPORTANT' | 'HIGH' | 'MEDIUM' | 'LOW';

export function classifyPriority(task: Task): Priority {
  // Pure function: deterministic output based on input
  if (hasUrgentKeyword(task.title) || isDueWithin6Hours(task.dueDate)) {
    return 'VERY_IMPORTANT';
  }
  // ... remaining logic
}
```

**Alternatives Rejected**:
- Classes: Unnecessary state management overhead
- React hooks with logic: Mixing concerns, hard to test
- State machines: Overkill for simple algorithms

### State Management Patterns

**Pattern Evaluated**: Zustand vs Context API vs Redux

**Decision**: Zustand with localStorage middleware

**Rationale**:
- Already in project (package.json)
- Simple API: `const tasks = useTaskStore((state) => state.tasks)`
- Built-in localStorage persistence middleware
- No Provider hell (Context API)
- Lighter than Redux (no actions, reducers, thunks)

**Example Structure**:
```typescript
// stores/taskStore.ts
import create from 'zustand';
import { persist } from 'zustand/middleware';

export const useTaskStore = create(
  persist(
    (set) => ({
      tasks: [],
      addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
    }),
    { name: 'tasks' } // localStorage key
  )
);
```

**Alternatives Rejected**:
- Context API: Performance issues with large state (1000 tasks)
- Redux: Overkill for simple CRUD operations

### Notification Trigger Patterns

**Pattern Evaluated**: setInterval vs Web Workers vs Polling

**Decision**: setInterval in React useEffect with cleanup

**Rationale**:
- Spec requires 60-second evaluation (FR-025)
- setInterval is simple, reliable, well-supported
- React useEffect cleanup prevents memory leaks
- No need for background threads (Web Workers)

**Example Structure**:
```typescript
// hooks/useTemporalEvaluation.ts
export function useTemporalEvaluation() {
  useEffect(() => {
    const intervalId = setInterval(() => {
      evaluateAllTasks();
    }, 60000); // 60 seconds

    return () => clearInterval(intervalId); // Cleanup
  }, []);
}
```

**Alternatives Rejected**:
- Web Workers: Added complexity, overkill for simple timer
- Polling: Same as setInterval but less clear intent
- requestAnimationFrame: Wrong use case (designed for 60fps animations)

## Risk Mitigation Research

### localStorage Quota Handling

**Problem**: Users may exceed 5-10MB quota with 1000+ tasks.

**Research Findings**:
- QuotaExceededError thrown on localStorage.setItem
- Most browsers provide no API to query available quota
- Chrome DevTools shows storage usage (Application → Storage)

**Mitigation Strategy**:
```typescript
try {
  localStorage.setItem(key, JSON.stringify(data));
} catch (e) {
  if (e.name === 'QuotaExceededError') {
    // Warn user, offer cleanup options
    alertUser('Storage almost full. Clear completed tasks?');
  }
}
```

**Additional Safeguards**:
- Monitor storage usage (estimate size of serialized data)
- Warn at 80% capacity (estimated 4MB)
- Provide "Clear completed tasks" action
- Document requirements in quickstart.md

### Temporal Evaluation Performance

**Problem**: Evaluation with 1000 tasks may block UI.

**Research Findings**:
- Date comparisons are O(1) but 1000× may accumulate
- Priority classification involves string matching (keywords)
- Notification triggering involves Map lookups (O(1))

**Mitigation Strategy**:
```typescript
// Use requestIdleCallback for non-critical work
requestIdleCallback(() => {
  tasks.forEach(task => {
    updateRelativeTime(task); // Non-critical UI update
  });
});

// Critical work runs immediately
tasks.forEach(task => {
  if (shouldTriggerNotification(task)) {
    triggerNotification(task); // Critical: user expects timely alerts
  }
});
```

**Performance Testing Plan**:
- Create 1000-task dataset with realistic data
- Profile temporal evaluation with Chrome DevTools
- Measure FPS during evaluation (should stay at 60fps)
- Test on low-end devices (older laptops, tablets)

### Notification Spam Prevention

**Problem**: 10+ VERY IMPORTANT tasks → 10 notifications every 10 minutes.

**Research Findings**:
- Users find >5 notifications in quick succession annoying
- Grouping notifications improves UX (e.g., "5 tasks due soon")
- Spec requires individual notifications (no grouping mentioned)

**Mitigation Strategy** (Phase 2 enhancement):
- Implement grouped notifications: "5 tasks due in next 6 hours (view all)"
- Add "Snooze all" action in notification dropdown
- Provide user setting: "Enable notifications" (opt-out)

**Current Implementation** (spec-compliant):
- Trigger individual notifications per task
- Document behavior in quickstart.md
- User can manually dismiss notifications

## Summary

### Decisions Finalized

1. **Storage**: localStorage exclusively (no backend changes)
2. **Temporal Evaluation**: setInterval every 60 seconds
3. **Skill Architecture**: Pure TypeScript modules
4. **Notification Tracking**: In-memory Map (duplicate prevention)
5. **Search**: Custom algorithm with debounce, top-50 limit
6. **Filter**: Array.filter chaining with Zustand + localStorage
7. **Sort**: Array.sort with multi-level comparator
8. **Visual Design**: TailwindCSS utility classes per constitution

### No Further Research Required

All technologies are already in the project. All design patterns have been validated. All performance targets are achievable with selected approaches.

### Next Steps

Proceed to Phase 1: Generate data-model.md, contracts/, and quickstart.md.
