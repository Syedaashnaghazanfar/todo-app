# Developer Quickstart: Phase V

**Date**: 2026-01-13 | **Phase**: Phase 0

---

## Prerequisites

Install the following tools before starting:

1. **Docker Desktop** (20.10+) - https://docker.com
2. **Minikube** (1.35+) - `brew install minikube` or https://minikube.sigs.k8s.io
3. **kubectl** (1.29+) - `brew install kubectl` or https://kubernetes.io
4. **Helm** (3.12+) - `brew install helm` or https://helm.sh
5. **Dapr CLI** (1.15+) - `brew install dapr/tap/dapr-cli` or https://dapr.io
6. **Python** (3.11+) - https://python.org
7. **Node.js** (18+) - https://nodejs.org

Verify installations:
```bash
docker --version
minikube version
kubectl version --client
helm version
dapr version
python --version
node --version
```

---

## Local Environment Setup (Automated)

**RECOMMENDED**: Use the automated setup script (completes in <5 minutes):

```bash
cd phase-5
./scripts/dev-up.sh
```

This script automatically:
1. Starts Minikube with appropriate resources
2. Installs Dapr in Kubernetes
3. Deploys Kafka via Bitnami Helm chart
4. Creates all required Kafka topics
5. Deploys Phase V services via Helm
6. Verifies all services are running

