"""
Message model for conversation history.

Stores individual messages with 2-day retention policy per Constitution P3-V.
"""

from sqlmodel import SQLModel, Field, Column
from sqlalchemy import JSON
from datetime import datetime, timedelta, timezone
from typing import Optional


class Message(SQLModel, table=True):
    """
    Individual message in a conversation.

    Attributes:
        id: Auto-increment primary key
        chatkit_item_id: Original ChatKit item ID (preserved for frontend consistency)
        conversation_id: Foreign key to conversations.id
        user_id: User identifier (denormalized for queries)
        role: Message sender ("user" | "assistant" | "system")
        content: Message text content
        tool_calls: JSON of tool invocations (for debugging)
        created_at: Message timestamp
        expires_at: Auto-set to 2 days from creation

    Relationships:
        - conversation → Conversation (many-to-one)
        - user → User (many-to-one)

    Indexes:
        - idx_messages_conversation_id on (conversation_id)
        - idx_messages_user_id on (user_id)
        - idx_messages_expires_at on (expires_at)
        - idx_messages_conversation_created on (conversation_id, created_at)
        - idx_messages_chatkit_id on (chatkit_item_id) - for frontend ID matching

    Data Retention:
        Messages expire after 2 days (expires_at field)
        Daily cleanup task deletes messages where expires_at < now()
    """
    __tablename__ = "messages"

    id: Optional[int] = Field(default=None, primary_key=True)
    chatkit_item_id: str = Field(
        default="",
        nullable=False,
        max_length=100,
        description="Original ChatKit item ID (preserved for frontend message consistency)"
    )
    conversation_id: int = Field(foreign_key="conversations.id", index=True, nullable=False)
    user_id: str = Field(index=True, nullable=False, max_length=36)
    role: str = Field(nullable=False, max_length=20)  # user, assistant, system
    content: str = Field(nullable=False)  # Message text (Text type in DB)
    tool_calls: Optional[dict] = Field(default=None, sa_column=Column(JSON))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc).replace(tzinfo=None), index=True, nullable=False)
    expires_at: datetime = Field(
        default_factory=lambda: (datetime.now(timezone.utc) + timedelta(days=2)).replace(tzinfo=None),
        nullable=False,
        index=True,
    )
