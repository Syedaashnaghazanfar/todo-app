# Phase 0: Research & Discovery

**Feature**: 009-ai-chatbot
**Date**: 2025-12-22
**Status**: Complete

## 1. Technical Context Resolution

### 1.1 Existing Phase 2 Analysis

**Backend Structure** (phase-3/backend/):
- **Framework**: FastAPI 0.124.0
- **Database**: PostgreSQL (Neon) via SQLAlchemy 2.0+
- **ORM**: SQLAlchemy with SQLModel patterns
- **Auth**: Better Auth with JWT tokens
- **Task Model**: UUID primary key, user_id (String), priority, tags, due_date, status

**Frontend Structure** (phase-3/frontend/todo-app/):
- **Framework**: Next.js 16.0.10
- **React**: 19.2.1
- **Styling**: TailwindCSS 4
- **State**: Zustand
- **Auth**: Better Auth integration

**Existing Services**:
- `TaskService` - Complete CRUD with user isolation
- `AuthService` - JWT validation
- `NotificationService` - Task notifications

### 1.2 Dependencies Status

**Backend (pyproject.toml) - INSTALLED**:
- ✅ `mcp>=1.25.0` - Official MCP Python SDK with FastMCP
- ✅ `openai>=2.14.0` - OpenAI Python SDK
- ✅ `openai-agents>=0.6.4` - OpenAI Agents SDK
- ✅ `asyncpg>=0.31.0` - Async PostgreSQL driver

**Frontend (package.json) - NO ADDITIONAL PACKAGES NEEDED**:
- ChatKit uses CDN script (not npm package)
- Existing packages sufficient

### 1.3 Key Patterns from Phase 2

**User Isolation Pattern** (task_service.py:100-128):
```python
def get_task(db: Session, task_id: UUID, user_id: str) -> Task:
    task = db.query(Task).filter(Task.id == task_id).first()
    if task.user_id != user_id:
        raise HTTPException(status_code=403, detail="Access forbidden")
    return task
```

**Task Model Fields** (task.py):
- `id`: UUID (primary key)
- `title`: String(255)
- `description`: Text
- `is_completed`: Boolean
- `priority`: String(20) - VERY_IMPORTANT, HIGH, MEDIUM, LOW
- `status`: String(20) - NOT_STARTED, IN_PROGRESS, COMPLETED
- `user_id`: String(36) - FK to users.id
- `tags`: JSONB
- `due_date`: DateTime

## 2. Technology Decisions

### 2.1 MCP Server Implementation

**Decision**: Use FastMCP from Official MCP Python SDK

**Rationale**:
- Per Constitution P3-I: "MCP tools MUST use `from mcp.server.fastmcp import FastMCP`"
- 80% less boilerplate than legacy Server class
- Automatic type safety with plain Python return types
- Better integration with OpenAI Agents SDK

**Alternatives Rejected**:
- Legacy `mcp.server.Server` - FORBIDDEN by Constitution P3-I
- Custom tool implementations - Would duplicate TaskService logic

### 2.2 Agent SDK Integration

**Decision**: Use OpenAI Agents SDK with MCPServerStdio transport

**Rationale**:
- Per Constitution P3-I: "Agent orchestration MUST use `from agents import Agent, Runner`"
- Supports multiple LLM providers (OpenAI, Gemini, Groq, OpenRouter)
- Clean separation between agent logic and tool implementation
- Built-in streaming support

**Configuration**:
```python
MCPServerStdio(
    name="task-management-server",
    params={"command": "python", "args": ["-m", "mcp_server"]},
    client_session_timeout_seconds=30.0  # Increased from default 5s
)
```

### 2.3 Database Architecture

**Decision**: Add async session for chat endpoints only, keep sync for existing Phase 2

**Rationale**:
- Per Constitution P3-II: Stateless architecture requires async for non-blocking
- Phase 2 endpoints continue working unchanged
- New async engine uses same DATABASE_URL with asyncpg driver

**Implementation**:
- New file: `src/database/async_session.py`
- Converts `postgresql://` to `postgresql+asyncpg://`
- FastAPI dependency: `get_async_session()`

### 2.4 Conversation Persistence

**Decision**: New Conversation and Message models with 2-day expiration

**Rationale**:
- Per Constitution P3-V: Messages MUST have 2-day expiration
- Per FR-006/FR-007: Persist and load conversation history

**Models**:
- `Conversation`: id (int), user_id (str), title, is_active, created_at, updated_at
- `Message`: id (int), conversation_id, user_id, role, content, tool_calls (JSON), created_at, expires_at

### 2.5 Frontend Integration

**Decision**: ChatKit CDN script with custom backend mode

**Rationale**:
- ChatKit provides modern chat UI without heavy npm dependencies
- Custom `api.url` points to backend chat endpoint
- Better Auth token injected via custom fetch

**Configuration**:
```tsx
<ChatKit
  api={{
    url: `${process.env.NEXT_PUBLIC_API_URL}/api/v1/chat`,
    fetch: (url, options) => fetch(url, {
      ...options,
      headers: { ...options.headers, Authorization: `Bearer ${token}` }
    })
  }}
/>
```

## 3. Architecture Decisions

### 3.1 Subagent Delegation

**Backend Tasks** → `chatkit-backend-engineer`:
- MCP server with 5 tools (add_task, list_tasks, complete_task, delete_task, update_task)
- Agent configuration with instructions
- Chat endpoint with SSE streaming
- Conversation service
- Database models and migrations

**Frontend Tasks** → `chatkit-frontend-engineer`:
- ChatKit CDN script loading
- Chat page component
- Widget configuration
- Authentication integration
- Theme consistency (purple)

### 3.2 Request Flow

```
User Message → ChatKit Widget
    ↓
POST /api/v1/chat (with JWT)
    ↓
Load conversation history from DB (stateless)
    ↓
Run Agent with MCP tools
    ↓
MCP tools call TaskService
    ↓
Stream response via SSE
    ↓
Save assistant response to DB
    ↓
ChatKit renders streaming text
```

### 3.3 Security Model

- All requests require valid JWT token
- All MCP tools receive user_id from authenticated context
- All database queries filter by user_id
- No cross-user data access possible

## 4. Implementation Priorities

### Phase 1: Backend Foundation (chatkit-backend-engineer)
1. Database models (Conversation, Message)
2. Alembic migration
3. MCP server with 5 tools
4. Async conversation service

### Phase 2: Agent Integration (chatkit-backend-engineer)
1. Agent instructions
2. Model factory (multi-provider)
3. Chat endpoint with SSE
4. JWT integration
5. Error handling and retry logic

### Phase 3: Frontend Integration (chatkit-frontend-engineer)
1. ChatKit CDN script in layout
2. Chat page component
3. Widget configuration
4. Auth token injection
5. Purple theme styling

### Phase 4: Testing & Cleanup (both subagents)
1. MCP tool unit tests
2. Conversation service tests
3. Integration tests
4. Message cleanup task

## 5. Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| MCP timeout on slow queries | Set `client_session_timeout_seconds=30` |
| Parallel tool calls causing DB locks | Set `parallel_tool_calls=False` in ModelSettings |
| ChatKit CDN not loading | Verify Script tag in layout.tsx |
| Token expiry during long chat | Frontend handles 401 with re-auth |
| Message table growth | Daily cleanup task + 2-day expiration |

## 6. Research Complete

All NEEDS CLARIFICATION items resolved. Ready for Phase 1 design.
