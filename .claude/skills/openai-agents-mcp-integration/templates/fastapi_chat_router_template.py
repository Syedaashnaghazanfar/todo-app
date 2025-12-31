"""
FastAPI Chat Router Template - SSE Streaming Endpoint with Async Database

Copy this template to create a streaming chat endpoint for your AI agent.

Usage:
    1. Copy to your project's src/api/v1/ directory as chat.py
    2. Update imports for your agent, services, and Phase 2 dependencies
    3. Customize endpoint logic
    4. Register router in main.py: app.include_router(chat_router)

Requirements:
    pip install fastapi sqlmodel asyncpg openai-agents mcp openai
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlmodel.ext.asyncio.session import AsyncSession
from pydantic import BaseModel
from typing import Optional
import asyncio
from openai import RateLimitError, APIConnectionError, APITimeoutError, APIError

# TODO: Update these imports for your Phase 2 structure
from ...db.async_session import get_async_session
from ...auth.dependencies import get_current_user_id

# TODO: Update these imports for your Phase 3 services
# from ...services.conversation_service import (
#     get_or_create_conversation,
#     add_message,
#     get_conversation_history
# )
# from agent_config.my_agent import create_my_agent

from agents import Runner


# Request Schema
class ChatRequest(BaseModel):
    """Chat request schema."""
    conversation_id: Optional[int] = None
    message: str


# Create router
router = APIRouter(prefix="/api", tags=["chat"])


# Retry configuration
MAX_RETRIES = 3
INITIAL_RETRY_DELAY = 1.0
MAX_RETRY_DELAY = 10.0


async def run_agent_with_retry(agent, agent_messages: list, context_variables: dict, max_retries: int = MAX_RETRIES):
    """
    Run agent with exponential backoff retry logic.

    Handles transient errors from LLM providers.
    """
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
    current_user_id: str = Depends(get_current_user_id),  # Phase 2 JWT dependency
    session: AsyncSession = Depends(get_async_session)  # Phase 3 async session
):
    """
    Chat endpoint with SSE streaming.

    Security:
    - Uses Phase 2 JWT authentication
    - Validates user_id matches JWT
    - All database queries filter by user_id

    Args:
        user_id: User ID from URL path
        request: Chat request with optional conversation_id and message
        current_user_id: User ID from JWT (Phase 2 dependency)
        session: Async database session (Phase 3)

    Returns:
        StreamingResponse with SSE events

    Example:
        POST /api/user-123/chat
        {
            "conversation_id": null,
            "message": "Hello"
        }

        Response (SSE):
        data: Hello!
        data:  How can I
        data:  help you?
        data: [DONE]
    """
    # Phase 2 user isolation pattern
    if user_id != current_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this resource"
        )

    try:
        # TODO: Uncomment and implement with your services

        # # STEP 1: Get or create conversation
        # conversation = await get_or_create_conversation(
        #     session=session,
        #     user_id=user_id,
        #     conversation_id=request.conversation_id
        # )

        # # STEP 2: Get conversation history
        # history = await get_conversation_history(
        #     session=session,
        #     conversation_id=conversation.id,
        #     user_id=user_id,
        #     limit=50
        # )

        # # STEP 3: Build agent messages
        # agent_messages = history + [{"role": "user", "content": request.message}]

        # # STEP 4: Save user message
        # await add_message(
        #     session=session,
        #     user_id=user_id,
        #     conversation_id=conversation.id,
        #     role="user",
        #     content=request.message
        # )

        # # STEP 5: Create agent
        # my_agent = create_my_agent()
        # agent = my_agent.get_agent()

        # STEP 6: Stream response
        async def event_generator():
            try:
                # TODO: Uncomment when agent is ready
                # async with my_agent.mcp_server:
                #     response_chunks = []
                #
                #     # Use retry wrapper for resilience
                #     stream = await run_agent_with_retry(
                #         agent=agent,
                #         agent_messages=agent_messages,
                #         context_variables={"user_id": user_id}
                #     )
                #
                #     async for chunk in stream:
                #         if hasattr(chunk, 'delta') and chunk.delta:
                #             response_chunks.append(chunk.delta)
                #             yield f"data: {chunk.delta}\n\n"
                #
                #     # STEP 7: Save assistant response
                #     full_response = "".join(response_chunks)
                #     await add_message(
                #         session=session,
                #         user_id=user_id,
                #         conversation_id=conversation.id,
                #         role="assistant",
                #         content=full_response
                #     )
                #
                #     yield "data: [DONE]\n\n"

                # Placeholder response
                yield "data: Hello! This is a placeholder response.\n\n"
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


@router.get("/{user_id}/conversations")
async def get_user_conversations(
    user_id: str,
    current_user_id: str = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_async_session)
):
    """
    Get list of user's conversations.

    Args:
        user_id: User's unique identifier
        current_user_id: User ID from JWT
        session: Async database session

    Returns:
        JSON response with conversation list
    """
    # User isolation
    if user_id != current_user_id:
        raise HTTPException(status_code=403, detail="Forbidden")

    try:
        # TODO: Replace with your service
        # conversations = await get_user_conversations(session, user_id)

        # Placeholder
        return {
            "success": True,
            "data": {
                "conversations": []
            }
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get conversations: {str(e)}"
        )
