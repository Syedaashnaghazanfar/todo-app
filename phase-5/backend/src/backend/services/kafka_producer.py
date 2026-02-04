"""
Kafka Producer Service for Phase V Event-Driven Architecture

Provides async Kafka producer with:
- CloudEvents format wrapper
- Partition key calculation (hash user_id for ordering)
- Error handling and retry logic
- Prometheus metrics for produced events

Used by task_service to publish task operation events to Kafka.
"""

import hashlib
import os
from typing import Any, Dict, Optional
from uuid import UUID

import structlog
from aiokafka import AIOKafkaProducer
from aiokafka.errors import KafkaError
from prometheus_client import Counter, Histogram

from backend.schemas.events import CloudEvent

logger = structlog.get_logger(__name__)

# Kafka configuration from environment
KAFKA_BOOTSTRAP_SERVERS = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "localhost:9092")
KAFKA_ENABLE_IDEMPOTENCE = os.getenv("KAFKA_ENABLE_IDEMPOTENCE", "true").lower() == "true"
KAFKA_ACKS = os.getenv("KAFKA_ACKS", "all")
KAFKA_RETRIES = int(os.getenv("KAFKA_RETRIES", "3"))
KAFKA_REQUEST_TIMEOUT_MS = int(os.getenv("KAFKA_REQUEST_TIMEOUT_MS", "30000"))

# Prometheus metrics
kafka_events_produced_total = Counter(
    "kafka_events_produced_total",
    "Total number of events produced to Kafka",
    ["topic", "event_type", "status"]  # status: success | error
)

kafka_produce_duration_seconds = Histogram(
    "kafka_produce_duration_seconds",
    "Time taken to produce event to Kafka",
    ["topic", "event_type"]
)


