"""
Task Generation Service

Generates new task instances from recurring task series templates.
Handles API calls to backend for task creation.

Phase 5: Enterprise Cloud Infrastructure - Recurring Task Lifecycle Management
"""
from datetime import datetime, timezone
from typing import Dict, Any, Optional
import logging
import httpx
import os
from uuid import UUID

logger = logging.getLogger(__name__)


class TaskGenerationError(Exception):
    """Raised when task generation fails"""
    pass


class TaskGenerationService:
    """
    Service for generating new task instances from templates.
    Communicates with backend API to create tasks.
    """

    def __init__(self):
        # Backend API URL from environment (default to localhost for development)
        self.backend_url = os.getenv("BACKEND_API_URL", "http://localhost:8000")
        self.timeout = float(os.getenv("API_TIMEOUT", "10.0"))

    async def generate_task_from_template(
        self,
        template: Dict[str, Any],
        series_id: UUID,
        next_occurrence: datetime,
        user_id: str
    ) -> Dict[str, Any]:
        """
        Generate a new task instance from a template.

        Args:
            template: Base task template from RecurringTaskSeries.base_task_template
                     Expected fields: title, description, priority, tags
            series_id: UUID of the recurring task series
            next_occurrence: Due date for the new task instance
            user_id: ID of the user who owns this task

        Returns:
            Created task data (including task_id)

        Raises:
            TaskGenerationError: If task creation fails
        """
        try:
            # Validate template has required fields
            if not template.get("title"):
                raise TaskGenerationError("Template missing required field: title")

            # Build task payload from template
            task_data = {
                "title": template["title"],
                "description": template.get("description", ""),
                "priority": template.get("priority", "MEDIUM"),
                "tags": template.get("tags", []),
                "due_date": next_occurrence.isoformat(),
                "status": "NOT_STARTED",
                "is_recurring": True,
                "series_id": str(series_id),
                "recurrence_pattern": template.get("recurrence_pattern"),  # Cached for display
                "user_id": user_id
            }

            logger.info(
                f"Generating task from template for series {series_id}, "
                f"due date: {next_occurrence}"
            )

            # Call backend API to create task
            created_task = await self._create_task_via_api(task_data)

            logger.info(f"Successfully generated task {created_task.get('id')} from series {series_id}")
            return created_task

        except TaskGenerationError:
            raise
        except Exception as e:
            logger.error(f"Unexpected error generating task: {str(e)}")
            raise TaskGenerationError(f"Failed to generate task: {str(e)}")

    async def _create_task_via_api(self, task_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a task via backend API.

        Args:
            task_data: Task creation payload

        Returns:
            Created task data from API response

        Raises:
            TaskGenerationError: If API call fails
        """
        try:
            endpoint = f"{self.backend_url}/api/tasks"

            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    endpoint,
                    json=task_data,
                    headers={"Content-Type": "application/json"}
                )

                if response.status_code == 201:
                    created_task = response.json()
                    logger.debug(f"Task created successfully: {created_task.get('id')}")
                    return created_task
                elif response.status_code == 409:
                    # Duplicate task (series_id + due_date already exists)
                    logger.warning(
                        f"Duplicate task detected for series {task_data.get('series_id')}, "
                        f"due date {task_data.get('due_date')}"
                    )
                    raise TaskGenerationError("Duplicate task instance already exists")
                else:
                    error_detail = response.text
                    logger.error(
                        f"API returned status {response.status_code}: {error_detail}"
                    )
                    raise TaskGenerationError(
                        f"API error: status {response.status_code}, detail: {error_detail}"
                    )

        except httpx.TimeoutException:
            logger.error(f"API request timed out after {self.timeout}s")
            raise TaskGenerationError("API request timed out")
        except httpx.RequestError as e:
            logger.error(f"API request failed: {str(e)}")
            raise TaskGenerationError(f"API request failed: {str(e)}")
        except TaskGenerationError:
            raise
        except Exception as e:
            logger.error(f"Unexpected error calling API: {str(e)}")
            raise TaskGenerationError(f"Unexpected API error: {str(e)}")

    async def get_series_data(self, series_id: UUID) -> Optional[Dict[str, Any]]:
        """
        Fetch recurring task series data from backend API.

        Args:
            series_id: UUID of the recurring task series

        Returns:
            Series data or None if not found

        Raises:
            TaskGenerationError: If API call fails
        """
        try:
            endpoint = f"{self.backend_url}/api/recurring-tasks/{series_id}"

            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(endpoint)

                if response.status_code == 200:
                    series_data = response.json()
                    logger.debug(f"Fetched series data for {series_id}")
                    return series_data
                elif response.status_code == 404:
                    logger.warning(f"Series {series_id} not found")
                    return None
                else:
                    error_detail = response.text
                    logger.error(
                        f"API returned status {response.status_code}: {error_detail}"
                    )
                    raise TaskGenerationError(
                        f"Failed to fetch series data: status {response.status_code}"
                    )

        except httpx.TimeoutException:
            logger.error(f"API request timed out after {self.timeout}s")
            raise TaskGenerationError("API request timed out")
        except httpx.RequestError as e:
            logger.error(f"API request failed: {str(e)}")
            raise TaskGenerationError(f"API request failed: {str(e)}")
        except TaskGenerationError:
            raise
        except Exception as e:
            logger.error(f"Unexpected error calling API: {str(e)}")
            raise TaskGenerationError(f"Unexpected API error: {str(e)}")

    async def validate_series_active(self, series_id: UUID) -> bool:
        """
        Check if a recurring task series is still active.

        Args:
            series_id: UUID of the recurring task series

        Returns:
            True if series is active, False otherwise
        """
        try:
            series_data = await self.get_series_data(series_id)

            if series_data is None:
                logger.warning(f"Series {series_id} not found")
                return False

            is_active = series_data.get("is_active", False)
            logger.debug(f"Series {series_id} active status: {is_active}")
            return is_active

        except TaskGenerationError as e:
            logger.error(f"Failed to validate series status: {str(e)}")
            return False
