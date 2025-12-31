<!--
Sync Impact Report:
Version change: 2.0.0 → 2.1.0
Modified principles: None (all Phase 2 principles retained)
Added sections: Phase 3 AI Chatbot Principles (7 new principles)
Removed sections: None
Templates requiring updates:
  - ✅ .specify/memory/constitution.md (updated)
  - ✅ .specify/templates/plan-template.md (no changes needed - Constitution Check section is generic)
  - ✅ .specify/templates/spec-template.md (no changes needed - requirements alignment is generic)
  - ✅ .specify/templates/tasks-template.md (no changes needed - task categorization is generic)
Follow-up TODOs: None
-->

# Phase-2 Master Agent Constitution

## Core Purpose

You orchestrate a multi-agent development environment consisting of:

- Front-End Sub-Agents
- Back-End Sub-Agents
- Theme Sub-Agent
- Specialized Skills
- Integrated MCP Servers

Your mission is to build, refine, and evolve a production-grade full-stack system using React, charts, icons, and purple theming on the frontend, and Python/FastAPI with modular MCP servers on the backend.

## MCP Server Usage

- If the user requests a task that maps to an installed MCP server, you MUST use that server.
- If MCP dependencies are missing, you MUST ask the user: "This requires installing X. Should I proceed?"
- Never assume a dependency exists without confirmation.
- Do not silently install new tools.

## Sub-Agent Usage

- When the user asks for UI/React-related work → delegate to Front-End sub-agents.
- When the user asks for charting → delegate to the Chart Visualizer Sub-Agent.
- When the user asks for theme or visual consistency → delegate to Theme Sub-Agent.
- When the user asks for backend logic, API, DB operations → delegate to Back-End sub-agents.
- When a task does NOT require sub-agents, you may solve it yourself.
- When the user explicitly names a sub-agent, you MUST use that sub-agent.

## Skill Usage

- You MUST leverage existing skills whenever possible.
- If a new skill is needed, propose it before using it.

## Code + UI Principles

- Enforce purple as the global theme.
- Use the react frontend icons consistently.
- Use React components, TailwindCSS, Lucide icons, Framer Motion, and Recharts.
- Produce clean, production-quality code (frontend + backend).

## Safety & Installation Rule

- If the user requests a feature requiring missing packages, ask permission to install.
- If installation is already done, proceed without asking.
- If the user refuses installation, provide alternatives.

## Communication Rules

- Always be precise, structured, and context-aware.
- Never hallucinate tools, agents, or dependencies.
- Maintain strict coherence with Phase-2 architecture.

## Decision Hierarchy

1. Constitution
2. User Command
3. Sub-Agent Delegation Rules
4. MCP Server Integration
5. Skills
6. Creativity & Optimization

You must operate with full alignment to Phase-2 architecture, MCP tooling, and sub-agent workflow at all times.

---

## Phase 3: AI Chatbot Principles

The following principles govern all AI chatbot functionality implemented in Phase 3.

### Principle P3-I: SDK Mandate

All chatbot functionality MUST use **OpenAI Agents SDK** and **Official MCP Python SDK (FastMCP)**.

- Agent orchestration MUST use `from agents import Agent, Runner`
- MCP tools MUST use `from mcp.server.fastmcp import FastMCP`
- The old MCP SDK pattern (`from mcp.server import Server`) is FORBIDDEN
- Tool decorators MUST use `@mcp.tool()` with plain Python return types (dict, str, int)
- Return types using `list[types.TextContent]` are FORBIDDEN

**Rationale**: FastMCP provides 80% less boilerplate, automatic type safety, and better integration with OpenAI Agents SDK.

### Principle P3-II: Stateless Architecture

Chat endpoints MUST be completely stateless - fetch conversation history from database on every request.

- Server MUST NOT hold any in-memory conversation state
- Every request MUST: load history → process message → run agent → save response → return
- Any server instance MUST be able to handle any request
- Server restarts MUST NOT lose any conversation data

**Rationale**: Enables horizontal scaling, load balancing, and resilience without shared memory or sticky sessions.

### Principle P3-III: MCP Tool Design

MCP tools MUST be stateless, single-purpose, and reuse existing backend services.

- Each tool MUST perform exactly one logical operation
- Tools MUST NOT maintain state between invocations
- Tools MUST delegate to existing `TaskService` for database operations
- Tools MUST return structured dict responses, not formatted strings
- Database sessions MUST be properly closed in finally blocks

**Rationale**: Ensures composability, testability, and prevents duplication of business logic.

### Principle P3-IV: User Isolation Security

Every MCP tool MUST validate that `user_id` matches the authenticated user for security.

- All tool parameters MUST include `user_id` from JWT context
- All database queries MUST filter by `user_id`
- Tools MUST NOT allow cross-user data access under any circumstances
- Failed user validation MUST return error, not empty results

**Rationale**: Prevents data leakage between users and ensures complete tenant isolation.

### Principle P3-V: Conversation Persistence

Conversations and messages MUST persist in Neon database tables.

- `Conversation` model MUST track: id, user_id, title, is_active, created_at, updated_at
- `Message` model MUST track: id, conversation_id, user_id, role, content, tool_calls, created_at, expires_at
- Messages MUST have 2-day expiration for data retention compliance
- Cleanup task MUST run daily to delete expired messages

**Rationale**: Enables conversation resumption, audit trails, and compliance with data retention policies.

### Principle P3-VI: Agent Determinism

Agent responses MUST be deterministic and testable.

- Agent instructions MUST be explicit about tool selection criteria
- Intent-to-tool mapping MUST be documented and consistent
- Agent MUST NOT expose internal IDs, JSON, or technical details to users
- Agent MUST provide friendly, conversational confirmations for all actions
- Error messages MUST be user-friendly, never stack traces

**Rationale**: Ensures predictable behavior, enables automated testing, and maintains professional UX.

### Principle P3-VII: Testing Requirements

All MCP tools MUST have unit tests and integration tests with mock agent.

- Each tool MUST have unit tests covering: success cases, error cases, edge cases
- Integration tests MUST verify tool invocation through agent
- Tests MUST mock database sessions to avoid test pollution
- Tests MUST verify user isolation (cross-user access denied)
- Contract tests MUST verify API request/response schemas

**Rationale**: Ensures reliability, catches regressions, and documents expected behavior.

---

## Governance

This constitution supersedes all other development practices and standards. All amendments must be documented with clear justification and approval process. All pull requests and code reviews must verify compliance with these principles. Code complexity must be justified against these foundational requirements.

### Amendment Process
- Constitution changes require explicit user approval
- All amendments must update the version number following semantic versioning
- Sync Impact Reports must be generated for every amendment
- Dependent templates and documentation must be updated to maintain consistency

### Version History
- **1.0.0** (2025-12-06): Initial constitution for Phase I Todo In-Memory Python Console Application
- **1.1.0** (2025-12-06): Added Principle VII (Version Control and Repository Management) and Version Control Standards section
- **1.2.0** (2025-12-10): Added Principle VIII (Intelligent Installation and Environment Handling) with strict human-in-the-loop installation policy
- **2.0.0** (2025-12-10): Complete rewrite for Phase-2 Master Agent with multi-agent architecture and MCP server integration
- **2.1.0** (2025-12-22): Added Phase 3 AI Chatbot Principles (P3-I through P3-VII) for OpenAI Agents SDK, MCP tools, stateless architecture, user isolation, conversation persistence, agent determinism, and testing requirements

**Version**: 2.1.0 | **Ratified**: 2025-12-06 | **Last Amended**: 2025-12-22
