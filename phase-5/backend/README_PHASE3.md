# Phase 3 Backend - AI Chat Endpoint

## Quick Start

### 1. Set API Key

Add to `.env` file:

```bash
LLM_PROVIDER=openrouter
OPENROUTER_API_KEY=sk-or-v1-your-actual-key-here
OPENROUTER_DEFAULT_MODEL=meta-llama/llama-3.2-3b-instruct:free
```

Get free API key: https://openrouter.ai/keys

### 2. Verify Setup

```bash
python test_chat_endpoint.py
```

### 3. Start Backend

```bash
uvicorn main:app --reload --port 8000
```

### 4. Test Chat Endpoint

```bash
# Get JWT token (login)
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email": "your@email.com", "password": "password"}'

# Send chat message
curl -X POST http://localhost:8000/api/v1/chat \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{"message": "Add a task to buy groceries"}'
```

## Supported LLM Providers

| Provider | Free Tier | API Key Env Var | Docs |
|----------|-----------|----------------|------|
| **OpenRouter** (Recommended) | ✅ Yes | OPENROUTER_API_KEY | [openrouter.ai/keys](https://openrouter.ai/keys) |
| OpenAI | ❌ No | OPENAI_API_KEY | [platform.openai.com](https://platform.openai.com/api-keys) |
| Gemini | ✅ Yes | GEMINI_API_KEY | [aistudio.google.com](https://aistudio.google.com/app/apikey) |
| Groq | ✅ Yes | GROQ_API_KEY | [console.groq.com](https://console.groq.com/keys) |

## Natural Language Examples

### Task Creation
- "Add a task to buy groceries"
- "Remind me to call mom"
- "Add an urgent task to fix the bug"

### Task Listing
- "Show me all my tasks"
- "What's pending?"
- "What have I completed?"

### Task Completion
- "Mark task as complete"
- "I finished buying groceries"

### Task Deletion
- "Delete the meeting task"
- "Remove task 2"

### Task Update
- "Change task to 'Buy groceries and fruits'"
- "Update the description"

## Architecture

```
POST /api/v1/chat
  ↓
JWT Authentication (get_current_user_id)
  ↓
Load Conversation History (stateless)
  ↓
Save User Message
  ↓
Run Agent with MCP Server
  ↓
Stream Response via SSE
  ↓
Save Assistant Response
```

## Available MCP Tools

1. **add_task**: Create new task
2. **list_tasks**: Filter tasks (all, pending, completed)
3. **complete_task**: Mark task as done
4. **delete_task**: Remove task
5. **update_task**: Modify task details

## Files

- `src/api/v1/chat.py` - Chat endpoint with SSE streaming
- `src/agent_config/todo_agent.py` - Agent with MCP server
- `src/agent_config/factory.py` - Multi-provider model factory
- `src/mcp_server/tools.py` - FastMCP tools
- `src/services/conversation_service.py` - Async conversation persistence
- `test_chat_endpoint.py` - Verification script

## Troubleshooting

### "OPENROUTER_API_KEY not configured"
Add your API key to `.env` file. Get free key: https://openrouter.ai/keys

### "Database connection failed"
Check `DATABASE_URL` in `.env` file.

### "MCP server timeout"
Increase timeout in `agent_config/todo_agent.py`:
```python
client_session_timeout_seconds=60.0
```

## Documentation

- **Full Implementation Summary**: `../IMPLEMENTATION_SUMMARY_US1.md`
- **Phase 3 Overview**: `../CLAUDE.md`
- **OpenAI Agents Skill**: `../../.claude/skills/openai-agents-mcp-integration/`
- **ChatKit Backend Skill**: `../../.claude/skills/openai-chatkit-backend-python/`

---

**Status**: ✅ Production Ready (pending API key configuration)
**Tasks Complete**: T028-T034 (User Story 1)
**Next**: User Story 2 - List Tasks via Natural Language
