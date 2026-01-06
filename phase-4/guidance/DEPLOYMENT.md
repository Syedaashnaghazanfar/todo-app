# Kubernetes Deployment Guide

Complete guide for deploying the Todo App to Kubernetes (Minikube for local development).

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Manual Deployment](#manual-deployment)
4. [Configuration](#configuration)
5. [Verification](#verification)
6. [Common Operations](#common-operations)
7. [Production Readiness](#production-readiness)

## Prerequisites

### Required Tools

Install the following tools before proceeding:

1. **Docker** (24+)
   ```bash
   # Verify installation
   docker --version
   ```
   Install: https://docs.docker.com/get-docker/

2. **Minikube** (1.32+)
   ```bash
   # Verify installation
   minikube version
   ```
   Install: https://minikube.sigs.k8s.io/docs/start/

3. **Helm** (3.x)
   ```bash
   # Verify installation
   helm version
   ```
   Install: https://helm.sh/docs/intro/install/

4. **kubectl** (1.28+)
   ```bash
   # Verify installation
   kubectl version --client
   ```
   Install: https://kubernetes.io/docs/tasks/tools/

### System Requirements

- **CPU**: 4 cores or more
- **Memory**: 8GB RAM or more
- **Disk**: 20GB free space
- **OS**: Linux, macOS, or Windows with WSL2

## Quick Start

### One-Command Deployment

```bash
# From project root
./scripts/k8s/deploy.sh
```

This automated script:
1. ✅ Checks all prerequisites
2. ✅ Starts Minikube (if not running)
3. ✅ Builds Docker images in Minikube context
4. ✅ Creates namespace
5. ✅ Loads secrets from `.env`
6. ✅ Deploys with Helm
7. ✅ Waits for pods to be ready
8. ✅ Displays access URLs

**Expected Time**: 5-10 minutes on first run, 2-3 minutes on subsequent runs.

## Manual Deployment

For learning or troubleshooting, follow these manual steps:

### Step 1: Initialize Minikube Cluster

```bash
./k8s/minikube/setup.sh
```

This creates a Minikube cluster with:
- 4 CPUs
- 8GB RAM
- 20GB disk
- Docker driver
- Kubernetes 1.28

**Verify cluster is running**:
```bash
minikube status
kubectl cluster-info
```

### Step 2: Build Docker Images

```bash
./k8s/minikube/build-images.sh
```

This builds two images in Minikube's Docker daemon:
- `todo-frontend:latest` (Next.js 16 frontend)
- `todo-backend:latest` (FastAPI backend)

**Verify images are built**:
```bash
eval $(minikube docker-env)
docker images | grep todo-
```

### Step 3: Configure Environment Variables

Create a `.env` file in the project root:

```bash
cp .env.example .env
# Edit .env with your actual values
```

**Required variables**:
```env
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
BETTER_AUTH_SECRET=your-secret-at-least-32-characters-long
OPENAI_API_KEY=sk-your-openai-api-key
```

**Optional variables** (for image uploads):
```env
CLOUDFLARE_R2_ACCOUNT_ID=your-account-id
CLOUDFLARE_R2_ACCESS_KEY_ID=your-access-key
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your-secret-key
CLOUDFLARE_R2_BUCKET_NAME=your-bucket-name
```

### Step 4: Create Namespace

```bash
kubectl create namespace todo-app
kubectl config set-context --current --namespace=todo-app
```

### Step 5: Deploy with Helm

Load environment variables and deploy:

```bash
# Load secrets from .env
source .env

# Install Helm chart
helm install todo-app ./helm/todo-app \
  -f ./helm/todo-app/values-dev.yaml \
  -n todo-app \
  --set secrets.DATABASE_URL="$DATABASE_URL" \
  --set secrets.BETTER_AUTH_SECRET="$BETTER_AUTH_SECRET" \
  --set secrets.OPENAI_API_KEY="$OPENAI_API_KEY" \
  --set secrets.CLOUDFLARE_R2_ACCOUNT_ID="${CLOUDFLARE_R2_ACCOUNT_ID:-}" \
  --set secrets.CLOUDFLARE_R2_ACCESS_KEY_ID="${CLOUDFLARE_R2_ACCESS_KEY_ID:-}" \
  --set secrets.CLOUDFLARE_R2_SECRET_ACCESS_KEY="${CLOUDFLARE_R2_SECRET_ACCESS_KEY:-}" \
  --set secrets.CLOUDFLARE_R2_BUCKET_NAME="${CLOUDFLARE_R2_BUCKET_NAME:-}" \
  --wait --timeout=5m
```

**Expected output**:
```
NAME: todo-app
LAST DEPLOYED: ...
NAMESPACE: todo-app
STATUS: deployed
REVISION: 1
```

### Step 6: Access the Application

Get Minikube IP and access the frontend:

```bash
MINIKUBE_IP=$(minikube ip)
echo "Frontend: http://$MINIKUBE_IP:30300"
```

Open the URL in your browser.

## Configuration

### Helm Values

The deployment uses two values files:

1. **`values.yaml`**: Base production values
   - LoadBalancer service type
   - Higher resource limits
   - Production-grade probe timings

2. **`values-dev.yaml`**: Minikube overrides
   - NodePort service type (port 30300)
   - `imagePullPolicy: Never`
   - Lower resource requests
   - Faster probe startup

### ConfigMap (Non-Sensitive)

Located at `helm/todo-app/templates/shared/configmap.yaml`:
- `BETTER_AUTH_URL`
- `FRONTEND_URL`
- `BACKEND_URL`
- `LLM_PROVIDER`
- `OPENAI_DEFAULT_MODEL`
- `NEXT_PUBLIC_CHATKIT_API_URL`

### Secret (Sensitive)

Located at `helm/todo-app/templates/shared/secret.yaml`:
- `DATABASE_URL` (required)
- `BETTER_AUTH_SECRET` (required)
- `OPENAI_API_KEY` (required)
- R2 credentials (optional)

**Note**: Secrets are base64-encoded in etcd. Never commit plaintext secrets to git!

## Verification

### Check Pod Status

```bash
kubectl get pods -n todo-app
```

**Expected output**:
```
NAME                                 READY   STATUS    RESTARTS   AGE
todo-app-backend-xxx                 1/1     Running   0          2m
todo-app-frontend-xxx                1/1     Running   0          2m
```

### Check Service Status

```bash
kubectl get services -n todo-app
```

**Expected output**:
```
NAME                  TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)          AGE
todo-app-backend      ClusterIP   10.96.xxx.xxx   <none>        8000/TCP         2m
todo-app-frontend     NodePort    10.96.xxx.xxx   <none>        3000:30300/TCP   2m
```

### Test Health Endpoints

```bash
# Frontend health (from outside cluster)
curl http://$(minikube ip):30300/api/health

# Backend health (from inside cluster)
kubectl exec -n todo-app deployment/todo-app-frontend -- curl -s http://todo-app-backend:8000/api/health
```

### Test End-to-End Flow

1. Open `http://$(minikube ip):30300` in browser
2. Register a new account
3. Log in
4. Chat with AI assistant
5. Create a todo item
6. Mark it complete

## Common Operations

### Update Deployment

After code changes:

```bash
# Rebuild images
./k8s/minikube/build-images.sh

# Restart deployments to use new images
kubectl rollout restart -n todo-app deployment/todo-app-frontend
kubectl rollout restart -n todo-app deployment/todo-app-backend

# Watch rollout status
kubectl rollout status -n todo-app deployment/todo-app-frontend
```

### View Logs

```bash
# Frontend logs (follow)
kubectl logs -n todo-app -l app.kubernetes.io/component=frontend -f

# Backend logs (follow)
kubectl logs -n todo-app -l app.kubernetes.io/component=backend -f

# Last 100 lines
kubectl logs -n todo-app -l app.kubernetes.io/component=backend --tail=100
```

### Shell into Pod

```bash
# List pods
kubectl get pods -n todo-app

# Shell into frontend
kubectl exec -n todo-app -it <frontend-pod-name> -- /bin/sh

# Shell into backend
kubectl exec -n todo-app -it <backend-pod-name> -- /bin/bash
```

### Update Secrets

```bash
# Edit .env with new values
vim .env

# Reload and upgrade
source .env
helm upgrade todo-app ./helm/todo-app \
  -f ./helm/todo-app/values-dev.yaml \
  -n todo-app \
  --set secrets.DATABASE_URL="$DATABASE_URL" \
  --set secrets.BETTER_AUTH_SECRET="$BETTER_AUTH_SECRET" \
  --set secrets.OPENAI_API_KEY="$OPENAI_API_KEY" \
  --reuse-values
```

### Scale Replicas

```bash
# Scale frontend to 2 replicas
kubectl scale deployment todo-app-frontend -n todo-app --replicas=2

# Verify
kubectl get pods -n todo-app
```

### Uninstall

```bash
# Remove Helm release (keeps namespace)
helm uninstall todo-app -n todo-app

# Delete namespace (removes everything)
kubectl delete namespace todo-app

# Or use cleanup script
./k8s/minikube/cleanup.sh
```

## Production Readiness

This Minikube deployment is suitable for **local development and testing**. For production deployment to cloud Kubernetes (Phase 5), you'll need:

### Required Changes

1. **Ingress Controller**
   - Replace NodePort with Ingress
   - Configure TLS certificates
   - Set up DNS

2. **Image Registry**
   - Push images to container registry (Docker Hub, GHCR, ECR)
   - Update `imagePullPolicy` to `IfNotPresent` or `Always`

3. **External Secrets Management**
   - Use External Secrets Operator
   - Integrate with AWS Secrets Manager, Azure Key Vault, or GCP Secret Manager

4. **Monitoring & Observability**
   - Prometheus for metrics
   - Grafana for dashboards
   - Loki or ELK for logs
   - Jaeger for tracing

5. **Autoscaling**
   - Enable Horizontal Pod Autoscaler (HPA)
   - Configure resource metrics

6. **Persistent Storage** (if needed)
   - Use PersistentVolumeClaims
   - Configure StorageClass

7. **Security Hardening**
   - Network Policies
   - Pod Security Standards
   - RBAC configuration
   - Regular vulnerability scanning

### Recommended Cloud Platforms

- **AWS**: Amazon EKS
- **Google Cloud**: Google Kubernetes Engine (GKE)
- **Azure**: Azure Kubernetes Service (AKS)
- **DigitalOcean**: DigitalOcean Kubernetes

## Next Steps

- [Troubleshooting Guide](./TROUBLESHOOTING.md)
- [AI DevOps Tools](./AI_DEVOPS.md)
- [Production Migration](./PRODUCTION.md) *(coming in Phase 5)*

## Support

For issues or questions:
1. Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
2. View logs with `kubectl logs`
3. Describe pod with `kubectl describe pod <pod-name>`
4. Open an issue on GitHub
