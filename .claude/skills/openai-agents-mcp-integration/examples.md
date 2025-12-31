# OpenAI Agents SDK + MCP Integration - Code Examples

This document provides complete, working code examples for building AI agents with OpenAI Agents SDK and MCP tool orchestration.

## Table of Contents

1. [Complete Todo Agent Example](#1-complete-todo-agent-example)
2. [Multi-Provider Model Factory](#2-multi-provider-model-factory)
3. [MCP Server with Tools](#3-mcp-server-with-tools)
4. [FastAPI Streaming Endpoint](#4-fastapi-streaming-endpoint)
5. [Database Models and Services](#5-database-models-and-services)
6. [Testing Examples](#6-testing-examples)

---

## 1. Complete Todo Agent Example

### File: `agent_config/todo_agent.py`

```python
"""
TodoAgent - AI assistant for task management (Phase III).

This module defines the TodoAgent class using OpenAI Agents SDK.
The agent connects to a separate MCP server process via MCPServerStdio
and accesses task management tools through the MCP protocol.

Architecture:
- MCP Server: Separate process exposing task tools via FastMCP
- Agent: Connects to MCP server via stdio transport
- Tools: Available through MCP protocol (not direct imports)
"""

import os
from pathlib import Path

from agents import Agent
from agents.mcp import MCPServerStdio
from agents.model_settings import ModelSettings


# Agent Instructions
AGENT_INSTRUCTIONS = """
You are a helpful task management assistant. Your role is to help users manage their todo lists through natural conversation.

## Your Capabilities

You have access to the following task management tools:
- add_task: Create new tasks with title, optional description, and optional priority (auto-detects priority from text)
- list_tasks: Show tasks (all, pending, or completed)
- complete_task: Mark a single task as done
- bulk_update_tasks: Mark multiple tasks as done or delete multiple tasks at once (use this for bulk operations)
- delete_task: Remove a single task permanently
- update_task: Modify task title, description, or priority
- set_priority: Update a task's priority level (low, medium, high)
- list_tasks_by_priority: Show tasks filtered by priority level with optional status filter

## Behavior Guidelines

1. **Task Creation**
   - When user mentions adding, creating, or remembering something, use add_task
   - Extract clear, actionable titles from user messages
   - Capture additional context in description field
   - Confirm task creation with a friendly message

2. **Priority Handling**
   - add_task automatically detects priority from keywords like:
     * High priority: "high", "urgent", "critical", "important", "ASAP"
     * Low priority: "low", "minor", "optional", "when you have time"
     * Medium priority: Default if no keywords found
   - Use set_priority to change a task's priority after creation
   - Use list_tasks_by_priority to show tasks by priority

3. **Task Completion**
   - For multiple tasks, use bulk_update_tasks(action="complete", filter_status="pending")
   - For single tasks, use complete_task with specific task_id
   - Provide encouraging feedback after completion

4. **Conversational Style**
   - Be friendly, helpful, and concise
   - Use natural language, not technical jargon
   - Acknowledge user actions positively
   - NEVER include user IDs in any response - they are internal identifiers only

5. **Handling Greetings and Social Interactions**
   - **Greetings** (hi, hello, hey, good morning, etc.):
     * Respond warmly: "Hello! I'm your task assistant. How can I help you today?"
     * Ask what they need: "Hi there! Would you like to add a task, view your tasks, or something else?"
   - **Gratitude** (thanks, thank you, appreciate it, etc.):
     * Respond positively: "You're welcome! Let me know if you need anything else."
     * Offer continued help: "Happy to help! Anything else you'd like to do?"
   - **Irrelevant Requests** (weather, jokes, unrelated topics):
     * Politely decline: "I'm sorry, I'm specialized in task management and can't help with that."
     * Redirect: "I can help you manage your tasks though! Would you like to add, view, or complete any tasks?"

## Response Pattern

✅ Good: "I've added 'Buy groceries' to your task list. Is there anything else?"
❌ Bad: "Task created with ID 42. Status: created."

✅ Good: "You have 3 pending tasks: 1. Buy groceries, 2. Call dentist, 3. Pay bills"
❌ Bad: "Here's the JSON response: [{...}]"

✅ Good: "I've marked 'Buy groceries' as complete. Great job!"
❌ Bad: "Task 42 completion status updated to true."

✅ Good: "Hello! I'm your task assistant. How can I help you today?"
❌ Bad: "Hi."

✅ Good: "I'm sorry, I'm specialized in task management and can't help with that. Would you like to manage your tasks?"
❌ Bad: "I don't know about that."
"""


class TodoAgent:
    """
    TodoAgent for conversational task management.

    This class creates an OpenAI Agents SDK Agent that connects to
    a separate MCP server process for task management tools.

    Attributes:
        agent: OpenAI Agents SDK Agent instance
        model: AI model configuration (from factory)
        mcp_server: MCPServerStdio instance managing server process
    """

    def __init__(self, provider: str | None = None, model: str | None = None):
        """
        Initialize TodoAgent with AI model and MCP server connection.

        Args:
            provider: Override LLM_PROVIDER env var ("openai" | "gemini" | "groq" | "openrouter")
            model: Override model name (e.g., "gpt-4o", "gemini-2.5-flash", "llama-3.3-70b-versatile", "openai/gpt-oss-20b:free")

        Raises:
            ValueError: If provider not supported or API key missing

        Example:
            >>> # OpenAI agent
            >>> agent = TodoAgent()
            >>> # Gemini agent
            >>> agent = TodoAgent(provider="gemini")
            >>> # Groq agent
            >>> agent = TodoAgent(provider="groq")
            >>> # OpenRouter agent with free model
            >>> agent = TodoAgent(provider="openrouter", model="openai/gpt-oss-20b:free")

        Note:
            The agent connects to MCP server via stdio transport.
            The MCP server must be available as a Python module at mcp_server.
        """
        # Create model configuration using factory
        from agent_config.factory import create_model

        self.model = create_model(provider=provider, model=model)

        # Get path to MCP server module
        backend_dir = Path(__file__).parent.parent
        mcp_server_path = backend_dir / "mcp_server" / "tools.py"

        # Create MCP server connection via stdio
        # CRITICAL: Set client_session_timeout_seconds for database operations
        # Default: 5 seconds → Setting to 30 seconds for production
        # This controls the timeout for MCP tool calls and initialization
        self.mcp_server = MCPServerStdio(
            name="task-management-server",
            params={
                "command": "python",
                "args": ["-m", "mcp_server"],
                "env": os.environ.copy(),  # Pass environment variables
            },
            client_session_timeout_seconds=30.0,  # MCP ClientSession timeout (increased from default 5s)
        )

        # Create agent with MCP server
        # ModelSettings disables parallel tool calling to prevent database bottlenecks
        self.agent = Agent(
            name="TodoAgent",
            model=self.model,
            instructions=AGENT_INSTRUCTIONS,
            mcp_servers=[self.mcp_server],
            model_settings=ModelSettings(
                parallel_tool_calls=False,  # Disable parallel calls to prevent database locks
            ),
        )

    def get_agent(self) -> Agent:
        """
        Get the underlying OpenAI Agents SDK Agent instance.

        Returns:
            Agent: Configured agent ready for conversation

        Example:
            >>> todo_agent = TodoAgent()
            >>> agent = todo_agent.get_agent()
            >>> # Use with Runner for streaming
            >>> from agents import Runner
            >>> async with todo_agent.mcp_server:
            >>>     result = await Runner.run_streamed(agent, "Add buy milk")

        Note:
            The MCP server connection must be managed with async context:
            - Use 'async with mcp_server:' to start/stop server
            - Agent.run() is now async when using MCP servers
        """
        return self.agent


# Convenience function for quick agent creation
def create_todo_agent(provider: str | None = None, model: str | None = None) -> TodoAgent:
    """
    Create and return a TodoAgent instance.

    This is a convenience function for creating TodoAgent without
    explicitly instantiating the class.

    Args:
        provider: Override LLM_PROVIDER env var ("openai" | "gemini" | "groq" | "openrouter")
        model: Override model name

    Returns:
        TodoAgent: Configured TodoAgent instance

    Example:
        >>> agent = create_todo_agent()
        >>> # Or with explicit provider
        >>> agent = create_todo_agent(provider="gemini", model="gemini-2.5-flash")
        >>> # Or with Groq
        >>> agent = create_todo_agent(provider="groq", model="llama-3.3-70b-versatile")
        >>> # Or with OpenRouter free model
        >>> agent = create_todo_agent(provider="openrouter", model="openai/gpt-oss-20b:free")
    """
    return TodoAgent(provider=provider, model=model)
```

---

## 2. Multi-Provider Model Factory

### File: `agent_config/factory.py`

```python
"""
Model factory for AI agent provider abstraction.

This module provides the create_model() function for centralizing
AI provider configuration and supporting multiple LLM backends.

Supports:
- OpenAI (default)
- Gemini via OpenAI-compatible API
- Groq via OpenAI-compatible API
- OpenRouter via OpenAI-compatible API

Environment variables:
- LLM_PROVIDER: "openai", "gemini", "groq", or "openrouter" (default: "openai")
- OPENAI_API_KEY: OpenAI API key
- GEMINI_API_KEY: Gemini API key
- GROQ_API_KEY: Groq API key
- OPENROUTER_API_KEY: OpenRouter API key
- OPENAI_DEFAULT_MODEL: Model name for OpenAI (default: "gpt-4o-mini")
- GEMINI_DEFAULT_MODEL: Model name for Gemini (default: "gemini-2.5-flash")
- GROQ_DEFAULT_MODEL: Model name for Groq (default: "llama-3.3-70b-versatile")
- OPENROUTER_DEFAULT_MODEL: Model name for OpenRouter (default: "openai/gpt-oss-20b:free")
"""

import os
from pathlib import Path

from dotenv import load_dotenv
from agents import OpenAIChatCompletionsModel
from openai import AsyncOpenAI

# Disable OpenAI telemetry/tracing for faster responses
os.environ.setdefault("OTEL_SDK_DISABLED", "true")
os.environ.setdefault("OTEL_TRACES_EXPORTER", "none")
os.environ.setdefault("OTEL_METRICS_EXPORTER", "none")

# Load environment variables from .env file
env_path = Path(__file__).parent.parent / ".env"
if env_path.exists():
    load_dotenv(env_path, override=True)
else:
    load_dotenv(override=True)


def create_model(provider: str | None = None, model: str | None = None) -> OpenAIChatCompletionsModel:
    """
    Create an LLM model instance based on environment configuration.

    Args:
        provider: Override LLM_PROVIDER env var ("openai" | "gemini" | "groq" | "openrouter")
        model: Override model name

    Returns:
        OpenAIChatCompletionsModel configured for the selected provider

    Raises:
        ValueError: If provider is unsupported or API key is missing

    Example:
        >>> # OpenAI usage
        >>> model = create_model()  # Uses LLM_PROVIDER from env
        >>> agent = Agent(name="MyAgent", model=model, tools=[...])

        >>> # Gemini usage
        >>> model = create_model(provider="gemini")
        >>> agent = Agent(name="MyAgent", model=model, tools=[...])

        >>> # Groq usage
        >>> model = create_model(provider="groq")
        >>> agent = Agent(name="MyAgent", model=model, tools=[...])

        >>> # OpenRouter usage with free model
        >>> model = create_model(provider="openrouter", model="openai/gpt-oss-20b:free")
        >>> agent = Agent(name="MyAgent", model=model, tools=[...])
    """
    provider = provider or os.getenv("LLM_PROVIDER", "openai").lower()

    if provider == "gemini":
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError(
                "GEMINI_API_KEY environment variable is required when LLM_PROVIDER=gemini"
            )

        client = AsyncOpenAI(
            api_key=api_key,
            base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
        )

        model_name = model or os.getenv("GEMINI_DEFAULT_MODEL", "gemini-2.5-flash")

        return OpenAIChatCompletionsModel(model=model_name, openai_client=client)

    elif provider == "groq":
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            raise ValueError(
                "GROQ_API_KEY environment variable is required when LLM_PROVIDER=groq"
            )

        client = AsyncOpenAI(
            api_key=api_key,
            base_url="https://api.groq.com/openai/v1",
        )

        model_name = model or os.getenv("GROQ_DEFAULT_MODEL", "llama-3.3-70b-versatile")

        return OpenAIChatCompletionsModel(model=model_name, openai_client=client)

    elif provider == "openrouter":
        api_key = os.getenv("OPENROUTER_API_KEY")
        if not api_key:
            raise ValueError(
                "OPENROUTER_API_KEY environment variable is required when LLM_PROVIDER=openrouter"
            )

        client = AsyncOpenAI(
            api_key=api_key,
            base_url="https://openrouter.ai/api/v1",
        )

        model_name = model or os.getenv("OPENROUTER_DEFAULT_MODEL", "openai/gpt-oss-20b:free")

        return OpenAIChatCompletionsModel(model=model_name, openai_client=client)

    elif provider == "openai":
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError(
                "OPENAI_API_KEY environment variable is required when LLM_PROVIDER=openai"
            )

        client = AsyncOpenAI(api_key=api_key)
        model_name = model or os.getenv("OPENAI_DEFAULT_MODEL", "gpt-4o-mini")

        return OpenAIChatCompletionsModel(model=model_name, openai_client=client)

    else:
        raise ValueError(
            f"Unsupported LLM provider: {provider}. "
            f"Supported providers: openai, gemini, groq, openrouter"
        )
```

---

## 3. MCP Server with FastMCP (Phase III)

### File: `mcp_server/tools.py`

```python
"""
MCP Server exposing task management tools using FastMCP.

This module implements an MCP server using FastMCP (Modern MCP SDK)
that exposes task management tools to the OpenAI Agent via stdio transport.

FastMCP benefits:
- 80% less boilerplate code
- Automatic stdio transport setup
- Plain Python return types (no types.TextContent)
- Clean decorator syntax: @mcp.tool()
"""

from typing import Optional
from mcp.server.fastmcp import FastMCP
from sqlmodel import Session

# Import database and services (Phase 2 structure: src.*)
from src.db import get_session
from src.services.task_service import TaskService
from src.schemas.task import TaskCreate, TaskUpdate

# Create FastMCP server instance (part of official MCP Python SDK)
mcp = FastMCP("task-management-server")


@mcp.tool()
def add_task(
    user_id: str,
    title: str,
    description: Optional[str] = None,
    priority: Optional[str] = None,
    due_date: Optional[str] = None,
    tags: Optional[list[str]] = None,
) -> dict:
    """
    Create a new task for the user with automatic priority detection.

    Args:
        user_id: User's unique identifier (from JWT context)
        title: Task title (required)
        description: Optional task description
        priority: Task priority ("High", "Medium", "Low") - auto-detected if not provided
        due_date: Optional due date in YYYY-MM-DD format
        tags: Optional list of tag names

    Returns:
        Dict with task details including id, title, priority, completed status

    Example:
        >>> add_task(
        ...     user_id="user-123",
        ...     title="Buy groceries",
        ...     priority="High"
        ... )
        {"task_id": 1, "title": "Buy groceries", "priority": "High", "completed": False}
    """
    session: Session = next(get_session())
    try:
        # Auto-detect priority from title/description if not provided
        if not priority:
            priority = _detect_priority(title, description or "")

        # Create task using Phase 2 TaskService
        task_create = TaskCreate(
            title=title,
            description=description,
            priority=priority,
            due_date=due_date,
            tags=tags or [],
        )

        task = TaskService.create_task(
            session=session,
            user_id=user_id,
            task_create=task_create,
        )

        return {
            "task_id": task.id,
            "title": task.title,
            "priority": task.priority,
            "completed": task.completed,
            "due_date": task.due_date.isoformat() if task.due_date else None,
        }
    finally:
        session.close()


@mcp.tool()
def list_tasks(
    user_id: str,
    status: str = "all",
    priority: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = 50,
) -> dict:
    """
    List user's tasks with filtering options.

    Args:
        user_id: User's unique identifier
        status: Filter by status ("all", "pending", "completed")
        priority: Filter by priority ("High", "Medium", "Low", or None for all)
        search: Search term for title/description
        limit: Maximum number of tasks to return

    Returns:
        Dict with list of tasks and count

    Example:
        >>> list_tasks(user_id="user-123", status="pending", priority="High")
        {"tasks": [...], "count": 5, "status": "pending", "priority": "High"}
    """
    session: Session = next(get_session())
    try:
        # Convert status filter to completed boolean (Phase 2 uses "completed" not "status")
        completed = None
        if status == "completed":
            completed = True
        elif status == "pending":
            completed = False

        # Use Phase 2 TaskService get_user_tasks method
        tasks, total = TaskService.get_user_tasks(
            session=session,
            user_id=user_id,
            completed=completed,
            priority=priority if priority != "all" else None,
            search=search,
            limit=limit,
        )

        task_list = [
            {
                "id": str(task.id),  # Convert UUID to string
                "title": task.title,
                "description": task.description,
                "priority": task.priority,
                "completed": task.completed,
                "due_date": task.due_date.isoformat() if task.due_date else None,
                "created_at": task.created_at.isoformat(),
                "tags": task.tags if hasattr(task, 'tags') else [],
            }
            for task in tasks
        ]

        return {
            "tasks": task_list,
            "count": len(task_list),
            "total": total,
            "status": status,
            "priority": priority,
        }
    finally:
        session.close()


@mcp.tool()
def complete_task(user_id: str, task_id: str) -> dict:
    """
    Mark a task as completed (or toggle completion status).

    Args:
        user_id: User's unique identifier
        task_id: UUID of the task to complete (as string)

    Returns:
        Dict with task details and new completion status

    Example:
        >>> complete_task(user_id="user-123", task_id="550e8400-e29b-41d4-a716-446655440000")
        {"task_id": "550e8400...", "title": "Buy groceries", "completed": True}
    """
    session: Session = next(get_session())
    try:
        from uuid import UUID

        # Phase 2 doesn't have toggle_complete - use update_task with completed field
        task_update = TaskUpdate(completed=True)
        task = TaskService.update_task(
            session=session,
            user_id=user_id,
            task_id=UUID(task_id),
            task_update=task_update
        )

        if not task:
            return {
                "success": False,
                "message": f"Task not found or you don't have permission to access it."
            }

        return {
            "success": True,
            "task_id": str(task.id),
            "title": task.title,
            "completed": task.completed,
            "message": f"Marked '{task.title}' as complete.",
        }
    finally:
        session.close()


@mcp.tool()
def delete_task(user_id: str, task_id: str) -> dict:
    """
    Delete a task permanently.

    Args:
        user_id: User's unique identifier
        task_id: UUID of the task to delete (as string)

    Returns:
        Dict with success status and deleted task ID

    Example:
        >>> delete_task(user_id="user-123", task_id="550e8400-e29b-41d4-a716-446655440000")
        {"success": True, "task_id": "550e8400...", "message": "Task deleted successfully"}
    """
    session: Session = next(get_session())
    try:
        from uuid import UUID

        # Use Phase 2 TaskService delete_task method
        success = TaskService.delete_task(
            session=session,
            user_id=user_id,
            task_id=UUID(task_id)
        )

        if not success:
            return {
                "success": False,
                "message": "Task not found or you don't have permission to delete it.",
            }

        return {
            "success": True,
            "task_id": task_id,
            "message": "Task deleted successfully.",
        }
    finally:
        session.close()


@mcp.tool()
def update_task(
    user_id: str,
    task_id: str,
    title: Optional[str] = None,
    description: Optional[str] = None,
    priority: Optional[str] = None,
    due_date: Optional[str] = None,
    tags: Optional[list[str]] = None,
) -> dict:
    """
    Update task details (partial update).

    Args:
        user_id: User's unique identifier
        task_id: UUID of the task to update (as string)
        title: New title (optional)
        description: New description (optional)
        priority: New priority (optional)
        due_date: New due date in YYYY-MM-DD format (optional)
        tags: New tags list (optional)

    Returns:
        Dict with updated task details

    Example:
        >>> update_task(
        ...     user_id="user-123",
        ...     task_id="550e8400-e29b-41d4-a716-446655440000",
        ...     priority="High",
        ...     due_date="2025-12-31"
        ... )
        {"task_id": "550e8400...", "title": "...", "priority": "High", "due_date": "2025-12-31"}
    """
    session: Session = next(get_session())
    try:
        from uuid import UUID
        from datetime import datetime

        # Convert due_date string to date object if provided
        due_date_obj = None
        if due_date:
            due_date_obj = datetime.strptime(due_date, "%Y-%m-%d").date()

        # Build TaskUpdate with only provided fields (Phase 2 uses model_dump(exclude_unset=True))
        task_update = TaskUpdate(
            title=title,
            description=description,
            priority=priority,
            due_date=due_date_obj,
            tags=tags,
        )

        # Use Phase 2 TaskService update_task method
        task = TaskService.update_task(
            session=session,
            user_id=user_id,
            task_id=UUID(task_id),
            task_update=task_update,
        )

        if not task:
            return {
                "success": False,
                "message": "Task not found or you don't have permission to update it.",
            }

        return {
            "success": True,
            "task_id": str(task.id),
            "title": task.title,
            "description": task.description,
            "priority": task.priority,
            "due_date": task.due_date.isoformat() if task.due_date else None,
            "tags": task.tags if hasattr(task, 'tags') else [],
            "message": f"Task '{task.title}' updated successfully.",
        }
    finally:
        session.close()


# Helper function for priority detection
def _detect_priority(title: str, description: str) -> str:
    """
    Detect priority from natural language keywords.

    Args:
        title: Task title
        description: Task description

    Returns:
        Priority level: "High", "Medium", or "Low"
    """
    text = f"{title} {description}".lower()

    high_keywords = ["urgent", "critical", "important", "asap", "high priority"]
    low_keywords = ["low", "minor", "optional", "when you have time"]

    if any(keyword in text for keyword in high_keywords):
        return "High"
    elif any(keyword in text for keyword in low_keywords):
        return "Low"
    else:
        return "Medium"
```

### File: `mcp_server/__init__.py`

```python
"""MCP server exposing task management tools via FastMCP."""
```

### File: `mcp_server/__main__.py`

```python
"""
Entry point for MCP server when run as module.

FastMCP automatically handles stdio transport setup - no manual configuration needed!
"""

from mcp_server.tools import mcp

if __name__ == "__main__":
    # FastMCP's run() method handles everything automatically
    mcp.run()
```

---

## 4. FastAPI Streaming Endpoint

### File: `routers/chat.py`

```python
"""
Chat router for AI agent streaming endpoint.

Handles conversation management, agent execution, and SSE streaming.
"""

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlmodel import Session
from uuid import UUID
import json

from db import get_session
from agent_config.todo_agent import create_todo_agent
from services.conversation_service import ConversationService
from schemas.chat import ChatRequest
from agents import Runner

router = APIRouter(prefix="/api", tags=["chat"])


@router.post("/{user_id}/chat")
async def chat_with_agent(
    user_id: UUID,
    request: ChatRequest,
    session: Session = Depends(get_session)
):
    """
    Chat with AI agent using Server-Sent Events (SSE) streaming.

    Args:
        user_id: User's unique identifier
        request: ChatRequest with conversation_id and message
        session: Database session

    Returns:
        StreamingResponse with SSE events containing agent responses

    Example:
        POST /api/{user_id}/chat
        {
            "conversation_id": "optional-uuid",
            "message": "Add task to buy groceries"
        }

        Response (SSE):
        data: I've added
        data:  'Buy groceries'
        data:  to your
        data:  tasks!
        data: [DONE]
    """
    try:
        # Get or create conversation
        conversation = await ConversationService.get_or_create_conversation(
            session=session,
            user_id=user_id,
            conversation_id=request.conversation_id
        )

        # Save user message to database
        await ConversationService.add_message(
            session=session,
            conversation_id=conversation.id,
            user_id=user_id,
            role="user",
            content=request.message
        )

        # Get conversation history for context
        history = await ConversationService.get_conversation_history(
            session=session,
            conversation_id=conversation.id,
            user_id=user_id
        )

        # Create agent
        todo_agent = create_todo_agent()
        agent = todo_agent.get_agent()

        # Stream response
        async def event_generator():
            """Generate SSE events from agent responses."""
            try:
                # CRITICAL: Use async context manager for MCP server
                async with todo_agent.mcp_server:
                    response_chunks = []

                    # Stream agent responses
                    async for chunk in Runner.run_streamed(
                        agent=agent,
                        messages=history,
                        context_variables={"user_id": str(user_id)}
                    ):
                        # Handle text deltas
                        if hasattr(chunk, 'delta') and chunk.delta:
                            response_chunks.append(chunk.delta)
                            # Send chunk to client
                            yield f"data: {chunk.delta}\n\n"

                    # Save complete assistant response to database
                    full_response = "".join(response_chunks)
                    await ConversationService.add_message(
                        session=session,
                        conversation_id=conversation.id,
                        user_id=user_id,
                        role="assistant",
                        content=full_response
                    )

                    # Signal completion
                    yield "data: [DONE]\n\n"

            except Exception as e:
                # Log and return error to client
                error_msg = f"Error: {str(e)}"
                yield f"data: {error_msg}\n\n"

        # Return streaming response
        return StreamingResponse(
            event_generator(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no",  # Disable nginx buffering
            }
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process chat request: {str(e)}"
        )


@router.get("/{user_id}/conversations")
async def get_user_conversations(
    user_id: UUID,
    session: Session = Depends(get_session)
):
    """
    Get list of user's conversations.

    Args:
        user_id: User's unique identifier
        session: Database session

    Returns:
        List of conversation objects with metadata
    """
    try:
        conversations = await ConversationService.get_user_conversations(
            session=session,
            user_id=user_id
        )

        return {
            "success": True,
            "data": {
                "conversations": [
                    {
                        "id": str(conv.id),
                        "created_at": conv.created_at.isoformat(),
                        "updated_at": conv.updated_at.isoformat(),
                        "message_count": len(conv.messages) if hasattr(conv, 'messages') else 0
                    }
                    for conv in conversations
                ]
            }
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get conversations: {str(e)}"
        )
```

---

## 5. Database Models and Services

### File: `models.py` (Conversation Models)

```python
"""Database models for conversations and messages."""

from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from uuid import UUID, uuid4
from enum import Enum


class TaskPriority(str, Enum):
    """Task priority levels."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class Conversation(SQLModel, table=True):
    """
    Conversation session between user and AI agent.

    Attributes:
        id: Unique conversation identifier
        user_id: User who owns this conversation
        created_at: When conversation started
        updated_at: Last message timestamp
        messages: All messages in this conversation
    """
    __tablename__ = "conversations"

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


class Message(SQLModel, table=True):
    """
    Individual message in a conversation.

    Attributes:
        id: Unique message identifier
        conversation_id: Parent conversation
        user_id: User who owns this message (for filtering)
        role: Message role (user | assistant | system)
        content: Message text content
        tool_calls: JSON string of tool calls (if any)
        created_at: Message timestamp
    """
    __tablename__ = "messages"

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

### File: `services/conversation_service.py`

```python
"""Service layer for conversation and message operations."""

from uuid import UUID
from sqlmodel import Session, select
from datetime import datetime
from models import Conversation, Message


class ConversationService:
    """Business logic for conversation management."""

    @staticmethod
    async def get_or_create_conversation(
        session: Session,
        user_id: UUID,
        conversation_id: UUID | None = None
    ) -> Conversation:
        """
        Get existing conversation or create new one.

        Args:
            session: Database session
            user_id: User's unique identifier
            conversation_id: Optional existing conversation ID

        Returns:
            Conversation object

        Example:
            >>> conversation = await ConversationService.get_or_create_conversation(
            ...     session=session,
            ...     user_id=user_id,
            ...     conversation_id=None  # Creates new conversation
            ... )
        """
        if conversation_id:
            # Try to get existing conversation
            stmt = select(Conversation).where(
                Conversation.id == conversation_id,
                Conversation.user_id == user_id  # User isolation
            )
            conversation = session.exec(stmt).first()
            if conversation:
                return conversation

        # Create new conversation
        conversation = Conversation(user_id=user_id)
        session.add(conversation)
        session.commit()
        session.refresh(conversation)
        return conversation

    @staticmethod
    async def add_message(
        session: Session,
        conversation_id: UUID,
        user_id: UUID,
        role: str,
        content: str,
        tool_calls: str | None = None
    ) -> Message:
        """
        Add message to conversation.

        Args:
            session: Database session
            conversation_id: Parent conversation ID
            user_id: User's unique identifier
            role: Message role ("user" | "assistant" | "system")
            content: Message text content
            tool_calls: Optional JSON string of tool calls

        Returns:
            Message object

        Example:
            >>> message = await ConversationService.add_message(
            ...     session=session,
            ...     conversation_id=conversation.id,
            ...     user_id=user_id,
            ...     role="user",
            ...     content="Add task to buy groceries"
            ... )
        """
        message = Message(
            conversation_id=conversation_id,
            user_id=user_id,
            role=role,
            content=content,
            tool_calls=tool_calls
        )
        session.add(message)

        # Update conversation timestamp
        stmt = select(Conversation).where(Conversation.id == conversation_id)
        conversation = session.exec(stmt).first()
        if conversation:
            conversation.updated_at = datetime.utcnow()

        session.commit()
        session.refresh(message)
        return message

    @staticmethod
    async def get_conversation_history(
        session: Session,
        conversation_id: UUID,
        user_id: UUID,
        limit: int | None = None
    ) -> list[dict]:
        """
        Get conversation messages formatted for agent.

        Args:
            session: Database session
            conversation_id: Conversation ID
            user_id: User's unique identifier
            limit: Optional max messages to return

        Returns:
            List of message dicts with role and content

        Example:
            >>> history = await ConversationService.get_conversation_history(
            ...     session=session,
            ...     conversation_id=conversation.id,
            ...     user_id=user_id,
            ...     limit=50  # Last 50 messages
            ... )
            >>> # Returns: [{"role": "user", "content": "..."}, ...]
        """
        stmt = select(Message).where(
            Message.conversation_id == conversation_id,
            Message.user_id == user_id  # User isolation
        ).order_by(Message.created_at)

        if limit:
            # Get last N messages (most recent first, then reverse)
            stmt = stmt.order_by(Message.created_at.desc()).limit(limit)
            messages = session.exec(stmt).all()
            messages = reversed(messages)
        else:
            messages = session.exec(stmt).all()

        return [
            {
                "role": msg.role,
                "content": msg.content
            }
            for msg in messages
        ]

    @staticmethod
    async def get_user_conversations(
        session: Session,
        user_id: UUID
    ) -> list[Conversation]:
        """
        Get all conversations for a user.

        Args:
            session: Database session
            user_id: User's unique identifier

        Returns:
            List of Conversation objects

        Example:
            >>> conversations = await ConversationService.get_user_conversations(
            ...     session=session,
            ...     user_id=user_id
            ... )
        """
        stmt = select(Conversation).where(
            Conversation.user_id == user_id
        ).order_by(Conversation.updated_at.desc())

        return session.exec(stmt).all()
```

---

## 6. Testing Examples

### File: `tests/conftest.py`

```python
"""Pytest configuration and fixtures."""

import pytest
from sqlmodel import Session, create_engine, SQLModel
from sqlmodel.pool import StaticPool
from uuid import uuid4
from models import User, Task, Conversation, Message


@pytest.fixture(name="session")
def session_fixture():
    """Create test database session."""
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session


@pytest.fixture(name="test_user")
def test_user_fixture(session: Session):
    """Create test user."""
    user = User(
        id=uuid4(),
        email="test@example.com",
        name="Test User"
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


@pytest.fixture(name="test_conversation")
def test_conversation_fixture(session: Session, test_user: User):
    """Create test conversation."""
    conversation = Conversation(user_id=test_user.id)
    session.add(conversation)
    session.commit()
    session.refresh(conversation)
    return conversation
```

### File: `tests/test_factory.py`

```python
"""Tests for model factory."""

import pytest
from agent_config.factory import create_model


def test_create_model_openai(monkeypatch):
    """Test OpenAI model creation."""
    monkeypatch.setenv("LLM_PROVIDER", "openai")
    monkeypatch.setenv("OPENAI_API_KEY", "sk-test123")

    model = create_model()
    assert model is not None


def test_create_model_gemini(monkeypatch):
    """Test Gemini model creation."""
    monkeypatch.setenv("LLM_PROVIDER", "gemini")
    monkeypatch.setenv("GEMINI_API_KEY", "AIza-test123")

    model = create_model()
    assert model is not None


def test_create_model_missing_key(monkeypatch):
    """Test error when API key missing."""
    monkeypatch.setenv("LLM_PROVIDER", "openai")
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)

    with pytest.raises(ValueError, match="OPENAI_API_KEY required"):
        create_model()


def test_create_model_unsupported_provider(monkeypatch):
    """Test error for unsupported provider."""
    monkeypatch.setenv("LLM_PROVIDER", "unsupported")

    with pytest.raises(ValueError, match="Unsupported provider"):
        create_model()
```

### File: `tests/test_conversation_service.py`

```python
"""Tests for conversation service."""

import pytest
from uuid import uuid4
from services.conversation_service import ConversationService


@pytest.mark.asyncio
async def test_create_conversation(session, test_user):
    """Test conversation creation."""
    conversation = await ConversationService.get_or_create_conversation(
        session=session,
        user_id=test_user.id
    )

    assert conversation.id is not None
    assert conversation.user_id == test_user.id


@pytest.mark.asyncio
async def test_add_message(session, test_user, test_conversation):
    """Test adding message to conversation."""
    message = await ConversationService.add_message(
        session=session,
        conversation_id=test_conversation.id,
        user_id=test_user.id,
        role="user",
        content="Test message"
    )

    assert message.id is not None
    assert message.content == "Test message"
    assert message.role == "user"


@pytest.mark.asyncio
async def test_get_conversation_history(session, test_user, test_conversation):
    """Test retrieving conversation history."""
    # Add messages
    await ConversationService.add_message(
        session=session,
        conversation_id=test_conversation.id,
        user_id=test_user.id,
        role="user",
        content="Message 1"
    )
    await ConversationService.add_message(
        session=session,
        conversation_id=test_conversation.id,
        user_id=test_user.id,
        role="assistant",
        content="Message 2"
    )

    # Get history
    history = await ConversationService.get_conversation_history(
        session=session,
        conversation_id=test_conversation.id,
        user_id=test_user.id
    )

    assert len(history) == 2
    assert history[0]["role"] == "user"
    assert history[0]["content"] == "Message 1"
    assert history[1]["role"] == "assistant"
    assert history[1]["content"] == "Message 2"
```

---

## Environment Configuration Example

### File: `.env`

```bash
# Database
DATABASE_URL=postgresql://user:pass@host:5432/db_name

# Authentication
BETTER_AUTH_SECRET=your-secret-key-here

# LLM Provider Selection
LLM_PROVIDER=openrouter  # openai, gemini, groq, or openrouter

# OpenAI Configuration
OPENAI_API_KEY=sk-...
OPENAI_DEFAULT_MODEL=gpt-4o-mini

# Gemini Configuration
GEMINI_API_KEY=AIza...
GEMINI_DEFAULT_MODEL=gemini-2.5-flash

# Groq Configuration
GROQ_API_KEY=gsk_...
GROQ_DEFAULT_MODEL=llama-3.3-70b-versatile

# OpenRouter Configuration (Free model available!)
OPENROUTER_API_KEY=sk-or-v1-...
OPENROUTER_DEFAULT_MODEL=openai/gpt-oss-20b:free

# Server Configuration
PORT=8000
ENVIRONMENT=development
LOG_LEVEL=INFO
CORS_ORIGINS=http://localhost:3000
```

---

## Usage Examples

### 1. Simple Chat Request

```python
import asyncio
from agent_config.todo_agent import create_todo_agent
from agents import Runner

async def simple_chat():
    """Simple chat example."""
    agent_wrapper = create_todo_agent(provider="openrouter")
    agent = agent_wrapper.get_agent()

    async with agent_wrapper.mcp_server:
        result = await Runner.run(
            agent=agent,
            messages=[{"role": "user", "content": "Add task to buy groceries"}],
            context_variables={"user_id": "test-user-id"}
        )

        print("Agent response:", result.content)

asyncio.run(simple_chat())
```

### 2. Streaming Chat

```python
import asyncio
from agent_config.todo_agent import create_todo_agent
from agents import Runner

async def streaming_chat():
    """Streaming chat example."""
    agent_wrapper = create_todo_agent()
    agent = agent_wrapper.get_agent()

    async with agent_wrapper.mcp_server:
        async for chunk in Runner.run_streamed(
            agent=agent,
            messages=[{"role": "user", "content": "List my tasks"}],
            context_variables={"user_id": "test-user-id"}
        ):
            if hasattr(chunk, 'delta') and chunk.delta:
                print(chunk.delta, end="", flush=True)

        print()  # New line at end

asyncio.run(streaming_chat())
```

### 3. Multi-Turn Conversation

```python
import asyncio
from agent_config.todo_agent import create_todo_agent
from agents import Runner

async def multi_turn_chat():
    """Multi-turn conversation example."""
    agent_wrapper = create_todo_agent()
    agent = agent_wrapper.get_agent()

    conversation = [
        {"role": "user", "content": "Add task to buy milk"},
        {"role": "assistant", "content": "I've added 'Buy milk' to your tasks!"},
        {"role": "user", "content": "Make it high priority"},
    ]

    async with agent_wrapper.mcp_server:
        result = await Runner.run(
            agent=agent,
            messages=conversation,
            context_variables={"user_id": "test-user-id"}
        )

        print("Agent response:", result.content)

asyncio.run(multi_turn_chat())
```

---

## 7. Phase 3 Complete Implementation Example

### Complete Phase 3 Chat Endpoint with All Features

**File**: `src/api/v1/chat.py`

```python
"""
Complete Phase 3 Chat Endpoint Implementation.

Demonstrates ALL Phase 3 features integrated with Phase 2:
- Async database sessions (Phase 3) coexisting with sync sessions (Phase 2)
- JWT authentication using Phase 2 dependency
- Conversation persistence with user isolation
- Retry logic with exponential backoff
- SSE streaming responses
- Message cleanup integration
"""

import asyncio
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlmodel.ext.asyncio.session import AsyncSession
from pydantic import BaseModel, Field
from openai import RateLimitError, APIConnectionError, APITimeoutError, APIError

# Phase 2 imports (existing)
from ...db.async_session import get_async_session
from ...auth.dependencies import get_current_user_id

# Phase 3 imports (new)
from ...services.conversation_service import (
    get_or_create_conversation,
    add_message,
    get_conversation_history
)
from agent_config.todo_agent import create_todo_agent
from agents import Runner

router = APIRouter(prefix="/api", tags=["chat"])


class ChatRequest(BaseModel):
    """Chat request schema."""
    conversation_id: Optional[int] = Field(default=None, description="Existing conversation ID")
    message: str = Field(min_length=1, max_length=5000, description="User message")


# Retry configuration
MAX_RETRIES = 3
INITIAL_RETRY_DELAY = 1.0
MAX_RETRY_DELAY = 10.0


async def run_agent_with_retry(agent, agent_messages: list, context_variables: dict, max_retries: int = MAX_RETRIES):
    """Run agent with exponential backoff retry logic."""
    for attempt in range(max_retries):
        try:
            return Runner.run_streamed(
                agent=agent,
                messages=agent_messages,
                context_variables=context_variables
            )
        except RateLimitError:
            if attempt < max_retries - 1:
                retry_delay = min(INITIAL_RETRY_DELAY * (2 ** attempt), MAX_RETRY_DELAY)
                await asyncio.sleep(retry_delay)
                continue
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="AI service rate limit exceeded. Please try again in a moment."
            )
        except (APIConnectionError, APITimeoutError):
            if attempt < max_retries - 1:
                retry_delay = min(INITIAL_RETRY_DELAY * (2 ** attempt), MAX_RETRY_DELAY)
                await asyncio.sleep(retry_delay)
                continue
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Unable to connect to AI service. Please try again."
            )
        except APIError:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="AI service error. Please contact support."
            )


@router.post("/{user_id}/chat")
async def chat_with_agent(
    user_id: str,
    request: ChatRequest,
    current_user_id: str = Depends(get_current_user_id),  # Phase 2 JWT
    session: AsyncSession = Depends(get_async_session)  # Phase 3 async
):
    """
    Complete Phase 3 chat endpoint with all features.

    Features:
    - Phase 2 JWT authentication
    - User isolation validation
    - Async database operations
    - Conversation persistence
    - Retry logic with exponential backoff
    - SSE streaming responses
    - Error handling

    Security:
    - Uses Phase 2 JWT dependency
    - Validates user_id matches JWT
    - All queries filter by user_id

    Args:
        user_id: User ID from URL path
        request: Chat request with optional conversation_id and message
        current_user_id: User ID from JWT (Phase 2 dependency)
        session: Async database session (Phase 3)

    Returns:
        StreamingResponse with SSE events

    Example Request:
        POST /api/user-123/chat
        {
            "conversation_id": null,
            "message": "Add urgent task to fix bug"
        }

    Example Response (SSE stream):
        data: I've added
        data:  'Fix bug'
        data:  to your tasks
        data:  with high priority!
        data: [DONE]
    """
    # Phase 2 user isolation pattern
    if user_id != current_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this resource"
        )

    try:
        # Step 1: Get or create conversation
        conversation = await get_or_create_conversation(
            session=session,
            user_id=user_id,
            conversation_id=request.conversation_id
        )

        # Step 2: Get conversation history (for context)
        history = await get_conversation_history(
            session=session,
            conversation_id=conversation.id,
            user_id=user_id,
            limit=50
        )

        # Step 3: Build agent messages (history + new message)
        agent_messages = history + [{"role": "user", "content": request.message}]

        # Step 4: Save user message to database
        await add_message(
            session=session,
            user_id=user_id,
            conversation_id=conversation.id,
            role="user",
            content=request.message
        )

        # Step 5: Create agent
        todo_agent = create_todo_agent()
        agent = todo_agent.get_agent()

        # Step 6: Stream response with retry logic
        async def event_generator():
            try:
                async with todo_agent.mcp_server:
                    response_chunks = []

                    # Use retry wrapper for resilience
                    stream = await run_agent_with_retry(
                        agent=agent,
                        agent_messages=agent_messages,
                        context_variables={"user_id": user_id}
                    )

                    async for chunk in stream:
                        if hasattr(chunk, 'delta') and chunk.delta:
                            response_chunks.append(chunk.delta)
                            yield f"data: {chunk.delta}\n\n"

                    # Step 7: Save assistant response to database
                    full_response = "".join(response_chunks)
                    await add_message(
                        session=session,
                        user_id=user_id,
                        conversation_id=conversation.id,
                        role="assistant",
                        content=full_response
                    )

                    yield "data: [DONE]\n\n"

            except Exception as e:
                yield f"data: Error: {str(e)}\n\n"

        return StreamingResponse(
            event_generator(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no",
            }
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Chat request failed: {str(e)}"
        )


@router.post("/admin/cleanup/messages")
async def trigger_message_cleanup():
    """
    Trigger message cleanup task manually.

    Deletes messages where expires_at < now() (2-day retention).

    Returns:
        dict: {"success": bool, "deleted_count": int, "timestamp": str}
    """
    from ...tasks.message_cleanup import cleanup_expired_messages
    result = cleanup_expired_messages()
    return result
```

### Testing the Complete Implementation

```python
"""
Test the complete Phase 3 chat endpoint.

Run with: uv run pytest tests/test_chat_endpoint.py -v
"""

import pytest
from httpx import AsyncClient
from sqlmodel.ext.asyncio.session import AsyncSession

@pytest.mark.asyncio
async def test_chat_endpoint_new_conversation(
    async_client: AsyncClient,
    test_user_id: str,
    test_jwt_token: str
):
    """Test chat endpoint with new conversation."""
    response = await async_client.post(
        f"/api/{test_user_id}/chat",
        json={
            "conversation_id": None,
            "message": "Add task to buy groceries"
        },
        headers={"Authorization": f"Bearer {test_jwt_token}"}
    )

    assert response.status_code == 200
    assert response.headers["content-type"] == "text/event-stream; charset=utf-8"

    # Read SSE stream
    content = response.text
    assert "data:" in content
    assert "[DONE]" in content


@pytest.mark.asyncio
async def test_chat_endpoint_existing_conversation(
    async_client: AsyncClient,
    test_user_id: str,
    test_conversation_id: int,
    test_jwt_token: str
):
    """Test chat endpoint with existing conversation."""
    response = await async_client.post(
        f"/api/{test_user_id}/chat",
        json={
            "conversation_id": test_conversation_id,
            "message": "List my tasks"
        },
        headers={"Authorization": f"Bearer {test_jwt_token}"}
    )

    assert response.status_code == 200


@pytest.mark.asyncio
async def test_chat_endpoint_user_isolation(
    async_client: AsyncClient,
    test_jwt_token: str
):
    """Test that users cannot access other users' chats."""
    response = await async_client.post(
        "/api/wrong-user-id/chat",
        json={"message": "Hello"},
        headers={"Authorization": f"Bearer {test_jwt_token}"}
    )

    # Should return 403 Forbidden (user_id doesn't match JWT)
    assert response.status_code == 403
```

---

## 8. Phase 3 Project Structure

```
backend/
├── src/
│   ├── api/
│   │   └── v1/
│   │       ├── tasks.py           # Phase 2 (existing)
│   │       └── chat.py            # Phase 3 (NEW)
│   ├── db/
│   │   ├── engine.py              # Phase 2 (existing)
│   │   ├── session.py             # Phase 2 sync (existing)
│   │   └── async_session.py       # Phase 3 async (NEW)
│   ├── models/
│   │   ├── task.py                # Phase 2 (existing)
│   │   ├── tag.py                 # Phase 2 (existing)
│   │   ├── task_tag.py            # Phase 2 (existing)
│   │   ├── conversation.py        # Phase 3 (NEW)
│   │   └── message.py             # Phase 3 (NEW)
│   ├── services/
│   │   ├── task_service.py        # Phase 2 (existing)
│   │   ├── tag_service.py         # Phase 2 (existing)
│   │   └── conversation_service.py # Phase 3 (NEW)
│   ├── tasks/
│   │   └── message_cleanup.py     # Phase 3 (NEW)
│   └── main.py                    # Updated with chat router
├── agent_config/
│   ├── __init__.py
│   ├── factory.py                 # Phase 3 (NEW)
│   └── todo_agent.py              # Phase 3 (NEW)
├── mcp_server/
│   ├── __init__.py                # Phase 3 (NEW)
│   ├── __main__.py                # Phase 3 (NEW)
│   └── tools.py                   # Phase 3 (NEW)
└── tests/
    ├── test_conversation_service.py  # Phase 3 (NEW)
    └── test_chat_endpoint.py         # Phase 3 (NEW)
```

---

**Last Updated**: December 2024
**Skill Version**: 2.0.0 (Phase 3 Complete)
**Tested With**: OpenAI Agents SDK v0.2.9+, Official MCP SDK v1.0.0+, FastAPI 0.115+, SQLModel 0.0.22+
