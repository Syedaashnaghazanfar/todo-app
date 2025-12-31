import pytest

def test_create_task_with_title_and_description(client):
    """Test creating task with title and description"""
    response = client.post("/api/v1/tasks", json={
        "title": "Buy groceries",
        "description": "Milk, bread, eggs"
    })
    assert response.status_code == 201
    data = response.json()
    assert data["success"] == True
    assert data["data"]["title"] == "Buy groceries"
    assert data["data"]["description"] == "Milk, bread, eggs"
    assert data["data"]["is_completed"] == False
    assert data["popup"] == "TASK_CREATED"

def test_create_task_with_title_only(client):
    """Test creating task with title only"""
    response = client.post("/api/v1/tasks", json={
        "title": "Buy groceries"
    })
    assert response.status_code == 201
    data = response.json()
    assert data["success"] == True
    assert data["data"]["title"] == "Buy groceries"
    assert data["data"]["description"] is None
    assert data["popup"] == "TASK_CREATED"

def test_reject_empty_title(client):
    """Test rejecting empty title"""
    response = client.post("/api/v1/tasks", json={
        "title": ""
    })
    assert response.status_code == 200
    data = response.json()
    assert data["success"] == False
    assert "title" in data["error"]

def test_reject_title_exceeds_255_chars(client):
    """Test rejecting title > 255 characters"""
    response = client.post("/api/v1/tasks", json={
        "title": "x" * 256
    })
    assert response.status_code == 200
    data = response.json()
    assert data["success"] == False

def test_reject_description_exceeds_5000_chars(client):
    """Test rejecting description > 5000 characters"""
    response = client.post("/api/v1/tasks", json={
        "title": "Task",
        "description": "x" * 5001
    })
    assert response.status_code == 200
    data = response.json()
    assert data["success"] == False

def test_history_entry_created_on_task_creation(client, db):
    """Test that history entry is created when task is created"""
    response = client.post("/api/v1/tasks", json={
        "title": "Test task"
    })
    assert response.status_code == 201
    
    from src.models.task_history import TaskHistory
    history = db.query(TaskHistory).first()
    assert history is not None
    assert history.action_type.value == "CREATED"
