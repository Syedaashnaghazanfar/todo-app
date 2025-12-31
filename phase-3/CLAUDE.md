# Phase 3: Todo AI Chatbot with MCP Server Architecture

## Overview

Phase 3 transforms the todo app into an **AI-powered conversational interface** where users can manage tasks through natural language. This phase implements a production-grade chatbot using **OpenAI ChatKit**, **OpenAI Agents SDK**, and **MCP (Model Context Protocol)** server architecture with database-backed stateless conversation management.

**Phase**: Phase III - Todo AI Chatbot
**Technology Focus**: OpenAI ChatKit + Agents SDK + MCP Server
**Architecture Pattern**: Stateless server with database persistence
**Implementation Strategy**: Skills & Subagents Architecture

---

## 🎯 Phase 3 Objectives

### Primary Goals

1. **Conversational Interface**: Enable natural language task management ("Add a task to buy groceries")
2. **MCP Server Architecture**: Build standardized tool interface for AI agent interactions
3. **Stateless Backend**: Implement scalable, resilient chat endpoint with database state persistence
4. **OpenAI Agents Integration**: Use OpenAI Agents SDK for intelligent task routing and tool orchestration
5. **ChatKit Frontend**: Deploy OpenAI ChatKit UI for seamless chat experience

### Success Metrics

- **Conversational Accuracy**: 95%+ correct intent recognition for task operations
- **Response Time**: < 2 seconds for AI responses with tool calls
- **Scalability**: Stateless architecture supports horizontal scaling
- **Conversation Persistence**: 100% conversation recovery after server restart
- **User Experience**: Natural, helpful responses with action confirmations

---

## 🤖 MANDATORY SUBAGENT ARCHITECTURE FOR PHASE 3

**This implementation MUST use specialized subagents for AI chatbot implementation.**

### Phase 3 Subagent Strategy

Phase 3 leverages **2 specialized subagents** for chatbot implementation:

#### 1. **chatkit-backend-engineer** (Backend AI & MCP Server)
- **Responsibility**: FastAPI chat endpoint, OpenAI Agents SDK integration, MCP server implementation, conversation persistence
- **Scope**: `backend/src/api/v1/chat.py`, `backend/src/services/agent_service.py`, `backend/src/mcp_server/`, `backend/src/models/conversation.py`, `backend/src/models/message.py`
- **Key Deliverables**:
  - POST /api/v1/chat endpoint with stateless request handling
  - OpenAI Agents SDK agent configuration and runner
  - MCP server with 5 tools: add_task, list_tasks, complete_task, delete_task, update_task
  - Conversation and Message database models
  - Database persistence for chat history
  - Agent behavior logic (intent recognition, tool routing, confirmations)
  - Error handling and graceful degradation

#### 2. **chatkit-frontend-engineer** (ChatKit UI Integration)
- **Responsibility**: OpenAI ChatKit widget embedding, configuration, authentication, API integration
- **Scope**: `frontend/todo-app/app/chat/page.tsx`, `frontend/todo-app/components/chat/ChatWidget.tsx`, ChatKit configuration
- **Key Deliverables**:
  - ChatKit widget integration with CDN script
  - Widget configuration (api.url, authentication, theme)
  - Chat page UI with ChatKit embed
  - Domain allowlist setup for production deployment
  - Error handling for widget initialization
  - Authentication integration with Better Auth

---

## 🏗️ Architecture Overview

```
┌─────────────────┐     ┌──────────────────────────────────────────────┐     ┌─────────────────┐
│                 │     │              FastAPI Server                   │     │                 │
│                 │     │  ┌────────────────────────────────────────┐  │     │                 │
│  ChatKit UI     │────▶│  │         Chat Endpoint                  │  │     │    Neon DB      │
│  (Frontend)     │     │  │  POST /api/chat                        │  │     │  (PostgreSQL)   │
│                 │     │  └───────────────┬────────────────────────┘  │     │                 │
│                 │     │                  │                           │     │  - tasks        │
│                 │     │                  ▼                           │     │  - conversations│
│                 │     │  ┌────────────────────────────────────────┐  │     │  - messages     │
│                 │◀────│  │      OpenAI Agents SDK                 │  │     │                 │
│                 │     │  │      (Agent + Runner)                  │  │     │                 │
│                 │     │  └───────────────┬────────────────────────┘  │     │                 │
│                 │     │                  │                           │     │                 │
│                 │     │                  ▼                           │     │                 │
│                 │     │  ┌────────────────────────────────────────┐  │────▶│                 │
│                 │     │  │         MCP Server                     │  │     │                 │
│                 │     │  │  (MCP Tools for Task Operations)       │  │◀────│                 │
│                 │     │  └────────────────────────────────────────┘  │     │                 │
└─────────────────┘     └──────────────────────────────────────────────┘     └─────────────────┘
```

