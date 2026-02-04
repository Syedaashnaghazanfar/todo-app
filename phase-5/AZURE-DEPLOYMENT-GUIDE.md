# Azure Deployment Quick Start Guide

## ✅ Prerequisites Complete

- [x] Azure CLI installed (v2.80.0)
- [x] Logged in to Azure (nutellacookiesss@gmail.com)
- [x] Subscription active (Azure subscription 1)
- [x] No existing resources (clean slate)

---

## 🚀 Quick Deployment (One Command)

Deploy everything with one script:

```bash
cd phase-5/scripts
chmod +x deploy-to-azure.sh
./deploy-to-azure.sh
```

**This will create**:
- Resource Group
- AKS Cluster (3 node pools, 3 AZs)
- Azure Event Hubs (Kafka, 6 topics)
- Azure Key Vault
- Azure Container Registry
- Log Analytics Workspace
- Virtual Network + Subnets

**Estimated time**: 15-20 minutes
**Estimated cost**: ~$296/month (covered by $200 free tier for 30 days)

---

## 📋 Manual Step-by-Step Deployment

If you prefer to deploy manually:

### Step 1: Create Resource Group

```bash
# Set variables
RESOURCE_GROUP="todo-app-prod-rg"
LOCATION="eastus"

# Create resource group
"/c/Program Files/Microsoft SDKs/Azure/CLI2/wbin/az.cmd" group create \
  --name $RESOURCE_GROUP \
  --location $LOCATION \
  --tags "Environment=production" "Project=TodoApp-Phase5"
```

### Step 2: Create Event Hubs Namespace

```bash
# Event Hubs namespace name (must be globally unique)
EVENTHUBS_NAMESPACE="todo-app-eventhubs-$(date +%s)"

# Create Event Hubs namespace (Standard tier for Kafka support)
"/c/Program Files/Microsoft SDKs/Azure/CLI2/wbin/az.cmd" eventhubs namespace create \
  --name $EVENTHUBS_NAMESPACE \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION \
  --sku Standard \
  --capacity 2 \
  --enable-kafka true

# Create Event Hubs (topics)
for TOPIC in task-operations task-operations-dlq alerts alerts-dlq task-modifications task-modifications-dlq; do
  "/c/Program Files/Microsoft SDKs/Azure/CLI2/wbin/az.cmd" eventhubs eventhub create \
    --name $TOPIC \
    --namespace-name $EVENTHUBS_NAMESPACE \
    --resource-group $RESOURCE_GROUP \
    --partition-count 12 \
    --message-retention 7  # 7 days for production
done

# Get connection string
"/c/Program Files/Microsoft SDKs/Azure/CLI2/wbin/az.cmd" eventhubs namespace authorization-rule keys list \
  --resource-group $RESOURCE_GROUP \
  --namespace-name $EVENTHUBS_NAMESPACE \
  --name RootManageSharedAccessKey \
  --query primaryConnectionString \
  --output tsv
```

### Step 3: Create AKS Cluster

```bash
# AKS cluster name
AKS_CLUSTER="todo-app-aks-prod"

# Create AKS cluster (this takes ~10 minutes)
"/c/Program Files/Microsoft SDKs/Azure/CLI2/wbin/az.cmd" aks create \
  --resource-group $RESOURCE_GROUP \
  --name $AKS_CLUSTER \
  --location $LOCATION \
  --node-count 3 \
  --node-vm-size Standard_DS2_v2 \
  --zones 1 2 3 \
  --enable-managed-identity \
  --generate-ssh-keys \
  --network-plugin azure \
  --kubernetes-version 1.29.0

# Get AKS credentials
"/c/Program Files/Microsoft SDKs/Azure/CLI2/wbin/az.cmd" aks get-credentials \
  --resource-group $RESOURCE_GROUP \
  --name $AKS_CLUSTER \
  --overwrite-existing

# Verify connection
kubectl get nodes
```

### Step 4: Create Azure Key Vault

