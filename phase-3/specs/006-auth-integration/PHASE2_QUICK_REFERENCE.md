# Phase 2 Quick Reference Guide

**For Phase 3+ Developers**: This guide provides quick access to Phase 2 implementations.

## Models Location

### User Model
```python
# backend/src/models/user.py
from src.models import User

# Fields: id, email, password_hash, created_at, updated_at
# Relationships: tasks, sessions, history
```

### Session Model
```python
# backend/src/models/session.py
from src.models import Session

# Fields: id, user_id, jwt_token, expires_at, created_at, last_used_at
# Relationship: user
```

### Task Model (Updated)
```python
# backend/src/models/task.py
from src.models import Task

# New field: user_id (String, nullable, FK to users.id, indexed)
# New relationship: user (back_populates="tasks")
```

### History Model (Updated)
```python
# backend/src/models/task_history.py
from src.models import TaskHistory

# New field: user_id (String, nullable, FK to users.id, indexed)
# New relationship: user (back_populates="history")
```

## Schemas Location

### Auth Schemas
```python
# backend/src/schemas/auth.py
from src.schemas import SignupRequest, LoginRequest, AuthResponse, LogoutResponse

# SignupRequest: email (EmailStr), password (min 8 chars)
# LoginRequest: email (EmailStr), password (str)
# AuthResponse: message (str), user (dict)
# LogoutResponse: message (str)
```

### User Schema
```python
# backend/src/schemas/user.py
from src.schemas import UserResponse

# UserResponse: id (str), email (EmailStr), created_at (datetime)
# SECURITY: NO password_hash field
```

## JWT Utilities

### Basic Usage
```python
# backend/src/utils/jwt.py
from src.utils.jwt import create_access_token, decode_token, get_user_id_from_token

# Create token
token = create_access_token(user_id="uuid-string", email="user@example.com")

# Decode token (with caching)
payload = decode_token(token)  # Returns dict with sub, email, exp, iat, iss, aud

# Extract user_id
user_id = get_user_id_from_token(token)  # Returns "uuid-string"
```

### Advanced Functions
```python
from src.utils.jwt import get_email_from_token, is_token_expired, clear_token_cache

# Get email
email = get_email_from_token(token)

# Check expiry (no exception)
expired = is_token_expired(token)  # Returns True/False

# Clear cache (testing/security)
clear_token_cache()
```

### JWT Caching Details
- **Cache Type**: TTLCache from cachetools
- **TTL**: 5 minutes (300 seconds)
- **Max Size**: 1000 tokens
- **Cache Hit**: <5ms
- **Cache Miss**: ~40ms (includes decode + validate)
- **Invalid tokens**: NOT cached

## Environment Variables

Required in `backend/.env`:
```bash
JWT_SECRET="your-32-char-secret"  # Generate with: python -c "import secrets; print(secrets.token_urlsafe(32))"
JWT_ALGORITHM="HS256"
JWT_EXPIRY_DAYS=30
BETTERAUTH_API_URL="https://mcp.chonkie.ai/better-auth/better-auth-builder/mcp"
BETTERAUTH_DATABASE_URL="postgresql://..."
```

## JWT Token Payload

Per `contracts/jwt-schema.json`:
```json
{
  "sub": "user-uuid",           // Required - User ID
  "email": "user@example.com",  // Optional - User email
  "exp": 1734595200,            // Required - Expiration (Unix timestamp)
  "iat": 1732003200,            // Required - Issued at (Unix timestamp)
  "iss": "todoapp-api",         // Optional - Issuer
  "aud": "todoapp-client"       // Optional - Audience
}
```

## Import Patterns

### Models
```python
# Option 1: Import from package
from src.models import User, Session, Task, TaskHistory

# Option 2: Import specific model
from src.models.user import User
from src.models.session import Session
```

### Schemas
```python
# Option 1: Import from package
from src.schemas import SignupRequest, LoginRequest, AuthResponse, UserResponse

# Option 2: Import specific schema
from src.schemas.auth import SignupRequest, LoginRequest
from src.schemas.user import UserResponse
```

### JWT Utils
```python
# Import functions directly
from src.utils.jwt import (
    create_access_token,
    decode_token,
    get_user_id_from_token,
    get_email_from_token,
    is_token_expired,
    clear_token_cache
)
```

## Database Relationships

### User → Tasks (One-to-Many)
```python
user = session.query(User).filter_by(id=user_id).first()
tasks = user.tasks  # List of Task objects
```

### User → Sessions (One-to-Many)
```python
user = session.query(User).filter_by(id=user_id).first()
sessions = user.sessions  # List of Session objects
```

