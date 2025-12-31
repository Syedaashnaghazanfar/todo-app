# ChatKit Backend API Reference - Python

This document contains the official server-side API patterns for building custom ChatKit backends in Python. **This is the single source of truth** for all ChatKit backend implementations.

## Installation

```bash
pip install openai-chatkit
```

Requires:
- Python 3.8+
- FastAPI or similar ASGI framework (for HTTP endpoints)
- OpenAI Agents SDK (`pip install agents`)

## Overview

A ChatKit backend is a server that:
1. Receives HTTP requests from ChatKit clients
2. Processes user messages and tool outputs
3. Orchestrates agent conversations using the Agents SDK
4. Streams events back to the client in real-time
5. Persists threads, messages, and files

## Core Architecture

```
ChatKit Client → HTTP Request → ChatKitServer.process()
                                       ↓
                                  respond() method
                                       ↓
                              Agents SDK (Runner.run_streamed)
                                       ↓
                            stream_agent_response() helper
                                       ↓
                                AsyncIterator[Event]
                                       ↓
                                 SSE Stream Response
                                       ↓
                                 ChatKit Client
```

## ChatKitServer Class

### Base Class

```python
from chatkit import ChatKitServer
from chatkit.store import Store
from chatkit.file_store import FileStore

class MyChatKitServer(ChatKitServer):
    def __init__(self, data_store: Store, file_store: FileStore | None = None):
        super().__init__(data_store, file_store)
```

### Required Method: respond()

The `respond()` method is called whenever:
- A user sends a message
- A client tool completes and returns output

**Signature:**
```python
async def respond(
    self,
    thread: ThreadMetadata,
    input: UserMessageItem | ClientToolCallOutputItem,
    context: Any,
) -> AsyncIterator[Event]:
    """
    Args:
        thread: Thread metadata and state
        input: User message or client tool output
        context: Custom context passed to server.process()

    Yields:
        Event: Stream of events to send to client
    """
```

### Basic Implementation

```python
from agents import Agent, Runner
from chatkit.helpers import stream_agent_response, to_input_item

class MyChatKitServer(ChatKitServer):
    assistant_agent = Agent[AgentContext](
        model="gpt-4.1",
        name="Assistant",
        instructions="You are a helpful assistant",
    )

    async def respond(
        self,
        thread: ThreadMetadata,
        input: UserMessageItem | ClientToolCallOutputItem,
        context: Any,
    ) -> AsyncIterator[Event]:
        agent_context = AgentContext(
            thread=thread,
            store=self.store,
            request_context=context,
        )

        result = Runner.run_streamed(
            self.assistant_agent,
            await to_input_item(input, self.to_message_content),
            context=agent_context,
        )

        async for event in stream_agent_response(agent_context, result):
            yield event
```

## HTTP Integration

### FastAPI Example

```python
from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse, Response
from chatkit.store import SQLiteStore
from chatkit.file_store import DiskFileStore

app = FastAPI()
data_store = SQLiteStore()
file_store = DiskFileStore(data_store)
server = MyChatKitServer(data_store, file_store)

@app.post("/chatkit")
async def chatkit_endpoint(request: Request):
    result = await server.process(await request.body(), {})
    if isinstance(result, StreamingResult):
        return StreamingResponse(result, media_type="text/event-stream")
    return Response(content=result.json, media_type="application/json")
```

### Process Method

```python
result = await server.process(
    body: bytes,          # Raw HTTP request body
    context: Any = {}     # Custom context (auth, user info, etc.)
)
```

Returns:
- `StreamingResult` - For SSE responses (streaming mode)
- `Result` - For JSON responses (non-streaming mode)

## Store Contract

Implement the `Store` interface to persist ChatKit data:

