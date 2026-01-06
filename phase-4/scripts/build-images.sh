#!/bin/bash
# Build Docker images for Todo App Phase 4
# Usage: Run from project root: ./phase-4/scripts/build-images.sh [TAG]

set -e

# Default tag
TAG="${1:-latest}"

# Get script directory and project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

echo "=========================================="
echo "Building Todo App Docker Images"
echo "Tag: ${TAG}"
echo "Project Root: ${PROJECT_ROOT}"
echo "=========================================="

# Change to project root
cd "${PROJECT_ROOT}"

# Build backend image
echo ""
echo "Building backend image..."
docker build \
  -t todo-backend:${TAG} \
  phase-4/backend/

echo "✓ Backend image built: todo-backend:${TAG}"

# Verify backend image size
BACKEND_SIZE=$(docker images todo-backend:${TAG} --format "{{.Size}}")
echo "  Size: ${BACKEND_SIZE}"

# Build frontend image
echo ""
echo "Building frontend image..."
docker build \
  -t todo-frontend:${TAG} \
  phase-4/frontend/todo-app/

echo "✓ Frontend image built: todo-frontend:${TAG}"

# Verify frontend image size
FRONTEND_SIZE=$(docker images todo-frontend:${TAG} --format "{{.Size}}")
echo "  Size: ${FRONTEND_SIZE}"

# Verify non-root users
echo ""
echo "=========================================="
echo "Verifying Security (non-root users)"
echo "=========================================="

echo ""
echo "Backend user (expect UID 10001):"
docker run --rm todo-backend:${TAG} id

echo ""
echo "Frontend user (expect UID 1001):"
docker run --rm todo-frontend:${TAG} id

echo ""
echo "=========================================="
echo "✓ Images built successfully!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "  1. Load images into Minikube: ./phase-4/scripts/load-minikube.sh ${TAG}"
echo "  2. Deploy with Helm: helm install todo-app ./phase-4/helm/todo-app"
