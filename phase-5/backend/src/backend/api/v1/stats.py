from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.api.dependencies import get_db, get_current_user_id
from backend.services.history_service import HistoryService
from backend.utils.response import success_response

router = APIRouter(prefix="/stats", tags=["stats"])

@router.get("/weekly")
async def get_weekly_stats(
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """Get weekly task statistics for the authenticated user"""
    stats = HistoryService.get_weekly_stats(db, user_id)

    return success_response({
        "tasks_created_this_week": stats["tasks_created_this_week"],
        "tasks_completed_this_week": stats["tasks_completed_this_week"],
        "total_completed": stats["total_completed"],
        "total_incomplete": stats["total_incomplete"],
        "week_start": stats["week_start"].isoformat() + "Z",
        "week_end": stats["week_end"].isoformat() + "Z",
        "total_tasks": stats["total_tasks"]
    })
