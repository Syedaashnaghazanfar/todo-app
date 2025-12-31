# List Tasks

## Purpose

The List Tasks feature enables users to view all tasks currently stored in the in-memory todo list. This feature provides visibility into all tasks with their status, titles, and descriptions, allowing users to track their progress and identify pending work. The feature aligns with the Constitution's requirement for in-memory storage and CLI-only interface, presenting data in a user-friendly format using the Rich library.

## Command Contract

`python -m src.todo_app list`

Arguments: None required

Success output: Formatted table of all tasks with columns: ID, Title, Description, Status
Error message: "No tasks found" (when task list is empty)

## Behavior Specification

1. Memory access: The system accesses the in-memory task list
2. Task retrieval: All tasks are retrieved from memory
3. Formatting: The Rich library formats the output as a table with appropriate styling
4. Display: The system displays all tasks with their ID, title, description, and status
5. Empty state: If no tasks exist, the system displays an appropriate empty state message

The Rich library formats the table with headers, borders, and appropriate colors. Completed tasks may be displayed with strikethrough or different color to indicate their status.

## Examples

Example 1: Listing tasks when tasks exist
```
$ python -m src.todo_app list
┌────┬──────────────┬──────────────────────────────┬──────────┐
│ ID │ Title        │ Description                  │ Status   │
├────┼──────────────┼──────────────────────────────┼──────────┤
│ 1  │ Buy groceries│ Milk and bread               │ incomplete│
│ 2  │ Call mom     │ At 5 PM                      │ complete │
│ 3  │ Write report │ Due tomorrow                 │ incomplete│
└────┴──────────────┴──────────────────────────────┴──────────┘
```

Example 2: Listing tasks when no tasks exist
```
$ python -m src.todo_app list
No tasks found
```

Example 3: Listing tasks with empty descriptions
```
$ python -m src.todo_app list
┌────┬──────────────┬──────────────┬──────────┐
│ ID │ Title        │ Description  │ Status   │
├────┼──────────────┼──────────────┼──────────┤
│ 1  │ Simple task  │              │ incomplete│
│ 2  │ Another task │ With details │ complete │
└────┴──────────────┴──────────────┴──────────┘
```

## Edge Cases

- Empty task list: System returns "No tasks found" message
- Large number of tasks: System displays all tasks without truncation
- Special characters in task data: System properly displays UTF-8 characters
- Long titles/descriptions: System formats appropriately in table (may truncate or wrap)
- Task with empty description: System displays empty cell or "(No description)"

## Acceptance Tests

### Test 1: List all tasks successfully
Given: An in-memory task list with multiple tasks
When: User runs `python -m src.todo_app list`
Then:
- System outputs a formatted table with all tasks
- Table includes columns: ID, Title, Description, Status
- All tasks from memory are displayed

### Test 2: List tasks when empty
Given: An empty in-memory task list
When: User runs `python -m src.todo_app list`
Then:
- System outputs "No tasks found"
- No table is displayed

### Test 3: List tasks with mixed statuses
Given: An in-memory task list with tasks having both "complete" and "incomplete" statuses
When: User runs `python -m src.todo_app list`
Then:
- System outputs a formatted table showing all tasks
- Each task's status is clearly visible in the table

### Test 4: List tasks with special characters
Given: An in-memory task list with tasks containing special characters in title or description
When: User runs `python -m src.todo_app list`
Then:
- System outputs a formatted table showing all tasks
- Special characters are properly displayed in the table

## Data Model Interaction

The List Tasks feature interacts with the in-memory task list by:
1. Reading all task objects from the in-memory list
2. Accessing each task's attributes:
   - id: for the ID column
   - title: for the Title column
   - description: for the Description column
   - status: for the Status column
3. Presenting the data in a formatted table using the Rich library
4. The feature does not modify the in-memory state