```bash
# Key Vault name (must be globally unique)
KEY_VAULT="todo-app-kv-$(date +%s)"

# Create Key Vault
"/c/Program Files/Microsoft SDKs/Azure/CLI2/wbin/az.cmd" keyvault create \
  --name $KEY_VAULT \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION \
  --sku standard

# Store Event Hubs connection string in Key Vault
EVENT_HUBS_CONN_STRING=$("/c/Program Files/Microsoft SDKs/Azure/CLI2/wbin/az.cmd" eventhubs namespace authorization-rule keys list \
  --resource-group $RESOURCE_GROUP \
  --namespace-name $EVENTHUBS_NAMESPACE \
  --name RootManageSharedAccessKey \
  --query primaryConnectionString \
  --output tsv)

"/c/Program Files/Microsoft SDKs/Azure/CLI2/wbin/az.cmd" keyvault secret set \
  --vault-name $KEY_VAULT \
  --name "eventhubs-connection-string" \
  --value "$EVENT_HUBS_CONN_STRING"

# Grant AKS access to Key Vault
AKS_IDENTITY=$("/c/Program Files/Microsoft SDKs/Azure/CLI2/wbin/az.cmd" aks show \
  --resource-group $RESOURCE_GROUP \
  --name $AKS_CLUSTER \
  --query identityProfile.kubeletidentity.objectId \
  --output tsv)

"/c/Program Files/Microsoft SDKs/Azure/CLI2/wbin/az.cmd" keyvault set-policy \
  --name $KEY_VAULT \
  --object-id $AKS_IDENTITY \
  --secret-permissions get list
```

### Step 5: Create Azure Container Registry (ACR)

```bash
# ACR name (must be globally unique, alphanumeric only)
ACR_NAME="todoappacr$(date +%s)"

# Create ACR
"/c/Program Files/Microsoft SDKs/Azure/CLI2/wbin/az.cmd" acr create \
  --resource-group $RESOURCE_GROUP \
  --name $ACR_NAME \
  --sku Standard \
  --location $LOCATION

# Grant AKS pull access to ACR
"/c/Program Files/Microsoft SDKs/Azure/CLI2/wbin/az.cmd" aks update \
  --resource-group $RESOURCE_GROUP \
  --name $AKS_CLUSTER \
  --attach-acr $ACR_NAME
```

### Step 6: Deploy Dapr to AKS

```bash
# Install Dapr on AKS cluster
dapr init --kubernetes --wait

# Verify Dapr installation
kubectl get pods -n dapr-system

# Expected output: dapr-operator, dapr-sidecar-injector, dapr-sentry, dapr-placement-server
```

### Step 7: Deploy Application

```bash
# Update Helm values with actual Event Hubs endpoint
EVENT_HUBS_ENDPOINT="${EVENTHUBS_NAMESPACE}.servicebus.windows.net:9093"

# Edit helm/todo-app/values-aks.yaml
# Set: kafka.brokers: "$EVENT_HUBS_ENDPOINT"

# Deploy application
helm upgrade --install todo-app ../../helm/todo-app \
  -f ../../helm/todo-app/values-aks.yaml \
  --set kafka.brokers="$EVENT_HUBS_ENDPOINT" \
  --set azure.keyVault.name="$KEY_VAULT" \
  --namespace todo-app-prod \
  --create-namespace

# Verify deployment
kubectl get pods -n todo-app-prod

# Expected: All pods in Running state with 2/2 containers (app + Dapr sidecar)
```

### Step 8: Access the Application

```bash
# Port-forward to frontend
kubectl port-forward -n todo-app-prod svc/frontend 3000:3000

# Access at: http://localhost:3000

# Or create a public ingress (requires cert-manager and ingress-nginx)
```

---

## 💰 Cost Monitoring

### Check Current Costs

```bash
# View cost analysis
"/c/Program Files/Microsoft SDKs/Azure/CLI2/wbin/az.cmd" consumption usage list \
  --start-date $(date -d "-30 days" +%Y-%m-%d) \
  --end-date $(date +%Y-%m-%d) \
  --output table
```

### Set Up Cost Alerts

```bash
# Create budget alert (optional)
"/c/Program Files/Microsoft SDKs/Azure/CLI2/wbin/az.cmd" consumption budget create \
  --resource-group $RESOURCE_GROUP \
  --budget-name "todo-app-monthly-budget" \
  --amount 300 \
  --time-grain Monthly \
  --start-date $(date +%Y-%m-01) \
  --end-date $(date -d "+1 year" +%Y-%m-01)
```

