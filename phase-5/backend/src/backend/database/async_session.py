"""
Async database session for Phase 3 chat endpoint.

This module provides AsyncSession for non-blocking database operations
required by ConversationService and chat endpoint.

IMPORTANT: Phase 2 sync sessions remain unchanged - this is ADDITIVE.
"""

from typing import AsyncIterator
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession as AsyncSessionType
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

# Get database URL from environment
if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is required")

# Convert sync URL to async: postgresql:// → postgresql+asyncpg://
# Phase 2 uses: postgresql://user:pass@host/db
# Phase 3 needs: postgresql+asyncpg://user:pass@host/db
async_database_url = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")

# Create async engine (Neon serverless setup)
async_engine = create_async_engine(
    async_database_url,
    echo=False,
    pool_size=5,
    max_overflow=10,
    pool_pre_ping=True,
    connect_args={"timeout": 30}
)

# Create async session factory (exported as async_session_maker for ChatKit compatibility)
async_session_maker = sessionmaker(
    async_engine,
    class_=AsyncSessionType,
    expire_on_commit=False,
)


async def get_async_session() -> AsyncIterator[AsyncSessionType]:
    """
    FastAPI dependency for async database sessions.

    Use this ONLY for Phase 3 chat endpoints.
    Phase 2 REST endpoints continue using get_db().

    Example:
        @router.post("/{user_id}/chat")
        async def chat_endpoint(
            session: AsyncSession = Depends(get_async_session)
        ):
            conversation = await get_or_create_conversation(session, ...)
    """
    async with async_session_maker() as session:
        yield session
