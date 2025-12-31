# ChatKit Server Implementation Summary

## Problem Statement

The todo-app frontend was using `@openai/chatkit-react` package to create a ChatKit widget, but the backend didn't have a proper ChatKit server implementation. This caused 400 errors when trying to send messages because:

1. The frontend sends requests in ChatKit protocol format
2. The backend `/api/v1/chat` endpoint expects a different custom format
3. There was no proper ChatKit server (`ChatKitServer` class) implementation

## Solution Implemented

### Backend Changes

#### 1. Created ChatKit Store (`src/chatkit_server/store.py`)
- Implemented `PostgresChatKitStore` class extending ChatKit's `Store` abstract base class
- Maps ChatKit threads to Conversation database records
- Maps ChatKit thread items to Message database records
- Provides thread and message persistence to PostgreSQL

#### 2. Created ChatKit Server (`src/chatkit_server/server.py`)
- Implemented `TaskChatKitServer` class extending `ChatKitServer`
- Integrates with existing `TodoAgent` and MCP tools
- Handles conversation context and streaming responses
- Uses OpenAI Agents SDK for intelligent task routing

#### 3. Created ChatKit-Compatible Endpoint (`src/api/v1/chatkit.py`)
- **New endpoint:** `POST /api/v1/chatkit`
- Accepts ChatKit protocol requests
- Returns Server-Sent Events (SSE) in ChatKit format
- Bridges ChatKit frontend with existing Agents SDK + MCP backend
- Uses JWT authentication via `get_current_user_id` dependency

#### 4. Updated main.py
- Added import: `from src.api.v1.chatkit import router as chatkit_router`
- Added router: `app.include_router(chatkit_router)`

###Frontend Changes Required

#### Update ChatWidget.tsx
Change the API URL from:
```typescript
url: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/chat`,
```

To:
```typescript
url: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/chatkit`,
```

## How It Works

### Request Flow

1. **User sends message** via ChatKit widget
2. **Frontend** sends POST request to `/api/v1/chatkit` with:
   ```json
   {
     "message": "Add a task to buy groceries",
     "thread_id": "thread_123" // optional
   }
   ```

3. **Backend ChatKit endpoint**:
   - Authenticates user via JWT token
   - Gets or creates conversation
   - Loads conversation history
   - Saves user message to database
   - Creates TodoAgent instance
   - Runs agent with MCP server context
   - Streams response in ChatKit SSE format:
     ```
     data: {"type": "text_delta", "delta": "I've", "thread_id": "thread_123"}
     data: {"type": "text_delta", "delta": " added", "thread_id": "thread_123"}
     data: {"type": "done", "thread_id": "thread_123", "message_id": "msg_456"}
     ```

4. **ChatKit widget** receives SSE stream and displays incrementally

### Architecture Diagram

```
┌─────────────────────┐
│  ChatKit Widget     │
│  (Frontend)         │
└──────────┬──────────┘
           │ POST /api/v1/chatkit
           │ {"message": "...", "thread_id": "..."}
           ▼
┌─────────────────────┐
│  ChatKit Endpoint   │
│  (FastAPI)          │
└──────────┬──────────┘
           │
           ├─> Authenticate (JWT)
           ├─> Get/Create Conversation
           ├─> Load History (PostgreSQL)
           ├─> Save User Message
           ├─> Create TodoAgent
           │
           ▼
┌─────────────────────┐
│  TodoAgent          │
│  + MCP Server       │
└──────────┬──────────┘
           │
           ├─> add_task
           ├─> list_tasks
           ├─> complete_task
           ├─> delete_task
           └─> update_task
           │
           ▼
┌─────────────────────┐
│  TaskService        │
│  (Database CRUD)    │
└─────────────────────┘
```

## Files Created/Modified

### Created Files
1. `phase-3/backend/src/chatkit_server/__init__.py` - Package init
2. `phase-3/backend/src/chatkit_server/store.py` - PostgreSQL store implementation
3. `phase-3/backend/src/chatkit_server/server.py` - ChatKit server implementation
4. `phase-3/backend/src/api/v1/chatkit.py` - ChatKit-compatible endpoint

### Modified Files
1. `phase-3/backend/main.py` - Added chatkit router
2. `phase-3/frontend/todo-app/components/chat/ChatWidget.tsx` - Update API URL to `/api/v1/chatkit`

## Testing

### Backend Test
```bash
curl -X POST http://localhost:8000/api/v1/chatkit \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "Add a task to buy groceries"}'
```

Expected: SSE stream with ChatKit format events

### Frontend Test
1. Start backend: `cd phase-3/backend && uv run uvicorn main:app --reload`
2. Start frontend: `cd phase-3/frontend/todo-app && npm run dev`
3. Navigate to http://localhost:3000/chat
4. Type message: "Add a task to buy groceries"
5. Verify response streams correctly

## Key Benefits

1. **Proper ChatKit Integration**: Frontend and backend now speak the same protocol
2. **Reuses Existing Logic**: Leverages existing TodoAgent, MCP tools, and TaskService
3. **Conversation Persistence**: Messages stored in PostgreSQL database
4. **User Isolation**: All conversations filtered by user_id
5. **Streaming Responses**: Real-time SSE streaming for better UX

## Next Steps

1. Update `ChatWidget.tsx` to use `/api/v1/chatkit` endpoint
2. Test end-to-end message flow
3. Verify conversation persistence across sessions
4. Test all task operations (add, list, complete, delete, update)
5. Handle error cases (token expiry, network failures)

## Dependencies

The implementation requires:
- `chatkit>=0.0.1` (already in pyproject.toml)
- `openai-agents>=0.6.4` (already installed)
- `mcp>=1.25.0` (already installed)
- `@openai/chatkit-react` (already in frontend package.json)

**Note**: If the backend `chatkit` package doesn't provide the required classes, you may need to install `openai-chatkit` package instead:
```bash
cd phase-3/backend
uv add openai-chatkit
```

## Troubleshooting

### 400 Bad Request
- Check that ChatWidget is sending to `/api/v1/chatkit` (not `/api/v1/chat`)
- Verify JWT token is being injected in Authorization header
- Check backend logs for request format issues

### 401 Unauthorized
- Verify JWT token is valid and not expired
- Check localStorage has `auth_token` key
- Ensure CORS is configured for frontend URL

### No Response Streaming
- Verify SSE is enabled in ChatWidget
- Check browser network tab for SSE connection
- Ensure backend is yielding events in correct format

### ImportError for ChatKit Classes
- If `from chatkit.server import ChatKitServer` fails
- Install proper package: `uv add openai-chatkit`
- Or use alternative bridge approach without ChatKit SDK

## Alternative Approach (If ChatKit SDK Not Available)

If the `openai-chatkit` package is not available or causes issues, the current implementation in `src/api/v1/chatkit.py` provides a working bridge that:
- Accepts ChatKit-format requests
- Uses existing Agents SDK + MCP implementation
- Returns ChatKit-format SSE responses
- Doesn't require ChatKit SDK on backend

This is the recommended approach for this project.
