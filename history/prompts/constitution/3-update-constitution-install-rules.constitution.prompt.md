---
id: 3
title: Update Constitution Install Rules
stage: constitution
date: 2025-12-10
surface: agent
model: Claude Haiku 4.5
feature: none
branch: master
user: user
command: /sp.constitution
labels: [constitution, installation, environment]
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

-----------------------

🧠 INTELLIGENT INSTALLATION & ENV HANDLING RULES

-----------------------



The agent must follow a strict human-in-the-loop installation policy.

This ensures safety, transparency, reproducibility, and minimized token usage.



These rules affect BACKEND, FRONTEND, and ENVIRONMENT VARIABLES.



-----------------------------------------------------------

1. USER IS ALWAYS RESPONSIBLE FOR INSTALLATION

-----------------------------------------------------------

The user performs all installation steps unless they explicitly give permission.



The agent:

- MUST NOT install packages automatically.

- MUST NOT run shell commands automatically.

- MUST NOT assume installation is correct without verification.



Instead, the agent will:

- Inspect the project by reading `pyproject.toml`, `uv.lock`, `package.json`, and installed files.

- Detect missing or incorrect dependencies.

- Report mismatches to the user.

- Ask for explicit permission before installing anything.



-----------------------------------------------------------

2. PERMISSION-BASED INSTALLATION WORKFLOW

-----------------------------------------------------------

If the agent detects a missing backend Python dependency:



Workflow:

1. The agent says:

   "Dependency <NAME> is missing. Should I install it using UV?"

2. The user replies:

   - "Yes, install"

   - or "No, skip"

3. If permission is granted:

   The agent may output the command:

   uv add <package>



The same workflow applies to frontend dependencies using npm:

   npm install <package>



-----------------------------------------------------------

3. ENVIRONMENT VARIABLE INTELLIGENCE

-----------------------------------------------------------

The agent may analyze:

- `.env`

- `.env.example`

- backend config files

- frontend config files



The agent may:

- Detect missing environment variables

- Suggest missing ones

- Auto-generate non-secret default variables



The agent MAY NOT:

- Create or modify sensitive variables (e.g., passwords, tokens)



The agent MAY:

- Safely fill generic/public variables in `.env.example`

- Suggest proper formatting for user secrets



ENV rules:

- User manually sets sensitive keys.

- Agent may auto-fill variables that are safe, public, or structural.



Examples of variables the agent MAY auto-generate:

- NEXT_PUBLIC_API_BASE_URL (from project URL)

- APP_ENV ("development")

- DEBUG ("true")



Variables the agent MAY NOT auto-generate:

- DATABASE_URL

- SECRET keys

- Tokens



-----------------------------------------------------------

4. INSTALLATION VERIFICATION LOGIC

-----------------------------------------------------------

The agent must verify:



Backend:

- pyproject.toml → declared dependencies

- uv.lock → installed dependencies

- /backend/app → code imports



Frontend:

- package.json → declared dependencies

- node_modules/ → installed dependencies

- component imports



If mismatch is detected:

- Agent must report exact missing packages

- Ask for permission before fixing



-----------------------------------------------------------

5. CODE GENERATION ALWAYS ASSUMES CORRECT INSTALLATION

-----------------------------------------------------------

Even if dependencies are missing, the agent must still:

- Generate valid backend code

- Generate valid frontend code

- Tell the user what to install



The agent cannot block code generation due to missing installations.



-----------------------------------------------------------

6. ENVIRONMENT VARIABLE VERIFICATION LOGIC

-----------------------------------------------------------

The agent must check:

- If required env vars exist

- Whether frontend env vars match backend env vars

- Whether `.env.example` has the correct placeholder values



Workflow:

- Agent identifies missing keys

- Agent tells you EXACTLY what is missing

- Agent auto-writes `.env.example` entries

- Agent may request permission before modifying `.env`



-----------------------------------------------------------

7. SUMMARY OF AGENT PERMISSIONS

-----------------------------------------------------------



AGENT CAN:

- Inspect dependency files

- Identify missing packages

- Recommend installations

- Ask for permission

- Write `.env.example`

- Suggest environment variables

- Insert safe/public variables automatically



AGENT CANNOT:

- Install anything without permission

- Write sensitive secrets

- Assume correct installations

- Modify `.env` without asking



These rules are STRICT and must be followed in the entire Phase 2.



End of Intelligent Installation & ENV Handling Rules.

## Response snapshot

Based on the user input about installation and environment handling rules, I've updated the project constitution to include these important guidelines. Here's what was done:

1. Added a new principle (VIII) titled "Intelligent Installation and Environment Handling" that incorporates all the rules specified in the user input.

2. Updated the version number from 1.1.0 to 1.2.0 following semantic versioning (MINOR version bump since a new principle was added).

3. Updated the version history to document the change.

4. Updated the Sync Impact Report at the top of the constitution file to reflect the changes made and identify templates that may need review.

The new principle VIII contains all the important guidelines about:
- Human-in-the-loop installation policy
- User responsibility for installations
- Permission-based installation workflow
- Environment variable intelligence
- Installation verification logic
- Code generation assumptions
- Environment variable verification logic
- Agent permissions and restrictions

This ensures that all future development work will follow the strict installation and environment handling policies specified by the user.

## Outcome

- ✅ Impact: Enhanced constitution with new installation and environment handling rules
- 🧪 Tests: none
- 📁 Files: .specify/memory/constitution.md updated
- 🔁 Next prompts: Ready for further development work following new constitution
- 🧠 Reflection: Constitution now properly reflects the required installation and environment handling policies

## Evaluation notes (flywheel)

- Failure modes observed: none
- Graders run and results (PASS/FAIL): PASS
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): N/A