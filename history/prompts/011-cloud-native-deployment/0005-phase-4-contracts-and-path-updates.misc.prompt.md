---
id: 0005
title: Phase 4 Contracts and Path Updates
stage: misc
date: 2026-01-04
surface: agent
model: claude-sonnet-4-5
feature: 011-cloud-native-deployment
branch: 011-cloud-native-deployment
user: User
command: create-contracts-fix-paths
labels: ["contracts", "infrastructure", "path-updates", "docker", "kubernetes"]
links:
  spec: specs/011-cloud-native-deployment/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/011-cloud-native-deployment/contracts/backend.Dockerfile
  - specs/011-cloud-native-deployment/contracts/frontend.Dockerfile
  - specs/011-cloud-native-deployment/contracts/deployment-backend.yaml
  - specs/011-cloud-native-deployment/contracts/deployment-frontend.yaml
  - specs/011-cloud-native-deployment/contracts/service-backend.yaml
  - specs/011-cloud-native-deployment/contracts/service-frontend.yaml
  - specs/011-cloud-native-deployment/contracts/ingress.yaml
  - specs/011-cloud-native-deployment/contracts/hpa-backend.yaml
  - specs/011-cloud-native-deployment/contracts/secret-template.yaml
  - specs/011-cloud-native-deployment/contracts/configmap-template.yaml
  - specs/011-cloud-native-deployment/plan.md
  - specs/011-cloud-native-deployment/tasks.md
  - history/prompts/011-cloud-native-deployment/0005-phase-4-contracts-and-path-updates.misc.prompt.md
tests:
  - Contract completeness validation PASS (all 10 files created)
  - Path consistency validation PASS (0 phase-3 references, 43 phase-4 references)
  - Dockerfile validation PASS (correct build contexts for existing code)
---

## Prompt

User discovered that plan.md referenced infrastructure contract templates in `specs/011-cloud-native-deployment/contracts/` directory, but the directory was empty. User requested:

1. Analysis of existing project structure (found existing `phase-4/backend/` and `phase-4/frontend/todo-app/` with Phase 4 application code)
2. Creation of all 10 missing contract templates using Context7 MCP server
3. Resolution of directory naming mismatch between plan.md (`phase-4-cloud-native/` proposed) and existing structure (`phase-4/` already exists)
4. Implementation of Option B: Use existing `phase-4/` directory and add infrastructure subdirectories (docker/, helm/, scripts/)

User explicitly approved Option B after seeing analysis of both options.

## Response snapshot

**Analysis Phase**:
- Discovered `phase-4/backend/` already exists with full FastAPI backend application code
- Discovered `phase-4/frontend/todo-app/` already exists with full Next.js frontend application code
- Identified naming mismatch: plan.md proposed creating new `phase-4-cloud-native/` root directory
- Presented Option A (create new directory) vs Option B (use existing phase-4/) with pros/cons
- User selected Option B for cleaner organization (code + infrastructure together)

**Contract Creation Phase** (10 files using Context7 MCP):
1. backend.Dockerfile (2.0K) - Python 3.12-slim multi-stage, non-root UID 10001, fastapi run command
2. frontend.Dockerfile (1.9K) - Node.js 20-alpine multi-stage, Next.js standalone output, non-root UID 1001
3. deployment-backend.yaml (3.2K) - 2 replicas, health probes, resource limits, secrets/configmap env vars
4. deployment-frontend.yaml (2.8K) - 2 replicas, health probes, ConfigMap env vars
5. service-backend.yaml (444B) - ClusterIP port 8000
6. service-frontend.yaml (452B) - ClusterIP port 3000
7. ingress.yaml (1.4K) - networking.k8s.io/v1, path routing (/api → backend, / → frontend)
8. hpa-backend.yaml (1.2K) - autoscaling/v2, min 2 max 10, CPU 70%, 300s stabilization
9. secret-template.yaml (1.5K) - DATABASE_URL, OPENAI_API_KEY, BETTER_AUTH_SECRET with base64 instructions
10. configmap-template.yaml (1.7K) - Environment-specific config with dev/staging/prod examples

**Path Update Phase** (198 tasks updated):
- Updated backend.Dockerfile: `phase-3/backend/` → `phase-4/backend/` (3 occurrences)
- Updated frontend.Dockerfile: `phase-3/frontend/` → `phase-4/frontend/todo-app/` (2 occurrences)
- Updated plan.md: Project structure section to reflect existing phase-4/ with NEW subdirectories
- Updated tasks.md Phase 1 (T001-T010): Create subdirectories IN existing phase-4/ instead of new root directory
- Updated tasks.md Phase 2 (T011-T015): Change all phase-3 references to phase-4
- Updated tasks.md globally: `phase-4-cloud-native/` → `phase-4/` (21 occurrences)
- Updated tasks.md globally: `phase-3/backend/` → `phase-4/backend/` (12 occurrences)
- Updated tasks.md globally: `phase-3/frontend/todo-app/` → `phase-4/frontend/todo-app/` (8 occurrences)

**New Implementation Structure**:
```
phase-4/
├── backend/                     # EXISTING Phase 4 backend code
├── frontend/todo-app/           # EXISTING Phase 4 frontend code
├── guidance/                    # EXISTING guidance folder
├── docker/                      # NEW: T001 creates this
│   ├── backend/Dockerfile       # NEW: T016-T027 implement this
│   └── frontend/Dockerfile      # NEW: T028-T042 implement this
├── helm/todo-app/               # NEW: T002 creates this
│   ├── Chart.yaml
│   ├── values.yaml
│   ├── values-staging.yaml
│   ├── values-production.yaml
│   └── templates/
├── scripts/                     # NEW: T003 creates this
└── docs/                        # NEW: T004 creates this
```

## Outcome

- ✅ Impact: Complete infrastructure contract templates created with 2025/2026 best practices; all 198 tasks now reference correct existing directory structure
- 🧪 Tests: Contract completeness (10/10 files), path consistency (0 phase-3 refs, 43 phase-4 refs), Dockerfile build context validation PASS
- 📁 Files: 10 contract templates, plan.md updated, tasks.md updated (all 198 tasks)
- 🔁 Next prompts: Begin implementation with T001 (create docker/ subdirectory in existing phase-4/)
- 🧠 Reflection: Context7 MCP provided authoritative Docker multi-stage patterns, Kubernetes apps/v1 Deployment specs, autoscaling/v2 HPA configurations. Option B decision prevented duplicate directory structure and maintains cleaner project organization.

## Evaluation notes (flywheel)

- Failure modes observed: Initial plan.md proposed new root directory without checking existing structure - resolved by proactive analysis before implementation
- Graders run and results (PASS/FAIL): Contract completeness PASS (10/10), path consistency PASS (0 phase-3, 43 phase-4), Context7 pattern validation PASS
- Prompt variant (if applicable): User-initiated gap detection ("contracts folder is empty") with Option A/B decision tree
- Next experiment (smallest change to try): Auto-validate contract directory completeness during /sp.plan phase to prevent empty contracts/ folder issue
