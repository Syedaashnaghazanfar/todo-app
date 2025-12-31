"""
Chat API request/response schemas for Phase III.

This module defines Pydantic models for chat endpoint
request validation and response formatting.
"""

from typing import List, Optional

from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    """
    Request schema for chat endpoint.

    Attributes:
        conversation_id: Optional existing conversation ID (null for new conversation)
        message: User's message text
    """

    conversation_id: Optional[int] = Field(
        default=None,
        description="Existing conversation ID (null to start new conversation)"
    )
    message: str = Field(
        ...,
        min_length=1,
        max_length=5000,
        description="User's message text (required, 1-5000 characters)"
    )

    class Config:
        """Pydantic configuration."""
        json_schema_extra = {
            "example": {
                "conversation_id": None,
                "message": "Add a task to buy groceries"
            }
        }


class ChatResponse(BaseModel):
    """
    Response schema for chat endpoint.

    Attributes:
        conversation_id: Conversation ID (created or existing)
        response: Assistant's response text
        tool_calls: List of tool invocations made during response generation
    """

    conversation_id: int = Field(
        ...,
        description="Conversation ID (created or provided)"
    )
    response: str = Field(
        ...,
        description="Assistant's response text"
    )
    tool_calls: List[dict] = Field(
        default_factory=list,
        description="List of tool invocations (e.g., add_task, list_tasks)"
    )

    class Config:
        """Pydantic configuration."""
        json_schema_extra = {
            "example": {
                "conversation_id": 1,
                "response": "✅ I've added 'Buy groceries' to your task list!",
                "tool_calls": [
                    {
                        "tool": "add_task",
                        "args": {
                            "user_id": "user123",
                            "title": "Buy groceries"
                        }
                    }
                ]
            }
        }


class MessageSchema(BaseModel):
    """
    Message schema for conversation history.

    Attributes:
        id: Message ID
        role: Message sender ("user" | "assistant" | "system")
        content: Message text
        created_at: Message timestamp
    """

    id: int
    role: str = Field(..., pattern="^(user|assistant|system)$")
    content: str
    created_at: str  # ISO 8601 formatted datetime string

    class Config:
        """Pydantic configuration."""
        json_schema_extra = {
            "example": {
                "id": 1,
                "role": "user",
                "content": "Show me all my tasks",
                "created_at": "2025-12-14T10:30:00Z"
            }
        }
