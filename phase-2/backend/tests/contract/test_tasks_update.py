import pytest

def test_update_task_title(client):
    """Test updating task title"""
    resp = client.post("/api/v1/tasks", json={"title": "Old Title"})
    task_id = resp.json()["data"]["id"]
    
    response = client.put(f"/api/v1/tasks/{task_id}", json={"title": "New Title"})
    assert response.status_code == 200
    data = response.json()
    assert data["success"] == True
    assert data["data"]["title"] == "New Title"
    assert data["popup"] == "TASK_UPDATED"

def test_update_task_description(client):
    """Test updating task description"""
    resp = client.post("/api/v1/tasks", json={"title": "Task", "description": "Old desc"})
    task_id = resp.json()["data"]["id"]
    
    response = client.put(f"/api/v1/tasks/{task_id}", json={"description": "New desc"})
    assert response.status_code == 200
    data = response.json()
    assert data["success"] == True
    assert data["data"]["description"] == "New desc"

def test_update_both_title_and_description(client):
    """Test updating both title and description"""
    resp = client.post("/api/v1/tasks", json={"title": "Old", "description": "Old"})
    task_id = resp.json()["data"]["id"]
    
    response = client.put(f"/api/v1/tasks/{task_id}", json={"title": "New", "description": "New"})
    assert response.status_code == 200
    data = response.json()
    assert data["success"] == True
    assert data["data"]["title"] == "New"
    assert data["data"]["description"] == "New"

def test_reject_update_with_no_fields(client):
    """Test that update with no fields is rejected"""
    resp = client.post("/api/v1/tasks", json={"title": "Task"})
    task_id = resp.json()["data"]["id"]
    
    response = client.put(f"/api/v1/tasks/{task_id}", json={})
    assert response.status_code == 200
    data = response.json()
    assert data["success"] == False

def test_reject_empty_title_on_update(client):
    """Test rejecting empty title on update"""
    resp = client.post("/api/v1/tasks", json={"title": "Task"})
    task_id = resp.json()["data"]["id"]
    
    response = client.put(f"/api/v1/tasks/{task_id}", json={"title": ""})
    assert response.status_code == 200
    data = response.json()
    assert data["success"] == False
