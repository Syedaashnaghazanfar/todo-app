# Update Task

## Purpose

The Update Task feature enables users to modify existing tasks in the in-memory todo list. This feature allows users to change task titles, descriptions, or both, providing flexibility to keep task information current. The feature aligns with the Constitution's requirement for in-memory storage and CLI-only interface, ensuring that updates are reflected immediately in the application's memory.

## Command Contract

`python -m src.todo_app update --id <task_id> --title "New Title" --description "New Description"`

Arguments:
- `--id` (required): Integer representing the unique task identifier
- `--title` (optional): String containing the new task title (min 1 character, max 255 characters)
- `--description` (optional): String containing the new task description (max 1000 characters)

Success message: "Task {id} updated successfully"
Error messages:
- "Error: Task ID is required" (when ID is missing)
- "Error: Task with ID {id} not found" (when specified task doesn't exist)
- "Error: Title must be between 1 and 255 characters" (when title is too short or long)
- "Error: Description exceeds 1000 characters" (when description is too long)

## Behavior Specification

1. Input validation: The system validates that the task ID is provided and is a valid integer
2. Task lookup: The system searches for the task with the specified ID in memory
3. Validation: If task doesn't exist, the system returns an error message
4. Update validation: The system validates new title and description if provided
5. Task modification: The system updates only the specified fields (title and/or description), leaving other fields unchanged
6. Memory update: The modified task is updated in the in-memory list
7. Success output: The system outputs a success message using Rich formatting

The Rich library formats success messages in green text and error messages in red text.

## Examples

Example 1: Updating task title only
```
$ python -m src.todo_app update --id 1 --title "Updated Grocery List"
Task 1 updated successfully
```

Example 2: Updating task description only
```
$ python -m src.todo_app update --id 2 --description "Call mom to check on her health"
Task 2 updated successfully
```

Example 3: Updating both title and description
```
$ python -m src.todo_app update --id 3 --title "Complete final report" --description "Submit to manager by EOD"
Task 3 updated successfully
```

Example 4: Attempting to update non-existent task
```
$ python -m src.todo_app update --id 999 --title "This won't work"
Error: Task with ID 999 not found
```

## Edge Cases

- Missing ID argument: System returns "Error: Task ID is required"
- Invalid ID format: System returns "Error: Task ID must be a valid integer"
- Non-existent ID: System returns "Error: Task with ID {id} not found"
- Empty title: System returns "Error: Title must be between 1 and 255 characters"
- Title exceeding 255 characters: System returns "Error: Title must be between 1 and 255 characters"
- Description exceeding 1000 characters: System returns "Error: Description exceeds 1000 characters"
- Providing no update fields: System may return an error or no-op message
- Special characters in updates: System accepts valid UTF-8 characters

## Acceptance Tests

### Test 1: Successful task update with new title
Given: An in-memory task list containing a task with ID=1, title="Old Title", description="Old Description", status="incomplete"
When: User runs `python -m src.todo_app update --id 1 --title "New Title"`
Then:
- System outputs "Task 1 updated successfully"
- In-memory state contains task with ID=1, title="New Title", description="Old Description", status="incomplete"

### Test 2: Successful task update with new description
Given: An in-memory task list containing a task with ID=2, title="Title", description="Old Description", status="complete"
When: User runs `python -m src.todo_app update --id 2 --description "New Description"`
Then:
- System outputs "Task 2 updated successfully"
- In-memory state contains task with ID=2, title="Title", description="New Description", status="complete"

### Test 3: Successful task update with both title and description
Given: An in-memory task list containing a task with ID=3, title="Old Title", description="Old Description", status="incomplete"
When: User runs `python -m src.todo_app update --id 3 --title "New Title" --description "New Description"`
Then:
- System outputs "Task 3 updated successfully"
- In-memory state contains task with ID=3, title="New Title", description="New Description", status="incomplete"

### Test 4: Attempt to update non-existent task
Given: An in-memory task list without a task with ID=999
When: User runs `python -m src.todo_app update --id 999 --title "New Title"`
Then:
- System outputs "Error: Task with ID 999 not found"
- In-memory state remains unchanged

## Data Model Interaction

The Update Task feature interacts with the in-memory task list by:
1. Searching the in-memory list for a task with the specified ID
2. If found, accessing the existing task object and modifying:
   - title: if --title argument is provided
   - description: if --description argument is provided
   - id and status: remain unchanged
3. Updating the task object in the in-memory list at its original position
4. The feature does not modify other tasks in the list