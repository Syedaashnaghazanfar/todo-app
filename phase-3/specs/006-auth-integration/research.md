# Research: Authentication Integration with BetterAuth

**Date**: 2025-12-15
**Feature**: 006-auth-integration
**Phase**: 0 - Outline & Research

## Overview

This document consolidates research findings for integrating BetterAuth authentication with NeonDB PostgreSQL backend, implementing JWT-based session management, and adding user-scoped authorization to the TodoApp.

## Research Areas

### 1. BetterAuth Integration Patterns

**Decision**: Use BetterAuth MCP server for authentication operations with FastAPI backend integration

**Rationale**:
- BetterAuth provides battle-tested authentication flows (signup, login, logout, session management)
- MCP server architecture enables clean separation between auth provider and application logic
- NeonDB PostgreSQL integration is native to BetterAuth
- Reduces custom security code (password hashing, session management, token generation)
- Constitution mandates MCP server usage when available

**Alternatives Considered**:
1. **Custom JWT implementation with FastAPI-Users**:
   - Rejected: Violates spec constraint "MUST use BetterAuth MCP server exclusively"
   - Higher security risk (custom crypto implementation)
   - More code to maintain

2. **Auth0/Firebase Auth**:
   - Rejected: External dependency, not self-hosted
   - Doesn't integrate with existing NeonDB database
   - Additional cost for hosted service

3. **Passport.js with Node backend**:
   - Rejected: Requires replacing FastAPI backend (out of scope)
   - Tech stack inconsistency

**Implementation Pattern**:
```python
# Backend: BetterAuth MCP client integration
from betterauth import BetterAuthClient

auth_client = BetterAuthClient(
    database_url=os.getenv("DATABASE_URL"),  # NeonDB connection
    jwt_secret=os.getenv("JWT_SECRET"),
    session_duration_days=30
)

# Signup
user = await auth_client.signup(email, password)

# Login
session = await auth_client.login(email, password)
token = session.jwt_token

# Validate token
user_id = await auth_client.verify_jwt(token)
```

---

### 2. JWT Token Storage and Transmission

**Decision**: Store JWT in httpOnly cookies, transmit via Authorization header for API requests

**Rationale**:
- **httpOnly cookies**: Prevents XSS attacks (JavaScript cannot access token)
- **Secure flag**: HTTPS-only transmission in production
- **SameSite=Lax**: CSRF protection while allowing top-level navigation
- Industry best practice for web applications (OWASP recommended)
- Spec constraint: "MUST store JWT in httpOnly cookie - not localStorage"

**Alternatives Considered**:
1. **localStorage**:
   - Rejected: Vulnerable to XSS attacks (spec explicitly forbids)
   - Any injected script can steal token

2. **sessionStorage**:
   - Rejected: Doesn't persist across tabs (poor UX)
   - Still vulnerable to XSS

3. **In-memory only**:
   - Rejected: Lost on page refresh (breaks session persistence requirement)

**Implementation Pattern**:
```python
# Backend: Set httpOnly cookie on login
from fastapi import Response

def set_auth_cookie(response: Response, jwt_token: str):
    response.set_cookie(
        key="auth_token",
        value=jwt_token,
        httponly=True,
        secure=True,  # HTTPS only in production
        samesite="lax",
        max_age=30 * 24 * 60 * 60  # 30 days
    )
```

```typescript
// Frontend: Cookie automatically included in requests
// No manual token handling needed
fetch('/api/v1/tasks', {
  credentials: 'include'  // Send cookies
})
```

---

### 3. FastAPI JWT Middleware Architecture

**Decision**: Implement dependency injection-based JWT validation using FastAPI's Depends system

**Rationale**:
- FastAPI's dependency injection provides clean separation of concerns
- Reusable across all protected endpoints
- Automatic OpenAPI documentation integration
- Type-safe user_id extraction
- Consistent error handling (401 for missing/invalid token)

**Alternatives Considered**:
1. **Global middleware**:
   - Rejected: Harder to exclude public endpoints (/login, /signup)
   - Less granular control

2. **Decorator pattern**:
   - Rejected: Not idiomatic FastAPI (FastAPI uses Depends)
   - Harder to compose with other dependencies

3. **Manual validation in each endpoint**:
   - Rejected: Code duplication, error-prone

**Implementation Pattern**:
```python
# src/api/deps.py
from fastapi import Depends, HTTPException, Cookie
from jose import jwt, JWTError

async def get_current_user_id(
    auth_token: str = Cookie(None)
) -> str:
    """Extract and validate user_id from JWT token."""
    if not auth_token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    try:
        payload = jwt.decode(auth_token, SECRET_KEY, algorithms=["HS256"])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user_id
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Usage in endpoints
@router.get("/tasks")
async def get_tasks(user_id: str = Depends(get_current_user_id)):
    tasks = await task_service.get_user_tasks(user_id)
    return tasks
```

