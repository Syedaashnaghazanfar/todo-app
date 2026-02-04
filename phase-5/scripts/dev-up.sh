#!/bin/bash
# Start Phase V Local Development Environment
#
# This script:
# 1. Starts Minikube with appropriate resources
# 2. Installs Dapr in Kubernetes
# 3. Deploys Kafka via Bitnami Helm chart
# 4. Creates all required Kafka topics
# 5. Deploys Phase V services via Helm
# 6. Verifies all services are running
#
# Usage: ./scripts/dev-up.sh

set -e

echo "🚀 Starting Phase V Local Development Environment"
echo "=================================================="
echo ""

# Check prerequisites
echo "📋 Checking prerequisites..."
command -v minikube >/dev/null 2>&1 || { echo "❌ minikube not found. Install from https://minikube.sigs.k8s.io"; exit 1; }
command -v kubectl >/dev/null 2>&1 || { echo "❌ kubectl not found. Install from https://kubernetes.io"; exit 1; }
command -v helm >/dev/null 2>&1 || { echo "❌ helm not found. Install from https://helm.sh"; exit 1; }
command -v dapr >/dev/null 2>&1 || { echo "❌ dapr CLI not found. Install from https://dapr.io"; exit 1; }
echo "✅ All prerequisites installed"
echo ""

# Step 1: Start Minikube
echo "🎯 Step 1: Starting Minikube..."
minikube status &>/dev/null && echo "✅ Minikube already running" || {
    echo "Starting Minikube with 4 CPUs, 8GB RAM, 20GB disk..."
    minikube start --cpus=4 --memory=8192 --disk-size=20g
    echo "✅ Minikube started successfully"
}

# Enable metrics-server for HPA
echo "Enabling metrics-server addon..."
minikube addons enable metrics-server
echo "✅ Metrics server enabled"
echo ""

# Step 2: Install Dapr
echo "🎯 Step 2: Installing Dapr in Kubernetes..."
dapr status -k &>/dev/null && echo "✅ Dapr already installed" || {
    echo "Installing Dapr..."
    dapr init --kubernetes --wait
    echo "✅ Dapr installed successfully"
}

# Verify Dapr installation
echo "Verifying Dapr components..."
kubectl wait --for=condition=ready pod -l app=dapr-operator -n dapr-system --timeout=120s
kubectl wait --for=condition=ready pod -l app=dapr-sidecar-injector -n dapr-system --timeout=120s
kubectl wait --for=condition=ready pod -l app=dapr-sentry -n dapr-system --timeout=120s
kubectl wait --for=condition=ready pod -l app=dapr-placement-server -n dapr-system --timeout=120s
echo "✅ Dapr components ready"
echo ""

# Step 3: Deploy Kafka
echo "🎯 Step 3: Deploying Kafka via Bitnami Helm chart..."
helm list | grep -q "^kafka" && echo "✅ Kafka already deployed" || {
    echo "Adding Bitnami Helm repository..."
    helm repo add bitnami https://charts.bitnami.com/bitnami
    helm repo update

    echo "Installing Kafka..."
    helm install kafka bitnami/kafka \
        --set replicaCount=1 \
        --set persistence.size=10Gi \
        --set logRetentionHours=168 \
        --namespace default \
        --wait

    echo "✅ Kafka deployed successfully"
}

# Wait for Kafka to be ready
echo "Waiting for Kafka pod to be ready..."
kubectl wait --for=condition=ready pod -l app.kubernetes.io/name=kafka --timeout=300s
echo "✅ Kafka pod ready"
echo ""

# Step 4: Create Kafka Topics
echo "🎯 Step 4: Creating Kafka topics..."
if kubectl exec -it kafka-0 -- kafka-topics.sh --list --bootstrap-server localhost:9092 2>/dev/null | grep -q "task-operations"; then
    echo "✅ Kafka topics already exist"
