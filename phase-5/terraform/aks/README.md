# Azure Kubernetes Service (AKS) Terraform Configuration

This directory contains Terraform configurations for provisioning an enterprise-grade Azure Kubernetes Service (AKS) cluster for the Todo App Phase V deployment.

## Overview

The Terraform configuration provisions:
- **AKS Cluster** with 3 node pools across 3 availability zones
- **Azure Container Registry (ACR)** for Docker image storage
- **Azure Key Vault** for secrets management
- **Log Analytics Workspace** for monitoring and logging
- **Virtual Network** with dedicated subnet for AKS
- **Public IP** for ingress controller

## Prerequisites

1. **Azure CLI** installed and configured
   ```bash
   az login
   az account set --subscription "<your-subscription-id>"
   ```

2. **Terraform** v1.7.0 or later
   ```bash
   terraform version
   ```

3. **Azure Subscription** with sufficient quota for:
   - Virtual Machines (22 vCPUs minimum for default configuration)
   - Public IP addresses
   - Load balancers

4. **Azure Storage Account** for Terraform remote state (see Setup section)

## Setup

### 1. Create Remote State Storage

Before running Terraform, create an Azure Storage Account for remote state:

```bash
# Create resource group for Terraform state
az group create --name todo-app-tfstate-rg --location eastus

# Create storage account (name must be globally unique)
az storage account create \
  --name todoappphase5tfstate \
  --resource-group todo-app-tfstate-rg \
  --location eastus \
  --sku Standard_LRS \
  --encryption-services blob

# Create blob container
az storage container create \
  --name tfstate \
  --account-name todoappphase5tfstate
```

### 2. Configure Backend

Create a backend configuration file for your environment:

**backend-production.hcl:**
```hcl
resource_group_name  = "todo-app-tfstate-rg"
storage_account_name = "todoappphase5tfstate"
container_name       = "tfstate"
key                  = "production.terraform.tfstate"
```

**backend-staging.hcl:**
```hcl
resource_group_name  = "todo-app-tfstate-rg"
storage_account_name = "todoappphase5tfstate"
container_name       = "tfstate"
key                  = "staging.terraform.tfstate"
```

### 3. Create Variables File

Copy the example variables file and customize:

```bash
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your values
```

Or use environment-specific tfvars:
- `staging.tfvars` - Pre-configured for staging environment
- Create `production.tfvars` for production

## Usage

### Initialize Terraform

```bash
# For production
terraform init -backend-config=backend-production.hcl

# For staging
terraform init -backend-config=backend-staging.hcl
```

### Plan Changes

```bash
# Using terraform.tfvars (default)
terraform plan -out=tfplan

# Using staging.tfvars
terraform plan -var-file=staging.tfvars -out=tfplan-staging

# Using production.tfvars
terraform plan -var-file=production.tfvars -out=tfplan-production
```

### Apply Changes

```bash
# Apply the plan
terraform apply tfplan

# Or apply directly (with approval)
terraform apply -var-file=staging.tfvars
```

### Destroy Resources

```bash
# Destroy all resources (use with caution!)
terraform destroy -var-file=staging.tfvars
```

## Post-Deployment

### 1. Get AKS Credentials

```bash
az aks get-credentials \
  --resource-group <resource-group-name> \
  --name <cluster-name>

# Verify connection
kubectl get nodes
kubectl get namespaces
```

### 2. Login to Azure Container Registry

```bash
az acr login --name <acr-name>

# Or get login server and credentials
az acr show --name <acr-name> --query loginServer --output tsv
```

### 3. Store Secrets in Key Vault

```bash
# Example: Store Redpanda Cloud credentials
az keyvault secret set \
  --vault-name <key-vault-name> \
  --name kafka-bootstrap-servers \
  --value "your-redpanda-broker-url:9092"

az keyvault secret set \
  --vault-name <key-vault-name> \
  --name kafka-sasl-username \
  --value "your-username"

az keyvault secret set \
  --vault-name <key-vault-name> \
  --name kafka-sasl-password \
  --value "your-password"

# Store database connection string
az keyvault secret set \
  --vault-name <key-vault-name> \
  --name database-url \
  --value "postgresql://..."
```

