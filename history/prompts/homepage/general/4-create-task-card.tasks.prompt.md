---
id: 4
title: Create Task Card
stage: tasks
date: 2025-12-06
surface: agent
model: claude-sonnet-4-5-20250929
feature: none
branch: master
user: user
command: /sp.tasks
labels: [task-generation,todo-app,models]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
 - .specify/memory/task-card-task-model.md
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
```

## Response snapshot

Created a development task card for implementing the core Task data model. The task card includes all required sections: Task Title, Description, Related SPEC, Implementation Steps, Acceptance Criteria, Required Tests, CLI Examples, Dependencies, and Estimated Size. The task focuses on creating the foundational Task model that will be used by all other features in the application, following clean architecture principles and Constitution requirements for in-memory storage and Python 3.13+.

## Outcome

- ✅ Impact: Created task card for Task data model implementation at .specify/memory/task-card-task-model.md
- 🧪 Tests: Defined required test functions for validation
- 📁 Files: 1 task card file created
- 🔁 Next prompts: Proceed with implementation or create additional task cards
- 🧠 Reflection: Task card provides clear implementation guidance for foundational component

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): Not applicable for task generation phase
- Prompt variant (if applicable): Standard task card generation
- Next experiment (smallest change to try): Implement the Task model as specified in the task card