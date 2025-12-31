"""
Conversation service for AI chatbot Phase III.

All methods are ASYNC and use AsyncSession.
Provides conversation and message management with user isolation.
Follows Constitution P3-II (Stateless Architecture) and P3-V (Conversation Persistence).
"""

from typing import Optional, List
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from datetime import datetime, timezone
from fastapi import HTTPException, status

from ..models.conversation import Conversation
from ..models.message import Message


async def get_or_create_conversation(
    session: AsyncSession,
    user_id: str,
    conversation_id: Optional[int] = None
) -> Conversation:
    """
    Get existing conversation or create new one.

    This function implements stateless architecture per Constitution P3-II:
    - Loads conversation from database on every request
    - No in-memory state
    - Enforces user isolation per Constitution P3-IV

    Args:
        session: Async database session
        user_id: User ID from JWT (matches Phase 2 user_id type)
        conversation_id: Optional existing conversation ID

    Returns:
        Conversation object

    Raises:
        HTTPException: 404 if conversation not found, 403 if wrong user

    Examples:
        # Create new conversation
        >>> conversation = await get_or_create_conversation(session, user_id="user-123")
        >>> print(conversation.title)
        "Conversation 2025-12-23 11:45"

        # Resume existing conversation
        >>> conversation = await get_or_create_conversation(session, user_id="user-123", conversation_id=1)
        >>> print(conversation.id)
        1
    """
    if conversation_id is not None:
        # Fetch existing conversation with user isolation
        result = await session.execute(
            select(Conversation).where(
                Conversation.id == conversation_id,
                Conversation.user_id == user_id  # User isolation (P3-IV)
            )
        )
        conversation = result.scalar_one_or_none()

        if not conversation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Conversation {conversation_id} not found or access denied"
            )

        # Update timestamp
        conversation.updated_at = datetime.now(timezone.utc).replace(tzinfo=None)
        session.add(conversation)
        await session.commit()
        await session.refresh(conversation)
        return conversation
    else:
        # Create new conversation with auto-generated title
        now = datetime.now(timezone.utc).replace(tzinfo=None)
        title = f"Conversation {now.strftime('%Y-%m-%d %H:%M')}"

        new_conversation = Conversation(
            user_id=user_id,
            title=title,
            is_active=True,
            created_at=now,
            updated_at=now
        )
        session.add(new_conversation)
        await session.commit()
        await session.refresh(new_conversation)
        return new_conversation


async def add_message(
    session: AsyncSession,
    user_id: str,
    conversation_id: int,
    role: str,
    content: str,
    tool_calls: Optional[dict] = None
) -> Message:
    """
    Add message to conversation.

    This function implements:
    - Stateless architecture: Saves message to database immediately
    - 2-day message expiration per Constitution P3-V
    - User isolation per Constitution P3-IV

    Args:
        session: Async database session
        user_id: User ID from JWT
        conversation_id: Target conversation ID
        role: Message role ("user" | "assistant" | "system")
        content: Message text content
        tool_calls: Optional tool invocations (for debugging)

    Returns:
        Message object

    Examples:
        # Add user message
        >>> message = await add_message(
        ...     session=session,
        ...     user_id="user-123",
        ...     conversation_id=1,
        ...     role="user",
        ...     content="Add task to buy groceries"
        ... )
        >>> print(message.role, message.content)
        "user" "Add task to buy groceries"

        # Add assistant message with tool calls
        >>> message = await add_message(
        ...     session=session,
        ...     user_id="user-123",
        ...     conversation_id=1,
        ...     role="assistant",
        ...     content="I've added the task!",
        ...     tool_calls={"tool": "add_task", "params": {...}}
        ... )
    """
    # Validate role
    if role not in ["user", "assistant", "system"]:
        raise ValueError(f"Invalid role: {role}. Must be user, assistant, or system.")

    message = Message(
        conversation_id=conversation_id,
        user_id=user_id,
        role=role,
        content=content,
        tool_calls=tool_calls
        # created_at and expires_at auto-set by model defaults
    )
    session.add(message)

    # Update conversation timestamp
    result = await session.execute(
        select(Conversation).where(Conversation.id == conversation_id)
    )
    conversation = result.scalar_one_or_none()
    if conversation:
        conversation.updated_at = datetime.now(timezone.utc).replace(tzinfo=None)
        session.add(conversation)

    await session.commit()
    await session.refresh(message)
    return message


async def get_conversation_history(
    session: AsyncSession,
    conversation_id: int,
    user_id: str,
    limit: Optional[int] = None
) -> List[dict]:
    """
    Get conversation messages formatted for agent.

    This function implements:
    - Stateless architecture: Loads history from database on every request
    - User isolation per Constitution P3-IV
    - Returns messages in agent-compatible format

    Args:
        session: Async database session
        conversation_id: Conversation ID
        user_id: User ID from JWT (for user isolation)
        limit: Optional max messages to return (default: all)

    Returns:
        List of message dicts: [{"role": "user", "content": "..."}, ...]

    Examples:
        # Get full conversation history
        >>> history = await get_conversation_history(
        ...     session=session,
        ...     conversation_id=1,
        ...     user_id="user-123"
        ... )
        >>> print(len(history))
        5

        # Get last 10 messages
        >>> history = await get_conversation_history(
        ...     session=session,
        ...     conversation_id=1,
        ...     user_id="user-123",
        ...     limit=10
        ... )
    """
    stmt = select(Message).where(
        Message.conversation_id == conversation_id,
        Message.user_id == user_id  # User isolation (P3-IV)
    ).order_by(Message.created_at)

    if limit:
        stmt = stmt.limit(limit)

    result = await session.execute(stmt)
    messages = result.scalars().all()

    # Convert to agent-compatible format
    return [
        {
            "role": msg.role,
            "content": msg.content
        }
        for msg in messages
    ]
