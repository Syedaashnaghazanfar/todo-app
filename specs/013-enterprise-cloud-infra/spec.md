# Feature Specification: Enterprise-Grade Cloud Infrastructure (Phase V)

**Feature Branch**: `013-enterprise-cloud-infra`
**Created**: 2026-01-13
**Status**: Draft
**Input**: User description: "Phase V – Enterprise-Grade Cloud Infrastructure for Todo Chatbot Platform with Kafka event-driven architecture, Dapr integration, recurring task engine, and production-ready AKS deployment"

---

## Executive Summary

Transform the Todo Chatbot Platform from a monolithic local deployment into an enterprise-grade, cloud-native distributed system. This phase introduces event-driven architecture with Apache Kafka/Redpanda, complete Dapr integration for service communication, a standalone recurring task engine, and production-ready Azure Kubernetes Service (AKS) deployment with comprehensive observability, security, and CI/CD automation.

**Core Value Proposition**: Enable the platform to scale horizontally to thousands of concurrent users while maintaining data consistency, fault tolerance, and sub-second response times through microservices architecture and event-driven communication patterns.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Recurring Task Lifecycle Management (Priority: P1)

Users need to create tasks that repeat automatically (e.g., "Pay rent monthly", "Team meeting every Monday") without manual re-creation. When a recurring task is completed, the system automatically generates the next instance based on the recurrence pattern.

**Why this priority**: Core feature gap that blocks user productivity. Addresses the #1 requested feature from Phase IV user feedback. Without this, users must manually recreate repetitive tasks, leading to forgotten obligations and poor user experience.

**Independent Test**: Create a daily recurring task, complete one instance, verify next instance appears with correct due date. This delivers immediate value without requiring any other Phase V components.

**Acceptance Scenarios**:

1. **Given** a user creates a task "Exercise" with recurrence pattern "daily" and end date 30 days from now, **When** the user completes today's instance, **Then** tomorrow's instance appears immediately with status "pending" and due date set to tomorrow.

2. **Given** a user creates a task "Team standup" with recurrence pattern "every Monday, Wednesday, Friday at 10 AM", **When** the system reaches each scheduled time, **Then** a new task instance is created exactly 15 minutes before the due time with a reminder notification.

3. **Given** a user edits a single occurrence of a weekly recurring task, **When** the user changes the title to "Team standup - Q1 planning", **Then** only that instance is modified while future instances retain the original title.

4. **Given** a user deletes a recurring task series, **When** the user selects "delete all future instances", **Then** all pending instances are removed, completed instances remain in history, and scheduled jobs are cancelled.

5. **Given** a recurring task reaches its end date, **When** the final instance is completed, **Then** no new instances are generated and the series is marked as "completed series".

---

### User Story 2 - Event-Driven Task Synchronization (Priority: P1)

When a user performs any task operation (create, update, complete, delete) on any device or through any interface (web, API, chatbot), all other connected clients and services receive the update in real-time without polling or page refresh.

**Why this priority**: Critical for multi-device user experience. Without event-driven architecture, users see stale data, leading to duplicate work and data conflicts. This is a foundational infrastructure requirement that all other Phase V features depend on.

**Independent Test**: Open the dashboard on two browsers, complete a task in browser A, verify browser B updates automatically within 1 second. This can be tested immediately after Kafka integration without requiring recurring tasks or cloud deployment.

**Acceptance Scenarios**:

1. **Given** a user has the dashboard open on desktop and mobile, **When** the user creates a task on mobile, **Then** the task appears on desktop within 1 second without refresh.

2. **Given** a user completes a task through the chatbot interface, **When** the completion event is published, **Then** the Recurring Task Service receives the event and generates the next instance within 2 seconds.

3. **Given** a task operation fails (e.g., database timeout), **When** the event consumer encounters the failure, **Then** the event is retried 3 times with 5-second intervals, and if still failing, moves to the dead-letter queue for manual investigation.

4. **Given** the Notification Service is temporarily down, **When** alert events are published, **Then** Dapr queues the events and delivers them when the service recovers, ensuring no reminder is lost.

---

### User Story 3 - One-Command Local Development Setup (Priority: P2)

Developers need to spin up the entire microservices architecture locally (frontend, backend, recurring service, notification service, Kafka, Dapr) with a single command for testing and development.

**Why this priority**: Developer productivity and onboarding. Without this, new developers spend days configuring services manually, leading to environment drift and "works on my machine" issues. This accelerates feature development velocity.

**Independent Test**: Clone the repository, run `./phase-5/scripts/dev-up.sh`, verify all services are accessible via port-forwarding. This can be tested independently of cloud deployment and validates the entire local architecture.

**Acceptance Scenarios**:

1. **Given** a developer with Docker Desktop and Minikube installed, **When** they run `./phase-5/scripts/dev-up.sh`, **Then** within 5 minutes, all services are running with Dapr sidecars, Kafka topics created, and frontend accessible at `http://localhost:3000`.

2. **Given** the local environment is running, **When** a developer modifies backend code, **Then** the changes are reflected automatically via hot-reload within 3 seconds without restarting Minikube.

