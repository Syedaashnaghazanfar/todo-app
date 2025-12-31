---
id: "0002"
title: "calm-ui-redesign-plan"
stage: "plan"
date: "2025-12-30"
surface: "agent"
model: "claude-sonnet-4-5-20250929"
feature: "010-calm-ui-redesign"
branch: "010-calm-ui-redesign"
user: "ashna"
command: "/sp.plan Create a clear, phased execution plan for implementing the frontend UI/UX redesign..."
labels: ["ui-redesign", "frontend", "planning", "execution-plan"]
links:
  spec: "specs/010-calm-ui-redesign/spec.md"
  ticket: "null"
  adr: "null"
  pr: "null"
files:
  - "specs/010-calm-ui-redesign/plan.md"
tests:
  - "null"
---

## Prompt

Create a clear, phased execution plan for implementing the frontend UI/UX redesign of a Phase 3 Todo application.

Context

The backend is already complete and functional:

Authentication (login/signup)

Task CRUD

Tags, priorities, due dates

Analytics

Notifications

Chat

This plan must focus only on frontend work

No backend changes, no API redesign, no mock data

The goal is to implement a calm, modern, production-ready UI with full dark/light theme support and a dashboard-centric experience.

What the plan must include

Break the work into logical, sequential phases that a developer can realistically follow.

Each phase should clearly specify:

Purpose of the phase

What UI/UX elements are implemented

What files or areas are affected (high-level, not code)

What should be visually and functionally complete before moving on

Required Planning Phases
Phase 1 — Foundation & Theme System

Plan the setup for:

Design tokens (colors, spacing, typography)

Dark and light theme architecture

Theme toggle behavior

Global styles and layout foundations

Accessibility and contrast validation

This phase should result in a stable visual base used by all pages.

Phase 2 — Core Layout & Navigation

Plan the implementation of:

App-wide layout (sidebar, top bar, page container)

Navigation behavior

Page-level accent color system

Responsive behavior (desktop, tablet, mobile)

This phase should make the app navigable and structurally complete.

Phase 3 — Dashboard (Home Page)

Plan how to build:

Dashboard-style home (no hero sections)

Dynamic welcome header (backend-driven)

Quick status overview cards

Important and upcoming task sections

Optional/collapsible analytics summary

Quick actions area

Focus on information hierarchy and calm presentation, not visual effects.

Phase 4 — Tasks Experience (Highest Priority)

Plan the core task experience:

Tasks page layout

Sidebar filters

Search behavior

Task card design and interaction

Completion animations

Hover-based secondary actions

Selective tag icon behavior (icons only for category tags)

This phase should make the app fully usable for daily task management.

Phase 5 — Supporting Pages

Plan the UI for:

Analytics page (charts, toggles, summaries)

History page (timeline, grouping, collapsible dates)

Notifications page (priority, unread states)

Settings page (section-based layout)

Each page should follow the same design system and theme rules.

Phase 6 — Chat Interface

Plan:

Chat page layout

Animated but subtle background

Message styling

Typing indicators

Accessibility considerations

Ensure chat feels integrated, not bolted on.

Phase 7 — Auth Pages (Login / Signup)

Plan:

Glassmorphic card layout

Animated gradient background

Smooth transitions

Focused form experience

Light/dark compatibility

Phase 8 — Motion, Polish & Accessibility

Plan final refinements:

Physics-based animations

Motion consistency

Reduced-motion support

Keyboard navigation

Focus states

Visual polish and spacing consistency

Constraints

No backend logic

No hardcoded user data

No implementation code

No assumptions about APIs

UI/UX planning only

Output Expectations

The plan should be:

Sequential and easy to follow

Practical, not theoretical

Focused on developer execution

Calm and structured

Free from unnecessary buzzwords

The final plan should make it obvious what to build first, next, and last, with minimal ambiguity.

## Response snapshot

Created comprehensive implementation plan for calm UI redesign with:

1. **Technical Context** documented:
   - TypeScript 5.x, Next.js 16.0.10, React 19.2.1
   - Dependencies: Tailwind CSS 4, Framer Motion 12, Recharts 3, Lucide React, Zustand 5
   - Performance goals: <300ms theme transitions, <500ms task list render

2. **Constitution Check** completed and passed:
   - Purple theme compliance confirmed
   - All dependencies already installed
   - Frontend-only scope validated

3. **Project Structure** defined:
   - Next.js App Router with feature-based component organization
   - Layout components in dedicated folder
   - Feature components in their respective folders

4. **Phase 0: Research Tasks** identified:
   - R1: Calm Design System Definition
   - R2: Per-Page Accent Color System
   - R3: Tag Icon System
   - R4: Animation & Motion Strategy

5. **Phase 1: Design Deliverables** specified:
   - D1: Design Tokens (colors.ts, tokens.ts) with CSS custom properties
   - D2: Animation System (animations.ts) with Framer Motion variants
   - D3: Tag Icon Configuration (tagCategories.ts)
   - D4: Quickstart Reference (quickstart.md)

6. **Risks & Mitigation** documented:
   - Cyberpunk theme integration risk (incremental refactor)
   - Animation performance (reduced motion support)
   - Accessibility compliance (WCAG contrast validation)

## Outcome

- ✅ Impact: Complete implementation plan for frontend UI/UX redesign with 8 sequential phases
- 🧪 Tests: Quality checklist validates all requirements are testable
- 📁 Files: specs/010-calm-ui-redesign/plan.md
- 🔁 Next prompts: Run `/sp.tasks` to generate implementation tasks
- 🧠 Reflection: Plan follows sequential phases matching user's requirements. Research tasks (R1-R4) and design deliverables (D1-D4) are clearly separated from implementation tasks.

## Evaluation notes (flywheel)

- Failure modes observed: "null"
- Graders run and results (PASS/FAIL): All constitution gates PASS
- Prompt variant (if applicable): "null"
- Next experiment (smallest change to try): "null"
