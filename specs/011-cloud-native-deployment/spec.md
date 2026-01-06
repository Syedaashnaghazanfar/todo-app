# Feature Specification: Cloud Native Deployment

**Feature Branch**: `011-cloud-native-deployment`
**Created**: 2026-01-04
**Status**: Draft
**Input**: User description: "Cloud Native Deployment with Docker, Kubernetes, and Helm - Containerize Phase 3 full-stack application for scalable, production-ready deployment"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Local Development with Minikube (Priority: P1)

As a developer, I need to run the complete Todo application stack locally using Minikube so that I can develop and test features in an environment identical to production.

**Why this priority**: Foundation for all cloud-native development. Without local Kubernetes environment, developers cannot validate containers, configurations, or deployments before production. Delivers immediate value by enabling container-based development workflow.

**Independent Test**: Can be fully tested by running `helm install todo-app ./helm/todo-app` on Minikube cluster and accessing the application via port-forward or Ingress. Verifies containerization, networking, and database connectivity work correctly in local Kubernetes environment.

**Acceptance Scenarios**:

1. **Given** Minikube is running on developer machine, **When** developer runs `helm install todo-app ./helm/todo-app --set environment=development`, **Then** all pods (frontend, backend, database) start successfully within 2 minutes
2. **Given** Todo app deployed to Minikube, **When** developer port-forwards to frontend service and accesses localhost:3000, **Then** Next.js application loads with full UI functionality
3. **Given** Todo app running in Minikube, **When** developer creates a task via ChatKit interface, **Then** task persists in PostgreSQL database and appears in task list
4. **Given** Backend pod crashes, **When** Kubernetes restarts the pod, **Then** application recovers automatically and maintains conversation history from database
5. **Given** Developer modifies code, **When** developer rebuilds container with `docker build` and updates deployment with `kubectl rollout restart`, **Then** new version deploys without data loss

---

### User Story 2 - Production Deployment to Kubernetes Cluster (Priority: P2)

As a DevOps engineer, I need to deploy the Todo application to a production Kubernetes cluster (cloud-hosted or self-managed) with proper resource limits, health checks, and autoscaling so that the application is resilient and cost-effective at scale.

**Why this priority**: Critical for production operations. Ensures application can handle real user traffic with proper resource management, automatic recovery, and horizontal scaling. Depends on P1 (local development) being functional first.

**Independent Test**: Can be tested independently by deploying Helm chart to production cluster with production values (`helm install todo-app ./helm/todo-app -f values-production.yaml`). Validates resource limits enforce, health probes detect failures, HPA scales replicas based on CPU load, and Ingress exposes application to internet.

**Acceptance Scenarios**:

1. **Given** Production Kubernetes cluster configured, **When** DevOps engineer deploys Helm chart with production values, **Then** frontend and backend deployments start with configured replica counts (frontend: 2, backend: 2)
2. **Given** Application deployed to production, **When** backend pod fails liveness probe, **Then** Kubernetes automatically restarts the pod and removes it from service rotation until healthy
3. **Given** Production deployment running, **When** CPU utilization exceeds 70%, **Then** HorizontalPodAutoscaler automatically scales backend replicas from 2 to 4
4. **Given** Application exposed via Ingress, **When** user accesses https://todo-app.example.com, **Then** TLS certificate validates and application loads securely
5. **Given** Database credentials stored as Kubernetes Secret, **When** backend pod starts, **Then** DATABASE_URL environment variable is injected from secret without exposing plaintext in manifests

---

### User Story 3 - Multi-Environment Configuration with Helm (Priority: P3)

As a platform engineer, I need to manage multiple deployment environments (development, staging, production) using a single Helm chart with environment-specific value overrides so that configuration is consistent, auditable, and easy to promote between environments.

**Why this priority**: Operational efficiency and safety. Enables GitOps workflows, prevents configuration drift, and reduces deployment errors. Depends on P2 (production deployment) patterns being established first.

**Independent Test**: Can be tested by deploying the same Helm chart to three different namespaces with different values files (`helm install -f values-dev.yaml`, `helm install -f values-staging.yaml`, `helm install -f values-production.yaml`). Verifies environment-specific configurations (replica counts, resource limits, domains, database connections) apply correctly without modifying chart templates.

**Acceptance Scenarios**:

