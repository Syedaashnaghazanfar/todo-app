---
id: 4
title: Add Phase 3 AI Chatbot Principles
stage: constitution
date: 2025-12-22
surface: agent
model: claude-sonnet-4-5-20250929
feature: phase-3-ai-chatbot
branch: main
user: developer
command: /sp.constitution
labels: ["phase3", "ai-chatbot", "mcp", "openai-agents", "constitution"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .specify/memory/constitution.md
tests:
  - N/A (constitution amendment)
---

## Prompt

/sp.constitution

Add the following principles to the constitution. These are Phase 3 AI Chatbot principles that govern all AI chatbot functionality implemented in Phase 3:

### Principle P3-I: SDK Mandate
All chatbot functionality MUST use **OpenAI Agents SDK** and **Official MCP Python SDK (FastMCP)**.
- Agent orchestration MUST use `from agents import Agent, Runner`
- MCP tools MUST use `from mcp.server.fastmcp import FastMCP`
- The old MCP SDK pattern (`from mcp.server import Server`) is FORBIDDEN
- Tool decorators MUST use `@mcp.tool()` with plain Python return types (dict, str, int)
- Return types using `list[types.TextContent]` are FORBIDDEN

### Principle P3-II: Stateless Architecture
Chat endpoints MUST be completely stateless - fetch conversation history from database on every request.
- Server MUST NOT hold any in-memory conversation state
- Every request MUST: load history → process message → run agent → save response → return
- Any server instance MUST be able to handle any request
- Server restarts MUST NOT lose any conversation data

### Principle P3-III: MCP Tool Design
MCP tools MUST be stateless, single-purpose, and reuse existing backend services.
- Each tool MUST perform exactly one logical operation
- Tools MUST NOT maintain state between invocations
- Tools MUST delegate to existing `TaskService` for database operations
- Tools MUST return structured dict responses, not formatted strings
- Database sessions MUST be properly closed in finally blocks

### Principle P3-IV: User Isolation Security
Every MCP tool MUST validate that `user_id` matches the authenticated user for security.
- All tool parameters MUST include `user_id` from JWT context
- All database queries MUST filter by `user_id`
- Tools MUST NOT allow cross-user data access under any circumstances
- Failed user validation MUST return error, not empty results

### Principle P3-V: Conversation Persistence
Conversations and messages MUST persist in Neon database tables.
- `Conversation` model MUST track: id, user_id, title, is_active, created_at, updated_at
- `Message` model MUST track: id, conversation_id, user_id, role, content, tool_calls, created_at, expires_at
- Messages MUST have 2-day expiration for data retention compliance
- Cleanup task MUST run daily to delete expired messages

### Principle P3-VI: Agent Determinism
Agent responses MUST be deterministic and testable.
- Agent instructions MUST be explicit about tool selection criteria
- Intent-to-tool mapping MUST be documented and consistent
- Agent MUST NOT expose internal IDs, JSON, or technical details to users
- Agent MUST provide friendly, conversational confirmations for all actions
- Error messages MUST be user-friendly, never stack traces

### Principle P3-VII: Testing Requirements
All MCP tools MUST have unit tests and integration tests with mock agent.
- Each tool MUST have unit tests covering: success cases, error cases, edge cases
- Integration tests MUST verify tool invocation through agent
- Tests MUST mock database sessions to avoid test pollution
- Tests MUST verify user isolation (cross-user access denied)
- Contract tests MUST verify API request/response schemas

IMPORTANT: Keep all the Phase 1 and Phase 2 principles intact. Only add these new Phase 3 principles as a new section.

## Response snapshot

Successfully amended constitution from v2.0.0 to v2.1.0 with 7 new Phase 3 AI Chatbot principles:

- **P3-I: SDK Mandate** - Enforces OpenAI Agents SDK + FastMCP exclusively
- **P3-II: Stateless Architecture** - Database-backed state, no in-memory state
- **P3-III: MCP Tool Design** - Single-purpose, stateless tools reusing TaskService
- **P3-IV: User Isolation Security** - Mandatory user_id validation on all tools
- **P3-V: Conversation Persistence** - Conversation/Message models with 2-day expiration
- **P3-VI: Agent Determinism** - Predictable, testable agent behavior
- **P3-VII: Testing Requirements** - Unit, integration, and contract tests required

All Phase 2 principles retained intact. Sync Impact Report generated.

## Outcome

- ✅ Impact: Constitution updated with 7 new Phase 3 principles governing AI chatbot development
- 🧪 Tests: N/A (constitution document)
- 📁 Files: .specify/memory/constitution.md (v2.0.0 → v2.1.0)
- 🔁 Next prompts: /sp.specify for Phase 3 feature specification
- 🧠 Reflection: MINOR version bump appropriate - new principles added without modifying existing ones

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): N/A (constitution amendment)
- Prompt variant (if applicable): standard-constitution-amend
- Next experiment (smallest change to try): Validate principles during spec/plan/tasks generation
