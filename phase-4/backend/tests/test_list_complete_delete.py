"""
Quick test of list_tasks, complete_task, and delete_task MCP tools.
"""

import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:8000"

def send_chat(token, message):
    """Send message and return response."""
    payload = {
        "type": "threads.create",
        "params": {
            "input": {
                "content": [{"type": "input_text", "text": message}],
                "attachments": [],
                "inference_options": {}
            }
        }
    }

    response = requests.post(
        f"{BASE_URL}/api/chatkit",
        json=payload,
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
        stream=True,
        timeout=60
    )

    # Collect response
    for line in response.iter_lines():
        if line:
            line_str = line.decode('utf-8')
            if line_str.startswith("data: "):
                try:
                    event = json.loads(line_str[6:])
                    if event.get("type") == "thread.item.done":
                        item = event.get("item", {})
                        if item.get("type") == "assistant_message":
                            content = item.get("content", [])
                            if content:
                                return content[0].get("text", "")
                except:
                    continue
    return "No response"

# 1. Create user
print("Creating user...")
timestamp = int(datetime.now().timestamp())
signup_data = {
    "email": f"test_{timestamp}@example.com",
    "password": "TestPass123!",
    "name": "Test User"
}

response = requests.post(f"{BASE_URL}/api/v1/auth/signup", json=signup_data)
token = response.json().get("token")
print(f"Token: {token[:30]}...")

# 2. Add tasks
print("\n[TEST 1] Add two tasks")
print("=" * 60)
r1 = send_chat(token, "Add a task to buy milk")
print(f"Response 1: {r1}")
r2 = send_chat(token, "Add another task to call dentist")
print(f"Response 2: {r2}")

# 3. List tasks
print("\n[TEST 2] List all tasks")
print("=" * 60)
r3 = send_chat(token, "Show me all my tasks")
print(f"Response: {r3}")

# 4. Complete a task
print("\n[TEST 3] Complete a task")
print("=" * 60)
r4 = send_chat(token, "Mark the milk task as complete")
print(f"Response: {r4}")

# 5. List again to verify
print("\n[TEST 4] List tasks again to see completion")
print("=" * 60)
r5 = send_chat(token, "Show me my tasks")
print(f"Response: {r5}")

# 6. Delete a task
print("\n[TEST 5] Delete a task")
print("=" * 60)
r6 = send_chat(token, "Delete the dentist task")
print(f"Response: {r6}")

# 7. Final list
print("\n[TEST 6] Final task list")
print("=" * 60)
r7 = send_chat(token, "What tasks do I have left?")
print(f"Response: {r7}")

print("\n" + "=" * 60)
print("ALL TESTS COMPLETE")
print("=" * 60)
