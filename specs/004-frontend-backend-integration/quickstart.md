# Quickstart: Frontend-Backend Integration

**Feature**: 004-frontend-backend-integration
**Date**: 2025-12-11
**Audience**: Frontend developers implementing this feature

---

## Overview

This feature adds complete frontend-backend integration with:
- 3 new pages: `/tasks/[id]`, `/analytics`, `/history`
- SweetAlert2 notifications for all operations
- Recharts analytics visualizations with purple theme
- Full CRUD integration with existing backend API

---

## Prerequisites

1. **Backend Running**: `http://localhost:9000` (validated and operational)
2. **Frontend Dependencies**: Already installed (Next.js 16, React 19, TailwindCSS 4)
3. **Environment**: `.env.local` configured with `NEXT_PUBLIC_API_URL=http://localhost:9000/api/v1`

**New Dependencies Required**:
- `sweetalert2` - Modal notifications
- `recharts` - Charts and graphs

---

## Installation

### 1. Install New Dependencies

```bash
cd frontend/todo-app
npm install sweetalert2 recharts
```

### 2. Verify Backend

```bash
curl http://localhost:9000/api/v1/health
# Expected: {"status":"healthy","service":"todo-app-backend"}
```

### 3. Start Frontend Dev Server

```bash
npm run dev
# Runs on http://localhost:3000
```

---

## Development Workflow

### Creating New Pages

All new pages use Next.js App Router (`app/` directory):

```typescript
// app/tasks/[id]/page.tsx
'use client';
import { useParams } from 'next/navigation';

export default function TaskDetailPage() {
  const params = useParams();
  const taskId = params.id as string;
  // Implementation...
}
```

**Key Points**:
- Use `'use client'` directive for client-side components
- Access route params via `useParams()` hook
- All pages must export default function

---

### Using SweetAlert2

**Import centralized utilities**:

```typescript
import { showSuccess, showError, showConfirm } from '@/components/notifications/alerts';

// Success notification
await showSuccess('Task Created!', 'Your task has been added successfully.');

// Error notification
await showError('Failed to Save', error.message);

// Confirmation dialog
const confirmed = await showConfirm('Delete Task?', 'This cannot be undone.');
if (confirmed) {
  await deleteTask(id);
}
```

**Create the utility file** (`components/notifications/alerts.ts`):

```typescript
'use client';
import Swal from 'sweetalert2';

const PURPLE = '#7c3aed';

export async function showSuccess(title: string, text?: string) {
  return await Swal.fire({
    title,
    text,
    icon: 'success',
    confirmButtonColor: PURPLE,
    confirmButtonText: 'OK'
  });
}

export async function showError(title: string, text?: string) {
  return await Swal.fire({
    title,
    text,
    icon: 'error',
    confirmButtonColor: PURPLE,
    confirmButtonText: 'OK'
  });
}

export async function showConfirm(title: string, text: string) {
  const result = await Swal.fire({
    title,
    text,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: PURPLE,
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Yes, proceed',
    cancelButtonText: 'Cancel'
  });
  return result.isConfirmed;
}
```

---

### Using Recharts

**Create chart configuration** (`lib/chartConfig.ts`):

```typescript
export const CHART_COLORS = {
  purple: {
    main: '#7c3aed',
    light: '#a78bfa',
    dark: '#5b21b6',
    lighter: '#c4b5fd',
  },
  gray: {
    light: '#f3f4f6',
    medium: '#9ca3af',
    dark: '#374151',
  }
};

export const CHART_CONFIG = {
  margin: { top: 20, right: 30, left: 20, bottom: 20 },
  barSize: 40,
  animationDuration: 800,
};
```

**Example: Weekly Bar Chart**:

```typescript
'use client';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { CHART_COLORS, CHART_CONFIG } from '@/lib/chartConfig';

interface WeeklyChartProps {
  data: { week: string; completed: number; incomplete: number; }[];
  loading: boolean;
}

export function WeeklyChart({ data, loading }: WeeklyChartProps) {
  if (loading) return <div>Loading...</div>;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={CHART_CONFIG.margin}>
        <XAxis dataKey="week" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="completed" fill={CHART_COLORS.purple.main} barSize={CHART_CONFIG.barSize} />
        <Bar dataKey="incomplete" fill={CHART_COLORS.purple.light} barSize={CHART_CONFIG.barSize} />
      </BarChart>
    </ResponsiveContainer>
  );
}
```

---

### API Integration

**Extend existing API client** (`services/api.ts`):

```typescript
// Add history methods
async getHistory(page = 1, limit = 20, taskId?: string, actionType?: string): Promise<HistoryEntry[]> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (taskId) params.append('task_id', taskId);
  if (actionType) params.append('action_type', actionType);

  const response = await this.client.get<ApiResponse<HistoryEntry[]>>(`/history?${params}`);
  return response.data.data || [];
}

// Add stats methods
async getWeeklyStats(): Promise<TaskStatistics> {
  const response = await this.client.get<ApiResponse<TaskStatistics>>('/stats/weekly');
  return response.data.data;
}
```

**Create custom hooks**:

```typescript
// hooks/useHistory.ts
'use client';
import { useState, useCallback } from 'react';
import apiClient from '@/services/api';

export function useHistory() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20,
  });

  const fetchHistory = useCallback(async (page = 1, filters?) => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.getHistory(page, 20, filters?.task_id, filters?.action_type);
      setEntries(data);
      // Update pagination based on response headers or metadata
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch history');
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return { entries, loading, error, pagination, fetchHistory, clearError };
}
```

