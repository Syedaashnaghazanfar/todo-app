"""
Agent Template - Basic AI Agent with MCP Server Connection

Copy this template to create your own AI agent with MCP tool orchestration.

Usage:
    1. Copy this file to your project
    2. Update AGENT_INSTRUCTIONS with your agent's behavior
    3. Update MCP server path and name
    4. Customize provider/model as needed
"""

import os
from pathlib import Path

from agents import Agent
from agents.mcp import MCPServerStdio
from agents.model_settings import ModelSettings


# Agent Instructions - CUSTOMIZE THIS
AGENT_INSTRUCTIONS = """
You are a helpful AI assistant.

## Your Capabilities

You have access to the following tools:
- tool1: Description of tool1
- tool2: Description of tool2

## Behavior Guidelines

1. **Tool Usage**
   - When user requests X, use tool1
   - When user requests Y, use tool2

2. **Conversational Style**
   - Be friendly, helpful, concise
   - Use natural language, not technical jargon
   - Acknowledge actions positively

## Response Pattern

✅ Good: "I've completed your request!"
❌ Bad: "Operation completed with status code 200."
"""


class MyAgent:
    """
    AI agent for [YOUR USE CASE].

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
        # STEP 1: Create model from factory
        # UPDATE: Import your model factory
        from agent_config.factory import create_model

        self.model = create_model(provider=provider, model=model)

        # STEP 2: Configure MCP server path
        # UPDATE: Path to your MCP server module
        backend_dir = Path(__file__).parent.parent
        mcp_server_path = backend_dir / "mcp_server" / "tools.py"

        # STEP 3: Create MCP server connection
        # UPDATE: Server name and module path
        self.mcp_server = MCPServerStdio(
            name="my-mcp-server",  # UPDATE: Your server name
            params={
                "command": "python",
                "args": ["-m", "mcp_server"],  # UPDATE: Your module path
                "env": os.environ.copy(),
            },
            # CRITICAL: Set timeout for database operations
            client_session_timeout_seconds=30.0,
        )

        # STEP 4: Create agent
        # UPDATE: Agent name and instructions
        self.agent = Agent(
            name="MyAgent",  # UPDATE: Your agent name
            model=self.model,
            instructions=AGENT_INSTRUCTIONS,
            mcp_servers=[self.mcp_server],
            model_settings=ModelSettings(
                # Prevent concurrent DB writes
                parallel_tool_calls=False,
            ),
        )

    def get_agent(self) -> Agent:
        """
        Get configured agent instance.

        Returns:
            Agent: Configured agent ready for conversation
        """
        return self.agent


# Convenience function
def create_my_agent(provider: str | None = None, model: str | None = None) -> MyAgent:
    """
    Create and return agent instance.

    Args:
        provider: LLM provider override
        model: Model name override

    Returns:
        MyAgent: Configured agent instance
    """
    return MyAgent(provider=provider, model=model)
