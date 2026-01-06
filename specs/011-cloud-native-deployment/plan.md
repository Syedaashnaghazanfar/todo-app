# Implementation Plan: Cloud Native Deployment

**Branch**: `011-cloud-native-deployment` | **Date**: 2026-01-04 | **Spec**: [spec.md](./spec.md)

## Summary

Containerize Phase 3 full-stack Todo application and deploy to Kubernetes using Helm charts. Enable local Minikube development and production deployment with multi-environment configuration.

## Technical Stack

- **Backend**: Python 3.12 + FastAPI (multi-stage Docker, non-root UID 10001)
- **Frontend**: Node.js 20 + Next.js 16 standalone (multi-stage Docker, non-root UID 1001)
- **Orchestration**: Kubernetes 1.25+ with Helm 3.10+
- **Database**: Neon PostgreSQL (production) OR bitnami/postgresql (dev)

## Constitution Check ✅

All Phase 4 principles PASS:
- P4-I: Context7 MCP generates infrastructure
- P4-II: Multi-stage container builds
- P4-III: Non-root security (UID 10001/1001)
- P4-IV: Secrets injection only (no hardcoded credentials)
- P4-V: Health probes mandatory
- P4-VI: Helm-first deployment

All Phase 3 principles PRESERVED (stateless, SDK mandate, database persistence)

## Project Structure

```
phase-4/
├── backend/                     # Existing Phase 4 backend code
├── frontend/todo-app/           # Existing Phase 4 frontend code
├── docker/                      # NEW: Docker infrastructure
│   ├── backend/Dockerfile       # Python 3.12 multi-stage
│   └── frontend/Dockerfile      # Node.js 20 standalone output
├── helm/todo-app/               # NEW: Helm chart
│   ├── Chart.yaml
│   ├── values.yaml              # Development defaults
│   ├── values-staging.yaml
│   ├── values-production.yaml
│   └── templates/               # 7 K8s resource templates
└── scripts/                     # NEW: Build + deploy automation
```

## Phase 0: Research (COMPLETED)

Used Context7 MCP server to gather 2025/2026 best practices:
- Docker: Multi-stage builds, non-root users, layer caching
- Kubernetes: Deployments, Services, Ingress, HPA v2, health probes
- Secrets: K8s Secrets vs ConfigMaps, env var injection
- Helm: Chart structure, values organization, template helpers

## Phase 1: Contracts (COMPLETED)

Generated templates in `specs/011-cloud-native-deployment/contracts/`:

1. **backend.Dockerfile**: python:3.12-slim, deps+runtime stages, appuser UID 10001, `fastapi run`
2. **frontend.Dockerfile**: node:20-alpine, deps+builder+runtime, nextjs UID 1001, standalone output
3. **deployment-backend.yaml**: 2 replicas, resource limits, health probes, secret/configmap env vars
4. **deployment-frontend.yaml**: 2 replicas, ConfigMap env vars, health probes
5. **service-backend.yaml**: ClusterIP port 8000
6. **service-frontend.yaml**: ClusterIP port 3000
7. **ingress.yaml**: Path routing (/api → backend, / → frontend), TLS config
8. **hpa-backend.yaml**: Min 2, max 10 replicas, CPU 70% target, stabilization
9. **secret-template.yaml**: DATABASE_URL, OPENAI_API_KEY, BETTER_AUTH_SECRET
10. **configmap-template.yaml**: FRONTEND_URL, LLM_PROVIDER, environment flags

## Key Design Decisions

| Decision | Rationale | Alternative Rejected |
|----------|-----------|---------------------|
| Fastapi run command | Official 2025 recommendation vs uvicorn | Uvicorn direct (deprecated pattern) |
| Next.js standalone | Reduces image <150MB vs >1GB | Full node_modules (bloated) |
| Helm chart | Multi-env templating | Raw kubectl manifests (no reuse) |
| Non-root UID 10001/1001 | Pod Security Standards compliance | Root user (insecure) |
| HPA v2 autoscaling/v2 | Stable API with stabilization | HPA v1 (less control) |

## Performance Targets

- Build: Backend <3min, Frontend <5min
- Deploy: Helm install <2min
- Startup: Backend pod <30s, Frontend pod <45s
- Recovery: Pod restart detection <10s
- Autoscaling: 2→4 replicas <60s at 70% CPU

## Next Steps

**Run `/sp.tasks`** to generate implementation tasks for:
- Creating docker/, helm/, scripts/ subdirectories in phase-4/
- Implementing Dockerfiles from contracts
- Implementing K8s manifests from contracts
- Creating Helm chart with 3 values files
- Writing deployment automation scripts
- Testing on Minikube (all acceptance scenarios)
- Documenting production deployment process

## References

- **Spec**: [spec.md](./spec.md) - 20 functional requirements, 12 success criteria
- **Contracts**: [contracts/](./contracts/) - 10 infrastructure templates
- **Constitution**: .specify/memory/constitution.md - Phase 4 principles
- **Phase 4 Code**: phase-4/backend/, phase-4/frontend/todo-app/ (Docker build contexts)
