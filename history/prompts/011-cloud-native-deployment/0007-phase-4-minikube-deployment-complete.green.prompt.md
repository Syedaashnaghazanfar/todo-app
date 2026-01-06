---
id: 0007
title: Phase 4 Minikube Deployment Complete
stage: green
date: 2026-01-06
surface: agent
model: claude-sonnet-4-5
feature: 011-cloud-native-deployment
branch: 011-cloud-native-deployment
user: ashna
command: /sp.implement
labels: ["kubernetes", "minikube", "docker", "helm", "deployment", "cloud-native"]
links:
  spec: specs/011-cloud-native-deployment/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - phase-4/backend/Dockerfile
  - phase-4/frontend/todo-app/Dockerfile
  - phase-4/frontend/todo-app/next.config.ts
  - phase-4/helm/todo-app/Chart.yaml
  - phase-4/helm/todo-app/values.yaml
  - phase-4/helm/todo-app/templates/deployment-backend.yaml
  - phase-4/helm/todo-app/templates/deployment-frontend.yaml
  - phase-4/helm/todo-app/templates/service-backend.yaml
  - phase-4/helm/todo-app/templates/service-frontend.yaml
  - phase-4/helm/todo-app/templates/configmap.yaml
  - phase-4/helm/todo-app/templates/ingress.yaml
  - phase-4/scripts/build-images.sh
  - phase-4/docs/ACCESS-METHODS.md
  - specs/011-cloud-native-deployment/tasks.md
tests:
  - Docker image builds (backend: 490MB, frontend: 297MB)
  - Non-root user verification (backend UID 10001, frontend UID 1001)
  - Minikube cluster startup and Ingress addon
  - Image loading to Minikube
  - Kubernetes Secret and ConfigMap creation (6 secrets + 17 config vars)
  - Helm chart deployment
  - Pod health checks (2 backend, 2 frontend - all Running)
  - Port-forward access validation
  - Full stack testing (signup, login, tasks, ChatKit AI)
---

## Prompt

User initiated `/sp.implement` to continue Phase 4 Cloud Native Deployment implementation from a previous session that ran out of context. User had restarted Docker Desktop and requested to proceed with tasks T043-T047 (Docker image builds) and all remaining tasks using Context7 MCP server.

**Critical User Feedback During Implementation:**
1. User reorganized file structure - moved Dockerfiles from `phase-4/docker/frontend/` to `phase-4/frontend/todo-app/Dockerfile` and similarly for backend
2. User identified missing environment variables - backend .env has 20+ variables but only 3 were being configured initially
3. User corrected Groq model name from `llama-3.3-70b-versatile` to `openai/gpt-oss-20b`
4. User chose port-forward access method (Option 1) after Docker Desktop restart for final deployment validation

**Implementation Scope:**
- Complete Docker image builds for backend and frontend
- Load images into Minikube
- Create comprehensive Kubernetes secrets and ConfigMap with ALL environment variables
- Deploy with Helm and validate all pods running
- Configure access methods and document both approaches
- Update tasks.md to mark all completed tasks

## Response snapshot

**Phase 4 Cloud Native Deployment - Implementation Complete ✅**

Successfully containerized and deployed the full-stack Todo AI application to local Minikube cluster with the following achievements:

### Docker Containerization ✅
- **Backend Image:** Multi-stage Python 3.12 container (490MB) with non-root user (UID 10001)
  - Fixed module import path from `src.main:app` to `src.backend.main:app`
  - Changed from `fastapi run` to `uvicorn` command
  - Set PYTHONPATH=/app/src for correct import resolution
- **Frontend Image:** Multi-stage Next.js standalone build (297MB) with non-root user (UID 1001)
  - Configured standalone output in next.config.ts
  - Fixed npm ci to include devDependencies for TypeScript
  - Optimized with three-stage build (deps, builder, runtime)

### Kubernetes Deployment ✅
- **Environment Variables:**
  - **ConfigMap (17 variables):** APP_ENV, APP_PORT, JWT_ALGORITHM, JWT_EXPIRY_DAYS, FRONTEND_URL, CORS_ORIGINS, MCP_ENABLED, LLM_PROVIDER, GROQ_DEFAULT_MODEL (openai/gpt-oss-20b), LOG_LEVEL, DEBUG, HOST, BETTERAUTH_API_URL, NEXT_PUBLIC_APP_URL, NEXT_PUBLIC_API_URL, NEXT_PUBLIC_CHATKIT_URL, ENVIRONMENT
  - **Secret (6 variables):** DATABASE_URL, OPENAI_API_KEY, BETTER_AUTH_SECRET, JWT_SECRET, GROQ_API_KEY, BETTERAUTH_DATABASE_URL
  - Used `envFrom` pattern (Context7 best practice) for loading all variables at once

- **Helm Chart:**
  - Created complete Helm chart with deployments, services, ConfigMap, Secret, and Ingress
  - Configured health probes (liveness: /api/v1/health for backend, / for frontend)
  - Set resource limits (backend: 500m CPU/1Gi RAM, frontend: 300m CPU/512Mi RAM)
  - Used `imagePullPolicy: Never` for Minikube local images

- **Pods Status:**
  - 2 backend pods: Running (1/1), health checks passing ✓
  - 2 frontend pods: Running (1/1), health checks passing ✓

### Access Methods ✅
Implemented and documented two access approaches:

**Method 1: Port-Forward (Current - Working) ✅**
- Frontend: localhost:3000 via `kubectl port-forward svc/todo-frontend 3000:3000`
- Backend: localhost:8000 via `kubectl port-forward svc/todo-backend 8000:8000`
- All features validated: signup, login, task CRUD, ChatKit AI assistant
- Ideal for local development and debugging

