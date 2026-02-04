# Tasks: Enterprise-Grade Cloud Infrastructure (Phase V)

**Input**: Design documents from `/specs/013-enterprise-cloud-infra/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/
**Execution**: Delegated to `phase5-cloud-deployment-engineer` subagent (MANDATORY)

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: User story label (US1, US2, US3, US4, US5)
- All paths relative to `/phase-5/` folder

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and folder structure

- [X] T001 Create `/phase-5` directory structure (backend, services, frontend, helm, terraform, scripts, tests, docs) (already present just cross check)
- [X] T002 [P] Initialize backend FastAPI project with Dapr SDK, aiokafka, python-dateutil dependencies
- [X] T003 [P] Initialize recurring-task-service FastAPI project with dependencies
- [X] T004 [P] Initialize notification-service FastAPI project with dependencies( this is already implemented just check it)
- [X] T005 [P] Configure linting (ruff) and formatting (black) for all Python services
- [X] T006 [P] Create base Dockerfile templates for all three services

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T007 Setup PostgreSQL database migrations framework (Alembic) in backend/migrations/
- [X] T008 [P] Create Dapr component YAMLs (pubsub-kafka, jobs-api, secretstore, statestore) in helm/todo-app/templates/dapr-components/
- [X] T009 [P] Configure Kafka topic creation script in scripts/create-kafka-topics.sh (6 topics: task-operations, alerts, task-modifications + 3 DLQs)
- [X] T010 [P] Implement CloudEvents schema models in backend/src/schemas/events.py
- [X] T011 [P] Implement Dapr HTTP client in backend/src/integrations/dapr_client.py (Pub/Sub, Secrets, Service Invocation)
- [X] T012 Setup structured JSON logging configuration in all services (backend, recurring, notification)
- [X] T013 Create Helm values files (values.yaml, values-minikube.yaml, values-aks.yaml) in helm/todo-app/
- [X] T014 Create dev-up.sh script (Minikube start, Dapr init, Kafka deploy, topic creation, Helm install)
- [X] T015 Create dev-down.sh script (graceful shutdown, preserve volumes)

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Recurring Task Lifecycle Management (Priority: P1) 🎯 MVP

**Goal**: Enable users to create recurring tasks that auto-generate next instance on completion

**Independent Test**: Create daily recurring task, complete instance, verify next instance appears with correct due date

### Implementation for User Story 1

- [X] T016 [P] [US1] Create RecurringTaskSeries model in backend/src/models/recurring_task_series.py
- [X] T017 [P] [US1] Extend Task model with recurring fields (series_id, is_recurring, recurrence_pattern, next_occurrence) in backend/src/models/task.py
- [X] T018 [US1] Create Alembic migration 001_add_recurring_fields.py (add recurring columns to tasks table)
- [X] T019 [US1] Run migration on local dev database
- [X] T020 [P] [US1] Implement RRULE parsing service in services/recurring-task-service/src/services/rrule_service.py
- [X] T021 [P] [US1] Implement task generation service in services/recurring-task-service/src/services/task_generation_service.py
- [X] T022 [US1] Implement task completion event consumer in services/recurring-task-service/src/consumers/task_completion_consumer.py
- [X] T023 [US1] Create FastAPI app with Dapr subscriber endpoints in services/recurring-task-service/src/main.py
- [X] T024 [US1] Extend backend task service to publish task.completed events via Dapr Pub/Sub in backend/src/services/task_service.py
- [X] T025 [US1] Create POST /api/recurring-tasks endpoint in backend/src/api/recurring.py
- [X] T026 [US1] Create DELETE /api/recurring-tasks/{series_id} endpoint with cancellation logic
- [X] T027 [US1] Add Dapr sidecar annotations to recurring-service Helm deployment in helm/todo-app/templates/recurring-service-deployment.yaml
- [X] T028 [US1] Create recurring-service HPA definition (min 2, max 12) in helm/todo-app/templates/hpa/recurring-hpa.yaml

**Checkpoint**: Recurring task creation and auto-generation working end-to-end and implement the backend with frontend properly without compromising the ui and performance, test everything properly then move to phase 4

---

## Phase 4: User Story 2 - Event-Driven Task Synchronization (Priority: P1)

**Goal**: Real-time event propagation for all task operations across services

**Independent Test**: Create task in one service, verify event consumed by recurring service within 1 second

### Implementation for User Story 2

- [X] T029 [P] [US2] Create TaskEvent model in backend/src/models/task_event.py
- [X] T030 [P] [US2] Create Kafka producer service with CloudEvents format in backend/src/services/kafka_producer.py
- [X] T031 [US2] Extend task service to publish task.created, task.updated, task.deleted events in backend/src/services/task_service.py
- [X] T032 [US2] Implement event ID deduplication logic (idempotency) in recurring-task-service consumers
- [X] T033 [US2] Create DLQ consumer for task-operations-dlq in services/recurring-task-service/src/consumers/dlq_consumer.py
- [X] T034 [US2] Add retry policy with exponential backoff (3 retries, 5s interval) to Dapr Jobs component in contracts/dapr/jobs.component.yaml
- [X] T035 [US2] Create integration test for event flow in tests/integration/test_event_flow.py (publish → Kafka → consume → verify)

**Checkpoint**: All task operations emit events and consumers process idempotently

---

## Phase 5: User Story 3 - One-Command Local Development Setup (Priority: P2)

**Goal**: Single command spins up entire microservices stack locally

**Independent Test**: Run `./scripts/dev-up.sh`, verify all services accessible via port-forwarding

### Implementation for User Story 3

- [X] T036 [P] [US3] Complete dev-up.sh with Minikube health checks and service verification
- [X] T037 [P] [US3] Create quickstart verification script in scripts/verify-local-env.sh (check pods, Dapr components, Kafka topics)
- [X] T038 [US3] Configure persistent volumes for Kafka in Helm chart (7-day retention) in helm/todo-app/templates/kafka-pvc.yaml
- [X] T039 [US3] Add hot-reload configuration for backend in Dockerfile (use uvicorn --reload for local)
- [X] T040 [US3] Document port-forwarding commands in quickstart.md (frontend :3000, backend :8000)
- [X] T041 [US3] Create troubleshooting guide in docs/TROUBLESHOOTING.md (common Minikube issues, Dapr sidecar not injected, Kafka connection refused)

**Checkpoint**: Local environment starts in <5 minutes, all services functional ✅

---

## Phase 6: User Story 4 - Production Cloud Deployment (Priority: P2)

**Goal**: Deploy to Azure AKS with Redpanda Cloud, Key Vault, observability

**Independent Test**: Run Terraform, deploy via Helm, verify HTTPS access with valid TLS

### Implementation for User Story 4

- [X] T042 [P] [US4] Create Terraform main.tf for AKS provisioning in terraform/aks/main.tf (3 node pools, 3 AZs)
- [X] T043 [P] [US4] Create Terraform variables.tf and outputs.tf in terraform/aks/
- [X] T044 [P] [US4] Create Terraform backend.tf for remote state (Azure Blob Storage) in terraform/aks/backend.tf
- [ ] T045 [US4] Provision AKS cluster via `terraform apply`
- [X] T046 [P] [US4] Configure Azure Event Hubs (Kafka-compatible, replaces Redpanda Cloud for Azure-native architecture)
- [ ] T047 [P] [US4] Create Azure Key Vault and store Event Hubs connection string, database URL
- [X] T048 [US4] Update Dapr secretstore component to use Azure Key Vault in production in helm/todo-app/templates/dapr-components/secretstore-keyvault.yaml
- [X] T049 [US4] Update Dapr pubsub component to use Redpanda Cloud brokers in values-aks.yaml
- [X] T050 [US4] Enable Dapr mTLS in production (dapr.io/mtls-enabled: true) in helm chart
- [X] T051 [US4] Create GitHub Actions workflow .github/workflows/deploy-phase5.yml (build images, push to ACR, Helm upgrade, integration tests)
- [X] T052 [US4] Create Prometheus ServiceMonitor definitions in helm/todo-app/templates/monitoring/
- [ ] T053 [US4] Create Grafana dashboard JSON in helm/todo-app/dashboards/grafana-dashboard.json (event throughput, consumer lag, error rate)
- [ ] T054 [US4] Configure ingress with cert-manager TLS in helm/todo-app/templates/ingress.yaml
- [ ] T055 [US4] Create Network Policies (default deny, allow frontend→backend) in helm/todo-app/templates/network-policies/
- [ ] T056 [US4] Deploy to AKS staging environment and verify
- [ ] T057 [US4] Create deploy-aks.sh and rollback-aks.sh scripts in scripts/

**Checkpoint**: Production AKS deployment complete with mTLS, TLS ingress, observability

---

## Phase 7: User Story 5 - Multi-Reminder Notifications (Priority: P3)

**Goal**: Multiple reminders per task delivered via email and push (this thing is already implemented as notifications the notifications are created on very important tasks occurring under 6 hours then give reminder 5 times before the task is due so first check this thing and integrate everything properly inside /phase-5 folder)

**Independent Test**: Create task with 3 reminders, verify all delivered at scheduled times

### Implementation for User Story 5 (only move to t058 till t063 after checking my existing implementation of notifications )

- [ ] T058 [P] [US5] Extend Reminder model with job_name field in backend/src/models/reminder.py 
- [ ] T059 [P] [US5] Create Alembic migration 003_add_reminder_job_name.py
- [ ] T060 [US5] Implement alert.scheduled event publishing in backend task service
- [ ] T061 [P] [US5] Implement email service with SMTP in services/notification-service/src/services/email_service.py
- [ ] T062 [P] [US5] Implement push notification service with Firebase in services/notification-service/src/services/push_service.py
- [ ] T063 [US5] Implement Dapr Jobs API client in services/notification-service/src/services/dapr_jobs_service.py
- [ ] T064 [US5] Create alert consumer that schedules reminders via Dapr Jobs in services/notification-service/src/consumers/alert_consumer.py
- [ ] T065 [US5] Create reminder callback endpoint /reminder-callback in services/notification-service/src/main.py
- [ ] T066 [US5] Implement reminder cancellation logic (task completed/deleted) in services/notification-service/src/consumers/cancellation_consumer.py
- [ ] T067 [US5] Add notification-service deployment with Dapr sidecar in helm/todo-app/templates/notification-service-deployment.yaml
- [ ] T068 [US5] Create notification-service HPA (min 2, max 10) in helm/todo-app/templates/hpa/notification-hpa.yaml
- [ ] T069 [US5] Create integration test for reminder scheduling in tests/integration/test_reminder_scheduling.py

**Checkpoint**: Multi-reminder system working with email and push delivery

---

## Phase 8: Advanced Task Features (Priorities, Tags, Search, Filter, Sort) (this is also implemented already you can cross check first then move to implementation if u see anything is missing )

**Purpose**: Enhance task management with priorities, tags, search, filter, sort

- [ ] T070 [P] Create Alembic migration 002_add_priority_tags.py (add priority enum, tags array to tasks)
- [ ] T071 [P] Implement full-text search service with PostgreSQL tsvector in backend/src/services/search_service.py
- [ ] T072 [P] Implement filter service with cumulative AND logic in backend/src/services/filter_service.py
- [ ] T073 [P] Implement sort service with multi-dimension sorting in backend/src/services/sort_service.py
- [ ] T074 Extend GET /api/tasks with query params (search, priority, tags, sort, order) in backend/src/api/tasks.py
- [ ] T075 [P] Create MCP tools: set_priority, add_tag, remove_tag in backend/mcp_server/tools/
- [ ] T076 [P] Create frontend FilterChips component in frontend/todo-app/components/tasks/FilterChips.tsx
- [ ] T077 [P] Create frontend SearchInput component in frontend/todo-app/components/tasks/SearchInput.tsx
- [ ] T078 [P] Create frontend SortDropdown component in frontend/todo-app/components/tasks/SortDropdown.tsx
- [ ] T079 [P] Create frontend PriorityBadge component in frontend/todo-app/components/tasks/PriorityBadge.tsx
- [ ] T080 [P] Create frontend TagInput component in frontend/todo-app/components/tasks/TagInput.tsx

**Checkpoint**: Search, filter, sort, priorities, tags fully functional

---

## Phase 9: Testing & Quality Assurance

**Purpose**: Comprehensive testing across all layers

- [ ] T081 [P] Create unit tests for RRULE service in services/recurring-task-service/tests/unit/test_rrule_service.py
- [ ] T082 [P] Create unit tests for search/filter/sort services in backend/tests/unit/
- [ ] T083 [P] Create contract tests for all API endpoints in backend/tests/contract/test_api_contracts.py
- [ ] T084 [P] Create integration test for recurring task generation in tests/integration/test_recurring_task_generation.py
- [ ] T085 [P] Create Docker Compose test environment in tests/integration/docker-compose.test.yml
- [ ] T086 [P] Create k6 load test script in tests/load/k6-script.js (1000 concurrent users)
- [ ] T087 [P] Create Chaos Mesh experiments in tests/chaos/ (pod-kill, network-delay, kafka-disconnect)
- [ ] T088 [P] Create Playwright E2E tests in tests/e2e/playwright/ (recurring-tasks.spec.ts, search-filter-sort.spec.ts)
- [ ] T089 Run all tests and fix failures

**Checkpoint**: All tests passing, 80% code coverage achieved

---

## Phase 10: Documentation & Polish

**Purpose**: Finalize documentation and cross-cutting concerns

- [ ] T090 [P] Create ARCHITECTURE.md in docs/ (microservices diagram, event flows, service dependencies)
- [ ] T091 [P] Create KAFKA-TOPICS.md in docs/ (topic naming, partitioning strategy, retention policies)
- [ ] T092 [P] Create DAPR-INTEGRATION.md in docs/ (component configs, usage patterns, troubleshooting)
- [ ] T093 [P] Create DEPLOYMENT.md in docs/ (AKS deployment procedures, verification, rollback)
- [ ] T094 [P] Create RUNBOOKS.md in docs/ (operational procedures: restart service, clear DLQ, rotate secrets)
- [ ] T095 [P] Create MIGRATION.md in docs/ (Phase IV to Phase V migration guide)
- [ ] T096 [P] Create API-REFERENCE.md in docs/ (OpenAPI-generated docs for all services)
- [ ] T097 [P] Create TESTING.md in docs/ (test strategy, how to run tests)
- [ ] T098 [P] Update quickstart.md with final verification steps
- [ ] T099 [P] Create PHASE5-SUMMARY.md in SUMMARIES/ (architecture decisions, lessons learned, metrics)
- [ ] T100 Code cleanup and refactoring
- [ ] T101 Security hardening (image scanning with Trivy, vulnerability fixes)
- [ ] T102 Performance optimization (database indexes, query optimization)
- [ ] T103 Run full quickstart validation from clean environment

**Checkpoint**: Phase V complete and production-ready

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - US1 (Recurring Tasks): Can start after Phase 2
  - US2 (Event-Driven): Can start after Phase 2 (some tasks integrate with US1)
  - US3 (Local Dev): Can start after Phase 2, enhanced after US1/US2 complete
  - US4 (Cloud Deploy): Can start after Phase 2, requires US1/US2 for full validation
  - US5 (Notifications): Depends on US2 (event-driven architecture)
- **Advanced Features (Phase 8)**: Can run in parallel with user stories
- **Testing (Phase 9)**: Depends on all desired features being implemented
- **Documentation (Phase 10)**: Depends on all implementation complete

### User Story Dependencies

- **US1 (P1)**: Independent - can start after Foundational
- **US2 (P1)**: Independent - can start after Foundational (integrates with US1 but testable separately)
- **US3 (P2)**: Independent - can start after Foundational
- **US4 (P2)**: Independent - can start after Foundational (validates US1/US2)
- **US5 (P3)**: Depends on US2 (needs event-driven architecture)

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel
- After Foundational: US1, US2, US3 can run in parallel (US4 waits for validation, US5 waits for US2)
- Within each user story: all [P] tasks can run in parallel
- Phase 8 (Advanced Features) can run in parallel with user stories
- All documentation tasks in Phase 10 marked [P] can run in parallel

---

## Parallel Example: User Story 1

```bash
# Models (parallel):
T016: "Create RecurringTaskSeries model in backend/src/models/recurring_task_series.py"
T017: "Extend Task model with recurring fields in backend/src/models/task.py"