3. **Given** a developer completes their work session, **When** they run `./phase-5/scripts/dev-down.sh`, **Then** all services shut down gracefully, persistent volumes are preserved, and resources are released.

4. **Given** Kafka crashes during local development, **When** the developer restarts the environment, **Then** all message offsets are preserved via persistent volumes and consumers resume from the last committed position.

---

### User Story 4 - Production Cloud Deployment (Priority: P2)

DevOps engineers need to provision and deploy the entire platform to Azure Kubernetes Service (AKS) with production-grade security (mTLS, secrets management), observability (Prometheus, Grafana), and CI/CD automation.

**Why this priority**: Enables production launch and real-world user traffic. Without this, the platform remains a local prototype. This is P2 (not P1) because local development and core features must be validated first before cloud deployment.

**Independent Test**: Run Terraform scripts to provision AKS, deploy via Helm, verify services are accessible via HTTPS with valid TLS certificates. This validates cloud infrastructure independently of feature functionality.

**Acceptance Scenarios**:

1. **Given** an Azure subscription with appropriate permissions, **When** DevOps runs `terraform apply` in `/phase-5/terraform/aks/`, **Then** an AKS cluster with 3 node pools across 3 availability zones is provisioned within 15 minutes.

2. **Given** the AKS cluster is running, **When** GitHub Actions CI/CD pipeline deploys to `main` branch, **Then** Docker images are built, pushed to ACR, Helm charts are upgraded, and integration tests pass, all within 10 minutes.

3. **Given** the production deployment is complete, **When** a developer views Grafana dashboards, **Then** metrics for event throughput, consumer lag, error rate, and pod health are visible with 1-minute resolution.

4. **Given** a deployment introduces a critical bug, **When** integration tests fail during CI/CD, **Then** the deployment automatically rolls back to the previous stable version within 2 minutes.

5. **Given** the platform experiences a pod crash, **When** Prometheus detects the failure, **Then** an alert is sent to the on-call engineer within 1 minute via email and PagerDuty.

---

### User Story 5 - Multi-Reminder Notifications (Priority: P3)

Users need to configure multiple reminders per task (e.g., "1 day before", "1 hour before", "at due time") and receive timely notifications via email and push notifications.

**Why this priority**: Enhances user engagement and task completion rates. This is P3 because it builds on the already-implemented reminder system from Phase IV and is an enhancement rather than a core requirement. The basic reminder functionality already exists and just needs to be integrated with Kafka events.

**Independent Test**: Create a task with 3 reminders at different intervals, verify all notifications are delivered at scheduled times. This tests the notification pipeline independently of recurring tasks or cloud deployment.

**Acceptance Scenarios**:

1. **Given** a user creates a task with reminders at "1 day before" and "1 hour before", **When** the scheduled times arrive, **Then** notifications are delivered within 1 minute of the scheduled time via both email and push notification.

2. **Given** a user completes a task before reminder time, **When** the completion event is processed, **Then** all pending reminders for that task are cancelled immediately.

3. **Given** the email service is temporarily unavailable, **When** the Notification Service attempts to send an email, **Then** the notification is retried 3 times, and if still failing, moves to the dead-letter queue while push notifications continue to work.

4. **Given** a user edits a task's due date, **When** the update event is processed, **Then** all reminder schedules are recalculated and updated via Dapr Jobs API within 5 seconds.

---

### Edge Cases

- **What happens when a user creates a recurring task with an end date in the past?**
  - System validates end date is in the future and returns a user-friendly error: "End date must be in the future".

- **How does the system handle clock skew between services?**
  - Dapr mTLS allows 15 minutes of clock skew by default. Time-sensitive operations use UTC timestamps from a central time source (Dapr Scheduler).

- **What happens when Kafka reaches storage limit?**
  - Retention policies automatically delete old messages (7 days local, 30 days cloud). Monitoring alerts trigger when disk usage exceeds 80%.

- **How does the system handle duplicate events (e.g., task created twice due to network retry)?**
  - All consumers implement idempotency using event IDs. Duplicate events are detected and ignored via database unique constraints on `event_id`.

- **What happens when a user has 1000+ pending recurring tasks?**
  - UI pagination limits display to 50 tasks per page. Background workers process task generation in batches of 100 with rate limiting to avoid overwhelming the database.

- **How does the system handle a service crash during task completion?**
  - Kafka retains the event. When the service restarts, Dapr redelivers the event from the last committed offset. The consumer's idempotency logic prevents duplicate processing.

- **What happens during AKS node failure?**
  - Kubernetes reschedules pods to healthy nodes within 30 seconds. Persistent volumes are reattached. Kafka rebalances partitions. Users experience <1 minute of degraded performance.

- **How are secrets rotated without downtime?**
  - Azure Key Vault secrets are versioned. Dapr secrets component polls for updates every 60 seconds. New secrets are loaded gracefully without pod restarts.

- **What happens when a GitHub Actions deployment fails midway?**
  - Helm tracks release history. Failed deployments trigger automatic rollback to the previous successful release. Developers are notified via Slack webhook.

