# Phase 4: Kubernetes Manifest Specifications

## 1. Overview
This document specifies the Kubernetes resources required to deploy the Todo App. The architecture follows a standard microservices pattern with a frontend, backend, and external database connection.

**API Versioning:**
*   Deployments/StatefulSets: `apps/v1`
*   Services: `v1`
*   Ingress: `networking.k8s.io/v1`
*   ConfigMaps/Secrets: `v1`

---

## 2. Core Resources

### 2.1 Backend Deployment (`backend-deployment.yaml`)
*   **Kind:** `Deployment`
*   **Replicas:** Configurable (default: 2 for high availability).
*   **Selector:** `matchLabels: { app: todo-backend }`
*   **Strategy:** `RollingUpdate` (maxUnavailable: 1, maxSurge: 1).
*   **Pod Template:**
    *   **Labels:** `app: todo-backend`, `version: v1`
    *   **Security Context (Pod Level):**
        ```yaml
        securityContext:
          runAsUser: 1000 # appuser UID
          runAsGroup: 1000
          fsGroup: 1000
        ```
    *   **Container:**
        *   **Image:** `todo-backend:latest` (Always use specific tags in prod).
        *   **Ports:** Container port 8000.
        *   **Resources (Mandatory):**
            *   Requests: `cpu: 100m`, `memory: 128Mi`
            *   Limits: `cpu: 500m`, `memory: 512Mi`
        *   **Probes:**
            *   `livenessProbe`: HTTP GET `/health` (port 8000), initialDelaySeconds: 10.
            *   `readinessProbe`: HTTP GET `/health` (port 8000), initialDelaySeconds: 5.
        *   **EnvFrom:**
            *   `configMapRef`: `backend-config`
            *   `secretRef`: `backend-secrets`
        *   **Security Context (Container Level):**
            ```yaml
            securityContext:
              allowPrivilegeEscalation: false
              readOnlyRootFilesystem: true # If app writes to tmp, mount emptyDir volume there
              capabilities:
                drop: ["ALL"]
            ```

### 2.2 Frontend Deployment (`frontend-deployment.yaml`)
*   **Kind:** `Deployment`
*   **Replicas:** Configurable (default: 2).
*   **Selector:** `matchLabels: { app: todo-frontend }`
*   **Pod Template:**
    *   **Labels:** `app: todo-frontend`
    *   **Container:**
        *   **Image:** `todo-frontend:latest`
        *   **Ports:** Container port 3000.
        *   **Resources:**
            *   Requests: `cpu: 100m`, `memory: 128Mi`
            *   Limits: `cpu: 500m`, `memory: 512Mi`
        *   **Probes:**
            *   `livenessProbe`: HTTP GET `/api/health` (or root `/`), port 3000.
            *   `readinessProbe`: HTTP GET `/api/health`, port 3000.
        *   **Env:**
            *   `NEXT_PUBLIC_API_URL`: URL to access backend (via Ingress or Service).

### 2.3 Services
*   **Backend Service:**
    *   Type: `ClusterIP`
    *   Port: 80 (targetPort: 8000)
    *   Selector: `app: todo-backend`
*   **Frontend Service:**
    *   Type: `ClusterIP`
    *   Port: 80 (targetPort: 3000)
    *   Selector: `app: todo-frontend`

---

## 3. Configuration & Secrets

### 3.1 ConfigMaps (`backend-config`)
Stores non-sensitive configuration:
*   `ENVIRONMENT`: "production"
*   `LOG_LEVEL`: "info"
*   `ALLOWED_ORIGINS`: "http://todo.local,https://todo.example.com"

### 3.2 Secrets (`backend-secrets`)
Stores sensitive data (Opaque type):
*   `DATABASE_URL`: Connection string for Neon Postgres.
*   `OPENAI_API_KEY`: API key for AI agents.
*   `SECRET_KEY`: For JWT/Session encryption.

*Note: In production, use a Secret Management solution (e.g., ExternalSecrets Operator, Vault) instead of raw K8s secrets.*

---

## 4. Ingress & Networking

### 4.1 Ingress Resource (`todo-ingress.yaml`)
*   **Controller:** Nginx Ingress Controller.
*   **Annotations:**
    *   `nginx.ingress.kubernetes.io/rewrite-target: /` (if needed for path routing).
    *   `cert-manager.io/cluster-issuer: letsencrypt-prod` (for TLS).
*   **Rules:**
    *   Host: `todo.local` (or domain).
    *   Path `/api`: Backend Service (port 80).
    *   Path `/docs`: Backend Service (port 80) - *Optional, restrict in prod*.
    *   Path `/`: Frontend Service (port 80).

### 4.2 Network Policies
*   **Default Deny:** Deny all ingress traffic to all pods in the namespace.
*   **Allow Rules:**
    *   Allow Ingress Controller -> Frontend (port 3000).
    *   Allow Ingress Controller -> Backend (port 8000).
    *   Allow Frontend -> Backend (port 8000).
    *   Allow Backend -> Egress (Internet for OpenAI/Neon DB).

---

## 5. OpenAI Integration Specifics
*   **Latency Optimization:** The backend deployment must support streaming responses. Ensure any ingress buffering is disabled or configured to allow chunked transfer encoding.
    *   Annotation: `nginx.ingress.kubernetes.io/proxy-buffering: "off"`
*   **Key Injection:** The `OPENAI_API_KEY` is injected strictly via the `backend-secrets` Secret, never baked into the image.
