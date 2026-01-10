# Implementation Plan: AI-Powered Task Management Chatbot

**Branch**: `009-ai-chatbot` | **Date**: 2025-12-22 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/009-ai-chatbot/spec.md`

## Summary

Build an AI-powered chatbot interface that allows users to manage tasks through natural language conversations. The system uses OpenAI Agents SDK with FastMCP for tool orchestration, a stateless architecture with database-backed conversation persistence, and ChatKit for the frontend UI. Implementation follows mandatory subagent delegation: `chatkit-backend-engineer` for all backend work and `chatkit-frontend-engineer` for all frontend work.

## Technical Context

**Language/Version**: Python 3.11 (backend), TypeScript 5.x (frontend)
**Primary Dependencies**:
- Backend: FastAPI 0.124.0, OpenAI Agents SDK 0.6.4+, MCP 1.25.0+, SQLAlchemy 2.0+
- Frontend: Next.js 16.0.10, React 19.2.1, ChatKit CDN

**Storage**: PostgreSQL (Neon) - existing Phase 2 database + new Conversation/Message tables
**Testing**: pytest, pytest-asyncio (backend), Jest (frontend)
**Target Platform**: Linux server (backend), Web browser (frontend)
**Project Type**: Web application (full-stack)
**Performance Goals**: <500ms streaming start, 100 concurrent sessions
**Constraints**: Stateless backend (per P3-II), 2-day message retention (per P3-V)
**Scale/Scope**: Existing Phase 2 user base, ~10k conversations/day capacity

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Phase 3 AI Chatbot Principles (v2.1.0)

| Principle | Requirement | Implementation | Status |
|-----------|-------------|----------------|--------|
| **P3-I: SDK Mandate** | Use OpenAI Agents SDK + FastMCP | `from agents import Agent, Runner` + `from mcp.server.fastmcp import FastMCP` | ✅ Compliant |
| **P3-II: Stateless Architecture** | No in-memory state | Load history from DB on every request | ✅ Compliant |
| **P3-III: MCP Tool Design** | Single-purpose, delegate to TaskService | 5 tools, all delegate to existing TaskService | ✅ Compliant |
| **P3-IV: User Isolation** | All tools validate user_id | user_id parameter on all tools, filtered queries | ✅ Compliant |
| **P3-V: Conversation Persistence** | 2-day expiration, daily cleanup | expires_at field + cleanup task | ✅ Compliant |
| **P3-VI: Agent Determinism** | Explicit instructions, friendly responses | Detailed agent instructions | ✅ Compliant |
| **P3-VII: Testing Requirements** | Unit + integration + contract tests | Test files for all components | ✅ Compliant |

### Phase 2 Architecture Principles

| Principle | Requirement | Implementation | Status |
|-----------|-------------|----------------|--------|
| **Sub-Agent Usage** | Delegate to appropriate sub-agents | chatkit-backend-engineer + chatkit-frontend-engineer | ✅ Compliant |
| **Skill Usage** | Leverage existing skills | openai-chatkit-backend-python, openai-agents-mcp-integration, openai-chatkit-frontend-embed-skill | ✅ Compliant |
| **Code + UI Principles** | Purple theme, Lucide icons | ChatKit with purple theme config | ✅ Compliant |

**GATE STATUS**: ✅ PASSED - All principles satisfied

## Project Structure

### Documentation (this feature)

```text
specs/009-ai-chatbot/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 research
├── data-model.md        # Database models
├── quickstart.md        # Setup guide
├── contracts/
│   ├── chat-api.yaml    # OpenAPI spec
│   └── mcp-tools.md     # MCP tool contracts
├── checklists/
│   └── requirements.md  # Quality checklist
└── tasks.md             # Implementation tasks (created by /sp.tasks)
```

### Source Code (phase-3 directory)

```text
phase-3/
├── backend/
│   ├── src/
│   │   ├── api/v1/
│   │   │   ├── chat.py              # NEW: Chat endpoint (SSE streaming)
│   │   │   └── conversations.py     # NEW: Conversation management
│   │   ├── database/
│   │   │   ├── connection.py        # EXISTING
│   │   │   └── async_session.py     # NEW: Async session for chat
│   │   ├── models/
│   │   │   ├── task.py              # EXISTING
│   │   │   ├── user.py              # EXISTING
│   │   │   ├── conversation.py      # NEW: Conversation model
│   │   │   └── message.py           # NEW: Message model
│   │   ├── services/
│   │   │   ├── task_service.py      # EXISTING (used by MCP tools)
│   │   │   └── conversation_service.py  # NEW: Async conversation service
│   │   ├── mcp_server/
│   │   │   ├── __init__.py          # NEW: Package init
│   │   │   ├── __main__.py          # NEW: Entry point (python -m mcp_server)
│   │   │   └── tools.py             # NEW: 5 MCP tools
│   │   ├── agent_config/
│   │   │   ├── factory.py           # NEW: Multi-provider model factory
│   │   │   └── todo_agent.py        # NEW: Agent with instructions
│   │   └── tasks/
│   │       └── message_cleanup.py   # NEW: Daily cleanup task
│   ├── alembic/versions/
│   │   └── xxx_add_conversation_message.py  # NEW: Migration
│   ├── tests/
│   │   ├── unit/
│   │   │   ├── test_mcp_tools.py    # NEW: MCP tool tests
│   │   │   └── test_conversation_service.py  # NEW: Service tests
│   │   ├── integration/
│   │   │   └── test_chat_endpoint.py  # NEW: Endpoint tests
│   │   └── contract/
│   │       └── test_chat_api.py     # NEW: Contract tests
│   └── main.py                      # MODIFIED: Add chat router
│
└── frontend/todo-app/
    ├── app/
    │   ├── layout.tsx               # MODIFIED: Add ChatKit CDN script
    │   └── chat/
    │       └── page.tsx             # NEW: Chat page
    └── components/
        └── chat/
            └── ChatWidget.tsx       # NEW: ChatKit widget component
