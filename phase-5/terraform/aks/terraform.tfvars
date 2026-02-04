# Phase V Todo App - Terraform Variables
environment         = "production"
location            = "eastus"
resource_group_name = "todo-app-production-rg"
cluster_name        = "todo-app-production"

# AKS Configuration
kubernetes_version  = "1.29.0"
availability_zones  = ["1", "2", "3"]

# System Node Pool
system_node_count     = 3
system_node_min_count = 3
system_node_max_count = 6
system_node_vm_size   = "Standard_DS2_v2"

# Application Node Pool
app_node_count     = 3
app_node_min_count = 3
app_node_max_count = 12
app_node_vm_size   = "Standard_DS3_v2"

# Monitoring Node Pool
monitoring_node_count     = 2
monitoring_node_min_count = 2
monitoring_node_max_count = 4
monitoring_node_vm_size   = "Standard_DS2_v2"

# Azure Container Registry
acr_sku = "Standard"

# Event Hubs (Kafka)
eventhubs_capacity = 2

# Monitoring
log_retention_days = 30

# Tags
common_tags = {
  Environment = "production"
  Project     = "TodoApp-Phase5"
  ManagedBy   = "Terraform"
}