- **How does the system handle a "thundering herd" of simultaneous recurring task generations (e.g., 10,000 users with daily tasks at midnight)?**
  - Dapr Jobs API distributes executions across a 5-minute window (11:55 PM - 12:05 AM) using jitter. Kafka partitioning by `user_id` distributes load across 12 partitions. Consumers scale horizontally via Kubernetes HPA.

---

## Requirements *(mandatory)*

### Functional Requirements

#### Recurring Task Engine

- **FR-001**: System MUST support recurring task patterns: daily, weekly, monthly, yearly, and custom RRULE expressions (e.g., "every 2 weeks on Monday and Wednesday").

- **FR-002**: Task schema MUST include fields: `recurrence_pattern` (string), `recurrence_end_date` (datetime), `upcoming_occurrence` (datetime), `is_recurring` (boolean), `series_id` (UUID).

- **FR-003**: When a recurring task instance is completed, the system MUST automatically generate the next instance within 5 seconds by publishing a Kafka event to the `task-operations` topic.

- **FR-004**: Users MUST be able to edit a single occurrence of a recurring series, which creates an exception without affecting other instances.

- **FR-005**: Users MUST be able to delete a single occurrence or the entire series (all future instances) with explicit confirmation.

- **FR-006**: Users MUST be able to edit the entire series (all future instances), which updates the recurrence pattern and regenerates upcoming occurrences.

- **FR-007**: Recurring Task Service MUST be an independent microservice (not part of the main backend) that subscribes to `task-operations` events via Dapr Pub/Sub.

- **FR-008**: Task generation MUST use Dapr Jobs API for scheduling (no cron jobs or polling) with at-least-once delivery guarantee.

#### Event-Driven Architecture

- **FR-009**: ALL task operations (create, update, complete, delete) MUST emit events to Kafka topics via Dapr Pub/Sub within 500ms of database commit.

- **FR-010**: System MUST support three primary topics: `task-operations` (create, complete, delete), `alerts` (reminders), `task-modifications` (updates).

- **FR-011**: All Kafka topics MUST be partitioned by `user_id` to guarantee per-user event ordering and enable parallel processing.

- **FR-012**: System MUST implement dead-letter queues (DLQs) for each topic: `task-events-dlq`, `alerts-dlq`, `updates-dlq` for failed message processing.

- **FR-013**: Event messages MUST use CloudEvents envelope format with fields: `id`, `type`, `source`, `time`, `datacontenttype`, `data`.

- **FR-014**: Event messages MUST be versioned (e.g., `v1.task.created`) and backward-compatible for schema evolution.

- **FR-015**: All event consumers MUST be idempotent, using event IDs to detect and ignore duplicate deliveries.

#### Dapr Integration

- **FR-016**: ALL service-to-service communication MUST use Dapr service invocation (no direct HTTP calls between services).

- **FR-017**: System MUST NOT use direct Kafka clients. ALL messaging MUST go through Dapr Pub/Sub components.

- **FR-018**: Scheduling MUST use Dapr Jobs API (no cron polling or database polling) with constant retry policy (3 retries, 5-second interval).

- **FR-019**: Secrets MUST be accessed ONLY via Dapr Secrets API (Azure Key Vault in production, Kubernetes Secrets locally).

- **FR-020**: PostgreSQL state store MUST be used ONLY for chatbot conversation history (not for task data or recurring task state).

- **FR-021**: Task data MUST be stored in the primary PostgreSQL database (Neon), not in Dapr state stores.

#### Notification System Integration

- **FR-022**: Notification Service MUST consume events from the `alerts` topic and deliver reminders within 1 minute of scheduled time.

- **FR-023**: System MUST support multiple reminders per task (e.g., "1 day before", "1 hour before", "at due time").

- **FR-024**: Notifications MUST be delivered via two channels: email (MANDATORY) and push notifications (MANDATORY).

- **FR-025**: When a task is completed or deleted, the system MUST cancel all pending reminders by publishing cancellation events.

- **FR-026**: Reminder scheduling MUST use Dapr Jobs API (no polling) with failure policy that moves failed jobs to DLQ after 3 retries.

#### Local Development (Minikube)

- **FR-027**: Single command `./phase-5/scripts/dev-up.sh` MUST start Minikube, install Dapr, deploy Kafka (Bitnami Helm chart), create topics, and deploy all services.

- **FR-028**: Kafka MUST be deployed inside the Minikube cluster with persistent volumes that survive pod restarts.

- **FR-029**: Local Kafka MUST use 12 partitions per topic with 7-day retention policy.

- **FR-030**: ALL pods MUST have Dapr sidecars automatically injected via namespace label `dapr.io/enabled: true`.

- **FR-031**: Backend MUST support hot-reload during local development (code changes reflected within 3 seconds).

- **FR-032**: Frontend MUST be accessible via port-forwarding at `http://localhost:3000` with backend at `http://localhost:8000`.

- **FR-033**: Single command `./phase-5/scripts/dev-down.sh` MUST gracefully shut down all services while preserving persistent volumes.

#### Cloud Deployment (AKS)

