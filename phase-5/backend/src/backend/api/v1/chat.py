"""
Chat API endpoint for Phase 3 AI chatbot.

Integrates with Phase 2 JWT authentication and database.
Implements stateless request handling with SSE streaming.

Architecture:
- T028: POST /api/v1/chat endpoint
- T029: JWT authentication via get_current_user_id
- T030: Stateless request handling (load history, save messages)
- T031: SSE streaming response
- T032: Agent runner with MCP server integration

Phase 14 Polish (T074-T077):
- T074: OpenAI rate limit handling with exponential backoff
- T075: Database unavailability error handling
- T076: Message length validation (max 5000 chars)
- T077: Comprehensive logging for all chat operations
"""

import asyncio
import logging
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlmodel.ext.asyncio.session import AsyncSession as AsyncSessionType
from pydantic import BaseModel, Field, validator
from sqlalchemy.exc import OperationalError, DatabaseError
from openai import (
    RateLimitError,
    APIConnectionError,
    APITimeoutError,
    APIError,
)

# Configure logger for chat operations (T077)
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

# Phase 2 imports (existing)
from ...api.dependencies import get_current_user_id  # Phase 2 JWT dependency
from ...database.async_session import get_async_session

# Phase 3 imports (new)
from ...services import conversation_service
from backend.agent_config.todo_agent import TodoAgent
from agents import Runner

router = APIRouter(prefix="/api/v1", tags=["chat"])


# Retry configuration for LLM API calls
MAX_RETRIES = 3
INITIAL_RETRY_DELAY = 1.0  # seconds
MAX_RETRY_DELAY = 10.0  # seconds


class ChatRequest(BaseModel):
    """
    Chat request schema with validation (T076).

    Attributes:
        conversation_id: Optional conversation ID to resume (creates new if None)
        message: User message text (1-5000 characters)
    """
    conversation_id: Optional[int] = Field(
        default=None,
        description="Optional conversation ID to resume. Creates new if not provided."
    )
    message: str = Field(
        min_length=1,
        max_length=5000,
        description="User message text"
    )

    @validator('message')
    def validate_message(cls, v):
        """
        T076: Validate message length and content.

        Args:
            v: Message string

        Returns:
            Validated message string

        Raises:
            ValueError: If message is empty, whitespace-only, or exceeds max length
        """
        # Check for empty/whitespace-only messages
        if not v or not v.strip():
            raise ValueError("Message cannot be empty or whitespace-only")

        # Check max length (Pydantic validates min/max_length, but add explicit check)
        if len(v) > 5000:
            raise ValueError(f"Message exceeds maximum length of 5000 characters (got {len(v)})")

        return v.strip()


async def run_agent_with_retry(
    agent,
    agent_messages: list,
    context_variables: dict,
    max_retries: int = MAX_RETRIES,
    user_id: str = None,
    conversation_id: int = None
):
    """
    T074: Run agent with exponential backoff retry logic.

    Handles transient errors from OpenAI/Gemini/Groq/OpenRouter with retry:
    - RateLimitError (429) → Retry with exponential backoff (1s, 2s, 4s)
    - APIConnectionError → Retry with exponential backoff
    - APITimeoutError → Retry with exponential backoff

    Non-retryable errors:
    - APIError (401, 403, invalid API key) → Fail immediately

    Args:
        agent: Configured Agent instance
        agent_messages: List of message dicts
        context_variables: Context for MCP tools (e.g., {"user_id": "..."})
        max_retries: Maximum retry attempts (default: 3)
        user_id: User ID for logging (T077)
        conversation_id: Conversation ID for logging (T077)

    Returns:
        AsyncIterator: Agent streaming result

    Raises:
        HTTPException: User-friendly error after retries exhausted
    """
    for attempt in range(max_retries):
        try:
            # T077: Log agent invocation
            logger.info(
                f"Agent invocation attempt {attempt + 1}/{max_retries} - "
                f"user_id={user_id}, conversation_id={conversation_id}, "
                f"message_count={len(agent_messages)}"
            )

            result = Runner.run_streamed(
                agent=agent,
                messages=agent_messages,
                context_variables=context_variables
            )

            # T077: Log successful agent start
            logger.info(
                f"Agent streaming started successfully - "
                f"user_id={user_id}, conversation_id={conversation_id}"
            )

            return result

        except RateLimitError as e:
            # T074: Rate limit handling with exponential backoff
            if attempt < max_retries - 1:
                retry_delay = min(INITIAL_RETRY_DELAY * (2 ** attempt), MAX_RETRY_DELAY)
                logger.warning(
                    f"Rate limit error on attempt {attempt + 1}/{max_retries} - "
                    f"user_id={user_id}, conversation_id={conversation_id}, "
                    f"retrying in {retry_delay}s. Error: {str(e)}"
                )
                await asyncio.sleep(retry_delay)
                continue
            else:
                # T077: Log final rate limit failure
                logger.error(
                    f"Rate limit error - all retries exhausted - "
                    f"user_id={user_id}, conversation_id={conversation_id}. Error: {str(e)}"
                )
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail="AI service rate limit exceeded. Please try again in a moment."
                )

        except (APIConnectionError, APITimeoutError) as e:
            # T074: Connection/timeout handling with exponential backoff
            if attempt < max_retries - 1:
                retry_delay = min(INITIAL_RETRY_DELAY * (2 ** attempt), MAX_RETRY_DELAY)
                logger.warning(
                    f"API connection/timeout error on attempt {attempt + 1}/{max_retries} - "
                    f"user_id={user_id}, conversation_id={conversation_id}, "
                    f"retrying in {retry_delay}s. Error: {str(e)}"
                )
                await asyncio.sleep(retry_delay)
                continue
            else:
                # T077: Log final connection failure
                logger.error(
                    f"API connection error - all retries exhausted - "
                    f"user_id={user_id}, conversation_id={conversation_id}. Error: {str(e)}"
                )
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail="Unable to connect to AI service. Please try again."
                )

        except APIError as e:
            # T074: Non-retryable API error (401, 403, invalid API key, etc.)
            logger.error(
                f"Non-retryable API error - "
                f"user_id={user_id}, conversation_id={conversation_id}. Error: {str(e)}"
            )
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="AI service error. Please contact support."
            )


