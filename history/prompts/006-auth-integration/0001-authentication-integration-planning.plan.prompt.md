---
id: 0001
title: authentication-integration-planning
stage: plan
date: 2025-12-15
surface: agent
model: claude-sonnet-4-5
feature: 006-auth-integration
branch: 006-auth-integration
user: user
command: /sp.plan
labels: ["authentication", "betterauth", "jwt", "planning", "architecture", "security"]
links:
  spec: specs/006-auth-integration/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/006-auth-integration/plan.md
  - specs/006-auth-integration/research.md
  - specs/006-auth-integration/data-model.md
  - specs/006-auth-integration/quickstart.md
  - specs/006-auth-integration/contracts/auth-api.yaml
  - specs/006-auth-integration/contracts/jwt-schema.json
  - CLAUDE.md (updated with feature context)
tests:
  - Constitution check: PASS (Phase 0 and Phase 1)
  - All research questions resolved
  - Data model validation: Complete (4 entities, relationships, migration strategy)
  - API contracts generated: 4 auth endpoints (OpenAPI 3.0.3)
---

## Prompt

User executed `/sp.plan` command to create technical architecture plan for authentication integration feature (006-auth-integration). The feature specification was already complete with 43 functional requirements, 6 prioritized user stories, and comprehensive security requirements for integrating BetterAuth with NeonDB PostgreSQL.

## Response snapshot

Successfully completed Phase 0 (Research) and Phase 1 (Design & Contracts) of the planning workflow:

### Phase 0: Research (8 Areas)
1. **BetterAuth Integration**: Decided to use BetterAuth MCP server with FastAPI backend integration (constitution-mandated)
2. **JWT Storage**: httpOnly cookies for XSS protection (spec requirement)
3. **FastAPI Middleware**: Dependency injection pattern using `Depends(get_current_user_id)`
4. **Database Migration**: Nullable user_id columns for backward compatibility with existing data
5. **Frontend State**: React Context API with custom hooks (no additional dependencies)
6. **Route Protection**: Next.js middleware + useEffect two-layer protection
7. **User Feedback**: SweetAlert2 wrapper functions for 6 auth scenarios
8. **Performance**: JWT validation caching with 5-minute TTL to meet <50ms overhead requirement

### Phase 1: Design & Contracts

**Data Model** (data-model.md):
- New entities: User (4 attributes), Session (6 attributes)
- Updated entities: Task (added user_id FK), History (added user_id FK)
- Entity relationships: User 1:N Task, User 1:N History, User 1:N Session
- 5 new database indexes for performance optimization
- 4-step migration strategy with rollback plan
- Authorization rules for all entities
- Storage estimate: 117 MB for 1K users

**API Contracts** (contracts/):
- **auth-api.yaml**: OpenAPI 3.0.3 specification for authentication
  - POST /auth/signup - User registration with email/password
  - POST /auth/login - User authentication (returns JWT in httpOnly cookie)
  - POST /auth/logout - Session destruction
  - GET /auth/me - Current authenticated user info
- **jwt-schema.json**: JWT payload schema (sub, email, exp, iat, iss, aud claims)
- Cookie specifications: httpOnly, Secure, SameSite=Lax, 30-day expiry

**Developer Quickstart** (quickstart.md):
- 7-section guide: Prerequisites → Next Steps
- Step-by-step backend setup (Python dependencies, env vars, migration)
- Step-by-step frontend setup (Node dependencies, env vars, file creation)
- 6 manual integration test scenarios (signup, login, route protection, user isolation, session persistence, logout)
- Troubleshooting guide for 5 common issues
- Security checklist for production deployment
- Performance verification commands

**Agent Context Update**:
- Ran `.specify/scripts/bash/update-agent-context.sh claude`
- Updated CLAUDE.md with authentication integration reference
- Status: Completed successfully

### Constitution Compliance

**Initial Check (Phase 0)**: ✅ PASS
- MCP server usage: BetterAuth required with user approval check
- Sub-agent delegation: 5 agents assigned (auth-expert, database-expert, backend-expert, frontend-expert, fullstack-architect)
- Code + UI principles: Purple theme, Lucide icons, TailwindCSS, SweetAlert2, production quality
- Safety & installation: User approval gated for BetterAuth MCP installation
- Communication: Clear error messages via SweetAlert2 (6 scenarios)
- Decision hierarchy: All levels followed

**Post-Design Check (Phase 1)**: ✅ PASS
- All constitution requirements maintained through design phase
- Sub-agent responsibilities clearly documented
- BetterAuth installation verification steps in quickstart
- Purple theme specified for login/signup pages
- Security best practices enforced (httpOnly cookies, JWT validation, user isolation)

### Project Structure

**Documentation**:
- plan.md - Technical context, architecture decisions, constitution checks
- research.md - 8 research areas with decisions and rationale
- data-model.md - Entity definitions, relationships, migration strategy
- quickstart.md - Developer setup and testing guide
- contracts/auth-api.yaml - OpenAPI spec
- contracts/jwt-schema.json - JWT payload schema

**Source Code Structure** (Web application):
- Backend: FastAPI with JWT middleware, auth service, user models, user_id scoping on existing endpoints
- Frontend: Next.js with auth pages, route protection, auth context, SweetAlert2 integration
- Database: Alembic migration for user_id columns with backward compatibility

## Outcome

- ✅ Impact: Complete technical architecture for authentication integration defined. All design decisions documented, API contracts specified, developer quickstart ready. Zero ambiguities remaining - ready for task generation and implementation.
- 🧪 Tests: Constitution checks PASS (Phase 0 + Phase 1), research complete (8 areas), data model validated (4 entities), API contracts complete (4 endpoints), agent context updated successfully
- 📁 Files: Created 6 planning artifacts (plan.md, research.md, data-model.md, quickstart.md, auth-api.yaml, jwt-schema.json), updated 1 file (CLAUDE.md)
- 🔁 Next prompts: Run `/sp.tasks` to generate ordered implementation tasks, assign tasks to sub-agents, begin database migration (lowest risk foundation)
- 🧠 Reflection: Planning phase exceptionally comprehensive. Research phase resolved all 8 architectural decisions with clear rationale. Data model includes performance optimization (5 indexes) and backward compatibility (nullable user_id). API contracts follow OpenAPI 3.0.3 best practices. Quickstart provides clear path from setup to deployment. Constitution compliance maintained throughout both phases. Ready for immediate task generation.

## Evaluation notes (flywheel)

- Failure modes observed: None. All phases completed successfully without errors or clarification needs.
- Graders run and results (PASS/FAIL): CONSTITUTION_PHASE0=PASS, CONSTITUTION_PHASE1=PASS, RESEARCH_COMPLETE=PASS, DATA_MODEL=PASS, API_CONTRACTS=PASS, QUICKSTART=PASS, AGENT_CONTEXT_UPDATE=PASS
- Prompt variant (if applicable): N/A (standard /sp.plan workflow)
- Next experiment (smallest change to try): None - planning is complete. Proceed to `/sp.tasks` for task generation.
