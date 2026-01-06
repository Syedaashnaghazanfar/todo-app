#!/bin/bash
# Load Docker images into Minikube
# Usage: ./phase-4/scripts/load-minikube.sh [TAG]

set -e

# Default tag
TAG="${1:-latest}"

echo "=========================================="
echo "Loading Images into Minikube"
echo "Tag: ${TAG}"
echo "=========================================="

# Check if Minikube is running
if ! minikube status | grep -q "Running"; then
  echo "ERROR: Minikube is not running"
  echo "Start Minikube with: minikube start --driver=docker --cpus=4 --memory=8192"
  exit 1
fi

# Load backend image
echo ""
echo "Loading backend image..."
minikube image load todo-backend:${TAG}
echo "✓ Backend image loaded"

# Load frontend image
echo ""
echo "Loading frontend image..."
minikube image load todo-frontend:${TAG}
echo "✓ Frontend image loaded"

# Verify images in Minikube
echo ""
echo "=========================================="
echo "Verifying Images in Minikube"
echo "=========================================="
minikube image ls | grep todo

echo ""
echo "=========================================="
echo "✓ Images loaded successfully!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "  1. Create secrets: kubectl create secret generic todo-secrets --from-literal=..."
echo "  2. Deploy with Helm: helm install todo-app ./phase-4/helm/todo-app"
echo "  3. Port forward: kubectl port-forward svc/todo-frontend 3000:3000"