```

**Structure Decision**: Web application (Option 2) - Working within existing `phase-3` directory structure. Backend additions integrate with existing FastAPI app. Frontend additions integrate with existing Next.js app.

## Subagent Delegation Matrix

### chatkit-backend-engineer (Skills: openai-chatkit-backend-python, openai-agents-mcp-integration)

| Component | Files | Responsibility |
|-----------|-------|----------------|
| Database Models | `models/conversation.py`, `models/message.py` | Define Conversation and Message SQLModel classes |
| Async Session | `database/async_session.py` | Create async database session factory |
| Conversation Service | `services/conversation_service.py` | Async CRUD operations for conversations |
| MCP Server | `mcp_server/tools.py`, `mcp_server/__main__.py` | 5 task management tools with FastMCP |
| Agent Config | `agent_config/factory.py`, `agent_config/todo_agent.py` | Model factory + agent instructions |
| Chat Endpoint | `api/v1/chat.py` | SSE streaming endpoint with JWT auth |
| Message Cleanup | `tasks/message_cleanup.py` | Daily expired message deletion |
| Database Migration | `alembic/versions/xxx_*.py` | Create conversation/message tables |
| Backend Tests | `tests/unit/*`, `tests/integration/*`, `tests/contract/*` | Unit, integration, contract tests |

### chatkit-frontend-engineer (Skills: openai-chatkit-frontend-embed-skill)

| Component | Files | Responsibility |
|-----------|-------|----------------|
| Layout Script | `app/layout.tsx` | Add ChatKit CDN script tag |
| Chat Page | `app/chat/page.tsx` | Chat page with widget container |
| Chat Widget | `components/chat/ChatWidget.tsx` | ChatKit configuration and rendering |
| Auth Integration | Widget config | Inject Better Auth JWT token |
| Theme Styling | Widget config | Purple theme customization |

## Implementation Phases

### Phase 1: Backend Foundation (chatkit-backend-engineer)

**Estimated Complexity**: Medium
**Dependencies**: None

1. **Database Models**
   - Create `src/models/conversation.py` with Conversation class
   - Create `src/models/message.py` with Message class + 2-day expiration
   - Update `src/models/__init__.py` exports

2. **Async Database Session**
   - Create `src/database/async_session.py` with AsyncSession factory
   - Update `src/database/__init__.py` exports

3. **Database Migration**
   - Generate Alembic migration for new tables
   - Apply migration to Neon database

4. **Conversation Service**
   - Create `src/services/conversation_service.py`
   - Implement: get_or_create_conversation, add_message, get_conversation_history

### Phase 2: MCP Server & Agent (chatkit-backend-engineer)

**Estimated Complexity**: High
**Dependencies**: Phase 1 complete

1. **MCP Server**
   - Create `src/mcp_server/__init__.py`
   - Create `src/mcp_server/__main__.py` entry point
   - Create `src/mcp_server/tools.py` with 5 tools:
     - add_task
     - list_tasks
     - complete_task
     - delete_task
     - update_task

2. **Model Factory**
   - Create `src/agent_config/factory.py`
   - Support: OpenAI, Gemini, Groq, OpenRouter

3. **Agent Configuration**
   - Create `src/agent_config/todo_agent.py`
   - Define agent instructions for natural language understanding
   - Configure MCPServerStdio with 30s timeout

### Phase 3: Chat Endpoint (chatkit-backend-engineer)

**Estimated Complexity**: High
**Dependencies**: Phase 2 complete

1. **Chat API Endpoint**
   - Create `src/api/v1/chat.py`
   - Implement POST /api/v1/chat with SSE streaming
   - JWT authentication via get_current_user_id dependency
   - Stateless request handling:
     1. Load conversation history
     2. Save user message
     3. Run agent with MCP server
     4. Stream response
     5. Save assistant message

2. **Integration with Main App**
   - Update `main.py` to include chat router

3. **Message Cleanup Task**
   - Create `src/tasks/message_cleanup.py`
   - Implement daily cleanup of expired messages

### Phase 4: Frontend Integration (chatkit-frontend-engineer)

**Estimated Complexity**: Medium
**Dependencies**: Phase 3 complete

1. **ChatKit CDN Script**
   - Modify `app/layout.tsx` to include ChatKit CDN script

2. **Chat Page**
   - Create `app/chat/page.tsx` with protected route

3. **Chat Widget Component**
   - Create `components/chat/ChatWidget.tsx`
   - Configure api.url to backend endpoint
   - Inject JWT token via custom fetch
   - Apply purple theme styling

### Phase 5: Testing & Validation (both subagents)

**Estimated Complexity**: Medium
**Dependencies**: Phase 4 complete

1. **Backend Tests** (chatkit-backend-engineer)
   - Unit tests for MCP tools
   - Unit tests for conversation service
   - Integration tests for chat endpoint
   - Contract tests for API schema

2. **Frontend Tests** (chatkit-frontend-engineer)
   - Component tests for ChatWidget
   - Integration test for chat flow

3. **End-to-End Validation**
   - Test complete flow: user message → task created
   - Verify conversation persistence
   - Verify user isolation

## Risk Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| MCP timeout on slow queries | Medium | High | Set `client_session_timeout_seconds=30` |
| Parallel tool calls causing DB locks | Medium | High | Set `parallel_tool_calls=False` |
| ChatKit CDN not loading | Low | High | Verify Script tag, check console |
| OpenAI rate limits | Medium | Medium | Implement retry with exponential backoff |
| Message table growth | Medium | Medium | Daily cleanup task + expires_at index |

## Complexity Tracking

> No violations. All implementations follow Constitution principles without requiring complexity justifications.

## Next Steps

1. Run `/sp.tasks` to generate detailed implementation tasks
2. Execute Phase 1-3 using `chatkit-backend-engineer` subagent
3. Execute Phase 4 using `chatkit-frontend-engineer` subagent
4. Execute Phase 5 using both subagents for respective tests