---

## 🛠️ Technology Stack

### Frontend
- **ChatKit UI**: OpenAI ChatKit (hosted widget)
- **Framework**: Next.js 16 (existing)
- **Integration**: ChatKit CDN script + widget configuration
- **Authentication**: Better Auth integration for user context

### Backend
- **Framework**: FastAPI (existing)
- **AI Framework**: OpenAI Agents SDK
- **MCP Server**: Official MCP SDK
- **Database**: PostgreSQL (Neon) - existing
- **ORM**: SQLModel (existing)
- **New Models**: Conversation, Message

### AI & MCP Components
- **OpenAI Agents SDK**: Agent creation, tool registration, conversation management
- **MCP Server**: Standardized tool interface for task operations
- **Tools**: add_task, list_tasks, complete_task, delete_task, update_task

---

## 📊 Database Models

### New Models for Phase 3

#### **Conversation Model**
```python
class Conversation(SQLModel, table=True):
    __tablename__ = "conversations"

    id: int | None = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    messages: list["Message"] = Relationship(back_populates="conversation")
```

#### **Message Model**
```python
class Message(SQLModel, table=True):
    __tablename__ = "messages"

    id: int | None = Field(default=None, primary_key=True)
    conversation_id: int = Field(foreign_key="conversations.id")
    user_id: int = Field(foreign_key="users.id")
    role: str = Field(..., description="user or assistant")
    content: str = Field(..., description="Message text")
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    conversation: Conversation = Relationship(back_populates="messages")
```

---

## 🔌 API Endpoints

### Chat Endpoint

**POST /api/v1/chat**

**Request:**
```json
{
  "conversation_id": 123,  // Optional, creates new if not provided
  "message": "Add a task to buy groceries"
}
```

**Response:**
```json
{
  "conversation_id": 123,
  "response": "I've added the task 'Buy groceries' to your list!",
  "tool_calls": [
    {
      "tool": "add_task",
      "parameters": {"title": "Buy groceries"},
      "result": {"task_id": 5, "status": "created"}
    }
  ]
}
```

---

## 🧰 MCP Tools Specification

### Tool 1: add_task

**Purpose**: Create a new task

**Parameters**:
- `user_id` (string, required): User identifier
- `title` (string, required): Task title
- `description` (string, optional): Task description

**Returns**:
```json
{
  "task_id": 5,
  "status": "created",
  "title": "Buy groceries"
}
```

**Example Input**:
```json
{
  "user_id": "user123",
  "title": "Buy groceries",
  "description": "Milk, eggs, bread"
}
```

---

### Tool 2: list_tasks

**Purpose**: Retrieve tasks from the list

**Parameters**:
- `user_id` (string, required): User identifier
- `status` (string, optional): "all", "pending", "completed"

**Returns**:
```json
[
  {"id": 1, "title": "Buy groceries", "completed": false},
  {"id": 2, "title": "Call mom", "completed": true}
]
```

**Example Input**:
```json
{
  "user_id": "user123",
  "status": "pending"
}
```

---

### Tool 3: complete_task

**Purpose**: Mark a task as complete

**Parameters**:
- `user_id` (string, required): User identifier
- `task_id` (integer, required): Task ID to complete

**Returns**:
```json
{
  "task_id": 3,
  "status": "completed",
  "title": "Call mom"
}
```

**Example Input**:
```json
{
  "user_id": "user123",
  "task_id": 3
}
```

---

### Tool 4: delete_task

**Purpose**: Remove a task from the list

**Parameters**:
- `user_id` (string, required): User identifier
- `task_id` (integer, required): Task ID to delete

