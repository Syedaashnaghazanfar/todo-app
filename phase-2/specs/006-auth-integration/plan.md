# Implementation Plan: Authentication Integration with BetterAuth

**Branch**: `006-auth-integration` | **Date**: 2025-12-15 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/006-auth-integration/spec.md`

**Note**: This template is filled in by the `/sp.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Integrate BetterAuth authentication system with NeonDB PostgreSQL backend to provide user registration, login, logout, and session management for the TodoApp. Implement user-isolated data access by adding user_id scoping to all 9 existing API endpoints, ensuring each authenticated user only sees and manages their own tasks and history. Create purple-themed login/signup pages matching existing UI design patterns, with SweetAlert2 feedback for all authentication operations. Implement frontend route protection and backend JWT validation middleware to secure all protected routes and API endpoints.

**Technical Approach**: Use BetterAuth MCP server for authentication operations, add database migration to include user_id columns in tasks and history tables, implement JWT middleware in FastAPI backend for token validation, create authentication context in Next.js frontend for state management, and build protected route wrappers to enforce authentication requirements.

## Technical Context

**Language/Version**:
- Frontend: TypeScript 5.x, React 19, Next.js 16
- Backend: Python 3.8+, FastAPI 0.124.0

**Primary Dependencies**:
- Frontend: Next.js 16, React 19, TailwindCSS 4, SweetAlert2, Framer Motion, Recharts, Lucide Icons
- Backend: FastAPI 0.124.0, SQLAlchemy, Alembic, Pydantic, BetterAuth (via MCP server)
- Database: PostgreSQL (NeonDB)

**Storage**:
- PostgreSQL (NeonDB) for users, sessions, tasks, and history tables
- httpOnly cookies for JWT token storage (client-side)

**Testing**:
- Frontend: Jest + React Testing Library
- Backend: pytest (40+ existing tests)
- Integration: Multi-user security testing for authorization verification

**Target Platform**:
- Frontend: Web browsers (desktop + mobile responsive), deployed on Vercel
- Backend: Linux server (FastAPI), deployed on Railway/Render/Heroku

**Project Type**: Web application (frontend + backend)

**Performance Goals**:
- Login/signup completion: <10 seconds (SC-002)
- Protected route redirect: <200ms (SC-007)
- JWT validation overhead: <50ms per request (SC-008)
- Session persistence: 30 days across browser restarts