- **FR-034**: Terraform MUST provision Azure Kubernetes Service (AKS) with node pools, VNET, Azure Key Vault, Azure Container Registry (ACR), and load balancer.

- **FR-035**: AKS cluster MUST deploy across 3 availability zones with 99.99% SLA target.

- **FR-036**: Cloud deployment MUST use Redpanda Cloud Serverless (FREE TIER) for Kafka, not self-hosted Kafka or Confluent Cloud.

- **FR-037**: Redpanda Cloud MUST use 30-day retention policy with usage-based pricing monitoring.

- **FR-038**: Dapr MUST have mTLS enabled in production with 24-hour certificate TTL and automatic rotation.

- **FR-039**: Secrets MUST be stored in Azure Key Vault with managed identity authentication (no client secrets).

- **FR-040**: System MUST integrate with Azure Monitor for centralized logging and Application Insights for distributed tracing.

#### CI/CD

- **FR-041**: GitHub Actions pipeline MUST build Docker images, push to ACR, run Helm upgrades, and execute integration tests on every commit to `main` or `develop`.

- **FR-042**: Deployment branching strategy: `main` → production, `develop` → staging, `feature/*` → no deployment (local only).

- **FR-043**: Integration tests MUST run in staging environment and verify end-to-end task creation, event publishing, and recurring task generation.

- **FR-044**: Failed deployments MUST automatically rollback to the previous stable Helm release within 2 minutes.

- **FR-045**: Deployment pipeline MUST complete within 10 minutes (build, test, deploy) for incremental changes.

#### Observability

- **FR-046**: Prometheus MUST scrape metrics from backend, recurring-task-service, notification-service, and Dapr sidecars every 15 seconds.

- **FR-047**: Grafana dashboards MUST display: event throughput (messages/sec), consumer lag (seconds), error rate (%), pod health (CPU/memory).

- **FR-048**: System MUST send alerts when: pod crashes, event lag exceeds 5 minutes, error rate exceeds 5%, or disk usage exceeds 80%.

- **FR-049**: Distributed tracing MUST use Zipkin or Jaeger to trace requests across frontend → backend → Kafka → recurring service with <1% sampling in production.

- **FR-050**: Logs MUST be centralized in Azure Log Analytics with structured JSON format and retention policy of 30 days.

#### Security

- **FR-051**: mTLS MUST be enabled between all services in production via Dapr configuration.

- **FR-052**: Kubernetes Network Policies MUST restrict pod-to-pod communication (e.g., frontend can only call backend, not Kafka directly).

- **FR-053**: Ingress MUST use TLS certificates from cert-manager with automatic renewal via Let's Encrypt.

- **FR-054**: Secrets MUST NOT be stored in environment variables, ConfigMaps, or code. ALL secrets MUST come from Azure Key Vault via Dapr.

- **FR-055**: Secrets MUST rotate every 90 days with automated rotation via Azure Key Vault.

- **FR-056**: Authentication tokens (Better Auth JWTs) MUST have 1-hour expiration with refresh token rotation.

### Key Entities

#### RecurringTaskSeries
- **Purpose**: Represents a recurring task definition and tracks all instances in the series.
- **Key Attributes**: `series_id` (UUID), `user_id`, `base_task_template` (title, description, priority), `recurrence_pattern` (RRULE string), `recurrence_start_date`, `recurrence_end_date`, `is_active`, `created_at`, `updated_at`.
- **Relationships**: Has many TaskInstances (one-to-many).

#### TaskInstance
- **Purpose**: Represents a single occurrence of a recurring task or a standalone task.
- **Key Attributes**: `task_id` (UUID), `series_id` (nullable UUID), `user_id`, `title`, `description`, `due_date`, `status` (pending, completed, deleted), `is_exception` (boolean - marks single-occurrence edits), `completed_at`, `created_at`, `updated_at`.
- **Relationships**: Belongs to RecurringTaskSeries (many-to-one, optional).

#### TaskEvent
- **Purpose**: Represents an event published to Kafka for asynchronous processing.
- **Key Attributes**: `event_id` (UUID), `event_type` (task.created, task.completed, task.updated, task.deleted), `user_id`, `task_id`, `series_id` (nullable), `payload` (JSON), `published_at`, `processed_at`, `retry_count`.
- **Relationships**: References TaskInstance.

#### Reminder
- **Purpose**: Represents a scheduled notification for a task.
- **Key Attributes**: `reminder_id` (UUID), `task_id`, `user_id`, `scheduled_time`, `reminder_type` (email, push), `status` (pending, sent, cancelled), `job_name` (Dapr Jobs API identifier), `created_at`, `sent_at`.
- **Relationships**: Belongs to TaskInstance (many-to-one).

#### DaprJob
- **Purpose**: Represents a scheduled job managed by Dapr Jobs API.
- **Key Attributes**: `job_name` (string), `job_type` (task_generation, reminder), `schedule` (cron expression or @every), `data` (JSON payload), `failure_policy` (constant retry), `max_retries`, `interval`, `created_at`.
- **Relationships**: References TaskInstance or RecurringTaskSeries.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

#### Performance

