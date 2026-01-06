"""Test list_tasks MCP tool"""
import requests
import json

BASE_URL = "http://localhost:8000"

# Create user
response = requests.post(f"{BASE_URL}/api/v1/auth/signup", json={
    "email": f"test_{int(__import__('time').time())}@example.com",
    "password": "TestPass123!",
    "name": "Test"
})
token = response.json().get("token")

# Send list request
payload = {
    "type": "threads.create",
    "params": {
        "input": {
            "content": [{"type": "input_text", "text": "Show me all my tasks"}],
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
    timeout=45
)

for line in response.iter_lines():
    if line and line.decode('utf-8').startswith("data: "):
        try:
            event = json.loads(line.decode('utf-8')[6:])
            if event.get("type") == "thread.item.done":
                item = event.get("item", {})
                if item.get("type") == "assistant_message":
                    content = item.get("content", [])
                    if content:
                        print(f"Response: {content[0].get('text', '')}")
        except:
            pass
