import pytest
from src.services.task_service import TaskService
from src.models.task_history import ActionType

def test_create_task(db):
    """Test TaskService.create_task"""
    task = TaskService.create_task(db, "Test Task", "Description")
    
    assert task.title == "Test Task"
    assert task.description == "Description"
    assert task.is_completed == False
    assert task.created_at is not None

def test_get_task(db):
    """Test TaskService.get_task"""
    task = TaskService.create_task(db, "Test Task")
    retrieved = TaskService.get_task(db, task.id)
    
    assert retrieved.id == task.id
    assert retrieved.title == "Test Task"

def test_update_task(db):
    """Test TaskService.update_task"""
    task = TaskService.create_task(db, "Original Title")
    updated = TaskService.update_task(db, task.id, title="New Title")
    
    assert updated.title == "New Title"

def test_delete_task(db):
    """Test TaskService.delete_task"""
    task = TaskService.create_task(db, "To Delete")
    success = TaskService.delete_task(db, task.id)
    
    assert success == True
    assert TaskService.get_task(db, task.id) is None

def test_mark_complete(db):
    """Test TaskService.mark_complete"""
    task = TaskService.create_task(db, "Task")
    completed = TaskService.mark_complete(db, task.id)
    
    assert completed.is_completed == True
    assert completed.completed_at is not None

def test_mark_incomplete(db):
    """Test TaskService.mark_incomplete"""
    task = TaskService.create_task(db, "Task")
    TaskService.mark_complete(db, task.id)
    incomplete = TaskService.mark_incomplete(db, task.id)
    
    assert incomplete.is_completed == False
    assert incomplete.completed_at is None
