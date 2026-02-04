"""
Simplified chatbot test - just create thread and send message
"""
import asyncio
import httpx
import json

async def test_chat():
    """Simple test"""

    async with httpx.AsyncClient(timeout=30.0) as client:
        # Create user
        signup = await client.post(
            "http://localhost:8000/api/v1/auth/signup",
            json={
                "email": f"test_{int(__import__('time').time())}@test.com",
                "password": "Test123!",
                "full_name": "Test"
            }
        )

        if signup.status_code not in [200, 201]:
            print(f"Signup failed: {signup.status_code} - {signup.text}")
            return

        token = signup.json().get("token")
        print(f"[OK] Got token: {token[:30]}...")

        # Try ChatKit with minimal payload
        headers = {"Authorization": f"Bearer {token}"}

        # ChatKit protocol format - complete structure
        payload = {
            "type": "threads.create",
            "params": {
                "input": {
                    "content": [{"type": "input_text", "text": "Add a task to buy groceries"}],
                    "attachments": [],
                    "inference_options": {}
                }
            }
        }

        print(f"\nTesting: {json.dumps(payload, indent=2)}\n")

        resp = await client.post(
            "http://localhost:8000/api/chatkit",
            json=payload,
            headers=headers,
            timeout=60.0
        )

        print(f"Status: {resp.status_code}")

        if resp.status_code == 200:
            print("[SUCCESS]")
            if "text/event-stream" in resp.headers.get("content-type", ""):
                print("\nSSE Stream:")
                for line in resp.text.split('\n')[:50]:  # First 50 lines
                    if line.strip():
                        print(f"  {line}")
            else:
                print(f"\nResponse: {resp.text[:500]}")
        else:
            print(f"[FAILED] {resp.text[:500]}")

if __name__ == "__main__":
    asyncio.run(test_chat())
