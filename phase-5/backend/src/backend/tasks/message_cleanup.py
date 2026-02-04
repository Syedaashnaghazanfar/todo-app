"""
Background task for message cleanup (Phase 3).

Deletes messages older than 2 days per retention policy (Constitution P3-V).
Run this daily via cron or scheduler.
"""

from sqlmodel import Session, select
from datetime import datetime, timezone
import logging

from ..database.connection import engine  # Use Phase 2 sync engine for background task
from ..models.message import Message

logger = logging.getLogger(__name__)


def cleanup_expired_messages() -> dict:
    """
    Delete messages where expires_at < now().

    This is a SYNC function (not async) for background job compatibility.
    Uses Phase 2's sync engine for simplicity.

    Scheduling:
        Run daily at 2 AM UTC via cron:
        0 2 * * * cd /app && python -c "from src.tasks.message_cleanup import cleanup_expired_messages; cleanup_expired_messages()"

    Returns:
        dict: {"success": bool, "deleted_count": int, "timestamp": str}

    Examples:
        >>> result = cleanup_expired_messages()
        >>> print(result)
        {"success": True, "deleted_count": 42, "timestamp": "2025-12-23T02:00:00"}
    """
    with Session(engine) as session:
        try:
            now = datetime.now(timezone.utc).replace(tzinfo=None)

            # Query expired messages using SQLModel
            statement = select(Message).where(Message.expires_at < now)
            expired_messages = session.exec(statement).all()

            deleted_count = len(expired_messages)

            if deleted_count > 0:
                for message in expired_messages:
                    session.delete(message)
                session.commit()
                logger.info(f"Deleted {deleted_count} expired messages at {now.isoformat()}")
            else:
                logger.debug(f"No expired messages found at {now.isoformat()}")

            return {
                "success": True,
                "deleted_count": deleted_count,
                "timestamp": now.isoformat(),
            }

        except Exception as e:
            logger.error(f"Message cleanup failed: {str(e)}", exc_info=True)
            session.rollback()
            return {
                "success": False,
                "error": str(e),
                "timestamp": datetime.now(timezone.utc).replace(tzinfo=None).isoformat(),
            }


if __name__ == "__main__":
    # Allow running directly for testing: python -m src.tasks.message_cleanup
    result = cleanup_expired_messages()
    print(f"Cleanup result: {result}")
