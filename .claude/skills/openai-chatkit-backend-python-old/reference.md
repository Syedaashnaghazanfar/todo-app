# ChatKit Custom Backend — Python Reference

This document supports the `openai-chatkit-backend-python` Skill.
It standardizes how you implement and reason about a **custom ChatKit backend**
in Python, powered by the **OpenAI Agents SDK** (and optionally Gemini via an
OpenAI-compatible endpoint).

Use this as the **high-authority reference** for:
- Folder structure and separation of concerns
- Environment variables and model factory behavior
- Expected HTTP endpoints for ChatKit
- How ChatKit events are handled in the backend
- How to integrate Agents SDK (agents, tools, runners)
- Streaming, auth, security, and troubleshooting

---

## 1. Recommended Folder Structure

A clean project structure keeps ChatKit transport logic separate from the
Agents SDK logic and business tools.

```text
backend/
  main.py                # FastAPI / Flask / Django entry
  env.py                 # env loading, settings
  chatkit/
    __init__.py
    router.py            # ChatKit event routing + handlers
    upload.py            # Upload endpoint helpers
    streaming.py         # SSE helpers (optional)
    types.py             # Typed helpers for ChatKit events (optional)
  agents/
    __init__.py
    factory.py           # create_model() lives here
    base_agent.py        # base configuration or utilities
    support_agent.py     # example specialized agent
    tools/
      __init__.py
      db_tools.py        # DB-related tools
      erp_tools.py       # ERP-related tools
```

**Key idea:**  
- `chatkit/` knows about HTTP requests/responses and ChatKit event shapes.  
- `agents/` knows about models, tools, and reasoning.  
- Nothing in `agents/` should know that ChatKit exists.

---

## 2. Environment Variables & Model Factory Contract

All model selection must go through a **single factory function** in
`agents/factory.py`. This keeps your backend flexible and prevents
ChatKit-specific code from hard-coding model choices.

### 2.1 Required/Recommended Env Vars

```text
LLM_PROVIDER=openai or gemini

# OpenAI
OPENAI_API_KEY=sk-...
OPENAI_DEFAULT_MODEL=gpt-4.1-mini

# Gemini via OpenAI-compatible endpoint
GEMINI_API_KEY=...
GEMINI_DEFAULT_MODEL=gemini-2.5-flash

# Optional
LOG_LEVEL=INFO
```

### 2.2 Factory Contract

```python
# agents/factory.py

def create_model():
    """Return a model object compatible with the Agents SDK.

    - Uses LLM_PROVIDER to decide provider.
    - Uses provider-specific env vars for keys and defaults.
    - Returns a model usable in Agent(model=...).
    """
```

Rules:

- If `LLM_PROVIDER` is `"gemini"`, use an OpenAI-compatible client with:
  `base_url = "https://generativelanguage.googleapis.com/v1beta/openai/"`.
- If it is `"openai"` or unset, use OpenAI default with `OPENAI_API_KEY`.
- Never instantiate models directly inside ChatKit handlers; always call
  `create_model()`.

---

## 3. Required HTTP Endpoints for ChatKit

In **custom backend** mode, the frontend ChatKit client is configured to call
your backend instead of OpenAI’s hosted workflows.

At minimum, the backend should provide:

### 3.1 Main Chat Endpoint

```http
POST /chatkit/api
```

Responsibilities:

- Authenticate the incoming request (session / JWT / cookie).
- Parse the incoming ChatKit event (e.g., user message, action).
- Create or reuse an appropriate agent (using `create_model()`).
- Invoke the Agents SDK (Agent + Runner).
- Return a response in a shape compatible with ChatKit expectations
  (usually a JSON object / stream that represents the assistant’s reply).

### 3.2 Upload Endpoint (Optional)

If the frontend config uses a **direct upload strategy**, you’ll also need:

```http
POST /chatkit/api/upload
```

Responsibilities:

- Accept file uploads (`multipart/form-data`).
- Store the file (local disk, S3, etc.).
- Return a JSON body with a URL and any metadata ChatKit expects
  (e.g., `{ "url": "https://cdn.example.com/path/file.pdf" }`).

The frontend will include this URL in messages or pass it as context.

---

## 4. ChatKit Event Handling (Conceptual)

ChatKit will deliver events to your backend. The exact schema is documented
in the official ChatKit Custom Backends docs, but conceptually you will see
patterns like:

- A **user message** event with text and maybe references to files.
- An **action invocation** event when the user clicks a button or submits a form.
- System or housekeeping events that can usually be ignored or logged.

