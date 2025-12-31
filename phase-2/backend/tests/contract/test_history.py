import pytest

def test_get_history_paginated(client):
    """Test getting paginated history"""
    # Create some tasks to generate history
    for i in range(5):
        client.post("/api/v1/tasks", json={"title": f"Task {i}"})
    
    response = client.get("/api/v1/history?page=1&limit=10")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] == True
    assert "pagination" in data["data"]
    assert data["data"]["pagination"]["total_count"] >= 5

def test_history_default_pagination(client):
    """Test history pagination with default values"""
    for i in range(15):
        client.post("/api/v1/tasks", json={"title": f"Task {i}"})
    
    response = client.get("/api/v1/history")
    assert response.status_code == 200
    data = response.json()
    assert data["data"]["pagination"]["page_size"] == 10

def test_history_offset_pagination(client):
    """Test history with offset pagination"""
    for i in range(5):
        client.post("/api/v1/tasks", json={"title": f"Task {i}"})
    
    response = client.get("/api/v1/history?offset=0&limit=2")
    assert response.status_code == 200
    data = response.json()
    assert len(data["data"]["items"]) == 2

def test_history_filter_by_task_id(client):
    """Test filtering history by task ID"""
    resp1 = client.post("/api/v1/tasks", json={"title": "Task 1"})
    task_id = resp1.json()["data"]["id"]
    
    resp2 = client.post("/api/v1/tasks", json={"title": "Task 2"})
    
    response = client.get(f"/api/v1/history?task_id={task_id}")
    assert response.status_code == 200
    data = response.json()
    for item in data["data"]["items"]:
        assert item["task_id"] == str(task_id)

def test_history_sorted_by_timestamp(client):
    """Test that history is sorted by timestamp descending"""
    for i in range(3):
        client.post("/api/v1/tasks", json={"title": f"Task {i}"})
    
    response = client.get("/api/v1/history")
    data = response.json()
    items = data["data"]["items"]
    
    # Verify descending order
    for i in range(len(items) - 1):
        assert items[i]["timestamp"] >= items[i + 1]["timestamp"]
