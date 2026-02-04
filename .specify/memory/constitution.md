<!--
Sync Impact Report:
Version change: 3.0.0 → 4.0.0
Modified principles: None (all Phase 2, Phase 3, and Phase 4 principles retained)
Added sections: Phase 5 Advanced Cloud Deployment Principles (P5-I through P5-VIII)
Removed sections: None
Templates requiring updates:
  - ✅ .specify/memory/constitution.md (updated)
  - ✅ .specify/templates/plan-template.md (no changes needed - Constitution Check section is generic)
  - ✅ .specify/templates/spec-template.md (no changes needed - requirements alignment is generic)
  - ✅ .specify/templates/tasks-template.md (no changes needed - task categorization is generic)
Follow-up TODOs: None
Rationale for MAJOR version bump: Phase 5 introduces fundamentally new paradigm shift from local-first to production cloud deployment with event-driven architecture (Kafka, Dapr), recurring task engine, advanced features (priorities, tags, search, filter, sort), and multi-cloud infrastructure automation. This represents a breaking change in development and operational practices requiring cloud accounts, managed Kafka, and production-grade monitoring.
-->

# Phase 5: Advanced Cloud-Native Todo Chatbot Constitution

## Core Purpose

You orchestrate a multi-agent development environment consisting of:

- Front-End Sub-Agents
- Back-End Sub-Agents
- Theme Sub-Agent
- Specialized Skills
- Integrated MCP Servers
- Infrastructure-as-Code Agents (Phase 4)
- **NEW: Cloud Deployment Engineers (Phase 5)**
- **NEW: Event-Driven Architecture Agents (Phase 5)**
- **NEW: Recurring Task Engine Specialists (Phase 5)**

Your mission is to build, refine, and evolve a production-grade full-stack system using React, charts, icons, and purple theming on the frontend, Python/FastAPI with modular MCP servers on the backend, deploy it to cloud-native infrastructure using AI-generated Dockerfiles, Helm charts, and Kubernetes manifests, **and now extend it with advanced features (recurring tasks, priorities, tags, search, filter, sort) and deploy to production cloud (DigitalOcean/GKE/AKS) with event-driven architecture (Kafka via Redpanda Cloud) and Dapr integration.**

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
- **When the user asks for cloud deployment, Kubernetes, Helm, Terraform → delegate to phase5-cloud-deployment-engineer sub-agent.**
- **When the user asks for Kafka, event-driven architecture, Dapr → delegate to phase5-cloud-deployment-engineer sub-agent with appropriate skills.**
- **When the user asks for recurring tasks, RRULE patterns → delegate to phase5-cloud-deployment-engineer sub-agent with rrule-recurring-tasks skill.**
- When a task does NOT require sub-agents, you may solve it yourself.
- When the user explicitly names a sub-agent, you MUST use that sub-agent.

## Skill Usage

- You MUST leverage existing skills whenever possible.
- **Phase 5 Skills Available:**
  - `dapr-integration`: Dapr building blocks (Pub/Sub, State, Bindings, Secrets, Service Invocation)
  - `kafka-event-driven`: Kafka event schemas, producer/consumer patterns, partitioning, DLQ, retries
  - `microservices-patterns`: Service-to-service communication, idempotency, user isolation, event-driven design
  - `kubernetes-helm-deployment`: K8s deployments, services, ConfigMaps, Secrets, Dapr sidecar, health probes
  - `terraform-infrastructure`: Infrastructure as Code for OKE/AKS/GKE provisioning and multi-cloud patterns
  - `rrule-recurring-tasks`: RRULE parsing, next occurrence calculation, RFC 5545 patterns
  - `better-auth-ts`: Better Auth TypeScript/Next.js integration
  - `better-auth-python`: Better Auth JWT verification for Python/FastAPI backends
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
- Maintain strict coherence with Phase-2, Phase-3, Phase-4, and Phase-5 architecture.

## Decision Hierarchy

1. Constitution
2. User Command
3. Sub-Agent Delegation Rules
4. MCP Server Integration
5. Skills
6. Creativity & Optimization

You must operate with full alignment to Phase-2, Phase-3, Phase-4, and Phase-5 architecture, MCP tooling, and sub-agent workflow at all times.

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
- Backend Dockerfile: `phase-5/backend/Dockerfile`
- Frontend Dockerfile: `phase-5/frontend/todo-app/Dockerfile`
- Helm Charts: `phase-5/helm/todo-app/`
- Kubernetes Manifests: `phase-5/k8s/` (if not using Helm)

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
  - `values-staging.yaml`: Staging environment (Phase 5)
  - `values-prod.yaml`: Production environment (Phase 5)
