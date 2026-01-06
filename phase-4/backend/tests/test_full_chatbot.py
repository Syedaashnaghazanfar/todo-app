"""
Complete chatbot test - Auth + Chat
"""
import asyncio
import httpx
import json

BASE_URL = "http://localhost:8000"

async def test_full_chatbot():
    """Test complete chatbot flow with authentication"""

    print("="*60)
    print("PHASE 3 CHATBOT END-TO-END TEST")
    print("="*60 + "\n")

    async with httpx.AsyncClient(timeout=30.0) as client:
        # Step 1: Create a fresh test user
        import time
        test_email = f"chatbot_test_{int(time.time())}@example.com"
        test_password = "TestPassword123!"

        print("Step 1: Creating test user...")
        signup_url = f"{BASE_URL}/api/v1/auth/signup"
        signup_payload = {
            "email": test_email,
            "password": test_password,
            "full_name": "Chatbot Test User"
        }

        try:
            signup_response = await client.post(signup_url, json=signup_payload)

            if signup_response.status_code in [200, 201]:
                data = signup_response.json()
                token = data.get("token")  # Note: field is 'token', not 'access_token'
                print(f"[SUCCESS] User created successfully")
                print(f"Email: {test_email}")
                print(f"User ID: {data.get('user', {}).get('id')}")
                print(f"Token: {token[:50] if token else 'None'}...")
            else:
                print(f"[ERROR] Could not create user")
                print(f"Status: {signup_response.status_code}")
                print(f"Response: {signup_response.text}")
                return

        except Exception as e:
            print(f"[ERROR] Authentication failed: {e}")
            import traceback
            traceback.print_exc()
            return

        print("\n" + "="*60 + "\n")

        # Step 2: Test ChatKit endpoint
        print("Step 2: Testing ChatKit endpoint...")
        chat_url = f"{BASE_URL}/api/chatkit"

        # ChatKit protocol request (needs proper format)
        chat_headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {token}"
        }

        # ChatKit protocol: Create new thread with first message
        chat_payload = {
            "type": "threads.create",
            "params": {
                "message": {
                    "content": [{"type": "text", "text": "Add a task to buy groceries"}]
                }
            }
        }

        print(f"URL: {chat_url}")
        print(f"Payload: {json.dumps(chat_payload, indent=2)}")
        print()

        try:
            chat_response = await client.post(
                chat_url,
                json=chat_payload,
                headers=chat_headers
            )

            print(f"Status: {chat_response.status_code}")
            print(f"Headers: {dict(chat_response.headers)}\n")

            if chat_response.status_code == 200:
                print("[SUCCESS] ChatKit endpoint working!")
                print("\nResponse:")

                # Handle streaming
                if "text/event-stream" in chat_response.headers.get("content-type", ""):
                    print("[INFO] Received SSE stream:")
                    for line in chat_response.text.split('\n'):
                        if line.strip():
                            print(f"  {line}")
                else:
                    print(json.dumps(chat_response.json(), indent=2))

            else:
                print(f"[ERROR] ChatKit request failed")
                print(f"Response: {chat_response.text}")

        except Exception as e:
            print(f"[ERROR] ChatKit request exception: {e}")
            import traceback
            traceback.print_exc()

        print("\n" + "="*60)
        print("TEST COMPLETE")
        print("="*60)

if __name__ == "__main__":
    asyncio.run(test_full_chatbot())
