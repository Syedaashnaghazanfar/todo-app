# Terraform Infrastructure Examples

These examples support the `terraform-infrastructure` Skill for Phase V.

They demonstrate Infrastructure as Code patterns for OKE, AKS, and GKE.

---

## Example 1 – OKE Cluster (Primary)

**Goal:** Provision OKE cluster on Oracle Cloud always-free tier.

```terraform
# terraform/oke/main.tf
terraform {
  required_providers {
    oci = {
      source  = "oracle/oci"
      version = "~> 5.0"
    }
  }
}

provider "oci" {
  tenancy_ocid     = var.tenancy_ocid
  user_ocid        = var.user_ocid
  fingerprint      = var.fingerprint
  private_key_path = var.private_key_path
  region           = var.region
}

resource "oci_containerengine_cluster" "todo_cluster" {
  compartment_id     = var.compartment_ocid
  kubernetes_version = "v1.28.2"
  name               = "todo-oke-cluster"
  vcn_id             = oci_core_vcn.todo_vcn.id
}

resource "oci_containerengine_node_pool" "todo_node_pool" {
  cluster_id         = oci_containerengine_cluster.todo_cluster.id
  compartment_id     = var.compartment_ocid
  kubernetes_version = "v1.28.2"
  name               = "todo-node-pool"

  node_config_details {
    size = 2  # Always-free: 2 nodes

    placement_configs {
      availability_domain = data.oci_identity_availability_domains.ads.availability_domains[0].name
      subnet_id           = oci_core_subnet.todo_node_subnet.id
    }
  }

  node_shape_config {
    memory_in_gbs = 12  # Always-free: 12GB per node
    ocpus         = 2   # Always-free: 2 OCPUs per node
  }

  node_shape = "VM.Standard.A1.Flex"  # Always-free shape
}

# Dapr Installation
resource "null_resource" "dapr_init" {
  provisioner "local-exec" {
    command = <<-EOT
      kubectl config use-context ${oci_containerengine_cluster.todo_cluster.name}
      dapr init -k --runtime-version 1.12 --enable-mtls=true
    EOT
  }
}
```

---

## Example 2 – AKS Cluster (Secondary)

**Goal:** Provision AKS cluster on Azure.

```terraform
# terraform/aks/main.tf
terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }
}

provider "azurerm" {
  features {}
}

resource "azurerm_resource_group" "todo_rg" {
  name     = "todo-resource-group"
  location = var.location
}

resource "azurerm_kubernetes_cluster" "todo_cluster" {
  name                = "todo-aks-cluster"
  location            = azurerm_resource_group.todo_rg.location
  resource_group_name = azurerm_resource_group.todo_rg.name
  dns_prefix          = "todoaks"
  kubernetes_version  = "1.28"

  default_node_pool {
    name       = "default"
    node_count = 2
    vm_size    = "Standard_B2s"
  }

  identity {
    type = "SystemAssigned"
  }
}
```

---

## Example 3 – GKE Cluster (Secondary)

**Goal:** Provision GKE cluster on Google Cloud.

```terraform
# terraform/gke/main.tf
terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

resource "google_container_cluster" "todo_cluster" {
  name     = "todo-gke-cluster"
  location = var.region

  remove_default_node_pool = true
  initial_node_count       = 1

  network    = google_compute_network.todo_vpc.name
  subnetwork = google_compute_subnetwork.todo_subnet.name
}

resource "google_container_node_pool" "todo_node_pool" {
  name       = "todo-node-pool"
  location   = var.region
  cluster    = google_container_cluster.todo_cluster.name
  node_count = 2

  node_config {
    machine_type = "e2-medium"
    disk_size_gb = 20
  }
}
```

---

## Example 4 – Terraform Variables

**Goal:** Define variables for OKE provisioning.

