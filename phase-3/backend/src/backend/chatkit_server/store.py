"""
ChatKit Store implementation for PostgreSQL.

Implements the ChatKit Store abstract base class to persist threads and messages
to the PostgreSQL database.

Simplified design:
- Thread ID is directly the conversation.id (no external_thread_id mapping)
- Cleaner queries and less complexity
"""

import logging
import uuid
import sys
from typing import Literal, Any
from datetime import datetime, UTC
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from chatkit.server import Store
from chatkit.store import NotFoundError

# Force stdout for debugging
print("STORE.PY LOADED", file=sys.stderr)
sys.stderr.flush()

logger = logging.getLogger(__name__)
from chatkit.types import (
    ThreadMetadata,
    ThreadItem,
    UserMessageItem,
    AssistantMessageItem,
    UserMessageTextContent,
    AssistantMessageContent,
    Attachment,
    Page,
)

from ..models.conversation import Conversation
from ..models.message import Message


class PostgresChatKitStore(Store[dict]):
    """
    PostgreSQL implementation of ChatKit Store.

    Stores threads as Conversation records and thread items as Message records.
    Uses JSON serialization for ChatKit types to maintain forward compatibility.

    Simplified design: thread.id == conversation.id (no external_thread_id)
    """

    def __init__(self, get_session: callable):
        """
        Initialize store with session factory.

        Args:
            get_session: Async function that returns AsyncSession
        """
        self.get_session = get_session

    def generate_thread_id(self, context: dict) -> str:
        """Generate thread ID - reuse existing thread for same user."""
        user_id = context.get("user_id", "unknown")

        # Check if user already has an active conversation
        # If so, reuse it for conversation continuity
        # If not, create a new one with timestamp
        # This ensures chat history persists when reopening
        return f"thread_{user_id}"

    def generate_item_id(
        self,
        item_type: Literal["message", "tool_call", "task", "workflow", "attachment"],
        thread: ThreadMetadata,
        context: dict,
    ) -> str:
        """Generate unique item ID."""
        timestamp = int(datetime.now(UTC).timestamp() * 1000)
        return f"{item_type}_{thread.id}_{timestamp}"

    async def load_thread(self, thread_id: str, context: dict) -> ThreadMetadata:
        """Load thread metadata from database."""
        async with self.get_session() as session:
            # Query conversation by title (we store thread_id in title field temporarily)
            # This works because thread_id is unique per conversation
            result = await session.execute(
                select(Conversation).where(
                    Conversation.title == thread_id,
                    Conversation.user_id == context.get("user_id")
                )
            )
            conversation = result.scalar_one_or_none()

            if not conversation:
                raise NotFoundError(f"Thread {thread_id} not found")

            # Convert to ThreadMetadata
            return ThreadMetadata(
                id=thread_id,  # Keep original thread_id
                created_at=conversation.created_at,
                metadata={"conversation_id": conversation.id},
            )

    async def save_thread(self, thread: ThreadMetadata, context: dict) -> None:
        """Save thread metadata to database."""
        async with self.get_session() as session:
            # Check if conversation exists for this user
            user_id = context.get("user_id")
            result = await session.execute(
                select(Conversation).where(
                    Conversation.title == thread.id,
                    Conversation.user_id == user_id
                )
            )
            conversation = result.scalar_one_or_none()

            if conversation:
                # Update existing
                conversation.updated_at = datetime.now(UTC).replace(tzinfo=None)
                await session.commit()
                return

            # Create new conversation - use user_id as title for single persistent thread
            conversation = Conversation(
                user_id=user_id,
                title=thread.id,
                is_active=True,
                created_at=thread.created_at or datetime.now(UTC).replace(tzinfo=None),
                updated_at=datetime.now(UTC).replace(tzinfo=None),
            )
            session.add(conversation)
            await session.commit()
            await session.refresh(conversation)

    async def load_thread_items(
        self,
        thread_id: str,
        after: str | None,
        limit: int,
        order: str,
        context: dict,
    ) -> Page[ThreadItem]:
        """Load thread items (messages) from database."""
        print(f"[STORE-DBG] load_thread_items called: thread_id={thread_id}, after={after}, limit={limit}", file=sys.stderr)
        sys.stderr.flush()
        async with self.get_session() as session:
            # Get conversation by thread_id (stored in title)
            result = await session.execute(
                select(Conversation).where(
                    Conversation.title == thread_id,
                    Conversation.user_id == context.get("user_id")
                )
            )
            conversation = result.scalar_one_or_none()

            if not conversation:
                return Page(data=[], has_more=False)

            # Query messages
            query = select(Message).where(Message.conversation_id == conversation.id)

            # Apply ordering
            if order == "desc":
                query = query.order_by(desc(Message.created_at))
            else:
                query = query.order_by(Message.created_at)

            # Apply pagination
            if after:
                # Find message with ID > after
                try:
                    after_id = int(after.split("_")[-1])
                    query = query.where(Message.id > after_id)
                except (ValueError, IndexError):
                    pass

            query = query.limit(limit + 1)  # Get one extra to check has_more

            result = await session.execute(query)
            messages = list(result.scalars().all())

            has_more = len(messages) > limit
            if has_more:
                messages = messages[:limit]

            # Convert to ThreadItem
            logger.info(f"[Store] load_thread_items: found {len(messages)} messages for thread_id={thread_id}")
            items = []
            for msg in messages:
                logger.debug(f"[Store] Loading message: id={msg.id}, role={msg.role}, content_preview={msg.content[:50] if msg.content else 'empty'}...")
                # CRITICAL: Use chatkit_item_id instead of f"msg_{msg.id}"
                # This ensures frontend message IDs match what was streamed
                item_id = msg.chatkit_item_id if msg.chatkit_item_id else f"msg_{msg.id}"
                if msg.role == "user":
                    items.append(UserMessageItem(
                        id=item_id,  # Use preserved ChatKit ID
                        thread_id=thread_id,
                        created_at=msg.created_at,
                        content=[UserMessageTextContent(text=msg.content)],
                        attachments=[],
                        inference_options={},
                    ))
                elif msg.role == "assistant":
                    items.append(AssistantMessageItem(
                        id=item_id,  # Use preserved ChatKit ID
                        thread_id=thread_id,
                        created_at=msg.created_at,
                        content=[AssistantMessageContent(text=msg.content)],
                    ))

            return Page(data=items, has_more=has_more)

    async def add_thread_item(
        self, thread_id: str, item: ThreadItem, context: dict
    ) -> None:
        """Add thread item (message) to database."""
        print(f"[STORE-DBG] add_thread_item called: thread_id={thread_id}, item_type={item.type}, item_id={item.id}", file=sys.stderr)
        sys.stderr.flush()

        async with self.get_session() as session:
            # Get conversation by thread_id (stored in title)
            result = await session.execute(
                select(Conversation).where(
                    Conversation.title == thread_id,
                    Conversation.user_id == context.get("user_id")
                )
            )
            conversation = result.scalar_one_or_none()

            if not conversation:
                logger.error(f"Thread {thread_id} not found")
                return

            # Extract content
            content_text = ""
            if isinstance(item, (UserMessageItem, AssistantMessageItem)):
                if item.content:
                    for content_item in item.content:
                        if hasattr(content_item, "text"):
                            content_text += content_item.text
                        elif isinstance(content_item, dict) and "text" in content_item:
                            content_text += content_item["text"]

            # Determine role
            role = "assistant" if isinstance(item, AssistantMessageItem) else "user"

            # CRITICAL: Preserve the original ChatKit item ID
            # This ensures frontend message IDs match what was streamed
            # and prevents the "messages disappear" bug
            chatkit_id = getattr(item, "id", None)
            if not chatkit_id or str(chatkit_id) == "__fake_id__":
                # Generate real UUID for items with __fake_id__
                chatkit_id = str(uuid.uuid4())
                print(f"[STORE-DBG] Generated new UUID for item: {chatkit_id}", file=sys.stderr)
            else:
                chatkit_id = str(chatkit_id)

            # Create message
            message = Message(
                chatkit_item_id=chatkit_id,  # Preserve original ChatKit ID
                conversation_id=conversation.id,
                user_id=context.get("user_id"),
                role=role,
                content=content_text,
                created_at=item.created_at or datetime.now(UTC).replace(tzinfo=None),
                expires_at=datetime.now(UTC).replace(tzinfo=None),  # Set by model default
            )
            session.add(message)

            # Update conversation timestamp
            conversation.updated_at = datetime.now(UTC).replace(tzinfo=None)

            await session.commit()
            print(f"[STORE-DBG] Saved message: id={message.id}, chatkit_id={chatkit_id}", file=sys.stderr)

    async def save_item(
        self, thread_id: str, item: ThreadItem, context: dict
    ) -> None:
        """Save/update thread item."""
        # For now, just add as new item
        await self.add_thread_item(thread_id, item, context)

    async def load_item(
        self, thread_id: str, item_id: str, context: dict
    ) -> ThreadItem:
        """Load specific thread item by ID."""
        async with self.get_session() as session:
            # Extract message ID from item_id
            try:
                msg_id = int(item_id.split("_")[-1])
            except (ValueError, IndexError):
                raise ValueError(f"Invalid item_id format: {item_id}")

            result = await session.execute(
                select(Message).where(Message.id == msg_id)
            )
            msg = result.scalar_one_or_none()

            if not msg:
                raise ValueError(f"Item {item_id} not found")

            if msg.role == "user":
                return UserMessageItem(
                    id=item_id,
                    thread_id=thread_id,
                    created_at=msg.created_at,
                    content=[UserMessageTextContent(text=msg.content)],
                    attachments=[],
                    inference_options={},
                )
            else:
                return AssistantMessageItem(
                    id=item_id,
                    thread_id=thread_id,
                    created_at=msg.created_at,
                    content=[AssistantMessageContent(text=msg.content)],
                )

    async def delete_thread(self, thread_id: str, context: dict) -> None:
        """Delete thread and all its items."""
        async with self.get_session() as session:
            # Get conversation by thread_id (stored in title)
            result = await session.execute(
                select(Conversation).where(
                    Conversation.title == thread_id,
                    Conversation.user_id == context.get("user_id")
                )
            )
            conversation = result.scalar_one_or_none()

            if conversation:
                await session.delete(conversation)
                await session.commit()

    async def delete_thread_item(self, thread_id: str, item_id: str, context: dict) -> None:
        """Delete a specific thread item (message) from database."""
        async with self.get_session() as session:
            # Extract message ID from item_id
            try:
                msg_id = int(item_id.split("_")[-1])
            except (ValueError, IndexError):
                logger.error(f"Invalid item_id format: {item_id}")
                return

            # Query message
            result = await session.execute(
                select(Message).where(
                    Message.id == msg_id,
                    Message.user_id == context.get("user_id")
                )
            )
            message = result.scalar_one_or_none()

            if message:
                await session.delete(message)
                await session.commit()

    async def load_threads(
        self,
        limit: int,
        after: str | None,
        order: str,
        context: dict,
    ) -> Page[ThreadMetadata]:
        """Load threads for a user."""
        async with self.get_session() as session:
            query = select(Conversation).where(
                Conversation.user_id == context.get("user_id")
            )

            if order == "desc":
                query = query.order_by(desc(Conversation.updated_at))
            else:
                query = query.order_by(Conversation.updated_at)

            query = query.limit(limit + 1)

            result = await session.execute(query)
            conversations = list(result.scalars().all())

            has_more = len(conversations) > limit
            if has_more:
                conversations = conversations[:limit]

            threads = [
                ThreadMetadata(
                    id=conv.title,  # Use thread_id (stored in title)
                    created_at=conv.created_at,
                    metadata={"conversation_id": conv.id},
                )
                for conv in conversations
            ]

            return Page(data=threads, has_more=has_more)

    # Attachment methods (not implemented for now)
    async def save_attachment(self, attachment: Attachment, context: dict) -> None:
        raise NotImplementedError("Attachments not supported yet")

    async def load_attachment(self, attachment_id: str, context: dict) -> Attachment:
        raise NotImplementedError("Attachments not supported yet")

    async def delete_attachment(self, attachment_id: str, context: dict) -> None:
        raise NotImplementedError("Attachments not supported yet")
