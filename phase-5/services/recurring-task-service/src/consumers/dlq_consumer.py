"""
Dead Letter Queue (DLQ) Consumer

Handles failed task.completed events from the DLQ topic.
Implements retry with exponential backoff and alerting for persistent failures.

Phase 5: Enterprise Cloud Infrastructure - Error Recovery
"""

import os
from datetime import datetime, timezone
from typing import Dict, Any, Optional
import logging
import asyncio

from services.rrule_service import RRuleService, RRuleParsingError
from services.task_generation_service import TaskGenerationService, TaskGenerationError
from services.deduplication_service import get_deduplication_service

logger = logging.getLogger(__name__)

# Retry configuration
MAX_RETRY_ATTEMPTS = int(os.getenv("DLQ_MAX_RETRY_ATTEMPTS", "3"))
INITIAL_BACKOFF_SECONDS = int(os.getenv("DLQ_INITIAL_BACKOFF_SECONDS", "5"))
BACKOFF_MULTIPLIER = int(os.getenv("DLQ_BACKOFF_MULTIPLIER", "2"))
MAX_BACKOFF_SECONDS = int(os.getenv("DLQ_MAX_BACKOFF_SECONDS", "60"))


class DLQConsumer:
    """
    Consumes failed events from Dead Letter Queue (DLQ).

    Features:
    - Logs failed events with full context
    - Attempts reprocessing with exponential backoff
    - Alerts on persistent failures after max retries
    - Provides manual reprocessing endpoint
    """

    def __init__(self):
        self.rrule_service = RRuleService()
        self.task_generation_service = TaskGenerationService()
        self.deduplication_service = get_deduplication_service()

        # Track retry attempts per event_id
        self._retry_counts: Dict[str, int] = {}

    async def handle_dlq_event(self, event: Dict[str, Any]) -> Dict[str, str]:
        """
        Handle failed event from DLQ with retry logic.

        Args:
            event: CloudEvent from DLQ topic

        Returns:
            Response dict with status and message
        """
        event_id = event.get("id")
        event_type = event.get("type")
        event_data = event.get("data", {})

        # Get retry count for this event
        retry_count = self._retry_counts.get(event_id, 0)

        logger.warning(
            f"DLQ: Processing failed event {event_id} (type: {event_type}, "
            f"retry_count: {retry_count}/{MAX_RETRY_ATTEMPTS})"
        )

        # Log full event context for debugging
        logger.info(f"DLQ: Full event context: {event}")

        # Check if max retries exceeded
        if retry_count >= MAX_RETRY_ATTEMPTS:
            await self._alert_persistent_failure(event_id, event_type, event_data, retry_count)
            return {
                "status": "failed",
                "message": f"Max retries ({MAX_RETRY_ATTEMPTS}) exceeded",
                "retry_count": retry_count,
            }

        # Calculate backoff delay
        backoff_delay = min(
            INITIAL_BACKOFF_SECONDS * (BACKOFF_MULTIPLIER ** retry_count),
            MAX_BACKOFF_SECONDS
        )

        logger.info(f"DLQ: Waiting {backoff_delay}s before retry {retry_count + 1}")
        await asyncio.sleep(backoff_delay)

        # Attempt reprocessing based on event type
        try:
            if event_type == "task.completed":
                result = await self._reprocess_task_completed(event_id, event_data)
            else:
                logger.error(f"DLQ: Unknown event type: {event_type}")
                result = {"status": "error", "message": f"Unknown event type: {event_type}"}

            # If successful, clear retry count
            if result.get("status") == "success":
                logger.info(f"DLQ: Successfully reprocessed event {event_id}")
                self._retry_counts.pop(event_id, None)
                return {
                    "status": "success",
                    "message": "Event reprocessed successfully",
                    "retry_count": retry_count + 1,
                }
            else:
                # Increment retry count and re-queue
                self._retry_counts[event_id] = retry_count + 1
                logger.warning(
                    f"DLQ: Reprocessing failed for event {event_id}, "
                    f"will retry (attempt {retry_count + 1}/{MAX_RETRY_ATTEMPTS})"
                )
                return {
                    "status": "retry",
                    "message": result.get("message", "Reprocessing failed"),
                    "retry_count": retry_count + 1,
                }

        except Exception as e:
            # Increment retry count
            self._retry_counts[event_id] = retry_count + 1
            logger.error(
                f"DLQ: Exception during reprocessing event {event_id}: {str(e)}",
                exc_info=True
            )
            return {
                "status": "retry",
                "message": f"Exception: {str(e)}",
                "retry_count": retry_count + 1,
            }

    async def _reprocess_task_completed(
        self, event_id: str, event_data: Dict[str, Any]
    ) -> Dict[str, str]:
        """
        Reprocess task.completed event.

        Args:
            event_id: CloudEvent ID
            event_data: Event payload

        Returns:
            Result dict with status and message
        """
        from uuid import UUID

        # Extract task completion data
        task_id = event_data.get("task_id")
        user_id = event_data.get("user_id")
        series_id = event_data.get("series_id")
        recurrence_pattern = event_data.get("recurrence_pattern")
        completed_at = event_data.get("completed_at")

        logger.debug(
            f"DLQ: Reprocessing task.completed - "
            f"task_id: {task_id}, series_id: {series_id}"
        )

        # Check if this is a recurring task
        if not series_id:
            logger.info(f"DLQ: Task {task_id} is not recurring")
            return {"status": "success", "message": "Task is not recurring"}

        # Check if event was already processed (via deduplication)
        if await self.deduplication_service.is_event_processed(event_id):
            logger.info(f"DLQ: Event {event_id} already processed")
            return {"status": "success", "message": "Event already processed"}

        # Validate series is still active
        series_id_uuid = UUID(series_id) if isinstance(series_id, str) else series_id
        is_active = await self.task_generation_service.validate_series_active(series_id_uuid)

        if not is_active:
            logger.info(f"DLQ: Series {series_id} is inactive")
            await self.deduplication_service.mark_event_processed(
                event_id,
                metadata={"task_id": str(task_id), "user_id": user_id}
            )
            return {"status": "success", "message": "Series is inactive"}

        # Calculate next occurrence
        try:
            completed_datetime = (
                datetime.fromisoformat(completed_at)
                if isinstance(completed_at, str)
                else completed_at
            )
            next_occurrence = self.rrule_service.calculate_next_occurrence(
                recurrence_pattern,
                after_date=completed_datetime
            )

            if next_occurrence is None:
                logger.info(f"DLQ: No more occurrences for series {series_id}")
                await self.deduplication_service.mark_event_processed(
                    event_id,
                    metadata={"task_id": str(task_id), "user_id": user_id}
                )
                return {"status": "success", "message": "No more occurrences"}

        except RRuleParsingError as e:
            logger.error(f"DLQ: RRULE parsing failed for series {series_id}: {str(e)}")
            await self.deduplication_service.mark_event_processed(
                event_id,
                metadata={"task_id": str(task_id), "user_id": user_id}
            )
            return {"status": "error", "message": f"RRULE parsing failed: {str(e)}"}

        # Fetch series data
        series_data = await self.task_generation_service.get_series_data(series_id_uuid)

        if series_data is None:
            logger.error(f"DLQ: Series {series_id} not found")
            return {"status": "error", "message": "Series not found"}

        template = series_data.get("base_task_template", {})
        template["recurrence_pattern"] = recurrence_pattern

        # Generate next task instance
        try:
            new_task = await self.task_generation_service.generate_task_from_template(
                template=template,
                series_id=series_id_uuid,
                next_occurrence=next_occurrence,
                user_id=user_id
            )

            logger.info(
                f"DLQ: Successfully generated next task {new_task.get('id')} "
                f"for series {series_id}"
            )

            # Mark event as processed
            await self.deduplication_service.mark_event_processed(
                event_id,
                metadata={"task_id": str(task_id), "user_id": user_id}
            )

            return {
                "status": "success",
                "message": f"Generated next task {new_task.get('id')}",
                "next_task_id": str(new_task.get("id")),
            }

        except TaskGenerationError as e:
            logger.error(f"DLQ: Task generation failed: {str(e)}")
            return {"status": "error", "message": f"Task generation failed: {str(e)}"}

    async def _alert_persistent_failure(
        self,
        event_id: str,
        event_type: str,
        event_data: Dict[str, Any],
        retry_count: int
    ):
        """
        Alert on persistent failure after max retries.

        In production, this would:
        - Send notification to on-call team
        - Create incident ticket
        - Log to monitoring system (DataDog, PagerDuty, etc.)

        Args:
            event_id: CloudEvent ID
            event_type: Event type
            event_data: Event payload
            retry_count: Number of retry attempts
        """
        alert_message = (
            f"ALERT: Persistent DLQ failure after {retry_count} retries\n"
            f"Event ID: {event_id}\n"
            f"Event Type: {event_type}\n"
            f"Event Data: {event_data}\n"
            f"Timestamp: {datetime.now(timezone.utc).isoformat()}\n"
        )

        # Log critical alert
        logger.critical(alert_message)

        # TODO: Integrate with monitoring/alerting system
        # - Send to PagerDuty/OpsGenie
        # - Create Jira ticket
        # - Send Slack notification
        # - Publish to monitoring topic

    async def manual_reprocess(self, event_id: str, event: Dict[str, Any]) -> Dict[str, str]:
        """
        Manually reprocess a failed event (for operator intervention).

        Args:
            event_id: CloudEvent ID
            event: Full CloudEvent data

        Returns:
            Result dict with status and message
        """
        logger.info(f"DLQ: Manual reprocessing requested for event {event_id}")

        # Clear retry count to give it a fresh start
        self._retry_counts.pop(event_id, None)

        # Process the event
        return await self.handle_dlq_event(event)

    async def health_check(self) -> Dict[str, Any]:
        """
        Health check for DLQ consumer.

        Returns:
            Health status dictionary
        """
        dedup_health = await self.deduplication_service.health_check()

        return {
            "status": "healthy",
            "consumer": "dlq_consumer",
            "active_retry_events": len(self._retry_counts),
            "deduplication_service": dedup_health,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
