#!/bin/bash

# ChatKit Endpoint Testing Script (Correct Format)
# Using OpenAI ChatKit protocol format

JWT_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIiwiZXhwIjoxNzY5MzUxNzE4LCJpYXQiOjE3NjY3NTk3MTgsImlzcyI6InRvZG9hcHAtYXBpIiwiYXVkIjoidG9kb2FwcC1jbGllbnQifQ.vxncNUwMVrJ-mWlHTEphCa2ul5YgJxsu95to4eCSJj4"

BASE_URL="http://localhost:8000"

echo "================================================"
echo "ChatKit Endpoint Testing (Correct Format)"
echo "================================================"
echo ""

# Test 1: Create thread and add task
echo "Test 1: Create Thread + Add Task"
echo "-----------------------------------"
echo "Request: Add a task to buy groceries"
echo ""
curl -X POST "$BASE_URL/api/chatkit" \
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

echo -e "\n\n"

# Test 2: List tasks in existing thread
echo "Test 2: List All Tasks"
echo "-----------------------------------"
echo "Request: Show me all my tasks"
echo ""
curl -X POST "$BASE_URL/api/chatkit" \
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

echo -e "\n\n"

# Test 3: Complete a task
echo "Test 3: Complete Task"
echo "-----------------------------------"
echo "Request: Mark task 1 as complete"
echo ""
curl -X POST "$BASE_URL/api/chatkit" \
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

echo -e "\n\n"

# Test 4: Delete a task
echo "Test 4: Delete Task"
echo "-----------------------------------"
echo "Request: Delete the groceries task"
echo ""
curl -X POST "$BASE_URL/api/chatkit" \
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

echo -e "\n\n"

# Test 5: Update a task
echo "Test 5: Update Task"
echo "-----------------------------------"
echo "Request: Change task 2 title to 'Call doctor'"
echo ""
curl -X POST "$BASE_URL/api/chatkit" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "threads.create",
    "params": {
      "input": {
        "content": [
          {
            "type": "input_text",
            "text": "Change task 2 title to '\''Call doctor'\''"
          }
        ],
        "attachments": [],
        "inference_options": {}
      }
    }
  }'

echo -e "\n\n"

echo "================================================"
echo "Testing Complete!"
echo "================================================"
