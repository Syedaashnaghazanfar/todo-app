import pytest

def test_mark_task_complete(client):
    """Test marking task as complete"""
    resp = client.post("/api/v1/tasks", json={"title": "Task"})
    task_id = resp.json()["data"]["id"]
    
    response = client.patch(f"/api/v1/tasks/{task_id}/complete")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] == True
    assert data["data"]["is_completed"] == True
    assert data["data"]["completed_at"] is not None
    assert data["popup"] == "TASK_COMPLETED"

def test_mark_task_incomplete(client):
    """Test marking task as incomplete"""
    resp = client.post("/api/v1/tasks", json={"title": "Task"})
    task_id = resp.json()["data"]["id"]
    
    # Complete first
    client.patch(f"/api/v1/tasks/{task_id}/complete")
    
    # Then incomplete
    response = client.patch(f"/api/v1/tasks/{task_id}/incomplete")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] == True
    assert data["data"]["is_completed"] == False
    assert data["data"]["completed_at"] is None
    assert data["popup"] == "TASK_INCOMPLETE"

def test_complete_nonexistent_task(client):
    """Test completing non-existent task"""
    import uuid
    fake_id = str(uuid.uuid4())
    
    response = client.patch(f"/api/v1/tasks/{fake_id}/complete")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] == False

def test_history_created_on_complete(client, db):
    """Test that history entry is created when task is marked complete"""
    resp = client.post("/api/v1/tasks", json={"title": "Task"})
    task_id = resp.json()["data"]["id"]
    
    client.patch(f"/api/v1/tasks/{task_id}/complete")
    
    from src.models.task_history import TaskHistory, ActionType
    history = db.query(TaskHistory).filter(TaskHistory.action_type == ActionType.COMPLETED).first()
    assert history is not None