- **SC-001**: Recurring task next instance generation completes within 5 seconds of completing the previous instance, measured end-to-end (task complete → Kafka event → consumer processing → new task in database).

- **SC-002**: Event-driven synchronization latency is under 1 second for 95% of task operations (measured from database commit to all consumers processing the event).

- **SC-003**: System handles 1000 concurrent task operations per second with <500ms p95 response time and <1% error rate.

- **SC-004**: Local development environment starts fully operational within 5 minutes on a developer laptop with 16GB RAM and 4 CPU cores.

- **SC-005**: Production deployment via CI/CD pipeline completes within 10 minutes from code commit to live traffic for incremental changes (non-infrastructure).

#### Reliability

- **SC-006**: System maintains 99.9% uptime (excluding planned maintenance) measured over a 30-day period in production.

- **SC-007**: Zero message loss during Kafka broker restarts or pod failures (at-least-once delivery guarantee verified via event ID tracking).

- **SC-008**: Automatic rollback completes within 2 minutes of detecting failed deployment (measured from integration test failure to previous version serving traffic).

- **SC-009**: Pod crashes recover automatically within 30 seconds (Kubernetes reschedules pod, Dapr sidecars reconnect, consumers resume processing).

- **SC-010**: Dead-letter queue messages are processed and resolved within 24 hours (manual intervention SLA for DLQ monitoring).

#### Scalability

- **SC-011**: System horizontally scales to support 10,000 concurrent users with <2-second p95 response time by adding Kubernetes pod replicas (no code changes).

- **SC-012**: Kafka consumer lag remains under 5 seconds during peak load (10x normal traffic) by scaling consumer group instances.

- **SC-013**: Recurring task generation handles 100,000 daily recurring tasks scheduled for midnight UTC with <10-minute processing window (11:55 PM - 12:10 AM).

- **SC-014**: System processes 1 million events per day (average 11.5 events/second) with Kafka retention not exceeding 50GB storage.

#### Security

- **SC-015**: 100% of service-to-service communication uses mTLS encryption in production (verified via Dapr audit logs).

- **SC-016**: Zero secrets exposure in code, logs, environment variables, or ConfigMaps (verified via automated secret scanning in CI/CD).

- **SC-017**: Secret rotation completes without service downtime or failed requests (verified by monitoring error rates during rotation).

- **SC-018**: Penetration testing reveals zero critical or high-severity vulnerabilities in infrastructure or application layers.

#### Observability

- **SC-019**: 100% of critical alerts (pod crash, high error rate, consumer lag) notify on-call engineer within 1 minute of incident detection.

- **SC-020**: Distributed tracing covers 100% of user-facing requests (frontend → backend → Kafka → consumers) with complete trace context propagation.

- **SC-021**: Grafana dashboards provide real-time visibility (1-minute resolution) into event throughput, consumer lag, error rate, and pod health.

- **SC-022**: Log queries in Azure Log Analytics return results within 5 seconds for 95% of queries searching 7 days of logs.

#### Developer Experience

- **SC-023**: New developers successfully run the entire local environment within 30 minutes of cloning the repository (measured via onboarding documentation and time tracking).

- **SC-024**: Backend code changes hot-reload within 3 seconds during local development (no Minikube restart required).

- **SC-025**: Architecture documentation enables developers to understand event flow, service dependencies, and deployment topology within 1 hour of reading.

#### Business Value

- **SC-026**: Recurring task feature adoption reaches 60% of active users within 30 days of production launch (measured via feature usage telemetry).

- **SC-027**: Task completion rate increases by 25% for users who adopt recurring tasks (measured via cohort analysis comparing pre/post-feature usage).

- **SC-028**: Cloud infrastructure costs remain under $500/month for the first 1000 active users (measured via Azure Cost Management).

- **SC-029**: Support ticket volume related to task management decreases by 40% after recurring task launch (measured via ticket categorization and volume trends).

---

## Assumptions

1. **Azure Subscription Access**: DevOps team has Owner or Contributor role in the Azure subscription with sufficient quota for AKS, ACR, and Key Vault resources.

2. **Redpanda Cloud Free Tier Availability**: Redpanda Cloud Serverless free tier ($300 credits) remains available and sufficient for development and staging environments (production may require paid tier after trial).

3. **Existing Database Schema Compatibility**: Current task table schema can be extended with recurring task fields (`series_id`, `recurrence_pattern`, etc.) without requiring complex data migrations.

4. **Better Auth JWT Shared Secret**: Better Auth JWT verification in the backend continues to work with the existing `BETTER_AUTH_SECRET` shared between frontend and backend.

5. **Phase IV Reminder System**: The existing reminder/notification system from Phase IV is functional and can be adapted to consume Kafka events instead of database polling.

6. **Developer Workstations**: Developers have Docker Desktop, Minikube, and kubectl installed locally with sufficient resources (16GB RAM minimum, 4 CPU cores).

7. **GitHub Actions Runner Resources**: GitHub Actions hosted runners have sufficient resources to build Docker images, run integration tests, and deploy to AKS within 10-minute pipeline timeout.