- **No Hardcoded Values**: Image tags, resource limits, replica counts, URLs MUST be parameterized via `{{ .Values.* }}`
- **Secret Management**: Secrets MUST use Helm templates with `kubectl create secret` for local dev; external secret managers for cloud (Phase 5)
- **Namespace Isolation**: Each environment MUST deploy to separate Kubernetes namespace

**Rationale**: Helm provides version control for deployments, enables rollbacks, simplifies multi-environment configuration, and reduces YAML duplication.

**Example Structure**:
```text
phase-5/helm/todo-app/
├── Chart.yaml
├── values.yaml                  # Production defaults
├── values-minikube.yaml         # Local dev overrides
├── values-staging.yaml          # Staging overrides (NEW in Phase 5)
├── values-prod.yaml             # Production overrides (NEW in Phase 5)
├── templates/
│   ├── backend-deployment.yaml
│   ├── backend-service.yaml
│   ├── frontend-deployment.yaml
│   ├── frontend-service.yaml
│   ├── configmap.yaml
│   ├── secrets.yaml
│   ├── dapr-components/         # NEW in Phase 5
│   └── hpa.yaml
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
  - **Max Replicas**: 10 for Minikube, 50 for cloud (Phase 5)
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

## Phase 5: Advanced Cloud Deployment Principles

The following principles govern advanced features, event-driven architecture, recurring task engine, and production cloud deployment for the Todo Chatbot application.

### Principle P5-I: Recurring Task Architecture

Recurring tasks MUST use RRULE (RFC 5545) patterns and be processed via event-driven architecture.

- **RRULE Standard**: All recurring task patterns MUST follow RFC 5545 RRULE specification
  - Support patterns: DAILY, WEEKLY, MONTHLY, YEARLY with INTERVAL, BYDAY, BYMONTHDAY, COUNT, UNTIL
  - Example: "FREQ=WEEKLY;BYDAY=MO,WE,FR;COUNT=10" → Every Monday, Wednesday, Friday for 10 occurrences
  - Simplified patterns MUST be converted to RRULE: "daily" → "FREQ=DAILY;INTERVAL=1"
- **Database Schema**: Tasks table MUST include recurring fields:
  - `is_recurring: boolean` (default false)
  - `rrule_pattern: string` (nullable, stores RFC 5545 RRULE)
  - `parent_task_id: integer` (nullable, references original recurring task)
  - `next_occurrence: datetime` (nullable, UTC timestamp of next scheduled instance)
- **Event-Driven Processing**: Recurring task generation MUST be event-driven via Kafka
  - When recurring task is marked complete → publish `task.completed` event to Kafka
  - Recurring Task Service consumes event → calculates next occurrence using RRULE → creates new task instance
  - New task inherits: title, description, priority, tags, rrule_pattern from parent
  - New task gets: new due_date = next_occurrence, completed = false, parent_task_id = original task id
- **RRULE Calculation Library**: MUST use `python-dateutil` for RRULE parsing and next occurrence calculation
  - UTC-only time handling (no timezone conversions in RRULE calculation)
  - Handle edge cases: COUNT exhausted (stop recurring), UNTIL date passed (stop recurring)
- **MCP Tool Integration**: Add MCP tool `set_recurring` for setting recurring patterns via chatbot
  - Parameters: user_id, task_id, rrule_pattern
  - Returns: confirmation with next occurrence timestamp

**Rationale**: RRULE is industry standard for recurrence patterns (Google Calendar, iCal use it). Event-driven processing decouples recurring logic from main task service, enabling horizontal scaling. UTC-only handling avoids timezone complexity in calculation layer (display layer handles user timezone).

**Implementation Locations**:
- Backend model: `phase-5/backend/src/models/task.py` (add recurring fields)
- Recurring service: `phase-5/backend/src/services/recurring_task_service.py`
- MCP tool: `phase-5/backend/mcp_server/tools/set_recurring.py`
- Kafka consumer: `phase-5/backend/src/consumers/recurring_task_consumer.py`

### Principle P5-II: Intermediate Features Architecture

Priorities, tags, search, filter, and sort MUST be implemented as non-breaking additions to existing schema.

- **Priorities**: Add `priority: string` field to tasks table
  - Allowed values: "VERY_IMPORTANT", "HIGH", "MEDIUM", "LOW" (enum)
  - Default: "MEDIUM"
  - MCP tool `set_priority` for chatbot updates
  - UI filter chips for priority selection
- **Tags/Categories**: Add `tags: array[string]` field to tasks table (PostgreSQL array type or JSON array)
  - Predefined tag set: ["Work", "Personal", "Shopping", "Health", "Finance", "Learning", "Urgent"]
  - MCP tool `add_tag`, `remove_tag` for chatbot management
  - UI tag input with autocomplete from predefined set
- **Search**: Implement full-text search across title, description, tags
  - Backend: PostgreSQL `tsvector` and `ts_rank` for relevance ranking
  - API: `GET /api/tasks?search=<query>` with debounced frontend input
  - Search MUST return top 50 results ranked by relevance
- **Filter**: Cumulative AND logic across status, priority, due date
  - Frontend: Removable filter chips UI (Status + Priority + Due Date)
  - Backend: Dynamic query building with SQLAlchemy filters
  - LocalStorage persistence of active filters
- **Sort**: Support sorting by priority, due date, created date, alphabetical
  - Default sort: VERY_IMPORTANT first → then by soonest due date
  - Frontend: Sort dropdown with ascending/descending toggle
  - Backend: SQLAlchemy `order_by` clauses

**Rationale**: Non-breaking additions allow Phase 5 to coexist with existing Phase 3/4 deployments. Predefined tags prevent tag explosion. Full-text search provides better UX than LIKE queries. Cumulative filters match user mental model ("show me high priority work tasks due this week").

**Implementation Locations**:
- Backend model: `phase-5/backend/src/models/task.py` (add priority, tags fields)
- Backend service: `phase-5/backend/src/services/task_service.py` (add search, filter, sort logic)
- MCP tools: `phase-5/backend/mcp_server/tools/` (add set_priority, add_tag, remove_tag)
- Frontend components: `phase-5/frontend/todo-app/components/tasks/` (FilterChips, SearchInput, SortDropdown)

### Principle P5-III: Event-Driven Architecture with Kafka

ALL task state changes MUST publish events to Kafka for decoupled processing.

- **Kafka Topics**:
  - `task.events` (all CRUD operations: created, updated, completed, deleted)
  - `task.reminders` (scheduled reminder triggers for tasks with due dates)
  - `task.recurring` (recurring task completion events for next occurrence generation)
  - `task.audit` (audit trail for compliance and activity log)
- **Event Schema Standardization**:
  - Every event MUST include: `event_id` (UUID), `event_type`, `user_id`, `task_id`, `timestamp` (ISO8601 UTC), `payload` (event-specific data)
  - Use JSON serialization with schema versioning (`schema_version: "v1"`)
  - Example: `{"event_id": "uuid", "event_type": "task.completed", "user_id": "123", "task_id": 456, "timestamp": "2026-01-11T10:00:00Z", "schema_version": "v1", "payload": {...}}`
- **Producer Pattern**: TaskService MUST publish events after database commit
  - Use transactional outbox pattern for exactly-once semantics (optional for hackathon, recommended for production)
  - Async publishing (aiokafka) to avoid blocking API responses
- **Consumer Pattern**: Dedicated services consume specific topics
  - Notification Service → `task.reminders` topic
  - Recurring Task Service → `task.recurring` topic
  - Audit Service → `task.audit` topic (all events)
- **Kafka Client**: Use `aiokafka` for Python async producers/consumers
  - Bootstrap servers from environment variable: `KAFKA_BOOTSTRAP_SERVERS`
  - SASL_SSL for Redpanda Cloud authentication
- **Dead Letter Queue (DLQ)**: Failed events MUST route to `task.events.dlq` for debugging
  - After 3 retries, send to DLQ and alert
- **Idempotency**: All consumers MUST be idempotent (use event_id for deduplication)

**Rationale**: Event-driven architecture decouples services, enables horizontal scaling, provides audit trail, and simplifies adding new consumers (e.g., analytics service) without modifying producers. Kafka provides durable, ordered, partitioned event log. Idempotency prevents duplicate processing on retries.

**Implementation Locations**:
- Kafka producer: `phase-5/backend/src/services/kafka_producer.py`
- Event schemas: `phase-5/backend/src/schemas/events.py`
- Consumers: `phase-5/backend/src/consumers/` (notification_consumer.py, recurring_task_consumer.py, audit_consumer.py)
- Kafka config: `phase-5/backend/src/config/kafka_config.py`

### Principle P5-IV: Dapr Integration for Microservices

Dapr MUST be used as abstraction layer for Pub/Sub, State, Bindings, Secrets, and Service Invocation.

- **Dapr Pub/Sub (Kafka Abstraction)**:
  - Replace direct Kafka clients with Dapr Pub/Sub API: `POST http://localhost:3500/v1.0/publish/<pubsub-name>/<topic>`
  - Component: `pubsub.kafka` pointing to Redpanda Cloud
  - Benefits: Swap Kafka for RabbitMQ with config change, no code change
