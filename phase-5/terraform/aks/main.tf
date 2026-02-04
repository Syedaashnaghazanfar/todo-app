# Terraform configuration for Azure Kubernetes Service (AKS) deployment
# Phase V: Enterprise-Grade Cloud Infrastructure
# Task: T042 - Create Terraform main.tf for AKS provisioning

terraform {
  required_version = ">= 1.7.0"

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.110.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6.2"
    }
  }
}

provider "azurerm" {
  features {
    key_vault {
      purge_soft_delete_on_destroy = true
      recover_soft_deleted_key_vaults = true
    }
    resource_group {
      prevent_deletion_if_contains_resources = false
    }
  }
}

# Random suffix for unique naming
resource "random_string" "suffix" {
  length  = 6
  special = false
  upper   = false
}

# Resource Group
resource "azurerm_resource_group" "main" {
  name     = var.resource_group_name
  location = var.location

  tags = merge(
    var.common_tags,
    {
      Environment = var.environment
      ManagedBy   = "Terraform"
      Project     = "TodoApp-Phase5"
    }
  )
}

# Azure Kubernetes Service (AKS) Cluster
resource "azurerm_kubernetes_cluster" "main" {
  name                = "${var.cluster_name}-${random_string.suffix.result}"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  dns_prefix          = "${var.cluster_name}-${random_string.suffix.result}"
  kubernetes_version  = var.kubernetes_version

  # Default node pool (system workloads)
  default_node_pool {
    name                = "system"
    node_count          = var.system_node_count
    vm_size             = var.system_node_vm_size
    zones               = var.availability_zones
    enable_auto_scaling = true
    min_count           = var.system_node_min_count
    max_count           = var.system_node_max_count
    os_disk_size_gb     = 30
    os_disk_type        = "Managed"

    # Network settings
    vnet_subnet_id = azurerm_subnet.aks.id

    # Node labels
    node_labels = {
      "role" = "system"
    }

    tags = var.common_tags
  }

  # Identity configuration
  identity {
    type = "SystemAssigned"
  }

  # Network profile
  network_profile {
    network_plugin     = "azure"
    network_policy     = "azure"
    dns_service_ip     = "10.0.0.10"
    service_cidr       = "10.0.0.0/16"
    load_balancer_sku  = "standard"
  }

  # Azure AD integration
  azure_active_directory_role_based_access_control {
    azure_rbac_enabled = true
    managed = true
  }

  # Add-ons
  oms_agent {
    log_analytics_workspace_id = azurerm_log_analytics_workspace.main.id
  }

  # Enable HTTP application routing (for development/staging)
  http_application_routing_enabled = var.environment != "production"

  # Auto-scaler profile
  auto_scaler_profile {
    balance_similar_node_groups      = true
    expander                         = "random"
    max_graceful_termination_sec     = 600
    max_node_provisioning_time       = "15m"
    max_unready_nodes                = 3
    max_unready_percentage           = 45
    new_pod_scale_up_delay           = "10s"
    scale_down_delay_after_add       = "10m"
    scale_down_delay_after_delete    = "10s"
    scale_down_delay_after_failure   = "3m"
    scan_interval                    = "10s"
    scale_down_unneeded              = "10m"
    scale_down_unready               = "20m"
    scale_down_utilization_threshold = "0.5"
  }

  tags = merge(
    var.common_tags,
    {
      Environment = var.environment
    }
  )

  depends_on = [
    azurerm_subnet.aks
  ]
}

# Application node pool (user workloads - backend, frontend, services)
resource "azurerm_kubernetes_cluster_node_pool" "app" {
  name                  = "app"
  kubernetes_cluster_id = azurerm_kubernetes_cluster.main.id
  vm_size               = var.app_node_vm_size
  node_count            = var.app_node_count
  zones                 = var.availability_zones
  enable_auto_scaling   = true
  min_count             = var.app_node_min_count
  max_count             = var.app_node_max_count
  os_disk_size_gb       = 50
  os_disk_type          = "Managed"

  # Network settings
  vnet_subnet_id = azurerm_subnet.aks.id

  # Node labels
  node_labels = {
    "role" = "application"
  }

  # Node taints (optional - for workload isolation)
  node_taints = var.environment == "production" ? ["workload=application:NoSchedule"] : []

  tags = var.common_tags
}