8. **Network Connectivity**: AKS cluster can establish outbound connections to Redpanda Cloud, Azure Key Vault, GitHub Container Registry (ACR), and external monitoring services (Prometheus, Grafana Cloud if used).

9. **RRULE Parsing Library**: Python `python-dateutil` library accurately parses and calculates next occurrences for all specified recurrence patterns (daily, weekly, monthly, yearly, custom RRULE).

10. **Kafka Exactly-Once Semantics Not Required**: At-least-once delivery with idempotent consumers is acceptable for task operations (duplicate task completion events do not corrupt data).

11. **Dapr Production Readiness**: Dapr v1.15+ is production-stable for Jobs API, Pub/Sub with Kafka, and mTLS features required by Phase V.

12. **Azure Region Availability**: Target Azure region (e.g., East US, West Europe) supports AKS with 3 availability zones, Azure Key Vault, and ACR in the same region for low latency.

13. **Monorepo Structure Preservation**: All Phase V code, configuration, and infrastructure definitions live exclusively in the `/phase-5` folder without modifying Phase III or Phase IV code.

14. **No Breaking Changes to Existing APIs**: Adding event-driven architecture does not break existing REST API contracts used by the frontend or chatbot.

15. **Horizontal Pod Autoscaler (HPA) Availability**: Metrics Server is installed in AKS to enable HPA for automatic scaling based on CPU/memory utilization.

---

## Constraints

1. **Phase-5 Folder Isolation**: ALL implementation work MUST happen strictly inside the `/phase-5` folder. NO files or folders outside `/phase-5` may be modified (including Phase III/IV code).

2. **No Direct Kafka Clients**: Direct Kafka client libraries (e.g., `confluent-kafka-python`, `kafka-python`) are FORBIDDEN. ALL messaging MUST use Dapr Pub/Sub components.

3. **No Database Polling**: Recurring task generation and reminder scheduling MUST use Dapr Jobs API. Cron-based polling or periodic database queries are FORBIDDEN.

4. **No Task Data in Dapr State Store**: PostgreSQL state store MUST be used ONLY for chatbot conversation history. Task data MUST remain in the primary PostgreSQL (Neon) database.

5. **Redpanda Cloud Free Tier Only**: Production Kafka MUST use Redpanda Cloud Serverless FREE TIER ($300 credits). Confluent Cloud is NOT allowed.

6. **Azure Kubernetes Service (AKS) Only**: Cloud deployment MUST target Azure AKS. Google Kubernetes Engine (GKE) is optional for documentation only, not active deployment.

7. **mTLS Mandatory in Production**: Dapr mTLS MUST be enabled in production environments (staging, production). Local development may disable mTLS for debugging.

8. **No Secrets in Environment Variables**: Secrets MUST NOT be stored in container environment variables, ConfigMaps, or committed to Git. ALL secrets MUST come from Azure Key Vault (production) or Kubernetes Secrets (local).

9. **GitHub Actions CI/CD Only**: CI/CD MUST use GitHub Actions. Azure DevOps, Jenkins, or other CI tools are NOT allowed.

10. **Branching Strategy Enforcement**: Only `main` and `develop` branches trigger deployments. Feature branches do NOT deploy to cloud environments (local testing only).

11. **At-Least-Once Delivery Guarantee**: System MUST guarantee at-least-once delivery for all events. Exactly-once semantics are NOT required.

12. **Event Ordering Per User**: Kafka partitioning by `user_id` MUST guarantee per-user event ordering. Cross-user ordering is NOT guaranteed (and not required).

13. **Consumer Idempotency Requirement**: ALL event consumers MUST implement idempotency logic. Duplicate event processing MUST NOT corrupt data or cause user-visible errors.

14. **Short-Lived Auth Tokens**: Better Auth JWTs MUST have 1-hour expiration. Long-lived tokens are NOT allowed for security compliance.

15. **No Breaking Schema Changes**: Kafka message schemas MUST be versioned and backward-compatible. Breaking changes require new topic versions (e.g., `task-operations-v2`).

16. **30-Day Log Retention Limit**: Azure Log Analytics MUST retain logs for 30 days maximum (cost constraint). Longer retention requires exporting to cold storage (Azure Blob).

17. **Resource Quotas**: Local Minikube deployment MUST run within 8GB RAM and 4 CPU cores to support standard developer laptops.

18. **Testing Requirement**: ALL implementation work MUST include tests in `/phase-5/tests` directory. No untested code is deployable.

19. **Documentation Requirement**: ALL architectural decisions, API contracts, and deployment procedures MUST be documented in `/phase-5/docs` or `/phase-5/SUMMARIES`.

20. **Subagent Delegation Requirement**: ALL implementation work MUST be delegated to the `phase5-cloud-deployment-engineer` subagent. No manual coding by user is permitted.

---

## Out of Scope

1. **Multi-Cloud Support**: Deployment to GKE (Google Cloud), EKS (AWS), or on-premises Kubernetes is NOT implemented (AKS only).

2. **Exactly-Once Semantics**: Kafka exactly-once delivery guarantees are NOT required. At-least-once with idempotent consumers is sufficient.

