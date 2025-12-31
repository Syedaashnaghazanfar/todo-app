import pytest

def test_list_all_tasks(client):
    """Test listing all tasks"""
    # Create some tasks
    client.post("/api/v1/tasks", json={"title": "Task 1"})
    client.post("/api/v1/tasks", json={"title": "Task 2"})
    
    response = client.get("/api/v1/tasks")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] == True
    assert len(data["data"]) == 2
    assert data["data"][0]["title"] == "Task 1"

def test_list_tasks_ordered_with_incomplete_first(client):
    """Test that incomplete tasks appear before completed tasks"""
    # Create task
    resp1 = client.post("/api/v1/tasks", json={"title": "Task 1"})
    task_id = resp1.json()["data"]["id"]
    
    # Create another task and mark as complete
    resp2 = client.post("/api/v1/tasks", json={"title": "Task 2"})
    task_id_2 = resp2.json()["data"]["id"]
    client.patch(f"/api/v1/tasks/{task_id_2}/complete")
    
    # List tasks
    response = client.get("/api/v1/tasks")
    data = response.json()
    assert data["data"][0]["is_completed"] == False
    assert data["data"][1]["is_completed"] == True

def test_list_empty_tasks(client):
    """Test listing when no tasks exist"""
    response = client.get("/api/v1/tasks")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] == True
    assert data["data"] == []

def test_get_single_task(client):
    """Test retrieving a single task"""
    resp = client.post("/api/v1/tasks", json={"title": "Test Task"})
    task_id = resp.json()["data"]["id"]
    
    response = client.get(f"/api/v1/tasks/{task_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] == True
    assert data["data"]["id"] == task_id
    assert data["data"]["title"] == "Test Task"

def test_get_nonexistent_task(client):
    """Test retrieving non-existent task returns 404"""
    import uuid
    fake_id = str(uuid.uuid4())
    
    response = client.get(f"/api/v1/tasks/{fake_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] == False
    assert "not found" in data["error"].lower()