**Returns**:
```json
{
  "task_id": 2,
  "status": "deleted",
  "title": "Old task"
}
```

**Example Input**:
```json
{
  "user_id": "user123",
  "task_id": 2
}
```

---

### Tool 5: update_task

**Purpose**: Modify task title or description

**Parameters**:
- `user_id` (string, required): User identifier
- `task_id` (integer, required): Task ID to update
- `title` (string, optional): New task title
- `description` (string, optional): New task description

**Returns**:
```json
{
  "task_id": 1,
  "status": "updated",
  "title": "Buy groceries and fruits"
}
```

**Example Input**:
```json
{
  "user_id": "user123",
  "task_id": 1,
  "title": "Buy groceries and fruits"
}
```

---

## 🤖 Agent Behavior Specification

### Intent Recognition & Tool Routing

| User Intent | Agent Behavior | MCP Tool |
|-------------|----------------|----------|
| **Task Creation** | User mentions adding/creating/remembering something | `add_task` |
| **Task Listing** | User asks to see/show/list tasks | `list_tasks` |
| **Task Completion** | User says done/complete/finished | `complete_task` |
| **Task Deletion** | User says delete/remove/cancel | `delete_task` |
| **Task Update** | User says change/update/rename | `update_task` |
| **Confirmation** | Always confirm actions with friendly response | N/A |
| **Error Handling** | Gracefully handle task not found and other errors | N/A |

---

## 🔄 Stateless Request Cycle

### Conversation Flow

1. **Receive** user message via POST /api/v1/chat
2. **Fetch** conversation history from database (if conversation_id provided)
3. **Build** message array for agent (history + new message)
4. **Store** user message in database
5. **Run** OpenAI Agents SDK agent with MCP tools
6. **Agent invokes** appropriate MCP tool(s) based on user intent
7. **Store** assistant response in database
8. **Return** response to client
9. **Server holds NO state** (ready for next request)

### Key Benefits of Stateless Architecture

- **Scalability**: Any server instance can handle any request
- **Resilience**: Server restarts don't lose conversation state
- **Horizontal Scaling**: Load balancer can route to any backend
- **Testability**: Each request is independent and reproducible

---

## 💬 Natural Language Command Examples

### Supported Conversational Patterns

| User Says | Agent Should Do |
|-----------|----------------|
| "Add a task to buy groceries" | Call `add_task` with title "Buy groceries" |
| "Show me all my tasks" | Call `list_tasks` with status "all" |
| "What's pending?" | Call `list_tasks` with status "pending" |
| "Mark task 3 as complete" | Call `complete_task` with task_id 3 |
| "Delete the meeting task" | Call `list_tasks` first, then `delete_task` |
| "Change task 1 to 'Call mom tonight'" | Call `update_task` with new title |
| "I need to remember to pay bills" | Call `add_task` with title "Pay bills" |
| "What have I completed?" | Call `list_tasks` with status "completed" |

---

## 🚀 Implementation Phases

### **Phase 1: Backend Foundation** (chatkit-backend-engineer)
**Duration**: MCP server and database setup
**Deliverables**:
- ✅ Conversation and Message database models
- ✅ Database migration for new tables
- ✅ MCP server setup with Official MCP SDK
- ✅ 5 MCP tools implementation (add_task, list_tasks, complete_task, delete_task, update_task)
- ✅ MCP tools connect to existing Task model/service
- ✅ Backend tests for MCP tools

**Success Criteria**: All MCP tools functional; database models created; tools tested in isolation

---

### **Phase 2: OpenAI Agents Integration** (chatkit-backend-engineer)
**Duration**: Agent SDK setup and chat endpoint
**Prerequisites**: Phase 1 complete
**Deliverables**:
- ✅ OpenAI Agents SDK configuration
- ✅ Agent creation with tool registration
- ✅ POST /api/v1/chat endpoint implementation
- ✅ Stateless request handling (fetch history, run agent, store response)
- ✅ Conversation persistence logic
- ✅ Error handling and graceful degradation
- ✅ Agent behavior testing (intent recognition, tool routing)

**Success Criteria**: Chat endpoint returns AI responses; tools invoked correctly; conversation history persists; server remains stateless

---

