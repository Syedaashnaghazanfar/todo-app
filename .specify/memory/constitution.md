<!--
Sync Impact Report:
Version change: 2.1.0 → 3.0.0
Modified principles: None (all Phase 2 and Phase 3 principles retained)
Added sections: Phase 4 Cloud Native Deployment Principles (P4-I through P4-VI)
Removed sections: None
Templates requiring updates:
  - ✅ .specify/memory/constitution.md (updated)
  - ✅ .specify/templates/plan-template.md (no changes needed - Constitution Check section is generic)
  - ✅ .specify/templates/spec-template.md (no changes needed - requirements alignment is generic)
  - ✅ .specify/templates/tasks-template.md (no changes needed - task categorization is generic)
Follow-up TODOs: None
Rationale for MAJOR version bump: Phase 4 introduces fundamentally new governance paradigm (no manual infrastructure coding, AI-native DevOps workflows, mandatory verification gates) that represents a breaking change in development practices.
-->

# Phase 4: Cloud Native Todo Chatbot Deployment Constitution

## Core Purpose

You orchestrate a multi-agent development environment consisting of:

- Front-End Sub-Agents
- Back-End Sub-Agents
- Theme Sub-Agent
- Specialized Skills
- Integrated MCP Servers
- **NEW: Infrastructure-as-Code Agents (Phase 4)**

Your mission is to build, refine, and evolve a production-grade full-stack system using React, charts, icons, and purple theming on the frontend, Python/FastAPI with modular MCP servers on the backend, **and now deploy it to cloud-native infrastructure using AI-generated Dockerfiles, Helm charts, and Kubernetes manifests.**

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

## Phase 4: Cloud Native Deployment Principles

The following principles govern containerization, Kubernetes deployment, and cloud-native infrastructure for the Todo Chatbot application.

### Principle P4-I: AI-Native Infrastructure Development

ALL infrastructure code (Dockerfiles, Helm charts, Kubernetes manifests) MUST be generated via AI agents. Manual coding is FORBIDDEN.

- **No Manual Dockerfile Creation**: Dockerfiles MUST be generated by AI agents (Claude Code, specialized skills) based on requirements and existing code analysis
- **No Manual Helm Chart Creation**: Helm charts MUST be generated via AI analysis of application requirements and deployment patterns
- **No Manual K8s Manifest Creation**: Kubernetes YAML MUST be generated through AI-assisted workflows
- **Spec-Driven Approach**: Infrastructure requirements MUST be specified in natural language specifications; AI agents convert specs to code
- **Human Validation Only**: Human role is limited to reviewing, approving, and requesting modifications to AI-generated infrastructure

**Rationale**: Eliminates manual toil, reduces configuration drift, ensures consistency with application code, and leverages AI for best practices and security patterns. Manual infrastructure coding is error-prone and time-consuming.

**Implementation Locations**:
- Backend Dockerfile: `phase-4/backend/Dockerfile`
- Frontend Dockerfile: `phase-4/frontend/todo-app/Dockerfile`
- Helm Charts: `phase-4/helm/todo-app/`
- Kubernetes Manifests: `phase-4/k8s/` (if not using Helm)

### Principle P4-II: Local-First Kubernetes Architecture

ALL Kubernetes deployments MUST be fully functional on Minikube before considering cloud deployment.

- **Minikube as Primary Target**: Every Helm chart and manifest MUST work on Minikube without modification
- **No Cloud Vendor Lock-in**: Infrastructure code MUST NOT depend on AWS/GCP/Azure-specific features in Phase 4
- **Localhost Testing**: Developers MUST be able to run full stack (frontend + backend + database) locally via Minikube
- **Portability**: Infrastructure MUST use standard Kubernetes primitives (Deployments, Services, ConfigMaps, Secrets)
- **Cloud-Ready Foundation**: While local-first, infrastructure MUST follow patterns that enable future cloud migration

**Rationale**: Enables rapid iteration, reduces cloud costs during development, ensures portability, and allows developers without cloud accounts to contribute.

**Verification Commands**:
```bash
# MUST succeed on every developer machine
minikube start
helm install todo-app ./helm/todo-app -f values-minikube.yaml
kubectl get pods  # All pods RUNNING
kubectl logs <pod>  # No errors
```

### Principle P4-III: Helm-Driven Configuration Management

Kubernetes deployments MUST use Helm Charts with environment-separated values files.

- **Helm as Package Manager**: All Kubernetes resources MUST be packaged as Helm Charts
- **Values File Separation**:
  - `values.yaml`: Default/production configuration
  - `values-minikube.yaml`: Local development overrides (NodePort, reduced resources, localhost URLs)
  - Future: `values-staging.yaml`, `values-prod.yaml` for cloud environments
- **No Hardcoded Values**: Image tags, resource limits, replica counts, URLs MUST be parameterized via `{{ .Values.* }}`
- **Secret Management**: Secrets MUST use Helm templates with `kubectl create secret` for local dev; future cloud integration via external secret managers
- **Namespace Isolation**: Each environment MUST deploy to separate Kubernetes namespace

**Rationale**: Helm provides version control for deployments, enables rollbacks, simplifies multi-environment configuration, and reduces YAML duplication.

