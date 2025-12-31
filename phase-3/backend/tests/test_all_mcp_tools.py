"""
Test all MCP tools through chatbot.

Tests:
1. add_task - Add a task
2. list_tasks - List all tasks
3. complete_task - Mark task as complete
4. update_task - Update task title
5. delete_task - Delete a task
"""

import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:8000"

def send_chatbot_message(token, message):
    """Send message to chatbot and collect response."""

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

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    response = requests.post(
        f"{BASE_URL}/api/chatkit",
        json=payload,
        headers=headers,
        stream=True
    )

    print(f"\nRequest: {message}")
    print(f"Status: {response.status_code}")

    if response.status_code != 200:
        print(f"ERROR: {response.text}")
        return None

    # Collect streaming response
    assistant_response = ""
    for line in response.iter_lines():
        if line:
            line_str = line.decode('utf-8')
            if line_str.startswith("data: "):
                data_str = line_str[6:]
                try:
                    event = json.loads(data_str)
                    if event.get("type") == "thread.item.done":
                        item = event.get("item", {})
                        if item.get("type") == "assistant_message":
                            content = item.get("content", [])
                            if content:
                                assistant_response = content[0].get("text", "")
                except json.JSONDecodeError:
                    continue

    print(f"Response: {assistant_response}")
    return assistant_response


def main():
    print("=" * 80)
    print("TESTING ALL MCP TOOLS")
    print("=" * 80)

    # 1. Create user and authenticate
    print("\n[1] Creating test user...")
    timestamp = int(datetime.now().timestamp())
    test_email = f"mcp_test_{timestamp}@example.com"
    test_password = "TestPassword123!"

    signup_data = {
        "email": test_email,
        "password": test_password,
        "name": "MCP Test User"
    }

    response = requests.post(f"{BASE_URL}/api/v1/auth/signup", json=signup_data)
    if response.status_code != 201:
        print(f"ERROR: Signup failed - {response.text}")
        return

    auth_data = response.json()
    token = auth_data.get("token")
    user_id = auth_data.get("user", {}).get("id")
    print(f"[OK] User created: {user_id}")

    # 2. Test add_task
    print("\n" + "=" * 80)
    print("[2] Testing add_task MCP tool")
    print("=" * 80)
    send_chatbot_message(token, "Add a task to buy milk")
    send_chatbot_message(token, "Add another task to call dentist")

    # 3. Test list_tasks
    print("\n" + "=" * 80)
    print("[3] Testing list_tasks MCP tool")
    print("=" * 80)
    send_chatbot_message(token, "Show me all my tasks")
    send_chatbot_message(token, "List my pending tasks")
    send_chatbot_message(token, "What tasks do I have?")

    # 4. Test complete_task
    print("\n" + "=" * 80)
    print("[4] Testing complete_task MCP tool")
    print("=" * 80)
    send_chatbot_message(token, "Mark the milk task as complete")
    send_chatbot_message(token, "I finished buying milk")

    # 5. Test update_task
    print("\n" + "=" * 80)
    print("[5] Testing update_task MCP tool")
    print("=" * 80)
    send_chatbot_message(token, "Change the dentist task to 'Call dentist at 2pm'")
    send_chatbot_message(token, "Update the task title to 'Call dentist tomorrow'")

    # 6. Test delete_task
    print("\n" + "=" * 80)
    print("[6] Testing delete_task MCP tool")
    print("=" * 80)
    send_chatbot_message(token, "Delete the milk task")
    send_chatbot_message(token, "Remove the dentist task")

    # 7. Verify with list again
    print("\n" + "=" * 80)
    print("[7] Final verification - List tasks again")
    print("=" * 80)
    send_chatbot_message(token, "Show me all my tasks")

    print("\n" + "=" * 80)
    print("TEST COMPLETE - Check responses above")
    print("=" * 80)


if __name__ == "__main__":
    main()