1. **Given** Helm chart with templated values, **When** platform engineer installs chart with development values (`environment=development, replicaCount=1, resources.limits.memory=256Mi`), **Then** deployment uses minimal resources suitable for cost-effective development environment
2. **Given** Staging environment configured, **When** chart installed with staging values (`environment=staging, replicaCount=2, database.host=staging-db.example.com`), **Then** application connects to staging database and runs with moderate resource allocation
3. **Given** Production values file with high resource limits, **When** chart installed to production namespace, **Then** pods enforce production resource limits (memory=1Gi, cpu=500m) and connect to production Neon database
4. **Given** Multiple environments deployed, **When** platform engineer compares resource consumption, **Then** development uses <25% of production resources, staging uses ~50%, demonstrating cost optimization
5. **Given** Environment-specific Ingress configuration, **When** chart deployed to staging with `ingress.host=staging.todo-app.example.com`, **Then** application accessible at correct subdomain with environment isolation

---

### Edge Cases

- **What happens when database connection fails during pod startup?** Backend readiness probe fails, Kubernetes does not route traffic to pod until DATABASE_URL connection succeeds. Pod remains in "NotReady" state with clear error in logs. Application gracefully degrades by preventing traffic to unhealthy pods.

- **How does system handle Docker image registry authentication failures?** Kubernetes ImagePullBackOff status indicates registry auth failure. Deployment remains in pending state. Engineers troubleshoot by verifying imagePullSecrets configured correctly. For Minikube, developers use `minikube image load` to bypass registry entirely.

- **What happens when HPA scales replicas down during active user sessions?** Kubernetes terminates pods gracefully with SIGTERM signal. Existing HTTP connections complete before pod shutdown (graceful shutdown period: 30s). Better Auth session persists in database, users reconnect to remaining pods seamlessly without losing authentication.

- **How does system handle Helm upgrade failures?** Helm rolls back to previous revision automatically if upgrade fails (using `--atomic` flag). Database migrations applied via init containers are idempotent, preventing partial schema changes. Applications remain on stable version until issue resolved.

- **What happens when OpenAI API key secret is missing or invalid?** Backend pod starts successfully (passes liveness probe checking HTTP /health endpoint) but ChatKit requests fail with 401/403 errors. Readiness probe optional AI health check can detect this, removing pod from service. Clear error logs guide engineers to verify secret configuration.

- **How does system handle PersistentVolumeClaim provisioning failures for PostgreSQL?** StatefulSet remains in pending state if PVC cannot provision. Minikube requires manual PV provisioning or dynamic provisioner setup. Cloud providers auto-provision PVCs. Engineers verify storage class availability and quota limits.

- **What happens when Ingress controller is not installed in cluster?** Ingress resource creates successfully but remains non-functional (no external IP assigned). Services remain accessible via NodePort or port-forward for testing. Engineers install Ingress controller (nginx-ingress, Traefik) before exposing application to internet.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST containerize FastAPI backend using multi-stage Docker build with `python:3.12-slim` base image, non-root user execution, and optimized layer caching for requirements.txt
- **FR-002**: System MUST containerize Next.js frontend using multi-stage Docker build with `node:20-alpine` base image, standalone output mode, and proper NEXT_PUBLIC_ environment variable handling at build vs runtime
- **FR-003**: Deployment MUST run containers as non-root user for security compliance (backend: appuser UID 10001, frontend: nextjs UID 1001)
- **FR-004**: Backend Dockerfile MUST use `CMD ["fastapi", "run", "src/backend/main.py", "--host", "0.0.0.0", "--port", "8000"]` execution format (not uvicorn directly, per 2025 best practices)
- **FR-005**: Frontend Dockerfile MUST reduce image size to <150MB using Next.js standalone output and node:20-alpine runtime stage
- **FR-006**: System MUST define Kubernetes Deployment resources for frontend and backend with mandatory resource requests and limits (CPU and memory)
- **FR-007**: Backend Deployment MUST implement liveness probe (HTTP GET /api/v1/health) and readiness probe (HTTP GET /api/v1/health) with appropriate delays and thresholds
- **FR-008**: Frontend Deployment MUST implement liveness probe (HTTP GET /) and readiness probe (HTTP GET /) for container health monitoring
- **FR-009**: System MUST expose backend via Kubernetes ClusterIP Service on port 8000 for internal cluster communication
- **FR-010**: System MUST expose frontend via Kubernetes LoadBalancer or Ingress resource for external user access
- **FR-011**: System MUST configure Ingress resource with path-based routing (/ → frontend, /api → backend) and optional TLS termination
- **FR-012**: System MUST inject sensitive configuration (DATABASE_URL, OPENAI_API_KEY, BETTER_AUTH_SECRET) via Kubernetes Secrets, NOT baked into container images
- **FR-013**: System MUST inject non-sensitive configuration (FRONTEND_URL, LLM_PROVIDER, environment flags) via Kubernetes ConfigMaps
- **FR-014**: Helm chart MUST template all environment-specific values (replica counts, resource limits, ingress hosts, database connections) in values.yaml
- **FR-015**: Helm chart MUST use standard helpers (_helpers.tpl) for consistent naming and labels across all resources
- **FR-016**: Helm chart MUST support local development mode with Minikube, connecting to remote Neon database via ExternalName Service OR including bitnami/postgresql subchart dependency for self-contained offline development
- **FR-017**: Minikube workflow MUST support `minikube image load` for loading local Docker images without registry push
- **FR-018**: Backend Deployment MUST set DATABASE_URL environment variable from Kubernetes Secret at pod runtime
- **FR-019**: Backend Deployment MUST set OPENAI_API_KEY environment variable from Kubernetes Secret for ChatKit integration
- **FR-020**: Frontend Deployment MUST receive NEXT_PUBLIC_API_URL at build time (Docker ARG) and runtime (Kubernetes ConfigMap) for API endpoint configuration

