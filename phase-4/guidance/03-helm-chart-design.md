# Phase 4: Helm Chart Design Specifications

## 1. Overview
To simplify deployment and management, the application will be packaged as a unified Helm chart named `todo-app`. This chart will orchestrate both the frontend and backend components, along with their configuration.

---

## 2. Chart Structure
The chart will follow the standard Helm directory structure:

```text
todo-app/
├── Chart.yaml          # Metadata (name, version, appVersion)
├── values.yaml         # Default configuration values
├── .helmignore         # Files to ignore during packaging
├── charts/             # Dependency charts (e.g., postgresql for local dev)
└── templates/          # Manifest templates
    ├── _helpers.tpl    # Shared template helpers
    ├── backend/        # Backend-specific templates
    │   ├── deployment.yaml
    │   ├── service.yaml
    │   └── hpa.yaml    # Horizontal Pod Autoscaler
    ├── frontend/       # Frontend-specific templates
    │   ├── deployment.yaml
    │   ├── service.yaml
    │   └── hpa.yaml
    ├── ingress.yaml    # Unified Ingress resource
    ├── configmap.yaml  # Shared or component-specific ConfigMaps
    └── secrets.yaml    # Secret templates (or ExternalSecret definitions)
```

---

## 3. Values Configuration (`values.yaml`)
The `values.yaml` file must be highly configurable to support different environments (dev, staging, prod).

### 3.1 Global Values
```yaml
global:
  environment: "production"
  imageRegistry: "docker.io/username"
```

### 3.2 Backend Configuration
```yaml
backend:
  enabled: true
  replicaCount: 2
  image:
    repository: todo-backend
    pullPolicy: IfNotPresent
    tag: "" # Overrides Chart.appVersion
  service:
    type: ClusterIP
    port: 80
  resources:
    limits:
      cpu: 500m
      memory: 512Mi
    requests:
      cpu: 100m
      memory: 128Mi
  env:
    logLevel: "info"
  # Secrets should be passed via separate values file or secret management
  secrets:
    databaseUrl: ""
    openaiApiKey: ""
```

### 3.3 Frontend Configuration
```yaml
frontend:
  enabled: true
  replicaCount: 2
  image:
    repository: todo-frontend
    pullPolicy: IfNotPresent
    tag: ""
  service:
    type: ClusterIP
    port: 80
  resources: {} # Define defaults
```

### 3.4 Ingress Configuration
```yaml
ingress:
  enabled: false
  className: "nginx"
  annotations: {}
  hosts:
    - host: todo.local
      paths:
        - path: /
          pathType: Prefix
  tls: []
```

---

## 4. Templating Strategy

### 4.1 Standard Helpers (`_helpers.tpl`)
Use `_helpers.tpl` to define consistent naming conventions and labels.
*   `{{ include "todo-app.name" . }}`: Truncated name of the chart.
*   `{{ include "todo-app.fullname" . }}`: Release name + Chart name.
*   `{{ include "todo-app.labels" . }}`: Standard Kubernetes labels (app.kubernetes.io/name, instance, version, managed-by).
*   `{{ include "todo-app.selectorLabels" . }}`: Selector labels for Deployments/Services.

### 4.2 Conditional Logic
*   Use `{{- if .Values.backend.enabled }}` to conditionally render components.
*   Use `range` loops for environment variables and ingress paths.

### 4.3 Security Context Injection
Templates must allow injecting security contexts from values:
```yaml
securityContext:
  {{- toYaml .Values.backend.podSecurityContext | nindent 8 }}
```

---

## 5. Dependencies
For local development, we can include a database chart as a dependency.
*   **Chart:** `postgresql` (from Bitnami)
*   **Condition:** `tags.local-db` (Enable only when needed).

```yaml
# Chart.yaml
dependencies:
  - name: postgresql
    version: 12.x.x
    repository: https://charts.bitnami.com/bitnami
    condition: postgresql.enabled
```
