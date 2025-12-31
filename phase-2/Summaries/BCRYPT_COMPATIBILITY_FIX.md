# Bcrypt Compatibility Fix

## Problem

Backend was returning 500 Internal Server Error with this traceback:

```
(trapped) error reading bcrypt version
Traceback (most recent call last):
  File "...\passlib\handlers\bcrypt.py", line 620, in _load_backend_mixin
    version = _bcrypt.__about__.__version__
              ^^^^^^^^^^^^^^^^^
AttributeError: module 'bcrypt' has no attribute '__about__'
```

## Root Cause

1. **Passlib incompatibility**: `passlib` library expects `bcrypt.__about__.__version__` attribute
2. **Bcrypt 5.x API change**: bcrypt 5.0.0 removed the `__about__` module, breaking passlib
3. **We don't need passlib**: Our code (`auth_service.py`) uses bcrypt directly, not through passlib

## Solution

**Downgraded bcrypt to 4.1.3** (last version before breaking changes):

```bash
pip install bcrypt==4.1.3
```

**Updated requirements.txt**:
```
bcrypt==4.1.3  # Pin to 4.x for passlib compatibility
```

**Removed passlib dependency** (not needed - we use bcrypt directly):
```diff
- passlib[bcrypt]>=1.7.4
+ bcrypt==4.1.3
```

## Why This Works

- Bcrypt 4.1.3 has the `__about__` module that passlib expects
- Our auth_service.py calls bcrypt directly: `bcrypt.hashpw()`, `bcrypt.checkpw()`
- No code changes needed - just dependency version fix

## Installation Applied

Already installed bcrypt 4.1.3:
```
Successfully installed bcrypt-4.1.3
```

## Next Steps

**RESTART BACKEND SERVER** to clear the passlib error:

```bash
# Stop backend
pkill -f "python main.py"
# or find PID and kill it

# Start backend
cd backend
python main.py
```

## Verification

After restart, test signup:

```bash
curl -X POST http://localhost:8000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123"}'
```

**Expected**: 201 Created with JSON response (not 500 error)

## Files Modified

- `backend/requirements.txt` - Changed `passlib[bcrypt]>=1.7.4` to `bcrypt==4.1.3`
- Bcrypt downgraded from 5.0.0 to 4.1.3

## Note

The BetterAuth MCP HTML error is a separate issue - that will also be fixed by the empty BETTERAUTH_API_URL once the server restarts.
