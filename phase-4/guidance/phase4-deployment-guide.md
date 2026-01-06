# Phase 4 Deployment Guide: Docker, Kubernetes, and Helm Fundamentals

**Purpose**: This guide explains all the foundational concepts needed for Phase 4 deployment work - Docker, Kubernetes, Helm, and local deployment. It's designed for developers who need to understand these tools before working on deployment tasks.

**Prerequisites**: Basic understanding of command-line interfaces and YAML syntax.

---

## Table of Contents

1. [Docker Fundamentals](#docker-fundamentals)
2. [Kubernetes Fundamentals](#kubernetes-fundamentals)
3. [Helm Fundamentals](#helm-fundamentals)
4. [Local Deployment Concepts](#local-deployment-concepts)
5. [Todo Application Deployment Architecture](#todo-application-deployment-architecture)
6. [Common Commands Reference](#common-commands-reference)

---

## Docker Fundamentals

### What is Docker?

**Docker** is a platform that packages applications and their dependencies into lightweight, portable containers. Think of a container as a standardized box that contains everything your application needs to run: code, runtime, system tools, libraries, and settings.

### Key Docker Concepts

#### 1. Container
A **container** is a running instance of a Docker image. It's isolated from other containers and has its own filesystem, networking, and process space.

**Real-world analogy**: A shipping container - standardized, portable, and contains everything needed for transport.

**Example**: The Todo backend running in a container:
```bash
docker ps
# Shows: todo-backend container (running on port 8000)
```

#### 2. Image
A **Docker image** is a read-only template used to create containers. It's like a blueprint or snapshot of your application.

**Real-world analogy**: A recipe that defines how to bake a cake. Containers are the actual cakes made from that recipe.

**Example**: The Todo backend Dockerfile creates an image:
```dockerfile
# backend/Dockerfile
FROM python:3.13-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

#### 3. Dockerfile
A **Dockerfile** is a text file with instructions for building a Docker image. It defines:
- Base image (starting point)
- Dependencies to install
- Files to copy
- Commands to run

**Example from Todo app** (`phase-4/backend/Dockerfile`):
```dockerfile
FROM python:3.13-slim
# Base image: Python 3.13 on slim Debian Linux

WORKDIR /app
# Set working directory inside container

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
# Install Python dependencies

COPY . .
# Copy application code

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
# Command to run when container starts
```

#### 4. docker-compose.yml
**Docker Compose** is a tool for defining and running multi-container Docker applications. It uses a YAML file to configure services, networks, and volumes.

**Example from Todo app** (`phase-4/docker-compose.yml`):
```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    container_name: todo-backend
    ports:
      - "8000:8000"  # Host:Container port mapping
    environment:
      - DATABASE_URL=${DATABASE_URL}
    networks:
      - todo-network

  frontend:
    build: ./frontend
    container_name: todo-frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend  # Frontend waits for backend to start
    networks:
      - todo-network

networks:
  todo-network:
    driver: bridge
```

**Key docker-compose concepts**:
- **services**: Different containers/applications (backend, frontend)
- **ports**: Port mapping (host:container) to access containers from host
- **environment**: Environment variables passed to containers
- **networks**: How containers communicate with each other
- **depends_on**: Startup order dependencies

### Docker Commands Cheat Sheet

```bash
# Build an image from Dockerfile
docker build -t todo-backend ./backend

# Run a container from an image
docker run -p 8000:8000 todo-backend

# List running containers
docker ps

# List all containers (including stopped)
docker ps -a

# Stop a container
docker stop todo-backend

# Start a stopped container
docker start todo-backend

# View container logs
docker logs todo-backend

# Execute a command in a running container
docker exec -it todo-backend bash

# Remove a container
docker rm todo-backend

# Remove an image
docker rmi todo-backend

# Docker Compose commands
docker-compose up          # Start all services
docker-compose up -d       # Start in detached mode (background)
docker-compose down        # Stop and remove all services
docker-compose ps          # List running services
docker-compose logs        # View logs from all services
docker-compose logs backend  # View logs from specific service
```

---

## Kubernetes Fundamentals

### What is Kubernetes?

**Kubernetes** (often abbreviated as **K8s**) is an open-source container orchestration platform. It automates deploying, scaling, and managing containerized applications.

**Real-world analogy**: A smart warehouse manager that:
- Assigns containers to workers (pods to nodes)
- Restarts failed containers
- Scales up/down based on demand
- Manages network traffic between containers
- Handles storage and configuration

### Key Kubernetes Concepts

#### 1. Pod

A **pod** is the smallest deployable unit in Kubernetes. It's a group of one or more containers that share storage and network resources.

**Key characteristics**:
- Pods are ephemeral (temporary) - they can be created, destroyed, and recreated
- Each pod has a unique IP address
- Containers in the same pod share localhost
- Pods are typically created and managed by higher-level resources (Deployments)

**Example**: A Todo backend pod contains:
- The FastAPI application container
- Possibly a Dapr sidecar container (for Phase 5)
- Shared filesystem and network namespace

#### 2. Namespace

A **namespace** is a way to divide cluster resources between multiple users, teams, or projects. It's like folders in a filesystem - a way to organize resources.

**Default namespaces**:
- `default`: Where resources go if no namespace is specified
- `kube-system`: Kubernetes system components
- `kube-public`: Publicly accessible resources

**Example**: Todo app resources in `todo` namespace:
```bash
kubectl get pods -n todo
# Shows all pods in the todo namespace
```

**Why use namespaces?**:
- Resource isolation (separate dev, staging, prod)
- Access control (RBAC - Role-Based Access Control)
- Organization (group related resources)

#### 3. Deployment

A **Deployment** is a Kubernetes resource that manages a set of identical pods. It provides:
- Replicas: Number of pod copies to run
- Rolling updates: Zero-downtime deployments
- Rollback: Revert to previous version
- Self-healing: Automatically replaces failed pods

**Example**: Todo backend deployment (`k8s/todo-app/templates/deployment-backend.yaml`):
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: todo-backend
  namespace: todo
spec:
  replicas: 2  # Run 2 identical pods
  selector:
    matchLabels:
      app: todo-backend
  template:
    metadata:
      labels:
        app: todo-backend
    spec:
      containers:
      - name: backend
        image: todo-backend:latest
        ports:
        - containerPort: 8000
```

**Key Deployment concepts**:
- **replicas**: Number of pod copies (for high availability)
- **selector**: Labels to match pods
- **template**: Pod template to create replicas from
- **labels**: Key-value pairs for organizing resources

#### 4. Service

A **Service** is a Kubernetes resource that provides a stable network endpoint to access pods. Since pods are ephemeral, Services provide a permanent way to access your application.

**Types of Services**:
- **ClusterIP** (default): Internal access only within cluster
- **NodePort**: Exposes service on each node's IP at a static port (30000-32767)
- **LoadBalancer**: External IP address (cloud provider)
- **ExternalName**: Maps service to external DNS name

**Example**: Todo backend service (`k8s/todo-app/templates/service-backend.yaml`):
```yaml
apiVersion: v1
kind: Service
metadata:
  name: todo-backend
  namespace: todo
spec:
  type: ClusterIP
  selector:
    app: todo-backend  # Routes traffic to pods with this label
  ports:
  - port: 80          # Service port
    targetPort: 8000  # Container port
```

**How Services work**:
1. Service has a stable IP address and DNS name
2. Service routes traffic to pods matching the selector
3. Load balancing across multiple pod replicas
4. Pods can discover services via DNS: `todo-backend.todo.svc.cluster.local`

#### 5. ConfigMap

A **ConfigMap** is a Kubernetes resource that stores configuration data as key-value pairs. It separates configuration from application code.

**Use cases**:
- Environment variables
- Configuration files
- Non-sensitive settings

**Example**: Todo app ConfigMap (`k8s/todo-app/templates/configmap.yaml`):
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: todo-app-config
  namespace: todo
data:
  LOG_LEVEL: "INFO"
  CORS_ORIGINS: "http://localhost:3000"
  ENVIRONMENT: "development"
```

**Using ConfigMap in a Pod**:
```yaml
spec:
  containers:
  - name: backend
    envFrom:
    - configMapRef:
        name: todo-app-config  # Load all keys as environment variables
```

#### 6. Secret

A **Secret** is like a ConfigMap but for sensitive data (passwords, API keys, tokens). Data is base64-encoded (not encrypted - use external secret managers for encryption).

**Example**: Todo app Secret (`k8s/todo-app/templates/secret.yaml`):
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: todo-app-secrets
  namespace: todo
type: Opaque
data:
  DATABASE_URL: <base64-encoded-value>
  BETTER_AUTH_SECRET: <base64-encoded-value>
```

**Using Secret in a Pod**:
```yaml
spec:
  containers:
  - name: backend
    env:
    - name: DATABASE_URL
      valueFrom:
        secretKeyRef:
          name: todo-app-secrets
          key: DATABASE_URL
```

**⚠️ Security Best Practices**:
- Never commit secrets to version control
- Use external secret managers (OCI Vault, Azure Key Vault, Google Secret Manager) for production
- Use Kubernetes Secrets for development only

#### 7. Ingress

An **Ingress** is a Kubernetes resource that manages external HTTP/HTTPS access to services. It provides:
- URL-based routing
- SSL/TLS termination
- Load balancing
- Host-based routing

**Example**: Todo app Ingress (for Phase 5):
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: todo-app-ingress
  namespace: todo
spec:
  rules:
  - host: todo.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: todo-frontend
            port:
              number: 3000
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: todo-backend
            port:
              number: 80
```

---

## Helm Fundamentals

### What is Helm?

**Helm** is the "package manager for Kubernetes". It simplifies deploying complex applications by:
- Packaging Kubernetes resources into charts
- Managing application versions
- Configuring deployments with values
- Templating YAML files

**Real-world analogy**: Like npm for Node.js or pip for Python, but for Kubernetes applications.

### Key Helm Concepts

#### 1. Chart

A **Chart** is a Helm package containing all the Kubernetes resource definitions needed to deploy an application. It's a collection of YAML templates and a values file.

**Chart structure**:
```
todo-app/
├── Chart.yaml          # Chart metadata
├── values.yaml         # Default configuration values
└── templates/          # Kubernetes resource templates
    ├── deployment-backend.yaml
    ├── deployment-frontend.yaml
    ├── service-backend.yaml
    └── service-frontend.yaml
```

**Example Chart.yaml** (`k8s/todo-app/Chart.yaml`):
```yaml
apiVersion: v2
name: todo-app
description: Todo Chatbot application deployment
version: 1.0.0
appVersion: "3.0.0"
```

#### 2. Values

**Values** are configuration parameters used in Helm templates. They allow customization without modifying templates.

**Example values.yaml** (`k8s/todo-app/values.yaml`):
```yaml
frontend:
  replicaCount: 2
  image: "todo-frontend:latest"
  resources:
    requests:
      memory: "256Mi"
      cpu: "100m"

backend:
  replicaCount: 2
  image: "todo-backend:latest"
  resources:
    requests:
      memory: "512Mi"
      cpu: "250m"
```

**Using values in templates** (`templates/deployment-backend.yaml`):
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: todo-backend
spec:
  replicas: {{ .Values.backend.replicaCount }}  # Uses value: 2
  template:
    spec:
      containers:
      - name: backend
        image: {{ .Values.backend.image }}  # Uses value: todo-backend:latest
        resources:
          {{- toYaml .Values.backend.resources | nindent 10 }}
```

#### 3. Template

A **Template** is a Kubernetes resource YAML file with placeholders that Helm replaces with values. Templates use Go templating syntax.

**Template syntax examples**:
```yaml
# Variables
{{ .Values.backend.replicaCount }}

# Conditionals
{{- if .Values.backend.enabled }}
# ... deployment definition
{{- end }}

# Loops
{{- range .Values.frontend.env }}
- name: {{ .name }}
  value: {{ .value }}
{{- end }}

# Functions
{{- include "todo-app.fullname" . }}  # Calls a template function
{{- toYaml .Values.resources | nindent 8 }}  # Converts to YAML with indentation
```

#### 4. Release

A **Release** is an instance of a chart deployed to a Kubernetes cluster. The same chart can be deployed multiple times as different releases.

**Example**: Deploy Todo app as "todo-prod" release:
```bash
helm install todo-prod ./todo-app -f values-prod.yaml
```

### Helm Commands Cheat Sheet

```bash
# Install a chart
helm install <release-name> <chart-path>
helm install todo-app ./k8s/todo-app

# Install with custom values file
helm install todo-app ./k8s/todo-app -f values-prod.yaml

# Upgrade a release
helm upgrade todo-app ./k8s/todo-app

# List releases
helm list

# Get release status
helm status todo-app

# Uninstall a release
helm uninstall todo-app

# Dry run (see what would be deployed)
helm install todo-app ./k8s/todo-app --dry-run --debug

# Template (generate YAML without deploying)
helm template todo-app ./k8s/todo-app

# View values
helm get values todo-app

# Rollback to previous version
helm rollback todo-app

# Search for charts in repositories
helm search repo stable
```

---

## Local Deployment Concepts

### What is Local Deployment?

**Local deployment** means running your Kubernetes cluster on your development machine instead of in the cloud. This allows testing deployments before pushing to production.

### Key Tools for Local Deployment

#### 1. Minikube

**Minikube** is a tool that runs a single-node Kubernetes cluster inside a virtual machine on your local machine.

**Features**:
- One-node Kubernetes cluster
- Perfect for development and testing
- Supports Docker, Hyper-V, VirtualBox, and other drivers

**Basic Minikube commands**:
```bash
# Start Minikube cluster
minikube start

# Check cluster status
minikube status

# Stop cluster
minikube stop

# Delete cluster
minikube delete

# Access Minikube Docker environment
eval $(minikube docker-env)

# Get Minikube IP address
minikube ip

# Open Kubernetes dashboard
minikube dashboard

# SSH into Minikube VM
minikube ssh
```

#### 2. kubectl

**kubectl** is the command-line tool for interacting with Kubernetes clusters. It's like `docker` for Docker, but for Kubernetes.

**Essential kubectl commands**:
```bash
# Get cluster information
kubectl cluster-info

# Get nodes
kubectl get nodes

# Get all resources in a namespace
kubectl get all -n todo

# Get pods
kubectl get pods -n todo

# Get deployments
kubectl get deployments -n todo

# Get services
kubectl get svc -n todo

# Describe a resource (detailed info)
kubectl describe pod <pod-name> -n todo

# View pod logs
kubectl logs <pod-name> -n todo

# Execute command in pod
kubectl exec -it <pod-name> -n todo -- bash

# Apply YAML file
kubectl apply -f deployment.yaml

# Delete resource
kubectl delete pod <pod-name> -n todo

# Create namespace
kubectl create namespace todo

# Port forwarding (access pod from localhost)
kubectl port-forward <pod-name> 8080:8000 -n todo
```

#### 3. Port Forwarding

**Port forwarding** allows you to access a service running in Kubernetes from your local machine. It creates a secure tunnel between your machine and the pod.

**Example**: Access Todo frontend locally:
```bash
kubectl port-forward service/todo-frontend 3000:3000 -n todo
# Now access http://localhost:3000
```

**When to use port forwarding**:
- Local development and testing
- Debugging pods
- Accessing services without exposing them publicly

#### 4. NodePort vs Port Forwarding

**NodePort**: Service exposed on each node's IP at a static port (30000-32767)
```yaml
spec:
  type: NodePort
  ports:
  - port: 3000
    nodePort: 30080  # Access via <node-ip>:30080
```

**Port Forwarding**: Temporary tunnel for local access
```bash
kubectl port-forward service/todo-frontend 3000:3000 -n todo
# Access via localhost:3000
```

**Comparison**:
- **NodePort**: Persistent, accessible from outside cluster, uses high ports (30000+)
- **Port Forwarding**: Temporary, localhost only, uses any port

---

## Todo Application Deployment Architecture

### Current Architecture (Phase 4)

```
┌─────────────────────────────────────────────────────────┐
│                    Kubernetes Cluster                   │
│                                                         │
│  ┌──────────────┐         ┌──────────────┐            │
│  │  Frontend    │         │   Backend    │            │
│  │   Pod        │────────▶│    Pod       │            │
│  │  (Next.js)   │         │  (FastAPI)   │            │
│  └──────┬───────┘         └──────┬───────┘            │
│         │                        │                     │
│         ▼                        ▼                     │
│  ┌──────────────┐         ┌──────────────┐            │
│  │   Service    │         │   Service    │            │
│  │  (NodePort)  │         │ (ClusterIP)  │            │
│  └──────────────┘         └──────────────┘            │
│                                                         │
└─────────────────────────────────────────────────────────┘
         │                        │
         │                        │
         ▼                        ▼
    External Access          Database (Neon)
    (localhost:3000)         (External Service)
```

### Phase 5 Architecture (With Dapr and Kafka)

```
┌─────────────────────────────────────────────────────────┐
│                    Kubernetes Cluster                   │
│                                                         │
│  ┌──────────────┐         ┌──────────────┐            │
│  │  Frontend    │         │   Backend    │            │
│  │   Pod        │────────▶│    Pod       │            │
│  │              │         │              │            │
│  │  ┌────────┐  │         │  ┌────────┐  │            │
│  │  │ Dapr   │  │         │  │ Dapr   │  │            │
│  │  │Sidecar │  │         │  │Sidecar │  │            │
│  │  └────────┘  │         │  └────┬───┘  │            │
│  └──────────────┘         └───────┼──────┘            │
│                                   │                    │
│                                   ▼                    │
│                            ┌──────────────┐           │
│                            │    Kafka     │           │
│                            │  (3 topics)  │           │
│                            └───────┬──────┘           │
│                                    │                  │
│          ┌─────────────────────────┼─────────────┐   │
│          │                         │             │   │
│          ▼                         ▼             ▼   │
│  ┌──────────────┐      ┌──────────────┐  ┌─────────┐│
│  │  Recurring   │      │ Notification │  │  Audit  ││
│  │Task Service  │      │   Service    │  │ Service ││
│  │   Pod        │      │    Pod       │  │  Pod    ││
│  └──────────────┘      └──────────────┘  └─────────┘│
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Deployment Flow

1. **Build Docker Images**:
   ```bash
   docker build -t todo-backend:latest ./backend
   docker build -t todo-frontend:latest ./frontend
   ```

2. **Load Images into Minikube**:
   ```bash
   eval $(minikube docker-env)
   docker build -t todo-backend:latest ./backend
   docker build -t todo-frontend:latest ./frontend
   ```

3. **Deploy with Helm**:
   ```bash
   helm install todo-app ./k8s/todo-app -f values-minikube.yaml
   ```

4. **Access Application**:
   ```bash
   # Via port forwarding
   kubectl port-forward service/todo-frontend 3000:3000 -n todo
   
   # Or via NodePort (if configured)
   minikube service todo-frontend -n todo
   ```

---

## Common Commands Reference

### Docker Workflow

```bash
# 1. Build image
docker build -t todo-backend:latest ./backend

# 2. Test locally
docker run -p 8000:8000 todo-backend:latest

# 3. Run with docker-compose
docker-compose up -d

# 4. View logs
docker-compose logs -f backend

# 5. Stop
docker-compose down
```

### Kubernetes Workflow

```bash
# 1. Start Minikube
minikube start

# 2. Create namespace
kubectl create namespace todo

# 3. Apply resources
kubectl apply -f k8s/todo-app/templates/

# 4. Check status
kubectl get pods -n todo
kubectl get services -n todo

# 5. View logs
kubectl logs -f deployment/todo-backend -n todo

# 6. Access application
kubectl port-forward service/todo-frontend 3000:3000 -n todo

# 7. Clean up
kubectl delete namespace todo
```

### Helm Workflow

```bash
# 1. Template and validate
helm template todo-app ./k8s/todo-app --debug

# 2. Dry run (test deployment)
helm install todo-app ./k8s/todo-app --dry-run --debug

# 3. Install
helm install todo-app ./k8s/todo-app -f values-minikube.yaml

# 4. Upgrade
helm upgrade todo-app ./k8s/todo-app -f values-minikube.yaml

# 5. Check status
helm status todo-app

# 6. View values
helm get values todo-app

# 7. Rollback
helm rollback todo-app

# 8. Uninstall
helm uninstall todo-app
```

### Troubleshooting Commands

```bash
# Pod issues
kubectl describe pod <pod-name> -n todo
kubectl logs <pod-name> -n todo
kubectl logs <pod-name> -n todo --previous  # Previous crashed container

# Service issues
kubectl describe service <service-name> -n todo
kubectl get endpoints <service-name> -n todo

# Deployment issues
kubectl describe deployment <deployment-name> -n todo
kubectl rollout status deployment/<deployment-name> -n todo
kubectl rollout history deployment/<deployment-name> -n todo

# Resource usage
kubectl top pods -n todo
kubectl top nodes

# Events
kubectl get events -n todo --sort-by='.lastTimestamp'

# Exec into pod
kubectl exec -it <pod-name> -n todo -- bash
```

---

## Summary

### Key Takeaways

1. **Docker**: Packages applications into containers with Dockerfiles and docker-compose.yml
2. **Kubernetes**: Orchestrates containers using Pods, Deployments, Services, ConfigMaps, and Secrets
3. **Helm**: Manages Kubernetes deployments with Charts, Values, and Templates
4. **Local Deployment**: Use Minikube for local Kubernetes cluster and kubectl for interaction
5. **Port Forwarding**: Access services locally for development and testing

### Next Steps

- Practice with the Todo app's existing Docker and Kubernetes configurations
- Try deploying locally with Minikube
- Experiment with Helm charts and values files
- Review Phase 5 deployment tasks (T087-T113) for advanced concepts

---

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Helm Documentation](https://helm.sh/docs/)
- [Minikube Documentation](https://minikube.sigs.k8s.io/docs/)
- [kubectl Cheat Sheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)

---

**Last Updated**: 2025-12-29
**Related Documents**: [PHASE-4-IMPLEMENTATION-PROMPT.md](../PHASE-4-IMPLEMENTATION-PROMPT.md), [specs/007-phase5-cloud-deployment/tasks.md](../specs/007-phase5-cloud-deployment/tasks.md)