**Example Structure**:
```text
phase-4/helm/todo-app/
├── Chart.yaml
├── values.yaml                  # Production defaults
├── values-minikube.yaml         # Local dev overrides
├── templates/
│   ├── backend-deployment.yaml
│   ├── backend-service.yaml
│   ├── frontend-deployment.yaml
│   ├── frontend-service.yaml
│   ├── configmap.yaml
│   └── secrets.yaml
```

### Principle P4-IV: Resilience and Health Monitoring

ALL deployments MUST include Liveness Probes and Readiness Probes for automated health management.

- **Liveness Probes Required**: Every container MUST define liveness probe to detect deadlocks/hangs
  - Backend: HTTP GET `/health` (FastAPI health endpoint)
  - Frontend: HTTP GET `/api/health` or TCP socket check on port 3000
- **Readiness Probes Required**: Every container MUST define readiness probe to gate traffic until ready
  - Backend: HTTP GET `/ready` (checks database connectivity)
  - Frontend: HTTP GET `/` (checks Next.js server responsive)
- **Probe Configuration**:
  - `initialDelaySeconds`: Minimum 10s for backend (database connection time), 5s for frontend
  - `periodSeconds`: 10s for regular health checks
  - `failureThreshold`: 3 consecutive failures before restart/removal
- **Graceful Degradation**: Probes MUST NOT crash the application; failures should return 503 status

**Rationale**: Kubernetes cannot manage application health without probes. Liveness prevents zombie pods, readiness prevents routing traffic to unready instances, improving availability and user experience.

**Example Probe (Backend)**:
```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 8000
  initialDelaySeconds: 10
  periodSeconds: 10
  failureThreshold: 3
readinessProbe:
  httpGet:
    path: /ready
    port: 8000
  initialDelaySeconds: 15
  periodSeconds: 5
  failureThreshold: 3
```

### Principle P4-V: Horizontal Pod Autoscaling (HPA)

Backend services MUST include HPA definitions for dynamic scalability.

- **HPA for Backend**: Backend deployment MUST define HorizontalPodAutoscaler based on CPU utilization
  - **Min Replicas**: 2 (ensures availability during pod failures)
  - **Max Replicas**: 10 (prevents runaway scaling costs in local Minikube)
  - **Target CPU**: 70% average CPU utilization triggers scale-up
- **Frontend Scaling**: Frontend HPA is OPTIONAL in Phase 4 (static scaling acceptable for SSR workloads)
- **Metrics Server**: Minikube MUST have metrics-server addon enabled (`minikube addons enable metrics-server`)
- **Resource Requests/Limits**: HPA REQUIRES CPU resource requests defined in Deployment spec
  - Backend: `requests.cpu: 100m`, `limits.cpu: 500m`
  - Frontend: `requests.cpu: 50m`, `limits.cpu: 200m`

**Rationale**: Stateless backend (per P3-II) enables horizontal scaling. HPA ensures backend scales under load while preventing over-provisioning. Minikube HPA testing validates production scaling behavior.

**Example HPA (Backend)**:
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: backend-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: backend
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

### Principle P4-VI: Observability and Verification

Every deployment task MUST end with a verification step using `kubectl` to prove health.

- **Mandatory Verification Commands**:
  ```bash
  kubectl get pods -n <namespace>          # All pods RUNNING
  kubectl get svc -n <namespace>           # Services ClusterIP/NodePort assigned
  kubectl logs <pod-name> -n <namespace>   # No ERROR/FATAL logs
  kubectl describe pod <pod-name>          # Events show no crashes/restarts
  kubectl port-forward svc/frontend 3000:3000  # Frontend accessible at localhost:3000
  kubectl port-forward svc/backend 8000:8000   # Backend API accessible at localhost:8000
  ```
- **Health Endpoint Tests**:
  ```bash
  curl http://localhost:8000/health   # Returns 200 OK
  curl http://localhost:8000/ready    # Returns 200 OK (database connected)
  curl http://localhost:3000          # Returns Next.js HTML
  ```
- **Logs as Stdout/Stderr**: Applications MUST log to stdout/stderr (NOT files) for `kubectl logs` capture
  - FastAPI: Use uvicorn default logging (stdout)
  - Next.js: Use console.log/console.error (stdout)
- **No Silent Failures**: Verification failures MUST block deployment completion and trigger remediation

**Rationale**: Verification gates prevent "deployed but broken" scenarios. Standardized verification commands enable automated CI/CD health checks. Stdout/stderr logging is Kubernetes best practice for log aggregation (future: ELK, Datadog).

**Deployment Success Criteria**:
- ✅ All pods in RUNNING state (not CrashLoopBackOff, ImagePullBackOff)
- ✅ No ERROR/FATAL logs in last 50 lines of pod logs
- ✅ Health endpoints return 200 OK
- ✅ Frontend UI loads at localhost:3000 (via port-forward)
- ✅ Backend API responds at localhost:8000/docs (Swagger UI)
- ✅ Database connectivity confirmed (readiness probe passes)

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
- **3.0.0** (2026-01-03): Added Phase 4 Cloud Native Deployment Principles (P4-I through P4-VI) for AI-native infrastructure development, local-first Kubernetes, Helm-driven configuration, resilience monitoring, horizontal pod autoscaling, and mandatory verification gates. MAJOR bump due to fundamental shift to AI-generated infrastructure and no-manual-coding paradigm.

**Version**: 3.0.0 | **Ratified**: 2025-12-06 | **Last Amended**: 2026-01-03
