# Kubernetes Secrets Management

**Purpose**: Document secret requirements and configuration for Todo App Phase 4 deployment

## Required Secrets

The Todo App requires the following secrets for operation:

| Secret Key | Purpose | Environment | Required |
|-----------|---------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string (Neon) | All | ✅ Yes |
| `OPENAI_API_KEY` | OpenAI API key for ChatKit AI features | All | ✅ Yes |
| `BETTER_AUTH_SECRET` | Shared secret for JWT verification | All | ✅ Yes |

## Development (Minikube)

### Method 1: kubectl create secret (Recommended for Dev)

```bash
# Create secret from literal values
kubectl create secret generic todo-secrets \
  --from-literal=database-url='postgresql://user:pass@host:5432/dbname?sslmode=require' \
  --from-literal=openai-api-key='sk-proj-xxxxx' \
  --from-literal=better-auth-secret='your-32-character-secret-key'

# Verify secret created
kubectl get secret todo-secrets
kubectl describe secret todo-secrets
```

### Method 2: kubectl create secret from .env file

```bash
# Create .env file (add to .gitignore!)
cat > phase-4/.env.k8s <<EOF
database-url=postgresql://user:pass@host:5432/dbname?sslmode=require
openai-api-key=sk-proj-xxxxx
better-auth-secret=your-32-character-secret-key
EOF

# Create secret from file
kubectl create secret generic todo-secrets --from-env-file=phase-4/.env.k8s

# Delete .env file after creating secret
rm phase-4/.env.k8s
```

### Method 3: Apply YAML manifest

1. **Copy template**:
   ```bash
   cp specs/011-cloud-native-deployment/contracts/secret-template.yaml phase-4/helm/todo-app/secret-dev.yaml
   ```

2. **Base64 encode values**:
   ```bash
   # Database URL
   echo -n 'postgresql://user:pass@host:5432/dbname?sslmode=require' | base64

   # OpenAI API Key
   echo -n 'sk-proj-xxxxx' | base64

   # Better Auth Secret
   echo -n 'your-32-character-secret-key' | base64
   ```

3. **Replace placeholders** in `secret-dev.yaml`:
   ```yaml
   apiVersion: v1
   kind: Secret
   metadata:
     name: todo-secrets
   type: Opaque
   data:
     database-url: <BASE64_ENCODED_DATABASE_URL>
     openai-api-key: <BASE64_ENCODED_OPENAI_API_KEY>
     better-auth-secret: <BASE64_ENCODED_BETTER_AUTH_SECRET>
   ```

4. **Apply secret**:
   ```bash
   kubectl apply -f phase-4/helm/todo-app/secret-dev.yaml

   # Add to .gitignore to prevent accidental commits
   echo "phase-4/helm/todo-app/secret-*.yaml" >> .gitignore
   ```

## Staging/Production

### External Secret Management (Recommended)

For production environments, use external secret management systems:

#### Option 1: Kubernetes External Secrets Operator

```bash
# Install External Secrets Operator
helm repo add external-secrets https://charts.external-secrets.io
helm install external-secrets external-secrets/external-secrets

# Create SecretStore pointing to AWS Secrets Manager, GCP Secret Manager, or Azure Key Vault
kubectl apply -f - <<EOF
apiVersion: external-secrets.io/v1beta1
kind: SecretStore
metadata:
  name: aws-secrets-manager
spec:
  provider:
    aws:
      service: SecretsManager
      region: us-east-1
      auth:
        jwt:
          serviceAccountRef:
            name: external-secrets-sa
EOF

# Create ExternalSecret
kubectl apply -f - <<EOF
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: todo-secrets
spec:
  refreshInterval: 1h
  secretStoreRef:
    name: aws-secrets-manager
    kind: SecretStore
  target:
    name: todo-secrets
    creationPolicy: Owner
  data:
  - secretKey: database-url
    remoteRef:
      key: todo-app/database-url
  - secretKey: openai-api-key
    remoteRef:
      key: todo-app/openai-api-key
  - secretKey: better-auth-secret
    remoteRef:
      key: todo-app/better-auth-secret
EOF
```

#### Option 2: Sealed Secrets

