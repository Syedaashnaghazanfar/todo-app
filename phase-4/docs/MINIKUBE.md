# Minikube Development Environment

**Purpose**: Local Kubernetes development and testing for Todo App Phase 4 deployment

## Tool Version Requirements

### Verified Versions (2026-01-04)

| Tool | Minimum Version | Verified Version | Status |
|------|----------------|------------------|--------|
| **Minikube** | v1.30+ | v1.37.0 | ✅ PASS |
| **Helm** | v3.10+ | v4.0.4 | ✅ PASS |
| **Docker** | v20.10+ | v28.3.2 | ✅ PASS |
| **kubectl** | v1.25+ | v1.32.2 | ✅ PASS |

### Installation

#### Minikube
```bash
# Windows (via Chocolatey)
choco install minikube

# macOS
brew install minikube

# Linux
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube
```

#### Helm
```bash
# Windows (via Chocolatey)
choco install kubernetes-helm

# macOS
brew install helm

# Linux
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
```

#### Docker
- **Windows**: Install Docker Desktop from https://www.docker.com/products/docker-desktop
- **macOS**: Install Docker Desktop from https://www.docker.com/products/docker-desktop
- **Linux**: Follow instructions at https://docs.docker.com/engine/install/

#### kubectl
```bash
# Windows (via Chocolatey)
choco install kubernetes-cli

# macOS
brew install kubectl

# Linux
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
```

## Minikube Configuration

### Start Minikube with Recommended Settings

```bash
# Start Minikube with Docker driver
minikube start --driver=docker --cpus=4 --memory=8192 --disk-size=20g

# Enable Ingress addon
minikube addons enable ingress

# Verify status
minikube status
```

### Configure Docker Environment

```bash
# Point Docker CLI to Minikube's Docker daemon
eval $(minikube docker-env)

# Verify connection
docker ps
```

## Deployment Workflow

### 1. Build Images Locally

```bash
# Build backend image
docker build -f phase-4/docker/backend/Dockerfile -t todo-backend:latest .

# Build frontend image
docker build -f phase-4/docker/frontend/Dockerfile -t todo-frontend:latest .

# Load images into Minikube
minikube image load todo-backend:latest
minikube image load todo-frontend:latest
```

### 2. Deploy with Helm

```bash
# Install Todo App
helm install todo-app ./phase-4/helm/todo-app

# Verify deployment
kubectl get pods
kubectl get services
kubectl get ingress
```

### 3. Access Application

```bash
# Get Minikube IP
minikube ip

# Add to /etc/hosts (or C:\Windows\System32\drivers\etc\hosts on Windows)
echo "$(minikube ip) todo-app.local" | sudo tee -a /etc/hosts

# Access via browser
open http://todo-app.local
```

**Alternative**: Port forwarding (no Ingress required)

```bash
# Forward frontend service
kubectl port-forward svc/todo-frontend 3000:3000

# Forward backend service
kubectl port-forward svc/todo-backend 8000:8000

# Access at http://localhost:3000
```

## Troubleshooting

### Minikube Won't Start

```bash
# Delete and restart
minikube delete
minikube start --driver=docker --cpus=4 --memory=8192

# Check logs
minikube logs
```

### Pods Not Starting

```bash
# Check pod status
kubectl describe pod <pod-name>

# View logs
kubectl logs <pod-name>

# Check events
kubectl get events --sort-by='.lastTimestamp'
```

### Image Pull Errors

```bash
# Verify images are loaded in Minikube
minikube image ls | grep todo

# Re-load if missing
minikube image load todo-backend:latest
minikube image load todo-frontend:latest
```

### Ingress Not Working

```bash
# Verify Ingress addon enabled
minikube addons list | grep ingress

# Enable if disabled
minikube addons enable ingress

# Check Ingress controller
kubectl get pods -n ingress-nginx
```

## Resource Limits

### Recommended Minikube Resources

- **CPUs**: 4 cores minimum (development)
- **Memory**: 8GB minimum (development)
- **Disk**: 20GB minimum

### Check Current Allocation

```bash
# View resource usage
kubectl top nodes
kubectl top pods
```

## Cleanup

### Uninstall Application

```bash
# Uninstall Helm release
helm uninstall todo-app

# Verify cleanup
kubectl get all
```

### Stop Minikube

```bash
# Stop cluster
minikube stop

# Delete cluster (removes all data)
minikube delete
```

## Next Steps

After verifying Minikube setup:
1. Review [SECRETS.md](./SECRETS.md) for environment configuration
2. Follow deployment guide in tasks.md (T043-T099)
3. Test all acceptance scenarios from spec.md

---

**Created**: 2026-01-04
**Feature**: 011-cloud-native-deployment
**Status**: Tools verified and ready for development