@router.post("/chat")
async def chat_with_agent(
    request: ChatRequest,
    current_user_id: str = Depends(get_current_user_id),  # T029: Phase 2 JWT
    session: AsyncSessionType = Depends(get_async_session)  # Phase 3 async
):
    """
    Chat endpoint with SSE streaming (T028-T032) and Phase 14 polish (T074-T077).

    Security:
    - Uses Phase 2 JWT authentication (T029)
    - All database queries filter by user_id

    Stateless Architecture (T030):
    - Loads conversation history from database on every request
    - No in-memory state between requests
    - Persists all messages to database

    SSE Streaming (T031):
    - Streams agent responses as they arrive
    - Client receives incremental updates
    - Connection kept alive during generation

    Agent Integration (T032):
    - Connects to MCP server via stdio
    - Agent routes to appropriate tools based on user intent
    - Tools execute task operations on database

    Phase 14 Polish (T074-T077):
    - T074: Rate limit handling with exponential backoff (3 retries: 1s, 2s, 4s delays)
    - T075: Database error handling with user-friendly messages
    - T076: Message validation (max 5000 chars, no empty/whitespace)
    - T077: Comprehensive logging (request start, agent calls, errors, completion)

    Args:
        request: Chat request with optional conversation_id and message (validated by T076)
        current_user_id: User ID from JWT (Phase 2 dependency)
        session: Async database session (Phase 3)

    Returns:
        StreamingResponse with SSE events

    Raises:
        HTTPException 400: If message validation fails (T076)
        HTTPException 401: If JWT authentication fails
        HTTPException 404: If conversation_id not found
        HTTPException 500: If database unavailable (T075) or agent execution fails
        HTTPException 503: If rate limit exceeded (T074) or API unavailable

    Example Request:
        POST /api/v1/chat
        Headers:
            Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
        Body:
            {
                "conversation_id": 1,  // Optional
                "message": "Add a task to buy groceries"
            }

    Example Response (SSE):
        data: I've added
        data:  'Buy groceries'
        data:  to your tasks!
        data: [DONE]
    """
    # T077: Log chat request start
    message_preview = request.message[:100] + "..." if len(request.message) > 100 else request.message
    logger.info(
        f"Chat request started - user_id={current_user_id}, "
        f"conversation_id={request.conversation_id}, "
        f"message_preview='{message_preview}'"
    )

    try:
        # T075: Database error handling - Wrap all DB operations
        try:
            # T030: Stateless request handling - Step 1: Get or create conversation
            conversation = await conversation_service.get_or_create_conversation(
                session=session,
                user_id=current_user_id,
                conversation_id=request.conversation_id
            )

            # T077: Log conversation loaded/created
            logger.info(
                f"Conversation loaded - conversation_id={conversation.id}, "
                f"user_id={current_user_id}, is_new={request.conversation_id is None}"
            )

            # T030: Step 2: Get conversation history (stateless - load from DB)
            history = await conversation_service.get_conversation_history(
                session=session,
                conversation_id=conversation.id,
                user_id=current_user_id,
                limit=50  # Last 50 messages for context
            )

            # T077: Log history loaded
            logger.debug(
                f"Conversation history loaded - conversation_id={conversation.id}, "
                f"message_count={len(history)}"
            )

            # T030: Step 3: Add user message to history for agent
            agent_messages = history + [{"role": "user", "content": request.message}]

            # T030: Step 4: Save user message to database
            await conversation_service.add_message(
                session=session,
                user_id=current_user_id,
                conversation_id=conversation.id,
                role="user",
                content=request.message
            )

            # T077: Log user message saved
            logger.debug(
                f"User message saved - conversation_id={conversation.id}, "
                f"user_id={current_user_id}"
            )

        except (OperationalError, DatabaseError) as db_error:
            # T075: Database unavailability error handling
            logger.error(
                f"Database error - user_id={current_user_id}, "
                f"conversation_id={request.conversation_id}. Error: {str(db_error)}",
                exc_info=True
            )
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Database temporarily unavailable. Please try again in a moment."
            )

        # T032: Create agent with MCP server
        todo_agent = TodoAgent()
        agent = todo_agent.get_agent()

        # T077: Log agent creation
        logger.debug(f"Agent created - user_id={current_user_id}, conversation_id={conversation.id}")

        # T031: SSE streaming response
        async def event_generator():
            """
            Generator for SSE streaming with Phase 14 polish.

            Streams agent responses as they arrive from LLM.
            Saves complete assistant response to database after streaming.
            Includes comprehensive logging (T077) and error handling (T074, T075).
            """
            try:
                # T032: MCP server lifecycle management
                async with todo_agent.mcp_server:
                    response_chunks = []

                    # T032 + T074: Run agent with retry logic and stream results
                    stream = await run_agent_with_retry(
                        agent=agent,
                        agent_messages=agent_messages,
                        context_variables={"user_id": current_user_id},  # Pass to MCP tools
                        user_id=current_user_id,  # T077: For logging
                        conversation_id=conversation.id  # T077: For logging
                    )

                    # T077: Log streaming start
                    logger.debug(
                        f"Agent streaming started - conversation_id={conversation.id}, "
                        f"user_id={current_user_id}"
                    )

                    # T031: Stream chunks as SSE events
                    chunk_count = 0
                    async for chunk in stream:
                        if hasattr(chunk, 'delta') and chunk.delta:
                            response_chunks.append(chunk.delta)
                            chunk_count += 1
                            # SSE format: "data: {text}\n\n"
                            yield f"data: {chunk.delta}\n\n"

                    # T077: Log streaming completion
                    logger.info(
                        f"Agent streaming completed - conversation_id={conversation.id}, "
                        f"user_id={current_user_id}, chunks={chunk_count}, "
                        f"response_length={len(''.join(response_chunks))}"
                    )

                    # T030 + T075: Step 5: Save assistant response to database with error handling
                    try:
                        full_response = "".join(response_chunks)
                        await conversation_service.add_message(
                            session=session,
                            user_id=current_user_id,
                            conversation_id=conversation.id,
                            role="assistant",
                            content=full_response
                        )

                        # T077: Log assistant message saved
                        logger.debug(
                            f"Assistant message saved - conversation_id={conversation.id}, "
                            f"user_id={current_user_id}"
                        )

                    except (OperationalError, DatabaseError) as db_error:
                        # T075: Database error when saving response
                        logger.error(
                            f"Failed to save assistant response - conversation_id={conversation.id}, "
                            f"user_id={current_user_id}. Error: {str(db_error)}",
                            exc_info=True
                        )
                        # Still send response to client, but log the DB failure
                        # Don't stream error to client since they got the response

                    # Signal completion
                    yield "data: [DONE]\n\n"

            except Exception as e:
                # T077: Log streaming error
                logger.error(
                    f"Streaming error - conversation_id={conversation.id}, "
                    f"user_id={current_user_id}. Error: {str(e)}",
                    exc_info=True
                )
                # Stream error to client
                yield f"data: Error: {str(e)}\n\n"

        # T031: Return SSE streaming response
        # T077: Log streaming response start
        logger.debug(
            f"Returning SSE streaming response - conversation_id={conversation.id}, "
            f"user_id={current_user_id}"
        )

        return StreamingResponse(
            event_generator(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no",  # Disable nginx buffering
            }
        )

    except HTTPException as http_exc:
        # T077: Log HTTP exceptions before re-raising
        logger.warning(
            f"HTTP exception - user_id={current_user_id}, "
            f"conversation_id={request.conversation_id}, "
            f"status={http_exc.status_code}, detail={http_exc.detail}"
        )
        # Re-raise HTTP exceptions (401, 404, etc.)
        raise

    except Exception as e:
        # T077: Log unexpected errors
        logger.error(
            f"Unexpected error in chat endpoint - user_id={current_user_id}, "
            f"conversation_id={request.conversation_id}. Error: {str(e)}",
            exc_info=True
        )
        # Catch-all for unexpected errors
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Chat request failed: {str(e)}"
        )


