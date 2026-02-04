# Phase 4: Cloud Native Deployment

**Status**: Implementation Complete - Ready for Docker Build & Testing ✅
**Feature**: 011-cloud-native-deployment
**Created**: 2026-01-04

## Overview

Phase 4 containerizes the Todo App (FastAPI backend + Next.js frontend) and enables deployment to Kubernetes using Docker, Helm, and Minikube.

## What's Included

### 🐳 Docker Infrastructure

**Backend Dockerfile** (`phase-4/backend/Dockerfile`):
- Multi-stage build (deps + runtime)
- Base: `python:3.12-slim`
- Non-root user: UID 10001 (appuser)
- Production command: `fastapi run`
- Expected size: <200MB

**Frontend Dockerfile** (`phase-4/frontend/Dockerfile`):
- Multi-stage build (deps + builder + runtime)
- Base: `node:20-alpine`
- Next.js standalone output
- Non-root user: UID 1001 (nextjs)
- Expected size: <150MB

### ⎈ Kubernetes Manifests

Located in `helm/todo-app/templates/`:
- `deployment-backend.yaml`: Backend deployment (2 replicas, health probes, resource limits)
- `deployment-frontend.yaml`: Frontend deployment (2 replicas, health probes)
- `service-backend.yaml`: ClusterIP service (port 8000)
- `service-frontend.yaml`: ClusterIP service (port 3000)
- `ingress.yaml`: Path-based routing (/api → backend, / → frontend)
- `hpa-backend.yaml`: Horizontal Pod Autoscaler (2-10 replicas, CPU 70%)
- `configmap.yaml`: Non-sensitive environment variables
- `secret-template.yaml`: Template for DATABASE_URL, OPENAI_API_KEY, BETTER_AUTH_SECRET

### 📦 Helm Chart

**Chart Structure**:
```
helm/todo-app/
├── Chart.yaml                 # Chart metadata (v2, name, version)
├── values.yaml                # Development defaults
├── values-staging.yaml        # Staging environment
├── values-production.yaml     # Production environment
└── templates/                 # Kubernetes manifests
```

**Multi-Environment Support**:
- **Development**: Minikube, 2 replicas, no TLS, todo-app.local
- **Staging**: 3 replicas, autoscaling, LetsEncrypt staging, staging.todo-app.com
- **Production**: 5 replicas, autoscaling, LetsEncrypt prod, todo-app.com

### 🚀 Automation Scripts

Located in `scripts/`:
- `build-images.sh`: Build Docker images (backend + frontend)
- `load-minikube.sh`: Load images into Minikube
- `deploy-dev.sh`: Automated Minikube deployment

### 📚 Documentation

Located in `docs/`:
- `DEPLOYMENT.md`: Comprehensive deployment guide (local, staging, production)
- `MINIKUBE.md`: Minikube setup and troubleshooting
- `SECRETS.md`: Secret management best practices

## Quick Start

### 1. Build Images

```bash
./phase-4/scripts/build-images.sh latest
```

**Expected Output**:
```
✓ Backend image built: todo-backend:latest
  Size: ~180MB
✓ Frontend image built: todo-frontend:latest
  Size: ~140MB
```

### 2. Start Minikube

```bash
minikube start --driver=docker --cpus=4 --memory=8192
minikube addons enable ingress
```

### 3. Load Images

```bash
./phase-4/scripts/load-minikube.sh latest
```

### 4. Create Secrets

```bash
kubectl create secret generic todo-secrets \
  --from-literal=database-url='postgresql://user:pass@host:5432/dbname' \
  --from-literal=openai-api-key='sk-xxxxx' \
  --from-literal=better-auth-secret='your-32-char-secret'
```

### 5. Deploy

```bash
./phase-4/scripts/deploy-dev.sh
```

### 6. Access Application

**Option A: Via Ingress**
```bash
# Add to /etc/hosts
echo "$(minikube ip) todo-app.local" | sudo tee -a /etc/hosts

# Access
open http://todo-app.local
```

**Option B: Via Port Forwarding**
```bash
kubectl port-forward svc/todo-frontend 3000:3000
open http://localhost:3000
```

