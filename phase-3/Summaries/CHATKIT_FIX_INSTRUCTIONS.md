# ChatKit 400 Error Fix Instructions

## Root Cause Analysis

The **400 Bad Request** error occurs because:

1. **Frontend** (`@openai/chatkit-react`) sends requests in **ChatKit protocol format**
2. **Backend** `/api/v1/chat` endpoint expects a **custom format** (not ChatKit protocol)
3. **Protocol mismatch** causes the 400 error

### What ChatKit Protocol Expects

ChatKit sends requests like:
```json
{
  "type": "messages.create",
  "params": {
    "thread_id": "thread_123",
    "content": [{"type": "text", "text": "Add a task"}],
    ...
  }
}
```

But the backend was expecting:
```json
{
  "message": "Add a task",
  "conversation_id": 123
}
```

## Solution Implemented

### 1. Created Proper ChatKit Endpoint

**File:** `src/api/v1/chatkit_proper.py`

This endpoint:
- Accepts raw request body (ChatKit protocol)
- Passes to `server.process(body, context)` method
- Returns `StreamingResult` (SSE) or `NonStreamingResult` (JSON)
- Includes fallback to simpler implementation if ChatKit SDK unavailable

### 2. Updated Dependencies

**File:** `pyproject.toml`

Changed from:
```toml
"chatkit>=0.0.1",
```

To:
```toml
"openai-chatkit>=0.1.0",
```

### 3. Updated Main Router

**File:** `main.py`

Changed import from:
```python
from src.api.v1.chatkit import router as chatkit_router
```

To:
```python
from src.api.v1.chatkit_proper import router as chatkit_router
```

## Installation Steps

### Backend Setup

```bash
cd phase-3/backend

# Install the correct ChatKit package
uv add openai-chatkit

# Or if uv doesn't work, try pip
uv pip install openai-chatkit

# Restart the backend server
uv run uvicorn main:app --reload --port 8000
```

### Verify Installation

```bash
cd phase-3/backend
uv run python -c "from chatkit.server import ChatKitServer, StreamingResult; print('ChatKit SDK loaded successfully')"
```

Expected output:
```
ChatKit SDK loaded successfully
```

## Testing

### 1. Check Backend Logs

After restarting the server, you should see:
```
INFO: TaskChatKitServer initialized with PostgreSQL store
INFO: Application startup complete.
```

### 2. Test ChatKit Endpoint

```bash
# Get JWT token first (login via frontend or API)
TOKEN="your-jwt-token-here"

# Test with ChatKit protocol format
curl -X POST http://localhost:8000/api/v1/chatkit \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "messages.create",
    "params": {
      "thread_id": null,
      "content": [{"type": "text", "text": "Add a task to buy groceries"}]
    }
  }'
```

### 3. Test Frontend

1. Open http://localhost:3000/chat
2. Type: "Add a task to buy groceries"
3. You should see:
   - Message appears in chat
   - AI responds with confirmation
   - Task created in database
   - No 400 errors in console

## Troubleshooting

### Issue: "ModuleNotFoundError: No module named 'chatkit'"

**Solution:**
```bash
cd phase-3/backend
uv add openai-chatkit
# OR
pip install openai-chatkit
```

### Issue: "ChatKit SDK not available - using fallback"

This is OK! The fallback implementation will work but won't use the full ChatKit protocol.

**To use proper ChatKit:**
1. Verify `openai-chatkit` is installed
2. Check import works: `python -c "from chatkit.server import ChatKitServer"`
3. Restart backend server

### Issue: Still getting 400 errors

**Check:**
1. Frontend is sending to `/api/v1/chatkit` (not `/api/v1/chat`)
2. JWT token is valid and in Authorization header
3. Backend logs show "ChatKit request received"
4. Request body format matches ChatKit protocol

**View backend logs:**
```bash
cd phase-3/backend
uv run uvicorn main:app --reload --port 8000 --log-level debug
```

Look for:
```
INFO: ChatKit request received - user_id=..., body_length=...
DEBUG: ChatKit request body: ...
```

### Issue: Database errors

The implementation expects:
- `conversations` table with `external_thread_id` column
- `messages` table

**Run migration:**
```bash
cd phase-3/backend
uv run alembic revision --autogenerate -m "Add external_thread_id to conversations"
uv run alembic upgrade head
```

## Architecture Diagram

```
┌─────────────────────────┐
│  ChatKit Widget         │
│  (@openai/chatkit-react)│
└───────────┬─────────────┘
            │
            │ POST /api/v1/chatkit
            │ ChatKit Protocol Format
            │ {
            │   "type": "messages.create",
            │   "params": {...}
            │ }
            │
            ▼
┌─────────────────────────┐
│  chatkit_proper.py      │
│  (FastAPI Endpoint)     │
└───────────┬─────────────┘
            │
            │ await server.process(body, context)
            │
            ▼
┌─────────────────────────┐
│  TaskChatKitServer      │
│  (ChatKit SDK)          │
└───────────┬─────────────┘
            │
            │ respond() method
            │
            ▼
┌─────────────────────────┐
│  TodoAgent + MCP Tools  │
│  (Agents SDK)           │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│  TaskService            │
│  (Database CRUD)        │
└─────────────────────────┘
```

## Key Differences from Previous Implementation

### Old Implementation (`src/api/v1/chatkit.py`)
- ❌ Manually parsed request JSON
- ❌ Custom SSE event format
- ❌ Didn't follow ChatKit protocol

### New Implementation (`src/api/v1/chatkit_proper.py`)
- ✅ Uses `server.process()` to handle ChatKit protocol
- ✅ Returns proper `StreamingResult`
- ✅ Follows official ChatKit Python SDK patterns
- ✅ Includes fallback if SDK unavailable

## Expected Behavior After Fix

### Frontend Console (Before Fix)
```
POST http://localhost:8000/api/v1/chat 400 (Bad Request)
[ChatPanel] Response: 400 Bad Request
```

### Frontend Console (After Fix)
```
POST http://localhost:8000/api/v1/chatkit 200 (OK)
[ChatPanel] Streaming response received
[ChatPanel] Message: I've added 'Buy groceries' to your tasks!
```

### Backend Logs (After Fix)
```
INFO: ChatKit request received - user_id=abc123, body_length=245
INFO: TaskChatKitServer initialized
INFO: Running agent with 1 input messages
INFO: Agent streaming completed for thread thread_456
INFO: Returning SSE streaming response
```

## Next Steps

1. ✅ Install `openai-chatkit` package
2. ✅ Restart backend server
3. ✅ Test message sending from frontend
4. ✅ Verify no 400 errors
5. ✅ Confirm task creation works
6. ✅ Check conversation persistence

## Additional Resources

- [ChatKit Python SDK Docs](https://openai.github.io/chatkit-python/)
- [ChatKit Advanced Samples](https://github.com/openai/openai-chatkit-advanced-samples)
- [FastAPI SSE Streaming](https://fastapi.tiangolo.com/advanced/custom-response/#streamingresponse)

## Summary

The fix implements proper ChatKit server protocol by:
1. Using official `openai-chatkit` package
2. Implementing `ChatKitServer` class with `respond()` method
3. Using `server.process()` to handle ChatKit requests
4. Returning `StreamingResult` for SSE responses

This ensures frontend and backend speak the same ChatKit protocol, eliminating the 400 error.
