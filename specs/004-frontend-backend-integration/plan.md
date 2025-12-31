# Implementation Plan: Frontend-Backend Integration with SweetAlert2 & Recharts

**Branch**: `004-frontend-backend-integration` | **Date**: 2025-12-11 | **Spec**: [spec.md](./spec.md)

## Summary

Complete Phase-2 frontend integration with validated backend API. Adds 3 new pages (/tasks/[id], /analytics, /history), SweetAlert2 notifications for all operations, and Recharts analytics dashboard with purple theme.

**Technical Approach**: Sub-agent delegation pattern - ui-builder-subagent for layouts, frontend-data-integrator for API integration, chart-visualizer for Recharts, theme-subagent for purple theme validation.

## Technical Context

**Language/Version**: TypeScript 5.x, React 19, Next.js 16 (App Router)
**Primary Dependencies**: React 19, Next.js 16, TailwindCSS 4, Axios, Framer Motion, Lucide React, **SweetAlert2** (new), **Recharts** (new)
**Storage**: PostgreSQL (Neon) - already operational
**Testing**: Jest + React Testing Library (frontend), pytest (backend - already validated)
**Target Platform**: Web browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
**Project Type**: Web monorepo (frontend/ + backend/)
**Performance Goals**: Page loads < 3s, CRUD ops < 2s, UI updates < 500ms
**Constraints**: Preserve existing HomePage unchanged, purple theme (#7c3aed) required, responsive design mandatory
**Scale/Scope**: 4 pages (1 existing + 3 new), 9 API endpoints (validated), ~20 components

## Constitution Check

**Status**: ✓ PASS (pending SweetAlert2/Recharts installation approval)

- ✓ Sub-agent delegation: Explicitly required (ui-builder, frontend-data-integrator, chart-visualizer, theme-subagent)
- ✓ Purple theme: Enforced throughout (FR-020)
- ⚠ Installation: Requires user approval for `sweetalert2` and `recharts` packages
- ✓ MCP usage: Next.js MCP available for dev workflow
- ✓ Code quality: Production-grade React components required

**Installation Gate**: Must confirm SweetAlert2 and Recharts installation before proceeding.

## Project Structure

### Documentation (this feature)

```
specs/004-frontend-backend-integration/
├── spec.md              # Feature specification (COMPLETE)
├── checklists/
│   └── requirements.md  # Quality checklist (COMPLETE)
├── plan.md              # This file (IN PROGRESS)
├── research.md          # Phase 0 output (NEXT)
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   ├── api-endpoints.yaml
│   └── component-interfaces.ts
└── tasks.md             # Phase 2 - separate command
```

### Source Code

```
backend/                 # [EXISTING - DO NOT MODIFY]
├── src/api/v1/
│   ├── tasks.py         # Task endpoints (validated)
│   ├── history.py       # History endpoints (validated)
│   └── stats.py         # Stats endpoints (validated)

frontend/todo-app/
├── app/
│   ├── page.tsx                  # [EXISTING] HomePage - DO NOT MODIFY
│   ├── tasks/
│   │   ├── page.tsx              # [EXTEND] Add SweetAlert2
│   │   └── [id]/page.tsx         # [NEW] Task detail + edit
│   ├── analytics/page.tsx        # [NEW] Recharts dashboard
│   └── history/page.tsx          # [NEW] History log
├── components/
│   ├── HomePage/                 # [EXISTING] DO NOT MODIFY
│   ├── tasks/
│   │   └── TaskDetailForm.tsx    # [NEW]
│   ├── analytics/
│   │   ├── WeeklyChart.tsx       # [NEW] Recharts
│   │   ├── MetricCard.tsx        # [NEW]
│   │   └── ActivityTimeline.tsx  # [NEW] Recharts
│   ├── history/
│   │   ├── HistoryList.tsx       # [NEW]
│   │   └── HistoryEntry.tsx      # [NEW]
│   └── notifications/
│       └── alerts.ts             # [NEW] SweetAlert2 wrapper
├── hooks/
│   ├── useTasks.ts               # [EXTEND] Add SweetAlert2
│   ├── useHistory.ts             # [NEW]
│   └── useStats.ts               # [NEW]
└── lib/
    └── chartConfig.ts            # [NEW] Purple theme for Recharts
```

## Phase 0: Research

**Tasks**:
1. **SweetAlert2 Integration**: Verify Next.js 16 + React 19 compatibility; purple theme customization
2. **Recharts Purple Theme**: Color palette configuration (#7c3aed); responsive container patterns
3. **Edit Flow UX**: Edit mode toggle vs always-editable vs modal (recommendation: toggle)
4. **History Pagination**: Pagination buttons vs infinite scroll (recommendation: buttons, 20/page)
5. **Analytics Refresh**: Manual refresh vs polling (recommendation: manual + mount)

**Output**: `research.md` with all decisions documented

## Phase 1: Design

**Deliverables**:
1. **data-model.md**: Task, HistoryEntry, TaskStatistics entities; chart data interfaces
2. **contracts/api-endpoints.yaml**: OpenAPI spec for all 9 endpoints
3. **contracts/component-interfaces.ts**: TypeScript interfaces for all new components
4. **quickstart.md**: Developer onboarding guide

**Key Contracts**:
- GET/POST /tasks, GET/PUT/DELETE /tasks/{id}, PATCH /tasks/{id}/complete|incomplete
- GET /history (with pagination), GET /stats/weekly
- Component props: TaskDetailFormProps, WeeklyChartProps, MetricCardProps, HistoryListProps

## Implementation Priority

**P1 (MVP)**: View tasks, Create tasks, Mark complete/incomplete with SweetAlert2
**P2 (Important)**: Delete with confirmation, Edit task details
**P3 (Nice-to-have)**: History page, Analytics dashboard

## Success Criteria Mapping

- SC-001 (CRUD < 2s): Existing api.ts already meets target
- SC-002 (100% notifications): SweetAlert2 for all 6 operations
- SC-006 (/analytics < 3s): Recharts client-side, data pre-aggregated
- SC-013 (Purple charts): chartConfig.ts with purple palette

## Next Steps

1. **User Approval**: Confirm SweetAlert2 + Recharts installation
2. **Phase 0**: Generate research.md with technology decisions
3. **Phase 1**: Create data-model.md, contracts/, quickstart.md
4. **Agent Update**: Run update-agent-context.sh to add technologies
5. **Phase 2**: Run `/sp.tasks` to generate implementation tasks

---

**Plan Status**: ✓ READY FOR PHASE 0
**Blocking Issue**: Awaiting installation approval for SweetAlert2 and Recharts

*Plan generated 2025-12-11 using spec-driven development workflow*