## Implementation Summary

### ✅ Completed Tasks

**Phase 1: Setup (T001-T010)**
- Created docker/, helm/, scripts/, docs/ subdirectories in phase-4/
- Created .dockerignore files for backend and frontend
- Verified Minikube, Helm, Docker, kubectl installations
- Documented tool versions in MINIKUBE.md

**Phase 2: Foundation (T011-T015)**
- Configured Next.js standalone output in next.config.ts
- Verified requirements.txt and package.json exist
- Created SECRETS.md documentation
- Copied secret-template.yaml to Helm templates

**Phase 3: User Story 1 - Dockerization (T016-T042)**
- Created backend Dockerfile (multi-stage, non-root, fastapi run)
- Created frontend Dockerfile (multi-stage, standalone, non-root)

**Phase 3: Helm Chart Setup**
- Created Chart.yaml (apiVersion v2, metadata)
- Created values.yaml (development defaults)
- Created values-staging.yaml (staging configuration)
- Created values-production.yaml (production configuration)
- Copied all Kubernetes manifests to templates/

**Additional Implementation**
- Created build-images.sh automation script
- Created load-minikube.sh automation script
- Created deploy-dev.sh automation script
- Created comprehensive DEPLOYMENT.md guide

### ⏸️ Pending Tasks

**Docker Build Validation (T043-T047)** - Requires Docker Desktop Running
- Build backend image and verify size <200MB
- Build frontend image and verify size <150MB
- Verify non-root users (UID 10001, 1001)
- Test image startup times

**Minikube Testing (T048-T099)** - Requires Docker Images Built
- Deploy to Minikube
- Verify pod health checks
- Test Ingress routing
- Validate autoscaling
- Complete acceptance scenarios

## Performance Targets

| Metric | Target | Status |
|--------|--------|--------|
| **Backend Image Size** | <200MB | ⏸️ Pending build |
| **Frontend Image Size** | <150MB | ⏸️ Pending build |
| **Backend Build Time** | <3 minutes | ⏸️ Pending build |
| **Frontend Build Time** | <5 minutes | ⏸️ Pending build |
| **Helm Install Time** | <2 minutes | ⏸️ Pending test |
| **Backend Pod Startup** | <30 seconds | ⏸️ Pending test |
| **Frontend Pod Startup** | <45 seconds | ⏸️ Pending test |

## Architecture

### Container Security

- ✅ Non-root users (Backend: UID 10001, Frontend: UID 1001)
- ✅ Multi-stage builds (minimize attack surface)
- ✅ No hardcoded secrets (Kubernetes Secrets injection)
- ✅ Health probes (liveness + readiness)
- ✅ Resource limits (CPU + memory)

### High Availability

- ✅ Multiple replicas (2+ per service)
- ✅ Rolling updates (maxSurge: 1, maxUnavailable: 0)
- ✅ Horizontal Pod Autoscaling (CPU-based)
- ✅ Pod anti-affinity (production)
- ✅ Health probes with proper timing

### Multi-Environment Support

- ✅ Environment-specific values files
- ✅ Configurable resource limits
- ✅ Namespace isolation
- ✅ TLS configuration per environment
- ✅ Different autoscaling policies

## Next Steps

1. **Start Docker Desktop** (required for image builds)
2. **Build Images**: Run `./phase-4/scripts/build-images.sh latest`
3. **Deploy to Minikube**: Run `./phase-4/scripts/deploy-dev.sh`
4. **Test Functionality**: Verify all acceptance scenarios from spec.md
5. **Production Readiness**: Review DEPLOYMENT.md for production checklist

## References

- **Specification**: `../specs/011-cloud-native-deployment/spec.md`
- **Implementation Plan**: `../specs/011-cloud-native-deployment/plan.md`
- **Task Breakdown**: `../specs/011-cloud-native-deployment/tasks.md`
- **Contracts**: `../specs/011-cloud-native-deployment/contracts/`

---

**Status**: Infrastructure complete, ready for Docker build validation and Minikube testing ✅
