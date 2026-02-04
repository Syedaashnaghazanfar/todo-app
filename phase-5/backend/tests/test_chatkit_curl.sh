#!/bin/bash

# ChatKit Endpoint Testing Script
# This script tests the /api/chatkit endpoint with various request formats

# Get JWT token
JWT_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIiwiZXhwIjoxNzY5MzUxNzE4LCJpYXQiOjE3NjY3NTk3MTgsImlzcyI6InRvZG9hcHAtYXBpIiwiYXVkIjoidG9kb2FwcC1jbGllbnQifQ.vxncNUwMVrJ-mWlHTEphCa2ul5YgJxsu95to4eCSJj4"

BASE_URL="http://localhost:8000"

echo "================================================"
echo "ChatKit Endpoint Testing"
echo "================================================"
echo ""

# Test 1: Simple message format
echo "Test 1: Simple message (Add task)"
echo "-----------------------------------"
curl -X POST "$BASE_URL/api/chatkit" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "input": [
      {
        "type": "message",
        "text": "Add a task to buy groceries"
      }
    ]
  }' \
  -v 2>&1 | grep -E "< HTTP|< Content-Type|data:|error"

echo ""
echo ""

# Test 2: List tasks
echo "Test 2: List tasks"
echo "-----------------------------------"
curl -X POST "$BASE_URL/api/chatkit" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "input": [
      {
        "type": "message",
        "text": "Show me all my tasks"
      }
    ]
  }' \
  -s

echo ""
echo ""

# Test 3: Thread continuation (multi-turn conversation)
echo "Test 3: Thread continuation"
echo "-----------------------------------"
curl -X POST "$BASE_URL/api/chatkit" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "thread_id": "thread_123",
    "input": [
      {
        "type": "message",
        "text": "Complete the first task"
      }
    ]
  }' \
  -s

echo ""
echo ""

# Test 4: Empty message (should handle gracefully)
echo "Test 4: Empty message handling"
echo "-----------------------------------"
curl -X POST "$BASE_URL/api/chatkit" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "input": []
  }' \
  -s

echo ""
echo ""

# Test 5: Without authentication (should fail with 401)
echo "Test 5: Without authentication (expect 401)"
echo "-----------------------------------"
curl -X POST "$BASE_URL/api/chatkit" \
  -H "Content-Type: application/json" \
  -d '{
    "input": [
      {
        "type": "message",
        "text": "This should fail"
      }
    ]
  }' \
  -s

echo ""
echo "================================================"
echo "Testing Complete"
echo "================================================"