```python
from chatkit.store import Store

class CustomStore(Store):
    async def get_thread(self, thread_id: str, context: Any) -> ThreadMetadata | None:
        """Retrieve thread by ID"""

    async def create_thread(self, thread: ThreadMetadata, context: Any) -> None:
        """Create a new thread"""

    async def update_thread(self, thread: ThreadMetadata, context: Any) -> None:
        """Update thread metadata"""

    async def delete_thread(self, thread_id: str, context: Any) -> None:
        """Delete thread and all messages"""

    async def list_threads(self, context: Any) -> list[ThreadMetadata]:
        """List all threads for user"""

    async def get_messages(
        self,
        thread_id: str,
        limit: int | None = None,
        context: Any = None
    ) -> list[Message]:
        """Retrieve messages for a thread"""

    async def add_message(self, message: Message, context: Any) -> None:
        """Add message to thread"""

    def generate_item_id(
        self,
        item_type: str,
        thread: ThreadMetadata,
        context: Any
    ) -> str:
        """Generate unique ID for thread items"""
```

### SQLite Store (Default)

```python
from chatkit.store import SQLiteStore

store = SQLiteStore(db_path="chatkit.db")  # Defaults to in-memory if not specified
```

**Important**: Store models as JSON blobs to avoid migrations when the library updates schemas.

## FileStore Contract

Implement `FileStore` for file upload support:

```python
from chatkit.file_store import FileStore

class CustomFileStore(FileStore):
    async def create_upload_url(
        self,
        thread_id: str,
        file_name: str,
        content_type: str,
        context: Any
    ) -> UploadURL:
        """Generate signed URL for client uploads (two-phase)"""

    async def store_file(
        self,
        thread_id: str,
        file_id: str,
        file_data: bytes,
        file_name: str,
        content_type: str,
        context: Any
    ) -> File:
        """Store uploaded file (direct upload)"""

    async def get_file(self, file_id: str, context: Any) -> File | None:
        """Retrieve file metadata"""

    async def get_file_content(self, file_id: str, context: Any) -> bytes:
        """Retrieve file binary content"""

    async def get_file_preview(self, file_id: str, context: Any) -> bytes | None:
        """Generate/retrieve thumbnail for inline display"""

    async def delete_file(self, file_id: str, context: Any) -> None:
        """Delete file"""
```

### DiskFileStore (Default)

```python
from chatkit.file_store import DiskFileStore

file_store = DiskFileStore(
    store=data_store,
    upload_dir="/tmp/chatkit-uploads"
)
```

### Upload Strategies

**Direct Upload**: Client POSTs file to your endpoint
- Simple, single request
- File stored via `store_file()`

**Two-Phase Upload**: Client requests signed URL, uploads to cloud storage
- Better for large files
- URL generated via `create_upload_url()`
- Supports S3, GCS, Azure Blob, etc.

## Thread Metadata and State

### ThreadMetadata

```python
class ThreadMetadata:
    id: str                           # Unique thread identifier
    created_at: datetime              # Creation timestamp
    metadata: dict[str, Any]          # Server-side state (not exposed to client)
```

### Using Metadata

Store server-side state that persists across `respond()` calls:

```python
async def respond(
    self,
    thread: ThreadMetadata,
    input: UserMessageItem | ClientToolCallOutputItem,
    context: Any,
) -> AsyncIterator[Event]:
    # Read metadata
    previous_run_id = thread.metadata.get("last_run_id")

    # Process...

    # Update metadata
    thread.metadata["last_run_id"] = new_run_id
    thread.metadata["message_count"] = thread.metadata.get("message_count", 0) + 1

    await self.store.update_thread(thread, context)
```

## Client Tools

Client tools execute in the browser but are triggered from server-side agent logic.

### 1. Register on Agent

```python
from agents import function_tool, Agent
from chatkit.types import ClientToolCall

@function_tool(description_override="Add an item to the user's todo list.")
async def add_to_todo_list(ctx: RunContextWrapper[AgentContext], item: str) -> None:
    # Signal client to execute this tool
    ctx.context.client_tool_call = ClientToolCall(
        name="add_to_todo_list",
        arguments={"item": item},
    )

assistant_agent = Agent[AgentContext](
    model="gpt-4.1",
    name="Assistant",
    instructions="You are a helpful assistant",
    tools=[add_to_todo_list],
    tool_use_behavior=StopAtTools(stop_at_tool_names=[add_to_todo_list.name]),
)
```

