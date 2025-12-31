---
id: 6
title: Interactive Mode Task Card
stage: tasks
date: 2025-12-06
surface: agent
model: claude-sonnet-4-5-20250929
feature: none
branch: master
user: user
command: /sp.tasks
labels: [task-generation,todo-app,interactive]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
 - .specify/memory/task-card-interactive-mode.md
tests:
 - none
---

## Prompt

```
You are the Development Task Generator for the project:

"Phase I: Todo In-Memory Python Console Application"

Your job is to generate a complete development TASK CARD for implementing ONE specific feature or sub-feature defined in the specs.

Input field:

- `task_name` (e.g., "Implement Add Task Command", "Refactor Task Model", "Add Unit Tests for List Tasks", etc.)

You MUST produce a task card containing the following sections:

1. Task Title
   - Must match the provided `task_name`.

2. Description
   - 2–4 sentences.
   - State what the developer must build, why it matters, and which SPEC this task fulfills.
   - MUST follow the Constitution (in-memory only, CLI-only, Python 3.13+, Rich for CLI output).

3. Related SPEC
   - Reference the exact SPEC file name for the feature.
   - No file contents—just the SPEC name.

4. Implementation Steps
   - A numbered list of precise engineering steps.
   - Must include creation/editing of modules inside `/src`.
   - Must follow clean architecture and avoid global mutable state.
   - Must describe how the feature interacts with the in-memory task list.

5. Acceptance Criteria
   Use deterministic testable statements such as:
   - "Running `<command>` produces `<expected stdout>`"
   - "In-memory store contains updated task with status=`complete`"
   - "If ID does not exist, error message is printed."

6. Required Tests
   - List pytest test functions the developer MUST implement.
   - Each test name must be explicit (e.g., `test_add_creates_task_with_unique_id`).
   - Must include both success and failure tests.

7. CLI Examples
   - Provide 2–3 representative command examples + expected output.
   - Format descriptions should use Rich semantics (bold, color labels), but no actual ANSI codes.

8. Dependencies
   - What must be completed before this task?
   - What tasks will depend on THIS task?

9. Estimated Size
   - Use T-shirt sizing: S / M / L
   - Must reflect real engineering effort.

10. Output Format
    Return ONLY:
    - A clean, production-grade TASK CARD
    - In Markdown
    - No templates, no analysis, no commentary

Your output must be deterministic, scoped, testable, and implementable by a real engineer.


/sp.specify PS D:\code\Q4\hackathon-2\todo-app>   python -m src.todo_app list
No tasks found
PS D:\code\Q4\hackathon-2\todo-app> python -m src.todo_app add --title "complete hackathon" --description "complete hackhathon by 7 dec"
Task added successfully with ID: 1
PS D:\code\Q4\hackathon-2\todo-app>  python -m src.todo_app list
No tasks found
PS D:\code\Q4\hackathon-2\todo-app>  python -m src.todo_app complete --id 1 --status complete
Error: Task with ID 1 not found
PS D:\code\Q4\hackathon-2\todo-app> see this the task isnt getting saved i think we should run it in a loop and whenever user comes a welcome colourful mssg shows with like what u what to do and show our features this is better one we will then not have to run the commands also
```

## Response snapshot

Created a development task card for implementing an interactive mode for the Todo In-Memory Python Console Application. The task card includes all required sections: Task Title (Implement Interactive Mode), Description, Related SPEC (all five feature specs), Implementation Steps (8 steps including creating new module, implementing loop, menu system, etc.), Acceptance Criteria (8 criteria for interactive functionality), Required Tests (9 specific test functions), CLI Examples (3 examples showing welcome message and operations), Dependencies, and Estimated Size (M). The interactive mode will run in a continuous loop allowing users to perform multiple operations while maintaining in-memory state during the session.

## Outcome

- ✅ Impact: Created task card for interactive mode feature at .specify/memory/task-card-interactive-mode.md
- 🧪 Tests: Defined 9 specific test functions for validation
- 📁 Files: 1 task card file created
- 🔁 Next prompts: Ready for implementation of interactive mode
- 🧠 Reflection: Addresses user experience concern while maintaining in-memory constraints

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): Not applicable for task generation phase
- Prompt variant (if applicable): Interactive mode feature request
- Next experiment (smallest change to try): Implement the interactive mode as specified in the task card