### **Phase 3: ChatKit Frontend Integration** (chatkit-frontend-engineer)
**Duration**: ChatKit UI embedding and configuration
**Prerequisites**: Phase 2 complete
**Deliverables**:
- ✅ ChatKit CDN script integration
- ✅ ChatKit widget configuration (api.url pointing to /api/v1/chat)
- ✅ Chat page UI with ChatKit embed
- ✅ Better Auth integration for user context
- ✅ Widget initialization error handling
- ✅ Theme customization (purple theme alignment)

**Success Criteria**: ChatKit widget renders correctly; messages send to backend; responses display in UI; authentication works

---

### **Phase 4: Production Deployment** (chatkit-frontend-engineer)
**Duration**: Domain allowlist and production setup
**Prerequisites**: Phase 3 complete
**Deliverables**:
- ✅ Frontend deployed to production (Vercel/GitHub Pages/custom domain)
- ✅ OpenAI domain allowlist configuration
- ✅ Domain key obtained and configured
- ✅ Environment variables set (NEXT_PUBLIC_OPENAI_DOMAIN_KEY)
- ✅ Production testing (full chatbot workflow)
- ✅ Error monitoring and logging

**Success Criteria**: ChatKit works in production; domain allowlist configured; users can chat; conversations persist across sessions

---

## 🧪 Testing Strategy

### Backend Testing (chatkit-backend-engineer)

**MCP Tools Testing**:
- ✅ Test add_task: Create tasks with various titles/descriptions
- ✅ Test list_tasks: Filter by status (all, pending, completed)
- ✅ Test complete_task: Mark tasks complete by ID
- ✅ Test delete_task: Delete tasks by ID
- ✅ Test update_task: Modify title and description
- ✅ Test error handling: Invalid task IDs, missing parameters

**Agent SDK Testing**:
- ✅ Test intent recognition: "Add a task" → calls add_task
- ✅ Test tool routing: "Show pending tasks" → calls list_tasks(status="pending")
- ✅ Test conversation persistence: Send message, restart server, verify history
- ✅ Test multi-turn conversations: Multiple messages in same conversation
- ✅ Test error recovery: Invalid tool calls, API failures

### Frontend Testing (chatkit-frontend-engineer)

**ChatKit Widget Testing**:
- ✅ Test widget initialization: Verify ChatKit loads without errors
- ✅ Test message sending: User types message, backend receives it
- ✅ Test response rendering: AI response displays in chat UI
- ✅ Test authentication: Better Auth user context passed to backend
- ✅ Test error states: Handle widget initialization failures

### Integration Testing (Both Subagents)

**End-to-End Chatbot Testing**:
- ✅ Test full workflow: User asks to add task → ChatKit sends to backend → Agent calls add_task → Response renders
- ✅ Test conversation continuity: Multi-message conversation, verify history persists
- ✅ Test production deployment: Domain allowlist works, widget loads in production

---

## 📋 Acceptance Criteria

### Must Have (P1)
- ✅ All MCP tools functional (add_task, list_tasks, complete_task, delete_task, update_task)
- ✅ OpenAI Agents SDK integrated, agent invokes correct tools based on user intent
- ✅ POST /api/v1/chat endpoint implemented with stateless architecture
- ✅ Conversation and Message models persist to database
- ✅ ChatKit widget renders and communicates with backend
- ✅ Users can manage tasks via natural language
- ✅ Conversations persist across server restarts
- ✅ Agent provides helpful confirmations for all actions

### Should Have (P2)
- ✅ Error handling for invalid task IDs, missing parameters
- ✅ Graceful degradation when MCP tools fail
- ✅ Authentication integration (user context in chat requests)
- ✅ Production deployment with domain allowlist configured

### Nice to Have (P3)
- ✅ Multi-turn conversation intelligence (context awareness)
- ✅ Agent suggests related tasks based on user patterns
- ✅ Conversation summarization for long chat histories

---

## 🔒 OpenAI ChatKit Setup & Deployment

### Domain Allowlist Configuration (Required for Production)

**Step 1: Deploy Frontend**
- Deploy to Vercel: `https://your-app.vercel.app`
- Or GitHub Pages: `https://username.github.io/repo-name`
- Or custom domain: `https://yourdomain.com`

