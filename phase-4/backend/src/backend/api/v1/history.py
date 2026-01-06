from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID
from backend.api.dependencies import get_db, get_current_user_id
from backend.schemas.history import PaginatedHistoryResponse, HistoryResponse, PaginationMetadata
from backend.services.history_service import HistoryService
from backend.utils.response import success_response, error_response
from backend.utils.validators import validate_pagination

router = APIRouter(prefix="/history", tags=["history"])

@router.get("")
async def get_history(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    offset: int = Query(None, ge=0),
    task_id: UUID = Query(None),
    action_type: str = Query(None),
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """Get paginated task history for the authenticated user"""
    if not validate_pagination(page, limit):
        return error_response("limit must be between 1 and 100")

    result = HistoryService.get_history_paginated(db, user_id, page, limit, offset, task_id, action_type)

    history_items = [HistoryResponse.from_orm(h).dict() for h in result["items"]]
    pagination = result["pagination"]

    return success_response({
        "items": history_items,
        "pagination": pagination
    })


@router.delete("/{history_id}", status_code=status.HTTP_200_OK)
async def delete_history_entry(
    history_id: UUID,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """
    Delete a specific history entry.

    Allows users to clear individual history entries from their timeline.

    Args:
        history_id: History entry UUID
        db: Database session (injected)
        user_id: Current user ID (injected from auth)

    Returns:
        Success response

    Raises:
        HTTPException 403: If history entry belongs to different user
        HTTPException 404: If history entry does not exist
    """
    success = HistoryService.delete_history_entry(db, history_id, user_id)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="History entry not found"
        )

    return success_response({"message": "History entry deleted successfully"})