## Outputs

After `terraform apply`, you can retrieve outputs:

```bash
# Get all outputs
terraform output

# Get specific output
terraform output -raw kube_config > ~/.kube/config-aks
terraform output acr_login_server
terraform output ingress_public_ip
```

## Cost Estimation

### Staging Environment (~$265/month)
- System node pool: 2 × Standard_B2s = $60/month
- App node pool: 2 × Standard_B2ms = $120/month
- Monitoring pool: 1 × Standard_B2s = $30/month
- ACR Basic: $5/month
- Misc (Log Analytics, Key Vault, Networking): ~$50/month

### Production Environment (~$1,132/month baseline)
- System node pool: 3 × Standard_DS2_v2 = $288/month
- App node pool: 3 × Standard_DS3_v2 = $579/month
- Monitoring pool: 2 × Standard_DS2_v2 = $192/month
- ACR Standard: $20/month
- Misc (Log Analytics, Key Vault, Networking): ~$53/month

**Note:** Costs increase with autoscaling. Maximum configuration (22 nodes) costs ~$2,500/month.

## Optimization for $500/month Target

To meet the $500/month budget:
1. Use smaller VM sizes (B-series burstable)
2. Reduce initial node counts (use autoscaling)
3. Use single availability zone (development only)
4. Reduce log retention to 7 days
5. Use ACR Basic tier

**Example optimized configuration:**
```hcl
system_node_vm_size = "Standard_B2s"   # $30/month
app_node_vm_size    = "Standard_B2ms"  # $60/month
monitoring_node_vm_size = "Standard_B1ms"  # $15/month

system_node_count = 2
app_node_count = 2
monitoring_node_count = 1

acr_sku = "Basic"
log_retention_days = 7
```

## Troubleshooting

### Issue: Insufficient Quota

**Error:** `Quota exceeded for VM family Standard_DS`

**Solution:**
```bash
# Check current quota
az vm list-usage --location eastus --output table

# Request quota increase
az support tickets create \
  --ticket-name "AKS-Quota-Increase" \
  --severity "minimal" \
  --description "Request quota increase for Standard_DSv2 family"
```

### Issue: Backend Initialization Failed

**Error:** `Failed to get existing workspaces: storage account not found`

**Solution:** Ensure the storage account exists and you have access:
```bash
az storage account show --name todoappphase5tfstate --resource-group todo-app-tfstate-rg
```

### Issue: AKS Cluster Creation Timeout

**Error:** `Timeout waiting for cluster to become available`

**Solution:** AKS provisioning can take 10-15 minutes. Increase timeout or wait and retry:
```bash
terraform apply -var-file=staging.tfvars -refresh=false
```

## Security Best Practices

1. **Never commit `terraform.tfvars`** - Add to `.gitignore`
2. **Use Azure Key Vault** for all secrets (no environment variables)
3. **Enable mTLS** in production (configured in Helm chart)
4. **Restrict Key Vault network access** - Use `allowed_ip_ranges` variable
5. **Enable Azure AD RBAC** for cluster access
6. **Rotate credentials regularly** - Use managed identities where possible

## Next Steps

After provisioning the AKS cluster:
1. Install Dapr runtime: `dapr init --kubernetes`
2. Deploy Helm chart: `cd ../../helm && helm install todo-app ./todo-app`
3. Configure DNS for ingress public IP
4. Install cert-manager for TLS certificates
5. Deploy monitoring stack (Prometheus, Grafana)

## References

- [Azure AKS Documentation](https://docs.microsoft.com/en-us/azure/aks/)
- [Terraform Azure Provider](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs)
- [Dapr on Kubernetes](https://docs.dapr.io/operations/hosting/kubernetes/)
- [Phase V Deployment Guide](../../../docs/DEPLOYMENT.md)