After completion, proceed to [Port Forwarding](#port-forwarding-to-access-services).

---

## Manual Setup (Alternative)

If you prefer manual setup or need to troubleshoot:

### 1. Start Minikube
```bash
minikube start --cpus=4 --memory=8192 --disk-size=20g
minikube addons enable metrics-server
```

### 2. Install Dapr in Kubernetes
```bash
dapr init --kubernetes --wait
# Verify: kubectl get pods -n dapr-system (all RUNNING)
```

### 3. Deploy Kafka (Bitnami Helm Chart)
```bash
helm repo add bitnami https://charts.bitnami.com/bitnami
helm install kafka bitnami/kafka \
  --set replicaCount=1 \
  --set persistence.size=10Gi \
  --set logRetentionHours=168 \
  --namespace default \
  --wait
# Wait: kubectl get pods -l app.kubernetes.io/name=kafka (RUNNING)
```

### 4. Create Kafka Topics
```bash
cd phase-5
./scripts/create-kafka-topics.sh kafka-0

# Or manually:
# kubectl exec -it kafka-0 -- kafka-topics.sh \
#   --create --bootstrap-server localhost:9092 \
#   --topic task-operations --partitions 12 --replication-factor 1
# (repeat for alerts, task-modifications, and 3 DLQ topics)
```

### 5. Deploy Phase V Services via Helm
```bash
cd phase-5
helm install todo-app ./helm/todo-app -f ./helm/todo-app/values-minikube.yaml --wait
# Wait: kubectl get pods (all RUNNING with 2/2 containers = app + Dapr sidecar)
```

---

## Port Forwarding to Access Services

After deployment (automated or manual), you need to port-forward services to access them locally.

### Option 1: Port Forward Frontend Only (Recommended for Users)
```bash
kubectl port-forward svc/frontend 3000:3000
```

Then open in your browser:
- **Frontend**: http://localhost:3000

The frontend will automatically connect to the backend via the Kubernetes service mesh.

### Option 2: Port Forward All Services (Recommended for Developers)

**Terminal 1 - Frontend**:
```bash
kubectl port-forward svc/frontend 3000:3000
```

**Terminal 2 - Backend API**:
```bash
kubectl port-forward svc/backend-api 8000:8000
```

**Terminal 3 - Recurring Task Service** (optional):
```bash
kubectl port-forward svc/recurring-task-service 8001:8001
```

**Terminal 4 - Notification Service** (optional):
```bash
kubectl port-forward svc/notification-service 8002:8002
```

Then access:
- **Frontend**: http://localhost:3000
- **Backend API Docs**: http://localhost:8000/docs
- **Backend Health**: http://localhost:8000/health
- **Recurring Service Health**: http://localhost:8001/health
- **Notification Service Health**: http://localhost:8002/health

### Option 3: Use Minikube Service (Alternative)

Instead of port-forwarding, you can use Minikube's service command:
```bash
# Get service URLs
minikube service list

# Open frontend in browser
minikube service frontend --url
```

### Stopping Port Forwards

To stop port forwarding:
1. Press `Ctrl+C` in each terminal running port-forward
2. Or find and kill the processes:
   ```bash
   # List port-forward processes
   ps aux | grep port-forward

   # Kill all port-forward processes
   pkill -f "port-forward"
   ```

---

## Verification Steps

### Automated Verification (Recommended)

Run the comprehensive verification script:
```bash
cd phase-5
./scripts/verify-local-env.sh
```

This script checks:
1. Kubernetes connectivity
2. All pods are running
3. Dapr components are configured
4. Kafka topics exist
5. Service endpoints are available
6. Dapr system components are running

Expected output: `✅ Environment Ready!`

If issues are found, see the [Troubleshooting Guide](../../phase-5/docs/TROUBLESHOOTING.md).

### Manual Verification (Alternative)

#### Check Pod Status
```bash
kubectl get pods
# Expected: All pods RUNNING with 2/2 containers (app + Dapr sidecar)
```

#### Check Dapr Components
```bash
kubectl get components
# Expected: pubsub-kafka, secretstore, statestore, jobs-api
```

#### Test Backend Health
```bash
# First, port-forward the backend (if not already done)
kubectl port-forward svc/backend-api 8000:8000 &

# Test health endpoint
curl http://localhost:8000/health
# Expected: {"status": "healthy"}
```

#### Test Kafka Connectivity
```bash
# Send a test message
kubectl exec -it kafka-0 -- kafka-console-producer.sh \
  --bootstrap-server localhost:9092 \
  --topic task-operations
# Type: {"test": "message"} and press Enter, then Ctrl+C

# Consume the message
kubectl exec -it kafka-0 -- kafka-console-consumer.sh \
  --bootstrap-server localhost:9092 \
  --topic task-operations --from-beginning --max-messages 1
# Expected: See your test message
```

#### View Service Logs
```bash
# Backend API logs
kubectl logs -f deployment/backend-api -c backend-api

# Recurring service logs
kubectl logs -f deployment/recurring-task-service -c recurring-task-service

# Dapr sidecar logs (for backend)
kubectl logs -f deployment/backend-api -c daprd
```

---

## Development Workflow

### Run Backend Tests
```bash
cd phase-5/backend
python -m pytest tests/
```

### Run Integration Tests
```bash
cd phase-5/tests/integration
docker-compose -f docker-compose.test.yml up --abort-on-container-exit
```

### Watch Logs
```bash
# Backend logs
kubectl logs -f deployment/backend-api -c backend-api

# Dapr sidecar logs
kubectl logs -f deployment/backend-api -c daprd

# Recurring service logs
kubectl logs -f deployment/recurring-task-service -c recurring-task-service
```

---

## Common Issues

### Pods stuck in CrashLoopBackOff
- Check logs: `kubectl logs <pod-name>`
- Verify Dapr sidecar: `kubectl describe pod <pod-name>`
- Check Dapr components: `kubectl get components`

### Kafka connection refused
- Verify Kafka pod: `kubectl get pods -l app.kubernetes.io/name=kafka`
- Check service: `kubectl get svc kafka`
- Test connectivity: `kubectl exec -it <backend-pod> -- nc -zv kafka 9092`

### Dapr sidecar not injected
- Check namespace annotation: `kubectl get ns default -o yaml | grep dapr`
- Add annotation if missing: `kubectl annotate ns default dapr.io/enabled=true`
- Restart pods: `kubectl rollout restart deployment/<deployment-name>`

---

## Cleanup

```bash
helm uninstall todo-app
helm uninstall kafka
dapr uninstall --kubernetes
minikube stop
# Or completely remove: minikube delete
```

---

**Status**: Quickstart guide complete. Ready for Phase 1 implementation.
