# Delete Task

## Purpose

The Delete Task feature enables users to remove tasks from the in-memory todo list. This feature allows users to eliminate completed or irrelevant tasks, keeping the list focused and manageable. The feature aligns with the Constitution's requirement for in-memory storage and CLI-only interface, ensuring that deleted tasks are immediately removed from the application's memory.

## Command Contract

`python -m src.todo_app delete --id <task_id>`

Arguments:
- `--id` (required): Integer representing the unique task identifier

Success message: "Task {id} deleted successfully"
Error messages:
- "Error: Task ID is required" (when ID is missing)
- "Error: Task with ID {id} not found" (when specified task doesn't exist)
- "Error: Task ID must be a valid integer" (when ID format is invalid)

## Behavior Specification

1. Input validation: The system validates that the task ID is provided and is a valid integer
2. Task lookup: The system searches for the task with the specified ID in memory
3. Validation: If task doesn't exist, the system returns an error message
4. Task removal: The system removes the task from the in-memory list
5. Success output: The system outputs a success message using Rich formatting
6. The system does not affect other tasks in the list

The Rich library formats success messages in green text and error messages in red text.

## Examples

Example 1: Successfully deleting a task
```
$ python -m src.todo_app delete --id 1
Task 1 deleted successfully
```

Example 2: Attempting to delete non-existent task
```
$ python -m src.todo_app delete --id 999
Error: Task with ID 999 not found
```

Example 3: Attempting to delete with invalid ID format
```
$ python -m src.todo_app delete --id abc
Error: Task ID must be a valid integer
```

## Edge Cases

- Missing ID argument: System returns "Error: Task ID is required"
- Invalid ID format: System returns "Error: Task ID must be a valid integer"
- Non-existent ID: System returns "Error: Task with ID {id} not found"
- Attempting to delete the last remaining task: System removes the task and list becomes empty
- Task ID with leading/trailing spaces: System should handle appropriately (trim or reject)
- Special characters in ID field: System should reject as invalid format

## Acceptance Tests

### Test 1: Successful task deletion
Given: An in-memory task list containing a task with ID=1
When: User runs `python -m src.todo_app delete --id 1`
Then:
- System outputs "Task 1 deleted successfully"
- In-memory state no longer contains the task with ID=1
- Other tasks in the list remain unchanged

### Test 2: Attempt to delete non-existent task
Given: An in-memory task list without a task with ID=999
When: User runs `python -m src.todo_app delete --id 999`
Then:
- System outputs "Error: Task with ID 999 not found"
- In-memory state remains unchanged

### Test 3: Delete task from list with multiple tasks
Given: An in-memory task list containing tasks with IDs 1, 2, and 3
When: User runs `python -m src.todo_app delete --id 2`
Then:
- System outputs "Task 2 deleted successfully"
- In-memory state contains tasks with IDs 1 and 3
- Task with ID 2 is removed from the list

### Test 4: Delete the last task in the list
Given: An in-memory task list containing a single task with ID=1
When: User runs `python -m src.todo_app delete --id 1`
Then:
- System outputs "Task 1 deleted successfully"
- In-memory state contains no tasks (empty list)

## Data Model Interaction

The Delete Task feature interacts with the in-memory task list by:
1. Searching the in-memory list for a task with the specified ID
2. If found, removing the task object from the list
3. Preserving the order and integrity of remaining tasks
4. The feature does not modify other tasks in the list
5. The task list size decreases by one after successful deletion