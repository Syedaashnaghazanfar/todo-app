# Terraform backend configuration for remote state storage
# Phase V: Enterprise-Grade Cloud Infrastructure
# Task: T044 - Create Terraform backend.tf for remote state (Azure Blob Storage)

# Azure Blob Storage backend for Terraform state
# This configuration stores the Terraform state file in Azure Blob Storage
# for team collaboration and state locking

terraform {
  backend "azurerm" {
    # Storage account and container must be created manually before running terraform init
    # Example setup commands:
    #   az group create --name todo-app-tfstate-rg --location eastus
    #   az storage account create --name todoappphase5tfstate --resource-group todo-app-tfstate-rg --location eastus --sku Standard_LRS
    #   az storage container create --name tfstate --account-name todoappphase5tfstate

    # These values can be overridden via:
    # 1. Command-line flags: terraform init -backend-config="key=staging.terraform.tfstate"
    # 2. Backend config file: terraform init -backend-config=backend-staging.hcl
    # 3. Environment variables: ARM_ACCESS_KEY, ARM_SUBSCRIPTION_ID, etc.

    # resource_group_name  = "todo-app-tfstate-rg"
    # storage_account_name = "todoappphase5tfstate"
    # container_name       = "tfstate"
    # key                  = "production.terraform.tfstate"  # or staging.terraform.tfstate, development.terraform.tfstate

    # State locking is automatically enabled with Azure Blob Storage
    # Terraform uses blob leases to prevent concurrent modifications
  }
}

# Alternative: Local backend (for development/testing only)
# Comment out the azurerm backend above and uncomment this for local state
# terraform {
#   backend "local" {
#     path = "terraform.tfstate"
#   }
# }
