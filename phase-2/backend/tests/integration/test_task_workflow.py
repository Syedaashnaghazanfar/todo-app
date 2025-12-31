import pytest

def test_complete_task_workflow(client):
    """Test complete task workflow: create, update, complete, view history"""
    # Create task
    resp = client.post("/api/v1/tasks", json={"title": "Buy groceries", "description": "Milk, eggs"})
    assert resp.status_code == 201
    task_data = resp.json()["data"]
    task_id = task_data["id"]
    assert task_data["is_completed"] == False
    
    # Update task
    resp = client.put(f"/api/v1/tasks/{task_id}", json={"title": "Buy groceries and cook"})
    assert resp.status_code == 200
    updated = resp.json()["data"]
    assert updated["title"] == "Buy groceries and cook"
    
    # Complete task
    resp = client.patch(f"/api/v1/tasks/{task_id}/complete")
    assert resp.status_code == 200
    completed = resp.json()["data"]
    assert completed["is_completed"] == True
    assert completed["completed_at"] is not None
    
    # Mark incomplete
    resp = client.patch(f"/api/v1/tasks/{task_id}/incomplete")
    assert resp.status_code == 200
    incomplete = resp.json()["data"]
    assert incomplete["is_completed"] == False
    assert incomplete["completed_at"] is None
    
    # View history
    resp = client.get(f"/api/v1/history?task_id={task_id}")
    assert resp.status_code == 200
    history = resp.json()["data"]["items"]
    assert len(history) >= 4  # CREATED, UPDATED, COMPLETED, INCOMPLETED

def test_multiple_tasks_crud_workflow(client):
    """Test multiple tasks with different states"""
    # Create 3 tasks
    task_ids = []
    for i in range(3):
        resp = client.post("/api/v1/tasks", json={"title": f"Task {i}"})
        task_ids.append(resp.json()["data"]["id"])
    
    # Complete first and second
    client.patch(f"/api/v1/tasks/{task_ids[0]}/complete")
    client.patch(f"/api/v1/tasks/{task_ids[1]}/complete")
    
    # List tasks - should show incomplete first
    resp = client.get("/api/v1/tasks")
    tasks = resp.json()["data"]
    assert tasks[0]["is_completed"] == False
    assert tasks[1]["is_completed"] == True
    assert tasks[2]["is_completed"] == True
    
    # Delete one completed task
    client.delete(f"/api/v1/tasks/{task_ids[1]}")
    
    # List again
    resp = client.get("/api/v1/tasks")
    tasks = resp.json()["data"]
    assert len(tasks) == 2
    
    # Check history is retained
    resp = client.get("/api/v1/history")
    history_count = resp.json()["data"]["pagination"]["total_count"]
    assert history_count >= 5  # 3 CREATED + 2 COMPLETED + 1 DELETED

def test_task_stats_after_operations(client):
    """Test statistics after various task operations"""
    # Create 5 tasks
    for i in range(5):
        client.post("/api/v1/tasks", json={"title": f"Task {i}"})
    
    # Complete 3
    resp = client.get("/api/v1/tasks")
    tasks = resp.json()["data"]
    for task in tasks[:3]:
        client.patch(f"/api/v1/tasks/{task['id']}/complete")
    
    # Get stats
    resp = client.get("/api/v1/stats/weekly")
    stats = resp.json()["data"]
    
    assert stats["total_tasks"] == 5
    assert stats["total_completed"] == 3
    assert stats["total_incomplete"] == 2
    assert stats["tasks_created_this_week"] == 5
    assert stats["tasks_completed_this_week"] == 3
