# Kubernetes & Helm Deployment Examples

These examples support the `kubernetes-helm-deployment` Skill for Phase V.

They demonstrate Kubernetes deployment patterns using Helm charts.

---

## Example 1 – Basic Deployment with Dapr

**Goal:** Deploy FastAPI backend with Dapr sidecar injection.

```yaml
# helm/todo-app/templates/backend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ .Values.backend.name }}
  labels:
    app: {{ .Values.backend.name }}
spec:
  replicas: {{ .Values.backend.replicas }}
  selector:
    matchLabels:
      app: {{ .Values.backend.name }}
  template:
    metadata:
      labels:
        app: {{ .Values.backend.name }}
      annotations:
        dapr.io/enabled: "true"
        dapr.io/app-id: "{{ .Values.backend.name }}"
        dapr.io/app-port: "{{ .Values.backend.port }}"
        dapr.io/config: "dapr-config"
    spec:
      containers:
        - name: {{ .Values.backend.name }}
          image: {{ .Values.backend.image.repository }}:{{ .Values.backend.image.tag }}
          ports:
            - containerPort: {{ .Values.backend.port }}
          env:
            - name: DAPR_HTTP_PORT
              value: "3500"
          resources:
            requests:
              cpu: {{ .Values.backend.resources.requests.cpu }}
              memory: {{ .Values.backend.resources.requests.memory }}
            limits:
              cpu: {{ .Values.backend.resources.limits.cpu }}
              memory: {{ .Values.backend.resources.limits.memory }}
          livenessProbe:
            httpGet:
              path: /health/live
              port: {{ .Values.backend.port }}
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /health/ready
              port: {{ .Values.backend.port }}
            initialDelaySeconds: 5
            periodSeconds: 5
```

---

## Example 2 – Service Template

**Goal:** Expose deployment as a service.

```yaml
# helm/todo-app/templates/backend-service.yaml
apiVersion: v1
kind: Service
metadata:
  name: {{ .Values.backend.name }}
  labels:
    app: {{ .Values.backend.name }}
spec:
  type: {{ .Values.backend.service.type }}
  ports:
    - port: {{ .Values.backend.service.port }}
      targetPort: {{ .Values.backend.port }}
      protocol: TCP
  selector:
    app: {{ .Values.backend.name }}
```

---

## Example 3 – Values File for Minikube

**Goal:** Minikube-specific configuration.

```yaml
# helm/todo-app/values-minikube.yaml
backend:
  name: backend
  replicas: 1
  port: 8000
  image:
    repository: todo-backend
    tag: latest
  service:
    type: NodePort
  resources:
    requests:
      cpu: "50m"
      memory: "128Mi"
    limits:
      cpu: "200m"
      memory: "256Mi"

frontend:
  name: frontend
  replicas: 1
  port: 3000
  image:
    repository: todo-frontend
    tag: latest
  service:
    type: NodePort
```

---

## Example 4 – Values File for OKE

**Goal:** OKE always-free tier configuration.

```yaml
# helm/todo-app/values-oke.yaml
backend:
  name: backend
  replicas: 2
  port: 8000
  image:
    repository: <OCIR_REGISTRY>/todo-backend
    tag: latest
  service:
    type: LoadBalancer
  resources:
    requests:
      cpu: "200m"
      memory: "512Mi"
    limits:
      cpu: "2000m"  # 2 OCPUs max (always-free)
      memory: "2Gi"  # 24GB total / 12 pods
```

---

## Example 5 – Microservice Deployment

**Goal:** Deploy Recurring Task Service.

```yaml
# helm/todo-app/templates/recurring-task-service-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: recurring-task-service
spec:
  replicas: 2
  template:
    metadata:
      annotations:
        dapr.io/enabled: "true"
        dapr.io/app-id: "recurring-task-service"
        dapr.io/app-port: "8001"
    spec:
      containers:
        - name: recurring-task-service
          image: recurring-task-service:latest
          ports:
            - containerPort: 8001
          env:
            - name: DAPR_HTTP_PORT
              value: "3500"
```

---

## Example 6 – ConfigMap

**Goal:** Store application configuration.

```yaml
# helm/todo-app/templates/configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: {{ .Values.app.name }}-config
data:
  app.env: "production"
  log.level: "info"
  kafka.brokers: "{{ .Values.kafka.brokers }}"
```

---

## Example 7 – Network Policy

**Goal:** Restrict pod-to-pod communication.

```yaml
# helm/todo-app/templates/network-policy.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: backend-network-policy
spec:
  podSelector:
    matchLabels:
      app: backend
  policyTypes:
    - Ingress
    - Egress
  ingress:
    - from:
        - podSelector:
            matchLabels:
              app: frontend
      ports:
        - protocol: TCP
          port: 8000
  egress:
    - to:
        - podSelector:
            matchLabels:
              app: dapr-sidecar
      ports:
        - protocol: TCP
          port: 3500
```

---

## Example 8 – Helm Install Command

**Goal:** Install chart with values file.

```bash
# Install with Minikube values
helm install todo-app ./helm/todo-app -f values-minikube.yaml

# Install with OKE values
helm install todo-app ./helm/todo-app -f values-oke.yaml

# Install with overrides
helm install todo-app ./helm/todo-app \
  --set backend.replicas=3 \
  --set frontend.image.tag=v1.0.0
```

---

## Example 9 – Helm Upgrade

**Goal:** Upgrade deployment.

```bash
# Upgrade with new values
helm upgrade todo-app ./helm/todo-app -f values-oke.yaml

# Rollback on failure
helm rollback todo-app
```

---

## Example 10 – Complete Chart Structure

**Goal:** Full Helm chart with all components.

```
helm/todo-app/
├── Chart.yaml
├── values.yaml
├── values-minikube.yaml
├── values-oke.yaml
└── templates/
    ├── backend-deployment.yaml
    ├── backend-service.yaml
    ├── frontend-deployment.yaml
    ├── frontend-service.yaml
    ├── recurring-task-service-deployment.yaml
    ├── notification-service-deployment.yaml
    ├── configmap.yaml
    ├── network-policy.yaml
    └── ingress.yaml
```