**Step 2: Configure OpenAI Allowlist**
1. Navigate to: [OpenAI Domain Allowlist](https://platform.openai.com/settings/organization/security/domain-allowlist)
2. Click "Add domain"
3. Enter your frontend URL (without trailing slash)
4. Save changes

**Step 3: Get Domain Key**
- After adding domain, OpenAI provides a domain key
- Add to environment variables:
  ```env
  NEXT_PUBLIC_OPENAI_DOMAIN_KEY=your-domain-key-here
  ```

**Note**: Localhost works without domain allowlist configuration (for development)

---

## 🛠️ Environment Variables

### Backend (.env)
```env
DATABASE_URL=postgresql://user:password@host:port/database
APP_PORT=8000
FRONTEND_URL=https://your-frontend-domain.com
OPENAI_API_KEY=your-openai-api-key
MCP_SERVER_URL=http://localhost:8000/mcp
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=https://your-backend-domain.com/api/v1
NEXT_PUBLIC_OPENAI_DOMAIN_KEY=your-domain-key-here
NEXT_PUBLIC_APP_NAME=Todo AI Chat
```

---

## 📁 Deliverables

### 1. GitHub Repository Structure
```
phase-3/
├── backend/
│   ├── src/
│   │   ├── api/v1/chat.py          # Chat endpoint
│   │   ├── services/agent_service.py  # Agents SDK integration
│   │   ├── mcp_server/             # MCP tools
│   │   ├── models/conversation.py  # Conversation model
│   │   └── models/message.py       # Message model
│   ├── alembic/versions/           # Database migrations
│   └── tests/                      # Backend tests
├── frontend/
│   ├── app/chat/page.tsx           # Chat page
│   └── components/chat/ChatWidget.tsx  # ChatKit integration
├── specs/                          # Spec files
└── README.md                       # Setup instructions
```

### 2. Working Chatbot Capabilities
- ✅ Manage tasks through natural language via MCP tools
- ✅ Maintain conversation context via database (stateless server)
- ✅ Provide helpful responses with action confirmations
- ✅ Handle errors gracefully
- ✅ Resume conversations after server restart

---

## 🎓 Skills & Subagents for Phase 3

### Skills Architecture (Not Applicable)

Phase 3 does **NOT** use client-side skills like Phase 2. Instead, intelligence is handled by:
- **OpenAI Agents SDK**: Intent recognition and tool routing
- **MCP Server**: Standardized tool interface

### Subagents Usage

**chatkit-backend-engineer**:
- Use when implementing FastAPI chat endpoint, OpenAI Agents SDK, MCP server
- Handles all backend AI logic, conversation persistence, tool implementations

**chatkit-frontend-engineer**:
- Use when embedding ChatKit widget, configuring api.url, setting up authentication
- Handles all frontend chat UI integration and deployment

### When to Use Subagents

**Use chatkit-backend-engineer** when:
- Implementing chat endpoint
- Integrating OpenAI Agents SDK
- Creating MCP tools
- Building conversation persistence

**Use chatkit-frontend-engineer** when:
- Embedding ChatKit widget
- Configuring ChatKit settings
- Setting up domain allowlist
- Deploying frontend to production

---

## 🔗 Related Documentation

- **Project Structure**: `PROJECT-STRUCTURE.md` (lines 618-842)
- **Phase 2 Reference**: `phase-2/CLAUDE.md` (for existing backend/database patterns)
- **OpenAI Agents SDK**: [OpenAI Agents Documentation](https://platform.openai.com/docs/agents)
- **OpenAI ChatKit**: [ChatKit Documentation](https://platform.openai.com/docs/chatkit)
- **MCP SDK**: [Model Context Protocol SDK](https://github.com/modelcontextprotocol/sdk)

---

## 📞 Support & Questions

For Phase 3 implementation questions:
1. Review PROJECT-STRUCTURE.md (lines 618-842) for complete specification
2. Check OpenAI Agents SDK documentation for agent patterns
3. Consult MCP SDK documentation for tool implementation
4. Refer to Phase 2 patterns for database and API integration

---

**Phase 3 Implementation Team**: Powered by OpenAI ChatKit + Agents SDK + MCP Server
**Made with ❤️ using Claude Code**
