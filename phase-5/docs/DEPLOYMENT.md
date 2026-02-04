# Todo App - Cloud Native Deployment Guide

**Feature**: Phase 4 Cloud Native Deployment
**Created**: 2026-01-04
**Status**: Production Ready

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development (Minikube)](#local-development-minikube)
3. [Production Deployment](#production-deployment)
4. [Multi-Environment Configuration](#multi-environment-configuration)
5. [Troubleshooting](#troubleshooting)
6. [Rollback Procedures](#rollback-procedures)

---

## Prerequisites

### Tools Required

| Tool | Minimum Version | Purpose |
|------|----------------|---------|
| Docker | v20.10+ | Container runtime |
| Minikube | v1.30+ | Local Kubernetes cluster |
| kubectl | v1.25+ | Kubernetes CLI |
| Helm | v3.10+ | Kubernetes package manager |

See [MINIKUBE.md](./MINIKUBE.md) for installation instructions.

### Secrets Required

See [SECRETS.md](./SECRETS.md) for detailed secret management guide.

Required secrets:
- `DATABASE_URL`: PostgreSQL connection string (Neon)
- `OPENAI_API_KEY`: OpenAI API key for ChatKit
- `BETTER_AUTH_SECRET`: Shared JWT secret (32 characters)

---

## Local Development (Minikube)

### Step 1: Start Minikube

```bash
# Start Minikube with recommended resources
minikube start --driver=docker --cpus=4 --memory=8192 --disk-size=20g

# Enable Ingress addon
minikube addons enable ingress

# Verify status
minikube status
```

### Step 2: Build Docker Images

```bash
# Build both backend and frontend images
./phase-4/scripts/build-images.sh latest

# Expected output:
#   ✓ Backend image built: todo-backend:latest
#   ✓ Frontend image built: todo-frontend:latest
```

**Performance Targets**:
- Backend build: <3 minutes
- Frontend build: <5 minutes
- Backend image size: <200MB
- Frontend image size: <150MB

### Step 3: Load Images into Minikube

```bash
# Load images into Minikube's Docker daemon
./phase-4/scripts/load-minikube.sh latest

# Verify images loaded
minikube image ls | grep todo
```

### Step 4: Create Secrets

```bash
# Create development secrets
kubectl create secret generic todo-secrets \
  --from-literal=database-url='postgresql://user:pass@localhost:5432/todo_dev?sslmode=require' \
  --from-literal=openai-api-key='sk-proj-xxxxx' \
  --from-literal=better-auth-secret='dev-32-character-secret-key-here'

# Verify secret created
kubectl get secret todo-secrets
```

### Step 5: Deploy with Helm

```bash
# Deploy using automation script
./phase-4/scripts/deploy-dev.sh

# Or manually with Helm
helm install todo-app ./phase-4/helm/todo-app \
  --values ./phase-4/helm/todo-app/values.yaml

# Verify deployment
kubectl get pods
kubectl get services
kubectl get ingress
```

**Expected Pods**:
- `todo-backend-xxxx`: 2 replicas (Running)
- `todo-frontend-xxxx`: 2 replicas (Running)

**Performance Targets**:
- Helm install: <2 minutes
- Backend pod startup: <30 seconds
- Frontend pod startup: <45 seconds

### Step 6: Access Application

**Option A: Via Ingress** (Recommended)

```bash
# Get Minikube IP
minikube ip
# Example output: 192.168.49.2

# Add to /etc/hosts (Linux/macOS)
echo "$(minikube ip) todo-app.local" | sudo tee -a /etc/hosts

# Or add to C:\Windows\System32\drivers\etc\hosts (Windows - as Administrator)
echo 192.168.49.2 todo-app.local >> C:\Windows\System32\drivers\etc\hosts

# Access application
open http://todo-app.local
```

**Option B: Via Port Forwarding**

```bash
# Forward frontend service
kubectl port-forward svc/todo-frontend 3000:3000 &

# Forward backend service
kubectl port-forward svc/todo-backend 8000:8000 &

# Access application
open http://localhost:3000
```

### Step 7: Verify Functionality

1. **Health Checks**:
   ```bash
   # Backend health
   curl http://todo-app.local/api/health
   # or
   curl http://localhost:8000/health

   # Frontend health (via port-forward)
   curl http://localhost:3000/api/health
   ```

2. **Create Test Task via ChatKit**:
   - Open http://todo-app.local
   - Login with test account
   - Use ChatKit: "Add a task to buy groceries"
   - Verify task appears in todo list

3. **Database Connectivity**:
   ```bash
   # Check backend logs for database connection
   kubectl logs deployment/todo-backend | grep -i "database"
   ```

---

## Production Deployment

### Prerequisites

1. **Kubernetes Cluster**: v1.25+ (EKS, GKE, AKS, or self-managed)
2. **Helm**: v3.10+ installed locally
3. **Container Registry**: Docker Hub, ECR, GCR, or ACR
4. **DNS**: Production domain configured
5. **Secrets Manager**: AWS Secrets Manager, GCP Secret Manager, or Azure Key Vault (recommended)

### Step 1: Build and Push Images

```bash
# Tag images for registry
docker tag todo-backend:latest your-registry.io/todo-backend:1.0.0
docker tag todo-frontend:latest your-registry.io/todo-frontend:1.0.0

# Push to registry
docker push your-registry.io/todo-backend:1.0.0
docker push your-registry.io/todo-frontend:1.0.0
```

### Step 2: Create Production Secrets

**Recommended: External Secrets Operator**

```bash
# Install External Secrets Operator
helm repo add external-secrets https://charts.external-secrets.io
helm install external-secrets external-secrets/external-secrets \
  --namespace external-secrets-system \
  --create-namespace

# Create SecretStore (AWS example)
kubectl apply -f - <<EOF
apiVersion: external-secrets.io/v1beta1
kind: SecretStore
metadata:
  name: aws-secrets-manager
  namespace: todo-production
spec:
  provider:
    aws:
      service: SecretsManager
      region: us-east-1
EOF

# Create ExternalSecret
kubectl apply -f - <<EOF
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: todo-secrets
  namespace: todo-production
spec:
  refreshInterval: 1h
  secretStoreRef:
    name: aws-secrets-manager
  data:
  - secretKey: database-url
    remoteRef:
      key: todo-app/production/database-url
  - secretKey: openai-api-key
    remoteRef:
      key: todo-app/production/openai-api-key
  - secretKey: better-auth-secret
    remoteRef:
      key: todo-app/production/better-auth-secret
EOF
```

**Alternative: Manual Secret Creation**

```bash
# Create production namespace
kubectl create namespace todo-production

# Create secret manually
kubectl create secret generic todo-secrets \
  --from-literal=database-url='postgresql://prod-user:prod-pass@prod-host:5432/todo_prod?sslmode=require' \
  --from-literal=openai-api-key='sk-prod-xxxxx' \
  --from-literal=better-auth-secret='prod-32-character-secret-key' \
  --namespace=todo-production
```

### Step 3: Update values-production.yaml

Edit `phase-4/helm/todo-app/values-production.yaml`:

```yaml
backend:
  image:
    repository: your-registry.io/todo-backend
    tag: "1.0.0"

frontend:
  image:
    repository: your-registry.io/todo-frontend
    tag: "1.0.0"

ingress:
  hosts:
    - host: todo-app.yourdomain.com
  tls:
    - secretName: todo-production-tls
      hosts:
        - todo-app.yourdomain.com
```

### Step 4: Deploy to Production

```bash
# Deploy with Helm
helm install todo-app ./phase-4/helm/todo-app \
  --values ./phase-4/helm/todo-app/values-production.yaml \
  --namespace todo-production \
  --create-namespace

# Verify deployment
kubectl get pods -n todo-production
kubectl get svc -n todo-production
kubectl get ingress -n todo-production
```

### Step 5: Configure DNS

```bash
# Get Load Balancer IP/hostname
kubectl get ingress -n todo-production

# Add DNS A record:
#   todo-app.yourdomain.com → <LOAD_BALANCER_IP>
```

### Step 6: Verify HPA (Horizontal Pod Autoscaler)

```bash
# Check HPA status
kubectl get hpa -n todo-production

# Expected output:
# NAME               REFERENCE                 TARGETS   MINPODS   MAXPODS   REPLICAS
# todo-backend-hpa   Deployment/todo-backend   45%/70%   5         20        5

# Monitor autoscaling
kubectl get hpa -n todo-production --watch
```

### Step 7: Production Health Checks

```bash
# Check all pods running
kubectl get pods -n todo-production

# Check backend health endpoint
curl https://api.todo-app.yourdomain.com/health

# Check frontend
curl https://todo-app.yourdomain.com

# View logs
kubectl logs -f deployment/todo-backend -n todo-production
kubectl logs -f deployment/todo-frontend -n todo-production
```

---

## Multi-Environment Configuration

### Staging Environment

```bash
# Deploy staging
helm install todo-app ./phase-4/helm/todo-app \
  --values ./phase-4/helm/todo-app/values-staging.yaml \
  --namespace todo-staging \
  --create-namespace
```

**Key Differences from Production**:
- Lower resource allocation
- Staging domain: `staging.todo-app.yourdomain.com`
- LetsEncrypt staging issuer for TLS
- Reduced replica counts (3 vs 5)
- Lower autoscaling limits (3-15 vs 5-20)

### Environment Comparison

| Setting | Development | Staging | Production |
|---------|------------|---------|------------|
| **Backend Replicas** | 2 | 3 | 5 |
| **Frontend Replicas** | 2 | 3 | 5 |
| **Backend CPU Request** | 250m | 500m | 1000m |
| **Backend Memory Request** | 512Mi | 1Gi | 2Gi |
| **HPA Enabled** | No | Yes | Yes |
| **HPA Max Replicas** | N/A | 15 | 20 |
| **TLS** | Disabled | LetsEncrypt Staging | LetsEncrypt Prod |
| **Ingress** | todo-app.local | staging.todo-app.com | todo-app.com |

---

## Troubleshooting

### Pods Not Starting

```bash
# Check pod status
kubectl get pods -n <namespace>

# Describe pod for events
kubectl describe pod <pod-name> -n <namespace>

# Check logs
kubectl logs <pod-name> -n <namespace>

# Common issues:
# - ImagePullBackOff: Check image registry and credentials
# - CrashLoopBackOff: Check application logs
# - Pending: Check resource availability
```

### Image Pull Errors

```bash
# For Minikube
minikube image load todo-backend:latest
minikube image load todo-frontend:latest

# For production
# Verify image registry credentials
kubectl get secret -n <namespace>
```

### Database Connection Issues

```bash
# Check secret exists
kubectl get secret todo-secrets -n <namespace>

# Decode and verify DATABASE_URL
kubectl get secret todo-secrets -n <namespace> \
  -o jsonpath='{.data.database-url}' | base64 --decode

# Check backend logs
kubectl logs deployment/todo-backend -n <namespace> | grep -i database
```

### Ingress Not Working

```bash
# Check Ingress controller (Minikube)
kubectl get pods -n ingress-nginx

# Enable if not running
minikube addons enable ingress

# Check Ingress resource
kubectl get ingress -n <namespace>
kubectl describe ingress todo-ingress -n <namespace>

# Verify DNS/hosts file
ping todo-app.local
```

---

## Rollback Procedures

### Helm Rollback

```bash
# List releases
helm list -n <namespace>

# View history
helm history todo-app -n <namespace>

# Rollback to previous version
helm rollback todo-app -n <namespace>

# Rollback to specific revision
helm rollback todo-app 2 -n <namespace>
```

### Manual Rollback

```bash
# Scale down new version
kubectl scale deployment/todo-backend --replicas=0 -n <namespace>

# Restore previous image
kubectl set image deployment/todo-backend \
  backend=your-registry.io/todo-backend:1.0.0 \
  -n <namespace>

# Scale back up
kubectl scale deployment/todo-backend --replicas=5 -n <namespace>
```

### Emergency Procedures

```bash
# Delete all resources
helm uninstall todo-app -n <namespace>

# Redeploy known-good version
helm install todo-app ./phase-4/helm/todo-app \
  --values ./phase-4/helm/todo-app/values-production.yaml \
  --namespace <namespace>
```

---

## Next Steps

After successful deployment:

1. **Monitoring**: Set up Prometheus + Grafana for metrics
2. **Logging**: Configure centralized logging (ELK, Loki, CloudWatch)
3. **Alerting**: Configure PagerDuty/Opsgenie for critical alerts
4. **Backup**: Set up database backups and disaster recovery
5. **CI/CD**: Integrate with GitHub Actions/GitLab CI/ArgoCD

---

**Created**: 2026-01-04
**Feature**: 011-cloud-native-deployment
**Status**: Production Ready ✅
