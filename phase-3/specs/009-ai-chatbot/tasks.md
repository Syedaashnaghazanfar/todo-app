# Tasks: AI-Powered Task Management Chatbot (009-ai-chatbot)

**Input**: Design documents from `/specs/009-ai-chatbot/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

**Tests**: Tests are NOT explicitly requested in the spec, so test tasks are omitted per instructions.

## Format: `- [ ] [ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `phase-3/backend/src/`
- **Frontend**: `phase-3/frontend/todo-app/`
- **Migration**: `phase-3/backend/alembic/versions/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and directory structure for Phase 3 chatbot

- [X] T001 Create phase-3/backend/src/mcp_server/ directory
- [X] T002 Create phase-3/backend/src/agent_config/ directory
- [X] T003 [P] Create phase-3/backend/src/tasks/ directory
- [X] T004 [P] Create phase-3/frontend/todo-app/app/chat/ directory
- [X] T005 [P] Create phase-3/frontend/todo-app/components/chat/ directory

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Database Models & Migration

- [X] T006 [P] Create Conversation model in phase-3/backend/src/models/conversation.py
- [X] T007 [P] Create Message model with 2-day expiration in phase-3/backend/src/models/message.py
- [X] T008 Update phase-3/backend/src/models/__init__.py to export Conversation and Message
- [X] T009 Create async database session factory in phase-3/backend/src/database/async_session.py
- [X] T010 Update phase-3/backend/src/database/__init__.py to export async session
- [X] T011 Generate Alembic migration for Conversation and Message tables in phase-3/backend/alembic/versions/
- [X] T012 Apply migration to database

### MCP Server Infrastructure (Constitution P3-I, P3-III)

- [X] T013 Create MCP server package init in phase-3/backend/src/mcp_server/__init__.py
- [X] T014 Create MCP server entry point in phase-3/backend/src/mcp_server/__main__.py
- [X] T015 Implement add_task MCP tool in phase-3/backend/src/mcp_server/tools.py
- [X] T016 [P] Implement list_tasks MCP tool in phase-3/backend/src/mcp_server/tools.py
- [X] T017 [P] Implement complete_task MCP tool in phase-3/backend/src/mcp_server/tools.py
- [X] T018 [P] Implement delete_task MCP tool in phase-3/backend/src/mcp_server/tools.py
- [X] T019 [P] Implement update_task MCP tool in phase-3/backend/src/mcp_server/tools.py

### Agent Configuration (Constitution P3-I, P3-VI)

- [X] T020 Create multi-provider model factory in phase-3/backend/src/agent_config/factory.py
- [X] T021 Create agent configuration with instructions in phase-3/backend/src/agent_config/todo_agent.py
- [X] T022 Configure MCPServerStdio with 30s timeout in phase-3/backend/src/agent_config/todo_agent.py

### Conversation Service (Constitution P3-II Stateless)

- [X] T023 Create async ConversationService in phase-3/backend/src/services/conversation_service.py
- [X] T024 Implement get_or_create_conversation method in phase-3/backend/src/services/conversation_service.py
- [X] T025 Implement add_message method in phase-3/backend/src/services/conversation_service.py
- [X] T026 Implement get_conversation_history method in phase-3/backend/src/services/conversation_service.py
- [X] T027 Update phase-3/backend/src/services/__init__.py to export ConversationService

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Create Task via Natural Language (Priority: P1) 🎯 MVP

**Goal**: Users can create tasks by typing natural language commands like "add a task to buy groceries"

**Independent Test**: Send message "add a task to finish the report" and verify task appears in database with correct title

### Implementation for User Story 1

- [X] T028 [US1] Create chat endpoint POST /api/v1/chat in phase-3/backend/src/api/v1/chat.py
- [X] T029 [US1] Implement JWT authentication for chat endpoint using get_current_user_id dependency in phase-3/backend/src/api/v1/chat.py
- [X] T030 [US1] Implement stateless request handling (load history, save messages) in phase-3/backend/src/api/v1/chat.py
- [X] T031 [US1] Implement SSE streaming response in phase-3/backend/src/api/v1/chat.py
- [X] T032 [US1] Integrate agent runner with MCP server in phase-3/backend/src/api/v1/chat.py
- [X] T033 [US1] Add chat router to main.py in phase-3/backend/main.py
- [X] T034 [US1] Verify add_task tool creates tasks correctly from natural language

**Checkpoint**: User Story 1 complete - users can create tasks via chat

---

## Phase 4: User Story 2 - List Tasks via Natural Language (Priority: P1)

**Goal**: Users can view tasks by asking "show me my tasks" or "what's pending?"

**Independent Test**: Ask "show me all my tasks" and verify response lists user's actual tasks from database

### Implementation for User Story 2

- [X] T035 [US2] Verify list_tasks tool retrieves correct tasks from database
- [X] T036 [US2] Test filtering by status (all, pending, completed) in list_tasks tool
- [X] T037 [US2] Ensure empty task list returns friendly message

**Checkpoint**: User Story 2 complete - users can list tasks via chat

---

## Phase 5: User Story 6 - Conversation Persistence (Priority: P1)

**Goal**: Conversation history persists across sessions - users can close browser and return to continue chat

**Independent Test**: Send messages, close browser, reopen, verify all previous messages appear

### Implementation for User Story 6

- [X] T038 [US6] Verify conversation history loads correctly on every request (stateless architecture)
- [X] T039 [US6] Test message persistence across server restarts
- [X] T040 [US6] Verify 2-day expiration field is set correctly on new messages
- [X] T041 [US6] Test conversation isolation - users only see their own conversations

**Checkpoint**: User Story 6 complete - conversation history persists reliably

---

## Phase 6: User Story 3 - Complete Task via Natural Language (Priority: P2)

**Goal**: Users can mark tasks complete by saying "I finished buying groceries" or "mark task 3 as done"

**Independent Test**: Create task, say "I finished [task name]", verify task status changes to completed

### Implementation for User Story 3

- [X] T042 [US3] Verify complete_task tool marks tasks as complete correctly
- [X] T043 [US3] Test natural language task identification (by name, by number)
- [X] T044 [US3] Ensure non-existent task returns friendly error message

**Checkpoint**: User Story 3 complete - users can complete tasks via chat

---

## Phase 7: User Story 4 - Delete Task via Natural Language (Priority: P2)

**Goal**: Users can remove tasks by saying "delete the meeting task" or "remove task 5"

**Independent Test**: Create task, say "delete [task name]", verify task no longer exists

### Implementation for User Story 4

- [X] T045 [US4] Verify delete_task tool removes tasks correctly
- [X] T046 [US4] Test task identification for deletion (by name, by number)
- [X] T047 [US4] Ensure deletion confirmation message is friendly

**Checkpoint**: User Story 4 complete - users can delete tasks via chat

---

## Phase 8: User Story 5 - Update Task via Natural Language (Priority: P2)

**Goal**: Users can modify tasks by saying "change task 1 to call dad instead" or "update description"

**Independent Test**: Create task, say "change [task name] to [new name]", verify update

### Implementation for User Story 5

- [X] T048 [US5] Verify update_task tool modifies task title correctly
- [X] T049 [US5] Verify update_task tool modifies task description correctly
- [X] T050 [US5] Verify update_task tool modifies task priority correctly
- [X] T051 [US5] Test partial updates (only title, only description, only priority)

**Checkpoint**: User Story 5 complete - users can update tasks via chat

---

## Phase 9: User Story 8 - Real-Time Streaming Responses (Priority: P2)

**Goal**: AI responses stream in real-time, showing text progressively rather than all at once

**Independent Test**: Send message, observe text appearing incrementally

### Implementation for User Story 8

- [X] T052 [US8] Verify SSE streaming is configured correctly in chat endpoint
- [X] T053 [US8] Test streaming with long responses to verify progressive display
- [X] T054 [US8] Verify streaming starts within 500ms of sending message (SC-004)

**Checkpoint**: User Story 8 complete - responses stream in real-time

---

## Phase 10: Frontend Integration (All P1 Stories)

**Purpose**: ChatKit widget integration for chat UI

**Dependencies**: Backend Phases 1-5 complete (P1 user stories)

### ChatKit Setup (chatkit-frontend-engineer)

- [X] T055 [P] Add ChatKit CDN script to phase-3/frontend/todo-app/app/layout.tsx
- [X] T056 Create chat page with protected route in phase-3/frontend/todo-app/app/chat/page.tsx
- [X] T057 Create ChatWidget component in phase-3/frontend/todo-app/components/chat/ChatWidget.tsx
- [X] T058 Configure api.url to point to backend endpoint in ChatWidget
- [X] T059 Implement custom fetch with JWT token injection in ChatWidget
- [X] T060 Apply purple theme styling to ChatWidget

**Checkpoint**: Frontend complete - chat UI fully functional

---

## Phase 11: User Story 7 - Conversational Personality (Priority: P3)

**Goal**: AI assistant has friendly, helpful personality - greets warmly, acknowledges gratitude, declines off-topic requests

**Independent Test**: Say "hello" and verify warm greeting response

### Implementation for User Story 7

- [X] T061 [US7] Enhance agent instructions with personality guidelines in phase-3/backend/src/agent_config/todo_agent.py
- [X] T062 [US7] Test greeting responses ("hi", "hello")
- [X] T063 [US7] Test gratitude acknowledgment ("thank you")
- [X] T064 [US7] Test off-topic request handling ("what's the weather?")

**Checkpoint**: User Story 7 complete - assistant has friendly personality

---

## Phase 12: Data Retention & Cleanup (Constitution P3-V)

**Purpose**: Implement 2-day message expiration per Constitution P3-V

### Message Cleanup Task

- [X] T065 Create message cleanup task in phase-3/backend/src/tasks/message_cleanup.py
- [X] T066 Implement cleanup_expired_messages function to delete messages where expires_at < now()
- [X] T067 Add cron schedule documentation for daily cleanup at 2 AM UTC
- [X] T068 Test cleanup task removes only expired messages

**Checkpoint**: Data retention compliance complete

---

## Phase 13: Conversation Management API (Optional Enhancement)

**Purpose**: API endpoints for listing and managing conversations

**Dependencies**: Phase 2 complete

- [ ] T069 [P] Create conversations endpoint GET /api/v1/conversations in phase-3/backend/src/api/v1/conversations.py
- [ ] T070 [P] Create conversation detail endpoint GET /api/v1/conversations/{id} in phase-3/backend/src/api/v1/conversations.py
- [ ] T071 [P] Create conversation delete endpoint DELETE /api/v1/conversations/{id} in phase-3/backend/src/api/v1/conversations.py
- [ ] T072 Add conversations router to main.py in phase-3/backend/main.py
- [ ] T073 Implement user isolation for all conversation endpoints (Constitution P3-IV)

**Checkpoint**: Conversation management API complete

---

## Phase 14: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements and validation

- [X] T074 [P] Add error handling for OpenAI rate limits with retry logic in phase-3/backend/src/api/v1/chat.py
- [X] T075 [P] Add error handling for database unavailability in phase-3/backend/src/api/v1/chat.py
- [X] T076 [P] Add validation for message length (max 5000 chars) in phase-3/backend/src/api/v1/chat.py
- [X] T077 [P] Add logging for chat operations in phase-3/backend/src/api/v1/chat.py
- [X] T078 Verify user isolation across all operations (Constitution P3-IV)
- [X] T079 Run quickstart.md validation
- [X] T080 Update environment variable documentation in quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-9, 11)**: All depend on Foundational phase completion
  - P1 stories (US1, US2, US6): Critical path - implement first
  - P2 stories (US3, US4, US5, US8): Can proceed after P1 stories
  - P3 stories (US7): Implement last
- **Frontend (Phase 10)**: Depends on backend Phases 1-5 (P1 stories)
- **Cleanup (Phase 12)**: Can implement anytime after Phase 2
- **Conversation API (Phase 13)**: Optional - can implement anytime after Phase 2
- **Polish (Phase 14)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (Create Task)**: Foundation only - no story dependencies
- **User Story 2 (List Tasks)**: Foundation only - no story dependencies
- **User Story 6 (Persistence)**: Foundation only - no story dependencies
- **User Story 3 (Complete)**: Works with US1 tasks - can run in parallel
- **User Story 4 (Delete)**: Works with US1 tasks - can run in parallel
- **User Story 5 (Update)**: Works with US1 tasks - can run in parallel
- **User Story 8 (Streaming)**: Enhancement to US1 - can integrate anytime
- **User Story 7 (Personality)**: Polish - implement last

### Within Each Phase

- Foundation Phase 2:
  - Database models (T006-T012) → sequential
  - MCP tools (T015-T019) → can run in parallel [P]
  - Agent config (T020-T022) → depends on MCP tools
  - Conversation service (T023-T027) → depends on models

- User Story Phases:
  - Implementation tasks run sequentially within each story
  - Different user stories can proceed in parallel

### Parallel Opportunities

**Setup (Phase 1)**:
```bash
# All directory creation tasks can run in parallel
T003, T004, T005
```

**Foundational (Phase 2)**:
```bash
# Database models in parallel:
T006, T007

# MCP tools in parallel (after T015):
T016, T017, T018, T019
```

**Frontend (Phase 10)**:
```bash
# Frontend tasks in parallel:
T055 (CDN script)
```

**Polish (Phase 14)**:
```bash
# Error handling and validation in parallel:
T074, T075, T076, T077
```

**User Stories in Parallel** (if multiple developers):
```bash
# After Phase 2 complete, these can proceed in parallel:
Developer A: Phase 3 (US1 - Create Task)
Developer B: Phase 4 (US2 - List Tasks)
Developer C: Phase 5 (US6 - Persistence)
```

---

## Implementation Strategy

### MVP First (P1 Stories Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Create Task)
4. Complete Phase 4: User Story 2 (List Tasks)
5. Complete Phase 5: User Story 6 (Persistence)
6. Complete Phase 10: Frontend Integration
7. **STOP and VALIDATE**: Test all P1 stories independently
8. Deploy/demo MVP

**MVP Scope**: Users can create tasks, list tasks, and have conversations persist - all via natural language chat interface.

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1 (Create) → Test independently → Can create tasks via chat
3. Add US2 (List) → Test independently → Can create and view tasks
4. Add US6 (Persistence) → Test independently → Conversations persist
5. Add Frontend → Test independently → Full UI working (MVP COMPLETE! 🎯)
6. Add US3 (Complete) → Test independently → Can mark tasks done
7. Add US4 (Delete) → Test independently → Can remove tasks
8. Add US5 (Update) → Test independently → Can modify tasks
9. Add US8 (Streaming) → Test independently → Real-time responses
10. Add US7 (Personality) → Test independently → Friendly assistant
11. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Backend Developer A: User Stories 1, 3, 4, 5 (task operations)
   - Backend Developer B: User Stories 2, 6, 8 (queries and streaming)
   - Frontend Developer: Phase 10 (ChatKit integration)
   - DevOps Developer: Phase 12 (cleanup task + deployment)
3. Stories complete and integrate independently

---

## Task Summary

**Total Tasks**: 80

**By Phase**:
- Setup: 5 tasks
- Foundational: 22 tasks
- User Story 1 (P1): 7 tasks
- User Story 2 (P1): 3 tasks
- User Story 6 (P1): 4 tasks
- User Story 3 (P2): 3 tasks
- User Story 4 (P2): 3 tasks
- User Story 5 (P2): 4 tasks
- User Story 8 (P2): 3 tasks
- Frontend Integration: 6 tasks
- User Story 7 (P3): 4 tasks
- Data Retention: 4 tasks
- Conversation API: 5 tasks
- Polish: 7 tasks

**Parallel Tasks**: 18 tasks marked [P]

**MVP Scope** (P1 stories + Frontend): 47 tasks

**Critical Path**: Setup → Foundational → US1 → US2 → US6 → Frontend → MVP Complete

---

## Notes

- [P] tasks = different files, no dependencies - can run in parallel
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- MVP achieves core functionality: create tasks, list tasks, persistent conversations
- P2/P3 stories add convenience features but are not blocking
- Constitution compliance verified: P3-I (SDK), P3-II (Stateless), P3-III (MCP), P3-IV (Isolation), P3-V (Retention), P3-VI (Determinism)
- Subagent delegation: chatkit-backend-engineer for backend, chatkit-frontend-engineer for frontend
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
