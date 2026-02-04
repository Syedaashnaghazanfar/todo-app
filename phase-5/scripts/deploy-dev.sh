#!/bin/bash
# Deploy Todo App to Minikube (Development)
# Usage: ./phase-4/scripts/deploy-dev.sh

set -e

echo "=========================================="
echo "Deploying Todo App to Minikube"
echo "Environment: Development"
echo "=========================================="

# Check if Minikube is running
if ! minikube status | grep -q "Running"; then
  echo "ERROR: Minikube is not running"
  echo "Start Minikube with: minikube start --driver=docker --cpus=4 --memory=8192"
  exit 1
fi

# Enable Ingress addon if not enabled
echo ""
echo "Checking Ingress addon..."
if ! minikube addons list | grep "ingress" | grep -q "enabled"; then
  echo "Enabling Ingress addon..."
  minikube addons enable ingress
  echo "✓ Ingress addon enabled"
else
  echo "✓ Ingress addon already enabled"
fi

# Check if secret exists
echo ""
echo "Checking for secrets..."
if ! kubectl get secret todo-secrets &>/dev/null; then
  echo "WARNING: Secret 'todo-secrets' not found"
  echo ""
  echo "Create secret with:"
  echo "  kubectl create secret generic todo-secrets \\"
  echo "    --from-literal=database-url='postgresql://user:pass@host:5432/dbname' \\"
  echo "    --from-literal=openai-api-key='sk-xxxxx' \\"
  echo "    --from-literal=better-auth-secret='your-32-char-secret'"
  echo ""
  read -p "Continue without secret? (y/N): " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
else
  echo "✓ Secret 'todo-secrets' found"
fi

# Deploy with Helm
echo ""
echo "Deploying with Helm..."
helm upgrade --install todo-app ./phase-4/helm/todo-app \
  --values ./phase-4/helm/todo-app/values.yaml \
  --create-namespace \
  --namespace default

echo ""
echo "=========================================="
echo "✓ Deployment Complete!"
echo "=========================================="

# Wait for pods to be ready
echo ""
echo "Waiting for pods to be ready..."
kubectl wait --for=condition=ready pod \
  --selector=app.kubernetes.io/name=todo-app \
  --timeout=120s || true

# Show deployment status
echo ""
echo "Deployment Status:"
kubectl get pods,svc,ingress

# Get Minikube IP
MINIKUBE_IP=$(minikube ip)
echo ""
echo "=========================================="
echo "Access Application"
echo "=========================================="
echo ""
echo "Add to /etc/hosts (or C:\\Windows\\System32\\drivers\\etc\\hosts):"
echo "  ${MINIKUBE_IP} todo-app.local"
echo ""
echo "Then access at: http://todo-app.local"
echo ""
echo "Or use port forwarding:"
echo "  kubectl port-forward svc/todo-frontend 3000:3000"
echo "  kubectl port-forward svc/todo-backend 8000:8000"
echo ""
echo "Access at: http://localhost:3000"
