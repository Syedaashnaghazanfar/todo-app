"""
Test ALL MCP tools through chatbot.
"""

import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:8000"

def send_chat(token, message):
    """Send message and return assistant response."""
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
print("Creating test user...")
timestamp = int(datetime.now().timestamp())
signup_data = {
    "email": f"mcp_test_{timestamp}@example.com",
    "password": "TestPass123!",
    "name": "MCP Test User"
}

response = requests.post(f"{BASE_URL}/api/v1/auth/signup", json=signup_data)
token = response.json().get("token")
print(f"User created! Token: {token[:30]}...")

# 2. Add tasks
print("\n" + "="*70)
print("[TEST 1] add_task - Add two tasks")
print("="*70)
r1 = send_chat(token, "Add a task to buy milk")
print(f"Response: {r1}")
r2 = send_chat(token, "Add another task to call dentist")
print(f"Response: {r2}")

# 3. List tasks
print("\n" + "="*70)
print("[TEST 2] list_tasks - Show all tasks")
print("="*70)
r3 = send_chat(token, "Show me all my tasks")
print(f"Response: {r3}")

# 4. Complete a task
print("\n" + "="*70)
print("[TEST 3] complete_task - Mark milk as complete")
print("="*70)
r4 = send_chat(token, "Mark the milk task as complete")
print(f"Response: {r4}")

# 5. List pending tasks
print("\n" + "="*70)
print("[TEST 4] list_tasks (pending) - Show pending tasks")
print("="*70)
r5 = send_chat(token, "What tasks are still pending?")
print(f"Response: {r5}")

# 6. Update a task
print("\n" + "="*70)
print("[TEST 5] update_task - Update dentist task title")
print("="*70)
r6 = send_chat(token, "Change the dentist task to 'Call dentist at 2pm'")
print(f"Response: {r6}")

# 7. Set priority
print("\n" + "="*70)
print("[TEST 6] set_priority - Set high priority")
print("="*70)
r7 = send_chat(token, "Set the dentist task to high priority")
print(f"Response: {r7}")

# 8. Delete a task
print("\n" + "="*70)
print("[TEST 7] delete_task - Delete a task")
print("="*70)
r8 = send_chat(token, "Delete the dentist task")
print(f"Response: {r8}")

# 9. Final list
print("\n" + "="*70)
print("[TEST 8] list_tasks - Final task list")
print("="*70)
r9 = send_chat(token, "Show me all remaining tasks")
print(f"Response: {r9}")

# Summary
print("\n" + "="*70)
print("TEST SUMMARY")
print("="*70)
print(f"add_task:      {'PASS' if r1 and 'added' in r1 else 'FAIL'}")
print(f"add_task 2:    {'PASS' if r2 and 'added' in r2 else 'FAIL'}")
print(f"list_tasks:    {'PASS' if r3 and 'task' in r3.lower() else 'FAIL'}")
print(f"complete_task: {'PASS' if r4 and 'complete' in r4.lower() else 'FAIL'}")
print(f"list_pending:  {'PASS' if r5 and 'task' in r5.lower() else 'FAIL'}")
print(f"update_task:   {'PASS' if r6 and 'update' in r6.lower() else 'FAIL'}")
print(f"set_priority:  {'PASS' if r7 and 'priority' in r7.lower() else 'FAIL'}")
print(f"delete_task:   {'PASS' if r8 and 'delete' in r8.lower() else 'FAIL'}")
print(f"final_list:    {'PASS' if r9 and 'task' in r9.lower() else 'FAIL'}")
print("="*70)