### User → History (One-to-Many)
```python
user = session.query(User).filter_by(id=user_id).first()
history = user.history  # List of TaskHistory objects
```

### Task → User (Many-to-One)
```python
task = session.query(Task).filter_by(id=task_id).first()
user = task.user  # User object or None
```

## Common Patterns for Phase 3+

### Creating a JWT Token (Signup/Login)
```python
from src.utils.jwt import create_access_token

# After successful authentication
token = create_access_token(user_id=user.id, email=user.email)

# Set httpOnly cookie in response
response.set_cookie(
    key="auth_token",
    value=token,
    httponly=True,
    secure=True,  # Production only
    samesite="lax",
    max_age=2592000  # 30 days in seconds
)
```

### Validating a JWT Token (Protected Endpoints)
```python
from src.utils.jwt import decode_token, get_user_id_from_token
from jose import JWTError

try:
    # Get token from cookie
    token = request.cookies.get("auth_token")

    # Decode and validate (with caching)
    payload = decode_token(token)
    user_id = payload["sub"]

    # Or use helper function
    user_id = get_user_id_from_token(token)

except JWTError:
    raise HTTPException(status_code=401, detail="Invalid or expired token")
```

### User-Scoped Query (Phase 6)
```python
# Query tasks for authenticated user only
tasks = session.query(Task).filter(
    Task.user_id == user_id,
    Task.user_id.isnot(None)  # Exclude legacy data
).all()

# Query history for authenticated user only
history = session.query(TaskHistory).filter(
    TaskHistory.user_id == user_id,
    TaskHistory.user_id.isnot(None)
).order_by(TaskHistory.timestamp.desc()).all()
```

### Creating User-Owned Task (Phase 6)
```python
# Automatically assign user_id from JWT
new_task = Task(
    title=task_data.title,
    description=task_data.description,
    user_id=user_id  # From JWT token
)
session.add(new_task)
session.commit()
```

### Authorization Check (Phase 6)
```python
# Verify task ownership before update/delete
task = session.query(Task).filter_by(id=task_id).first()

if not task:
    raise HTTPException(status_code=404, detail="Task not found")

if task.user_id != user_id:
    raise HTTPException(status_code=403, detail="Access forbidden")

# Proceed with update/delete
```

## Error Handling

### JWT Errors
```python
from jose import JWTError, ExpiredSignatureError

try:
    payload = decode_token(token)
except ExpiredSignatureError:
    # Token expired
    raise HTTPException(status_code=401, detail="Token expired")
except JWTError as e:
    # Invalid signature, malformed, etc.
    raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")
```

### Validation Errors (Pydantic)
```python
from pydantic import ValidationError

try:
    signup_data = SignupRequest(**request_body)
except ValidationError as e:
    # Invalid email format, password too short, etc.
    raise HTTPException(status_code=400, detail=str(e))
```

## Testing Utilities

### Generate Test JWT Token
```python
from src.utils.jwt import create_access_token

# Create token for testing
test_token = create_access_token(
    user_id="test-user-uuid",
    email="test@example.com"
)
```

### Clear JWT Cache (Testing)
```python
from src.utils.jwt import clear_token_cache

# Clear cache before/after tests
clear_token_cache()
```

### Check Token Expiry (Testing)
```python
from src.utils.jwt import is_token_expired

# Non-throwing expiry check
expired = is_token_expired(token)
assert not expired
```

## Phase 3 Checklist

Before starting Phase 3 (User Registration), verify:
- ✅ User and Session models exist
- ✅ Task and History models have user_id field
- ✅ Auth schemas (SignupRequest, LoginRequest, AuthResponse, LogoutResponse) exist
- ✅ UserResponse schema exists (NO password_hash)
- ✅ JWT utilities work (create_access_token, decode_token)
- ✅ JWT caching enabled (5-minute TTL)
- ✅ Environment variables configured (JWT_SECRET, JWT_ALGORITHM, JWT_EXPIRY_DAYS)
- ✅ All Python files compile without errors

## Support

For Phase 2 implementation details, see:
- `specs/006-auth-integration/data-model.md` - Entity definitions
- `specs/006-auth-integration/contracts/jwt-schema.json` - JWT payload structure
- `specs/006-auth-integration/plan.md` - Architecture decisions
- `PHASE2_BACKEND_COMPLETION_SUMMARY.md` - Detailed completion report

---

**Quick Start for Phase 3**: All foundational infrastructure is ready. You can now implement user registration (signup endpoint + frontend) using the models, schemas, and JWT utilities provided in Phase 2.