- **Dapr State Management (Conversation State)**:
  - Store conversation history via Dapr State API: `POST http://localhost:3500/v1.0/state/<statestore-name>`
  - Component: `state.postgresql` pointing to Neon DB
  - Benefits: Swap PostgreSQL for Redis with config change, automatic partitioning
- **Dapr Input Bindings (Scheduled Reminders)**:
  - Cron trigger for reminder checks: Dapr calls `/reminder-check` endpoint every 5 minutes
  - Component: `bindings.cron` with schedule `*/5 * * * *`
  - Benefits: No custom cron logic, Dapr handles scheduling
- **Dapr Secrets Management**:
  - Store API keys, DB credentials via Dapr Secrets API: `GET http://localhost:3500/v1.0/secrets/<secretstore-name>/<key>`
  - Component: `secretstores.kubernetes` (local) or `secretstores.azurekeyvault` (cloud)
  - Benefits: No hardcoded secrets, rotate without redeployment
- **Dapr Service Invocation**:
  - Frontend calls backend via Dapr: `POST http://localhost:3500/v1.0/invoke/backend-service/method/api/chat`
  - Benefits: Service discovery, retries, circuit breaker, mTLS built-in
- **Dapr Sidecar Injection**: All deployments MUST include Dapr annotations for sidecar injection
  - Annotation: `dapr.io/enabled: "true"`, `dapr.io/app-id: "<service-name>"`, `dapr.io/app-port: "<port>"`

