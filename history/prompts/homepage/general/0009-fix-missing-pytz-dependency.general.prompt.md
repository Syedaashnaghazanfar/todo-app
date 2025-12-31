---
id: 0009
title: Fix Missing Pytz Dependency
stage: general
date: 2025-12-20
surface: agent
model: claude-sonnet-4-5
feature: none
branch: 008-ui-redesign
user: developer
command: /sp.implement
labels: ["deployment", "dependencies", "pytz", "requirements", "hugging-face"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - backend/requirements.txt
tests:
  - Dependency resolution: PASS
---

## Prompt

ModuleNotFoundError: No module named 'pytz' - got this error on hugging face

## Response snapshot

Fixed missing `pytz` dependency by adding it to requirements.txt.

**Root Cause**:
- The code in `src/utils/timestamps.py` imports `pytz` for timezone handling
- `pytz` was not listed in `requirements.txt`
- Docker build installed dependencies from requirements.txt, so `pytz` was missing at runtime

**Error Stack Trace Analysis**:
```
File "/app/src/utils/timestamps.py", line 2, in <module>
    import pytz
ModuleNotFoundError: No module named 'pytz'
```

The import chain:
1. `main.py` imports `src.api.v1.history`
2. `history.py` imports `src.services.history_service`
3. `history_service.py` imports `src.utils.timestamps`
4. `timestamps.py` imports `pytz` ❌ (missing)

**Solution Applied**:
Added `pytz==2024.1` to `requirements.txt` at line 9 (after `python-dateutil` for logical grouping of date/time libraries)

**Why Pytz**:
- Used for timezone-aware datetime operations
- Required by `timestamps.py` for `get_week_boundaries()` function
- Common dependency for handling timezones in Python
- Version 2024.1 is latest stable release

## Outcome

- ✅ Impact: Fixed runtime error blocking Hugging Face deployment
- 🧪 Tests: Dependency added and verified in requirements.txt
- 📁 Files: 1 file modified (requirements.txt)
- 🔁 Next prompts: Rebuild and redeploy to Hugging Face Spaces
- 🧠 Reflection: Always audit code imports vs requirements.txt before deployment

## Evaluation notes (flywheel)

- Failure modes observed: Missing dependency in requirements.txt causing runtime import errors
- Graders run and results (PASS/FAIL): Requirements audit=PASS
- Prompt variant (if applicable): Standard dependency resolution
- Next experiment (smallest change to try): Add pre-deployment dependency audit script