### 2. Register on Client

Client must also register the tool (see frontend docs):

```javascript
clientTools: {
  add_to_todo_list: async (args) => {
    // Execute in browser
    return { success: true };
  }
}
```

### 3. Flow

1. Agent calls `add_to_todo_list` server-side tool
2. Server sets `ctx.context.client_tool_call`
3. Server sends `ClientToolCallEvent` to client
4. Client executes registered function
5. Client sends `ClientToolCallOutputItem` back to server
6. Server's `respond()` is called again with the output

## Widgets

Widgets render rich UI inside the chat surface.

### Basic Widget

```python
from chatkit.widgets import Card, Text
from chatkit.helpers import stream_widget

async def respond(
    self,
    thread: ThreadMetadata,
    input: UserMessageItem | ClientToolCallOutputItem,
    context: Any,
) -> AsyncIterator[Event]:
    widget = Card(
        children=[
            Text(
                id="description",
                value="Generated summary",
            )
        ]
    )

    async for event in stream_widget(
        thread,
        widget,
        generate_id=lambda item_type: self.store.generate_item_id(item_type, thread, context),
    ):
        yield event
```

### Available Widget Nodes

- **Card**: Container with optional title
- **Text**: Text block with markdown support
- **Button**: Clickable button with action
- **Form**: Input collection container
- **TextInput**: Single-line text field
- **TextArea**: Multi-line text field
- **Select**: Dropdown selection
- **Checkbox**: Boolean toggle
- **List**: Vertical list of items
- **HorizontalList**: Horizontal layout
- **Image**: Image display
- **Video**: Video player
- **Link**: Clickable link