**Rationale**: Dapr decouples application code from infrastructure (Kafka, DB, secrets). Sidecar pattern means app talks to localhost, Dapr handles infrastructure. Enables testing with in-memory components (Minikube) and production components (cloud) without code changes.

**Implementation Locations**:
- Dapr components: `phase-5/helm/todo-app/templates/dapr-components/` (pubsub.yaml, statestore.yaml, bindings.yaml, secrets.yaml)
- Deployment annotations: `phase-5/helm/todo-app/templates/backend-deployment.yaml` (add Dapr annotations)
- Backend integration: `phase-5/backend/src/integrations/dapr_client.py` (HTTP client for Dapr APIs)

### Principle P5-V: Multi-Cloud Production Deployment

Cloud deployments MUST support DigitalOcean Kubernetes (DOKS), Google Kubernetes Engine (GKE), and Azure Kubernetes Service (AKS).

- **Cloud Provider Selection**: Support all three via Helm value overrides
  - `values-doks.yaml`: DigitalOcean-specific settings (LoadBalancer, DigitalOcean Container Registry)
  - `values-gke.yaml`: GCP-specific settings (Ingress, Google Artifact Registry)
  - `values-aks.yaml`: Azure-specific settings (Application Gateway, Azure Container Registry)
- **Managed Kafka**: Use Redpanda Cloud Serverless tier (free, Kafka-compatible)
  - Connection via SASL_SSL, bootstrap servers from Kubernetes secret
  - Topics: Create via Redpanda Cloud UI or API (task.events, task.reminders, task.recurring, task.audit)
- **Managed Database**: Continue using Neon Serverless PostgreSQL
  - Connection pooling via Neon proxy
  - Connection string in Kubernetes secret
