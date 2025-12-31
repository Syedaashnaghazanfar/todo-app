# ChatKit Backend - Python Change Log

This document tracks the ChatKit backend package version, patterns, and implementation approaches used in this project.

---

## Current Implementation (November 2024)

### Package Version
- **Package**: `openai-chatkit` (Latest stable release, November 2024)
- **Documentation Reference**: https://github.com/openai/chatkit-python
- **Official Guide**: https://platform.openai.com/docs/guides/custom-chatkit
- **Python**: 3.8+
- **Framework**: FastAPI (recommended) or any ASGI framework

### Core Features in Use

#### 1. ChatKitServer Class
- Subclassing `ChatKitServer` with custom `respond()` method
- Processing user messages and client tool outputs
- Streaming events via `AsyncIterator[Event]`
- Integration with OpenAI Agents SDK

#### 2. Store Contract
- Using `SQLiteStore` for local development
- Custom `Store` implementations for production databases
- Storing models as JSON blobs (no migrations needed)
- Thread and message persistence

#### 3. FileStore Contract
- `DiskFileStore` for local file storage
- Support for direct uploads (single-phase)
- Support for two-phase uploads (signed URLs)
- File previews for inline thumbnails

#### 4. Streaming Pattern
- Using `Runner.run_streamed()` for real-time responses
- Helper `stream_agent_response()` to bridge Agents SDK → ChatKit events
- Server-Sent Events (SSE) for streaming to client
- Progress updates for long-running operations

#### 5. Widgets and Actions
- Widget rendering with `stream_widget()`
- Available nodes: Card, Text, Button, Form, List, etc.
- Action handling for interactive UI elements
- Form value collection and submission

#### 6. Client Tools
- Triggering client-side execution from server logic
- Using `ctx.context.client_tool_call` pattern
- `StopAtTools` behavior for client tool coordination
- Bi-directional flow: server → client → server

### Project Structure

```
backend/
├── main.py                    # FastAPI app with /chatkit endpoint
├── server.py                  # ChatKitServer subclass with respond()
├── store.py                   # Custom Store implementation
├── file_store.py              # Custom FileStore implementation
├── agents/
│   ├── assistant.py           # Primary agent definition
│   ├── tools.py               # Server-side tools
│   └── context.py             # AgentContext type definition
└── requirements.txt
```

### Environment Variables

Required:
- `OPENAI_API_KEY` - For OpenAI models via Agents SDK
- `DATABASE_URL` - For production database (optional, defaults to SQLite)
- `UPLOAD_DIR` - For file storage location (optional)

Optional:
- `GEMINI_API_KEY` - For Gemini models (via Agents SDK factory)
- `LLM_PROVIDER` - Provider selection ("openai" or "gemini")
- `LOG_LEVEL` - Logging verbosity

### Key Implementation Patterns

#### 1. ChatKitServer Subclass

```python
class MyChatKitServer(ChatKitServer):
    assistant_agent = Agent[AgentContext](
        model="gpt-4.1",
        name="Assistant",
        instructions="You are helpful",
    )

    async def respond(
        self,
        thread: ThreadMetadata,
        input: UserMessageItem | ClientToolCallOutputItem,
        context: Any,
    ) -> AsyncIterator[Event]:
        agent_context = AgentContext(thread=thread, store=self.store, request_context=context)
        result = Runner.run_streamed(self.assistant_agent, await to_input_item(input, self.to_message_content), context=agent_context)

        async for event in stream_agent_response(agent_context, result):
            yield event
```

#### 2. FastAPI Integration

```python
@app.post("/chatkit")
async def chatkit_endpoint(request: Request):
    result = await server.process(await request.body(), {})
    if isinstance(result, StreamingResult):
        return StreamingResponse(result, media_type="text/event-stream")
    return Response(content=result.json, media_type="application/json")
```

#### 3. Store Implementation

```python
# Development
store = SQLiteStore(db_path="chatkit.db")

# Production
store = CustomStore(db_connection=db_pool)
```

#### 4. Client Tool Pattern

```python
@function_tool(description_override="Execute on client")
async def client_action(ctx: RunContextWrapper[AgentContext], param: str) -> None:
    ctx.context.client_tool_call = ClientToolCall(
        name="client_action",
        arguments={"param": param},
    )

agent = Agent(
    tools=[client_action],
    tool_use_behavior=StopAtTools(stop_at_tool_names=[client_action.name]),
)
```

#### 5. Widget Rendering

```python
widget = Card(children=[Text(id="msg", value="Hello")])
async for event in stream_widget(thread, widget, generate_id=...):
    yield event
```

### Design Decisions