---

## 🧹 Clean Up (Delete All Resources)

**Warning**: This will delete ALL resources and cannot be undone!

```bash
# Delete entire resource group (removes all resources)
"/c/Program Files/Microsoft SDKs/Azure/CLI2/wbin/az.cmd" group delete \
  --name $RESOURCE_GROUP \
  --yes \
  --no-wait

# This will delete:
# - AKS Cluster
# - Event Hubs Namespace
# - Key Vault
# - ACR
# - Virtual Network
# - Log Analytics
# - All associated resources
```

---

## 📊 Resource Overview

After deployment, your resource group will contain:

| Resource Type | Name | Purpose | Monthly Cost |
|---------------|------|---------|--------------|
| **Resource Group** | todo-app-prod-rg | Container for all resources | $0 |
| **AKS Cluster** | todo-app-aks-prod | Kubernetes cluster (control plane) | $0 |
| **Node Pools** | system, app, monitoring | VM pools for workloads | ~$100 |
| **Event Hubs Namespace** | todo-app-eventhubs-* | Kafka-compatible messaging | $166 |
| **Event Hubs** | 6 topics (12 partitions each) | Task events, alerts, DLQs | Included |
| **Key Vault** | todo-app-kv-* | Secrets management | $0.03 |
| **ACR** | todoappacr* | Container image registry | $20 |
| **Virtual Network** | todo-app-vnet | Network isolation | $0 |
| **Log Analytics** | todo-app-logs | Monitoring and logging | $10 |
| **Public IP** | todo-app-ingress-ip | Ingress controller | $3 |
| **Total** | | | **~$299/month** |

**With Azure Free Tier**: First 30 days covered by $200 credits + always-free services

---

## ❓ Troubleshooting

### Issue: "az: command not found"

**Solution**: Restart your terminal or use full path:
```bash
"/c/Program Files/Microsoft SDKs/Azure/CLI2/wbin/az.cmd" --version
```

### Issue: "Subscription not found"

**Solution**: Login again:
```bash
"/c/Program Files/Microsoft SDKs/Azure/CLI2/wbin/az.cmd" login
```

### Issue: "Quota exceeded"

**Solution**: Check quotas:
```bash
"/c/Program Files/Microsoft SDKs/Azure/CLI2/wbin/az.cmd" vm list-usage \
  --location eastus \
  --output table
```

Request quota increase at: https://portal.azure.com/#view/Microsoft_Azure_Support/NewSupportRequestV3Blade

### Issue: "Authentication failed" (Event Hubs)

**Solution**: Verify connection string in Key Vault:
```bash
"/c/Program Files/Microsoft SDKs/Azure/CLI2/wbin/az.cmd" keyvault secret show \
  --vault-name $KEY_VAULT \
  --name eventhubs-connection-string
```

---

## 📚 Additional Resources

- [Azure Event Hubs Documentation](https://docs.microsoft.com/en-us/azure/event-hubs/)
- [AKS Documentation](https://docs.microsoft.com/en-us/azure/aks/)
- [Azure Free Account](https://azure.microsoft.com/en-us/free/)
- [Dapr on AKS](https://docs.dapr.io/operations/hosting/kubernetes/cluster/setup-aks/)
- [Phase V Migration Guide](./docs/AZURE-EVENT-HUBS-MIGRATION.md)

---

## ✅ Deployment Checklist

- [ ] Azure CLI installed
- [ ] Logged in to Azure
- [ ] Resource group created
- [ ] Event Hubs namespace created (Kafka-compatible)
- [ ] 6 Event Hubs created (topics)
- [ ] AKS cluster provisioned
- [ ] Key Vault created
- [ ] Connection string stored in Key Vault
- [ ] ACR created
- [ ] Dapr installed on AKS
- [ ] Application deployed via Helm
- [ ] Pods running (kubectl get pods)
- [ ] Application accessible (port-forward or ingress)

---

**Need help?** Check `phase-5/docs/TROUBLESHOOTING.md` or `phase-5/docs/AZURE-EVENT-HUBS-MIGRATION.md`