# Monitoring node pool (observability workloads - Prometheus, Grafana)
resource "azurerm_kubernetes_cluster_node_pool" "monitoring" {
  name                  = "monitor"
  kubernetes_cluster_id = azurerm_kubernetes_cluster.main.id
  vm_size               = var.monitoring_node_vm_size
  node_count            = var.monitoring_node_count
  zones                 = var.availability_zones
  enable_auto_scaling   = true
  min_count             = var.monitoring_node_min_count
  max_count             = var.monitoring_node_max_count
  os_disk_size_gb       = 30
  os_disk_type          = "Managed"

  # Network settings
  vnet_subnet_id = azurerm_subnet.aks.id

  # Node labels
  node_labels = {
    "role" = "monitoring"
  }

  tags = var.common_tags
}

# Virtual Network
resource "azurerm_virtual_network" "main" {
  name                = "${var.cluster_name}-vnet"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  address_space       = ["10.1.0.0/16"]

  tags = var.common_tags
}

# AKS Subnet
resource "azurerm_subnet" "aks" {
  name                 = "${var.cluster_name}-aks-subnet"
  resource_group_name  = azurerm_resource_group.main.name
  virtual_network_name = azurerm_virtual_network.main.name
  address_prefixes     = ["10.1.0.0/20"]
}

# Azure Container Registry (ACR)
resource "azurerm_container_registry" "main" {
  name                = "${replace(var.cluster_name, "-", "")}acr${random_string.suffix.result}"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  sku                 = var.acr_sku
  admin_enabled       = false

  # Network rules (allow AKS access)
  network_rule_set {
    default_action = "Allow"
  }

  # Geo-replication (production only)
  dynamic "georeplications" {
    for_each = var.environment == "production" ? var.acr_geo_replications : []
    content {
      location                = georeplications.value
      zone_redundancy_enabled = true
    }
  }

  tags = var.common_tags
}

# Grant AKS pull access to ACR
resource "azurerm_role_assignment" "acr_pull" {
  principal_id                     = azurerm_kubernetes_cluster.main.kubelet_identity[0].object_id
  role_definition_name             = "AcrPull"
  scope                            = azurerm_container_registry.main.id
  skip_service_principal_aad_check = true
}

# Log Analytics Workspace (for monitoring)
resource "azurerm_log_analytics_workspace" "main" {
  name                = "${var.cluster_name}-logs"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  sku                 = "PerGB2018"
  retention_in_days   = var.log_retention_days

  tags = var.common_tags
}

# Azure Key Vault (for secrets management)
resource "azurerm_key_vault" "main" {
  name                        = "${var.cluster_name}-kv-${random_string.suffix.result}"
  location                    = azurerm_resource_group.main.location
  resource_group_name         = azurerm_resource_group.main.name
  enabled_for_disk_encryption = true
  tenant_id                   = data.azurerm_client_config.current.tenant_id
  soft_delete_retention_days  = 7
  purge_protection_enabled    = var.environment == "production"
  sku_name                    = "standard"

  # Network ACLs
  network_acls {
    bypass                     = "AzureServices"
    default_action             = "Deny"
    ip_rules                   = var.allowed_ip_ranges
    virtual_network_subnet_ids = [azurerm_subnet.aks.id]
  }

  tags = var.common_tags
}

# Grant AKS access to Key Vault
resource "azurerm_key_vault_access_policy" "aks" {
  key_vault_id = azurerm_key_vault.main.id
  tenant_id    = data.azurerm_client_config.current.tenant_id
  object_id    = azurerm_kubernetes_cluster.main.kubelet_identity[0].object_id

  secret_permissions = [
    "Get",
    "List"
  ]
}

# Azure Event Hubs Namespace (Kafka-compatible messaging)
# Task: T046 - Configure Azure Event Hubs (replacement for Redpanda Cloud)
resource "azurerm_eventhub_namespace" "main" {
  name                = "${var.cluster_name}-eventhubs-${random_string.suffix.result}"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  sku                 = "Standard"  # Standard tier required for Kafka protocol support
  capacity            = var.eventhubs_capacity  # Throughput units (1-20)

  # Kafka support (Standard tier and above)
  # Provides Kafka 1.0+ compatible endpoint
  kafka_enabled = true

  # Auto-inflate (optional - automatically increase throughput units)
  auto_inflate_enabled     = var.environment == "production"
  maximum_throughput_units = var.environment == "production" ? 10 : 0

  # Network isolation
  network_rulesets {
    default_action                 = "Deny"
    trusted_service_access_enabled = true
    ip_rule                        = var.allowed_ip_ranges
    virtual_network_rule {
      subnet_id                                       = azurerm_subnet.aks.id
      ignore_missing_virtual_network_service_endpoint = false
    }
  }

  tags = merge(
    var.common_tags,
    {
      Component = "Messaging"
      Protocol  = "Kafka"
    }
  )
}

