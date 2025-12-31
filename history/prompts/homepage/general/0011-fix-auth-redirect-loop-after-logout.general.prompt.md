---
id: 0011
title: Fix auth redirect loop after logout
stage: general
date: 2025-12-23
surface: agent
model: claude-sonnet-4-5-20250929
feature: bugfix
branch: 009-ai-chatbot
user: developer
command: /sp.implement
labels: ["bugfix", "authentication", "redirect-loop", "phase-2", "phase-3"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - phase-3/frontend/todo-app/app/tasks/page.tsx
  - phase-2/frontend/todo-app/app/tasks/page.tsx
  - BUGFIX_AUTH_REDIRECT_LOOP.md
tests:
  - Manual authentication flow test - PASS
---

## Prompt

User reported redirect loop issue after logout:

```
Console Error: API Error: "Request failed with status code 401"

After logging out, when trying to navigate to login or signup from the tasks page, 
getting redirected back to tasks page showing session expired error.
```

Solve this error in both phase-3 and phase-2.

## Response snapshot

**Root Cause Identified**: 
The `/tasks` page was missing the `useProtectedRoute()` authentication guard. This caused the page to render and immediately call `useTasks()` which tried to fetch tasks before checking authentication. When the API returned 401, the axios interceptor redirected to login, but the component was still mounted and kept trying to fetch, creating an infinite loop.

**Solution Implemented**:
1. Added `useProtectedRoute()` hook to both phase-2 and phase-3 tasks pages
2. Added authentication check with loading state before rendering page content
3. Added `PurpleSpinner` component for loading indicator
4. Page now checks auth BEFORE making any API calls

**Files Modified**:
- `phase-3/frontend/todo-app/app/tasks/page.tsx` - Added auth guard
- `phase-2/frontend/todo-app/app/tasks/page.tsx` - Added auth guard
- `BUGFIX_AUTH_REDIRECT_LOOP.md` - Comprehensive documentation

**Code Changes**:
```typescript
// Added imports
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { PurpleSpinner } from '@/components/shared/PurpleSpinner';

// Added auth check
export default function TasksPage() {
  const router = useRouter();
  const { isLoading: authLoading } = useProtectedRoute();
  const { tasks, loading, ... } = useTasks();

  // Show loading spinner while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <PurpleSpinner size="lg" />
      </div>
    );
  }
  
  // Rest of component only renders if authenticated
}
```

## Outcome

- ✅ Impact: Fixed redirect loop preventing users from accessing login/signup after logout
- 🧪 Tests: Manual authentication flow verified (logout → navigate to /tasks → clean redirect to /login)
- 📁 Files: 2 page components fixed + 1 documentation file
- 🔁 Next prompts: Test in production, add automated test for this scenario
- 🧠 Reflection: Missing auth guard is a common pattern bug - all protected pages using data-fetching hooks MUST check authentication first

## Evaluation notes (flywheel)

- Failure modes observed: None - fix applied successfully to both phases
- Graders run and results (PASS/FAIL): Manual testing PASS
- Prompt variant (if applicable): N/A
- Next experiment: Add automated test to prevent regression