---

### 4. Database Schema Migration Strategy

**Decision**: Use Alembic migration with nullable user_id columns for backward compatibility

**Rationale**:
- Existing tasks/history data has no user association (created before auth)
- Nullable user_id allows graceful migration without data loss
- New records enforce NOT NULL constraint via application logic
- Maintains existing 40+ test suite (backward compatibility requirement)

**Alternatives Considered**:
1. **NOT NULL with default user**:
   - Rejected: Misleading data (old tasks attributed to fake user)
   - Violates data integrity

2. **Delete existing data**:
   - Rejected: Data loss unacceptable

3. **Separate tables for auth**:
   - Rejected: Breaks existing API contracts
   - Requires massive refactoring

**Implementation Pattern**:
```python
# alembic/versions/{timestamp}_add_user_id_columns.py
from alembic import op
import sqlalchemy as sa

def upgrade():
    # Add nullable user_id columns
    op.add_column('tasks',
        sa.Column('user_id', sa.String(36), nullable=True))
    op.add_column('history',
        sa.Column('user_id', sa.String(36), nullable=True))

    # Add foreign key constraints
    op.create_foreign_key(
        'fk_tasks_user_id', 'tasks', 'users',
        ['user_id'], ['id'], ondelete='CASCADE'
    )
    op.create_foreign_key(
        'fk_history_user_id', 'history', 'users',
        ['user_id'], ['id'], ondelete='CASCADE'
    )

def downgrade():
    op.drop_constraint('fk_tasks_user_id', 'tasks')
    op.drop_constraint('fk_history_user_id', 'history')
    op.drop_column('tasks', 'user_id')
    op.drop_column('history', 'user_id')
```

---

### 5. Frontend Authentication State Management

**Decision**: Use React Context API for global auth state, custom hooks for auth operations

**Rationale**:
- React Context is built-in (no additional dependencies)
- Sufficient for auth state (user, isAuthenticated, loading)
- Custom hooks (useAuth) provide clean API for components
- Integrates well with Next.js App Router
- Avoids Redux/Zustand complexity for simple auth state

**Alternatives Considered**:
1. **Redux Toolkit**:
   - Rejected: Overkill for simple auth state
   - Additional bundle size
   - Already have SweetAlert2, TailwindCSS, Recharts - avoid more deps

2. **Zustand**:
   - Rejected: Auth state is hierarchical (Context pattern fits better)
   - One more dependency

3. **Local component state**:
   - Rejected: Prop drilling nightmare (auth needed in many components)
   - Difficult to share across routes

**Implementation Pattern**:
```typescript
// contexts/AuthContext.tsx
import { createContext, useContext, useState, useEffect } from 'react';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthState & AuthActions>(null);

export function AuthProvider({ children }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    loading: true
  });

  useEffect(() => {
    // Check auth status on mount
    checkAuthStatus();
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// hooks/useAuth.tsx
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
```

---

### 6. Next.js Route Protection Patterns

**Decision**: Combine Next.js middleware for initial redirect + useEffect check in pages for client-side protection

**Rationale**:
- **Middleware**: Fast server-side redirect (no page flash)
- **useEffect check**: Handle client-side navigation, detect expired sessions
- Two-layer protection prevents UI flicker and unauthorized access
- Works with Next.js 16 App Router

**Alternatives Considered**:
1. **Middleware only**:
   - Rejected: Doesn't catch client-side navigation (e.g., Link clicks)
   - Session expiry during active use not handled

2. **HOC (Higher-Order Component)**:
   - Rejected: Not idiomatic Next.js 13+ (App Router uses layouts)
   - Harder to compose

3. **Server Components only**:
   - Rejected: Doesn't handle client-side state changes (logout, session expiry)

**Implementation Pattern**:
```typescript
// middleware.ts (Next.js middleware)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token');
  const { pathname } = request.nextUrl;

  // Protected routes
  const protectedRoutes = ['/tasks', '/analytics', '/history'];
  const isProtected = protectedRoutes.some(route => pathname.startsWith(route));

  if (isProtected && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Redirect authenticated users away from auth pages
  if (token && (pathname === '/login' || pathname === '/signup')) {
    return NextResponse.redirect(new URL('/tasks', request.url));
  }

  return NextResponse.next();
}

// hooks/useProtectedRoute.tsx (client-side check)
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './useAuth';

export function useProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);
}
```