3. **Real-Time WebSocket Updates**: Frontend does NOT receive real-time updates via WebSockets. Event-driven updates are backend-to-backend only (frontend uses polling or periodic refresh).

4. **Advanced RRULE Features**: Complex recurrence patterns (e.g., "last Friday of every month", "Easter-based recurrence") are NOT supported. Only standard RRULE expressions (FREQ, INTERVAL, BYDAY, BYMONTHDAY) are implemented.

5. **Multi-Tenancy**: System does NOT support organizational accounts or team workspaces. Each user operates independently with no shared tasks.

6. **Kafka Schema Registry**: Message schemas are versioned in code, not in a centralized schema registry (e.g., Confluent Schema Registry).

7. **Event Sourcing**: Full event sourcing (storing all state changes as events) is NOT implemented. Events are used for asynchronous communication only, not as source of truth.

8. **Custom Notification Channels**: Only email and push notifications are supported. SMS, Slack, or webhooks are NOT implemented.

9. **Multi-Region Active-Active**: Production deployment is single-region (Azure). Multi-region active-active or geo-replication is documented but NOT implemented.

10. **Advanced Observability Features**: Full distributed tracing (100% sampling), real-user monitoring (RUM), or APM integrations (New Relic, Datadog) are NOT implemented. Basic Prometheus/Grafana/Zipkin only.

11. **Cost Optimization Automation**: Manual cost monitoring only. Automated rightsizing, spot instance management, or FinOps tooling is NOT implemented.

12. **Disaster Recovery Automation**: Backup/restore procedures are documented but NOT automated. No automatic failover or DR drills.

13. **Advanced Security Features**: SIEM integration, vulnerability scanning automation, or security information event management is NOT implemented.

14. **Performance Load Testing**: Load testing scripts and benchmarks are NOT included. Manual performance validation only.

15. **Legacy Phase Migration**: Phase III and Phase IV code are NOT migrated to Phase V architecture. Phase V is a standalone deployment for new features (recurring tasks).

---

## Dependencies

1. **Phase IV Completion**: Local Kubernetes deployment with Helm charts and kubectl-ai must be fully functional before starting Phase V.

2. **Better Auth Integration**: JWT authentication between frontend and backend must be working (from Phase III/IV).

3. **PostgreSQL Database (Neon)**: Existing database schema and connection must be operational for task storage.

4. **Docker Desktop**: Required for local Minikube development and image builds.

5. **Minikube**: Required for local Kubernetes testing (v1.35+).

6. **kubectl**: Required for Kubernetes cluster management (v1.29+).

7. **Helm**: Required for deploying Kafka, Dapr, and application services (v3.12+).

8. **Dapr CLI**: Required for local Dapr initialization and debugging (v1.15+).

9. **Terraform**: Required for Azure infrastructure provisioning (v1.7+).

10. **Azure CLI**: Required for AKS authentication and resource management (v2.50+).

11. **Redpanda Cloud Account**: Required for production Kafka (free tier registration).

12. **Azure Subscription**: Required for AKS, ACR, Key Vault, and Log Analytics resources.

13. **GitHub Repository**: Required for GitHub Actions CI/CD pipelines and ACR image registry integration.

14. **Python 3.11+**: Required for backend and recurring-task-service development.

15. **Node.js 18+**: Required for frontend Next.js development.

16. **UV Package Manager**: Required for Python dependency management in backend services.

17. **python-dateutil Library**: Required for RRULE parsing and next occurrence calculation.

18. **Prometheus Operator**: Required for Kubernetes metrics collection (installed via Helm).

19. **Grafana**: Required for observability dashboards (installed via Helm or Grafana Cloud).

20. **cert-manager**: Required for automatic TLS certificate provisioning in AKS (installed via Helm).

---

## Risks

1. **Redpanda Cloud Free Tier Limitations**:
   - **Risk**: Free tier credits ($300) may be insufficient for extended development or high message volumes.
   - **Mitigation**: Monitor usage via Redpanda dashboard. Implement retention policies (30 days max). Budget alerts at 80% usage. Fallback to self-hosted Kafka in AKS if free tier exhausted.

2. **Dapr Jobs API Maturity**:
   - **Risk**: Jobs API is relatively new (beta in Dapr 1.14, stable in 1.15). Potential bugs or missing features.
   - **Mitigation**: Extensive local testing before cloud deployment. Monitor Dapr GitHub issues for known problems. Fallback to Dapr Workflows if Jobs API proves unreliable.

3. **Event Ordering Violations**:
   - **Risk**: Kafka partition rebalancing or consumer failures may cause out-of-order processing for the same user.
   - **Mitigation**: Partition by `user_id` to guarantee per-user ordering. Implement consumer sticky assignment. Add sequence numbers to events for client-side reordering if needed.

4. **Idempotency Bugs**:
   - **Risk**: Consumers may fail to detect duplicate events, leading to duplicate task instances or double notifications.
   - **Mitigation**: Comprehensive integration tests with forced event replays. Database unique constraints on `event_id`. Code reviews focused on idempotency logic.

