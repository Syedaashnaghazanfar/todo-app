# OpenAI Agents SDK + MCP Integration - API Reference

Comprehensive API reference for building AI agents with OpenAI Agents SDK and MCP tool orchestration.

## Table of Contents

1. [Model Factory API](#1-model-factory-api)
2. [Agent Configuration API](#2-agent-configuration-api)
3. [MCP Server API](#3-mcp-server-api)
4. [Conversation Service API](#4-conversation-service-api)
5. [FastAPI Router API](#5-fastapi-router-api)
6. [Database Models](#6-database-models)

---

## 1. Model Factory API

### `create_model(provider, model)`

Create an LLM model instance based on provider configuration.

**Module**: `agent_config.factory`

**Signature**:
```python
def create_model(
    provider: str | None = None,
    model: str | None = None
) -> OpenAIChatCompletionsModel
```

**Parameters**:
- `provider` (str | None): LLM provider name
  - Options: `"openai"`, `"gemini"`, `"groq"`, `"openrouter"`
  - Default: `os.getenv("LLM_PROVIDER", "openai")`
- `model` (str | None): Model name override
  - Default: Provider-specific env var (e.g., `OPENAI_DEFAULT_MODEL`)

**Returns**:
- `OpenAIChatCompletionsModel`: Configured model instance

**Raises**:
- `ValueError`: If provider unsupported or API key missing

**Environment Variables**:
```bash
# Provider selection
LLM_PROVIDER=openai  # openai | gemini | groq | openrouter

# OpenAI
OPENAI_API_KEY=sk-...
OPENAI_DEFAULT_MODEL=gpt-4o-mini  # default: gpt-4o-mini

# Gemini
GEMINI_API_KEY=AIza...
GEMINI_DEFAULT_MODEL=gemini-2.5-flash  # default: gemini-2.5-flash

# Groq
GROQ_API_KEY=gsk_...
GROQ_DEFAULT_MODEL=llama-3.3-70b-versatile  # default: llama-3.3-70b-versatile

# OpenRouter
OPENROUTER_API_KEY=sk-or-v1-...
OPENROUTER_DEFAULT_MODEL=openai/gpt-oss-20b:free  # default: openai/gpt-oss-20b:free
```

**Examples**:
```python
# Use default provider from env
model = create_model()

# Override provider
model = create_model(provider="gemini")

# Override both provider and model
model = create_model(provider="openrouter", model="openai/gpt-oss-20b:free")
```

---

## 2. Agent Configuration API

### `TodoAgent`

AI agent wrapper with MCP server connection management.

**Module**: `agent_config.todo_agent`

#### Constructor

```python
def __init__(
    self,
    provider: str | None = None,
    model: str | None = None
)
```

**Parameters**:
- `provider` (str | None): LLM provider override
  - Options: `"openai"`, `"gemini"`, `"groq"`, `"openrouter"`
  - Default: `os.getenv("LLM_PROVIDER")`
- `model` (str | None): Model name override
  - Default: Provider-specific env var

**Raises**:
- `ValueError`: If provider not supported or API key missing

**Attributes**:
- `model` (OpenAIChatCompletionsModel): Configured AI model
- `mcp_server` (MCPServerStdio): MCP server connection
- `agent` (Agent): OpenAI Agents SDK agent instance

**Example**:
```python
from agent_config.todo_agent import TodoAgent

# Create with defaults
agent_wrapper = TodoAgent()

# Create with specific provider
agent_wrapper = TodoAgent(provider="openrouter")

# Access underlying agent
agent = agent_wrapper.get_agent()
```

#### Method: `get_agent()`

Get configured Agent instance.

**Signature**:
```python
def get_agent(self) -> Agent
```

**Returns**:
- `Agent`: OpenAI Agents SDK agent ready for use

**Example**:
```python
agent = agent_wrapper.get_agent()
```

### `create_todo_agent(provider, model)`

Convenience function for creating TodoAgent.

**Module**: `agent_config.todo_agent`

**Signature**:
```python
def create_todo_agent(
    provider: str | None = None,
    model: str | None = None
) -> TodoAgent
```

**Parameters**:
- `provider` (str | None): LLM provider override
- `model` (str | None): Model name override

**Returns**:
- `TodoAgent`: Configured agent wrapper

**Example**:
```python
from agent_config.todo_agent import create_todo_agent

agent_wrapper = create_todo_agent(provider="openrouter")
```

---

## 3. MCP Server API

### MCP Tools

All MCP tools follow the Official MCP SDK pattern with `@app.call_tool()` decorator.

**Module**: `mcp_server.tools`

### `add_task(user_id, title, description, priority)`

Create a new task with automatic priority detection.

**Signature**:
```python
async def add_task(
    user_id: str,
    title: str,
    description: str | None = None,
    priority: str = "medium"
) -> list[types.TextContent]
```

**Parameters**:
- `user_id` (str): User's unique identifier (UUID as string)
- `title` (str): Task title (required)
- `description` (str | None): Optional task description
- `priority` (str): Task priority
  - Options: `"low"`, `"medium"`, `"high"`
  - Default: `"medium"`
  - Auto-detects from keywords in title/description

**Returns**:
- `list[types.TextContent]`: Success message with task details

**Auto-Detection Keywords**:
- **High**: "high", "urgent", "critical", "important", "ASAP"
- **Low**: "low", "minor", "optional", "when you have time"
- **Medium**: Default if no keywords found

**Example**:
```python
result = await add_task(
    user_id="550e8400-e29b-41d4-a716-446655440000",
    title="URGENT: Fix production bug",
    description="Database connection failing"
)
# Auto-detects "high" priority from "URGENT"
```

### `list_tasks(user_id, status)`

List user's tasks filtered by status.

**Signature**:
```python
async def list_tasks(
    user_id: str,
    status: str = "all"
) -> list[types.TextContent]
```

**Parameters**:
- `user_id` (str): User's unique identifier
- `status` (str): Filter by status
  - Options: `"all"`, `"pending"`, `"completed"`
  - Default: `"all"`

**Returns**:
- `list[types.TextContent]`: Formatted task list with icons

**Example**:
```python
result = await list_tasks(
    user_id="550e8400-e29b-41d4-a716-446655440000",
    status="pending"
)
```

### `complete_task(user_id, task_id)`

Mark a task as completed (or toggle back to pending).

**Signature**:
```python
async def complete_task(
    user_id: str,
    task_id: int
) -> list[types.TextContent]
```

**Parameters**:
- `user_id` (str): User's unique identifier
- `task_id` (int): ID of task to complete

**Returns**:
- `list[types.TextContent]`: Success message

**Example**:
```python
result = await complete_task(
    user_id="550e8400-e29b-41d4-a716-446655440000",
    task_id=42
)
```

### `delete_task(user_id, task_id)`

Delete a task permanently.

**Signature**:
```python
async def delete_task(
    user_id: str,
    task_id: int
) -> list[types.TextContent]
```

**Parameters**:
- `user_id` (str): User's unique identifier
- `task_id` (int): ID of task to delete

**Returns**:
- `list[types.TextContent]`: Success message

**Example**:
```python
result = await delete_task(
    user_id="550e8400-e29b-41d4-a716-446655440000",
    task_id=42
)
```

### `update_task(user_id, task_id, title, description, priority)`

Update task details.

**Signature**:
```python
async def update_task(
    user_id: str,
    task_id: int,
    title: str | None = None,
    description: str | None = None,
    priority: str | None = None
) -> list[types.TextContent]
```

**Parameters**:
- `user_id` (str): User's unique identifier
- `task_id` (int): ID of task to update
- `title` (str | None): New title (optional)
- `description` (str | None): New description (optional)
- `priority` (str | None): New priority (optional)
  - Options: `"low"`, `"medium"`, `"high"`

**Returns**:
- `list[types.TextContent]`: Success message

**Example**:
```python
result = await update_task(
    user_id="550e8400-e29b-41d4-a716-446655440000",
    task_id=42,
    title="Updated task title",
    priority="high"
)
```

---

## 4. Conversation Service API

### `ConversationService`

Service layer for conversation and message operations.

**Module**: `services.conversation_service`

All methods are static and async.

### `get_or_create_conversation(session, user_id, conversation_id)`

Get existing conversation or create new one.

**Signature**:
```python
@staticmethod
async def get_or_create_conversation(
    session: Session,
    user_id: UUID,
    conversation_id: UUID | None = None
) -> Conversation
```

**Parameters**:
- `session` (Session): SQLModel database session
- `user_id` (UUID): User's unique identifier
- `conversation_id` (UUID | None): Optional existing conversation ID

**Returns**:
- `Conversation`: Conversation object (existing or new)

**Behavior**:
- If `conversation_id` provided and exists: returns existing conversation
- If `conversation_id` provided but not found: creates new conversation
- If `conversation_id` is `None`: creates new conversation

**User Isolation**: Always filters by `user_id` for security

**Example**:
```python
from services.conversation_service import ConversationService
from uuid import UUID

conversation = await ConversationService.get_or_create_conversation(
    session=session,
    user_id=UUID("550e8400-e29b-41d4-a716-446655440000"),
    conversation_id=None  # Create new
)
```

### `add_message(session, conversation_id, user_id, role, content, tool_calls)`

Add message to conversation.

**Signature**:
```python
@staticmethod
async def add_message(
    session: Session,
    conversation_id: UUID,
    user_id: UUID,
    role: str,
    content: str,
    tool_calls: str | None = None
) -> Message
```

**Parameters**:
- `session` (Session): SQLModel database session
- `conversation_id` (UUID): Parent conversation ID
- `user_id` (UUID): User's unique identifier
- `role` (str): Message role
  - Options: `"user"`, `"assistant"`, `"system"`
- `content` (str): Message text content
- `tool_calls` (str | None): Optional JSON string of tool calls

**Returns**:
- `Message`: Created message object

**Side Effects**:
- Updates conversation's `updated_at` timestamp

**Example**:
```python
message = await ConversationService.add_message(
    session=session,
    conversation_id=conversation.id,
    user_id=user_id,
    role="user",
    content="Add task to buy groceries"
)
```

### `get_conversation_history(session, conversation_id, user_id, limit)`

Get conversation messages formatted for agent.

**Signature**:
```python
@staticmethod
async def get_conversation_history(
    session: Session,
    conversation_id: UUID,
    user_id: UUID,
    limit: int | None = None
) -> list[dict]
```

**Parameters**:
- `session` (Session): SQLModel database session
- `conversation_id` (UUID): Conversation ID
- `user_id` (UUID): User's unique identifier
- `limit` (int | None): Optional max messages to return
  - If provided: returns last N messages
  - If `None`: returns all messages

**Returns**:
- `list[dict]`: Messages formatted for agent
  - Format: `[{"role": "user", "content": "..."}]`

**Message Order**: Chronological (oldest first)

**User Isolation**: Always filters by `user_id`

**Example**:
```python
history = await ConversationService.get_conversation_history(
    session=session,
    conversation_id=conversation.id,
    user_id=user_id,
    limit=50  # Last 50 messages
)

# Use with agent
result = await Runner.run(agent=agent, messages=history)
```

### `get_user_conversations(session, user_id)`

Get all conversations for a user.

**Signature**:
```python
@staticmethod
async def get_user_conversations(
    session: Session,
    user_id: UUID
) -> list[Conversation]
```

**Parameters**:
- `session` (Session): SQLModel database session
- `user_id` (UUID): User's unique identifier

**Returns**:
- `list[Conversation]`: User's conversations (newest first)

**Sort Order**: By `updated_at` descending (most recent first)

**Example**:
```python
conversations = await ConversationService.get_user_conversations(
    session=session,
    user_id=user_id
)
```

---

## 5. FastAPI Router API

### Chat Router

**Module**: `routers.chat`

**Prefix**: `/api`

### `POST /{user_id}/chat`

Chat with AI agent using Server-Sent Events (SSE) streaming.

**Endpoint**: `POST /api/{user_id}/chat`

**Path Parameters**:
- `user_id` (UUID): User's unique identifier

**Request Body**:
```json
{
  "conversation_id": "uuid-string or null",
  "message": "User message text"
}
```

**Request Schema** (`ChatRequest`):
```python
class ChatRequest(BaseModel):
    conversation_id: UUID | None = None
    message: str
```

**Response**:
- Content-Type: `text/event-stream`
- Format: Server-Sent Events (SSE)

**SSE Event Format**:
```
data: chunk1
data: chunk2
data: chunk3
data: [DONE]
```

**Headers**:
- `Cache-Control: no-cache`
- `Connection: keep-alive`
- `X-Accel-Buffering: no` (Disables nginx buffering)

**Example Request**:
```bash
curl -X POST "http://localhost:8000/api/550e8400-e29b-41d4-a716-446655440000/chat" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "conversation_id": null,
    "message": "Add task to buy groceries"
  }'
```

**Example Response** (SSE):
```
data: I've
data:  added
data:  'Buy groceries'
data:  to
data:  your
data:  tasks!
data: [DONE]
```

**Error Handling**:
```
data: Error: AI service temporarily unavailable
```

**Database Operations**:
1. Gets or creates conversation
2. Saves user message
3. Retrieves conversation history
4. Streams agent response
5. Saves assistant message

### `GET /{user_id}/conversations`

Get list of user's conversations.

**Endpoint**: `GET /api/{user_id}/conversations`

**Path Parameters**:
- `user_id` (UUID): User's unique identifier

**Response**:
```json
{
  "success": true,
  "data": {
    "conversations": [
      {
        "id": "uuid-string",
        "created_at": "2024-12-18T10:30:00Z",
        "updated_at": "2024-12-18T10:35:00Z",
        "message_count": 5
      }
    ]
  }
}
```

**Example Request**:
```bash
curl -X GET "http://localhost:8000/api/550e8400-e29b-41d4-a716-446655440000/conversations" \
  -H "Authorization: Bearer <token>"
```

---

## 6. Database Models

### `Conversation`

Conversation session between user and AI agent.

**Module**: `models`

**Table**: `conversations`

**Schema**:
```python
class Conversation(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="users.id", index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    messages: list["Message"] = Relationship(
        back_populates="conversation",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )
    user: "User" = Relationship(back_populates="conversations")
```

**Indexes**:
- Primary key: `id`
- Foreign key index: `user_id`

**Cascade Delete**: Deleting conversation deletes all messages

### `Message`

Individual message in a conversation.

**Module**: `models`

**Table**: `messages`

**Schema**:
```python
class Message(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    conversation_id: UUID = Field(foreign_key="conversations.id", index=True)
    user_id: UUID = Field(foreign_key="users.id", index=True)
    role: str = Field(index=True)  # "user" | "assistant" | "system"
    content: str
    tool_calls: str | None = None  # JSON string of tool calls
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    conversation: Conversation = Relationship(back_populates="messages")
    user: "User" = Relationship()
```

**Indexes**:
- Primary key: `id`
- Foreign key indexes: `conversation_id`, `user_id`
- Additional index: `role`

**Role Values**:
- `"user"`: Message from user
- `"assistant"`: Message from AI agent
- `"system"`: System message (instructions)

**Tool Calls Format** (JSON string):
```json
[
  {
    "tool": "add_task",
    "arguments": {
      "user_id": "uuid",
      "title": "Buy groceries",
      "priority": "medium"
    },
    "result": "Task created successfully"
  }
]
```

### `TaskPriority`

Enum for task priority levels.

**Module**: `models`

**Schema**:
```python
class TaskPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
```

**Usage**:
```python
from models import TaskPriority

priority = TaskPriority.HIGH
priority.value  # "high"
```

---

## Configuration Reference

### Required Environment Variables

```bash
# Database (required)
DATABASE_URL=postgresql://user:pass@host:5432/db_name

# Authentication (required)
BETTER_AUTH_SECRET=your-secret-key-here

# LLM Provider (required)
LLM_PROVIDER=openrouter  # openai | gemini | groq | openrouter

# Provider-specific API keys (at least one required based on LLM_PROVIDER)
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=AIza...
GROQ_API_KEY=gsk_...
OPENROUTER_API_KEY=sk-or-v1-...
```

### Optional Environment Variables

```bash
# Model overrides (optional, have defaults)
OPENAI_DEFAULT_MODEL=gpt-4o-mini
GEMINI_DEFAULT_MODEL=gemini-2.5-flash
GROQ_DEFAULT_MODEL=llama-3.3-70b-versatile
OPENROUTER_DEFAULT_MODEL=openai/gpt-oss-20b:free

# Server configuration (optional)
PORT=8000
ENVIRONMENT=development
LOG_LEVEL=INFO
CORS_ORIGINS=http://localhost:3000
REQUEST_TIMEOUT=30
```

---

## Error Reference

### Common Errors

#### `ValueError: OPENAI_API_KEY required when LLM_PROVIDER=openai`

**Cause**: Missing API key for selected provider

**Solution**: Set appropriate API key in `.env`:
```bash
OPENAI_API_KEY=sk-your-key-here
```

#### `MCPServerStdio timeout`

**Cause**: MCP tool execution exceeded timeout (default 5s)

**Solution**: Increase timeout in agent configuration:
```python
MCPServerStdio(
    name="server",
    params={...},
    client_session_timeout_seconds=30.0,  # Increase from default 5s
)
```

#### `Database lock` or `concurrent write error`

**Cause**: Parallel tool calls trying to write to database simultaneously

**Solution**: Disable parallel tool calls:
```python
Agent(
    name="MyAgent",
    model=model,
    instructions=instructions,
    mcp_servers=[mcp_server],
    model_settings=ModelSettings(
        parallel_tool_calls=False,  # Serialize tool calls
    ),
)
```

#### `Conversation not found`

**Cause**: User trying to access conversation they don't own

**Solution**: Always enforce user isolation in queries:
```python
stmt = select(Conversation).where(
    Conversation.id == conversation_id,
    Conversation.user_id == user_id  # User isolation
)
```

---

## Performance Tuning

### MCP Server Timeout

**Default**: 5 seconds
**Recommended**: 30+ seconds for database operations

```python
MCPServerStdio(
    name="server",
    params={...},
    client_session_timeout_seconds=30.0,
)
```

### Database Connection Pooling

```python
from sqlmodel import create_engine

engine = create_engine(
    DATABASE_URL,
    pool_size=10,          # Max persistent connections
    max_overflow=20,       # Max overflow connections
    pool_timeout=30,       # Timeout waiting for connection
    pool_recycle=3600,     # Recycle connections after 1 hour
)
```

### Conversation History Limit

Limit conversation history to prevent context overflow:

```python
history = await ConversationService.get_conversation_history(
    session=session,
    conversation_id=conversation_id,
    user_id=user_id,
    limit=50  # Last 50 messages only
)
```

### Caching Strategies

Cache frequently accessed data:

```python
from functools import lru_cache

@lru_cache(maxsize=100)
def get_user_profile(user_id: str):
    # Expensive operation
    return fetch_user_from_db(user_id)
```

---

**Last Updated**: December 2024
**API Version**: 1.0.0
**Compatible With**: OpenAI Agents SDK v0.2.9+, Official MCP SDK v1.0.0+