A typical handler shape in `chatkit/router.py` might be:

```python
async def handle_event(event: dict) -> dict:
    event_type = event.get("type")

    if event_type == "user_message":
        return await handle_user_message(event)
    elif event_type == "action_invoked":
        return await handle_action(event)
    else:
        # Log and return a no-op or simple message
        return {"type": "message", "content": "Unsupported event type."}
```

Then inside `handle_user_message`, you’ll:

1. Extract the user’s text.
2. Build or fetch context (user id, tenant id, conversation state).
3. Call the appropriate Agent with the user’s input.
4. Return the agent’s output mapped into ChatKit’s expected structure.

---

## 5. Agents SDK Integration Rules

All reasoning and tool execution should be done via the **Agents SDK**,
not via direct `chat.completions` calls.

### 5.1 Basic Agent Execution

```python
from agents import Agent, Runner
from agents.factory import create_model

def run_simple_agent(user_text: str) -> str:
    agent = Agent(
        name="chatkit-backend-agent",
        model=create_model(),
        instructions=(
            "You are the backend agent behind a ChatKit UI. "
            "Respond concisely and be robust to noisy input."
        ),
    )
    result = Runner.run_sync(starting_agent=agent, input=user_text)
    return result.final_output
```

### 5.2 Tools Integration

Tools should be defined in `agents/tools/` and attached to agents where needed.

- Use the Agents SDK’s tool decorator/pattern.
- Keep tools focused and side-effect-aware (e.g., read-only vs write).

Agents like `support_agent.py` may load tools such as:

- `get_employee_record`
- `create_support_ticket`
- `fetch_invoice_status`

ChatKit itself does not know about tools; it only sees the agent’s messages.

---

## 6. Streaming Responses

For better UX, you may choose to stream responses to ChatKit using
Server-Sent Events (SSE) or an equivalent streaming mechanism supported
by your framework.

General rules:

- The handler for `/chatkit/api` should return a streaming response.
- Each chunk should be formatted consistently (e.g., `data: {...}\n\n`).
- The final chunk should clearly indicate completion (e.g., `done: true`).

You may wrap the Agents SDK call in a generator that yields partial tokens
or partial messages as they are produced.

---

## 7. Auth, Security, and Tenant Context

### 7.1 Auth

- Every request to `/chatkit/api` and `/chatkit/api/upload` must be authenticated.
- Common patterns: bearer tokens, session cookies, signed headers.
- The backend must **never** return API keys or other secrets to the browser.

### 7.2 Tenant / User Context

Often you’ll want to include:

- `user_id`
- `tenant_id` / `company_id`
- user’s role (e.g. `employee`, `manager`, `admin`)

into the agent’s instructions or tool calls. For example:

```python
instructions = f"""
You are the support agent for tenant {tenant_id}.
You must respect role-based access and never leak other tenants' data.
Current user: {user_id}, role: {role}.
"""
```

### 7.3 Domain Allowlist

If the ChatKit widget renders blank or fails silently, verify:

- The frontend origin domain is included in the OpenAI dashboard allowlist.
- The `domainKey` configured on the frontend matches the backend’s expectations.

---

## 8. Logging and Troubleshooting

### 8.1 What to Log

- Incoming ChatKit event types and minimal metadata (no secrets).
- Auth failures (excluding raw tokens).
- Agents SDK errors (model not found, invalid arguments, tool exceptions).
- File upload failures.

### 8.2 Common Failure Modes

- **Blank ChatKit UI**  
  → Domain not allowlisted or domainKey mismatch.

- **“Loading…” never completes**  
  → Backend did not return a valid response or streaming never sends final chunk.

- **Model / provider errors**  
  → Wrong `LLM_PROVIDER`, incorrect API key, or wrong base URL.

- **Multipart upload errors**  
  → Upload endpoint doesn’t accept `multipart/form-data` or returns wrong JSON shape.

Having structured logs (JSON logs) greatly speeds up debugging.

---

## 9. Evolution and Versioning

Over time, ChatKit and the Agents SDK may evolve. To keep this backend
maintainable:

- Treat the official ChatKit Custom Backends docs as the top-level source of truth.
- Treat `agents/factory.py` as the single place to update model/provider logic.
- When updating the Agents SDK:
  - Verify that Agent/Runner APIs have not changed.
  - Update tools to match any new signatures or capabilities.

When templates or examples drift from the docs, prefer the **docs** and
update the local files accordingly.