# Event Hub: task-operations (main task events)
resource "azurerm_eventhub" "task_operations" {
  name                = "task-operations"
  namespace_name      = azurerm_eventhub_namespace.main.name
  resource_group_name = azurerm_resource_group.main.name
  partition_count     = 12  # Match Kafka partition count for user_id sharding
  message_retention   = var.environment == "production" ? 30 : 7  # Days
}

# Event Hub: task-operations-dlq (dead letter queue)
resource "azurerm_eventhub" "task_operations_dlq" {
  name                = "task-operations-dlq"
  namespace_name      = azurerm_eventhub_namespace.main.name
  resource_group_name = azurerm_resource_group.main.name
  partition_count     = 12
  message_retention   = var.environment == "production" ? 30 : 7
}

# Event Hub: alerts (notification alerts)
resource "azurerm_eventhub" "alerts" {
  name                = "alerts"
  namespace_name      = azurerm_eventhub_namespace.main.name
  resource_group_name = azurerm_resource_group.main.name
  partition_count     = 12
  message_retention   = var.environment == "production" ? 30 : 7
}

# Event Hub: alerts-dlq (dead letter queue)
resource "azurerm_eventhub" "alerts_dlq" {
  name                = "alerts-dlq"
  namespace_name      = azurerm_eventhub_namespace.main.name
  resource_group_name = azurerm_resource_group.main.name
  partition_count     = 12
  message_retention   = var.environment == "production" ? 30 : 7
}

# Event Hub: task-modifications (task update events)
resource "azurerm_eventhub" "task_modifications" {
  name                = "task-modifications"
  namespace_name      = azurerm_eventhub_namespace.main.name
  resource_group_name = azurerm_resource_group.main.name
  partition_count     = 12
  message_retention   = var.environment == "production" ? 30 : 7
}

# Event Hub: task-modifications-dlq (dead letter queue)
resource "azurerm_eventhub" "task_modifications_dlq" {
  name                = "task-modifications-dlq"
  namespace_name      = azurerm_eventhub_namespace.main.name
  resource_group_name = azurerm_resource_group.main.name
  partition_count     = 12
  message_retention   = var.environment == "production" ? 30 : 7
}

# Authorization rule for application access (Kafka clients)
resource "azurerm_eventhub_namespace_authorization_rule" "app_access" {
  name                = "app-access"
  namespace_name      = azurerm_eventhub_namespace.main.name
  resource_group_name = azurerm_resource_group.main.name

  listen = true
  send   = true
  manage = false
}

# Store Event Hubs connection string in Key Vault
resource "azurerm_key_vault_secret" "eventhubs_connection_string" {
  name         = "eventhubs-connection-string"
  value        = azurerm_eventhub_namespace_authorization_rule.app_access.primary_connection_string
  key_vault_id = azurerm_key_vault.main.id

  depends_on = [azurerm_key_vault_access_policy.aks]
}

# Store Event Hubs Kafka endpoint in Key Vault
resource "azurerm_key_vault_secret" "eventhubs_kafka_endpoint" {
  name         = "eventhubs-kafka-endpoint"
  value        = "${azurerm_eventhub_namespace.main.name}.servicebus.windows.net:9093"
  key_vault_id = azurerm_key_vault.main.id

  depends_on = [azurerm_key_vault_access_policy.aks]
}

# Public IP for Ingress Controller
resource "azurerm_public_ip" "ingress" {
  name                = "${var.cluster_name}-ingress-ip"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_kubernetes_cluster.main.node_resource_group
  allocation_method   = "Static"
  sku                 = "Standard"
  zones               = var.availability_zones

  tags = var.common_tags

  depends_on = [azurerm_kubernetes_cluster.main]
}

# Data source for current Azure client config
data "azurerm_client_config" "current" {}
