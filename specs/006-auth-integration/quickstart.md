# Quickstart: Authentication Integration

**Feature**: 006-auth-integration
**Date**: 2025-12-15
**Target Audience**: Developers implementing or reviewing authentication integration

## Overview

This guide provides step-by-step instructions for setting up, implementing, and testing the authentication integration feature. Follow these steps in order to integrate BetterAuth authentication with user-scoped data access.

---

## Prerequisites

### Required Software
- Python 3.8+ (backend)
- Node.js 20+ (frontend)
- PostgreSQL (NeonDB account)
- Git

### Required Tools
- BetterAuth MCP server (installation covered in Step 1)
- Alembic (database migrations)
- pytest (backend testing)
- Jest (frontend testing)

### Environment Setup
- Backend environment variables configured (`.env` file)
- Frontend environment variables configured (`.env.local` file)
- NeonDB database connection string available

---

## Step 1: Install BetterAuth MCP Server

**Check if BetterAuth MCP is installed**:
```bash
# Check MCP configuration
cat .mcp.json | grep betterauth
```

**If not installed**, user approval is required per constitution:
> "This requires installing BetterAuth MCP server. Should I proceed?"

**Installation command** (after user approval):
```bash
npm install -g @betterauth/mcp-server
# or
npx @betterauth/mcp-server init
```

**Verify installation**:
```bash
betterauth --version
```

---

## Step 2: Backend Setup

### 2.1 Install Python Dependencies

```bash
cd backend

# Add new auth dependencies to requirements.txt
echo "python-jose[cryptography]>=3.3.0" >> requirements.txt
echo "passlib[bcrypt]>=1.7.4" >> requirements.txt
echo "betterauth-sdk>=1.0.0" >> requirements.txt

# Install dependencies
pip install -r requirements.txt
# or with uv (if using)
uv pip install -r requirements.txt
```

### 2.2 Configure Environment Variables

Add to `backend/.env`:
```env
# Existing variables
DATABASE_URL=postgresql://user:password@host/database
APP_PORT=8000
FRONTEND_URL=http://localhost:3000

# NEW: Authentication variables
JWT_SECRET=your-super-secret-jwt-key-min-32-chars-long
JWT_ALGORITHM=HS256
JWT_EXPIRY_DAYS=30

# NEW: BetterAuth configuration
BETTERAUTH_API_URL=http://localhost:3001  # BetterAuth MCP server URL
BETTERAUTH_DATABASE_URL=${DATABASE_URL}   # Same as app database
```

**Generate JWT secret**:
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### 2.3 Run Database Migration

```bash
cd backend

# Create migration
alembic revision -m "add user_id columns to tasks and history"

# Migration file will be in alembic/versions/
# Edit the generated file to add:
# - user_id columns to tasks and history tables
# - Foreign key constraints to users table
# - Indexes on user_id columns

# Run migration
alembic upgrade head

# Verify migration
psql $DATABASE_URL -c "\d tasks"  # Should show user_id column
psql $DATABASE_URL -c "\d history"  # Should show user_id column
```

### 2.4 Create Backend Files

**New files to create** (see `data-model.md` and `plan.md` for details):
- `src/models/user.py` - User model
- `src/models/session.py` - Session model
- `src/schemas/auth.py` - Auth request/response schemas
- `src/schemas/user.py` - User response schema
- `src/services/auth_service.py` - BetterAuth integration
- `src/middleware/jwt_auth.py` - JWT validation middleware
- `src/utils/jwt.py` - JWT encoding/decoding utilities
- `src/api/v1/auth.py` - Auth endpoints (signup, login, logout)
- `src/api/deps.py` - JWT dependency injection

**Files to modify**:
- `src/models/task.py` - Add user_id field
- `src/models/history.py` - Add user_id field
- `src/services/task_service.py` - Add user_id filtering
- `src/services/history_service.py` - Add user_id filtering
- `src/services/stats_service.py` - Add user_id filtering
- `src/api/v1/tasks.py` - Use `Depends(get_current_user_id)`
- `src/api/v1/history.py` - Use `Depends(get_current_user_id)`
- `src/api/v1/stats.py` - Use `Depends(get_current_user_id)`

### 2.5 Start Backend Server

```bash
cd backend
python main.py
# or
uvicorn main:app --reload --port 8000
```

**Verify backend**:
```bash
curl http://localhost:8000/docs  # OpenAPI documentation
# Should see new /auth/signup, /auth/login, /auth/logout endpoints
```

---

## Step 3: Frontend Setup

### 3.1 Install Node Dependencies

