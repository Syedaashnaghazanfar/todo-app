# ChatKit API Curl Testing Guide

This guide shows how to test the `/api/chatkit` endpoint using curl commands based on the OpenAI ChatKit protocol shown in the API screenshot.

## Request Format (From Screenshot)

The endpoint expects requests in this format:

```json
{
  "type": "threads.create",
  "params": {
    "input": {
      "content": [
        {
          "type": "input_text",
          "text": "Your message text here"
        }
      ],
      "attachments": [],
      "inference_options": {}
    }
  }
}
```

## Field Explanations

### Required Fields:

1. **`type`**: Must be `"threads.create"` to create a new conversation thread
   - This is the operation type expected by ChatKit

2. **`params`**: Contains the input parameters
   - **`input`**: The user message object
     - **`content`**: Array of content items
       - **`type`**: `"input_text"` for text messages
       - **`text`**: Your actual message string (e.g., "Add a task to buy groceries")
     - **`attachments`**: Array of attachment IDs (empty array `[]` if none)
     - **`inference_options`**: Model configuration object (empty `{}` for defaults)

## Step-by-Step Testing

### Step 1: Get JWT Token

First, generate a valid JWT token:

```bash
cd phase-3/backend
python -c "
import sys
import os
from dotenv import load_dotenv

load_dotenv()
sys.path.insert(0, '.')
from src.utils.jwt import create_access_token

token = create_access_token(user_id='1', email='test@example.com')
print(token)
"
```

Copy the output token for use in the curl commands.

### Step 2: Test the Endpoint

#### Example 1: Add a Task

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

#### Example 2: List Tasks

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

#### Example 3: Complete a Task

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

#### Example 4: Delete a Task

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
            "text": "Delete task 2"
          }
        ],
        "attachments": [],
        "inference_options": {}
      }
    }
  }'
```

#### Example 5: Update a Task

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
            "text": "Change task 1 title to Call mom"
          }
        ],
        "attachments": [],
        "inference_options": {}
      }
    }
  }'
```

## Expected Response

The endpoint returns a Server-Sent Events (SSE) stream:

```
data: {"type": "thread.created", "thread": {"id": "thread_abc123", ...}}
data: {"type": "thread.message.delta", "delta": {"content": [{"type": "text", "text": "I've"}]}}
data: {"type": "thread.message.delta", "delta": {"content": [{"type": "text", "text": " added"}]}}
data: {"type": "thread.message.delta", "delta": {"content": [{"type": "text", "text": " the"}]}}
data: {"type": "thread.message.delta", "delta": {"content": [{"type": "text", "text": " task!"}]}}
data: [DONE]
```

## Common Placeholders from Screenshot

Based on the API screenshot, here are the placeholders you need to fill:

### In the Request Body:

1. **`"text": "{{MESSAGE}}"`** → Replace with your actual message
   - Example: `"text": "Add a task to buy groceries"`

2. **`"attachments": []`** → Leave as empty array if no attachments
   - Or add attachment IDs: `["attachment_id_1", "attachment_id_2"]`

3. **`"inference_options": {}`** → Leave as empty object for default settings
   - Or add options: `{"model": "gpt-4", "tool_choice": {"id": "tool_name"}}`

### In the Headers:

1. **`Authorization: Bearer {{JWT_TOKEN}}`** → Replace with your actual JWT token from Step 1

## Current Known Issue

As seen in the logs, there's a datetime timezone handling error in the database layer:

```
TypeError: can't subtract offset-naive and offset-aware datetimes
```

This occurs when trying to save conversations to the database. The endpoint accepts requests correctly but fails during persistence.

## Testing Checklist

- [x] Server is running on port 8000
- [x] JWT token is generated
- [x] Request format matches ChatKit protocol (`threads.create`)
- [x] Authentication headers are included
- [x] Endpoint returns 200 OK
- [ ] Database persistence works (currently failing due to datetime issue)

## Next Steps

1. Fix the datetime timezone handling in `src/chatkit_server/store.py`
2. Retest all endpoints after the fix
3. Verify conversations are persisted correctly
4. Test multi-turn conversations with the same thread_id