@router.get("/{user_id}/conversations")
async def get_user_conversations_endpoint(
    user_id: str,
    session: AsyncSessionType = Depends(get_async_session),
    current_user_id: str = Depends(get_current_user_id),
    limit: int = 50,
    offset: int = 0,
):
    """
    Get user's conversation list.

    Retrieve all conversations for authenticated user with pagination.

    **Authentication:**
    - Requires valid JWT token
    - User ID from JWT must match user_id in URL

    **Query Parameters:**
    - limit (int): Maximum conversations to return (default 50, max 100)
    - offset (int): Number of conversations to skip (default 0)

    Args:
        user_id: User ID from URL path
        session: Async database session (injected)
        current_user_id: Current user from JWT token (injected)
        limit: Maximum conversations to return
        offset: Pagination offset

    Returns:
        dict: List of conversations with metadata

    Raises:
        HTTPException: 403 if user_id doesn't match JWT token
    """
    # Verify user_id matches JWT token
    if current_user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User ID mismatch: cannot access other users' conversations"
        )

    # Validate and cap limit
    limit = min(limit, 100)

    # Get conversations from service
    conversations = await conversation_service.get_user_conversations(
        session=session,
        user_id=current_user_id,
        limit=limit,
        offset=offset,
    )

    # Format response
    return {
        "success": True,
        "data": {
            "conversations": [
                {
                    "id": conv.id,
                    "title": conv.title,
                    "is_active": conv.is_active,
                    "created_at": conv.created_at.isoformat(),
                    "updated_at": conv.updated_at.isoformat(),
                }
                for conv in conversations
            ],
            "count": len(conversations),
            "limit": limit,
            "offset": offset,
        },
    }


