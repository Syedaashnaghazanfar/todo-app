---
id: 15
title: read-project-structure
stage: general
date: 2025-12-14
surface: agent
model: gemini-2.0-flash-exp
feature: none
branch: 003-validate-backend
user: user
command: read_project
labels: ["onboarding", "read", "structure"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
 - history/prompts/general/15-read-project-structure.general.prompt.md
tests:

---

## Prompt

hey can u read my project

## Response snapshot

Read README.md, PROJECT-STRUCTURE.md, and CLAUDE.md to understand the project structure and guidelines. The project is a Hackathon II Todo App using SDD, Next.js, FastAPI, and other tools.

## Outcome

- ✅ Impact: Understood project structure and mandates.
- 🧪 Tests: N/A
- 📁 Files: Read key documentation files.
- 🔁 Next prompts: Await user instructions.
- 🧠 Reflection: Project follows strict SDD and PHR recording rules.

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): PASS
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): N/A
