"""
Task Completion Consumer

Subscribes to task.completed events and generates next recurring task instances.
Implements idempotency via event_id deduplication in PostgreSQL state store.

Phase 5: Enterprise Cloud Infrastructure - Recurring Task Lifecycle Management
"""
from datetime import datetime, timezone
from typing import Dict, Any, Optional
from uuid import UUID
import logging
import asyncio

from services.rrule_service import RRuleService, RRuleParsingError
from services.task_generation_service import TaskGenerationService, TaskGenerationError
from services.deduplication_service import get_deduplication_service

logger = logging.getLogger(__name__)


class TaskCompletionConsumer:
    """
    Consumes task.completed events from Dapr Pub/Sub.
    Generates next recurring task instance when a recurring task is completed.
    Uses PostgreSQL state store via Dapr for distributed deduplication.
    """

    def __init__(self):
        self.rrule_service = RRuleService()
        self.task_generation_service = TaskGenerationService()
        self.deduplication_service = get_deduplication_service()

    async def handle_task_completed(self, event: Dict[str, Any]) -> Dict[str, str]:
        """
        Handle task.completed CloudEvent from Dapr Pub/Sub.

        Args:
            event: CloudEvent envelope with task completion data

        Returns:
            Response dict with status and message
        """
        try:
            # Extract CloudEvent fields
            event_id = event.get("id")
            event_type = event.get("type")
            event_data = event.get("data", {})

            logger.info(f"Received event {event_id} of type {event_type}")

            # Validate event type
            if event_type != "task.completed":
                logger.warning(f"Unexpected event type: {event_type}, expected task.completed")
                return {"status": "ignored", "message": "Not a task.completed event"}

            # Idempotency check using Dapr state store
            if await self.deduplication_service.is_event_processed(event_id):
                logger.info(f"Event {event_id} already processed, skipping")
                return {"status": "duplicate", "message": "Event already processed"}

            # Extract task completion data
            task_id = event_data.get("task_id")
            user_id = event_data.get("user_id")
            series_id = event_data.get("series_id")
            recurrence_pattern = event_data.get("recurrence_pattern")
            completed_at = event_data.get("completed_at")

            logger.debug(
                f"Task {task_id} completed by user {user_id}, "
                f"series_id: {series_id}, pattern: {recurrence_pattern}"
            )

            # Check if this is a recurring task
            if not series_id:
                logger.info(f"Task {task_id} is not recurring, no action needed")
                await self.deduplication_service.mark_event_processed(
                    event_id,
                    metadata={"task_id": str(task_id), "user_id": user_id}
                )
                return {"status": "success", "message": "Task is not recurring"}

            # Validate series is still active
            series_id_uuid = UUID(series_id) if isinstance(series_id, str) else series_id
            is_active = await self.task_generation_service.validate_series_active(series_id_uuid)

            if not is_active:
                logger.info(f"Series {series_id} is inactive, not generating next task")
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
                    logger.info(f"No more occurrences for series {series_id}")
                    await self.deduplication_service.mark_event_processed(
                    event_id,
                    metadata={"task_id": str(task_id), "user_id": user_id}
                )
                    return {"status": "success", "message": "No more occurrences"}

                logger.info(f"Next occurrence calculated: {next_occurrence}")

            except RRuleParsingError as e:
                logger.error(f"Failed to parse RRULE for series {series_id}: {str(e)}")
                await self.deduplication_service.mark_event_processed(
                    event_id,
                    metadata={"task_id": str(task_id), "user_id": user_id}
                )
                return {"status": "error", "message": f"RRULE parsing failed: {str(e)}"}

            # Fetch series data to get template
            series_data = await self.task_generation_service.get_series_data(series_id_uuid)

            if series_data is None:
                logger.error(f"Series {series_id} not found")
                await self.deduplication_service.mark_event_processed(
                    event_id,
                    metadata={"task_id": str(task_id), "user_id": user_id}
                )
                return {"status": "error", "message": "Series not found"}

            template = series_data.get("base_task_template", {})
            template["recurrence_pattern"] = recurrence_pattern  # Cache for display

            # Generate next task instance
            try:
                new_task = await self.task_generation_service.generate_task_from_template(
                    template=template,
                    series_id=series_id_uuid,
                    next_occurrence=next_occurrence,
                    user_id=user_id
                )

                logger.info(
                    f"Successfully generated next task {new_task.get('id')} "
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
                    "next_occurrence": next_occurrence.isoformat()
                }

            except TaskGenerationError as e:
                logger.error(f"Failed to generate next task: {str(e)}")
                # Don't mark as processed if generation failed - allow retry
                return {"status": "error", "message": f"Task generation failed: {str(e)}"}

        except Exception as e:
            logger.error(f"Unexpected error handling task.completed event: {str(e)}", exc_info=True)
            return {"status": "error", "message": f"Unexpected error: {str(e)}"}

    async def health_check(self) -> Dict[str, Any]:
        """
        Health check for the consumer.

        Returns:
            Health status dictionary
        """
        dedup_health = await self.deduplication_service.health_check()

        return {
            "status": "healthy",
            "consumer": "task_completion_consumer",
            "deduplication_service": dedup_health,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