---

### 7. SweetAlert2 Integration for Auth Feedback

**Decision**: Create auth-specific SweetAlert2 wrapper functions for consistent messaging

**Rationale**:
- SweetAlert2 already integrated in project (no new dependency)
- Purple theme customization matches existing UI
- Consistent messaging across all auth operations (spec defines 6 scenarios)
- Better UX than native alerts or toast notifications

**Implementation Pattern**:
```typescript
// utils/authAlerts.ts
import Swal from 'sweetalert2';

const authSwal = Swal.mixin({
  customClass: {
    confirmButton: 'bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded',
    cancelButton: 'bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded ml-2'
  },
  buttonsStyling: false
});

export const authAlerts = {
  signupSuccess: () => authSwal.fire({
    icon: 'success',
    title: 'Account Created!',
    text: 'Welcome to TodoApp.',
    confirmButtonText: 'Get Started'
  }),

  loginSuccess: () => authSwal.fire({
    icon: 'success',
    title: 'Welcome Back!',
    timer: 2000,
    showConfirmButton: false
  }),

  loginError: () => authSwal.fire({
    icon: 'error',
    title: 'Login Failed',
    text: 'Invalid email or password',
    confirmButtonText: 'Try Again'
  }),

  sessionExpired: () => authSwal.fire({
    icon: 'warning',
    title: 'Session Expired',
    text: 'Please log in again.',
    confirmButtonText: 'Log In'
  })
};
```

---

### 8. Performance Considerations

**Decision**: Implement JWT validation caching with 5-minute TTL to reduce database lookups

**Rationale**:
- JWT validation requires database query to check user existence/status
- Caching reduces load on NeonDB (important for serverless PostgreSQL)
- 5-minute TTL balances performance vs. security (user deletion takes max 5 min to propagate)
- Meets performance constraint: "<50ms JWT validation overhead" (SC-008)

**Alternatives Considered**:
1. **No caching**:
   - Rejected: Every request hits database (high latency, high NeonDB cost)
   - Fails SC-008 performance requirement

2. **Long TTL (30 min)**:
   - Rejected: Security risk (deleted users stay authenticated up to 30 min)

3. **Redis cache**:
   - Rejected: Additional infrastructure complexity
   - Serverless deployment constraint (Vercel/Railway)

**Implementation Pattern**:
```python
# In-memory cache with TTL
from cachetools import TTLCache

user_cache = TTLCache(maxsize=1000, ttl=300)  # 5 minutes

async def get_current_user_id_cached(token: str) -> str:
    if token in user_cache:
        return user_cache[token]

    user_id = await verify_jwt_and_check_db(token)
    user_cache[token] = user_id
    return user_id
```

---

## Summary of Key Decisions

| Decision Area | Choice | Primary Rationale |
|---------------|--------|-------------------|
| Auth Provider | BetterAuth MCP server | Constitution compliance, security, NeonDB integration |
| Token Storage | httpOnly cookies | XSS protection, spec requirement |
| Backend Pattern | FastAPI Depends injection | Type-safe, idiomatic, reusable |
| Database Migration | Nullable user_id with Alembic | Backward compatibility, data preservation |
| Frontend State | React Context + custom hooks | Simple, sufficient, no extra deps |
| Route Protection | Middleware + useEffect | Two-layer security, no UI flash |
| User Feedback | SweetAlert2 wrapper | Consistent, purple-themed, already integrated |
| Performance | JWT validation caching (5min TTL) | Meets <50ms overhead requirement |

---

## Risk Mitigation

1. **BetterAuth MCP unavailability**:
   - Mitigation: Check MCP installation before implementation
   - Fallback: Request user approval for installation
   - Documented in constitution check

2. **Session expiry during active use**:
   - Mitigation: Global 401 interceptor in API client
   - SweetAlert2 notification + redirect to /login
   - Covered in edge cases (spec line 117)

3. **Database migration failure**:
   - Mitigation: Alembic rollback script included
   - Test migration on dev database first
   - Nullable columns prevent data loss

4. **Performance degradation**:
   - Mitigation: JWT validation caching (5min TTL)
   - Performance tests for <50ms overhead
   - Monitor NeonDB query latency

---

## Next Steps

Phase 0 research complete. Proceed to:
- **Phase 1**: Generate data-model.md (User, Session, updated Task/History entities)
- **Phase 1**: Generate API contracts in `/contracts/` (OpenAPI specs)
- **Phase 1**: Generate quickstart.md (developer setup guide)
- **Phase 1**: Update agent context with new technologies
