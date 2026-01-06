"""
ChatKit endpoint for processing chat requests.

This module provides the /chatkit endpoint that handles all ChatKit
protocol requests, including message streaming and widget rendering.
"""

import logging

from chatkit.server import StreamingResult
from fastapi import APIRouter, Depends, Request
from fastapi.responses import JSONResponse, Response, StreamingResponse

from ...api.dependencies import get_current_user_id
from ...chatkit_server.server import TaskChatKitServer
from ...chatkit_server.store import PostgresChatKitStore
from ...database.async_session import async_session_maker

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["chatkit"])

# ChatKit server will be initialized with database store on first request
_chatkit_server = None


def get_current_user_info(user_id: str = Depends(get_current_user_id)) -> dict:
    """
    Extract user information from JWT token for ChatKit context.

    Args:
        user_id: User ID from JWT verification

    Returns:
        dict: User information (user_id)
    """
    return {
        "user_id": user_id,
    }


def _get_chatkit_server():
    """Get or create the global ChatKit server instance."""
    global _chatkit_server

    if _chatkit_server is None:
        try:
            # Create database store with async session factory
            if async_session_maker is None:
                logger.error(
                    "async_session_maker is None, cannot initialize ChatKit server"
                )
                raise RuntimeError("Database session factory not available")

            # Create PostgreSQL store
            store = PostgresChatKitStore(get_session=async_session_maker)
            _chatkit_server = TaskChatKitServer(store)
            logger.info("Initialized ChatKit server with PostgreSQL store")

        except Exception as e:
            logger.error(f"Failed to initialize ChatKit server: {e}", exc_info=True)
            raise

    return _chatkit_server


@router.post("/chatkit")
async def chatkit_endpoint(
    request: Request,
    user_info: dict = Depends(get_current_user_info),
) -> Response:
    """
    ChatKit endpoint that processes all chat requests.

    This endpoint:
    1. Authenticates the user via JWT
    2. Extracts the request payload
    3. Processes it through the ChatKit server
    4. Returns streaming (SSE) or JSON response

    Args:
        request: FastAPI request object
        user_info: Authenticated user information from JWT (user_id)

    Returns:
        Response: StreamingResponse for SSE or JSON Response
    """
    user_id = user_info["user_id"]
    logger.info(f"ChatKit request from authenticated user {user_id}")

    try:
        # Read request body
        payload = await request.body()
        logger.info(f"Received payload: {len(payload)} bytes")
        logger.debug(f"Payload content: {payload.decode('utf-8')}")

        # Add user info to context for the ChatKit server
        context = {
            "user_id": user_id,
        }

        # Get or create ChatKit server
        chatkit_server = _get_chatkit_server()

        # Process through ChatKit server
        result = await chatkit_server.process(payload, context)

        # Return appropriate response type
        if isinstance(result, StreamingResult):
            logger.info(f"Returning streaming response for user {user_id}")
            return StreamingResponse(
                result,
                media_type="text/event-stream",
                headers={
                    "Cache-Control": "no-cache",
                    "Connection": "keep-alive",
                    "X-Accel-Buffering": "no",
                },
            )

        # JSON response
        logger.info(f"Returning JSON response for user {user_id}")
        return Response(
            content=result.json,
            media_type="application/json",
        )

    except Exception as e:
        logger.error(f"ChatKit error for user {user_id}: {e}", exc_info=True)
        return JSONResponse(
            content={"error": "Internal server error", "detail": str(e)},
            status_code=500,
        )