else
    echo "Running topic creation script..."
    bash "$(dirname "$0")/create-kafka-topics.sh" kafka-0
    echo "✅ Kafka topics created"
fi
echo ""

# Step 5: Deploy Phase V Services
echo "🎯 Step 5: Deploying Phase V services via Helm..."
cd "$(dirname "$0")/.." || exit 1

helm list | grep -q "^todo-app" && echo "⚠️  todo-app already deployed. Run 'helm upgrade' to update." || {
    echo "Installing todo-app Helm chart..."
    helm install todo-app ./helm/todo-app \
        -f ./helm/todo-app/values-minikube.yaml \
        --namespace default \
        --wait \
        --timeout=5m

    echo "✅ Phase V services deployed"
}
echo ""

# Step 6: Verify Services
echo "🎯 Step 6: Verifying all services..."
echo ""

# Wait for all pods to be ready
echo "Waiting for application pods to be ready..."
TIMEOUT=300
ELAPSED=0
while [ $ELAPSED -lt $TIMEOUT ]; do
    PENDING=$(kubectl get pods --field-selector=status.phase!=Running,status.phase!=Succeeded 2>/dev/null | grep -v NAME | wc -l)
    if [ "$PENDING" -eq 0 ]; then
        # Check if all pods are actually ready
        NOT_READY=$(kubectl get pods -o json | jq -r '.items[] | select(.status.conditions[] | select(.type=="Ready" and .status=="False")) | .metadata.name' 2>/dev/null | wc -l)
        if [ "$NOT_READY" -eq 0 ]; then
            echo "✅ All pods are ready!"
            break
        fi
    fi

    if [ $((ELAPSED % 10)) -eq 0 ]; then
        echo "  Still waiting... ($ELAPSED seconds elapsed)"
    fi
    sleep 2
    ELAPSED=$((ELAPSED + 2))
done

if [ $ELAPSED -ge $TIMEOUT ]; then
    echo "⚠️  Warning: Not all pods became ready within $TIMEOUT seconds"
    echo "Current pod status:"
    kubectl get pods
    echo ""
    echo "You may need to troubleshoot. Run './scripts/verify-local-env.sh' for details."
fi

echo ""
echo "📊 Pod Status:"
kubectl get pods -o wide

echo ""
echo "📊 Dapr Components:"
kubectl get components 2>/dev/null || echo "No Dapr components found yet"

echo ""
echo "📊 Services:"
kubectl get svc

# Verify critical services
echo ""
echo "🔍 Verifying critical services..."
CRITICAL_SERVICES=("frontend" "backend-api")
ALL_SERVICES_OK=true

for service in "${CRITICAL_SERVICES[@]}"; do
    if kubectl get svc "$service" &>/dev/null; then
        echo "  ✅ $service service exists"
    else
        echo "  ❌ $service service not found"
        ALL_SERVICES_OK=false
    fi
done

if [ "$ALL_SERVICES_OK" = true ]; then
    echo "✅ All critical services verified"
else
    echo "⚠️  Some services are missing. Check deployment logs."
fi
echo ""

# Display access instructions
echo "=========================================="
echo "🎉 Phase V Environment Ready!"
echo "=========================================="
echo ""
echo "To access services, run in separate terminals:"
echo ""
echo "  # Frontend (Next.js)"
echo "  kubectl port-forward svc/frontend 3000:3000"
echo "  → http://localhost:3000"
echo ""
echo "  # Backend API"
echo "  kubectl port-forward svc/backend-api 8000:8000"
echo "  → http://localhost:8000/docs"
echo ""
echo "To view logs:"
echo "  kubectl logs -f deployment/backend-api -c backend-api"
echo "  kubectl logs -f deployment/recurring-task-service -c recurring-task-service"
echo "  kubectl logs -f deployment/notification-service -c notification-service"
echo ""
echo "To run verification script:"
echo "  ./scripts/verify-local-env.sh"
echo ""
echo "To stop environment:"
echo "  ./scripts/dev-down.sh"
echo ""