---

## Testing

### Manual Testing Workflow

#### 1. Task Detail Page (`/tasks/[id]`)
```
1. Navigate to http://localhost:3000/tasks
2. Click any task → should route to /tasks/{uuid}
3. Verify task details display (title, description, dates)
4. Click "Edit" → form inputs appear
5. Modify title/description
6. Click "Save" → SweetAlert2 success notification
7. Verify task updated in database (check backend or refresh list)
8. Click "Cancel" → returns to view mode without saving
```

#### 2. Analytics Page (`/analytics`)
```
1. Navigate to http://localhost:3000/analytics
2. Verify weekly bar chart renders (completed vs incomplete)
3. Check purple theme colors (#7c3aed)
4. Verify metric cards display totals
5. Click "Refresh" → data reloads
6. Check responsive design on mobile (resize browser)
```

#### 3. History Page (`/history`)
```
1. Navigate to http://localhost:3000/history
2. Verify history entries display chronologically
3. Check pagination buttons (Previous/Next)
4. Navigate to page 2 → entries update
5. Verify action type badges (CREATED, UPDATED, etc.)
6. Filter by action type → list updates
```

### Automated Testing

```bash
# Run all tests
npm test

# Run specific test file
npm test analytics.test.tsx

# Run with coverage
npm test -- --coverage

# Watch mode
npm test -- --watch
```

**Example test** (`analytics.test.tsx`):

```typescript
import { render, screen } from '@testing-library/react';
import { WeeklyChart } from '@/components/analytics/WeeklyChart';

describe('WeeklyChart', () => {
  it('renders chart with data', () => {
    const data = [
      { week: 'Week 1', completed: 5, incomplete: 2 }
    ];
    render(<WeeklyChart data={data} loading={false} />);
    expect(screen.getByText('Week 1')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    render(<WeeklyChart data={[]} loading={true} />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});
```

---

## Troubleshooting

### SweetAlert2 Not Showing

**Symptoms**: No modal appears when calling `showSuccess()` or `showError()`

**Solutions**:
1. Ensure component has `'use client'` directive
2. Check browser console for JavaScript errors
3. Verify `sweetalert2` is installed: `npm list sweetalert2`
4. Import from correct path: `@/components/notifications/alerts`

---

### Recharts Not Rendering

**Symptoms**: Charts don't display or show as blank area

**Solutions**:
1. Ensure `ResponsiveContainer` wraps all charts
2. Check data format matches chart expectations:
   ```typescript
   // Correct format
   const data = [{ week: "Week 1", completed: 5, incomplete: 2 }];

   // Wrong format (missing keys)
   const data = [{ label: "Week 1", value1: 5, value2: 2 }];
   ```
3. Verify component has `'use client'` directive
4. Check `recharts` is installed: `npm list recharts`
5. Inspect browser console for errors

---

### API Errors

**Symptoms**: Network requests fail or return unexpected responses

**Solutions**:
1. **Check backend is running**:
   ```bash
   curl http://localhost:9000/api/v1/health
   # Should return: {"status":"healthy","service":"todo-app-backend"}
   ```
2. **Verify API URL** in `.env.local`:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:9000/api/v1
   ```
3. **Check browser Network tab** (DevTools → Network):
   - Look for failed requests (red status codes)
   - Check request URL matches backend endpoint
   - Verify CORS headers are present
4. **Review error messages** in UI and console

---

### CORS Issues

**Symptoms**: Browser console shows "CORS policy blocked"

**Solutions**:
1. Backend CORS is configured for `http://localhost:3000`
2. If using different port, update backend `FRONTEND_URL` in `.env`
3. Check backend logs for CORS errors
4. Verify request Origin header matches allowed origins

---

## File Structure

```
frontend/todo-app/
├── app/
│   ├── tasks/[id]/page.tsx       # NEW
│   ├── analytics/page.tsx        # NEW
│   └── history/page.tsx          # NEW
├── components/
│   ├── tasks/
│   │   └── TaskDetailForm.tsx    # NEW
│   ├── analytics/
│   │   ├── WeeklyChart.tsx       # NEW
│   │   ├── MetricCard.tsx        # NEW
│   │   └── ActivityTimeline.tsx  # NEW
│   ├── history/
│   │   ├── HistoryList.tsx       # NEW
│   │   └── HistoryEntry.tsx      # NEW
│   └── notifications/
│       └── alerts.ts             # NEW (SweetAlert2 wrapper)
├── hooks/
│   ├── useHistory.ts             # NEW
│   └── useStats.ts               # NEW
├── lib/
│   └── chartConfig.ts            # NEW (Purple theme for Recharts)
└── services/
    └── api.ts                    # EXTEND (add history/stats methods)
```

---

## Next Steps

1. **Install Dependencies**: Run `npm install sweetalert2 recharts`
2. **Verify Backend**: Ensure API is running on port 9000
3. **Create Utilities**: Build `alerts.ts` and `chartConfig.ts` first
4. **Implement Pages**: Start with P1 priority (task detail), then P2, then P3
5. **Test Each Page**: Manual testing before moving to next page
6. **Run Tests**: Write automated tests for new components
7. **Code Review**: Review with theme-subagent for purple theme consistency

---

**Quickstart Status**: ✅ READY FOR IMPLEMENTATION
**All Setup Instructions Documented**: Installation, usage patterns, testing, troubleshooting

*Quickstart guide completed 2025-12-11 using spec-driven development workflow*
