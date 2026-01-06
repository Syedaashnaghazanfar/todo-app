from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from backend.api.dependencies import get_db, get_current_user_id
from backend.schemas.task import TaskCreate, TaskUpdate, TaskResponse
from backend.services.task_service import TaskService
from backend.utils.response import success_response, error_response
from backend.utils.validators import validate_title, validate_description

router = APIRouter(prefix="/tasks", tags=["tasks"])

@router.post("", status_code=status.HTTP_201_CREATED)
async def create_task(
    task: TaskCreate,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """Create a new task for the authenticated user with automatic priority classification"""
    if not validate_title(task.title):
        return error_response("title: must be 1-255 characters")

    if not validate_description(task.description):
        return error_response("description: must be 0-5000 characters")

    db_task = TaskService.create_task(
        db,
        task.title,
        task.description,
        user_id,
        due_date=task.due_date,
        tags=task.tags or []
    )
    return success_response(TaskResponse.from_orm(db_task).dict(), popup="TASK_CREATED")

@router.get("")
async def list_tasks(
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """Get all tasks for the authenticated user"""
    tasks = TaskService.get_all_tasks(db, user_id)
    return success_response([TaskResponse.from_orm(t).dict() for t in tasks])

@router.get("/{task_id}")
async def get_task(
    task_id: UUID,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """Get a specific task (ownership verified)"""
    task = TaskService.get_task(db, task_id, user_id)
    if not task:
        return error_response("Task not found", popup=None), status.HTTP_404_NOT_FOUND

    return success_response(TaskResponse.from_orm(task).dict())

@router.put("/{task_id}")
async def update_task(
    task_id: UUID,
    task_update: TaskUpdate,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """Update task fields with automatic priority re-classification (ownership verified)"""
    # At least one field must be provided
    if not any([
        task_update.title,
        task_update.description is not None,
        task_update.due_date is not None,
        task_update.tags is not None,
        task_update.status
    ]):
        return error_response("At least one field must be provided for update")

    if task_update.title and not validate_title(task_update.title):
        return error_response("title: must be 1-255 characters")

    if task_update.description is not None and not validate_description(task_update.description):
        return error_response("description: must be 0-5000 characters")

    task = TaskService.update_task(
        db,
        task_id,
        title=task_update.title,
        description=task_update.description,
        user_id=user_id,
        due_date=task_update.due_date,
        tags=task_update.tags,
        status=task_update.status
    )
    if not task:
        return error_response("Task not found", popup=None), status.HTTP_404_NOT_FOUND

    return success_response(TaskResponse.from_orm(task).dict(), popup="TASK_UPDATED")

@router.delete("/{task_id}", status_code=status.HTTP_200_OK)
async def delete_task(
    task_id: UUID,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """Delete a task (ownership verified)"""
    success = TaskService.delete_task(db, task_id, user_id)
    if not success:
        return error_response("Task not found", popup=None), status.HTTP_404_NOT_FOUND

    return success_response(popup="TASK_DELETED")

@router.patch("/{task_id}/complete")
async def mark_complete(
    task_id: UUID,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """Mark task as completed (ownership verified)"""
    task = TaskService.mark_complete(db, task_id, user_id)
    if not task:
        return error_response("Task not found", popup=None), status.HTTP_404_NOT_FOUND

    return success_response(TaskResponse.from_orm(task).dict(), popup="TASK_COMPLETED")

@router.patch("/{task_id}/incomplete")
async def mark_incomplete(
    task_id: UUID,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """Mark task as incomplete (ownership verified)"""
    task = TaskService.mark_incomplete(db, task_id, user_id)
    if not task:
        return error_response("Task not found", popup=None), status.HTTP_404_NOT_FOUND

    return success_response(TaskResponse.from_orm(task).dict(), popup="TASK_INCOMPLETE")