#### Why ChatKitServer Subclass?
1. **Clean abstraction**: `respond()` method focuses on business logic
2. **Built-in protocol**: Handles ChatKit event protocol automatically
3. **Streaming support**: SSE streaming handled by framework
4. **Store integration**: Automatic persistence via Store contract
5. **Type safety**: Strongly typed events and inputs

#### Why Agents SDK Integration?
1. **Consistent patterns**: Same Agents SDK used across all agents
2. **Tool support**: Reuse existing Agents SDK tools
3. **Multi-agent**: Leverage handoffs for complex workflows
4. **Streaming**: `Runner.run_streamed()` matches ChatKit streaming model
5. **Context passing**: AgentContext carries ChatKit state through tools

#### Why SQLite for Development?
1. **Zero setup**: No database server required
2. **Fast iteration**: Embedded database
3. **JSON storage**: Models stored as JSON (no migrations)
4. **Easy testing**: In-memory mode for tests
5. **Production upgrade**: Switch to PostgreSQL/MySQL without code changes

### Integration with Agents SDK

ChatKit backend uses the Agents SDK for orchestration:

```
ChatKit Request
     ↓
ChatKitServer.respond()
     ↓
Runner.run_streamed(agent, ...)
     ↓
stream_agent_response(...)
     ↓
Events → Client
```

**Key Helper Functions:**
- `to_input_item()` - Converts ChatKit input to Agents SDK format
- `stream_agent_response()` - Converts Agents SDK results to ChatKit events
- `AgentContext` - Carries ChatKit state (thread, store) through agent execution

### Known Limitations

1. **No built-in auth**: Must implement via server context
2. **JSON blob storage**: Schema evolution requires careful handling
3. **No multi-tenant by default**: Must implement tenant isolation
4. **SQLite not for production**: Use PostgreSQL/MySQL in production
5. **File cleanup manual**: Must implement file deletion on thread removal

### Migration Notes

**From Custom Server Implementation:**
- Adopt `ChatKitServer` base class for protocol compliance
- Use `respond()` method instead of custom HTTP handlers
- Migrate to Store contract for persistence
- Use `stream_agent_response()` helper for event streaming

**From OpenAI-Hosted ChatKit:**
- Set up custom backend infrastructure
- Implement Store and FileStore contracts
- Configure ChatKit client to point to custom `apiURL`
- Manage agent orchestration yourself

### Security Best Practices

1. **Authenticate via context**:
   ```python
   @app.post("/chatkit")
   async def endpoint(request: Request, user: User = Depends(auth)):
       context = {"user_id": user.id}
       result = await server.process(await request.body(), context)
   ```

2. **Validate thread ownership**:
   ```python
   async def get_thread(self, thread_id: str, context: Any):
       thread = await super().get_thread(thread_id, context)
       if thread and thread.metadata.get("owner_id") != context.get("user_id"):
           raise PermissionError()
       return thread
   ```

3. **Sanitize file uploads**:
   ```python
   ALLOWED_TYPES = {"image/png", "image/jpeg", "application/pdf"}

   async def store_file(self, ..., content_type: str, ...):
       if content_type not in ALLOWED_TYPES:
           raise ValueError("Invalid file type")
   ```

4. **Rate limit**: Use middleware to limit requests per user
5. **Use HTTPS**: Always in production
6. **Audit logs**: Log sensitive operations

### Future Enhancements

Potential additions:
- Built-in authentication providers
- Multi-tenant store implementations
- Database migration tools
- Widget template library
- Action validation framework
- Monitoring and metrics helpers
- Testing utilities
- Deployment templates (Docker, K8s)

---

## Version History

### November 2024 - Initial Implementation
- Adopted `openai-chatkit` package
- Integrated with OpenAI Agents SDK
- Implemented SQLite store for development
- Added DiskFileStore for local files
- Documented streaming patterns
- Established server context pattern
- Created widget and action examples

---

## Keeping This Current

When ChatKit backend changes:
1. Update `chatkit-backend/python/latest.md` with new API patterns
2. Record the change here with date and description
3. Update affected templates to match new patterns
4. Test all examples with new package version
5. Verify Store/FileStore contracts are current

**This changelog should reflect actual implementation**, not theoretical features.

---

## Package Dependencies

Current dependencies:
```txt
openai-chatkit>=0.1.0
agents>=0.1.0
fastapi>=0.100.0
uvicorn[standard]>=0.20.0
python-multipart  # For file uploads
```

Optional:
```txt
sqlalchemy>=2.0.0  # For custom Store with SQLAlchemy
psycopg2-binary    # For PostgreSQL
aiomysql           # For MySQL
boto3              # For S3 file storage
```
