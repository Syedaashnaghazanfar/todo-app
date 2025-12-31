# chatkit/router.py
from agents import Agent, Runner
from agents.factory import create_model

async def handle_event(event: dict) -> dict:
    event_type = event.get("type")

    if event_type == "user_message":
        return await handle_user_message(event)

    if event_type == "action_invoked":
        return await handle_action(event)

    # Default: unsupported event
    return {
        "type": "message",
        "content": "Unsupported event type.",
        "done": True,
    }

async def handle_user_message(event: dict) -> dict:
    message = event.get("message", {})
    text = message.get("content", "")

    agent = Agent(
        name="chatkit-backend-agent",
        model=create_model(),
        instructions=(
            "You are the backend agent behind a ChatKit UI. "
            "Be concise and robust to malformed input."
        ),
    )
    result = Runner.run_sync(starting_agent=agent, input=text)

    return {
        "type": "message",
        "content": result.final_output,
        "done": True,
    }

async def handle_action(event: dict) -> dict:
    action_name = event.get("action", {}).get("name", "unknown")
    # Implement your own action handling here
    return {
        "type": "message",
        "content": f"Received action: {action_name}. No handler implemented yet.",
        "done": True,
    }
