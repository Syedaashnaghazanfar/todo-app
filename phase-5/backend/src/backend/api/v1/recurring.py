"""
Recurring Tasks API Endpoints

Phase 5: Enterprise Cloud Infrastructure - Recurring Task Lifecycle Management
"""
from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List

from backend.api.dependencies import get_db, get_current_user_id
from backend.schemas.recurring_task import (
    RecurringTaskSeriesCreate,
    RecurringTaskSeriesResponse,
    RecurringTaskSeriesUpdate
)
from backend.schemas.task import TaskResponse
from backend.services.recurring_task_service import RecurringTaskService
from backend.utils.response import success_response, error_response

router = APIRouter(prefix="/recurring-tasks", tags=["recurring-tasks"])


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_recurring_series(
    series: RecurringTaskSeriesCreate,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """
    Create a new recurring task series and generate the first task instance.

    Args:
        series: Recurring task series creation data
            - base_task_template: Template with title, description, priority, tags
            - recurrence_pattern: RRULE string (e.g., "FREQ=DAILY;INTERVAL=1")

    Returns:
        Created recurring task series with first task ID

    Example RRULE patterns:
        - Daily: "FREQ=DAILY;INTERVAL=1"
        - Every 2 days: "FREQ=DAILY;INTERVAL=2"
        - Weekly on Mon, Wed, Fri: "FREQ=WEEKLY;BYDAY=MO,WE,FR"
        - Monthly on 15th: "FREQ=MONTHLY;BYMONTHDAY=15"
    """
    try:
        db_series, first_task = RecurringTaskService.create_recurring_series(
            db=db,
            user_id=user_id,
            base_task_template=series.base_task_template,
            recurrence_pattern=series.recurrence_pattern
        )

        # Build response with first task ID
        response_data = RecurringTaskSeriesResponse(
            series_id=db_series.series_id,
            user_id=db_series.user_id,
            base_task_template=db_series.base_task_template,
            recurrence_pattern=db_series.recurrence_pattern,
            is_active=db_series.is_active,
            created_at=db_series.created_at,
            updated_at=db_series.updated_at,
            first_task_id=first_task.id
        )

        return success_response(
            response_data.model_dump(mode="json"),
            popup="RECURRING_SERIES_CREATED"
        )

    except HTTPException:
        raise
    except Exception as e:
        return error_response(f"Failed to create recurring series: {str(e)}")


@router.get("")
async def list_recurring_series(
    include_inactive: bool = False,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """
    Get all recurring task series for the authenticated user.

    Args:
        include_inactive: Whether to include inactive (deleted) series

    Returns:
        List of recurring task series
    """
    try:
        series_list = RecurringTaskService.get_all_series(
            db=db,
            user_id=user_id,
            include_inactive=include_inactive
        )

        response_data = [
            RecurringTaskSeriesResponse.from_orm(series).model_dump(mode="json")
            for series in series_list
        ]

        return success_response(response_data)

    except Exception as e:
        return error_response(f"Failed to fetch recurring series: {str(e)}")


@router.get("/{series_id}")
async def get_recurring_series(
    series_id: UUID,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """
    Get a specific recurring task series by ID (ownership verified).

    Args:
        series_id: UUID of the recurring task series

    Returns:
        Recurring task series data
    """
    try:
        series = RecurringTaskService.get_series_by_id(
            db=db,
            series_id=series_id,
            user_id=user_id
        )

        return success_response(
            RecurringTaskSeriesResponse.from_orm(series).model_dump(mode="json")
        )

    except HTTPException:
        raise
    except Exception as e:
        return error_response(f"Failed to fetch series: {str(e)}")


@router.get("/{series_id}/tasks")
async def get_series_tasks(
    series_id: UUID,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """
    Get all task instances for a recurring series (ownership verified).

    Args:
        series_id: UUID of the recurring task series

    Returns:
        List of tasks belonging to the series
    """
    try:
        tasks = RecurringTaskService.get_series_tasks(
            db=db,
            series_id=series_id,
            user_id=user_id
        )

        response_data = [
            TaskResponse.from_orm(task).model_dump(mode="json")
            for task in tasks
        ]

        return success_response(response_data)

    except HTTPException:
        raise
    except Exception as e:
        return error_response(f"Failed to fetch series tasks: {str(e)}")


@router.put("/{series_id}")
async def update_recurring_series(
    series_id: UUID,
    series_update: RecurringTaskSeriesUpdate,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """
    Update a recurring task series (ownership verified).

    Note: Only affects future task instances. Existing tasks are unchanged.

    Args:
        series_id: UUID of the recurring task series
        series_update: Fields to update (template, pattern, or active status)

    Returns:
        Updated recurring task series
    """
    try:
        # At least one field must be provided
        if not any([
            series_update.base_task_template is not None,
            series_update.recurrence_pattern is not None,
            series_update.is_active is not None
        ]):
            return error_response("At least one field must be provided for update")

        updated_series = RecurringTaskService.update_series(
            db=db,
            series_id=series_id,
            user_id=user_id,
            base_task_template=series_update.base_task_template,
            recurrence_pattern=series_update.recurrence_pattern,
            is_active=series_update.is_active
        )

        return success_response(
            RecurringTaskSeriesResponse.from_orm(updated_series).model_dump(mode="json"),
            popup="RECURRING_SERIES_UPDATED"
        )

    except HTTPException:
        raise
    except Exception as e:
        return error_response(f"Failed to update series: {str(e)}")


@router.delete("/{series_id}", status_code=status.HTTP_200_OK)
async def delete_recurring_series(
    series_id: UUID,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """
    Soft delete a recurring task series (set is_active=False).

    Note: Existing task instances are NOT deleted (history is preserved).
    Future task instances will not be generated.

    Args:
        series_id: UUID of the recurring task series

    Returns:
        Success confirmation
    """
    try:
        success = RecurringTaskService.delete_series(
            db=db,
            series_id=series_id,
            user_id=user_id
        )

        if not success:
            return error_response("Failed to delete series", popup=None), status.HTTP_500_INTERNAL_SERVER_ERROR

        return success_response(
            {"message": "Recurring series deactivated (existing tasks preserved)"},
            popup="RECURRING_SERIES_DELETED"
        )

    except HTTPException:
        raise
    except Exception as e:
        return error_response(f"Failed to delete series: {str(e)}")