5. **Azure Key Vault Latency**:
   - **Risk**: Secret fetching from Key Vault during pod startup may exceed timeout (>30 seconds), causing pod crash loops.
   - **Mitigation**: Dapr caches secrets for 60 seconds. Configure longer startup timeouts in Kubernetes liveness probes. Monitor Key Vault latency in Azure Monitor.

6. **Minikube Resource Exhaustion**:
   - **Risk**: Running all services (frontend, backend, Kafka, Dapr, recurring service, notification service) may exceed laptop resources.
   - **Mitigation**: Document minimum requirements (16GB RAM, 4 CPU cores). Provide "lightweight mode" that disables notification service and uses single Kafka replica.

7. **Schema Evolution Breaking Changes**:
   - **Risk**: Adding new fields to event messages may break old consumers, causing DLQ floods.
   - **Mitigation**: Implement schema versioning strategy (e.g., `v1.task.created`, `v2.task.created`). All consumers ignore unknown fields. New fields are optional with default values.

8. **CI/CD Pipeline Timeouts**:
   - **Risk**: GitHub Actions jobs may timeout (10-minute default) during Docker image builds or integration tests.
   - **Mitigation**: Optimize Dockerfiles with multi-stage builds and layer caching. Run integration tests in parallel. Extend job timeout to 20 minutes for deployment steps.

9. **mTLS Certificate Rotation Failures**:
   - **Risk**: Dapr Sentry service failure during certificate rotation may cause mTLS handshake failures, breaking service communication.
   - **Mitigation**: Monitor Sentry service health. Set `allowedClockSkew: 15m` to tolerate clock drift. Test certificate rotation in staging before production.

10. **DLQ Message Accumulation**:
    - **Risk**: DLQ topics may accumulate thousands of messages if a systemic bug causes all consumers to fail, leading to storage exhaustion.
    - **Mitigation**: Implement DLQ monitoring with alerts when message count exceeds 100. Automated DLQ consumer that logs errors to Azure Log Analytics. Manual review process for DLQ messages.

11. **Recurring Task "Thundering Herd"**:
    - **Risk**: 10,000+ recurring tasks scheduled for midnight UTC may overwhelm Dapr Jobs API and Kafka, causing delays or failures.
    - **Mitigation**: Dapr Jobs API supports jitter (spread executions over 5-10 minute window). Implement rate limiting in recurring service (max 100 task generations/second). Monitor consumer lag during peak times.

12. **Cloud Cost Overruns**:
    - **Risk**: Production AKS cluster with 3 node pools across 3 AZs may exceed budget ($500/month target).
    - **Mitigation**: Use Azure Cost Management alerts at $400/month. Right-size node pool VM SKUs (Standard_D2s_v5 for non-production). Enable cluster autoscaler to scale down during low traffic.

13. **Integration Test Flakiness**:
    - **Risk**: End-to-end tests may fail intermittently due to timing issues (e.g., event not processed before assertion).
    - **Mitigation**: Implement exponential backoff retries in test assertions. Use test-specific timeouts (30 seconds max). Run tests 3 times before declaring failure.

14. **Lack of Subagent Expertise**:
    - **Risk**: Subagent `phase5-cloud-deployment-engineer` may lack context or make incorrect implementation decisions.
    - **Mitigation**: This specification provides comprehensive requirements, constraints, and research findings. Subagent has access to `/phase-5/specs/mcp-research.md` and project CLAUDE.md. User reviews all code before merging.

---

## Success Metrics (Post-Launch)

**Tracked for 90 days post-production launch:**

1. **Recurring Task Adoption**: Percentage of active users who create at least one recurring task.
   - **Target**: 60% within 30 days, 80% within 90 days.

2. **Task Completion Rate**: Percentage of created tasks (recurring and one-time) that are marked complete.
   - **Target**: 25% increase for users with recurring tasks vs. users without.

3. **Event Processing Latency**: p95 latency from event publication to consumer processing.
   - **Target**: <1 second for 95% of events.

4. **System Uptime**: Percentage of time all critical services (backend, recurring service, Kafka) are operational.
   - **Target**: 99.9% (43 minutes max downtime per month).

5. **Notification Delivery Success Rate**: Percentage of scheduled reminders delivered within 1 minute of scheduled time.
   - **Target**: 99% success rate (excluding user email bounces).

6. **Cloud Infrastructure Cost per User**: Monthly Azure costs divided by number of active users.
   - **Target**: <$0.50/user/month for first 1000 users.

7. **Developer Velocity**: Average time to deploy a new feature from commit to production.
   - **Target**: <10 minutes for backend changes, <5 minutes for config changes.

8. **DLQ Message Rate**: Percentage of events that end up in dead-letter queues.
   - **Target**: <0.1% of total events (99.9% successful processing).

9. **Support Ticket Volume**: Number of support tickets related to task management features.
   - **Target**: 40% reduction compared to pre-Phase V baseline.

10. **User Satisfaction Score (NPS)**: Net Promoter Score for recurring task feature.
    - **Target**: NPS > 50 (measured via in-app survey after 30 days of feature usage).

---

**End of Specification**
