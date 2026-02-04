# Research: Technology Decisions for Frontend-Backend Integration

**Feature**: 004-frontend-backend-integration
**Date**: 2025-12-11
**Phase**: Phase 0 Research

---

## Research Tasks and Findings

### 1. SweetAlert2 Integration with Next.js 16 + React 19

**Research Question**: How to properly integrate SweetAlert2 with Next.js 16 App Router and React 19?

**Investigation**:
- SweetAlert2 is a client-side library (requires browser APIs)
- Next.js App Router uses Server Components by default
- React 19 introduces new rendering patterns

**Findings**:
1. **Installation**: `npm install sweetalert2` or `npm install sweetalert2 @types/sweetalert2`
2. **Next.js Compatibility**: Fully compatible with Next.js 16; must use `'use client'` directive
3. **Usage Pattern**: Create wrapper utilities in `components/notifications/alerts.ts`
4. **Purple Theme Customization**: SweetAlert2 supports `customClass` and inline styles
5. **Best Practices**:
   - Centralize configurations to avoid duplication
   - Use async/await pattern for confirmation dialogs
   - Apply purple theme via `confirmButtonColor: '#7c3aed'`
   - Wrap in try-catch for proper error handling

**Example Implementation**:
```typescript
// components/notifications/alerts.ts
'use client';
import Swal from 'sweetalert2';

export async function showSuccess(title: string, text?: string) {
  return await Swal.fire({
    title,
    text,
    icon: 'success',
    confirmButtonColor: '#7c3aed', // Purple theme
    confirmButtonText: 'OK'
  });
}

export async function showConfirm(title: string, text: string) {
  const result = await Swal.fire({
    title,
    text,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#7c3aed',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Yes, proceed',
    cancelButtonText: 'Cancel'
  });
  return result.isConfirmed;
}
```

