# Terraform variables for STAGING environment
# Phase V: Enterprise-Grade Cloud Infrastructure

environment         = "staging"
location            = "eastus"
resource_group_name = "todo-app-phase5-staging-rg"
cluster_name        = "todoapp-phase5-stg"

# Kubernetes version
kubernetes_version  = "1.29.0"
availability_zones  = ["1", "2"]  # 2 zones for staging (cost optimization)

# System node pool (smaller for staging)
system_node_count     = 2
system_node_min_count = 2
system_node_max_count = 4
system_node_vm_size   = "Standard_B2s"  # 2 vCPU, 4GB RAM - $30/month per node

# Application node pool (smaller for staging)
app_node_count     = 2
app_node_min_count = 2
app_node_max_count = 6
app_node_vm_size   = "Standard_B2ms"  # 2 vCPU, 8GB RAM - $60/month per node

# Monitoring node pool (minimal for staging)
monitoring_node_count     = 1
monitoring_node_min_count = 1
monitoring_node_max_count = 2
monitoring_node_vm_size   = "Standard_B2s"  # 2 vCPU, 4GB RAM - $30/month per node

# Azure Container Registry
acr_sku              = "Basic"  # $5/month
acr_geo_replications = []

# Monitoring & Logging
log_retention_days = 7  # Reduced retention for staging

# Security
allowed_ip_ranges = []

# Common Tags
common_tags = {
  Project     = "TodoApp-Phase5"
  ManagedBy   = "Terraform"
  Environment = "staging"
  Owner       = "DevOps Team"
}

# Estimated Monthly Cost (Staging):
# System pool:  2 nodes × $30 = $60/month
# App pool:     2 nodes × $60 = $120/month
# Monitor pool: 1 node × $30 = $30/month
# ACR Basic:    $5/month
# Misc:         ~$50/month
# TOTAL:        ~$265/month
