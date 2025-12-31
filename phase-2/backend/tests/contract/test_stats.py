import pytest

def test_get_weekly_stats(client):
    """Test getting weekly statistics"""
    response = client.get("/api/v1/stats/weekly")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] == True
    assert "tasks_created_this_week" in data["data"]
    assert "tasks_completed_this_week" in data["data"]
    assert "total_completed" in data["data"]
    assert "total_incomplete" in data["data"]
    assert "week_start" in data["data"]
    assert "week_end" in data["data"]
    assert "total_tasks" in data["data"]

def test_weekly_stats_accurate_counts(client):
    """Test that weekly stats have accurate counts"""
    # Create 3 tasks
    resp1 = client.post("/api/v1/tasks", json={"title": "Task 1"})
    task_id_1 = resp1.json()["data"]["id"]
    
    resp2 = client.post("/api/v1/tasks", json={"title": "Task 2"})
    task_id_2 = resp2.json()["data"]["id"]
    
    resp3 = client.post("/api/v1/tasks", json={"title": "Task 3"})
    
    # Complete 2 tasks
    client.patch(f"/api/v1/tasks/{task_id_1}/complete")
    client.patch(f"/api/v1/tasks/{task_id_2}/complete")
    
    response = client.get("/api/v1/stats/weekly")
    data = response.json()["data"]
    
    assert data["total_tasks"] == 3
    assert data["total_completed"] == 2
    assert data["total_incomplete"] == 1
    assert data["tasks_created_this_week"] == 3
    assert data["tasks_completed_this_week"] == 2

def test_weekly_stats_empty_database(client):
    """Test weekly stats with empty database"""
    response = client.get("/api/v1/stats/weekly")
    data = response.json()["data"]
    
    assert data["total_tasks"] == 0
    assert data["total_completed"] == 0
    assert data["total_incomplete"] == 0
