 # Implementation Plan: Enterprise-Grade Cloud Infrastructure (Phase V)

      **Branch**: `013-enterprise-cloud-infra` | **Date**: 2026-01-13 | **Spec**: [spec.md](./spec.md)
      **Input**: Feature specification from `/specs/013-enterprise-cloud-infra/spec.md`

      **Execution Model**: This plan will be executed by the `phase5-cloud-deployment-engineer` subagent using spec-driven methodology. NO manual
      implementation permitted.

      ---

      ## Summary

      Transform the Todo Chatbot Platform from a monolithic local Kubernetes deployment into an enterprise-grade, cloud-native distributed system
      with event-driven architecture, recurring task engine, and production-ready Azure Kubernetes Service (AKS) deployment.

      **Core Deliverables**:
      1. **Event-Driven Architecture**: Apache Kafka (Redpanda Cloud Free Tier) with Dapr Pub/Sub abstraction, CloudEvents format, partitioned by
      user_id for ordering guarantees
      2. **Recurring Task Engine**: Standalone microservice implementing RRULE (RFC 5545) patterns for daily/weekly/monthly task recurrence with <5s
       generation latency
      3. **Production Cloud Deployment**: Azure Kubernetes Service (AKS) with 3 availability zones, mTLS enabled, secrets from Azure Key Vault,
      observability via Prometheus/Grafana
      4. **Advanced Task Features**: Priorities (4 levels), tags (7 predefined categories), full-text search (PostgreSQL tsvector), cumulative
      filters, multi-dimension sort
      5. **Comprehensive Testing**: Integration tests (Docker Compose), load tests (k6, 1000 concurrent users), chaos tests (Chaos Mesh), E2E tests
      (Playwright)

      **Technical Approach**: Build three independent microservices (Backend API, Recurring Task Service, Notification Service) communicating
      exclusively via Dapr Pub/Sub over Kafka. Deploy locally via Minikube with self-hosted Kafka (Bitnami Helm chart) for validation, then migrate
      to production AKS with Redpanda Cloud Serverless. Use Dapr Jobs API for all scheduling (eliminating cron and database polling). All work
      isolated in `/phase-5` folder with zero modifications to Phase III/IV code.

      **Timeline**: 8 weeks (10 phases, weeks 6-7 have 3 parallel workstreams)
      **Budget**: <$500/month cloud costs for 1000 users, $0 Redpanda (free tier $300 credits)
      **Risk Level**: MEDIUM (mitigated with comprehensive testing, incremental deployment, fallback plans)

      ---

      ## Technical Context

      **Language/Version**: Python 3.11 (backend services), TypeScript 5.x (frontend), Next.js 16 (SSR)

      **Primary Dependencies**:
      - Backend: FastAPI 0.124.0, Dapr SDK 1.15+, OpenAI Agents SDK 0.1.x, FastMCP, aiokafka 0.11+, python-dateutil 2.9+, SQLAlchemy 2.0
      - Frontend: React 19.2.1, TailwindCSS, Lucide icons, Framer Motion

      **Storage**:
      - Primary: PostgreSQL 16 (Neon Serverless) - tasks, recurring_task_series, reminders
      - Event Log: Kafka 3.6+ (Redpanda Cloud Serverless - production, Bitnami Kafka 29.x - local)
      - State: Dapr PostgreSQL state store (chatbot conversation history only)

      **Testing**:
      - Unit: pytest (Python), jest (TypeScript), 80% coverage target
      - Integration: Docker Compose with real Kafka + PostgreSQL
      - Contract: OpenAPI schema validation, CloudEvents schema validation
      - Load: k6 (1000 concurrent users, p95 <500ms target)
      - Chaos: Chaos Mesh (pod kill, network delay, Kafka disconnect)
      - E2E: Playwright (critical user flows in staging)

      **Target Platform**:
      - Production: Azure Kubernetes Service (AKS) 1.29+, 3 availability zones
      - Local: Minikube 1.35+, Docker Desktop
      - Containers: Linux (Debian 12 Slim base images)

      **Project Type**: Web application with microservices architecture (3 backend services + 1 frontend)

      **Performance Goals**:
      - **API Response Time**: p95 <500ms for task CRUD operations under 1000 concurrent users
      - **Event Processing Latency**: p95 <1 second from Kafka publish to consumer processing
      - **Recurring Task Generation**: <5 seconds from task completion to next instance creation
      - **Throughput**: 1000 task operations/second sustained (create, update, complete, delete)
      - **Horizontal Scalability**: Support 10,000 concurrent users via Kubernetes HPA (no code changes)
      - **Consumer Lag**: <5 seconds during normal operation, <10 seconds during 10x load spike

      **Constraints** (STRICT ENFORCEMENT):
      - **NO Direct Kafka Clients**: MUST use Dapr Pub/Sub components exclusively (no `confluent-kafka-python`, `kafka-python`, or direct Kafka
      APIs)
      - **NO Database Polling**: MUST use Dapr Jobs API for all scheduling (no cron jobs, no periodic database queries, no time-based polling)
      - **NO Task Data in Dapr State Store**: PostgreSQL state store ONLY for chatbot conversation history (task data remains in primary Neon
      database)
      - **Phase-5 Folder Isolation**: ALL code, config, infrastructure MUST live in `/phase-5` folder (zero modifications to Phase III/IV code
      outside this folder)
      - **Redpanda Cloud Free Tier Only**: MUST use Redpanda Cloud Serverless free tier ($300 credits), NOT Confluent Cloud or other Kafka providers
      - **Azure AKS Only**: Cloud deployment targets Azure AKS exclusively (GKE mentioned for documentation/comparison only, not active deployment)
      - **mTLS Mandatory in Production**: Dapr mTLS MUST be enabled in staging and production environments (optional for local development)
      - **At-Least-Once Delivery**: System guarantees at-least-once delivery (exactly-once semantics NOT required, too complex)
      - **Consumer Idempotency**: ALL event consumers MUST implement idempotency logic via event_id deduplication
      - **Subagent Implementation**: ALL work MUST be delegated to `phase5-cloud-deployment-engineer` subagent (no manual coding by user)

      **Scale/Scope**:
      - **Users**: 10,000 concurrent users, 100,000 daily active users (target capacity)
      - **Data Volume**: 1 million events/day (avg 11.5 events/second), 50GB Kafka retention (30 days production, 7 days local)
      - **Microservices**: 3 independent services (backend-api, recurring-task-service, notification-service)
      - **Kafka Topics**: 6 topics total (3 primary: task-operations, alerts, task-modifications; 3 DLQ: task-operations-dlq, alerts-dlq,
      task-modifications-dlq)
      - **Infrastructure**: 3 AKS node pools across 3 Azure availability zones, 99.99% SLA target
      - **Cloud Regions**: Single-region deployment (Azure East US or West Europe), multi-region documentation-only (not implemented)
      - **Lines of Code**: ~15,000 LOC (backend services), ~5,000 LOC (frontend extensions), ~3,000 LOC (infrastructure as code)

      ---

      ## Constitution Check

      *GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

      ### Phase 3: AI Chatbot Principles

      | Principle | Status | Notes |
      |-----------|--------|-------|
      | **P3-I: SDK Mandate** | ✅ PASS | OpenAI Agents SDK + FastMCP already used in Phase IV. No changes required. Event-driven architecture does
      not affect chatbot SDK usage. |
      | **P3-II: Stateless Architecture** | ✅ PASS | Backend remains stateless. Event-driven architecture enhances this principle (no in-memory
      conversation state, all state in Dapr PostgreSQL state store). |
      | **P3-III: MCP Tool Design** | ⚠️ EXTEND | **JUSTIFIED EXTENSION**: New MCP tools required for Phase V features: `set_recurring` (create
      recurring task), `set_priority` (update task priority), `add_tag` (add tag to task), `remove_tag` (remove tag from task). All tools follow
      stateless, single-purpose pattern from P3-III. No architectural violations. |
      | **P3-IV: User Isolation Security** | ✅ PASS | All Kafka events partitioned by `user_id` for per-user ordering. All database queries
      filtered by `user_id`. Recurring service and notification service enforce user isolation in all operations. |
      | **P3-V: Conversation Persistence** | ✅ PASS | Conversation history stored in Dapr PostgreSQL state store (unchanged from Phase III/IV).
      Event-driven task operations do not affect conversation persistence. |
      | **P3-VI: Agent Determinism** | ✅ PASS | Agent behavior remains deterministic. New MCP tools (`set_recurring`, `set_priority`, `add_tag`,
      `remove_tag`) documented in agent instructions with clear intent-to-tool mapping. |
      | **P3-VII: Testing Requirements** | ⚠️ EXTEND | **JUSTIFIED EXTENSION**: Integration tests required for Kafka event flow (publish → consume →
       verify), recurring task generation (complete → next instance created), multi-service communication. New failure modes introduced by
      event-driven architecture (message loss, ordering violations, duplicate processing). Phase V testing strategy includes comprehensive
      integration tests in Docker Compose environment. |

      ### Phase 4: Cloud Native Deployment Principles

      | Principle | Status | Notes |
      |-----------|--------|-------|
      | **P4-I: AI-Native Infrastructure** | ✅ PASS | ALL Dockerfiles, Helm charts, Kubernetes manifests AI-generated via
      `phase5-cloud-deployment-engineer` subagent. No manual YAML/Terraform authoring. Infrastructure requirements specified in natural language, AI
       converts to code. |
      | **P4-II: Local-First Kubernetes** | ✅ PASS | Minikube deployment validated BEFORE cloud deployment. Kafka runs inside Minikube cluster via
      Bitnami Helm chart (self-hosted). Complete local environment with Dapr, Kafka, all services functional on developer laptops. |
      | **P4-III: Helm-Driven Configuration** | ✅ PASS | Helm charts extended with Dapr component templates. Separate values files: `values.yaml`
      (production defaults), `values-minikube.yaml` (local overrides), `values-aks.yaml` (Azure overrides), `values-staging.yaml` (staging),
      `values-prod.yaml` (production). All Dapr components parameterized via Helm values. |
      | **P4-IV: Resilience and Health Monitoring** | ✅ PASS | Liveness/readiness probes extended to recurring-task-service (`/health`, `/ready`
      endpoints) and notification-service. Probes check Kafka connectivity, database connectivity, Dapr sidecar health. |
      | **P4-V: Horizontal Pod Autoscaling** | ✅ PASS | HPA definitions for all 3 services: `backend-api` (min 2, max 50), `recurring-task-service`
       (min 2, max 12 = partition count), `notification-service` (min 2, max 10). Target CPU: 70%. Minikube HPA testing validates production scaling
       behavior. |
      | **P4-VI: Observability and Verification** | ⚠️ EXTEND | **JUSTIFIED EXTENSION**: Verification commands extended to include Kafka-specific
      health checks (`kubectl exec kafka-0 -- kafka-topics.sh --list`), Dapr sidecar status (`kubectl get pods -o
      jsonpath='{.spec.containers[*].name}'`), event consumer lag (`kafka-consumer-groups.sh --describe`). New microservices introduce new
      observability requirements. |

      ### Phase 5: Advanced Cloud Deployment Principles (NEW)

      All Phase 5 principles are NEW for this phase and represent the core architectural additions:

      | Principle | Status | Notes |
      |-----------|--------|-------|
      | **P5-I: Recurring Task Architecture** | 🔨 NEW | RRULE (RFC 5545) patterns via `python-dateutil` library. Event-driven generation:
      task.completed event → Recurring Service calculates next occurrence → creates new task instance. All recurring logic in standalone
      microservice (not in backend API). |
      | **P5-II: Intermediate Features Architecture** | 🔨 NEW | Priorities (VERY_IMPORTANT, HIGH, MEDIUM, LOW enum), tags (7 predefined categories
      in array field), full-text search (PostgreSQL `tsvector`), cumulative filters (AND logic), multi-dimension sort (priority first, then
      due_date). |
      | **P5-III: Event-Driven Architecture with Kafka** | 🔨 NEW | 3 primary topics (task-operations, alerts, task-modifications), CloudEvents
      format (id, type, source, time, data), DLQs for failed messages, partitioned by `user_id` for per-user ordering, 30-day retention production /
       7-day local. |
      | **P5-IV: Dapr Integration for Microservices** | 🔨 NEW | Dapr Pub/Sub (Kafka abstraction), Dapr State (PostgreSQL for conversation history),
       Dapr Jobs API (reminder scheduling), Dapr Secrets (Azure Key Vault production / K8s Secrets local), Dapr Service Invocation (mTLS between
      services). |
      | **P5-V: Multi-Cloud Production Deployment** | 🔨 NEW | AKS primary target (3 AZs, 99.99% SLA), Redpanda Cloud Serverless (free tier), Neon
      PostgreSQL (unchanged), Helm value overrides for multi-environment (local, staging, production), Azure Container Registry (ACR) for images. |
      | **P5-VI: Monitoring and Observability** | 🔨 NEW | Prometheus metrics (`/metrics` endpoint on all services), Grafana dashboards (event
      throughput, consumer lag, error rate), structured JSON logging (stdout/stderr → Azure Monitor Agent → Azure Log Analytics), distributed
      tracing (Zipkin, 1% sampling production). |
      | **P5-VII: Testing Strategy for Cloud-Native** | 🔨 NEW | Integration tests (Docker Compose: frontend + backend + Kafka + Postgres + Dapr),
      load tests (k6, 1000 concurrent users), chaos tests (Chaos Mesh: pod kill, network delay), E2E tests (Playwright in staging), contract tests
      (OpenAPI/CloudEvents schema validation). |
      | **P5-VIII: Security Hardening for Production** | 🔨 NEW | Network Policies (default deny, explicit allow frontend → backend), pod security
      standards (non-root UID >1000, read-only root filesystem), image scanning (Trivy, block HIGH/CRITICAL), mTLS (Dapr, 24h cert rotation), TLS
      ingress (cert-manager, Let's Encrypt), rate limiting (100 req/min per user). |

      ### Gate Evaluation

      ✅ **ALL GATES PASS** with justified extensions:

      1. **P3-III Extension (New MCP Tools)**: Justified. New features (recurring tasks, priorities, tags) require new chatbot tools for user
      interaction. All tools follow the existing single-purpose, stateless design pattern from P3-III. No architectural violations.

      2. **P3-VII Extension (Integration Tests)**: Justified. Event-driven architecture introduces asynchronous communication patterns and new
      failure modes (message loss, out-of-order delivery, duplicate processing). Kafka-specific integration tests required to validate at-least-once
       delivery, idempotency, and consumer lag. Docker Compose test environment mirrors production topology.

      3. **P4-VI Extension (Observability)**: Justified. New microservices (recurring-task-service, notification-service) and Kafka messaging
      infrastructure introduce new observability requirements. Must monitor consumer lag (alerts topic, task-operations topic), event throughput
      (messages/second by topic), DLQ depth (dead-letter queue message count). Grafana dashboards and Prometheus metrics extended.

      4. **Phase 5 Principles (All New)**: Justified. Enterprise-grade cloud deployment with event-driven architecture represents a fundamental
      paradigm shift from Phase IV's monolithic local deployment. These 8 new principles govern the distributed system architecture, production
      cloud infrastructure, and operational practices required for Phase V.

      **No Constitutional Violations**: All architectural decisions align with existing principles or extend them with clear justification. No
      "complexity for complexity's sake" - every addition directly addresses specification requirements (recurring tasks, event-driven architecture,
       production AKS deployment).

      ---

      ## Project Structure

      ### Documentation (this feature - /specs/013-enterprise-cloud-infra/)

      ```text
      specs/013-enterprise-cloud-infra/
      ├── plan.md              # This file (/sp.plan command output)
      ├── research.md          # Phase 0 output: Technology research (Dapr Jobs API, RRULE, Kafka partitioning)
      ├── data-model.md        # Phase 1 output: Entity schemas (RecurringTaskSeries, TaskInstance, TaskEvent, Reminder, DaprJob)
      ├── quickstart.md        # Phase 1 output: Developer onboarding guide (prerequisites, setup, verification)
      ├── contracts/           # Phase 1 output: API contracts, event schemas, Dapr components
      │   ├── events/
      │   │   ├── task-operations.schema.json     # CloudEvents schema for task.created, task.completed, task.deleted
      │   │   ├── alerts.schema.json              # CloudEvents schema for alert.scheduled, alert.cancelled
      │   │   └── task-modifications.schema.json  # CloudEvents schema for task.updated
      │   ├── api/
      │   │   ├── recurring-task-api.openapi.yaml  # Recurring Task Service REST API (create series, edit series, delete series)
      │   │   ├── notification-api.openapi.yaml    # Notification Service REST API (schedule reminder, cancel reminder)
      │   │   └── backend-api-extensions.openapi.yaml  # Backend API extensions (priorities, tags, search, filter, sort)
      │   └── dapr/
      │       ├── pubsub.component.yaml           # Dapr Pub/Sub component (Kafka configuration, topics, partitioning)
      │       ├── statestore.component.yaml       # Dapr State component (PostgreSQL for conversation history)
      │       ├── jobs.component.yaml             # Dapr Jobs API configuration (scheduler, failure policies)
      │       └── secretstore.component.yaml      # Dapr Secrets component (Azure Key Vault production, K8s Secrets local)
      └── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
      ```

      ### Source Code (repository root - /phase-5/)

      **Structure Decision**: Web application with microservices architecture (3 backend services + 1 frontend). Three independent backend services
      communicate exclusively via Dapr Pub/Sub over Kafka. Frontend remains largely unchanged from Phase IV, consuming backend API extensions via
      existing REST endpoints.

      ```text
      phase-5/
      ├── backend/                     # Main Backend API Service (FastAPI + MCP Tools)
      │   ├── src/
      │   │   ├── models/
      │   │   │   ├── task.py          # EXTENDED: Add priority, tags, is_recurring, recurrence_pattern, series_id, next_occurrence
      │   │   │   ├── recurring_task_series.py  # NEW: RecurringTaskSeries entity (series_id, user_id, base_task_template, recurrence_pattern,
      is_active)
      │   │   │   ├── task_event.py    # NEW: TaskEvent entity (event_id, event_type, user_id, task_id, payload, published_at)
      │   │   │   └── reminder.py      # EXTENDED: Add job_name field (Dapr Jobs API reference for cancellation)
      │   │   ├── services/
      │   │   │   ├── task_service.py  # EXTENDED: Publish Kafka events on create/update/complete/delete via Dapr Pub/Sub
      │   │   │   ├── search_service.py  # NEW: Full-text search with PostgreSQL tsvector and ts_rank relevance ranking
      │   │   │   ├── filter_service.py  # NEW: Cumulative filter logic (status AND priority AND due_date)
      │   │   │   ├── sort_service.py    # NEW: Multi-dimension sort (priority first, then due_date with NULLS LAST)
      │   │   │   └── kafka_producer.py  # NEW: Dapr Pub/Sub producer (async, CloudEvents format)
      │   │   ├── api/
      │   │   │   ├── tasks.py         # EXTENDED: Add query params (search, priority, tags, sort, order, page, per_page)
      │   │   │   └── recurring.py     # NEW: Recurring task management endpoints (POST /recurring-tasks, PATCH /recurring-tasks/{series_id}, DELETE
       /recurring-tasks/{series_id})
      │   │   ├── integrations/
      │   │   │   └── dapr_client.py   # NEW: HTTP client for Dapr APIs (Pub/Sub publish, Secrets get, State get/set, Service Invocation)
      │   │   ├── config/
      │   │   │   ├── kafka_config.py  # NEW: Kafka topic names (task-operations, alerts, task-modifications), partition strategy (user_id hash)
      │   │   │   └── logging_config.py  # NEW: Structured JSON logging configuration (timestamp, level, service, user_id, request_id, message,
      context)
      │   │   └── schemas/
      │   │       └── events.py        # NEW: CloudEvents schemas (TaskCreatedEvent, TaskCompletedEvent, TaskUpdatedEvent, TaskDeletedEvent,
      AlertScheduledEvent)
      │   ├── mcp_server/
      │   │   └── tools/
      │   │       ├── set_recurring.py  # NEW: MCP tool for chatbot recurring task creation (params: user_id, task_id, recurrence_pattern)
      │   │       ├── set_priority.py   # NEW: MCP tool for priority updates (params: user_id, task_id, priority)
      │   │       ├── add_tag.py        # NEW: MCP tool for tag management (params: user_id, task_id, tag, validation against predefined list)
      │   │       └── remove_tag.py     # NEW: MCP tool for tag removal (params: user_id, task_id, tag)
      │   ├── migrations/              # Alembic database migrations
      │   │   └── versions/
      │   │       ├── 001_add_recurring_fields.py  # NEW: Add series_id, recurrence_pattern, is_recurring, next_occurrence to tasks table
      │   │       └── 002_add_priority_tags.py     # NEW: Add priority (enum), tags (array) to tasks table
      │   ├── tests/
      │   │   ├── integration/
      │   │   │   ├── test_event_flow.py  # NEW: Test Kafka event publishing (backend → Kafka → consumer verification)
      │   │   │   ├── test_recurring_task_generation.py  # NEW: Test end-to-end recurring flow (complete task → next instance created <5s)
      │   │   │   └── test_search_filter_sort.py  # NEW: Test search/filter/sort API endpoints
      │   │   ├── unit/
      │   │   │   ├── test_search_service.py  # NEW: Test full-text search ranking algorithm
      │   │   │   ├── test_filter_service.py  # NEW: Test cumulative filter AND logic
      │   │   │   └── test_kafka_producer.py  # NEW: Test CloudEvents format, partition key calculation
      │   │   └── contract/
      │   │       └── test_api_contracts.py  # NEW: Validate OpenAPI schemas for all endpoints
      │   ├── Dockerfile               # EXTENDED: Add Dapr sidecar compatibility (EXPOSE 3500, health check endpoint)
      │   └── requirements.txt         # EXTENDED: Add aiokafka, python-dateutil, dapr-sdk, prometheus-fastapi-instrumentator
      │
      ├── services/                    # NEW: Microservices directory
      │   ├── recurring-task-service/  # NEW: Recurring Task Service (standalone microservice, consumes task.completed events)
      │   │   ├── src/
      │   │   │   ├── main.py          # FastAPI app with Dapr Pub/Sub subscriber endpoints (/dapr/subscribe, /task-completed-handler)
      │   │   │   ├── consumers/
      │   │   │   │   └── task_completion_consumer.py  # Consumes task.completed events from task-operations topic, triggers next instance
      generation
      │   │   │   ├── services/
      │   │   │   │   ├── rrule_service.py  # RRULE parsing (python-dateutil rrule module) and next occurrence calculation (handles FREQ, INTERVAL,
      BYDAY, COUNT, UNTIL)
      │   │   │   │   └── task_generation_service.py  # Creates next task instance in PostgreSQL (inherits title, description, priority, tags from
      parent series)
      │   │   │   ├── models/
      │   │   │   │   ├── task_instance.py  # Shared task model (duplicated from backend for service isolation, no shared database code)
      │   │   │   │   └── recurring_task_series.py  # RecurringTaskSeries model
      │   │   │   └── config/
      │   │   │       ├── dapr_config.py  # Dapr component references (pubsub name, topic names, subscription configuration)
      │   │   │       └── database_config.py  # PostgreSQL connection (Neon database URL from Dapr Secrets)
      │   │   ├── tests/
      │   │   │   ├── unit/
      │   │   │   │   ├── test_rrule_service.py  # Test RRULE calculations (DAILY, WEEKLY, MONTHLY, YEARLY, edge cases: COUNT exhausted, UNTIL
      passed, leap years)
      │   │   │   │   └── test_task_generation_service.py  # Test task instance creation logic (field inheritance, due_date setting)
      │   │   │   └── integration/
      │   │   │       └── test_task_generation_flow.py  # Test end-to-end: publish task.completed → verify next instance in database <5s
      │   │   ├── Dockerfile
      │   │   └── requirements.txt     # aiokafka, dapr-sdk, python-dateutil, sqlalchemy, asyncpg, fastapi, uvicorn
      │   │
      │   └── notification-service/    # NEW: Notification Service (standalone microservice, consumes alerts topic, schedules reminders via Dapr
      Jobs API)
      │       ├── src/
      │       │   ├── main.py          # FastAPI app with Dapr Pub/Sub subscriber (/dapr/subscribe, /alert-scheduled-handler) and Jobs API callback
      endpoint (/reminder-callback)
      │       │   ├── consumers/
      │       │   │   ├── alert_consumer.py  # Consumes alert.scheduled events, schedules multiple reminders via Dapr Jobs API (one job per reminder
       time)
      │       │   │   └── cancellation_consumer.py  # Consumes task.completed/task.deleted events, deletes pending Dapr Jobs to cancel reminders
      │       │   ├── services/
      │       │   │   ├── email_service.py  # Email delivery via SMTP (aiosmtplib), retry logic (3 retries with exponential backoff), DLQ fallback
      on failure
      │       │   │   ├── push_service.py  # Push notification delivery via Firebase Cloud Messaging (firebase-admin SDK), retry logic
      │       │   │   └── dapr_jobs_service.py  # Dapr Jobs API client (schedule job via POST /v1.0-alpha1/jobs, delete job via DELETE)
      │       │   ├── models/
      │       │   │   └── reminder.py  # Reminder model (reminder_id, task_id, user_id, scheduled_time, reminder_type, status, job_name)
      │       │   └── config/
      │       │       ├── notification_config.py  # Email/push credentials from Dapr Secrets, SMTP host/port, Firebase project ID
      │       │       └── dapr_config.py  # Dapr Jobs API endpoint, subscription configuration
      │       ├── tests/
      │       │   ├── unit/
      │       │   │   ├── test_email_service.py  # Test email delivery with mock SMTP
      │       │   │   └── test_dapr_jobs_service.py  # Test Dapr Jobs API client (schedule, delete)
      │       │   └── integration/
      │       │       └── test_reminder_scheduling.py  # Test end-to-end: publish alert.scheduled → Dapr Job created → callback triggered at
      scheduled time → notification sent
      │       ├── Dockerfile
      │       └── requirements.txt     # aiokafka, dapr-sdk, aiosmtplib, firebase-admin, fastapi, uvicorn
      │
      ├── frontend/todo-app/           # Frontend (Next.js 16, mostly unchanged from Phase IV)
      │   ├── components/
      │   │   └── tasks/
      │   │       ├── FilterChips.tsx   # NEW: Removable filter chips UI (status, priority, due date filters with X button to remove)
      │   │       ├── SearchInput.tsx   # NEW: Debounced search input (300ms delay, updates query params)
      │   │       ├── SortDropdown.tsx  # NEW: Multi-dimension sort dropdown (Priority, Due Date, Created Date, Alphabetical with asc/desc toggle)
      │   │       ├── PriorityBadge.tsx # NEW: Priority display component (color-coded badges: red=VERY_IMPORTANT, orange=HIGH, yellow=MEDIUM,
      gray=LOW)
      │   │       └── TagInput.tsx      # NEW: Tag autocomplete input (Combobox with predefined 7 tags, multi-select)
      │   ├── lib/
      │   │   └── api/
      │   │       └── tasks.ts         # EXTENDED: Add search, filter, sort query params to API client functions
      │   ├── Dockerfile               # UNCHANGED: Existing Phase IV Dockerfile (multi-stage build, Next.js standalone output)
      │   └── package.json             # UNCHANGED: No new frontend dependencies (Combobox from existing shadcn/ui components)
      │
      ├── helm/                        # Helm Charts (infrastructure as code)
      │   └── todo-app/
      │       ├── Chart.yaml           # EXTENDED: Bump version to 2.0.0 (Phase V), appVersion to 5.0.0
      │       ├── values.yaml          # Production defaults (Redpanda Cloud connection, Azure Key Vault, 3 replicas, mTLS enabled)
      │       ├── values-minikube.yaml # Local development overrides (self-hosted Kafka via Bitnami chart, K8s Secrets, NodePort services, 1
      replica, mTLS disabled)
      │       ├── values-aks.yaml      # Azure AKS base configuration (ACR image registry, ingress enabled, TLS via cert-manager)
      │       ├── values-staging.yaml  # NEW: Staging environment overrides (develop branch, smaller node pool, 2 replicas, mTLS enabled)
      │       ├── values-prod.yaml     # NEW: Production environment overrides (main branch, full node pool, 3+ replicas, mTLS enforced, rate
      limiting enabled)
      │       ├── templates/
      │       │   ├── backend-deployment.yaml  # EXTENDED: Add Dapr annotations (dapr.io/enabled: "true", dapr.io/app-id: "backend-api",
      dapr.io/app-port: "8000", dapr.io/log-level: "info")
      │       │   ├── backend-service.yaml     # UNCHANGED: Existing ClusterIP service
      │       │   ├── recurring-service-deployment.yaml  # NEW: Recurring Task Service deployment with Dapr sidecar
      │       │   ├── recurring-service-service.yaml     # NEW: ClusterIP service for recurring service (only accessed via Dapr, no direct HTTP)
      │       │   ├── notification-service-deployment.yaml  # NEW: Notification Service deployment with Dapr sidecar
      │       │   ├── notification-service-service.yaml     # NEW: ClusterIP service for notification service
      │       │   ├── frontend-deployment.yaml  # UNCHANGED: Existing frontend deployment
      │       │   ├── frontend-service.yaml     # UNCHANGED: Existing frontend service
      │       │   ├── hpa/
      │       │   │   ├── backend-hpa.yaml      # EXTENDED: Tune HPA for event-driven workload (minReplicas: 2, maxReplicas: 50, targetCPU: 70%)
      │       │   │   ├── recurring-hpa.yaml    # NEW: HPA for recurring service (minReplicas: 2, maxReplicas: 12 = partition count, targetCPU: 70%)
      │       │   │   └── notification-hpa.yaml # NEW: HPA for notification service (minReplicas: 2, maxReplicas: 10, targetCPU: 70%)
      │       │   ├── dapr-components/
      │       │   │   ├── pubsub-kafka.yaml     # NEW: Dapr Pub/Sub component (type: pubsub.kafka, metadata: brokers, topics, partitions,
      consumerGroup)
      │       │   │   ├── statestore-postgres.yaml  # NEW: Dapr State component (type: state.postgresql, metadata: connectionString for conversation
       history)
      │       │   │   ├── jobs-api.yaml         # NEW: Dapr Jobs API configuration (schedulerHostAddress: dapr-scheduler:50006, failure policy:
      constant retry 3 times)
      │       │   │   └── secretstore-keyvault.yaml  # NEW: Dapr Secrets component (type: secretstores.azure.keyvault for production,
      secretstores.kubernetes.secrets for local)
      │       │   ├── network-policies/
      │       │   │   ├── default-deny.yaml     # NEW: Default deny all ingress/egress (Kubernetes NetworkPolicy)
      │       │   │   ├── allow-frontend-backend.yaml  # NEW: Allow frontend → backend communication
      │       │   │   ├── allow-backend-dapr.yaml      # NEW: Allow backend → Dapr sidecar → Kafka
      │       │   │   └── allow-recurring-dapr.yaml    # NEW: Allow recurring service → Dapr sidecar
      │       │   ├── ingress.yaml              # EXTENDED: Add TLS configuration (cert-manager annotations, tls.secretName, HTTP → HTTPS redirect)
      │       │   └── configmap.yaml            # EXTENDED: Add Kafka topic names, partition count, retention policies
      │       └── dashboards/
      │           └── grafana-dashboard.json    # NEW: Grafana dashboard JSON (event throughput panel, consumer lag panel, error rate panel, pod
      health panel)
      │
      ├── terraform/                   # NEW: Infrastructure as Code (Terraform for AKS provisioning)
      │   └── aks/
      │       ├── main.tf              # AKS cluster resource, node pools (system, backend, frontend), VNET, Azure Key Vault, Azure Container
      Registry (ACR), managed identity
      │       ├── variables.tf         # Input variables (azure_region: "eastus", node_count: 3, vm_sku: "Standard_D2s_v5", aks_version: "1.29")
      │       ├── outputs.tf           # Outputs (aks_cluster_name, aks_kubeconfig, acr_login_server, key_vault_name)
      │       ├── backend.tf           # Terraform state backend (Azure Blob Storage for remote state, state locking via lease)
      │       └── providers.tf         # Azure provider configuration (azurerm provider, version constraints)
      │
      ├── .github/
      │   └── workflows/
      │       ├── deploy-phase5.yml    # NEW: CI/CD pipeline for Phase V (build images → unit tests → integration tests → security scan → deploy to
      AKS → E2E tests → rollback on failure)
      │       └── security-scan.yml    # NEW: Trivy image scanning workflow (scan all 3 Docker images, fail on HIGH/CRITICAL vulnerabilities, upload
       results to GitHub Security tab)
      │
      ├── scripts/                     # Deployment Scripts
      │   ├── dev-up.sh                # NEW: Start Minikube, install Dapr (`dapr init -k`), deploy Kafka (Bitnami Helm chart), create topics,
      deploy all services via Helm
      │   ├── dev-down.sh              # NEW: Gracefully shut down services (`helm uninstall`), stop Kafka, stop Dapr, stop Minikube (preserves
      persistent volumes)
      │   ├── create-kafka-topics.sh   # NEW: Create 6 Kafka topics with 12 partitions each (task-operations, alerts, task-modifications + 3 DLQs)
      │   ├── deploy-aks.sh            # NEW: Deploy to AKS via Helm (`helm upgrade --install` with values-aks.yaml + environment-specific values
      file)
      │   └── rollback-aks.sh          # NEW: Rollback AKS deployment to previous Helm release (`helm rollback todo-app`)
      │
      ├── tests/                       # NEW: Phase V Testing Infrastructure
      │   ├── integration/
      │   │   ├── docker-compose.test.yml  # Docker Compose for local integration testing (postgres, kafka, dapr-placement, backend-api,
      recurring-service, notification-service)
      │   │   ├── test_event_driven_flow.py  # End-to-end test: POST /tasks → verify task.created event in Kafka → verify consumer processed event
      │   │   └── test_recurring_task_flow.py  # End-to-end test: Create recurring task → complete instance → verify next instance created <5s →
      verify RRULE calculation correct
      │   ├── load/
      │   │   ├── k6-script.js         # k6 load test script (1000 virtual users, task CRUD operations: 70% GET, 20% POST, 10% PATCH, ramp-up 1min,
      sustain 10min)
      │   │   └── k6-config.js         # k6 configuration (thresholds: p95 <500ms, error rate <1%, http_req_duration, http_req_failed)
      │   ├── chaos/
      │   │   ├── pod-kill.yaml        # Chaos Mesh experiment: randomly kill backend-api pod every 5 minutes, verify Kubernetes reschedules within
      30s, no request failures
      │   │   ├── network-delay.yaml   # Chaos Mesh experiment: inject 500ms network delay between backend and PostgreSQL, verify latency impact <1s
      │   │   └── kafka-disconnect.yaml # Chaos Mesh experiment: disconnect Kafka broker for 1 minute, verify messages queue in Dapr, replay after
      reconnection
      │   └── e2e/
      │       └── playwright/
      │           ├── recurring-tasks.spec.ts  # Playwright E2E test: Login → Create recurring daily task → Complete instance → Verify next instance
       appears in list
      │           └── search-filter-sort.spec.ts  # Playwright E2E test: Create tasks with different priorities/tags → Search by keyword → Apply
      filter → Verify results
      │
      ├── docs/                        # Documentation
      │   ├── ARCHITECTURE.md          # NEW: High-level system architecture (microservices diagram, event flows, service dependencies, data
      ownership, Dapr component usage)
      │   ├── KAFKA-TOPICS.md          # NEW: Topic naming convention, partitioning strategy (user_id hash), retention policies (30d prod, 7d
      local), consumer groups, DLQ handling
      │   ├── DAPR-INTEGRATION.md      # NEW: Dapr component configuration details, usage patterns (how to publish event, how to subscribe, how to
      schedule job), troubleshooting (sidecar not injected, component not loading)
      │   ├── DEPLOYMENT.md            # EXTENDED: Add AKS deployment procedures (Terraform provisioning, Helm deployment, verification steps,
      rollback procedures)
      │   ├── RUNBOOKS.md              # NEW: Operational runbooks (How to: restart service, clear DLQ, rotate secrets, investigate consumer lag,
      scale service manually, trigger manual backup)
      │   ├── MIGRATION.md             # NEW: Migration guide from Phase IV to Phase V (database schema changes via Alembic, config updates for
      Dapr, testing checklist, rollback plan)
      │   ├── API-REFERENCE.md         # NEW: OpenAPI-generated API documentation for all services (backend-api extensions, recurring-task-service,
      notification-service)
      │   ├── TESTING.md               # NEW: Test strategy overview, how to run tests locally (unit, integration, load, E2E), test environment
      setup (Docker Compose, Minikube)
      │   ├── TROUBLESHOOTING.md       # NEW: Common issues and solutions (Pod crash loop, Kafka connection failure, Dapr sidecar not injected,
      consumer lag high, DLQ accumulation)
      │   └── SECRETS.md               # EXTENDED: Add Azure Key Vault secret management procedures (how to add secret, how to rotate secret, how
      Dapr accesses secrets)
      │
      └── SUMMARIES/                   # Phase Summaries
          └── PHASE5-SUMMARY.md        # NEW: Final phase summary (architecture decisions, lessons learned, performance results, future
      improvements, jury presentation material)
      ```

      **Key Architectural Decisions in Structure**:

      1. **Microservices Separation**: Three services (backend-api, recurring-task-service, notification-service) deployed independently with
      separate Dockerfiles, Helm deployments, HPA definitions, and health endpoints. No shared code libraries (models duplicated for service
      isolation).

      2. **Dapr Abstraction Layer**: All inter-service communication via Dapr (no direct Kafka clients in application code, no direct HTTP calls
      between services). Dapr components defined in Helm chart under `dapr-components/` directory.

      3. **Event-Driven Communication**: Kafka topics partitioned by `user_id` hash (12 partitions) for per-user ordering guarantees. CloudEvents
      schema for all messages (standardized envelope). DLQ topics for failed messages (manual investigation required).

      4. **Multi-Environment Configuration**: Separate Helm values files for each environment (Minikube uses self-hosted Kafka via Bitnami chart,
      staging/production use Redpanda Cloud). Dapr component configurations parameterized via Helm values (broker addresses, authentication,
      secrets).

      5. **Testing Pyramid**: Unit tests in each service's `tests/unit/` (RRULE calculation, search ranking, idempotency), integration tests in
      `/phase-5/tests/integration/` (Docker Compose environment), load tests (`k6-script.js`), chaos tests (Chaos Mesh YAMLs), E2E tests (Playwright
       specs).

      6. **Infrastructure as Code**: Terraform for AKS provisioning (`terraform/aks/`), Helm for application deployment (`helm/todo-app/`), GitHub
      Actions for CI/CD automation (`.github/workflows/`).

      7. **Observability Built-In**: Prometheus metrics endpoint (`/metrics`) on all services, Grafana dashboard JSON definitions in Helm chart,
      structured JSON logging configuration in each service, Zipkin distributed tracing integration.

      ---

      ## Complexity Tracking

      **No Constitutional Violations Requiring Justification**. All Phase V design decisions align with existing constitution principles (P3-I
      through P5-VIII). Extensions to Phase 3/4 principles are justified in Constitution Check section above with clear rationale.

      ### Justified Architectural Complexity

      The following architectural patterns introduce complexity but are justified by specification requirements and constitution principles:

      | Architectural Pattern | Complexity Introduced | Justification | Simpler Alternative Rejected Because |
      |-----------------------|----------------------|---------------|-------------------------------------|
      | **3 Independent Microservices** (backend, recurring, notification) | Distributed system complexity: network calls, eventual consistency,
      distributed tracing, service discovery | Required by P5-IV (Dapr Integration) and event-driven architecture specification. Recurring task
      logic must be in standalone service (not in backend API) to enable independent scaling and fault isolation. Notification service must be
      standalone to support multi-reminder scheduling via Dapr Jobs API. | Monolithic backend with recurring logic embedded: Violates separation of
      concerns, makes recurring logic hard to scale independently (HPA would scale entire backend, not just recurring logic), couples notification
      scheduling to backend lifecycle (Jobs API callbacks require dedicated endpoint). |
      | **Event-Driven Architecture** (Kafka + Dapr Pub/Sub) | Asynchronous communication: eventual consistency, idempotency required, consumer lag
      monitoring, DLQ handling, partition rebalancing | Required by specification (FR-009 to FR-015). Enables decoupling of services (backend
      publishes events without knowing consumers), horizontal scaling of consumers (12 partitions support 12 consumer instances), audit trail (Kafka
       retains events for 30 days), resilience (if recurring service down, events queue in Kafka). | Synchronous HTTP calls between services: Cannot
       handle recurring service downtime (backend would block waiting for response), no event retention (if consumer down, events lost), tight
      coupling (backend must know all consumers), no horizontal scaling of consumers (each request to backend triggers direct call, cannot
      partition). |
      | **Dapr Abstraction Layer** (all communication via Dapr) | Dapr learning curve, sidecar resource overhead (~50Mi memory per pod), additional
      network hop (app → sidecar → destination), Dapr component configuration complexity | Required by P5-IV (Dapr Integration). Provides
      vendor-neutral abstraction (swap Kafka for RabbitMQ with config change, no code change), built-in mTLS between services (no custom TLS
      implementation), service discovery (no need to track service IPs), retry policies (no custom retry logic in each service), observability (Dapr
       metrics automatically exposed). | Direct Kafka clients + direct HTTP calls: Vendor lock-in (hard to swap Kafka), no automatic mTLS (must
      implement custom TLS for service-to-service), no automatic retries (must implement in each service), no automatic metrics (must instrument
      each service), harder to test (must mock Kafka and HTTP clients). |
      | **Dapr Jobs API for Scheduling** (no cron, no database polling) | Dapr Jobs API is relatively new (stable in Dapr 1.15, beta in 1.14), less
      mature than cron, requires learning new API patterns | Required by specification constraint (FR-018: NO database polling). Eliminates
      polling-induced database load (no periodic SELECT queries), enables distributed scheduling (Jobs API handles job distribution across
      instances), automatic retries (Jobs API failure policy with constant retry), graceful cancellation (DELETE job when task completed, no race
      conditions). | Custom cron scheduler with database polling: Violates specification constraint (NO database polling), polling every minute
      creates 1440 database queries/day (wasteful), polling interval determines reminder precision (1 minute polling = up to 1 minute delay), cannot
       cancel jobs gracefully (must mark reminder as cancelled in DB and skip during next poll cycle, potential race condition). |
      | **12 Kafka Partitions per Topic** | Partition count determines max consumer parallelism (cannot scale beyond 12 consumer instances per
      topic), rebalancing complexity (when consumer joins/leaves group, partitions reassigned), partition skew risk (if user_id distribution uneven,
       some partitions hot) | Enables horizontal scaling to 12 consumer instances per service (supports 10,000 concurrent users / 12 partitions =
      ~833 users per partition, acceptable). Guarantees per-user ordering (all events for user_id=X go to same partition, consumed in order).
      Balances throughput and operational complexity (fewer partitions = less throughput, more partitions = more operational overhead). | Single
      partition per topic: Guarantees global ordering but prevents horizontal scaling (only 1 consumer instance per topic, bottleneck at high load).
       100+ partitions: Excessive operational overhead (Kafka controller must track 100+ partition leaders, rebalancing takes longer), diminishing
      returns (10,000 users / 100 partitions = 100 users per partition, no significant benefit over 12 partitions). |

      **Conclusion**: All architectural complexity is justified by specification requirements (recurring tasks, event-driven architecture, Dapr
      integration) and constitution principles (P5-I through P5-VIII). No "complexity for complexity's sake" - every pattern addresses specific
      functional or non-functional requirements.

      ---

      ## Next Steps

      1. **Phase 0: Architecture Design** - Generate detailed artifacts:
         - `research.md`: Dapr Jobs API documentation review, python-dateutil RRULE examples, Kafka partitioning best practices, CloudEvents
      specification study
         - `data-model.md`: Complete entity schemas (RecurringTaskSeries, TaskInstance, TaskEvent, Reminder, DaprJob) with field types,
      relationships, constraints, indexes
         - `contracts/`: API contracts (OpenAPI YAML for 3 services), event schemas (CloudEvents JSON schemas for 6 event types), Dapr component
      YAMLs (Pub/Sub, State, Jobs, Secrets with both local and production configurations)
         - `quickstart.md`: Developer onboarding guide (prerequisites: Docker Desktop, Minikube, Dapr CLI, kubectl, Helm; setup steps with commands;
       verification steps with expected output)

      2. **Create PHR** (Prompt History Record):
         - Route: `history/prompts/013-enterprise-cloud-infra/`
         - Stage: `plan`
         - Title: "Phase V Enterprise Cloud Infrastructure Comprehensive Planning"
         - Full user prompt and assistant response preserved verbatim

      3. **Begin Implementation**:
         - Delegate to `phase5-cloud-deployment-engineer` subagent
         - Subagent follows 10-phase roadmap (107 atomic tasks)
         - Each task includes: Owner, Inputs, Outputs, Acceptance Criteria, Failure Conditions

      **Plan Status**: ✅ COMPLETE - Awaiting User Approval
      **Estimated Effort**: 8 weeks (10 phases with weeks 6-7 having 3 parallel workstreams)
      **Risk Level**: MEDIUM (14 identified risks with mitigation strategies)
      **Go/No-Go Decision**: Requires user approval and stakeholder sign-off before proceeding to Phase 0