@router.get("/{user_id}/conversations/{conversation_id}/messages")
async def get_conversation_messages_endpoint(
    user_id: str,
    conversation_id: int,
    session: AsyncSessionType = Depends(get_async_session),
    current_user_id: str = Depends(get_current_user_id),
    limit: int | None = None,
):
    """
    Get conversation message history.

    Retrieve all messages for a specific conversation.

    **Authentication:**
    - Requires valid JWT token
    - User ID from JWT must match user_id in URL

    **Query Parameters:**
    - limit (int | None): Optional limit on number of messages

    Args:
        user_id: User ID from URL path
        conversation_id: Conversation ID from URL path
        session: Async database session (injected)
        current_user_id: Current user from JWT token (injected)
        limit: Optional message limit

    Returns:
        dict: List of messages ordered chronologically

    Raises:
        HTTPException: 403 if user_id doesn't match JWT token
        HTTPException: 404 if conversation not found
    """
    # Verify user_id matches JWT token
    if current_user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User ID mismatch: cannot access other users' conversations"
        )

    # Get messages from service
    messages = await conversation_service.get_conversation_history(
        session=session,
        user_id=current_user_id,
        conversation_id=conversation_id,
        limit=limit,
    )

    # Format response
    return {
        "success": True,
        "data": {
            "messages": [
                {
                    "id": msg.id,
                    "role": msg.role,
                    "content": msg.content,
                    "tool_calls": msg.tool_calls if hasattr(msg, 'tool_calls') else None,
                    "created_at": msg.created_at.isoformat(),
                }
                for msg in messages
            ],
            "count": len(messages),
        },
    }


@router.post("/admin/cleanup/messages", tags=["admin"])
async def trigger_message_cleanup():
    """
    Trigger cleanup of expired messages (2-day retention policy).

    This endpoint runs the message cleanup job immediately.
    Should be called periodically (e.g., daily at off-peak hours) by an external scheduler.

    **Note:** This endpoint has no authentication requirement to allow external schedulers
    to trigger it. In production, consider adding API key authentication or IP whitelisting.

    Returns:
        dict: Cleanup statistics including:
            - deleted_count: Number of messages deleted
            - timestamp: When cleanup was executed

    Example:
        curl -X POST "http://localhost:8000/api/v1/admin/cleanup/messages"
    """
    try:
        from ...tasks.message_cleanup import cleanup_expired_messages

        result = cleanup_expired_messages()

        return {
            "success": result.get("success", False),
            "data": {
                "deleted_count": result.get("deleted_count", 0),
                "timestamp": result.get("timestamp"),
            },
            "error": result.get("error") if not result.get("success", False) else None,
        }
    except ImportError:
        logger.warning("message_cleanup module not found, skipping cleanup")
        return {
            "success": False,
            "error": "Cleanup functionality not available"
        }