### Key Entities *(include if feature involves data)*

- **Container Image**: Immutable artifact containing application code, runtime dependencies, and configuration. Built via multi-stage Dockerfile, tagged with semantic version (e.g., `todo-backend:1.0.0`), stored in container registry (Docker Hub, GHCR, or minikube cache).

- **Kubernetes Deployment**: Declarative specification defining desired state for application replicas, including pod template (container image, resource limits, probes, volumes), replica count, update strategy (RollingUpdate), and selector labels.

- **Kubernetes Service**: Network abstraction providing stable IP/DNS for pod communication. ClusterIP for internal services (backend → database), LoadBalancer for external access (frontend), Ingress for HTTP routing.

- **Kubernetes Secret**: Encrypted storage for sensitive configuration (DATABASE_URL, OPENAI_API_KEY, BETTER_AUTH_SECRET). Injected into pods as environment variables or volume mounts. Base64-encoded in manifests but encrypted at rest in etcd.

- **Kubernetes ConfigMap**: Key-value storage for non-sensitive configuration (FRONTEND_URL, LLM_PROVIDER, CORS_ORIGINS, environment flags). Decouples configuration from container images, enabling same image across environments.

- **Helm Chart**: Package manager template defining Kubernetes resources with parameterized values. Includes templates/ directory (Deployment, Service, Ingress), values.yaml (default configuration), Chart.yaml (metadata, dependencies), and _helpers.tpl (reusable template functions).

- **HorizontalPodAutoscaler (HPA)**: Autoscaling policy monitoring metrics (CPU, memory) and adjusting replica count dynamically. Configured with min/max replicas and target utilization thresholds.

- **Ingress Resource**: HTTP routing rules mapping external URLs to internal Services. Supports TLS termination, path-based routing, and hostname-based virtual hosting.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Backend Docker image builds in under 3 minutes using multi-stage build with dependency layer caching, resulting in final image size <200MB
- **SC-002**: Frontend Docker image builds in under 5 minutes and produces standalone runtime image <150MB (compared to >1GB without optimization)
- **SC-003**: Complete application stack (frontend, backend, database) deploys to Minikube from `helm install` command within 2 minutes from cold start
- **SC-004**: Application handles backend pod restart (simulated crash) within 10 seconds via liveness probe detection and automatic pod replacement without user-visible downtime
- **SC-005**: HorizontalPodAutoscaler scales backend from 2 to 4 replicas within 60 seconds when CPU utilization exceeds 70% during load test
- **SC-006**: Developers rebuild and redeploy backend container to Minikube in under 90 seconds using `docker build`, `minikube image load`, and `kubectl rollout restart` workflow
- **SC-007**: Helm chart deploys successfully to three environments (dev, staging, production) with single command using environment-specific values files, requiring zero template modifications
- **SC-008**: Resource consumption in development environment (Minikube) uses <25% of production resource allocation, demonstrating cost-effective environment tiering
- **SC-009**: All containers run as non-root user, verified by `kubectl exec <pod> -- id` showing UID 10001 (backend) or UID 1001 (frontend)
- **SC-010**: Zero secrets or credentials appear in container images or Kubernetes manifests when inspected with `docker inspect` or `kubectl get deployment -o yaml`
- **SC-011**: Application serves user requests successfully within 5 seconds of Ingress configuration, verified by accessing public URL in browser
- **SC-012**: Conversation history persists across backend pod deletions (tested by creating task, deleting pod, verifying conversation visible after new pod starts)

