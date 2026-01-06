"""
ChatKit server implementation with task management agent integration.

This module provides a ChatKitServer that integrates with the OpenAI Agents SDK
and MCP tools to provide conversational task management.

Features:
- Conversation context management via PostgresChatKitStore
- Automatic memory of previous messages within a thread
- User-specific conversation isolation
- Integration with existing TodoAgent and MCP tools
"""

import logging
import sys
import uuid
from typing import Any, AsyncIterator
from datetime import datetime

from chatkit.server import ChatKitServer
from chatkit.types import (
    ThreadStreamEvent, ThreadMetadata, UserMessageItem,
    ThreadItemDoneEvent, WorkflowItem, Workflow, DurationSummary
)
from chatkit.agents import AgentContext, stream_agent_response, simple_to_agent_input
from agents import Runner

from ..agent_config.todo_agent import TodoAgent
from .store import PostgresChatKitStore

logger = logging.getLogger(__name__)


class TaskChatKitServer(ChatKitServer):
    """ChatKit server for task management with agent integration."""

    def __init__(self, store: PostgresChatKitStore):
        """
        Initialize the ChatKit server.

        Args:
            store: PostgresChatKitStore for persisting threads and messages
        """
        super().__init__(store, attachment_store=None)

        # Create TodoAgent instance (reuse existing agent configuration)
        self.todo_agent_instance = TodoAgent()
        self.agent = self.todo_agent_instance.get_agent()

        logger.info("TaskChatKitServer initialized with PostgreSQL store")

    async def respond(
        self,
        thread: ThreadMetadata,
        input: UserMessageItem | None,
        context: Any,
    ) -> AsyncIterator[ThreadStreamEvent]:
        """
        Process user messages and stream responses with conversation memory.

        This method:
        1. Creates AgentContext with thread and store
        2. Converts ChatKit input to Agents SDK format
        3. Runs agent with MCP tools and existing conversation history
        4. Streams response events back to client

        Args:
            thread: Thread metadata
            input: User message from ChatKit
            context: Request context containing user_id

        Yields:
            ThreadStreamEvent: Chat events (text, tool calls, etc.)
        """
        # Extract user_id from context
        user_id = context.get("user_id")
        if not user_id:
            logger.error("No user_id in context")
            return

        logger.info(
            f"Processing message for user {user_id}, thread {thread.id}"
        )

        # Create agent context with user info
        agent_context = AgentContext(
            thread=thread,
            store=self.store,
            request_context=context,
        )

        # Convert ChatKit input to Agents SDK format
        agent_input = await simple_to_agent_input(input) if input else []

        logger.info(f"Running agent with {len(agent_input)} input messages")

        # Inject user_id into agent's first message as system context
        # This ensures the agent knows which user_id to use for MCP tool calls
        system_message = {
            "role": "system",
            "content": f"You are helping user_id: {user_id}. IMPORTANT: When calling MCP tools (add_task, list_tasks, etc.), always use user_id=\"{user_id}\" as the first parameter."
        }

        # Prepend system message to agent input
        agent_input_with_context = [system_message] + agent_input

        # Run agent with streaming AND MCP server context
        # IMPORTANT: MCP server must be connected before the agent can use tools
        async with self.todo_agent_instance.mcp_server:
            # Generate a real message ID upfront to replace __fake_id__
            # This ensures frontend and database have matching IDs
            real_message_id = str(uuid.uuid4())
            fake_id_map: dict[str, str] = {}  # Map __fake_id__ variants to real UUIDs

            # Run agent with streaming
            result = Runner.run_streamed(
                self.agent,
                agent_input_with_context,
                context=agent_context,
            )

            # Stream agent response with ID replacement
            async for event in stream_agent_response(agent_context, result):
                # Replace __fake_id__ with real UUID in events
                if hasattr(event, 'item') and hasattr(event.item, 'id'):
                    item_id = str(event.item.id)
                    if item_id == "__fake_id__" or item_id.startswith("__fake_id__"):
                        # Map this fake ID to a real UUID
                        if item_id not in fake_id_map:
                            fake_id_map[item_id] = real_message_id
                        # Create a copy of the event with the real ID
                        event.item.id = fake_id_map[item_id]
                        print(f"[SERVER-DBG] Replaced fake ID {item_id[:20]}... with {real_message_id[:20]}...", file=sys.stderr)

                print(f"[SERVER-DBG] Event type: {event.type}", file=sys.stderr)
                sys.stderr.flush()
                yield event

        # FIX: After streaming completes, close any active workflow to hide the thinking indicator
        # The stream_agent_response function saves the workflow for continuation but doesn't close it
        if agent_context.workflow_item:
            workflow = agent_context.workflow_item
            # Calculate duration
            delta = datetime.now() - workflow.created_at
            duration = int(delta.total_seconds())
            if workflow.workflow.summary is None:
                workflow.workflow.summary = DurationSummary(duration=duration)
            workflow.workflow.expanded = False
            yield ThreadItemDoneEvent(item=workflow)
            logger.info(f"Closed thinking workflow for thread {thread.id}")

        logger.info(f"Agent streaming completed for thread {thread.id}")