# Services (parallel):
T020: "Implement RRULE parsing service in services/recurring-task-service/src/services/rrule_service.py"
T021: "Implement task generation service in services/recurring-task-service/src/services/task_generation_service.py"

# Helm deployments (parallel):
T027: "Add Dapr sidecar annotations to recurring-service Helm deployment"
T028: "Create recurring-service HPA definition"
```

---

## Implementation Strategy

### MVP First (US1 + US2 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Recurring Tasks)
4. Complete Phase 4: User Story 2 (Event-Driven)
5. **STOP and VALIDATE**: Test recurring tasks end-to-end locally
6. Deploy to local Minikube and demo

### Incremental Delivery

1. Phase 1-2: Foundation ready
2. Add US1 → Test independently → Demo (MVP!)
3. Add US2 → Test independently → Demo
4. Add US3 → Local dev complete → Demo
5. Add US4 → Cloud deployment complete → Demo
6. Add US5 → Notifications complete → Final demo
7. Add Phase 8 → Advanced features → Enhanced demo
8. Phase 9-10 → Production-ready

### Parallel Subagent Strategy

Delegate to `phase5-cloud-deployment-engineer` subagent:

1. Subagent completes Setup + Foundational sequentially
2. Once Foundational done, subagent works through user stories in priority order
3. Subagent validates each story independently before proceeding
4. Subagent runs all tests in Phase 9
5. Subagent generates all documentation in Phase 10

---

## Execution Notes

- **MANDATORY**: ALL work delegated to `phase5-cloud-deployment-engineer` subagent
- All tasks confined to `/phase-5/` folder (zero modifications outside)
- [P] tasks = different files, no dependencies, can run in parallel
- [Story] label maps task to specific user story
- Each user story independently completable and testable
- Stop at any checkpoint to validate story independently
- Commit after each task or logical group
- No direct Kafka clients - use Dapr Pub/Sub only
- No database polling - use Dapr Jobs API only
- No secrets in environment variables - use Azure Key Vault/K8s Secrets only

---

**Total Tasks**: 103
**MVP Tasks (US1+US2)**: ~35 tasks (Phase 1-4)
**Estimated Effort**: 8 weeks (per plan.md roadmap)
**Risk Level**: MEDIUM (comprehensive testing and incremental delivery mitigates risks)