**Constraints**:
- MUST NOT modify existing task CRUD functionality - only add user_id scoping
- MUST use BetterAuth MCP server exclusively - no custom auth implementation
- MUST follow purple theme (#8b5cf6 and variants)
- MUST use SweetAlert2 for all auth feedback - no native alerts
- MUST store JWT in httpOnly cookie - not localStorage
- MUST validate JWT on backend for every protected endpoint
- MUST maintain backward compatibility (existing tests pass)

**Scale/Scope**:
- User base: Designed for 1000+ concurrent users
- Data isolation: 100% user-scoped authorization
- API endpoints: 9 existing endpoints + 3 new auth endpoints
- Frontend routes: 4 protected routes + 2 public auth routes
- Database changes: 2 columns added (user_id to tasks and history tables)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Phase-2 Constitution Compliance Assessment**:

✅ **MCP Server Usage**:
- BetterAuth MCP server will be used for authentication operations
- User confirmation required if BetterAuth MCP not installed: "This requires installing BetterAuth MCP server. Should I proceed?"

✅ **Sub-Agent Delegation**:
- Frontend auth pages (login/signup) → Frontend-expert sub-agent
- Route protection and auth context → Frontend-expert sub-agent
- Chart visualization (analytics) → No changes required (existing)
- Purple theme enforcement → Theme sub-agent for consistency review
- Backend JWT middleware → Backend-expert sub-agent
- Database migration → Database-expert sub-agent
- Coordination → Fullstack-architect sub-agent

✅ **Code + UI Principles**:
- Purple theme (#8b5cf6) enforced on login/signup pages
- Lucide icons used consistently (Lock, User, LogOut icons for auth UI)
- TailwindCSS for styling
- Framer Motion for smooth transitions
- SweetAlert2 for notifications (already in use)
- Production-quality code (TypeScript strict mode, FastAPI best practices)

✅ **Safety & Installation**:
- BetterAuth MCP server installation check required before proceeding
- If user refuses installation, provide alternative: manual JWT implementation (not recommended, violates spec constraint)

✅ **Communication**:
- Precise error messages via SweetAlert2 (6 scenarios defined in FR-011 to FR-016)
- Structured logging for auth failures (backend)
- Clear user feedback for all auth state changes

✅ **Decision Hierarchy Compliance**:
1. Constitution: Purple theme, MCP usage, sub-agent delegation - all followed
2. User Command: `/sp.plan` executing architecture design
3. Sub-Agent Delegation: auth-expert, database-expert, backend-expert, frontend-expert, fullstack-architect defined
4. MCP Server Integration: BetterAuth MCP required
5. Skills: Existing skills leveraged (no new skills required)
6. Creativity: Architecture decisions documented in research.md (Phase 0)

**GATE STATUS**: ✅ PASS - All constitution requirements satisfied

## Project Structure

### Documentation (this feature)

```text
specs/006-auth-integration/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output - BetterAuth patterns, JWT best practices
├── data-model.md        # Phase 1 output - User, Session entities, updated Task/History models
├── quickstart.md        # Phase 1 output - Developer setup guide for auth integration
├── contracts/           # Phase 1 output - Auth API contracts (login, signup, logout endpoints)
│   ├── auth-api.yaml    # OpenAPI spec for authentication endpoints
│   └── jwt-schema.json  # JWT token payload schema
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── api/
│   │   ├── v1/
│   │   │   ├── tasks.py          # [MODIFIED] Add user_id scoping to all endpoints
│   │   │   ├── history.py        # [MODIFIED] Add user_id scoping
│   │   │   ├── stats.py          # [MODIFIED] Add user_id scoping
│   │   │   └── auth.py           # [NEW] Login, signup, logout endpoints
│   │   └── deps.py               # [NEW] JWT dependency injection for auth
│   ├── models/
│   │   ├── task.py               # [MODIFIED] Add user_id foreign key
│   │   ├── history.py            # [MODIFIED] Add user_id foreign key
│   │   ├── user.py               # [NEW] User model (managed by BetterAuth)
│   │   └── session.py            # [NEW] Session model (managed by BetterAuth)
│   ├── schemas/
│   │   ├── auth.py               # [NEW] LoginRequest, SignupRequest, AuthResponse schemas
│   │   └── user.py               # [NEW] UserResponse schema
│   ├── services/
│   │   ├── task_service.py       # [MODIFIED] Add user_id parameter to all methods
│   │   ├── history_service.py    # [MODIFIED] Add user_id parameter
│   │   ├── stats_service.py      # [MODIFIED] Add user_id scoping
│   │   └── auth_service.py       # [NEW] BetterAuth integration service
│   ├── middleware/
│   │   └── jwt_auth.py           # [NEW] JWT validation middleware
│   └── utils/
│       └── jwt.py                # [NEW] JWT encoding/decoding utilities
├── alembic/
│   └── versions/
│       └── {timestamp}_add_user_id_columns.py  # [NEW] Migration for user_id columns
├── tests/
│   ├── test_auth.py              # [NEW] Auth endpoint tests
│   ├── test_jwt_middleware.py    # [NEW] JWT middleware tests
│   ├── test_authorization.py     # [NEW] Multi-user isolation tests
│   ├── test_task_service.py      # [MODIFIED] Add user_id to all test cases
│   └── test_integration.py       # [MODIFIED] Add multi-user scenarios
└── requirements.txt              # [MODIFIED] Add python-jose, passlib, BetterAuth SDK

frontend/todo-app/
├── app/
│   ├── login/
│   │   └── page.tsx              # [NEW] Login page with purple theme
│   ├── signup/
│   │   └── page.tsx              # [NEW] Signup page with purple theme
│   ├── tasks/
│   │   └── page.tsx              # [MODIFIED] Add auth check
│   ├── analytics/
│   │   └── page.tsx              # [MODIFIED] Add auth check
│   ├── history/
│   │   └── page.tsx              # [MODIFIED] Add auth check
│   └── layout.tsx                # [MODIFIED] Add auth context provider, logout button
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx         # [NEW] Login form component
│   │   ├── SignupForm.tsx        # [NEW] Signup form component
│   │   └── LogoutButton.tsx      # [NEW] Logout button for navigation
│   └── shared/
│       └── ProtectedRoute.tsx    # [NEW] Route protection HOC
├── contexts/
│   └── AuthContext.tsx           # [NEW] Authentication state management
├── hooks/
│   ├── useAuth.tsx               # [NEW] Authentication hook
│   └── useProtectedRoute.tsx     # [NEW] Route protection hook
├── services/
│   ├── api.ts                    # [MODIFIED] Add JWT token to all requests
│   └── authApi.ts                # [NEW] Auth API client (login, signup, logout)
├── types/
│   └── auth.ts                   # [NEW] Auth types (User, Session, AuthState)
└── middleware.ts                 # [NEW] Next.js middleware for route protection
```

**Structure Decision**: Web application structure (Option 2) selected. The project uses a clear frontend/backend separation with FastAPI backend (`backend/`) and Next.js frontend (`frontend/todo-app/`). This feature adds authentication infrastructure across both layers:
- Backend adds JWT middleware, auth service, user models, and user_id scoping to existing services
- Frontend adds auth pages, context provider, protected routes, and JWT handling in API client
- Database migration adds user_id columns to existing tables without changing core CRUD logic

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

**No violations detected** - All complexity is necessary and aligned with constitution:
- Sub-agent coordination required (5 agents: auth-expert, database-expert, backend-expert, frontend-expert, fullstack-architect)
- MCP server usage (BetterAuth) is mandated by spec
- Purple theme enforcement via Theme sub-agent
- Production-quality code with TypeScript strict mode and FastAPI best practices

---

## Phase 0: Research (COMPLETED)

**Output**: `research.md` - 8 research areas with decisions, rationale, and alternatives

**Key Findings**:
1. **BetterAuth Integration**: Use BetterAuth MCP server with FastAPI integration
2. **JWT Storage**: httpOnly cookies (XSS protection, spec requirement)
3. **FastAPI Middleware**: Dependency injection pattern with `Depends(get_current_user_id)`
4. **Database Migration**: Nullable user_id columns for backward compatibility
5. **Frontend State**: React Context API with custom hooks
6. **Route Protection**: Next.js middleware + useEffect client-side check
7. **User Feedback**: SweetAlert2 wrapper functions for consistent messaging
8. **Performance**: JWT validation caching with 5-minute TTL

**Status**: ✅ All research questions resolved. No NEEDS CLARIFICATION items remaining.

---

## Phase 1: Design & Contracts (COMPLETED)

### Phase 1 Outputs

**1. Data Model** (`data-model.md`):
- **New Entities**: User (4 attributes), Session (6 attributes)
- **Updated Entities**: Task (added user_id), History (added user_id)
- **Relationships**: User 1:N Task, User 1:N History, User 1:N Session
- **Indexes**: 5 new indexes for performance (user_id columns, composite index)
- **Migration Strategy**: 4-step backward-compatible migration with rollback plan
- **Security**: Authorization rules for all entities, password hashing, audit trail
- **Performance**: Estimated query times, 117 MB storage for 1K users

**2. API Contracts** (`contracts/`):
- **auth-api.yaml**: OpenAPI 3.0.3 spec for 4 auth endpoints
  - POST /auth/signup - User registration
  - POST /auth/login - User authentication
  - POST /auth/logout - Session destruction
  - GET /auth/me - Current user info
- **jwt-schema.json**: JWT payload schema with required claims (sub, exp, iat, iss, aud)
- **Cookie specifications**: httpOnly, Secure, SameSite=Lax, 30-day expiry

**3. Developer Quickstart** (`quickstart.md`):
- 7-section developer guide (Prerequisites → Next Steps)
- Step-by-step setup for backend and frontend
- 6 manual integration test scenarios
- Troubleshooting guide for common issues
- Security checklist for production deployment
- Performance verification commands

**4. Agent Context Update**:
- Ran `.specify/scripts/bash/update-agent-context.sh claude`
- Updated `CLAUDE.md` with authentication feature reference
- Status: ✅ Context update completed successfully

### Phase 1 Constitution Re-Check

**Post-Design Compliance Assessment**:

✅ **MCP Server Usage**:
- BetterAuth MCP server integration confirmed in architecture
- Installation check process documented in quickstart.md
- User approval flow defined for missing MCP server

✅ **Sub-Agent Delegation**:
- All 5 agents have clear responsibilities in data-model.md and quickstart.md
- auth-expert: BetterAuth integration, JWT patterns
- database-expert: Schema migration, indexes, foreign keys
- backend-expert: FastAPI middleware, service layer updates
- frontend-expert: Auth pages, route protection, context provider
- fullstack-architect: Integration testing, security validation

✅ **Code + UI Principles**:
- Purple theme (#8b5cf6) specified for login/signup pages
- Lucide icons planned (Lock, User, LogOut)
- TailwindCSS styling patterns documented
- SweetAlert2 integration patterns defined in research.md
- Production-quality standards maintained (TypeScript strict, FastAPI best practices)

✅ **Safety & Installation**:
- BetterAuth installation gated by user approval
- Quickstart documents installation verification steps
- Rollback procedures defined for database migration

✅ **Communication**:
- 6 SweetAlert2 message patterns defined (FR-011 to FR-016)
- Error responses specified in auth-api.yaml
- Clear user feedback for all auth operations

✅ **Decision Hierarchy**:
1. Constitution: All requirements followed
2. User Command: `/sp.plan` executed successfully
3. Sub-Agent Delegation: Roles assigned and documented
4. MCP Server Integration: BetterAuth architecture defined
5. Skills: No new skills required (existing infrastructure)
6. Creativity: Research findings document architecture decisions

**GATE STATUS**: ✅ PASS - Phase 1 design maintains full constitution compliance

---

## Phase 2: Task Generation (NOT STARTED)

**Status**: ⏸️ Waiting for `/sp.tasks` command

**Expected Output**: `tasks.md` with ordered, testable implementation tasks

**Task Categories** (preview based on design):
1. **Database Tasks**: Migration creation, schema updates, index creation
2. **Backend Auth Tasks**: BetterAuth service, JWT utilities, auth endpoints
3. **Backend Authorization Tasks**: Middleware, dependency injection, user_id scoping
4. **Frontend Auth Tasks**: Login/signup pages, auth context, hooks
5. **Frontend Protection Tasks**: Route guards, middleware, API client updates
6. **Testing Tasks**: Unit tests, integration tests, multi-user security tests
7. **Documentation Tasks**: API docs update, environment variable docs

**Recommended Next Command**: `/sp.tasks`

---

## Summary

**Planning Status**: ✅ COMPLETE (Phase 0 + Phase 1 finished)

**Artifacts Generated**:
- ✅ `plan.md` - This file (technical context, structure, constitution checks)
- ✅ `research.md` - 8 research areas with architecture decisions
- ✅ `data-model.md` - 4 entities, relationships, migration strategy
- ✅ `contracts/auth-api.yaml` - OpenAPI spec for 4 auth endpoints
- ✅ `contracts/jwt-schema.json` - JWT payload schema
- ✅ `quickstart.md` - 7-section developer setup guide
- ✅ Agent context updated (`CLAUDE.md`)

**Ready for Implementation**: Yes - all design decisions made, contracts defined, quickstart guide available

**Next Steps**:
1. Run `/sp.tasks` to generate ordered task list
2. Assign tasks to sub-agents (database-expert, backend-expert, frontend-expert, auth-expert, fullstack-architect)
3. Begin implementation following task order in `tasks.md`
4. Run tests frequently to catch regressions
5. Deploy to staging before production
