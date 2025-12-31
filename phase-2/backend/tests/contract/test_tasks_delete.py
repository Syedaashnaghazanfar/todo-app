import pytest

def test_delete_task(client):
    """Test deleting a task"""
    resp = client.post("/api/v1/tasks", json={"title": "Task"})
    task_id = resp.json()["data"]["id"]
    
    response = client.delete(f"/api/v1/tasks/{task_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] == True
    assert data["popup"] == "TASK_DELETED"

def test_deleted_task_not_in_list(client):
    """Test that deleted task doesn't appear in list"""
    resp = client.post("/api/v1/tasks", json={"title": "Task"})
    task_id = resp.json()["data"]["id"]
    
    client.delete(f"/api/v1/tasks/{task_id}")
    
    response = client.get("/api/v1/tasks")
    data = response.json()
    assert len(data["data"]) == 0

def test_history_retained_after_deletion(client, db):
    """Test that history entries are retained after task deletion"""
    resp = client.post("/api/v1/tasks", json={"title": "Task"})
    task_id = resp.json()["data"]["id"]
    
    client.delete(f"/api/v1/tasks/{task_id}")
    
    from src.models.task_history import TaskHistory
    history_count = db.query(TaskHistory).count()
    assert history_count >= 2  # At least CREATED and DELETED

def test_delete_nonexistent_task(client):
    """Test deleting non-existent task"""
    import uuid
    fake_id = str(uuid.uuid4())
    
    response = client.delete(f"/api/v1/tasks/{fake_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] == False
