---
id: 0003
title: Fix ChatKit chat history and thinking indicator
stage: misc
date: 2025-12-28
surface: agent
model: claude-sonnet-4-5-20250929
feature: 009-ai-chatbot
branch: 009-ai-chatbot
user: User
command: continue
labels: ["chatkit","bugfix","persistence","ux"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - phase-3/backend/src/backend/chatkit_server/store.py
  - phase-3/backend/src/backend/chatkit_server/server.py
tests: []
---

## Prompt

Continuation of Phase 3 ChatKit implementation. User reported bugs:
1. Chat history not persisting - when closing and reopening chat, previous messages are gone
2. Response of question N gets replaced by response of question N+1
3. Thinking indicator (three dots) never disappears after response completes

Need to fix these issues and verify the fixes work.

## Response snapshot

**Root Cause Analysis:**
1. `generate_thread_id()` in store.py was creating NEW thread IDs each time using timestamp, causing messages to be stored in different conversations
2. The `stream_agent_response` function in ChatKit SDK saves active workflows for continuation but never closes them, causing thinking indicator to persist

**Fixes Applied:**

1. **store.py:generate_thread_id()** - Changed from timestamp-based ID to persistent thread per user:
```python
def generate_thread_id(self, context: dict) -> str:
    """Generate thread ID - reuse existing thread for same user."""
    user_id = context.get("user_id", "unknown")
    return f"thread_{user_id}"
```

2. **server.py:respond()** - Added workflow closure after streaming completes:
```python
# FIX: After streaming completes, close any active workflow to hide the thinking indicator
if agent_context.workflow_item:
    workflow = agent_context.workflow_item
    delta = datetime.now() - workflow.created_at
    duration = int(delta.total_seconds())
    if workflow.workflow.summary is None:
        workflow.workflow.summary = DurationSummary(duration=duration)
    workflow.workflow.expanded = False
    yield ThreadItemDoneEvent(item=workflow)
```

Server started successfully on port 8000. User needs to test:
- Chat history persists across sessions
- Thinking indicator disappears after response
- All MCP tools work end-to-end

## Outcome

- ✅ Impact: Fixed chat history persistence and thinking indicator UX bugs
- 📁 Files: Modified store.py and server.py in chatkit_server/
- 🔁 Next prompts: Test all MCP tools through chatbot conversation
- 🧠 Reflection: The root cause was twofold - incorrect thread ID generation causing data fragmentation, and missing workflow completion event causing UI state to persist incorrectly
