#!/bin/bash
# Stop Phase V Local Development Environment
#
# This script gracefully shuts down the local environment:
# 1. Uninstalls todo-app Helm chart
# 2. Uninstalls Kafka
# 3. Uninstalls Dapr from Kubernetes
# 4. Stops Minikube (preserves persistent volumes)
#
# Usage: ./scripts/dev-down.sh [--delete-all]
# Options:
#   --delete-all    Completely delete Minikube (removes all data)

set -e

DELETE_ALL=false
if [ "$1" == "--delete-all" ]; then
    DELETE_ALL=true
fi

echo "🛑 Stopping Phase V Local Development Environment"
echo "=================================================="
echo ""

# Step 1: Uninstall todo-app
echo "🎯 Step 1: Uninstalling todo-app services..."
if helm list | grep -q "^todo-app"; then
    helm uninstall todo-app --namespace default
    echo "✅ todo-app uninstalled"
else
    echo "⚠️  todo-app not found (already uninstalled)"
fi
echo ""

# Step 2: Uninstall Kafka
echo "🎯 Step 2: Uninstalling Kafka..."
if helm list | grep -q "^kafka"; then
    helm uninstall kafka --namespace default
    echo "✅ Kafka uninstalled"
else
    echo "⚠️  Kafka not found (already uninstalled)"
fi
echo ""

# Wait for pods to terminate
echo "Waiting for pods to terminate..."
kubectl wait --for=delete pod -l app.kubernetes.io/name=kafka --timeout=60s 2>/dev/null || true
echo "✅ All pods terminated"
echo ""

# Step 3: Uninstall Dapr
echo "🎯 Step 3: Uninstalling Dapr from Kubernetes..."
if dapr status -k &>/dev/null; then
    dapr uninstall --kubernetes
    echo "✅ Dapr uninstalled"
else
    echo "⚠️  Dapr not found (already uninstalled)"
fi
echo ""

# Step 4: Stop/Delete Minikube
if [ "$DELETE_ALL" == true ]; then
    echo "🎯 Step 4: Deleting Minikube cluster (all data will be lost)..."
    minikube delete
    echo "✅ Minikube cluster deleted"
else
    echo "🎯 Step 4: Stopping Minikube (preserving persistent volumes)..."
    minikube stop
    echo "✅ Minikube stopped"
    echo ""
    echo "ℹ️  Persistent volumes preserved. To completely delete:"
    echo "   ./scripts/dev-down.sh --delete-all"
fi

echo ""
echo "=========================================="
echo "🎉 Environment Stopped Successfully"
echo "=========================================="
echo ""
echo "To restart environment:"
echo "  ./scripts/dev-up.sh"
echo ""