```terraform
# terraform/oke/variables.tf
variable "tenancy_ocid" {
  description = "OCI Tenancy OCID"
  type        = string
}

variable "user_ocid" {
  description = "OCI User OCID"
  type        = string
}

variable "fingerprint" {
  description = "OCI API Key Fingerprint"
  type        = string
}

variable "private_key_path" {
  description = "Path to OCI API Key Private Key"
  type        = string
}

variable "compartment_ocid" {
  description = "OCI Compartment OCID"
  type        = string
}

variable "region" {
  description = "OCI Region"
  type        = string
  default     = "us-ashburn-1"
}
```

---

## Example 5 – Terraform Outputs

**Goal:** Output cluster information.

```terraform
# terraform/oke/outputs.tf
output "cluster_id" {
  description = "OKE Cluster ID"
  value       = oci_containerengine_cluster.todo_cluster.id
}

output "cluster_endpoint" {
  description = "OKE Cluster Endpoint"
  value       = oci_containerengine_cluster.todo_cluster.endpoints[0].kubernetes_api_endpoint
}

output "kubeconfig" {
  description = "Kubeconfig for OKE cluster"
  value       = oci_containerengine_cluster.todo_cluster.kubeconfig[0].content
  sensitive   = true
}
```

---

## Example 6 – Terraform Apply

**Goal:** Apply Terraform configuration.

```bash
# Initialize
cd terraform/oke
terraform init

# Plan
terraform plan -var-file="terraform.tfvars"

# Apply
terraform apply -var-file="terraform.tfvars"

# Get outputs
terraform output cluster_endpoint
```

---

## Example 7 – Multi-Cloud Pattern

**Goal:** Support multiple cloud providers.

```terraform
# terraform/shared/variables.tf
variable "cloud_provider" {
  description = "Cloud provider: oke, aks, or gke"
  type        = string
  default     = "oke"
}

variable "cluster_name" {
  description = "Kubernetes cluster name"
  type        = string
  default     = "todo-cluster"
}

variable "node_count" {
  description = "Number of nodes"
  type        = number
  default     = 2
}
```

---

## Example 8 – Dapr Installation Automation

**Goal:** Automate Dapr installation after cluster creation.

```terraform
resource "null_resource" "dapr_init" {
  provisioner "local-exec" {
    command = <<-EOT
      # Get kubeconfig
      oci ce cluster create-kubeconfig \
        --cluster-id ${oci_containerengine_cluster.todo_cluster.id} \
        --region ${var.region}
      
      # Install Dapr
      dapr init -k --runtime-version 1.12 --enable-mtls=true
    EOT
  }

  depends_on = [oci_containerengine_node_pool.todo_node_pool]
}
```

---

## Example 9 – VCN and Subnets

**Goal:** Create VCN and subnets for OKE.

```terraform
resource "oci_core_vcn" "todo_vcn" {
  compartment_id = var.compartment_ocid
  cidr_blocks    = ["10.0.0.0/16"]
  display_name   = "todo-vcn"
  dns_label      = "todovcn"
}

resource "oci_core_subnet" "todo_node_subnet" {
  cidr_block     = "10.0.1.0/24"
  compartment_id = var.compartment_ocid
  vcn_id         = oci_core_vcn.todo_vcn.id
  display_name   = "todo-node-subnet"
}

resource "oci_core_subnet" "todo_lb_subnet" {
  cidr_block     = "10.0.2.0/24"
  compartment_id = var.compartment_ocid
  vcn_id         = oci_core_vcn.todo_vcn.id
  display_name   = "todo-lb-subnet"
}
```

---

## Example 10 – Complete Terraform Structure

**Goal:** Full Terraform project structure.

```
terraform/
├── oke/
│   ├── main.tf
│   ├── variables.tf
│   ├── outputs.tf
│   └── terraform.tfvars
├── aks/
│   ├── main.tf
│   ├── variables.tf
│   └── outputs.tf
└── gke/
    ├── main.tf
    ├── variables.tf
    └── outputs.tf
```

