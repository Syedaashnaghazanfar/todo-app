# Kubernetes & Helm Deployment Reference

This reference document supports the `kubernetes-helm-deployment` Skill for Phase V.

It standardizes **Kubernetes deployment patterns** using Helm charts.

---

## 1. Scope of This Reference

This file focuses on **Kubernetes deployment patterns**:

- Deployment manifests with Dapr sidecar
- Service definitions
- ConfigMaps and Secrets
- Health probes
- Resource management
- Network policies
- Helm chart structure

---

## 2. Dapr Sidecar Injection

### Required Annotations

```yaml
annotations:
  dapr.io/enabled: "true"
  dapr.io/app-id: "backend"
  dapr.io/app-port: "8000"
  dapr.io/config: "dapr-config"
```

---

## 3. Deployment Template

### Basic Structure

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ .Values.backend.name }}
spec:
  replicas: {{ .Values.backend.replicas }}
  template:
    metadata:
      annotations:
        dapr.io/enabled: "true"
    spec:
      containers:
        - name: backend
          image: {{ .Values.backend.image }}
```

---

## 4. Service Types

### ClusterIP (Internal)

```yaml
spec:
  type: ClusterIP
```

### NodePort (Minikube)

```yaml
spec:
  type: NodePort
```

### LoadBalancer (Cloud)

```yaml
spec:
  type: LoadBalancer
```

---

## 5. Health Probes

### Liveness Probe

```yaml
livenessProbe:
  httpGet:
    path: /health/live
    port: 8000
  initialDelaySeconds: 30
  periodSeconds: 10
```

### Readiness Probe

```yaml
readinessProbe:
  httpGet:
    path: /health/ready
    port: 8000
  initialDelaySeconds: 5
  periodSeconds: 5
```

---

## 6. Resource Management

### Requests and Limits

```yaml
resources:
  requests:
    cpu: "100m"
    memory: "256Mi"
  limits:
    cpu: "500m"
    memory: "512Mi"
```

### Always-Free Tier (OKE)

```yaml
resources:
  limits:
    cpu: "2000m"  # 2 OCPUs max
    memory: "2Gi"  # 24GB total / 12 pods
```

---

## 7. Helm Commands

### Install

```bash
helm install todo-app ./helm/todo-app -f values-oke.yaml
```

### Upgrade

```bash
helm upgrade todo-app ./helm/todo-app -f values-oke.yaml
```

### Rollback

```bash
helm rollback todo-app
```

### Uninstall

```bash
helm uninstall todo-app
```

---

## References

- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Helm Documentation](https://helm.sh/docs/)
- [Dapr Kubernetes](https://docs.dapr.io/operations/hosting/kubernetes/)

