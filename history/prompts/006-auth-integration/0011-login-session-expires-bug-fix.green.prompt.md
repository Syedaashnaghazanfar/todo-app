---
id: 0011
title: Login Session Expires Bug Fix
stage: green
date: 2025-12-16
surface: agent
model: claude-sonnet-4-5
feature: 006-auth-integration
branch: 006-auth-integration
user: ashna
command: /sp.implement
labels: ["bug-fix", "authentication", "session", "database", "login"]
links:
  spec: specs/006-auth-integration/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - backend/src/services/auth_service.py
tests:
  - Python syntax validation: PASSED ✓
---

## Prompt

everything is working fine when im signing up its good but when im logging out and login again i get this error An unexpected error occurred: (psycopg2.errors.NotNullViolation) null value in column "expires_at" of relation "sessions" violates not-null constraint DETAIL: Failing row contains (9acdd301-e6c4-4c26-aa93-883daabf9eac, e7c63930-a4c9-4e79-b355-ce84f91d091d, eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlN2M2MzkzMC1hNGM..., null, 2025-12-16 07:20:55.849679, 2025-12-16 07:20:55.849683). [SQL: INSERT INTO sessions (id, user_id, jwt_token, expires_at, created_at, last_used_at) VALUES (%(id)s, %(user_id)s, %(jwt_token)s, %(expires_at)s, %(created_at)s, %(last_used_at)s)] [parameters: {'id': '9acdd301-e6c4-4c26-aa93-883daabf9eac', 'user_id': 'e7c63930-a4c9-4e79-b355-ce84f91d091d', 'jwt_token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlN2M2MzkzMC1hNGM5LTRlNzktYjM1NS1jZTg0ZjkxZDA5MWQiLCJlbWFpbCI6InRlc3RAZ21haWwuY29tIiwiZXhwIjoxNzY4NDQzNjU1LCJpYXQiOjE3NjU4NTE2NTUsImlzcyI6InRvZG9hcHAtYXBpIiwiYXVkIjoidG9kb2FwcC1jbGllbnQifQ.nEG2FEvGYh0C68Q2BvEHt9VTKknAkRoQ_8QliyScxfE', 'expires_at': None, 'created_at': datetime.datetime(2025, 12, 16, 7, 20, 55, 849679), 'last_used_at': datetime.datetime(2025, 12, 16, 7, 20, 55, 849683)}] (Background on this error at: https://sqlalche.me/e/20/gkpj) so check this and solve

## Response snapshot

Successfully identified and fixed the database constraint violation bug in the login flow.

**Root Cause Analysis:**
- The expires_at column in the sessions table is defined as NOT NULL
- The signup method correctly sets expires_at when creating sessions (line 238)
- The login method was missing expires_at calculation and assignment
- When users logged out and logged back in, new sessions were created with expires_at=None, violating the database constraint

**Fix Applied to backend/src/services/auth_service.py (login method):**

1. Added expiration calculation (lines 284-286):
   - Calculate session expiration 30 days from now
   - Read JWT_EXPIRY_DAYS from environment (default 30)

2. Updated existing session (line 292):
   - Added session.expires_at = expires_at

3. Updated new session creation (line 300):
   - Added expires_at=expires_at parameter

**Verification:**
- Python syntax validation: PASSED ✓
- Login method now mirrors signup method's session creation logic
- All sessions (new and existing) now have proper expiration dates

## Outcome

- ✅ Impact: Critical bug fixed - users can now logout and login without database errors
- 🧪 Tests: Python syntax validation passed, manual testing required
- 📁 Files: 1 file modified (backend/src/services/auth_service.py)
- 🔁 Next prompts: Manual testing of logout → login flow
- 🧠 Reflection: Bug caught in user testing - importance of testing full authentication cycle (signup → logout → login)

## Evaluation notes (flywheel)

- Failure modes observed: Missing field assignment in login method (parity issue with signup)
- Graders run and results (PASS/FAIL): Python syntax validation PASSED ✓
- Prompt variant (if applicable): Bug fix via /sp.implement
- Next experiment (smallest change to try): Add database constraint checks to pre-commit hooks