```bash
cd frontend/todo-app

# SweetAlert2 already installed
# No new dependencies needed (using existing tools)
npm install
```

### 3.2 Configure Environment Variables

Add to `frontend/todo-app/.env.local`:
```env
# Existing
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1

# NEW: Auth-specific (optional, defaults handled in code)
NEXT_PUBLIC_SESSION_DURATION_DAYS=30
```

### 3.3 Create Frontend Files

**New directories**:
- `app/login/` - Login page
- `app/signup/` - Signup page
- `components/auth/` - Auth-specific components
- `contexts/` - Authentication context
- `hooks/` - Auth hooks
- `services/authApi.ts` - Auth API client
- `types/auth.ts` - Auth TypeScript types

**New files to create**:
- `app/login/page.tsx` - Login page with purple theme
- `app/signup/page.tsx` - Signup page with purple theme
- `components/auth/LoginForm.tsx` - Login form component
- `components/auth/SignupForm.tsx` - Signup form component
- `components/auth/LogoutButton.tsx` - Logout button
- `components/shared/ProtectedRoute.tsx` - Route protection HOC
- `contexts/AuthContext.tsx` - Auth state management
- `hooks/useAuth.tsx` - Authentication hook
- `hooks/useProtectedRoute.tsx` - Route protection hook
- `services/authApi.ts` - Auth API functions
- `types/auth.ts` - User, AuthState, Session types
- `middleware.ts` - Next.js middleware for route protection

**Files to modify**:
- `app/layout.tsx` - Wrap with AuthProvider, add logout button
- `app/tasks/page.tsx` - Add `useProtectedRoute()` hook
- `app/analytics/page.tsx` - Add `useProtectedRoute()` hook
- `app/history/page.tsx` - Add `useProtectedRoute()` hook
- `services/api.ts` - Add `credentials: 'include'` to all requests

### 3.4 Start Frontend Dev Server

```bash
cd frontend/todo-app
npm run dev
```

**Verify frontend**:
- Navigate to http://localhost:3000
- Should see homepage (public)
- Navigate to http://localhost:3000/login
- Should see purple-themed login page
- Navigate to http://localhost:3000/signup
- Should see purple-themed signup page

---

## Step 4: Testing

### 4.1 Backend Tests

```bash
cd backend

# Run existing tests (should still pass - backward compatibility)
pytest tests/ -v

# Run new auth tests
pytest tests/test_auth.py -v
pytest tests/test_jwt_middleware.py -v
pytest tests/test_authorization.py -v  # Multi-user isolation tests

# Run all tests
pytest tests/ -v --cov=src
```

**Expected results**:
- All 40+ existing tests pass (no regressions)
- New auth endpoint tests pass
- Multi-user isolation tests pass (0 cross-user data access)

### 4.2 Frontend Tests

```bash
cd frontend/todo-app

# Run existing tests
npm test

# Run new auth component tests
npm test -- --testPathPattern=auth
```

### 4.3 Manual Integration Testing

**Test Scenario 1: User Registration**
1. Navigate to http://localhost:3000/signup
2. Enter valid email (e.g., test@example.com) and password (8+ chars)
3. Click "Sign Up"
4. **Expected**: SweetAlert2 success "Account created successfully! Welcome to TodoApp."
5. **Expected**: Redirected to /tasks page
6. **Expected**: Empty task list (new user)

**Test Scenario 2: User Login**
1. Logout if logged in
2. Navigate to http://localhost:3000/login
3. Enter registered email and password
4. Click "Log In"
5. **Expected**: SweetAlert2 success "Welcome back!"
6. **Expected**: Redirected to /tasks page
7. **Expected**: See tasks created by this user (if any)

**Test Scenario 3: Protected Routes**
1. Open private/incognito browser window
2. Navigate to http://localhost:3000/tasks
3. **Expected**: Redirected to /login
4. **Expected**: No task data visible

**Test Scenario 4: User Isolation**
1. Create User A account (userA@example.com)
2. Create 3 tasks as User A
3. Logout
4. Create User B account (userB@example.com)
5. Navigate to /tasks
6. **Expected**: No tasks visible (User B doesn't see User A's tasks)
7. Create 2 tasks as User B
8. Logout
9. Login as User A
10. **Expected**: See only User A's 3 tasks (not User B's tasks)

**Test Scenario 5: Session Persistence**
1. Login as any user
2. Close browser completely
3. Reopen browser
4. Navigate to http://localhost:3000/tasks
5. **Expected**: Still logged in (no redirect to /login)
6. **Expected**: Tasks visible immediately