```bash
# Install Sealed Secrets controller
kubectl apply -f https://github.com/bitnami-labs/sealed-secrets/releases/download/v0.24.0/controller.yaml

# Install kubeseal CLI
brew install kubeseal  # macOS
# or download from https://github.com/bitnami-labs/sealed-secrets/releases

# Create regular secret
kubectl create secret generic todo-secrets \
  --from-literal=database-url='...' \
  --from-literal=openai-api-key='...' \
  --from-literal=better-auth-secret='...' \
  --dry-run=client -o yaml > /tmp/todo-secrets.yaml

# Seal the secret
kubeseal -f /tmp/todo-secrets.yaml -w phase-4/helm/todo-app/sealed-secret.yaml

# Apply sealed secret (safe to commit to Git)
kubectl apply -f phase-4/helm/todo-app/sealed-secret.yaml

# Cleanup
rm /tmp/todo-secrets.yaml
```

### Manual Production Secret Creation

```bash
# Production namespace
kubectl create namespace todo-production

# Create secret in production namespace
kubectl create secret generic todo-secrets \
  --from-literal=database-url='postgresql://prod-user:prod-pass@prod-host:5432/todo_prod?sslmode=require' \
  --from-literal=openai-api-key='sk-prod-xxxxx' \
  --from-literal=better-auth-secret='prod-32-character-secret-key' \
  --namespace=todo-production
```

## ConfigMap (Non-Sensitive Configuration)

Create ConfigMap for environment-specific non-sensitive values:

```bash
kubectl apply -f - <<EOF
apiVersion: v1
kind: ConfigMap
metadata:
  name: todo-config
data:
  environment: "development"
  llm-provider: "openai"
  cors-origins: "http://localhost:3000,http://todo-app.local"
  next-public-api-url: "http://todo-backend:8000"
  next-public-chatkit-url: "http://todo-backend:8000/api/chatkit"
EOF
```

## Verification

### Check Secret Exists

```bash
# List secrets
kubectl get secrets

# Describe secret (won't show values)
kubectl describe secret todo-secrets

# Decode secret values (for debugging only)
kubectl get secret todo-secrets -o jsonpath='{.data.database-url}' | base64 --decode
```

### Test Secret in Pod

```bash
# Run test pod
kubectl run test-pod --image=alpine --rm -it --restart=Never -- sh

# Inside pod, check environment variables
env | grep DATABASE_URL
env | grep OPENAI_API_KEY
env | grep BETTER_AUTH_SECRET
```

## Security Best Practices

### ✅ DO:
- Use external secret management systems (AWS Secrets Manager, GCP Secret Manager, Azure Key Vault) for production
- Rotate secrets regularly (every 90 days)
- Use different secrets for each environment (dev/staging/prod)
- Limit secret access with RBAC policies
- Audit secret access with Kubernetes audit logs
- Use Sealed Secrets or External Secrets for GitOps workflows

### ❌ DON'T:
- Commit secret YAML files to version control (add `secret-*.yaml` to .gitignore)
- Share secrets via Slack/email/chat
- Use the same secrets across environments
- Store secrets in ConfigMaps (they're not encrypted)
- Print secret values in logs
- Include secrets in container images

## Troubleshooting

### Secret Not Found

```bash
# Check if secret exists in correct namespace
kubectl get secret todo-secrets -n <namespace>

# Recreate secret if missing
kubectl create secret generic todo-secrets --from-literal=...
```

### Pod Can't Access Secret

```bash
# Check pod events
kubectl describe pod <pod-name>

# Verify secret referenced in Deployment
kubectl get deployment todo-backend -o yaml | grep -A 10 secretKeyRef

# Check RBAC permissions
kubectl auth can-i get secrets --as=system:serviceaccount:default:default
```

### Wrong Secret Values

```bash
# Delete and recreate secret
kubectl delete secret todo-secrets
kubectl create secret generic todo-secrets --from-literal=...

# Restart pods to pick up new values
kubectl rollout restart deployment/todo-backend
kubectl rollout restart deployment/todo-frontend
```

## Next Steps

After configuring secrets:
1. Deploy application with Helm: `helm install todo-app ./phase-4/helm/todo-app`
2. Verify pods start successfully: `kubectl get pods`
3. Check pod logs for secret loading: `kubectl logs <pod-name>`
4. Test application connectivity to database and external services

---

**Created**: 2026-01-04
**Feature**: 011-cloud-native-deployment
**Security Level**: High - Follow production best practices for secret management
