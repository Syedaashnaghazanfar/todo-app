"""
Event ID Deduplication Service for Phase V Event-Driven Architecture

Stores processed event IDs in PostgreSQL state store via Dapr.
Implements distributed deduplication across multiple service instances.

Key Features:
- Persistent storage in PostgreSQL (survives restarts)
- 7-day TTL (matches Kafka retention policy)
- Distributed consistency (multiple instances share state)
- Automatic cleanup of expired entries
"""

import os
from datetime import datetime, timedelta, timezone
from typing import Dict, Any, Optional
import logging
import httpx

logger = logging.getLogger(__name__)

# Dapr configuration
DAPR_HTTP_PORT = int(os.getenv("DAPR_HTTP_PORT", "3500"))
DAPR_BASE_URL = f"http://localhost:{DAPR_HTTP_PORT}"
STATESTORE_NAME = os.getenv("DAPR_STATESTORE_NAME", "statestore-postgres")

# Deduplication configuration
EVENT_TTL_DAYS = 7  # Match Kafka retention period
DEDUP_KEY_PREFIX = "event:dedup:"


class DeduplicationService:
    """
    Service for distributed event ID deduplication using Dapr State Store.

    Stores event IDs in PostgreSQL with TTL to prevent duplicate processing
    across multiple service instances.
    """

    def __init__(
        self,
        dapr_base_url: str = DAPR_BASE_URL,
        statestore_name: str = STATESTORE_NAME,
        ttl_days: int = EVENT_TTL_DAYS,
    ):
        """
        Initialize deduplication service.

        Args:
            dapr_base_url: Dapr sidecar HTTP URL
            statestore_name: Dapr state store component name
            ttl_days: Time-to-live for deduplication records in days
        """
        self.dapr_base_url = dapr_base_url
        self.statestore_name = statestore_name
        self.ttl_days = ttl_days
        self.client = httpx.AsyncClient(base_url=dapr_base_url, timeout=5.0)

    async def close(self):
        """Close HTTP client"""
        await self.client.aclose()

    def _make_state_key(self, event_id: str) -> str:
        """
        Create state store key for event ID.

        Args:
            event_id: CloudEvent ID

        Returns:
            State store key with prefix
        """
        return f"{DEDUP_KEY_PREFIX}{event_id}"

    async def is_event_processed(self, event_id: str) -> bool:
        """
        Check if event has already been processed (idempotency check).

        Args:
            event_id: CloudEvent ID to check

        Returns:
            True if event was already processed, False otherwise
        """
        key = self._make_state_key(event_id)
        url = f"/v1.0/state/{self.statestore_name}/{key}"

        try:
            response = await self.client.get(url)

            # Event is processed if state exists
            if response.status_code == 200:
                state_data = response.json()
                processed_at = state_data.get("processed_at")

                # Validate TTL (remove if expired)
                if processed_at:
                    processed_datetime = datetime.fromisoformat(processed_at)
                    age_days = (datetime.now(timezone.utc) - processed_datetime).days

                    if age_days > self.ttl_days:
                        logger.info(f"Event {event_id} dedup record expired (age: {age_days} days), removing")
                        await self.delete_event_record(event_id)
                        return False

                    logger.debug(f"Event {event_id} already processed at {processed_at}")
                    return True

            # Event not processed (404 or other error)
            return False

        except httpx.HTTPStatusError as e:
            if e.response.status_code == 404:
                return False
            logger.error(f"Failed to check deduplication state for event {event_id}: {str(e)}")
            # On error, assume not processed to avoid losing events
            return False

        except Exception as e:
            logger.error(f"Error checking deduplication for event {event_id}: {str(e)}", exc_info=True)
            # On error, assume not processed to avoid losing events
            return False

    async def mark_event_processed(self, event_id: str, metadata: Optional[Dict[str, Any]] = None) -> bool:
        """
        Mark event as processed for deduplication.

        Args:
            event_id: CloudEvent ID
            metadata: Optional metadata to store (e.g., task_id, user_id)

        Returns:
            True if successfully stored, False otherwise
        """
        key = self._make_state_key(event_id)
        url = f"/v1.0/state/{self.statestore_name}"

        now = datetime.now(timezone.utc)
        expires_at = now + timedelta(days=self.ttl_days)

        state_value = {
            "event_id": event_id,
            "processed_at": now.isoformat(),
            "expires_at": expires_at.isoformat(),
            "metadata": metadata or {},
        }

        payload = [
            {
                "key": key,
                "value": state_value,
                # Dapr state store TTL (optional, depends on state store support)
                "metadata": {
                    "ttlInSeconds": str(self.ttl_days * 24 * 60 * 60)
                }
            }
        ]

        try:
            response = await self.client.post(url, json=payload)
            response.raise_for_status()

            logger.info(f"Marked event {event_id} as processed (expires: {expires_at.isoformat()})")
            return True

        except httpx.HTTPStatusError as e:
            logger.error(
                f"Failed to mark event {event_id} as processed: "
                f"status {e.response.status_code}, response: {e.response.text}"
            )
            return False

        except Exception as e:
            logger.error(f"Error marking event {event_id} as processed: {str(e)}", exc_info=True)
            return False

    async def delete_event_record(self, event_id: str) -> bool:
        """
        Delete deduplication record for event (for cleanup or testing).

        Args:
            event_id: CloudEvent ID

        Returns:
            True if successfully deleted, False otherwise
        """
        key = self._make_state_key(event_id)
        url = f"/v1.0/state/{self.statestore_name}/{key}"

        try:
            response = await self.client.delete(url)
            response.raise_for_status()

            logger.info(f"Deleted deduplication record for event {event_id}")
            return True

        except httpx.HTTPStatusError as e:
            if e.response.status_code == 404:
                # Already deleted
                return True
            logger.error(
                f"Failed to delete deduplication record for event {event_id}: "
                f"status {e.response.status_code}"
            )
            return False

        except Exception as e:
            logger.error(f"Error deleting deduplication record for event {event_id}: {str(e)}", exc_info=True)
            return False

    async def cleanup_expired_records(self) -> int:
        """
        Cleanup expired deduplication records.

        Note: This is a manual cleanup. Dapr state stores with TTL support
        will automatically clean up expired records.

        Returns:
            Number of records cleaned up
        """
        # This would require querying all keys with prefix, which is not efficient
        # in production. Rely on Dapr state store TTL instead.
        logger.info("Cleanup triggered - relying on Dapr state store TTL for automatic cleanup")
        return 0

    async def health_check(self) -> Dict[str, Any]:
        """
        Health check for deduplication service.

        Returns:
            Health status dictionary
        """
        # Test connection to Dapr state store
        try:
            test_key = f"{DEDUP_KEY_PREFIX}health_check"
            url = f"/v1.0/state/{self.statestore_name}/{test_key}"
            response = await self.client.get(url)

            return {
                "status": "healthy",
                "service": "deduplication_service",
                "dapr_state_store": self.statestore_name,
                "ttl_days": self.ttl_days,
                "timestamp": datetime.now(timezone.utc).isoformat(),
            }

        except Exception as e:
            logger.error(f"Deduplication service health check failed: {str(e)}")
            return {
                "status": "unhealthy",
                "service": "deduplication_service",
                "error": str(e),
                "timestamp": datetime.now(timezone.utc).isoformat(),
            }


# Singleton instance
_deduplication_service: Optional[DeduplicationService] = None


def get_deduplication_service() -> DeduplicationService:
    """
    Get singleton deduplication service instance.

    Returns:
        DeduplicationService instance
    """
    global _deduplication_service

    if _deduplication_service is None:
        _deduplication_service = DeduplicationService()

    return _deduplication_service


async def close_deduplication_service():
    """Close singleton deduplication service"""
    global _deduplication_service

    if _deduplication_service is not None:
        await _deduplication_service.close()
        _deduplication_service = None
