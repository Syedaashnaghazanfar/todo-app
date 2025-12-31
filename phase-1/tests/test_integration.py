"""
Integration tests for the Todo In-Memory Python Console Application.
"""

def test_full_workflow():
    """Test the full workflow of the application: add, list, update, mark complete, delete."""
    from src.managers.task_manager import TaskManager

    manager = TaskManager()

    # Add tasks
    task1 = manager.add_task("Buy groceries", "Milk and bread")
    task2 = manager.add_task("Walk the dog")

    # Verify tasks were added
    all_tasks = manager.get_all_tasks()
    assert len(all_tasks) == 2
    assert all_tasks[0].title == "Buy groceries"
    assert all_tasks[1].title == "Walk the dog"

    # Update a task
    success = manager.update_task(task1.id, title="Buy groceries and cook dinner", description="Milk, bread, and vegetables")
    assert success is True

    updated_task = manager.get_task_by_id(task1.id)
    assert updated_task.title == "Buy groceries and cook dinner"

    # Mark a task as complete
    success = manager.mark_task_status(task2.id, "complete")
    assert success is True

    completed_task = manager.get_task_by_id(task2.id)
    assert completed_task.status == "complete"

    # Delete a task
    success = manager.delete_task(task1.id)
    assert success is True

    remaining_tasks = manager.get_all_tasks()
    assert len(remaining_tasks) == 1
    assert remaining_tasks[0].id == task2.id
    assert remaining_tasks[0].status == "complete"


def test_id_sequential_assignment():
    """Test that IDs are assigned sequentially."""
    from src.managers.task_manager import TaskManager

    manager = TaskManager()

    task1 = manager.add_task("First task")
    task2 = manager.add_task("Second task")
    task3 = manager.add_task("Third task")

    assert task1.id == 1
    assert task2.id == 2
    assert task3.id == 3


def test_task_persistence_in_memory():
    """Test that tasks persist correctly in memory during various operations."""
    from src.managers.task_manager import TaskManager

    manager = TaskManager()

    # Add multiple tasks
    for i in range(5):
        manager.add_task(f"Task {i+1}", f"Description for task {i+1}")

    # Verify all tasks exist
    tasks = manager.get_all_tasks()
    assert len(tasks) == 5

    # Update one task
    manager.update_task(3, title="Updated Task 3")

    # Verify all tasks still exist and updated task is correct
    tasks = manager.get_all_tasks()
    assert len(tasks) == 5
    updated_task = manager.get_task_by_id(3)
    assert updated_task.title == "Updated Task 3"