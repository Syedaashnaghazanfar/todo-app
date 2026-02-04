# Phase 4: Local Deployment Guide (Minikube)

## 1. Overview
This guide defines the workflow for developing and testing the Cloud Native architecture locally using Minikube. It ensures that the local environment mirrors production as closely as possible.

---

## 2. Prerequisites
*   **Docker Desktop** or **Docker Engine**.
*   **Minikube:** Latest version.
*   **Kubectl:** Latest version.
*   **Helm:** Version 3+.
*   **Kubectl-ai:** For AI-assisted debugging and manifest generation (optional but recommended).

---

## 3. Minikube Setup

### 3.1 Start Cluster
Start Minikube with the Docker driver to simplify image sharing.
```bash
minikube start --driver=docker --cpus=4 --memory=4096 --addons=ingress
```

### 3.2 Image Registry Strategy
Instead of pushing to a remote registry, we will load images directly into Minikube's Docker daemon.

**Workflow:**
1.  **Point Shell to Minikube Docker:**
    ```bash
    eval $(minikube docker-env)
    ```
    *Now `docker build` commands run directly inside Minikube.*

2.  **Build Images:**
    ```bash
    docker build -t todo-backend:local -f backend/Dockerfile .
    docker build -t todo-frontend:local -f frontend/Dockerfile .
    ```

3.  **Alternative (if not using docker-env):**
    ```bash
    minikube image load todo-backend:local
    minikube image load todo-frontend:local
    ```

---

## 4. Database Strategy

### Option A: Hybrid (Connect to Remote Neon DB)
*Best for: Testing with real data and cloud capabilities.*
1.  **External Service:** Create a Service of type `ExternalName` pointing to the Neon host, or simply allow outbound traffic.
2.  **Secrets:** Create a Kubernetes Secret containing the *real* Neon connection string.
    ```bash
    kubectl create secret generic backend-secrets --from-literal=DATABASE_URL="postgres://..."
    ```

### Option B: Self-Contained (Local Postgres)
*Best for: Offline development and fast integration tests.*
1.  **Helm Dependency:** Enable the `postgresql` subchart in `values.yaml`.
    ```yaml
    postgresql:
      enabled: true
      auth:
        username: appuser
        database: todo_db
    ```
2.  **Connection String:** Update the backend config to point to the in-cluster Postgres service (e.g., `postgres://appuser:pass@todo-app-postgresql:5432/todo_db`).

---

## 5. Deployment Workflow

### 5.1 Deploy with Helm
```bash
helm upgrade --install todo-app ./charts/todo-app \
  --values ./charts/todo-app/values.yaml \
  --set backend.image.tag=local \
  --set frontend.image.tag=local
```

### 5.2 Accessing the App
1.  **Tunneling (if needed):** `minikube tunnel` (requires admin privileges) to assign an IP to the Ingress Controller.
2.  **Hosts File:** Add the Minikube IP to your `/etc/hosts` (or Windows `hosts` file).
    ```text
    127.0.0.1 todo.local  # If using tunnel
    # OR
    192.168.49.2 todo.local # Minikube IP
    ```
3.  **Browser:** Navigate to `http://todo.local`.

---

## 6. Debugging & AI Assistance

### 6.1 Standard Debugging
*   `kubectl get pods`
*   `kubectl logs -f deployment/todo-backend`
*   `kubectl describe pod <pod-name>`

### 6.2 AI-Assisted Debugging (Kubectl-ai)
Use `kubectl-ai` to diagnose issues or generate ad-hoc resources.
*   **Example:** "Why is my backend pod crashing?"
    ```bash
    kubectl-ai "Check logs for todo-backend and explain the crash"
    ```
*   **Example:** "Create a temporary debug pod with curl"
    ```bash
    kubectl-ai "Create a pod named debug-curl with image curlimages/curl and command sleep infinity"
    ```

---

## 7. Verification Checklist
*   [ ] Images built successfully (multi-stage).
*   [ ] Helm install completes without errors.
*   [ ] Pods are Running (2/2 replicas).
*   [ ] Ingress is routing traffic to Frontend.
*   [ ] Frontend can talk to Backend (API calls work).
*   [ ] Backend can talk to Database (Neon or Local).