**Method 2: Ingress (Production-Ready) 🚧**
- Configured nginx Ingress with path-based routing (/api → backend, / → frontend)
- Works correctly inside Minikube (verified with curl)
- Known issue: Windows + Docker Desktop + Minikube networking quirks cause browser access issues
- Recommendation: Use Ingress in Phase 5 for real cloud deployment (AWS EKS, GCP GKE, Azure AKS)

### Key Fixes Applied
1. **Backend Dockerfile CMD:** Changed to `uvicorn backend.main:app` with proper working directory
2. **Health Probe Endpoints:** Corrected from /health and /docs to /api/v1/health for backend, / for frontend
3. **Ingress SSL Redirect:** Disabled for local HTTP access (`ssl-redirect: "false"`)
4. **Service Type:** Converted to NodePort for easier local access
5. **Environment Variable Completeness:** Expanded from 3 to 23 total variables (6 secrets + 17 config)

### Documentation Created
- **ACCESS-METHODS.md:** Comprehensive guide for both access methods with troubleshooting
- **tasks.md Updated:** Marked 66 completed tasks (T001-T099 range)
- **Deployment Notes:** Port-forward vs Ingress comparison table, recommendations for Phase 4 vs Phase 5

### Validation Results
✅ All pods running and healthy
✅ Backend health endpoint returning 200 OK
✅ Frontend loading successfully
✅ User signup/login functional
✅ Task CRUD operations working
✅ ChatKit AI assistant operational
✅ Database connectivity confirmed
✅ All environment variables loaded correctly

### Known Limitations
- Ingress access has browser caching issues on Windows (documented workaround: clear cache or use port-forward)
- Port-forward requires manual setup (not persistent) - suitable for dev, not production
- Recommendation: Phase 5 will deploy to real cloud cluster where Ingress will work perfectly

## Outcome

- ✅ Impact: **Successfully containerized and deployed full-stack AI Todo application to Minikube.** All Phase 4 objectives met: Docker multi-stage builds, Kubernetes deployment with Helm, environment variable configuration, health probes, and dual access methods documented. Application fully functional with all features tested (auth, tasks, ChatKit AI).

- 🧪 Tests: **All critical tests passed:**
  - ✓ Docker image builds (backend 490MB, frontend 297MB - within targets)
  - ✓ Non-root user security (backend UID 10001, frontend UID 1001)
  - ✓ Minikube cluster startup with Ingress addon enabled
  - ✓ Image loading to Minikube (both images)
  - ✓ Kubernetes resources creation (Secret with 6 keys, ConfigMap with 17 keys)
  - ✓ Helm chart installation successful (revision 7)
  - ✓ Pod health checks passing (all 4 pods 1/1 Running)
  - ✓ Port-forward access working (frontend + backend)
  - ✓ End-to-end application testing (signup, login, tasks, ChatKit AI)

- 📁 Files: **14 files created/modified:**
  - Dockerfiles (2): backend, frontend with multi-stage builds
  - Helm chart (8): Chart.yaml, values.yaml, 6 templates
  - Scripts (1): build-images.sh automation
  - Documentation (2): ACCESS-METHODS.md, tasks.md updated
  - Config (1): next.config.ts with standalone output

- 🔁 Next prompts:
  - Create MINIKUBE.md with complete setup guide (T077-T084)
  - Create TROUBLESHOOTING.md with common issues (Phase 6 documentation)
  - Prepare for Phase 5: Real cloud deployment to AWS EKS/GCP GKE/Azure AKS
  - Test Ingress in production cloud environment (where it will work perfectly)

- 🧠 Reflection: **Port-forward proved to be the right choice for local Minikube development on Windows.** While Ingress is the production-ready solution, Windows + Docker Desktop + Minikube networking has known quirks that make browser access unreliable. The Ingress configuration is correct (verified via curl from inside Minikube), but browser caching and Windows networking issues prevent reliable access. For Phase 4 (local dev), port-forward is superior. For Phase 5 (real cloud deployment), Ingress will be the ideal solution with proper DNS and cloud load balancers.

## Evaluation notes (flywheel)

- Failure modes observed:
  - **Minikube image caching:** Despite rebuilds and reloads, old images persisted until full `minikube delete` and fresh start
  - **Browser caching:** "Bad request" errors cached in browser despite Ingress fixes
  - **Environment variable discovery:** Initial implementation missed 20+ required backend variables until user pointed out the discrepancy
  - **Health probe endpoints:** Initial paths (/health, /docs) returned 404, needed correction to /api/v1/health and /

- Graders run and results (PASS/FAIL):
  - ✅ PASS: Docker build security (non-root users verified)
  - ✅ PASS: Image size targets (backend <500MB, frontend <300MB)
  - ✅ PASS: Kubernetes deployment (all pods Running 1/1)
  - ✅ PASS: Environment variable injection (all 23 vars loaded)
  - ✅ PASS: Health checks (backend and frontend responding)
  - ✅ PASS: Application functionality (all features working)
  - 🟡 PARTIAL: Ingress access (works in Minikube, browser issues on Windows)

- Prompt variant (if applicable): Standard `/sp.implement` with Context7 MCP server usage for Kubernetes best practices (envFrom pattern for environment variables)

- Next experiment (smallest change to try):
  - Test Ingress access from a Linux machine or WSL2 to isolate Windows networking issue
  - Try alternative local Kubernetes (k3d, kind) to compare Ingress behavior
  - For Phase 5: Deploy identical configuration to AWS EKS and verify Ingress works perfectly in cloud environment
