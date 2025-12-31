"""
AI agent for conversational task management.

Connects to MCP server via stdio for tool access.
Supports multiple LLM providers via model factory.
"""

import os
from pathlib import Path
from agents import Agent
from agents.mcp import MCPServerStdio
from agents.model_settings import ModelSettings
from backend.agent_config.factory import create_model

# Agent behavior instructions (CONCISE VERSION to avoid rate limits)
AGENT_INSTRUCTIONS = """
You are a helpful task assistant. Help users manage todo lists through natural conversation.

## Your Process (shown to user as thinking)
1. First, understand what the user wants to do
2. If you need to look up tasks, call list_tasks first
3. Then perform the requested action
4. Confirm what you did in a friendly way

## Tools Available

add_task(user_id, title, description?, priority?)
- Create new task. Extract title from user message.
- priority: "low" | "medium" | "high" | "very_important" (default: "medium")

list_tasks(user_id, status)
- status: "all" | "pending" | "completed"

complete_task(user_id, task_id)
- Mark a single task as complete

delete_task(user_id, task_id)
- Delete a single task permanently

update_task(user_id, task_id, title?, description?, priority?)
- Update task details

bulk_update_tasks(user_id, action, filter_status)
- action: "complete" | "delete"
- filter_status: "all" | "pending" | "completed"

set_priority(user_id, task_id, priority)
- priority: "low" | "medium" | "high" | "very_important"

list_tasks_by_priority(user_id, priority, status)
- priority: "low" | "medium" | "high" | "very_important"
- status: "all" | "pending" | "completed"

## Rules
1. Extract task title naturally from user message
2. Priority keywords: "urgent/critical/asap/high"→"high", "low/minor/optional"→"low", else "medium"
3. user_id is auto-injected, NEVER mention it in responses
4. NEVER expose IDs, JSON, or technical details
5. Be friendly and concise
6. When you call list_tasks, tell the user what you're doing (e.g., "Let me check your tasks...")

## Examples
- User: "Add task buy groceries" → You think: "Let me add this task" → add_task() → "I've added 'Buy groceries'!"
- User: "Show all tasks" → You think: "Let me look up your tasks" → list_tasks() → "You have X tasks:"
- User: "Complete pending" → You think: "Let me complete all pending tasks" → bulk_update_tasks() → "Done!"

## Errors
- Task not found: "I couldn't find that task. Try listing tasks first."
- Invalid input: "Could you clarify?"
- System error: "Sorry, something went wrong. Please try again."

## Greetings
"Hello! I'm your task assistant. How can I help you today?"

## Irrelevant Requests
"I specialize in task management. Would you like to add, view, or complete tasks?"
"""


class TodoAgent:
    """
    AI agent for conversational task management.

    Connects to MCP server via stdio for tool access.
    Supports multiple LLM providers via model factory.
    """

    def __init__(self, provider: str | None = None, model: str | None = None):
        """
        Initialize agent with model and MCP server.

        Args:
            provider: LLM provider ("openai" | "gemini" | "groq" | "openrouter")
            model: Model name (overrides env var default)
        """
        # Create model from factory
        self.model = create_model(provider=provider, model=model)

        # Get MCP server module path
        backend_dir = Path(__file__).parent.parent.parent  # Points to src/

        # Prepare environment with PYTHONPATH set to src directory
        env = os.environ.copy()
        env["PYTHONPATH"] = str(backend_dir)  # Add src to PYTHONPATH

        # Create MCP server connection via stdio
        # CRITICAL: Set client_session_timeout_seconds for database operations
        # Default: 5 seconds → Setting to 60 seconds for production with cold starts
        self.mcp_server = MCPServerStdio(
            name="task-management-server",
            params={
                "command": "python",
                "args": ["-m", "backend.mcp_server"],  # Run as module from src directory
                "env": env,                    # Pass environment with PYTHONPATH
                "cwd": str(backend_dir),       # Set working directory to src/
            },
            client_session_timeout_seconds=60.0,  # MCP ClientSession timeout (T022)
        )

        # Create agent
        # ModelSettings(parallel_tool_calls=False) prevents database lock issues
        self.agent = Agent(
            name="TodoAgent",
            model=self.model,
            instructions=AGENT_INSTRUCTIONS,
            mcp_servers=[self.mcp_server],
            model_settings=ModelSettings(
                parallel_tool_calls=False,  # Prevent concurrent DB writes
            ),
        )

    def get_agent(self) -> Agent:
        """Get configured agent instance."""
        return self.agent