class KafkaProducerService:
    """
    Async Kafka producer with CloudEvents support.

    Features:
    - Automatic partition key calculation from user_id (ensures ordering per user)
    - CloudEvents format validation
    - Idempotent producer (no duplicate events)
    - Automatic retries with exponential backoff
    - Prometheus metrics for monitoring
    """

    def __init__(
        self,
        bootstrap_servers: str = KAFKA_BOOTSTRAP_SERVERS,
        enable_idempotence: bool = KAFKA_ENABLE_IDEMPOTENCE,
        acks: str = KAFKA_ACKS,
        retries: int = KAFKA_RETRIES,
    ):
        """
        Initialize Kafka producer.

        Args:
            bootstrap_servers: Kafka broker addresses (comma-separated)
            enable_idempotence: Enable idempotent producer (prevents duplicates)
            acks: Acknowledgment mode ('all', '1', '0')
            retries: Number of retries on transient errors
        """
        self.bootstrap_servers = bootstrap_servers
        self.enable_idempotence = enable_idempotence
        self.acks = acks
        self.retries = retries
        self.producer: Optional[AIOKafkaProducer] = None
        self._started = False

    async def start(self):
        """
        Start the Kafka producer.

        Must be called before producing events.
        Safe to call multiple times (idempotent).
        """
        if self._started:
            logger.info("kafka_producer_already_started")
            return

        try:
            self.producer = AIOKafkaProducer(
                bootstrap_servers=self.bootstrap_servers,
                enable_idempotence=self.enable_idempotence,
                acks=self.acks,
                retries=self.retries,
                request_timeout_ms=KAFKA_REQUEST_TIMEOUT_MS,
                key_serializer=lambda k: k.encode("utf-8") if k else None,
                value_serializer=lambda v: v if isinstance(v, bytes) else str(v).encode("utf-8"),
            )
            await self.producer.start()
            self._started = True
            logger.info(
                "kafka_producer_started",
                bootstrap_servers=self.bootstrap_servers,
                enable_idempotence=self.enable_idempotence,
                acks=self.acks,
            )
        except Exception as e:
            logger.error("kafka_producer_start_failed", error=str(e), exc_info=True)
            raise

    async def stop(self):
        """
        Stop the Kafka producer.

        Flushes pending messages before stopping.
        Safe to call multiple times (idempotent).
        """
        if not self._started or not self.producer:
            logger.info("kafka_producer_already_stopped")
            return

        try:
            await self.producer.stop()
            self._started = False
            logger.info("kafka_producer_stopped")
        except Exception as e:
            logger.error("kafka_producer_stop_failed", error=str(e), exc_info=True)

    def _calculate_partition_key(self, user_id: str) -> str:
        """
        Calculate partition key from user_id using consistent hashing.

        This ensures all events for the same user go to the same partition,
        preserving event ordering per user.

        Args:
            user_id: User UUID string

        Returns:
            Partition key (hashed user_id)
        """
        # Use MD5 hash for consistent partitioning
        # MD5 is sufficient for partitioning (not cryptographic use)
        return hashlib.md5(user_id.encode("utf-8")).hexdigest()

    async def produce_event(
        self,
        topic: str,
        event: CloudEvent,
        user_id: Optional[str] = None,
    ) -> bool:
        """
        Produce CloudEvent to Kafka topic.

        Args:
            topic: Kafka topic name (e.g., task-operations, alerts)
            event: CloudEvent instance
            user_id: User ID for partition key calculation (optional, extracted from event.data if not provided)

        Returns:
            True if event was successfully produced, False otherwise

        Raises:
            RuntimeError: If producer is not started
        """
        if not self._started or not self.producer:
            logger.error("kafka_producer_not_started")
            raise RuntimeError("Kafka producer is not started. Call start() first.")

        # Extract user_id from event data if not provided
        if not user_id and isinstance(event.data, dict):
            user_id = event.data.get("user_id")

        # Calculate partition key
        partition_key = self._calculate_partition_key(user_id) if user_id else None

        # Serialize event to JSON
        event_json = event.model_dump_json()
        event_bytes = event_json.encode("utf-8")

        # Produce with metrics
        with kafka_produce_duration_seconds.labels(
            topic=topic, event_type=event.type
        ).time():
            try:
                # Send to Kafka
                await self.producer.send_and_wait(
                    topic=topic,
                    value=event_bytes,
                    key=partition_key,
                )

                # Record success
                kafka_events_produced_total.labels(
                    topic=topic, event_type=event.type, status="success"
                ).inc()

                logger.info(
                    "kafka_event_produced",
                    topic=topic,
                    event_id=event.id,
                    event_type=event.type,
                    user_id=user_id,
                    partition_key=partition_key,
                )
                return True

            except KafkaError as e:
                # Record error
                kafka_events_produced_total.labels(
                    topic=topic, event_type=event.type, status="error"
                ).inc()

                logger.error(
                    "kafka_event_production_failed",
                    topic=topic,
                    event_id=event.id,
                    event_type=event.type,
                    error=str(e),
                    exc_info=True,
                )
                return False

            except Exception as e:
                # Record error
                kafka_events_produced_total.labels(
                    topic=topic, event_type=event.type, status="error"
                ).inc()

                logger.error(
                    "kafka_event_production_error",
                    topic=topic,
                    event_id=event.id,
                    event_type=event.type,
                    error=str(e),
                    exc_info=True,
                )
                return False

    async def flush(self):
        """
        Flush pending messages.

        Blocks until all buffered records are sent.
        """
        if self._started and self.producer:
            await self.producer.flush()
            logger.info("kafka_producer_flushed")


# Singleton instance for application-wide use
_kafka_producer: Optional[KafkaProducerService] = None


async def get_kafka_producer() -> KafkaProducerService:
    """
    Get singleton Kafka producer instance.

    Starts producer on first access.
    Use this for dependency injection in FastAPI.

    Returns:
        KafkaProducerService instance
    """
    global _kafka_producer

    if _kafka_producer is None:
        _kafka_producer = KafkaProducerService()
        await _kafka_producer.start()

    return _kafka_producer


async def shutdown_kafka_producer():
    """
    Shutdown singleton Kafka producer.

    Call this on application shutdown to flush pending messages.
    """
    global _kafka_producer

    if _kafka_producer is not None:
        await _kafka_producer.stop()
        _kafka_producer = None
