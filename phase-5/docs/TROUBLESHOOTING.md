# Phase V Troubleshooting Guide

This guide provides solutions for common issues encountered when deploying and running the Phase V microservices architecture locally.

---

## Table of Contents

1. [Minikube Issues](#minikube-issues)
2. [Dapr Issues](#dapr-issues)
3. [Kafka Issues](#kafka-issues)
4. [Pod Issues](#pod-issues)
5. [Service Connectivity Issues](#service-connectivity-issues)
6. [Performance Issues](#performance-issues)
7. [General Debugging Tips](#general-debugging-tips)

---

## Minikube Issues

### Issue: Minikube fails to start with insufficient resources

**Symptoms**:
```
❌ Exiting due to RSRC_INSUFFICIENT_CORES: Requested cpu count 4 is greater than the available cpus of 2
```

**Solution**:
1. Check available resources:
   ```bash
   # On macOS
   sysctl hw.ncpu hw.memsize

   # On Linux
   lscpu
   free -h
   ```

2. Start Minikube with lower resources:
   ```bash
   minikube start --cpus=2 --memory=4096 --disk-size=10g
   ```

3. Or increase Docker Desktop resources (Docker Desktop → Preferences → Resources)

### Issue: Minikube status shows "Stopped" or "Paused"

**Symptoms**:
```bash
$ minikube status
host: Stopped
kubelet: Stopped
```

**Solution**:
```bash
# Start Minikube
minikube start

# If that fails, delete and recreate
minikube delete
minikube start --cpus=4 --memory=8192 --disk-size=20g
```

### Issue: Cannot connect to Minikube cluster

**Symptoms**:
```
Unable to connect to the server: dial tcp [::1]:8080: connect: connection refused
```

**Solution**:
```bash
# Check Minikube status
minikube status

# Restart Minikube
minikube stop
minikube start

# Verify kubectl context
kubectl config current-context  # Should show "minikube"

# If not, set context
kubectl config use-context minikube
```

---

## Dapr Issues

### Issue: Dapr sidecar not injected into pods

**Symptoms**:
- Pods show 1/1 containers instead of 2/2
- Application logs show "Cannot connect to Dapr sidecar"

**Solution**:

1. Check if Dapr is installed:
   ```bash
   dapr status -k
   ```

2. Check namespace annotation:
   ```bash
   kubectl get ns default -o yaml | grep dapr
   ```

3. Add Dapr annotation if missing:
   ```bash
   kubectl annotate ns default dapr.io/enabled=true --overwrite
   ```

4. Check deployment annotations:
   ```bash
   kubectl get deployment backend-api -o yaml | grep dapr.io
   ```

5. Ensure deployment has required annotations:
   ```yaml
   annotations:
     dapr.io/enabled: "true"
     dapr.io/app-id: "backend-api"
     dapr.io/app-port: "8000"
   ```

6. Restart deployment:
   ```bash
   kubectl rollout restart deployment backend-api
   kubectl rollout status deployment backend-api
   ```

### Issue: Dapr components not found

**Symptoms**:
```
Error: component 'pubsub-kafka' not found
```

**Solution**:

1. List Dapr components:
   ```bash
   kubectl get components
   ```

2. If components are missing, deploy them:
   ```bash
   cd phase-5
   kubectl apply -f helm/todo-app/templates/dapr-components/
   ```

3. Verify component spec:
   ```bash
   kubectl get component pubsub-kafka -o yaml
   ```

4. Check component logs:
   ```bash
   kubectl logs -n dapr-system -l app=dapr-operator
   ```

### Issue: Dapr init fails

**Symptoms**:
```
Error: dapr init failed: timeout waiting for dapr-operator
```

**Solution**:

1. Check Dapr system namespace exists:
   ```bash
   kubectl get ns dapr-system
   ```

2. Uninstall and reinstall Dapr:
   ```bash
   dapr uninstall --kubernetes
   dapr init --kubernetes --wait --timeout 5m
   ```

3. Check Dapr system pods:
   ```bash
   kubectl get pods -n dapr-system
   kubectl logs -n dapr-system -l app=dapr-operator
   ```

---

## Kafka Issues

### Issue: Kafka connection refused

**Symptoms**:
```
Failed to connect to broker kafka:9092: Connection refused
```

**Solution**:

1. Check Kafka pod status:
   ```bash
   kubectl get pods -l app.kubernetes.io/name=kafka
   ```

2. Check Kafka service:
   ```bash
   kubectl get svc kafka
   ```

3. Test connectivity from another pod:
   ```bash
   kubectl run -it --rm debug --image=busybox --restart=Never -- sh
   # Inside the pod:
   nc -zv kafka 9092
   ```

4. Check Kafka logs:
   ```bash
   kubectl logs kafka-0 --tail=50
   ```

5. If Kafka pod is in CrashLoopBackOff, check resources:
   ```bash
   kubectl describe pod kafka-0 | grep -A 10 Resources
   ```

6. Restart Kafka:
   ```bash
   kubectl delete pod kafka-0
   # Wait for pod to recreate
   kubectl wait --for=condition=ready pod kafka-0 --timeout=300s
   ```

### Issue: Kafka topics not created

**Symptoms**:
```
ERROR: Topic 'task-operations' does not exist
```

**Solution**:

1. List existing topics:
   ```bash
   kubectl exec -it kafka-0 -- kafka-topics.sh \
     --list --bootstrap-server localhost:9092
   ```

2. Create topics manually:
   ```bash
   cd phase-5
   ./scripts/create-kafka-topics.sh kafka-0
   ```

3. Verify topic creation:
   ```bash
   kubectl exec -it kafka-0 -- kafka-topics.sh \
     --describe --bootstrap-server localhost:9092 \
     --topic task-operations
   ```

### Issue: Kafka running out of disk space

**Symptoms**:
```
ERROR: No space left on device
```

**Solution**:

1. Check Kafka PVC:
   ```bash
   kubectl get pvc kafka-data-pvc
   ```

2. Increase PVC size (if supported by storage class):
   ```bash
   kubectl patch pvc kafka-data-pvc -p '{"spec":{"resources":{"requests":{"storage":"20Gi"}}}}'
   ```

3. Or reduce Kafka retention:
   ```bash
   kubectl exec -it kafka-0 -- kafka-configs.sh \
     --bootstrap-server localhost:9092 \
     --entity-type topics --entity-name task-operations \
     --alter --add-config retention.ms=86400000  # 1 day
   ```

4. Delete old topics:
   ```bash
   kubectl exec -it kafka-0 -- kafka-topics.sh \
     --delete --bootstrap-server localhost:9092 \
     --topic unused-topic
   ```

---

## Pod Issues

### Issue: Pods stuck in Pending state

**Symptoms**:
```bash
$ kubectl get pods
NAME                      READY   STATUS    RESTARTS   AGE
backend-api-xxx           0/2     Pending   0          5m
```

**Solution**:

1. Check pod events:
   ```bash
   kubectl describe pod backend-api-xxx
   ```

2. Common causes:
   - **Insufficient resources**: Scale down replicas or increase Minikube resources
   - **PVC not bound**: Check `kubectl get pvc`
   - **Image pull error**: Check `imagePullPolicy` and image availability

3. Fix insufficient resources:
   ```bash
   # Scale down
   kubectl scale deployment backend-api --replicas=1

   # Or increase Minikube resources
   minikube stop
   minikube start --cpus=4 --memory=8192
   ```

### Issue: Pods in CrashLoopBackOff

**Symptoms**:
```bash
$ kubectl get pods
NAME                      READY   STATUS             RESTARTS   AGE
backend-api-xxx           1/2     CrashLoopBackOff   5          5m
```

**Solution**:

1. Check pod logs:
   ```bash
   # Application container
   kubectl logs backend-api-xxx -c backend-api --tail=50

   # Dapr sidecar
   kubectl logs backend-api-xxx -c daprd --tail=50

   # Previous container (if restarted)
   kubectl logs backend-api-xxx -c backend-api --previous
   ```

2. Common causes:
   - **Missing environment variables**: Check ConfigMap and Secrets
   - **Database connection error**: Verify DATABASE_URL in secrets
   - **Kafka connection error**: See [Kafka Issues](#kafka-issues)
   - **Port conflict**: Ensure app-port matches container port

3. Check pod description:
   ```bash
   kubectl describe pod backend-api-xxx
   ```

4. Fix and restart:
   ```bash
   # Fix the issue (update ConfigMap, Secret, etc.)
   kubectl rollout restart deployment backend-api
   ```

### Issue: Pods not ready (0/2 or 1/2)

**Symptoms**:
```bash
$ kubectl get pods
NAME                      READY   STATUS    RESTARTS   AGE
backend-api-xxx           1/2     Running   0          5m
```

**Solution**:

1. Check which container is not ready:
   ```bash
   kubectl get pod backend-api-xxx -o jsonpath='{.status.containerStatuses[*].name}: {.status.containerStatuses[*].ready}'
   ```

2. Check readiness probe logs:
   ```bash
   kubectl describe pod backend-api-xxx | grep -A 10 Readiness
   ```

3. Test health endpoint manually:
   ```bash
   kubectl exec -it backend-api-xxx -c backend-api -- curl localhost:8000/health
   ```

4. Common fixes:
   - **Slow startup**: Increase `initialDelaySeconds` in deployment YAML
   - **Health endpoint error**: Check application logs
   - **Dapr not ready**: Check Dapr component status

---

## Service Connectivity Issues

### Issue: Cannot access service via port-forward

**Symptoms**:
```bash
$ curl http://localhost:8000/health
curl: (7) Failed to connect to localhost port 8000: Connection refused
```

**Solution**:

1. Check if port-forward is running:
   ```bash
   ps aux | grep port-forward
   ```

2. Check if port is already in use:
   ```bash
   # On macOS/Linux
   lsof -i :8000

   # On Windows
   netstat -ano | findstr :8000
   ```

3. Stop conflicting process or use different port:
   ```bash
   # Use different port
   kubectl port-forward svc/backend-api 8080:8000
   ```

4. Restart port-forward:
   ```bash
   # Kill existing port-forward
   pkill -f "port-forward"

   # Start new port-forward
   kubectl port-forward svc/backend-api 8000:8000
   ```

### Issue: Service-to-service communication fails

**Symptoms**:
```
Error: Failed to invoke service 'backend-api': connection refused
```

**Solution**:

1. Check service exists:
   ```bash
   kubectl get svc backend-api
   ```

2. Check service endpoints:
   ```bash
   kubectl get endpoints backend-api
   ```

3. Test DNS resolution:
   ```bash
   kubectl run -it --rm debug --image=busybox --restart=Never -- sh
   # Inside pod:
   nslookup backend-api
   ```

4. Test service connectivity:
   ```bash
   kubectl run -it --rm debug --image=nicolaka/netshoot --restart=Never -- sh
   # Inside pod:
   curl http://backend-api:8000/health
   ```

5. Check NetworkPolicies (if enabled):
   ```bash
   kubectl get networkpolicies
   kubectl describe networkpolicy <policy-name>
   ```

---

## Performance Issues

### Issue: Slow pod startup times

**Symptoms**:
- Pods take >2 minutes to become ready
- Long `initialDelaySeconds` required

**Solution**:

1. Use smaller base images:
   ```dockerfile
   # Use python:3.12-slim instead of python:3.12
   FROM python:3.12-slim
   ```

2. Enable image caching:
   ```bash
   # Build with cache
   eval $(minikube docker-env)
   docker build --cache-from todo-backend:latest -t todo-backend:latest .
   ```

3. Pre-pull images:
   ```bash
   eval $(minikube docker-env)
   docker pull python:3.12-slim
   ```

4. Increase Minikube resources:
   ```bash
   minikube config set cpus 4
   minikube config set memory 8192
   minikube delete && minikube start
   ```

### Issue: High CPU/memory usage

**Symptoms**:
- Pods being OOMKilled
- High CPU throttling

**Solution**:

1. Check resource usage:
   ```bash
   kubectl top pods
   kubectl top nodes
   ```

2. Increase resource limits:
   ```yaml
   resources:
     requests:
       cpu: "500m"
       memory: "512Mi"
     limits:
       cpu: "1000m"
       memory: "1Gi"
   ```

3. Enable HPA (for production):
   ```bash
   kubectl autoscale deployment backend-api --cpu-percent=70 --min=2 --max=10
   ```

---

## General Debugging Tips

### View all resources
```bash
kubectl get all
kubectl get pods,svc,deployment,configmap,secret
```

### Describe a resource
```bash
kubectl describe pod <pod-name>
kubectl describe deployment <deployment-name>
kubectl describe svc <service-name>
```

### View logs
```bash
# Current logs
kubectl logs <pod-name> -c <container-name>

# Follow logs
kubectl logs -f <pod-name> -c <container-name>

# Previous container logs (after restart)
kubectl logs <pod-name> -c <container-name> --previous

# All pods in deployment
kubectl logs -l app=backend-api --all-containers=true
```

### Execute commands in pod
```bash
# Interactive shell
kubectl exec -it <pod-name> -c <container-name> -- /bin/bash

# Single command
kubectl exec <pod-name> -c <container-name> -- env
```

### Port forwarding
```bash
# Forward service port
kubectl port-forward svc/<service-name> <local-port>:<service-port>

# Forward pod port
kubectl port-forward <pod-name> <local-port>:<container-port>

# Background mode
kubectl port-forward svc/backend-api 8000:8000 &
```

### Check events
```bash
# All events
kubectl get events --sort-by='.lastTimestamp'

# Events for specific pod
kubectl get events --field-selector involvedObject.name=<pod-name>
```

### Resource cleanup
```bash
# Delete failed pods
kubectl delete pod --field-selector status.phase=Failed

# Delete evicted pods
kubectl delete pod --field-selector status.reason=Evicted

# Restart deployment
kubectl rollout restart deployment/<deployment-name>
```

### Complete environment reset
```bash
# Delete all Phase V resources
helm uninstall todo-app
helm uninstall kafka

# Uninstall Dapr
dapr uninstall --kubernetes

# Delete Minikube cluster
minikube delete

# Start fresh
cd phase-5
./scripts/dev-up.sh
```

---

## Getting Help

If you're still experiencing issues:

1. **Run verification script**:
   ```bash
   cd phase-5
   ./scripts/verify-local-env.sh
   ```

2. **Collect diagnostic information**:
   ```bash
   # Save to file
   kubectl get all > diagnostics.txt
   kubectl get events >> diagnostics.txt
   kubectl logs <pod-name> --all-containers=true >> diagnostics.txt
   ```

3. **Check documentation**:
   - [quickstart.md](../../specs/013-enterprise-cloud-infra/quickstart.md)
   - [Dapr Troubleshooting](https://docs.dapr.io/operations/troubleshooting/)
   - [Kubernetes Debugging](https://kubernetes.io/docs/tasks/debug/)

4. **Community support**:
   - Open an issue on GitHub with diagnostic information
   - Include Minikube version, OS, and error messages

---

**Last Updated**: 2026-01-14
**Version**: Phase V Release
