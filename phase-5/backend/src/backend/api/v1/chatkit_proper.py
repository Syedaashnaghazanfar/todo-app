"""
Proper ChatKit endpoint following OpenAI ChatKit Python SDK protocol.

This endpoint implements the correct ChatKit server protocol:
1. Accepts raw request body
2. Passes to server.process() method
3. Returns StreamingResult or NonStreamingResult
"""

import logging
from fastapi import APIRouter, Depends, Request
from fastapi.responses import StreamingResponse, Response, JSONResponse

from ...api.dependencies import get_current_user_id
from ...database.async_session import async_session_maker

# Import ChatKit if available, otherwise use fallback
try:
    from chatkit.server import StreamingResult
    CHATKIT_AVAILABLE = True
except ImportError:
    CHATKIT_AVAILABLE = False
    StreamingResult = None

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["chatkit"])


# Global server instance (will be initialized on first request)
_server_instance = None


def get_chatkit_server():
    """Get or create ChatKit server instance."""
    global _server_instance

    if _server_instance is None:
        if CHATKIT_AVAILABLE:
            from ...chatkit_server.store import PostgresChatKitStore
            from ...chatkit_server.server import TaskChatKitServer

            # Create store with session factory
            store = PostgresChatKitStore(async_session_maker)

            # Create server
            _server_instance = TaskChatKitServer(store)
            logger.info("TaskChatKitServer initialized")
        else:
            logger.error("ChatKit SDK not available - using fallback")
            _server_instance = None

    return _server_instance


@router.post("/chatkit")
async def chatkit_endpoint(
    request: Request,
    current_user_id: str = Depends(get_current_user_id),
):
    """
    ChatKit protocol endpoint.

    This endpoint follows the official ChatKit Python SDK protocol:
    1. Accepts raw request body (ChatKit protocol format)
    2. Passes to server.process(body, context)
    3. Returns StreamingResult (SSE) or NonStreamingResult (JSON)

    The ChatKit SDK handles:
    - Request parsing and validation
    - Thread management
    - Message streaming
    - Event formatting
    """
    try:
        # Get raw request body (ChatKit protocol format)
        body = await request.body()

        logger.info(f"ChatKit request received - user_id={current_user_id}, body_length={len(body)}")
        logger.debug(f"ChatKit request body: {body[:500]}")  # Log first 500 chars

        # Check if ChatKit is available
        if not CHATKIT_AVAILABLE:
            # Fallback: Use simpler endpoint
            logger.warning("ChatKit SDK not available - using fallback implementation")
            from .chatkit import chatkit_endpoint as fallback_endpoint
            return await fallback_endpoint(request, current_user_id)

        # Get ChatKit server instance
        server = get_chatkit_server()

        if server is None:
            logger.error("ChatKit server initialization failed")
            return JSONResponse(
                status_code=500,
                content={"error": "ChatKit server not initialized"}
            )

        # Pass to ChatKit server with user context
        context = {"user_id": current_user_id}
        result = await server.process(body, context)

        logger.info(f"ChatKit server processed request - result_type={type(result).__name__}")

        # Return appropriate response type
        if isinstance(result, StreamingResult):
            logger.info("Returning SSE streaming response")
            return StreamingResponse(
                result,
                media_type="text/event-stream",
                headers={
                    "Cache-Control": "no-cache",
                    "Connection": "keep-alive",
                    "X-Accel-Buffering": "no",
                }
            )
        else:
            # NonStreamingResult
            logger.info("Returning JSON response")
            if hasattr(result, 'json'):
                return Response(content=result.json, media_type="application/json")
            else:
                return JSONResponse(result)

    except Exception as e:
        logger.error(f"ChatKit endpoint error: {e}", exc_info=True)
        return JSONResponse(
            status_code=500,
            content={"error": str(e), "detail": "ChatKit processing failed"}
        )
