# ChatKit Custom Backend — Python Examples

These examples support the `openai-chatkit-backend-python` Skill.
They are **patterns**, not drop‑in production code, but they are close to
runnable and show realistic structure.

---

## Example 1 — Minimal FastAPI ChatKit Backend (Non‑Streaming)

```python
# main.py
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from agents.factory import create_model
from agents import Agent, Runner

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/chatkit/api")
async def chatkit_api(request: Request):
    # 1) Auth (simplified)
    auth_header = request.headers.get("authorization")
    if not auth_header:
        return {"error": "Unauthorized"}, 401

    # 2) Parse ChatKit event
    event = await request.json()
    user_message = event.get("message", {}).get("content") or ""

    # 3) Run agent through Agents SDK
    agent = Agent(
        name="simple-backend-agent",
        model=create_model(),
        instructions=(
            "You are the backend agent behind a ChatKit UI. "
            "Answer clearly in a single paragraph."
        ),
    )
    result = Runner.run_sync(starting_agent=agent, input=user_message)

    # 4) Map to ChatKit-style response (simplified)
    return {
        "type": "message",
        "content": result.final_output,
        "done": True,
    }
```

---

## Example 2 — FastAPI Backend with Streaming (SSE‑like)

```python
# streaming_backend.py
from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse
from agents.factory import create_model
from agents import Agent, Runner

app = FastAPI()

def agent_stream(user_text: str):
    # In a real implementation, you might use an async generator
    # and partial tokens from the Agents SDK. Here we fake steps.
    yield "data: {"partial": "Thinking..."}\n\n"

    agent = Agent(
        name="streaming-agent",
        model=create_model(),
        instructions="Respond in short sentences suitable for streaming.",
    )
    result = Runner.run_sync(starting_agent=agent, input=user_text)

    yield f"data: {{"final": "{result.final_output}", "done": true}}\n\n"

@app.post("/chatkit/api")
async def chatkit_api(request: Request):
    event = await request.json()
    user_text = event.get("message", {}).get("content", "")

    return StreamingResponse(
        agent_stream(user_text),
        media_type="text/event-stream",
    )
```

---

## Example 3 — Backend with a Tool (ERP Employee Lookup)

```python
# agents/tools/erp_tools.py
from pydantic import BaseModel
from agents import function_tool

class EmployeeLookup(BaseModel):
    emp_id: int

@function_tool
def get_employee(data: EmployeeLookup):
    # In reality, query your ERP or DB here.
    if data.emp_id == 7:
        return {"id": 7, "name": "Zeeshan", "status": "active"}
    return {"id": data.emp_id, "name": "Unknown", "status": "not_found"}
```

```python
# agents/support_agent.py
from agents import Agent
from agents.factory import create_model
from agents.tools.erp_tools import get_employee

def build_support_agent() -> Agent:
    return Agent(
        name="erp-support",
        model=create_model(),
        instructions=(
            "You are an ERP support agent. "
            "Use tools to fetch employee or order data when needed."
        ),
        tools=[get_employee],
    )
```

```python
# chatkit/router.py
from agents import Runner
from agents.support_agent import build_support_agent

async def handle_user_message(event: dict) -> dict:
    text = event.get("message", {}).get("content", "")
    agent = build_support_agent()
    result = Runner.run_sync(starting_agent=agent, input=text)

    return {
        "type": "message",
        "content": result.final_output,
        "done": True,
    }
```

---

## Example 4 — Multi‑Agent Router Pattern

```python
# agents/router_agent.py
from agents import Agent
from agents.factory import create_model

def build_router_agent() -> Agent:
    return Agent(
        name="router",
        model=create_model(),
        instructions=(
            "You are a router agent. Decide which specialist should handle "
            "the query. Reply with exactly one of: "
            ""billing", "tech", or "general"."
        ),
    )
```

```python
# chatkit/router.py
from agents import Runner
from agents.router_agent import build_router_agent
from agents.billing_agent import build_billing_agent
from agents.tech_agent import build_tech_agent
from agents.general_agent import build_general_agent

def route_to_specialist(user_text: str):
    router = build_router_agent()
    route_result = Runner.run_sync(starting_agent=router, input=user_text)
    choice = (route_result.final_output or "").strip().lower()

    if "billing" in choice:
        return build_billing_agent()
    if "tech" in choice:
        return build_tech_agent()
    return build_general_agent()

async def handle_user_message(event: dict) -> dict:
    text = event.get("message", {}).get("content", "")
    agent = route_to_specialist(text)
    result = Runner.run_sync(starting_agent=agent, input=text)
    return {"type": "message", "content": result.final_output, "done": True}
```

---

## Example 5 — File Upload Endpoint for Direct Uploads

```python
# chatkit/upload.py
from fastapi import UploadFile
from uuid import uuid4
from pathlib import Path

UPLOAD_ROOT = Path("uploads")

async def handle_upload(file: UploadFile):
    UPLOAD_ROOT.mkdir(exist_ok=True)
    suffix = Path(file.filename).suffix
    target_name = f"{uuid4().hex}{suffix}"
    target_path = UPLOAD_ROOT / target_name

    with target_path.open("wb") as f:
        f.write(await file.read())

    # In real life, you might upload to S3 or another CDN instead
    public_url = f"https://cdn.example.com/{target_name}"
    return {"url": public_url}
```

```python
# main.py (excerpt)
from fastapi import UploadFile
from chatkit.upload import handle_upload

@app.post("/chatkit/api/upload")
async def chatkit_upload(file: UploadFile):
    return await handle_upload(file)
```

---

## Example 6 — Using Gemini via OpenAI‑Compatible Endpoint

```python
# agents/factory.py
import os
from agents import OpenAIChatCompletionsModel, AsyncOpenAI

def create_model():
    provider = os.getenv("LLM_PROVIDER", "openai").lower()

    if provider == "gemini":
        client = AsyncOpenAI(
            api_key=os.getenv("GEMINI_API_KEY"),
            base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
        )
        return OpenAIChatCompletionsModel(
            model=os.getenv("GEMINI_DEFAULT_MODEL", "gemini-2.5-flash"),
            openai_client=client,
        )

    # Default: OpenAI
    client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    return OpenAIChatCompletionsModel(
        model=os.getenv("OPENAI_DEFAULT_MODEL", "gpt-4.1-mini"),
        openai_client=client,
    )
```

---

## Example 7 — Injecting User/Tenant Context into Agent

```python
# chatkit/router.py (excerpt)
from agents import Agent, Runner
from agents.factory import create_model

async def handle_user_message(event: dict, user_id: str, tenant_id: str, role: str):
    text = event.get("message", {}).get("content", "")

    instructions = (
        f"You are a support agent for tenant {tenant_id}. "
        f"The current user is {user_id} with role {role}. "
        "Never reveal data from other tenants. "
        "Respect the user's role for access control."
    )

    agent = Agent(
        name="tenant-aware-support",
        model=create_model(),
        instructions=instructions,
    )

    result = Runner.run_sync(starting_agent=agent, input=text)
    return {"type": "message", "content": result.final_output, "done": True}
```

These patterns together cover most real-world scenarios for a **ChatKit
custom backend in Python** with the Agents SDK.