## Assumptions

### Technology Assumptions

- **Kubernetes Version**: Cluster runs Kubernetes 1.25+ with stable APIs (apps/v1, networking.k8s.io/v1) and support for HorizontalPodAutoscaler v2
- **Helm Version**: Helm 3.10+ installed on developer machines and CI/CD pipelines for chart management
- **Container Runtime**: Docker 20.10+ or compatible runtime (containerd, CRI-O) available for building images
- **Minikube Configuration**: Local Minikube cluster allocated 4GB RAM minimum, 2 CPUs, and Kubernetes 1.25+ for development testing
- **Base Image Availability**: Public access to `python:3.12-slim`, `node:20-alpine` Docker Official Images and `bitnami/postgresql` Helm chart

### Infrastructure Assumptions

- **Container Registry**: Access to container registry for storing images (Docker Hub, GitHub Container Registry, or Minikube local cache for development)
- **Database Strategy**: Production uses existing Neon Serverless PostgreSQL (external to Kubernetes); development optionally uses bitnami/postgresql Helm chart for self-contained local environment
- **Ingress Controller**: Production cluster has Ingress controller installed (nginx-ingress, Traefik, or cloud provider Ingress) for HTTP routing; Minikube uses built-in ingress addon
- **Storage Provisioner**: Kubernetes cluster has dynamic storage provisioner configured (cloud provider default, or manual PV provisioning for Minikube) to support PostgreSQL PersistentVolumeClaims
- **Network Access**: Backend pods can reach external Neon database over internet (if using remote database strategy); firewall rules permit Kubernetes egress traffic

### Development Assumptions

- **Existing Phase 3 Application**: Functional Phase 3 codebase with FastAPI backend, Next.js frontend, Better Auth, and OpenAI ChatKit integration serves as containerization source
- **Environment Variables**: Developers have access to required secrets (DATABASE_URL, OPENAI_API_KEY, BETTER_AUTH_SECRET) for local testing
- **Docker Knowledge**: Developers understand basic Docker commands (build, tag, run) and multi-stage Dockerfile syntax
- **Kubernetes Familiarity**: Platform engineers understand Kubernetes concepts (Pods, Deployments, Services, ConfigMaps, Secrets) and kubectl CLI
- **Helm Experience**: Engineers can install, upgrade, and customize Helm charts using values files and `--set` flags

### Operational Assumptions

- **Image Build Pipeline**: CI/CD pipeline (GitHub Actions, GitLab CI, or local scripts) builds Docker images on code commits and tags with semantic versions
- **Secret Management**: Platform team manages Kubernetes Secret creation manually via kubectl or integrates with external secret manager (Vault, AWS Secrets Manager) for production
- **Monitoring Access**: Engineers have access to `kubectl logs`, `kubectl describe`, and cluster monitoring tools (Prometheus, Grafana, or cloud provider dashboards) for troubleshooting
- **Rollback Strategy**: Helm's rollback mechanism (`helm rollback`) is understood and practiced for deployment failures; database migrations are idempotent to support rollback scenarios
- **Resource Quotas**: Kubernetes namespaces have sufficient resource quotas to accommodate deployment replica counts and autoscaling limits

### Scope Assumptions

- **Database Migration**: Alembic migrations for Phase 3 (conversations, messages tables) already exist; Phase 4 does NOT introduce new database schema changes
- **Authentication**: Better Auth integration from Phase 3 remains unchanged; JWT verification in backend continues to work with containerized deployment
- **ChatKit Configuration**: OpenAI ChatKit domain allowlist and API keys configured in Phase 3 remain valid; Phase 4 updates NEXT_PUBLIC_API_URL to point to Kubernetes Ingress endpoint
- **Load Balancing**: Kubernetes Service load balancing (iptables/IPVS) sufficient for initial production traffic; advanced load balancing (Istio, Linkerd service mesh) out of scope for Phase 4
- **Observability**: Application-level logging (stdout/stderr) captured by Kubernetes; structured logging and distributed tracing (OpenTelemetry) are future enhancements, not P1 requirements