See [widgets guide on GitHub](https://github.com/openai/chatkit-python/blob/main/docs/widgets.md) for all components.

### Streaming Widget Updates

```python
widget = Card(children=[Text(id="status", value="Starting...")])

async for event in stream_widget(thread, widget, generate_id=...):
    yield event

# Update widget
widget.children[0].value = "Processing..."
async for event in stream_widget(thread, widget, generate_id=...):
    yield event

# Final update
widget.children[0].value = "Complete!"
async for event in stream_widget(thread, widget, generate_id=...):
    yield event
```

## Actions

Actions trigger work from UI interactions without sending a user message.

### ActionConfig on Widgets

```python
from chatkit.widgets import Button, ActionConfig

button = Button(
    text="Submit",
    action=ActionConfig(
        handler="server",           # or "client"
        payload={"operation": "submit"}
    )
)
```

### Handle Server Actions

Override the `action()` method:

```python
async def action(
    self,
    thread: ThreadMetadata,
    action_payload: dict[str, Any],
    context: Any,
) -> AsyncIterator[Event]:
    operation = action_payload.get("operation")

    if operation == "submit":
        # Process submission
        result = await process_submission(action_payload)

        # Optionally stream response
        async for event in stream_widget(...):
            yield event
```

### Form Actions

When a widget is inside a `Form`, collected form values are included:

```python
from chatkit.widgets import Form, TextInput, Button

form = Form(
    children=[
        TextInput(id="email", placeholder="Enter email"),
        Button(
            text="Subscribe",
            action=ActionConfig(
                handler="server",
                payload={"action": "subscribe"}
            )
        )
    ]
)

# In action() method:
email = action_payload.get("email")  # Form value automatically included
```

See [actions guide on GitHub](https://github.com/openai/chatkit-python/blob/main/docs/actions.md).

## Progress Updates

Long-running operations can stream progress to the UI:

```python
from chatkit.events import ProgressUpdateEvent

async def respond(...) -> AsyncIterator[Event]:
    # Start operation
    yield ProgressUpdateEvent(message="Processing file...")

    await process_step_1()
    yield ProgressUpdateEvent(message="Analyzing content...")

    await process_step_2()
    yield ProgressUpdateEvent(message="Generating summary...")

    # Final result replaces progress
    async for event in stream_agent_response(...):
        yield event
```

## Server Context

Pass custom context to `server.process()` for:
- Authentication
- Authorization
- User identity
- Tenant isolation
- Request tracing

```python
@app.post("/chatkit")
async def chatkit_endpoint(request: Request, user: User = Depends(get_current_user)):
    context = {
        "user_id": user.id,
        "tenant_id": user.tenant_id,
        "permissions": user.permissions,
    }

    result = await server.process(await request.body(), context)
    return StreamingResponse(result, media_type="text/event-stream")
```

Access in `respond()`, `action()`, and store methods:

```python
async def respond(self, thread, input, context):
    user_id = context.get("user_id")
    tenant_id = context.get("tenant_id")

    # Enforce permissions
    if not can_access_thread(user_id, thread.id):
        raise PermissionError()

    # ...
```

## Streaming vs Non-Streaming

### Streaming Mode (Recommended)

```python
result = Runner.run_streamed(agent, input, context=context)
async for event in stream_agent_response(context, result):
    yield event
```

Returns `StreamingResult` → SSE response

**Benefits:**
- Real-time updates
- Better UX for long-running operations
- Progress visibility

### Non-Streaming Mode

```python
result = await Runner.run(agent, input, context=context)
# Process result
return final_output
```

Returns `Result` → JSON response

**Use when:**
- Client doesn't support SSE
- Response is very quick
- Simplicity over real-time updates

## Event Types

Events streamed from `respond()` or `action()`:

- **AssistantMessageEvent**: Agent text response
- **ToolCallEvent**: Tool execution
- **WidgetEvent**: Widget rendering/update
- **ClientToolCallEvent**: Client-side tool invocation
- **ProgressUpdateEvent**: Progress indicator
- **ErrorEvent**: Error notification

## Error Handling

### Server Errors

```python
from chatkit.events import ErrorEvent

async def respond(...) -> AsyncIterator[Event]:
    try:
        # Process request
        pass
    except Exception as e:
        yield ErrorEvent(message=str(e))
        return
```

### Client Errors

Return error responses for protocol violations:

```python
@app.post("/chatkit")
async def chatkit_endpoint(request: Request):
    try:
        result = await server.process(await request.body(), {})
        if isinstance(result, StreamingResult):
            return StreamingResponse(result, media_type="text/event-stream")
        return Response(content=result.json, media_type="application/json")
    except ValueError as e:
        return Response(content={"error": str(e)}, status_code=400)
```

## Best Practices

1. **Use SQLite for local dev, production database for prod**
2. **Store models as JSON blobs** to avoid migrations
3. **Implement proper authentication** via server context
4. **Use thread metadata** for server-side state
5. **Stream responses** for better UX
6. **Handle errors gracefully** with ErrorEvent
7. **Implement file cleanup** when threads are deleted
8. **Use progress updates** for long operations
9. **Validate permissions** in store methods
10. **Log requests** for debugging and monitoring

## Security Considerations

1. **Authenticate all requests** - Use server context to verify users
2. **Validate thread ownership** - Ensure users can only access their threads
3. **Sanitize file uploads** - Check file types, sizes, scan for malware
4. **Rate limit** - Prevent abuse of endpoints
5. **Use HTTPS** - Encrypt all traffic
6. **Secure file storage** - Use signed URLs, private buckets
7. **Validate widget actions** - Ensure actions are authorized
8. **Audit sensitive operations** - Log access to sensitive data

## Version Information

This documentation reflects the `openai-chatkit` Python package as of November 2024. For the latest updates, visit: https://github.com/openai/chatkit-python