**Test Scenario 6: Logout**
1. Login as any user
2. Click logout button in navigation
3. **Expected**: SweetAlert2 success "You have been logged out successfully"
4. **Expected**: Redirected to /login
5. Navigate to /tasks
6. **Expected**: Redirected to /login (no longer authenticated)

---

## Step 5: Deployment Preparation

### 5.1 Environment Variables for Production

**Backend (.env for production)**:
```env
DATABASE_URL=<production-neondb-url>
JWT_SECRET=<long-random-secret-min-32-chars>
JWT_ALGORITHM=HS256
JWT_EXPIRY_DAYS=30
BETTERAUTH_API_URL=<production-betterauth-url>
FRONTEND_URL=https://todoapp.vercel.app
```

**Frontend (Vercel environment variables)**:
```env
NEXT_PUBLIC_API_URL=https://api.todoapp.com/api/v1
```

### 5.2 Security Checklist

- [ ] JWT_SECRET is strong (32+ random characters)
- [ ] JWT_SECRET is different between dev and production
- [ ] HTTPS enforced in production (httpOnly cookie secure flag)
- [ ] CORS configured to allow only production frontend URL
- [ ] Database has SSL mode enabled (NeonDB default)
- [ ] Alembic migration ran successfully in production database
- [ ] BetterAuth MCP server is running in production
- [ ] No passwords or secrets committed to git

### 5.3 Performance Verification

Run these checks in production:
```bash
# Check JWT validation overhead
curl -w "@curl-format.txt" -o /dev/null -s \
  -H "Cookie: auth_token=<valid-token>" \
  https://api.todoapp.com/api/v1/tasks

# Expected: Total time < 250ms (incl. network + JWT validation <50ms)
```

---

## Step 6: Troubleshooting

### Issue: "BetterAuth MCP server not found"
**Solution**:
1. Verify installation: `betterauth --version`
2. Check `.mcp.json` configuration
3. Restart MCP server
4. Check user approved installation

### Issue: "JWT token invalid"
**Solution**:
1. Check JWT_SECRET matches between backend and BetterAuth
2. Verify token not expired (30 days)
3. Check cookie is being sent (browser dev tools → Application → Cookies)
4. Verify httpOnly flag not blocking JavaScript access (intended behavior)

### Issue: "User sees other user's tasks"
**Solution**:
1. **CRITICAL SECURITY BUG** - Fix immediately
2. Check all endpoints have `user_id: str = Depends(get_current_user_id)`
3. Verify service methods filter by user_id: `WHERE user_id = user_id_param`
4. Run multi-user isolation tests: `pytest tests/test_authorization.py -v`

### Issue: "Session lost on page refresh"
**Solution**:
1. Check cookie maxAge is set (30 days = 2592000 seconds)
2. Verify SameSite=Lax (not Strict - breaks navigation)
3. Check AuthContext checks auth on mount (`useEffect` with empty deps)
4. Verify credentials: 'include' in all fetch requests

### Issue: "Migration failed: user_id column already exists"
**Solution**:
```bash
# Rollback migration
alembic downgrade -1

# Check current schema
psql $DATABASE_URL -c "\d tasks"

# Delete migration file if corrupted
rm alembic/versions/{timestamp}_add_user_id_columns.py

# Recreate migration
alembic revision -m "add user_id columns to tasks and history"
# Edit generated file
alembic upgrade head
```

---

## Step 7: Next Steps

After successfully completing this quickstart:

1. **Run `/sp.tasks`** to generate implementation tasks
2. **Assign sub-agents**:
   - database-expert: Database migration
   - backend-expert: Backend auth endpoints and middleware
   - auth-expert: BetterAuth integration
   - frontend-expert: Login/signup pages and route protection
   - fullstack-architect: Integration testing coordination
3. **Begin implementation** following task order in `tasks.md`
4. **Run tests frequently** to catch regressions early
5. **Deploy to staging** before production

---

## Additional Resources

- **Specification**: [spec.md](./spec.md) - Full feature requirements
- **Technical Plan**: [plan.md](./plan.md) - Architecture decisions
- **Research**: [research.md](./research.md) - Technology choices and rationale
- **Data Model**: [data-model.md](./data-model.md) - Entity definitions and relationships
- **API Contracts**: [contracts/auth-api.yaml](./contracts/auth-api.yaml) - OpenAPI spec
- **JWT Schema**: [contracts/jwt-schema.json](./contracts/jwt-schema.json) - Token payload structure

---

## Support

For issues or questions:
1. Check troubleshooting section above
2. Review constitution: `.specify/memory/constitution.md`
3. Consult MCP server documentation
4. Run test suite to identify specific failures
