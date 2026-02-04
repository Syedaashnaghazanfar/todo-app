"""
Conversation model for AI chatbot Phase III.

Stores conversation metadata for multi-turn chat sessions.
Follows Constitution P3-V (Conversation Persistence).
"""

from sqlmodel import SQLModel, Field
from datetime import datetime, timezone
from typing import Optional


class Conversation(SQLModel, table=True):
    """
    Conversation session between user and AI agent.

    Attributes:
        id: Auto-increment primary key (NOT UUID - matches Phase 2 pattern)
        user_id: User identifier from JWT (str - matches Phase 2 Task.user_id)
        title: Auto-generated conversation title
        is_active: Whether conversation is still active
        created_at: Conversation start time
        updated_at: Last message timestamp

    Relationships:
        - user → User (many-to-one)
        - messages → Message[] (one-to-many, cascade delete)

    Indexes:
        - idx_conversations_user_id on (user_id)
        - idx_conversations_user_active on (user_id, is_active)
        - idx_conversations_updated_at on (updated_at DESC)
    """
    __tablename__ = "conversations"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(index=True, nullable=False, max_length=36)
    title: str = Field(max_length=500, nullable=False)
    is_active: bool = Field(default=True, nullable=False, index=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc).replace(tzinfo=None), nullable=False, index=True)
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc).replace(tzinfo=None), nullable=False, index=True)
