"""
Test chat endpoint to verify ChatKit integration
"""
import asyncio
import httpx
import json

async def test_chat():
    """Test the chat endpoint"""

    # Chat endpoint URL (ChatKit protocol endpoint)
    url = "http://localhost:8000/api/chatkit"

    # Test message - ask to add a task (ChatKit protocol format)
    payload = {
        "type": "user_message",
        "message": {
            "content": [{"type": "text", "text": "Add a task to buy groceries"}]
        }
    }

    headers = {
        "Content-Type": "application/json",
        # Add mock authorization if needed
        "Authorization": "Bearer test-token"
    }

    print("Testing chat endpoint...")
    print(f"URL: {url}")
    print(f"Payload: {json.dumps(payload, indent=2)}")
    print("\n" + "="*60 + "\n")

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(url, json=payload, headers=headers)

            print(f"Status Code: {response.status_code}")
            print(f"Response Headers: {dict(response.headers)}")
            print("\n" + "="*60 + "\n")

            if response.status_code == 200:
                print("[SUCCESS] Chat endpoint is working!")
                print("\nResponse:")

                # Handle streaming response
                if "text/event-stream" in response.headers.get("content-type", ""):
                    print("Streaming response:")
                    for line in response.text.split('\n'):
                        if line.strip():
                            print(line)
                else:
                    print(json.dumps(response.json(), indent=2))
            else:
                print(f"[ERROR] Status {response.status_code}")
                print(f"Response: {response.text}")

    except Exception as e:
        print(f"[EXCEPTION] {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_chat())
