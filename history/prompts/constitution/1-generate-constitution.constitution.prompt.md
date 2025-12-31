---
id: 1
title: Generate Constitution
stage: constitution
date: 2025-12-06
surface: agent
model: claude-sonnet-4-5-20250929
feature: none
branch: master
user: user
command: /sp.constitution
labels: [constitution,spec-driven-development,todo-app]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
 - .specify/memory/constitution.md
tests:
 - none
---

## Prompt

```
You are the Constitution Generator for the project:

"Phase I: Todo In-Memory Python Console Application"

Your task is to generate a complete, professional, production-grade PROJECT CONSTITUTION using Spec-Driven Development principles.

The constitution must strictly follow these rules:

1. PROJECT GOAL
Define the objective as:
- A command-line Todo application
- Fully in-memory (NO database, NO file persistence)
- Built using Python 3.13+
- Developed using Spec-Kit Plus and Claude Code
- Implements ONLY the 5 Basic CRUD-style features:
  - Add Task
  - View/List Tasks
  - Update Task
  - Delete Task
  - Mark Task Complete / Incomplete

2. SCOPE DEFINITION
Clearly separate:
- IN SCOPE (Phase I)
- OUT OF SCOPE (Anything related to databases, APIs, authentication, persistence, cloud deployment, UI frameworks, web apps)

3. FUNCTIONAL RULES
The constitution MUST enforce:
- Every task has:
  - Unique ID (auto-generated)
  - Title (required)
  - Description (optional)
  - Status (complete / incomplete)
- All data must be stored ONLY in program memory (RAM)
- Program must restart with a clean empty state
- All operations must be accessible via CLI commands

4. NON-FUNCTIONAL CONSTRAINTS
Strictly include:
- Clean Architecture
- Modular Python project structure
- PEP8 compliance
- Type hints required
- Unit testing required (pytest)
- No global mutable state
- Single responsibility per module
- No hardcoded test data in production code

5. TECHNOLOGY CONSTRAINTS
Explicitly lock:
- Python 3.13+
- Dependency management using UV
- Spec-Driven Development using Spec-Kit Plus
- Development assisted using Claude Code
- Rich library must be used for colorful CLI output

6. ACCEPTANCE CRITERIA
Define **explicit pass/fail acceptance rules** for:
- Add Task
- List Tasks
- Update Task
- Delete Task
- Mark Complete / Incomplete

Each must describe:
- Required command
- Expected behavior
- Expected in-memory state
- Failure conditions

7. REPOSITORY STRUCTURE REQUIREMENTS
The constitution MUST REQUIRE:
- /src directory for source code
- /specs directory for all specification history
- README.md for setup instructions
- CLAUDE.md for Claude Code usage rules
- Constitution file at root

8. TESTING & QUALITY GATES
Enforce:
- 100% feature test coverage for Phase I features
- CLI behavior tests
- In-memory state validation tests
- No merge allowed if tests fail

9. WRITING STYLE REQUIREMENTS
The output must be:
- Formal
- Contract-like
- Clear
- Deterministic
- Non-ambiguous
- Production-grade engineering tone

10. OUTPUT FORMAT
Return ONLY:
- A single complete PROJECT CONSTITUTION
- Written in clean Markdown
- With clear titled sections
- No commentary, no explanation, no analysis

❗ Do NOT include implementation code.
❗ Do NOT include future features.
❗ Do NOT include file contents.
❗ Do NOT include opinions.

Only return the finalized Constitution.
```

## Response snapshot

A complete PROJECT CONSTITUTION for the Todo In-Memory Python Console Application has been generated, containing:

- 6 Core Principles covering in-memory storage, CLI-first interface, test-first development, type safety, minimalist scope, and dependency management
- Functional Rules defining task structure and CLI commands
- Technology Constraints specifying Python 3.13+, UV, Rich library, and pytest
- Detailed Acceptance Criteria for all 5 CRUD operations
- Repository Structure Requirements
- Testing & Quality Gates with 100% coverage requirement
- Development Workflow guidelines
- Governance section

The constitution is formal, contract-like, and enforces all specified requirements for Phase I development.

## Outcome

- ✅ Impact: Created foundational project constitution at .specify/memory/constitution.md
- 🧪 Tests: No tests added yet, constitution phase
- 📁 Files: 1 file created (.specify/memory/constitution.md)
- 🔁 Next prompts: Proceed with feature specification based on constitution
- 🧠 Reflection: Constitution establishes clear boundaries and constraints for Phase I development

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): Not applicable for constitution phase
- Prompt variant (if applicable): Not applicable
- Next experiment (smallest change to try): Create Phase I feature specification