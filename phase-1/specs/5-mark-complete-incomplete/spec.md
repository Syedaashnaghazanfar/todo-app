# Mark Complete / Incomplete

## Purpose

The Mark Complete / Incomplete feature enables users to update the status of tasks in the in-memory todo list. This feature allows users to track progress by marking tasks as completed when finished or as incomplete when reopened. The feature aligns with the Constitution's requirement for in-memory storage and CLI-only interface, ensuring that status changes are immediately reflected in the application's memory.

## Command Contract

`python -m src.todo_app complete --id <task_id> --status <status>`

Arguments:
- `--id` (required): Integer representing the unique task identifier
- `--status` (required): String value of either "complete" or "incomplete" (case-insensitive)

Success message: "Task {id} marked as {status} successfully"
Error messages:
- "Error: Task ID is required" (when ID is missing)
- "Error: Status is required" (when status is missing)
- "Error: Task with ID {id} not found" (when specified task doesn't exist)
- "Error: Task ID must be a valid integer" (when ID format is invalid)
- "Error: Status must be 'complete' or 'incomplete'" (when status value is invalid)

## Behavior Specification

1. Input validation: The system validates that both task ID and status are provided
2. ID validation: The system validates that the task ID is a valid integer
3. Status validation: The system validates that status is either "complete" or "incomplete" (case-insensitive)
4. Task lookup: The system searches for the task with the specified ID in memory
5. Validation: If task doesn't exist, the system returns an error message
6. Status update: The system updates the task's status field to the specified value
7. Memory update: The modified task is updated in the in-memory list
8. Success output: The system outputs a success message using Rich formatting

The Rich library formats success messages in green text and error messages in red text.

## Examples

Example 1: Marking a task as complete
```
$ python -m src.todo_app complete --id 1 --status complete
Task 1 marked as complete successfully
```

Example 2: Marking a task as incomplete
```
$ python -m src.todo_app complete --id 2 --status incomplete
Task 2 marked as incomplete successfully
```

Example 3: Using case-insensitive status values
```
$ python -m src.todo_app complete --id 3 --status COMPLETE
Task 3 marked as complete successfully
```

Example 4: Attempting to update status of non-existent task
```
$ python -m src.todo_app complete --id 999 --status complete
Error: Task with ID 999 not found
```

Example 5: Attempting to use invalid status value
```
$ python -m src.todo_app complete --id 1 --status done
Error: Status must be 'complete' or 'incomplete'
```

## Edge Cases

- Missing ID argument: System returns "Error: Task ID is required"
- Missing status argument: System returns "Error: Status is required"
- Invalid ID format: System returns "Error: Task ID must be a valid integer"
- Non-existent ID: System returns "Error: Task with ID {id} not found"
- Invalid status value: System returns "Error: Status must be 'complete' or 'incomplete'"
- Case variations: System accepts "COMPLETE", "Complete", "INCOMPLETE", "Incomplete", etc.
- Status already set: System allows changing to same status (no-op) or different status
- Special characters in status: System should reject as invalid format

## Acceptance Tests

### Test 1: Successfully mark task as complete
Given: An in-memory task list containing a task with ID=1, status="incomplete"
When: User runs `python -m src.todo_app complete --id 1 --status complete`
Then:
- System outputs "Task 1 marked as complete successfully"
- In-memory state contains task with ID=1, status="complete"
- Other task attributes remain unchanged

### Test 2: Successfully mark task as incomplete
Given: An in-memory task list containing a task with ID=2, status="complete"
When: User runs `python -m src.todo_app complete --id 2 --status incomplete`
Then:
- System outputs "Task 2 marked as incomplete successfully"
- In-memory state contains task with ID=2, status="incomplete"
- Other task attributes remain unchanged

### Test 3: Attempt to update non-existent task status
Given: An in-memory task list without a task with ID=999
When: User runs `python -m src.todo_app complete --id 999 --status complete`
Then:
- System outputs "Error: Task with ID 999 not found"
- In-memory state remains unchanged

### Test 4: Attempt to use invalid status value
Given: An in-memory task list containing a task with ID=3
When: User runs `python -m src.todo_app complete --id 3 --status done`
Then:
- System outputs "Error: Status must be 'complete' or 'incomplete'"
- In-memory state remains unchanged

## Data Model Interaction

The Mark Complete / Incomplete feature interacts with the in-memory task list by:
1. Searching the in-memory list for a task with the specified ID
2. If found, accessing the task object and modifying only the status attribute
3. Validating that the new status value is either "complete" or "incomplete"
4. Updating the task object in the in-memory list at its original position
5. The feature does not modify other attributes of the task or other tasks in the list