## Non-Functional Requirements

### Performance

- **Container Build Time**: Backend Docker build completes in <3 minutes; frontend in <5 minutes (leveraging layer caching on incremental changes)
- **Deployment Speed**: Helm install/upgrade deploys all resources within 2 minutes from command execution
- **Startup Time**: Backend pod reaches Ready state within 30 seconds; frontend pod within 45 seconds (including dependency downloads and health probe delays)
- **Resource Efficiency**: Development environment consumes <1GB RAM total; production backend pod limited to 1GB RAM, frontend to 512MB RAM per replica

### Scalability

- **Horizontal Scaling**: HorizontalPodAutoscaler supports scaling backend from 2 to 10 replicas based on CPU/memory metrics
- **Database Connection Pooling**: Backend maintains efficient database connection pool (10 connections/pod max) to prevent Neon connection limit exhaustion under scale
- **Stateless Architecture**: All pods are stateless (session data in database), enabling seamless traffic distribution across replicas

### Reliability

- **Health Probes**: Liveness probes detect and restart unhealthy containers within 10 seconds of failure; readiness probes prevent traffic to unready pods
- **Graceful Shutdown**: Pods handle SIGTERM gracefully, completing in-flight requests within 30-second termination grace period
- **Rolling Updates**: Deployment updates use RollingUpdate strategy with maxUnavailable=25%, maxSurge=25% to maintain availability during releases
- **Restart Policy**: Pods restart automatically on failure (restartPolicy: Always) with exponential backoff

### Security

- **Non-Root Containers**: All containers run as dedicated non-root users (UID >1000) with dropped Linux capabilities
- **Secret Injection**: Sensitive data injected via Kubernetes Secrets at runtime; never committed to Git or baked into images
- **Network Policies** *(optional future enhancement)*: Define ingress/egress rules restricting pod-to-pod communication
- **Image Scanning**: Docker images scanned for vulnerabilities (Trivy, Snyk) before deployment *(recommended but not blocking for Phase 4 P1)*

### Maintainability

- **Configuration as Code**: All Kubernetes resources defined in version-controlled YAML; no manual kubectl edits in production
- **Environment Parity**: Development, staging, production use identical Helm chart with values-driven configuration differences
- **Documentation**: README includes setup instructions for Minikube, Docker builds, Helm installation, and troubleshooting common issues

## Out of Scope

### Explicitly Excluded from Phase 4

- **Service Mesh** (Istio, Linkerd): Advanced traffic management, circuit breaking, and mutual TLS encryption between services
- **Advanced Observability**: Distributed tracing (Jaeger, Zipkin), structured logging (ELK stack), custom Prometheus metrics, Grafana dashboards
- **GitOps Automation**: ArgoCD or FluxCD for automated deployment from Git commits; Phase 4 uses manual `helm install/upgrade`
- **Multi-Region Deployment**: Geographic distribution, active-active failover, global load balancing across Kubernetes clusters
- **Database High Availability**: PostgreSQL replication, failover automation, backup/restore automation (relies on Neon managed service HA)
- **Secrets Management Integration**: External secret providers (HashiCorp Vault, AWS Secrets Manager, Azure Key Vault) for dynamic secret injection
- **Advanced Autoscaling**: KEDA (Kubernetes Event-Driven Autoscaling) based on queue depth, request rate, or custom metrics beyond CPU/memory
- **Container Image Optimization**: Distroless images, multi-architecture builds (amd64/arm64), image signing with Cosign
- **Kubernetes Operators**: Custom controllers for application-specific lifecycle management, database schema migration automation
- **Network Policies**: Fine-grained pod-to-pod communication restrictions, egress filtering
- **Pod Security Policies/Standards**: Enforcement of security baselines via PSP (deprecated) or Pod Security Standards admission controller
- **Cost Optimization**: Spot instance integration, cluster autoscaling, resource right-sizing recommendations
- **Disaster Recovery**: Backup/restore procedures, RTO/RPO targets, disaster recovery testing

## Dependencies

### External Dependencies

