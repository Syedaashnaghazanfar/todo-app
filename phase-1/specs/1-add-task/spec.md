# Add Task

## Purpose

The Add Task feature enables users to create new tasks in the in-memory todo list. This feature allows users to store tasks with a required title and optional description, assigning each task a unique identifier for future reference. The feature aligns with the Constitution's requirement for in-memory storage and CLI-only interface, providing the foundational capability to add items to the todo collection.

## Command Contract

`python -m src.todo_app add --title "Task Title" --description "Optional description"`

Arguments:
- `--title` (required): String containing the task title (min 1 character, max 255 characters)
- `--description` (optional): String containing the task description (max 1000 characters)

Success message: "Task added successfully with ID: {id}"
Error messages:
- "Error: Title is required" (when title is missing)
- "Error: Title must be between 1 and 255 characters" (when title is too short or long)
- "Error: Description exceeds 1000 characters" (when description is too long)

## Behavior Specification

1. Input validation: The system validates that the title is provided and within character limits
2. Unique ID generation: The system automatically generates a unique sequential ID for the new task
3. Task creation: A new task object is created with the provided title, optional description, and status "incomplete"
4. Memory storage: The new task is added to the in-memory task list
5. Success output: The system outputs a success message with the generated task ID using Rich formatting for visibility

The Rich library formats the success message in green text, while error messages are formatted in red text.

## Examples

Example 1: Adding a task with title only
```
$ python -m src.todo_app add --title "Buy groceries"
Task added successfully with ID: 1
```

Example 2: Adding a task with title and description
```
$ python -m src.todo_app add --title "Complete project" --description "Finish the todo app implementation"
Task added successfully with ID: 2
```

Example 3: Attempting to add a task without title (error case)
```
$ python -m src.todo_app add --description "This will fail"
Error: Title is required
```

## Edge Cases

- Missing title argument: System returns "Error: Title is required"
- Empty title: System returns "Error: Title must be between 1 and 255 characters"
- Title exceeding 255 characters: System returns "Error: Title must be between 1 and 255 characters"
- Description exceeding 1000 characters: System returns "Error: Description exceeds 1000 characters"
- Special characters in title/description: System accepts valid UTF-8 characters
- Duplicate titles: System allows duplicate titles (no uniqueness constraint per Constitution)

## Acceptance Tests

### Test 1: Successful task addition
Given: An empty in-memory task list
When: User runs `python -m src.todo_app add --title "New Task"`
Then:
- System outputs "Task added successfully with ID: 1"
- In-memory state contains one task with ID=1, title="New Task", description="", status="incomplete"

### Test 2: Task with description
Given: An in-memory task list with existing tasks
When: User runs `python -m src.todo_app add --title "Task with Desc" --description "This is a description"`
Then:
- System outputs "Task added successfully with ID: {next_id}"
- In-memory state contains a new task with provided title, description, and status="incomplete"

### Test 3: Missing title error
Given: An in-memory task list with existing tasks
When: User runs `python -m src.todo_app add --description "No title"`
Then:
- System outputs "Error: Title is required"
- In-memory state remains unchanged

### Test 4: Title validation error
Given: An in-memory task list with existing tasks
When: User runs `python -m src.todo_app add --title ""`
Then:
- System outputs "Error: Title must be between 1 and 255 characters"
- In-memory state remains unchanged

## Data Model Interaction

The Add Task feature interacts with the in-memory task list by:
1. Reading the current list to determine the next available ID
2. Creating a new task object with attributes:
   - id: auto-generated unique identifier (sequential integer)
   - title: required string from --title argument
   - description: optional string from --description argument (empty string if not provided)
   - status: "incomplete" (default for new tasks)
3. Appending the new task object to the in-memory list
4. The task list remains in memory only and will reset on application restart as per Constitution constraints