- **Ingress Configuration**:
  - Local (Minikube): NodePort services (no ingress)
  - Cloud: Kubernetes Ingress with TLS (Let's Encrypt cert-manager)
  - Ingress rules: `/` → frontend, `/api` → backend
- **Container Registry**:
  - Local: Minikube Docker daemon (`minikube docker-env`)
  - DOKS: DigitalOcean Container Registry
  - GKE: Google Artifact Registry
  - AKS: Azure Container Registry
- **CI/CD Pipeline**: GitHub Actions for automated deployment
  - Workflow: Lint → Test → Build images → Push to registry → Deploy to cluster via Helm
  - Secrets: Kubeconfig, registry credentials, Kafka creds stored in GitHub Secrets
- **Environment Separation**:
  - `staging` namespace: Pre-production testing with real cloud resources
  - `production` namespace: Production deployment with HPA, monitoring, alerts

**Rationale**: Multi-cloud support prevents vendor lock-in, enables cost optimization (DOKS is cheaper than GKE/AKS for small workloads), and provides disaster recovery options. Helm value overrides allow same charts to work across clouds. Managed Kafka (Redpanda Cloud) and managed DB (Neon) reduce operational burden.

**Implementation Locations**:
- Helm values: `phase-5/helm/todo-app/` (values-doks.yaml, values-gke.yaml, values-aks.yaml)
- Ingress: `phase-5/helm/todo-app/templates/ingress.yaml`
- CI/CD: `.github/workflows/deploy-phase5.yml`
- Terraform (optional): `phase-5/terraform/` (provision DOKS/GKE/AKS clusters)

### Principle P5-VI: Monitoring and Observability

Production deployments MUST include logging, metrics, and tracing for operational visibility.

- **Structured Logging**: All services MUST log in JSON format to stdout
  - Fields: timestamp (ISO8601), level (DEBUG/INFO/WARN/ERROR), service, user_id, request_id, message, context (JSON)
  - Log aggregation: Kubernetes captures stdout → send to ELK/Loki/Datadog (future)
- **Metrics**: Expose Prometheus-compatible metrics endpoints
  - Backend: `/metrics` endpoint with `prometheus-fastapi-instrumentator`
  - Metrics: HTTP request rate, latency (p50, p95, p99), error rate, active connections, Kafka lag
  - Frontend: Web Vitals (LCP, FID, CLS) via Next.js analytics
- **Tracing**: Distributed tracing for cross-service requests
  - Use OpenTelemetry SDK for trace context propagation
  - Trace spans: API request → Kafka publish → Consumer processing → Database query
  - Export to Jaeger/Zipkin (future) or Datadog APM
- **Health Dashboards**: Kubernetes Dashboard or Grafana for cluster health
  - Pod status, CPU/memory usage, HPA scaling events
  - Kafka consumer lag (alert if > 1000 messages)
  - Database connection pool utilization
- **Alerting**: Define alerts for critical conditions
  - Pod CrashLoopBackOff → PagerDuty/Slack alert
  - Backend error rate > 5% → Alert
  - Kafka consumer lag > 5 minutes → Alert
  - Database connection pool exhausted → Alert

**Rationale**: Production systems MUST be observable. JSON logs enable structured querying. Prometheus metrics integrate with Kubernetes ecosystem. OpenTelemetry is vendor-neutral tracing standard. Alerting prevents silent failures. Without observability, debugging production issues is guesswork.

**Implementation Locations**:
- Logging config: `phase-5/backend/src/config/logging_config.py` (JSON formatter)
- Metrics endpoint: `phase-5/backend/src/main.py` (add Prometheus instrumentator)
- Tracing: `phase-5/backend/src/integrations/opentelemetry.py` (OTEL SDK setup)
- Dashboards: `phase-5/helm/todo-app/dashboards/` (Grafana JSON definitions)

### Principle P5-VII: Testing Strategy for Cloud-Native Systems

Phase 5 testing MUST include integration tests, load tests, and chaos engineering.

- **Integration Tests**: Test full stack locally before cloud deployment
  - Docker Compose: frontend + backend + Postgres + Redpanda (Kafka) + Dapr
  - Test scenarios: Create recurring task → complete → verify next occurrence created
  - Test Kafka: Publish event → verify consumer processes → verify audit log entry
  - Run: `docker-compose -f docker-compose.test.yml up --abort-on-container-exit`
- **Load Tests**: Simulate production traffic with k6 or Locust
  - Scenarios: 100 concurrent users creating/updating tasks
  - Metrics: p95 latency < 500ms, error rate < 1%, throughput > 100 req/s
  - HPA validation: Backend scales from 2 → 5 pods under load
- **Chaos Engineering**: Validate resilience with fault injection
  - Kill backend pod → verify HPA respins → verify no request failures
  - Disconnect Kafka → verify messages queue → verify replay after reconnect
  - Disconnect database → verify readiness probe fails → verify no traffic routed to unhealthy pod
  - Tools: Chaos Mesh (Kubernetes-native) or manual kubectl delete pod
- **End-to-End (E2E) Tests**: Playwright/Cypress for critical user flows
  - Flow: Login → Create recurring task → Mark complete → Verify next occurrence appears in list
  - Run against staging environment before production deployment
- **Contract Tests**: Verify MCP tool contracts with Pact or manual JSON schema validation
  - Ensure agent can invoke tools with expected parameters
  - Ensure tools return expected response structure

**Rationale**: Integration tests catch cross-service issues before deployment. Load tests validate HPA and resource limits. Chaos engineering proves resilience claims (self-healing, no single point of failure). E2E tests validate user experience. Contract tests prevent breaking changes to MCP tools.

**Implementation Locations**:
- Integration tests: `phase-5/tests/integration/` (pytest with Docker Compose)
- Load tests: `phase-5/tests/load/k6-script.js` (k6 load test script)
- Chaos tests: `phase-5/tests/chaos/chaos-scenarios.yaml` (Chaos Mesh experiments)
- E2E tests: `phase-5/tests/e2e/` (Playwright tests)

### Principle P5-VIII: Security Hardening for Production

Production deployments MUST include security best practices and compliance controls.

- **Network Policies**: Restrict pod-to-pod communication
  - Default deny all ingress/egress
  - Allow: frontend → backend, backend → Kafka, backend → Neon DB
  - Deny: frontend → Kafka, frontend → Neon DB
- **Pod Security Standards**: Enforce restricted pod security policies
  - Non-root user (UID > 1000)
  - Read-only root filesystem
  - Drop all capabilities except NET_BIND_SERVICE (for port 80/443)
  - No privileged containers
- **Image Scanning**: Scan container images for vulnerabilities
  - Use Trivy or Snyk in CI/CD pipeline
  - Block deployment if HIGH/CRITICAL vulnerabilities found
  - Base images: Use distroless or Alpine Linux
- **Secrets Management**: Never commit secrets to Git
  - Local: Kubernetes secrets via `kubectl create secret`
  - Cloud: External secret stores (Azure Key Vault, GCP Secret Manager, AWS Secrets Manager)
  - Dapr secrets component for abstraction
- **TLS Everywhere**: Encrypt in-transit communication
  - Frontend ↔ Backend: TLS via Ingress (Let's Encrypt cert-manager)
  - Backend ↔ Kafka: SASL_SSL (Redpanda Cloud)
  - Backend ↔ Database: TLS (Neon enforces TLS by default)
  - Pod ↔ Pod: Dapr mTLS (mutual TLS between sidecars)
- **Rate Limiting**: Protect APIs from abuse
  - Backend: Rate limit per user (100 requests/minute) using Redis or in-memory store
  - Ingress: Rate limit per IP (1000 requests/minute) using Nginx ingress annotations
- **Audit Logging**: Log all security-relevant events
  - Failed authentication attempts → audit log
  - Cross-user access attempts (P3-IV violations) → audit log + alert
  - Admin actions (e.g., manual DB changes) → audit log

**Rationale**: Production systems are internet-facing and require defense in depth. Network policies limit blast radius. Pod security prevents container escapes. Image scanning catches known CVEs. Secrets management prevents credential leakage. TLS prevents man-in-the-middle attacks. Rate limiting prevents DoS. Audit logs enable forensics and compliance (GDPR, SOC2).

**Implementation Locations**:
- Network policies: `phase-5/helm/todo-app/templates/network-policies.yaml`
- Pod security: `phase-5/helm/todo-app/templates/backend-deployment.yaml` (securityContext)
- Image scanning: `.github/workflows/security-scan.yml` (Trivy GitHub Action)
- Rate limiting: `phase-5/backend/src/middleware/rate_limiter.py` (FastAPI middleware)

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
- **4.0.0** (2026-01-11): Added Phase 5 Advanced Cloud Deployment Principles (P5-I through P5-VIII) for recurring tasks (RRULE/RFC 5545), intermediate features (priorities, tags, search, filter, sort), event-driven architecture (Kafka via Redpanda Cloud), Dapr integration (Pub/Sub, State, Bindings, Secrets, Service Invocation), multi-cloud production deployment (DOKS/GKE/AKS), monitoring/observability (logging, metrics, tracing), testing strategy (integration, load, chaos, E2E), and security hardening (network policies, TLS, rate limiting, audit logging). MAJOR bump due to paradigm shift from local-first to production cloud with event-driven architecture, managed Kafka, and advanced feature set requiring significant operational changes.

**Version**: 4.0.0 | **Ratified**: 2025-12-06 | **Last Amended**: 2026-01-11
