# Implement Interactive Mode

## Description

The developer must implement an interactive mode for the todo application that runs in a continuous loop, allowing users to perform multiple operations while maintaining in-memory state throughout the session. This feature addresses the user experience concern where tasks don't persist between separate command executions. This task fulfills the need for a more user-friendly interface while still adhering to the Constitution's in-memory storage requirement.

## Related SPEC

specs/1-add-task/spec.md, specs/2-list-tasks/spec.md, specs/3-update-task/spec.md, specs/4-delete-task/spec.md, specs/5-mark-complete-incomplete/spec.md

## Implementation Steps

1. Create a new module `src/cli/interactive.py` to handle the interactive mode
2. Implement a main loop function that displays a colorful welcome message using Rich
3. Create a menu system that allows users to select operations (add, list, update, delete, complete)
4. Integrate the existing TaskManager to maintain state during the session
5. Implement input validation and error handling for the interactive mode
6. Add a quit/exit option to terminate the interactive session
7. Modify the main application to optionally launch in interactive mode
8. Ensure all Rich formatting is used consistently for visual appeal

## Acceptance Criteria

- Running `python -m src.todo_app interactive` starts the interactive mode with a colorful welcome message
- The application displays a menu with options for all five core features (Add, List, Update, Delete, Complete)
- Tasks added in the session persist and are accessible by other operations during the same session
- The application returns to the main menu after each operation unless the user chooses to exit
- Input validation works correctly in the interactive mode
- The session terminates cleanly when the user selects the exit option

## Required Tests

- `test_interactive_mode_starts_with_welcome_message`
- `test_interactive_mode_menu_options_displayed`
- `test_interactive_mode_add_task_persists_in_session`
- `test_interactive_mode_list_shows_current_tasks`
- `test_interactive_mode_update_task_in_session`
- `test_interactive_mode_delete_task_in_session`
- `test_interactive_mode_mark_complete_in_session`
- `test_interactive_mode_handles_invalid_input_gracefully`
- `test_interactive_mode_exits_cleanly`

## CLI Examples

Example 1: Starting interactive mode
```
$ python -m src.todo_app interactive
┌─────────────────────────────────────┐
│    📝 Welcome to Todo App! 📝      │
│                                     │
│ What would you like to do?          │
│ 1. Add Task                         │
│ 2. List Tasks                       │
│ 3. Update Task                      │
│ 4. Delete Task                      │
│ 5. Mark Complete/Incomplete         │
│ 6. Exit                            │
└─────────────────────────────────────┘
Enter your choice (1-6):
```

Example 2: Adding a task in interactive mode
```
Enter your choice (1-6): 1
Enter task title: Complete Hackathon
Enter task description (optional): Complete hackathon by 7 Dec
Task added successfully with ID: 1
```

Example 3: Listing tasks in interactive mode
```
Enter your choice (1-6): 2
┌───────────── Todo Tasks ─────────────┐
│  ID │ Title              │ Status    │
├─────┼────────────────────┼───────────┤
│  1  │ Complete Hackathon │ incomplete│
└─────┴────────────────────┴───────────┘
```

## Dependencies

- Dependencies: Task model (src/models/task.py), TaskManager (src/managers/task_manager.py), Rich library
- Tasks that depend on this: None (this is an enhancement feature)

## Estimated Size

M