# Terraform outputs for Azure Kubernetes Service (AKS) deployment
# Phase V: Enterprise-Grade Cloud Infrastructure
# Task: T043 - Create Terraform variables.tf and outputs.tf

# ==================== AKS Cluster Outputs ====================

output "cluster_id" {
  description = "AKS cluster ID"
  value       = azurerm_kubernetes_cluster.main.id
}

output "cluster_name" {
  description = "AKS cluster name"
  value       = azurerm_kubernetes_cluster.main.name
}

output "cluster_fqdn" {
  description = "AKS cluster FQDN"
  value       = azurerm_kubernetes_cluster.main.fqdn
}

output "cluster_endpoint" {
  description = "AKS cluster API server endpoint"
  value       = azurerm_kubernetes_cluster.main.kube_config[0].host
  sensitive   = true
}

output "kube_config" {
  description = "Kubernetes configuration file content"
  value       = azurerm_kubernetes_cluster.main.kube_config_raw
  sensitive   = true
}

output "kube_config_client_key" {
  description = "Kubernetes client key"
  value       = azurerm_kubernetes_cluster.main.kube_config[0].client_key
  sensitive   = true
}

output "kube_config_client_certificate" {
  description = "Kubernetes client certificate"
  value       = azurerm_kubernetes_cluster.main.kube_config[0].client_certificate
  sensitive   = true
}

output "kube_config_cluster_ca_certificate" {
  description = "Kubernetes cluster CA certificate"
  value       = azurerm_kubernetes_cluster.main.kube_config[0].cluster_ca_certificate
  sensitive   = true
}

output "node_resource_group" {
  description = "AKS node resource group name"
  value       = azurerm_kubernetes_cluster.main.node_resource_group
}

output "kubelet_identity_object_id" {
  description = "AKS kubelet managed identity object ID"
  value       = azurerm_kubernetes_cluster.main.kubelet_identity[0].object_id
}

output "kubelet_identity_client_id" {
  description = "AKS kubelet managed identity client ID"
  value       = azurerm_kubernetes_cluster.main.kubelet_identity[0].client_id
}

# ==================== Azure Container Registry Outputs ====================

output "acr_id" {
  description = "Azure Container Registry ID"
  value       = azurerm_container_registry.main.id
}

output "acr_name" {
  description = "Azure Container Registry name"
  value       = azurerm_container_registry.main.name
}

output "acr_login_server" {
  description = "Azure Container Registry login server URL"
  value       = azurerm_container_registry.main.login_server
}

# ==================== Key Vault Outputs ====================

output "key_vault_id" {
  description = "Azure Key Vault ID"
  value       = azurerm_key_vault.main.id
}

output "key_vault_name" {
  description = "Azure Key Vault name"
  value       = azurerm_key_vault.main.name
}

output "key_vault_uri" {
  description = "Azure Key Vault URI"
  value       = azurerm_key_vault.main.vault_uri
}

# ==================== Networking Outputs ====================

output "vnet_id" {
  description = "Virtual Network ID"
  value       = azurerm_virtual_network.main.id
}

output "vnet_name" {
  description = "Virtual Network name"
  value       = azurerm_virtual_network.main.name
}

output "aks_subnet_id" {
  description = "AKS subnet ID"
  value       = azurerm_subnet.aks.id
}

output "ingress_public_ip" {
  description = "Public IP address for ingress controller"
  value       = azurerm_public_ip.ingress.ip_address
}

output "ingress_public_ip_fqdn" {
  description = "Public IP FQDN for ingress controller"
  value       = azurerm_public_ip.ingress.fqdn
}

# ==================== Monitoring Outputs ====================

output "log_analytics_workspace_id" {
  description = "Log Analytics Workspace ID"
  value       = azurerm_log_analytics_workspace.main.id
}

output "log_analytics_workspace_name" {
  description = "Log Analytics Workspace name"
  value       = azurerm_log_analytics_workspace.main.name
}

output "log_analytics_primary_shared_key" {
  description = "Log Analytics Workspace primary shared key"
  value       = azurerm_log_analytics_workspace.main.primary_shared_key
  sensitive   = true
}

# ==================== Resource Group Outputs ====================

output "resource_group_id" {
  description = "Resource Group ID"
  value       = azurerm_resource_group.main.id
}

output "resource_group_name" {
  description = "Resource Group name"
  value       = azurerm_resource_group.main.name
}

output "resource_group_location" {
  description = "Resource Group location"
  value       = azurerm_resource_group.main.location
}

# ==================== Connection Commands ====================

output "get_credentials_command" {
  description = "Command to get AKS credentials"
  value       = "az aks get-credentials --resource-group ${azurerm_resource_group.main.name} --name ${azurerm_kubernetes_cluster.main.name}"
}

output "acr_login_command" {
  description = "Command to login to Azure Container Registry"
  value       = "az acr login --name ${azurerm_container_registry.main.name}"
}

# ==================== Azure Event Hubs (Kafka) Outputs ====================

output "eventhubs_namespace_id" {
  description = "Event Hubs Namespace ID"
  value       = azurerm_eventhub_namespace.main.id
}

output "eventhubs_namespace_name" {
  description = "Event Hubs Namespace name"
  value       = azurerm_eventhub_namespace.main.name
}

output "eventhubs_kafka_endpoint" {
  description = "Event Hubs Kafka-compatible endpoint (use with Kafka clients)"
  value       = "${azurerm_eventhub_namespace.main.name}.servicebus.windows.net:9093"
}

output "eventhubs_connection_string" {
  description = "Event Hubs namespace connection string (sensitive)"
  value       = azurerm_eventhub_namespace_authorization_rule.app_access.primary_connection_string
  sensitive   = true
}

output "eventhubs_shared_access_key" {
  description = "Event Hubs shared access key (sensitive)"
  value       = azurerm_eventhub_namespace_authorization_rule.app_access.primary_key
  sensitive   = true
}

output "eventhubs_topics" {
  description = "List of Event Hub names (Kafka topics)"
  value = [
    azurerm_eventhub.task_operations.name,
    azurerm_eventhub.task_operations_dlq.name,
    azurerm_eventhub.alerts.name,
    azurerm_eventhub.alerts_dlq.name,
    azurerm_eventhub.task_modifications.name,
    azurerm_eventhub.task_modifications_dlq.name
  ]
}
