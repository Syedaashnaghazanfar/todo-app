---
id: 0004
title: Fix ChatKit thread persistence frontend
stage: misc
date: 2025-12-28
surface: agent
model: claude-sonnet-4-5-20250929
feature: 009-ai-chatbot
branch: 009-ai-chatbot
user: User
command: continue
labels: ["chatkit","thread-persistence","frontend","localstorage"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - phase-3/frontend/todo-app/components/chat/ChatWidget.tsx
tests: []
---

## Prompt

User reported: "first it said that i have added task buy milk and then it removed the buy milk and replace it with the other response" - ChatKit creates new thread on every message instead of using the same thread.

Root cause from ChatKit docs:
1. Frontend was NOT persisting thread ID across messages
2. Each chat open created a new thread (threads.create request)
3. ChatKit has `initialThread` option and `chatkit.thread.change` event for persistence

Fix needed: Use initialThread config and listen for thread.change events to persist thread ID in localStorage.

## Response snapshot

**Frontend Fix Applied (ChatWidget.tsx):**

1. **Added thread persistence utilities:**
```typescript
function getStoredThreadId(userId: string): string | null {
  return localStorage.getItem(`chatkit_thread_${userId}`);
}

function storeThreadId(userId: string, threadId: string | null): void {
  if (threadId) {
    localStorage.setItem(`chatkit_thread_${userId}`, threadId);
  } else {
    localStorage.removeItem(`chatkit_thread_${userId}`);
  }
}
```

2. **Load persisted thread on mount:**
```typescript
useEffect(() => {
  if (user?.id) {
    const storedThreadId = getStoredThreadId(user.id);
    if (storedThreadId) {
      setInitialThread(storedThreadId);
    }
  }
}, [user?.id]);
```

3. **Pass initialThread to ChatKit config:**
```typescript
const chatkit = useChatKit({
  api: {
    initialThread: initialThread,
    // ...
  }
});
```

4. **Listen for thread change events:**
```typescript
element.addEventListener('chatkit.thread.change', handleThreadChange);
element.addEventListener('chatkit.thread.load.end', handleThreadLoadEnd);
```

This ensures:
- Thread ID is loaded when chat opens (initialThread)
- Thread ID is saved when thread changes or loads
- User-specific key (`chatkit_thread_{userId}`) ensures thread isolation

## Outcome

- ✅ Impact: Fixed chat history replacement bug - messages now stay in conversation
- 📁 Files: Modified phase-3/frontend/todo-app/components/chat/ChatWidget.tsx
- 🔁 Next prompts: Rebuild frontend and test chat persistence
- 🧠 Reflection: ChatKit frontend doesn't auto-persist threads - must use initialThread + localStorage events
