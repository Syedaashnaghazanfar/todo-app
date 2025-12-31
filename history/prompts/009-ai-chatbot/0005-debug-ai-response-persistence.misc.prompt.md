---
id: 0005
title: Debug AI response persistence issue
stage: misc
date: 2025-12-28
surface: agent
model: claude-sonnet-4-5-20250929
feature: 009-ai-chatbot
branch: 009-ai-chatbot
user: User
command: continue
labels: ["chatkit","debug","persistence","assistant-messages"]
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

Continuation of Phase 3 ChatKit debugging session.

**User reported**: "BUUTTTT THEEE RESPONSEEE OFFF THEEE AI IS NOT REMAINING IN THE CHAT JUST THE LATEST RESPONSE IS IN THE CHAT AND THE OLD RESPONSE IS GETTING REPLACED BY THE NEW RESPONSEEEEEE"

**Previous context**:
- User messages persist ✓
- AI responses are being replaced (not persisted)
- Thinking indicator fix was applied

**Root cause investigation**:
1. Analyzed ChatKit Python SDK source code (chatkit/server.py and chatkit/agents.py)
2. Verified the save flow:
   - `stream_agent_response()` yields `ThreadItemDoneEvent` for assistant messages (agents.py:720-730)
   - `ChatKitServer._process_events()` saves `ThreadItemDoneEvent` items to store (server.py:703-707)
   - Store's `add_thread_item()` handles both UserMessageItem and AssistantMessageItem (store.py:200-245)

3. Code flow is correct. Issue might be:
   - Event not reaching the handler
   - Something swallowing the events
   - Database commit not happening

**Applied debug logging**:
- Added `[Store] add_thread_item called` logging in store.py:204
- Added `[Store] load_thread_items` logging in store.py:179
- Added `[ChatKit] Event type` logging in server.py:117

## Response snapshot

**Code analysis complete - found potential issue:**

Looking at `chatkit/server.py` `_process_events()` method (lines 696-732), the save flow for ThreadItemDoneEvent looks correct:

```python
async for event in stream():
    if isinstance(event, ThreadItemAddedEvent):
        pending_items[event.item.id] = event.item

    match event:
        case ThreadItemDoneEvent():
            await self.store.add_thread_item(
                thread.id, event.item, context=context
            )
            pending_items.pop(event.item.id, None)
```

**Potential ID mismatch issue identified:**

Looking at `store.py` load_thread_items (lines 185-197), when loading assistant messages:

```python
elif msg.role == "assistant":
    items.append(AssistantMessageItem(
        id=f"msg_{msg.id}",  # Prefixes with "msg_"
        thread_id=thread_id,
        created_at=msg.created_at,
        content=[AssistantMessageContent(text=msg.content)],
    ))
```

But when OpenAI ChatKit generates assistant message IDs (like "msg_abc123def"), these don't match "msg_{database_id}" format.

**Hypothesis**: The frontend might be expecting a specific ID format from the backend that doesn't match what's being stored.

**Added debug logging** to help diagnose:
1. Server will log each event type as it's yielded
2. Store will log when add_thread_item is called
3. Store will log how many messages are loaded

**Next steps for user testing**:
1. Start backend: `cd phase-3/backend/src && .venv/Scripts/python.exe -m uvicorn backend.main:app --host 0.0.0.0 --port 8000`
2. Check server logs for:
   - `[Store] add_thread_item called` - should see assistant messages being saved
   - `[ChatKit] Event type: thread.item.done` - should see assistant message completion events
3. Check browser console for any errors

## Outcome

- 🔍 Added debug logging to trace message persistence
- 📝 Analyzing potential ID format mismatch between ChatKit and database
- ⏳ Need server logs to verify assistant messages are being saved to database
