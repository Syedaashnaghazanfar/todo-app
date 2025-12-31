"""
Tests for the Delete Task feature in the Todo In-Memory Python Console Application.
"""


def test_delete_task_success_case():
    """Test the success case for deleting a task."""
    from src.managers.task_manager import TaskManager

    manager = TaskManager()
    task = manager.add_task("Task to Delete")

    initial_tasks = manager.get_all_tasks()
    assert len(initial_tasks) == 1

    success = manager.delete_task(task.id)

    assert success is True
    remaining_tasks = manager.get_all_tasks()
    assert len(remaining_tasks) == 0


def test_delete_nonexistent_task():
    """Test that deleting a non-existent task returns False."""
    from src.managers.task_manager import TaskManager

    manager = TaskManager()

    success = manager.delete_task(999)

    assert success is False


def test_delete_task_removes_correct_task():
    """Test that deleting a task removes only the specified task."""
    from src.managers.task_manager import TaskManager

    manager = TaskManager()
    task1 = manager.add_task("Task 1")
    task2 = manager.add_task("Task 2")
    task3 = manager.add_task("Task 3")

    initial_tasks = manager.get_all_tasks()
    assert len(initial_tasks) == 3

    success = manager.delete_task(task2.id)

    assert success is True
    remaining_tasks = manager.get_all_tasks()
    assert len(remaining_tasks) == 2
    assert remaining_tasks[0].id == task1.id
    assert remaining_tasks[1].id == task3.id