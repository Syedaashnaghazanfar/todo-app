"""
ChatKit Adapter Middleware

Translates ChatKit protocol requests to custom endpoint format.

Converts:
  {"type": "threads.create", "params": {"input": {"content": "Hello"}}}
To:
  {"message": "Hello", "conversation_id": null}
"""

import json
import logging
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp

logger = logging.getLogger(__name__)


class ChatKitAdapterMiddleware(BaseHTTPMiddleware):
    """
    Middleware to adapt ChatKit protocol requests to custom format.

    ChatKit sends requests in its protocol format with types like:
    - threads.create
    - threads.add_user_message
    - threads.list
    etc.

    This middleware translates those to the custom {"message": "...", "conversation_id": ...} format.
    """

    def __init__(self, app: ASGIApp):
        super().__init__(app)

    async def dispatch(self, request: Request, call_next):
        # Only process POST requests to chat endpoint
        if request.url.path == "/api/v1/chat" and request.method == "POST":
            # Read original body
            body_bytes = await request.body()

            try:
                # Parse ChatKit request
                chatkit_req = json.loads(body_bytes)
                req_type = chatkit_req.get("type")

                logger.info(f"[ChatKitAdapter] Received request type: {req_type}")

                # Extract message and conversation_id based on request type
                if req_type == "threads.create":
                    # New conversation
                    params = chatkit_req.get("params", {})
                    input_data = params.get("input", {})
                    message = input_data.get("content", "")
                    conversation_id = None

                    logger.info(f"[ChatKitAdapter] threads.create - message: {message[:50]}...")

                elif req_type == "threads.add_user_message":
                    # Add message to existing conversation
                    params = chatkit_req.get("params", {})
                    input_data = params.get("input", {})
                    message = input_data.get("content", "")
                    thread_id = params.get("thread_id")

                    # Convert thread_id to conversation_id
                    if thread_id and thread_id.isdigit():
                        conversation_id = int(thread_id)
                    else:
                        conversation_id = None

                    logger.info(f"[ChatKitAdapter] threads.add_user_message - thread_id: {thread_id}, message: {message[:50]}...")

                else:
                    # Unsupported ChatKit request type - pass through unchanged
                    logger.warning(f"[ChatKitAdapter] Unsupported request type: {req_type}, passing through unchanged")
                    return await call_next(request)

                # Build custom request format
                custom_req = {
                    "message": message,
                    "conversation_id": conversation_id
                }

                logger.info(f"[ChatKitAdapter] Translated to: {custom_req}")

                # Create new request with translated body
                # We need to replace the body in the request scope
                async def receive():
                    return {
                        "type": "http.request",
                        "body": json.dumps(custom_req).encode(),
                    }

                # Create a new request with the modified body
                from fastapi import Request as FastAPIRequest

                # Modify the request's _receive to return our custom body
                original_receive = request._receive

                async def custom_receive():
                    return {
                        "type": "http.request",
                        "body": json.dumps(custom_req).encode(),
                    }

                request._receive = custom_receive

            except json.JSONDecodeError as e:
                logger.error(f"[ChatKitAdapter] Failed to parse JSON: {e}")
                # If parsing fails, pass through original request
            except Exception as e:
                logger.error(f"[ChatKitAdapter] Error processing request: {e}", exc_info=True)
                # If any error occurs, pass through original request

        # Continue with (possibly modified) request
        response = await call_next(request)
        return response
