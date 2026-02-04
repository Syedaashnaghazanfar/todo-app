# Terraform variables for Azure Kubernetes Service (AKS) deployment
# Phase V: Enterprise-Grade Cloud Infrastructure
# Task: T043 - Create Terraform variables.tf and outputs.tf

# ==================== General Configuration ====================

variable "environment" {
  description = "Environment name (development, staging, production)"
  type        = string
  validation {
    condition     = contains(["development", "staging", "production"], var.environment)
    error_message = "Environment must be one of: development, staging, production."
  }
}

variable "location" {
  description = "Azure region for all resources"
  type        = string
  default     = "eastus"
}

variable "resource_group_name" {
  description = "Name of the Azure Resource Group"
  type        = string
}

variable "cluster_name" {
  description = "Name of the AKS cluster"
  type        = string
}

variable "common_tags" {
  description = "Common tags to apply to all resources"
  type        = map(string)
  default     = {}
}

# ==================== AKS Cluster Configuration ====================

variable "kubernetes_version" {
  description = "Kubernetes version for AKS cluster"
  type        = string
  default     = "1.29.0"
}

variable "availability_zones" {
  description = "Availability zones for node pools"
  type        = list(string)
  default     = ["1", "2", "3"]
}

# ==================== System Node Pool ====================

variable "system_node_count" {
  description = "Initial number of nodes in system node pool"
  type        = number
  default     = 3
}

variable "system_node_min_count" {
  description = "Minimum number of nodes in system node pool (autoscaling)"
  type        = number
  default     = 3
}

variable "system_node_max_count" {
  description = "Maximum number of nodes in system node pool (autoscaling)"
  type        = number
  default     = 6
}

variable "system_node_vm_size" {
  description = "VM size for system node pool"
  type        = string
  default     = "Standard_DS2_v2"  # 2 vCPU, 7GB RAM
}

# ==================== Application Node Pool ====================

variable "app_node_count" {
  description = "Initial number of nodes in application node pool"
  type        = number
  default     = 3
}

variable "app_node_min_count" {
  description = "Minimum number of nodes in application node pool (autoscaling)"
  type        = number
  default     = 3
}

variable "app_node_max_count" {
  description = "Maximum number of nodes in application node pool (autoscaling)"
  type        = number
  default     = 12
}

variable "app_node_vm_size" {
  description = "VM size for application node pool"
  type        = string
  default     = "Standard_DS3_v2"  # 4 vCPU, 14GB RAM
}

# ==================== Monitoring Node Pool ====================

variable "monitoring_node_count" {
  description = "Initial number of nodes in monitoring node pool"
  type        = number
  default     = 2
}

variable "monitoring_node_min_count" {
  description = "Minimum number of nodes in monitoring node pool (autoscaling)"
  type        = number
  default     = 2
}

variable "monitoring_node_max_count" {
  description = "Maximum number of nodes in monitoring node pool (autoscaling)"
  type        = number
  default     = 4
}

variable "monitoring_node_vm_size" {
  description = "VM size for monitoring node pool"
  type        = string
  default     = "Standard_DS2_v2"  # 2 vCPU, 7GB RAM
}

# ==================== Azure Container Registry ====================

variable "acr_sku" {
  description = "SKU for Azure Container Registry"
  type        = string
  default     = "Standard"
  validation {
    condition     = contains(["Basic", "Standard", "Premium"], var.acr_sku)
    error_message = "ACR SKU must be one of: Basic, Standard, Premium."
  }
}

variable "acr_geo_replications" {
  description = "List of Azure regions for ACR geo-replication (Premium SKU only)"
  type        = list(string)
  default     = []
}

# ==================== Monitoring & Logging ====================

variable "log_retention_days" {
  description = "Log Analytics retention period in days"
  type        = number
  default     = 30
}

# ==================== Security ====================

variable "allowed_ip_ranges" {
  description = "List of IP ranges allowed to access Key Vault and Event Hubs"
  type        = list(string)
  default     = []
}

# ==================== Azure Event Hubs (Kafka) ====================

variable "eventhubs_capacity" {
  description = "Event Hubs namespace capacity (throughput units). Standard SKU supports 1-20 TUs."
  type        = number
  default     = 2
  validation {
    condition     = var.eventhubs_capacity >= 1 && var.eventhubs_capacity <= 20
    error_message = "Event Hubs capacity must be between 1 and 20 throughput units for Standard SKU."
  }
}