- **Neon PostgreSQL Database**: Phase 3 production database must remain accessible from Kubernetes pods over internet; connection string provided via DATABASE_URL secret
- **OpenAI API**: ChatKit functionality requires valid OPENAI_API_KEY; OpenAI domain allowlist must include production Ingress hostname
- **Container Registry**: Docker Hub, GitHub Container Registry, or equivalent registry accessible from Kubernetes cluster for pulling images
- **Kubernetes Cluster**: Access to functional Kubernetes cluster (Minikube for local, GKE/EKS/AKS/self-managed for production) with sufficient resources
- **Helm**: Helm 3.10+ CLI installed on developer machines and CI/CD runners for chart deployment

### Internal Dependencies

- **Phase 3 Codebase**: Functional Phase 3 application (FastAPI backend with ChatKit, Next.js frontend, Better Auth, database models) serves as containerization input
- **Alembic Migrations**: Existing database migrations for conversations and messages tables must be idempotent for safe re-application during pod restarts
- **Environment Variables**: Backend requires DATABASE_URL, OPENAI_API_KEY, BETTER_AUTH_SECRET, FRONTEND_URL; frontend requires NEXT_PUBLIC_API_URL, NEXT_PUBLIC_CHATKIT_URL

### Dependency Risks

- **Neon Database Connectivity**: If Kubernetes cluster cannot reach Neon over internet (firewall rules, network policies), backend pods fail readiness probes. **Mitigation**: Validate network connectivity before deployment; use bitnami/postgresql Helm subchart for fully self-contained local development.
- **Container Registry Availability**: If registry is unavailable during deployment, Kubernetes ImagePullBackOff prevents pod startup. **Mitigation**: For Minikube, use `minikube image load` to bypass registry; for production, ensure registry SLA and credentials are valid.
- **Helm Chart Dependencies**: If bitnami/postgresql chart version incompatible with Helm version, chart installation fails. **Mitigation**: Pin bitnami/postgresql version in Chart.yaml dependencies; test locally before production use.

## Risks

### Technical Risks

- **Docker Build Failures**: Multi-stage builds fail if base images (`python:3.12-slim`, `node:20-alpine`) are unavailable or corrupted. **Mitigation**: Pin specific image digests (e.g., `python:3.12-slim@sha256:abc123`) for reproducibility; cache base images locally.
- **Resource Exhaustion**: Minikube cluster with insufficient resources (<4GB RAM) causes OOMKilled pod failures. **Mitigation**: Document minimum Minikube resource requirements; provide troubleshooting guide for OOM errors.
- **Database Connection Pooling**: Excessive pod replicas exhaust Neon connection limits (default free tier: 100 connections). **Mitigation**: Configure SQLAlchemy pool size (max 10 connections/pod); monitor connection usage; upgrade Neon plan if needed.
- **Secrets Leakage**: Developers accidentally commit Kubernetes Secrets YAML with base64-encoded credentials to Git. **Mitigation**: Add `**/secrets.yaml` to .gitignore; use Git pre-commit hooks to scan for secrets; educate team on secret management.

### Operational Risks

- **Ingress Misconfiguration**: Incorrect Ingress path routing (e.g., `/api` not forwarding to backend) breaks API communication. **Mitigation**: Test Ingress configuration thoroughly in Minikube before production; use annotations for URL rewriting if needed.
- **HPA Thrashing**: HPA scales up/down rapidly under fluctuating load, causing instability. **Mitigation**: Configure HPA with scaleDown stabilization window (5 minutes) and scale-up delay (30 seconds) to prevent thrashing.
- **Rolling Update Failures**: Database schema changes incompatible with old code version cause errors during rolling updates. **Mitigation**: Ensure Alembic migrations are backward-compatible; use blue-green deployment for breaking schema changes.

### Security Risks

- **Non-Root User Misconfiguration**: Incorrectly configured USER directive in Dockerfile still runs container as root. **Mitigation**: Verify non-root execution with `kubectl exec <pod> -- id`; enforce Pod Security Standards in production cluster.
- **Exposed Secrets**: Secrets visible in pod describe output or logs if accidentally printed. **Mitigation**: Never log environment variables containing secrets; review application code for accidental secret exposure.

## Clarifications Needed

*None - All requirements derived from industry best practices and Phase 3 architecture analysis. Default assumptions documented in Assumptions section.*
