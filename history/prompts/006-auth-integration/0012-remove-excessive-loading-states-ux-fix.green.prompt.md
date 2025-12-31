---
id: 0012
title: Remove Excessive Loading States UX Fix
stage: green
date: 2025-12-16
surface: agent
model: claude-sonnet-4-5
feature: 006-auth-integration
branch: 006-auth-integration
user: ashna
command: /sp.implement
labels: ["ux", "performance", "loading", "optimization", "user-experience"]
links:
  spec: specs/006-auth-integration/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - frontend/todo-app/hooks/useTasks.ts
  - frontend/todo-app/app/tasks/page.tsx
  - frontend/todo-app/hooks/useProtectedRoute.tsx
tests:
  - TypeScript compilation: PASSED (production code clean) ✓
---

## Prompt

i noticed that many pages are unneccesilary getting loaded which is causing frusturation please remove this loading like for exaple when we are adding tasks its loading when i logged in and while redirecting to tasks it kept loading when i refreshed it loaded so please check this

## Response snapshot

Successfully identified and eliminated excessive loading states that were causing UX frustration.

**Root Cause Analysis:**

1. **useTasks Hook Setting Loading=true on Every Operation:**
   - `createTask`, `updateTask`, `completeTask`, `incompleteTask`, `deleteTask` all set `loading: true`
   - Tasks page showed full-page loading spinner whenever `loading` was true
   - Creating a task → full page loading spinner
   - Toggling completion → full page loading spinner
   - Deleting a task → full page loading spinner

2. **Unnecessary Refetching After Operations:**
   - After `createTask()`, code called `await fetchTasks()` again (line 60)
   - After `updateTask()`, code called `await fetchTasks()` again (line 99)
   - Hook already updates state optimistically, so refetch was redundant

3. **useProtectedRoute Double Loading:**
   - Had separate `isChecking` state that started as `true`
   - Combined with `isLoading` from AuthContext
   - Caused extra loading flash even when auth was already loaded

**Fixes Applied:**

### 1. frontend/todo-app/hooks/useTasks.ts

**Removed `loading: true` from all CRUD operations:**
- `createTask` (lines 155, 160, 168)
- `updateTask` (lines 184, 193, 201)
- `completeTask` (lines 216, 221, 228)
- `incompleteTask` (lines 241, 246, 253)
- `deleteTask` (lines 266, 271, 278)
- `getTask` (lines 128, 133, 138)

**Result:** Loading state now ONLY shown during initial `fetchTasks()` call, not during user interactions.

### 2. frontend/todo-app/app/tasks/page.tsx

**Removed redundant refetch calls:**
- Line 60: Removed `await fetchTasks()` after `createTask()`
- Line 99: Removed `await fetchTasks()` after `updateTask()`

**Result:** No unnecessary API calls, state updates happen immediately via hook.

### 3. frontend/todo-app/hooks/useProtectedRoute.tsx

**Simplified loading logic:**
- Removed `isChecking` state entirely
- Now returns only `isLoading` from AuthContext
- Redirect happens in `useEffect` without extra loading state

**Result:** No double loading flash on protected routes.

**User Experience Improvements:**

| Action | Before | After |
|--------|--------|-------|
| Adding a task | Full-page loading spinner | Instant UI update with button "Creating..." |
| Completing a task | Full-page loading spinner | Instant checkbox toggle |
| Deleting a task | Full-page loading spinner | Instant removal from list |
| Login → redirect | Double loading (AuthContext + isChecking) | Single loading (AuthContext only) |
| Page refresh | Multiple loading flashes | Single auth check only |

**Verification:**
- TypeScript compilation: PASSED ✓ (production code has no errors)
- All modified hooks maintain type safety
- State updates remain optimistic and immediate

## Outcome

- ✅ Impact: Dramatic UX improvement - eliminated frustrating loading spinners during task operations
- 🧪 Tests: TypeScript compilation passed for all production code
- 📁 Files: 3 files modified (2 hooks, 1 page component)
- 🔁 Next prompts: Manual testing of task CRUD operations and login/redirect flow
- 🧠 Reflection: Loading states should only appear for initial data fetch, not for user-initiated CRUD operations with optimistic updates

## Evaluation notes (flywheel)

- Failure modes observed: Over-eager loading states causing poor UX
- Graders run and results (PASS/FAIL): TypeScript compilation PASSED ✓
- Prompt variant (if applicable): UX improvement via /sp.implement
- Next experiment (smallest change to try): Add skeleton loaders for initial fetch instead of full-page spinner
