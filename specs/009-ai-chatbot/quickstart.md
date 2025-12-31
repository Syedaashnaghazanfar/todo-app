# Quickstart: AI Chatbot Phase 3

**Feature**: 009-ai-chatbot
**Date**: 2025-12-22

## Prerequisites

- Phase 2 backend running (FastAPI + PostgreSQL)
- Phase 2 frontend running (Next.js)
- OpenAI API key configured

## Backend Setup

### 1. Verify Dependencies (Already Installed)

```bash
cd phase-3/backend

# Dependencies should already be in pyproject.toml:
# - mcp>=1.25.0
# - openai>=2.14.0
# - openai-agents>=0.6.4
# - asyncpg>=0.31.0
```

### 2. Environment Variables

Add to `phase-3/backend/.env`:

```bash
# Existing Phase 2 variables
DATABASE_URL=postgresql://user:pass@host:5432/db
JWT_SECRET=your-jwt-secret
FRONTEND_URL=http://localhost:3000

# NEW: Phase 3 AI Configuration
OPENAI_API_KEY=sk-your-openai-api-key
LLM_PROVIDER=openai
OPENAI_DEFAULT_MODEL=gpt-4o-mini
```

### 3. Database Migration

```bash
cd phase-3/backend

# Generate migration for Conversation and Message tables
uv run alembic revision --autogenerate -m "Add conversation and message tables for Phase 3"

# Apply migration
uv run alembic upgrade head
```

### 4. Start Backend

```bash
cd phase-3/backend
uv run uvicorn main:app --reload --port 8000
```

## Frontend Setup

### 1. ChatKit CDN Script

Add to `phase-3/frontend/todo-app/app/layout.tsx`:

```tsx
import Script from "next/script";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {/* CRITICAL: Load ChatKit CDN script */}
        <Script
          src="https://cdn.platform.openai.com/deployments/chatkit/chatkit.js"
          strategy="afterInteractive"
        />
        {children}
      </body>
    </html>
  );
}
```

### 2. Environment Variables

Add to `phase-3/frontend/todo-app/.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 3. Start Frontend

```bash
cd phase-3/frontend/todo-app
npm run dev
```

## Verify Setup

### 1. Test Backend Health

```bash
curl http://localhost:8000/api/v1/health
# Expected: {"status": "healthy", "service": "todo-app-backend"}
```

### 2. Test Chat Endpoint (requires auth token)

```bash
# Get auth token first via login
TOKEN="your-jwt-token"

curl -X POST http://localhost:8000/api/v1/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "Add a task to buy groceries"}'
```

### 3. Access Chat UI

Navigate to: `http://localhost:3000/chat`

## File Structure (Phase 3 Additions)

```
phase-3/
├── backend/
│   ├── src/
│   │   ├── api/v1/
│   │   │   └── chat.py              # NEW: Chat endpoint
│   │   ├── database/
│   │   │   └── async_session.py     # NEW: Async sessions
│   │   ├── models/
│   │   │   ├── conversation.py      # NEW: Conversation model
│   │   │   └── message.py           # NEW: Message model
│   │   ├── services/
│   │   │   └── conversation_service.py  # NEW: Conversation service
│   │   ├── mcp_server/
│   │   │   ├── __init__.py          # NEW: MCP server init
│   │   │   ├── __main__.py          # NEW: MCP server entry
│   │   │   └── tools.py             # NEW: MCP tools
│   │   └── agent_config/
│   │       ├── factory.py           # NEW: Model factory
│   │       └── todo_agent.py        # NEW: Agent config
│   └── alembic/versions/
│       └── xxx_add_conversation_message.py  # NEW: Migration
│
└── frontend/todo-app/
    ├── app/
    │   ├── layout.tsx               # MODIFIED: Add ChatKit CDN
    │   └── chat/
    │       └── page.tsx             # NEW: Chat page
    └── components/
        └── chat/
            └── ChatWidget.tsx       # NEW: ChatKit widget
```

## Common Issues

### Backend Issues

**MCP Timeout Errors**:
```python
# In agent_config/todo_agent.py
MCPServerStdio(
    ...
    client_session_timeout_seconds=30.0  # Increase from default 5s
)
```

**Database Lock Errors**:
```python
# In agent_config/todo_agent.py
Agent(
    ...
    model_settings=ModelSettings(parallel_tool_calls=False)
)
```

### Frontend Issues

**Blank ChatKit Widget**:
1. Verify CDN script is loaded in layout.tsx
2. Check browser console for errors
3. Verify api.url points to correct backend

**CORS Errors**:
1. Verify FRONTEND_URL in backend .env
2. Check CORS middleware in main.py

## Next Steps

1. Run `/sp.tasks` to generate implementation tasks
2. Use `chatkit-backend-engineer` for backend tasks
3. Use `chatkit-frontend-engineer` for frontend tasks
