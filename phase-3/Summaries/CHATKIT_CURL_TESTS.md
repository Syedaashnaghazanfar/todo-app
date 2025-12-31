# ChatKit API Endpoint Testing Guide

This document provides curl commands to test the `/api/chatkit` endpoint.

## Prerequisites

1. **Backend Server Running**: Ensure the FastAPI server is running on `http://localhost:8000`
2. **JWT Token**: You need a valid JWT token for authentication

## Generate JWT Token

```bash
cd phase-3/backend
python -c "
import sys
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

sys.path.insert(0, '.')
from src.utils.jwt import create_access_token

# Create a token for test user
token = create_access_token(user_id='1', email='test@example.com')
print(token)
"
```

## Test Commands

### Test 1: Create Thread and Add Task

```bash
JWT_TOKEN="your-jwt-token-here"

curl -X POST http://localhost:8000/api/chatkit \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "threads.create",
    "params": {
      "input": {
        "content": [
          {
            "type": "input_text",
            "text": "Add a task to buy groceries"
          }
        ],
        "attachments": [],
        "inference_options": {}
      }
    }
  }'
```

### Test 2: List All Tasks

```bash
curl -X POST http://localhost:8000/api/chatkit \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "threads.create",
    "params": {
      "input": {
        "content": [
          {
            "type": "input_text",
            "text": "Show me all my tasks"
          }
        ],
        "attachments": [],
        "inference_options": {}
      }
    }
  }'
```

### Test 3: Complete a Task

```bash
curl -X POST http://localhost:8000/api/chatkit \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "threads.create",
    "params": {
      "input": {
        "content": [
          {
            "type": "input_text",
            "text": "Mark task 1 as complete"
          }
        ],
        "attachments": [],
        "inference_options": {}
      }
    }
  }'
```

### Test 4: Delete a Task

```bash
curl -X POST http://localhost:8000/api/chatkit \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "threads.create",
    "params": {
      "input": {
        "content": [
          {
            "type": "input_text",
            "text": "Delete the groceries task"
          }
        ],
        "attachments": [],
        "inference_options": {}
      }
    }
  }'
```

### Test 5: Update a Task

```bash
curl -X POST http://localhost:8000/api/chatkit \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "threads.create",
    "params": {
      "input": {
        "content": [
          {
            "type": "input_text",
            "text": "Change task 2 title to Call doctor"
          }
        ],
        "attachments": [],
        "inference_options": {}
      }
    }
  }'
```

### Test 6: Authentication Test (Should Fail with 401)

```bash
curl -X POST http://localhost:8000/api/chatkit \
  -H "Content-Type: application/json" \
  -d '{
    "type": "threads.create",
    "params": {
      "input": {
        "content": [
          {
            "type": "input_text",
            "text": "This should fail without authentication"
          }
        ],
        "attachments": [],
        "inference_options": {}
      }
    }
  }'
```

## Expected Response Format

### Success Response (SSE Stream)

The endpoint returns Server-Sent Events (SSE) with streaming data:

```
data: {"type": "thread.message.delta", "delta": {"content": [{"type": "text", "text": "I've"}]}}
data: {"type": "thread.message.delta", "delta": {"content": [{"type": "text", "text": " added"}]}}
...
data: [DONE]
```

### Error Responses

**401 Unauthorized** (No/Invalid Token):
```json
{
  "detail": "Authentication required. Please login to access this resource."
}
```

**500 Internal Server Error** (Database/Processing Error):
```json
{
  "error": "Internal server error",
  "detail": "Error message here"
}
```

## Current Known Issues

### Issue 1: Datetime Timezone Handling

**Error**: `can't subtract offset-naive and offset-aware datetimes`

**Location**: `phase-3/backend/src/chatkit_server/store.py:129`

**Description**: The database is rejecting datetime values because of mixed timezone-aware and timezone-naive datetime objects.

**Status**: The endpoint is accepting requests correctly, but conversation persistence is failing due to this database issue.

## Testing Status

| Test Case | Endpoint Access | Authentication | Request Format | Database Persistence |
|-----------|----------------|----------------|----------------|---------------------|
| Create Thread + Add Task | ✅ 200 OK | ✅ Working | ✅ Correct | ❌ DateTime Error |
| List Tasks | ✅ 200 OK | ✅ Working | ✅ Correct | ❌ DateTime Error |
| Complete Task | ✅ 200 OK | ✅ Working | ✅ Correct | ❌ DateTime Error |
| Delete Task | ✅ 200 OK | ✅ Working | ✅ Correct | ❌ DateTime Error |
| Update Task | ✅ 200 OK | ✅ Working | ✅ Correct | ❌ DateTime Error |
| No Auth Test | ✅ 401 | ✅ Working | N/A | N/A |

## Troubleshooting

### Health Check

Verify the server is running:

```bash
curl http://localhost:8000/api/v1/health
```

Expected response:
```json
{"status":"healthy","service":"todo-app-backend"}
```

### Generate New JWT Token

If your token expires, generate a new one using the Python command above.

### Check Server Logs

Monitor the server output for detailed error messages:

```bash
# Server logs show detailed request processing and errors
tail -f phase-3/backend/server.log
```

## Next Steps

To fully resolve the issues and get the endpoint working end-to-end:

1. Fix the datetime timezone handling in `src/chatkit_server/store.py`
2. Ensure all datetime objects are either timezone-aware or timezone-naive consistently
3. Retest all endpoints after the fix

## Summary

The `/api/chatkit` endpoint is:
- ✅ Accessible and responding
- ✅ Accepting authentication correctly
- ✅ Processing the correct OpenAI ChatKit protocol format
- ❌ Experiencing database persistence issues (datetime handling)

The endpoint infrastructure is working correctly, and only the database persistence layer needs adjustment.