**Decision**: ✅ Use SweetAlert2 with centralized wrapper utilities in `components/notifications/alerts.ts`. Apply purple theme (#7c3aed) to all confirm buttons. All components using alerts must have `'use client'` directive.

**Alternatives Considered**:
- Native browser `alert()`/`confirm()` - Rejected: Poor UX, no styling control
- Custom modal components - Rejected: Reinventing wheel, more development time
- React-Toastify - Rejected: Different UX pattern (toast vs modal), spec requires SweetAlert2

---

### 2. Recharts Purple Theme Configuration

**Research Question**: How to customize Recharts color palette to match purple theme (#7c3aed)?

**Investigation**:
- Recharts uses component-level color props
- No global theme configuration out of the box
- Supports custom colors via `fill` and `stroke` props

**Findings**:
1. **Installation**: `npm install recharts` (TypeScript types included)
2. **Theming Approach**: Create `lib/chartConfig.ts` with purple color palette constants
3. **Responsive Design**: Use `ResponsiveContainer` wrapper for all charts
4. **Color Scale**: Generate purple gradient (light → dark) for multiple data series
5. **Best Practices**:
   - Extract chart configuration to constants (DRY principle)
   - Use semantic color names (primary, secondary, accent)
   - Ensure sufficient contrast for accessibility (WCAG AA minimum)

**Purple Color Palette**:
```typescript
// lib/chartConfig.ts
export const CHART_COLORS = {
  purple: {
    main: '#7c3aed',      // purple-600 (primary)
    light: '#a78bfa',     // purple-400 (secondary)
    dark: '#5b21b6',      // purple-800 (accent)
    lighter: '#c4b5fd',   // purple-300 (tertiary)
  },
  gray: {
    light: '#f3f4f6',     // For backgrounds
    medium: '#9ca3af',    // For borders
    dark: '#374151',      // For text
  }
};

export const CHART_CONFIG = {
  margin: { top: 20, right: 30, left: 20, bottom: 20 },
  barSize: 40,
  animationDuration: 800,
};
```

**Example Usage**:
```typescript
<BarChart data={weeklyData}>
  <Bar dataKey="completed" fill={CHART_COLORS.purple.main} />
  <Bar dataKey="incomplete" fill={CHART_COLORS.purple.light} />
</BarChart>
```

**Decision**: ✅ Create `lib/chartConfig.ts` with purple color palette. Use `ResponsiveContainer` for all charts. Apply purple gradient colors to data series with sufficient contrast for readability.

**Alternatives Considered**:
- CSS-based theming - Rejected: Recharts doesn't support global CSS themes
- Tailwind classes in chart props - Rejected: Recharts uses hex colors, not class names
- Victory Charts - Rejected: Spec explicitly requires Recharts

---

### 3. Task Detail Page Edit Flow UX Pattern

**Research Question**: What's the best UX pattern for inline editing on task detail page?

**Investigation**:
- Evaluated 3 common patterns for edit functionality
- Considered user expectations and implementation complexity

**Options Evaluated**:

**Option A: Edit Mode Toggle**
- **Description**: View mode by default → "Edit" button → Edit mode with form → Save/Cancel
- **Pros**: Clear separation between view and edit; explicit save action prevents accidental changes; familiar pattern
- **Cons**: Extra click required to edit; slightly more code (two modes)

**Option B: Always-Editable Form**
- **Description**: All fields are input fields; changes auto-save or explicit save button
- **Pros**: Fastest editing (no mode toggle); modern UX pattern
- **Cons**: Risk of accidental edits; no clear distinction between viewing and editing

**Option C: Modal Popup for Editing**
- **Description**: Click "Edit" → modal opens with form → Save in modal
- **Pros**: Focused editing experience; clear context
- **Cons**: Disrupts flow with modal overlay; requires navigating away from detail page context

**Decision**: ✅ **Option A: Edit Mode Toggle** - Best balance of clarity, safety, and UX. Explicit "Edit" button, form inputs in edit mode, and "Save"/"Cancel" actions. Prevents accidental edits while keeping editing workflow simple.

**Implementation Details**:
- Default: View mode (display task title/description as read-only text)
- "Edit" button triggers edit mode
- Edit mode: Form inputs replace read-only display
- "Save" sends PUT request, shows SweetAlert2 success, returns to view mode
- "Cancel" discards changes, returns to view mode

**Alternatives Rejected**:
- Option B: Too risky for accidental edits; no explicit save confirmation
- Option C: Modal disrupts context; unnecessary complexity

---

### 4. History Pagination Strategy

**Research Question**: Should history page use infinite scroll, pagination buttons, or load-more pattern?

**Investigation**:
- Backend supports `?page=X&limit=Y` query parameters
- Evaluated UX trade-offs for large datasets

**Options Evaluated**:

**Option A: Pagination Buttons (Previous/Next)**
- **Pros**: Simple to implement; matches backend capability; predictable UX; works well for large datasets
- **Cons**: Requires extra clicks to navigate pages

**Option B: Infinite Scroll**
- **Pros**: Seamless browsing; modern UX
- **Cons**: Complex to implement; harder to return to specific position; accessibility challenges; backend doesn't support cursor-based pagination

**Option C: "Load More" Button**
- **Pros**: Middle ground; user controls loading
- **Cons**: Accumulates items in DOM (performance issues); no way to jump to specific page

**Decision**: ✅ **Option A: Pagination Buttons** - Simpler implementation, better for large datasets, matches backend pagination model. Use Previous/Next buttons with page numbers. Default 20 entries per page.

**Implementation Details**:
- Display current page number and total pages
- "Previous" button (disabled on page 1)
- "Next" button (disabled on last page)
- Optional: Page number display ("Page 2 of 10")
- Backend query: `/history?page=2&limit=20`

**Alternatives Rejected**:
- Option B (Infinite scroll): Backend uses page-based pagination, not cursors; too complex
- Option C (Load More): DOM accumulation causes performance issues; no navigation control

---

### 5. Analytics Dashboard Data Refresh Strategy

**Research Question**: How often should the analytics dashboard refresh data?

**Investigation**:
- Backend endpoint: `/api/v1/stats/weekly` returns aggregated statistics
- Stats are weekly summaries (unlikely to change frequently)
- No WebSocket or real-time updates from backend

**Options Evaluated**:

**Option A: Manual Refresh Only**
- **Pros**: No unnecessary API calls; user controls refresh; simple implementation
- **Cons**: Data might be stale unless user refreshes

**Option B: Auto-Refresh on Page Mount + Manual Refresh**
- **Pros**: Fresh data on page load; user can refresh manually; balance of convenience and control
- **Cons**: API call on every mount (acceptable for analytics)

**Option C: Polling (Auto-refresh every X seconds)**
- **Pros**: Always up-to-date
- **Cons**: Wasteful (weekly stats don't change often); unnecessary backend load; battery drain on mobile

**Decision**: ✅ **Option B: Auto-Refresh on Mount + Manual Refresh Button** - Load data when page mounts (fresh data on every visit). Provide "Refresh" button for manual updates. No automatic polling (weekly stats don't justify it).

**Implementation Details**:
- `useEffect(() => { fetchStats(); }, [])` on page mount
- "Refresh" button calls `fetchStats()` manually
- Loading spinner during data fetch
- No polling interval (no `setInterval`)

**Alternatives Rejected**:
- Option A (Manual only): Too stale; users would need to remember to refresh
- Option C (Polling): Weekly stats don't change frequently enough to justify polling overhead

---

## Technology Stack Confirmation

| Technology | Version | Purpose | Installation Status | Decision |
|------------|---------|---------|---------------------|----------|
| Next.js | 16 | App Router framework | ✅ Installed | Use App Router, `'use client'` for client components |
| React | 19 | UI library | ✅ Installed | Leverage hooks (useState, useEffect, useCallback) |
| TypeScript | 5.x | Type safety | ✅ Installed | Strict mode enabled, full typing for all components |
| TailwindCSS | 4 | Styling | ✅ Installed | Continue using existing purple theme classes |
| Lucide React | Latest | Icons | ✅ Installed | Use for all icons (consistency) |
| Framer Motion | Latest | Animations | ✅ Installed | Use for page transitions, card animations |
| Axios | Latest | HTTP client | ✅ Installed | Existing api.ts service, extend with history/stats methods |
| **SweetAlert2** | Latest | Modal notifications | ⚠️ **NEEDS INSTALLATION** | Required for FR-010; purple theme via confirmButtonColor |
| **Recharts** | Latest | Charts/graphs | ⚠️ **NEEDS INSTALLATION** | Required for FR-009, FR-016; purple palette via chartConfig |

---

## Summary of Decisions

### ✅ Approved Approaches

1. **SweetAlert2**: Centralized wrapper utilities in `components/notifications/alerts.ts` with purple theme
2. **Recharts**: Color configuration in `lib/chartConfig.ts` with purple gradient palette
3. **Edit Flow**: Edit mode toggle pattern (view mode → edit mode → save/cancel)
4. **History Pagination**: Pagination buttons with Previous/Next (20 entries per page)
5. **Analytics Refresh**: Auto-load on mount + manual refresh button (no polling)

### 📦 Installation Requirements

**Required Packages** (awaiting user approval):
```bash
npm install sweetalert2 recharts
```

### 🔗 Documentation References

- [SweetAlert2 Official Docs](https://sweetalert2.github.io/)
- [Recharts Documentation](https://recharts.org/en-US/)
- [Next.js App Router Guide](https://nextjs.org/docs/app)
- [React 19 Release Notes](https://react.dev/blog/2024/12/05/react-19)

---

## Risks Identified

| Risk | Mitigation |
|------|-----------|
| SweetAlert2 styling conflicts with TailwindCSS | Use `customClass` for purple theme; test early in isolated branch |
| Recharts not responsive on mobile | Always use `ResponsiveContainer` wrapper; test on mobile viewport |
| Edit mode state bugs (lost data) | Implement proper useState for form values; add confirmation on cancel if unsaved changes |
| Pagination performance with large history | Backend limits query to 20 items; acceptable performance |

---

## Next Phase

**Phase 1 Deliverables**:
1. `data-model.md` - Entity definitions for Task, HistoryEntry, TaskStatistics, chart data types
2. `contracts/api-endpoints.yaml` - OpenAPI spec for all 9 backend endpoints
3. `contracts/component-interfaces.ts` - TypeScript interfaces for all component props
4. `quickstart.md` - Developer onboarding guide with installation, usage examples, troubleshooting

---

**Research Phase Status**: ✅ COMPLETE
**Blocking Issue Resolved**: All technology decisions documented; installation approval still required before implementation

*Research completed 2025-12-11 using spec-driven development workflow*
