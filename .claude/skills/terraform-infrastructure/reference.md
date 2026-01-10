# Terraform Infrastructure Reference

This reference document supports the `terraform-infrastructure` Skill for Phase V.

It standardizes **Infrastructure as Code patterns** for cloud Kubernetes clusters.

---

## 1. Scope of This Reference

This file focuses on **Terraform patterns**:

- OKE cluster provisioning (primary)
- AKS cluster provisioning (secondary)
- GKE cluster provisioning (secondary)
- Multi-cloud portability
- Dapr installation automation
- State management

---

## 2. OKE (Oracle Kubernetes Engine) - Primary

### Provider Configuration

```terraform
provider "oci" {
  tenancy_ocid     = var.tenancy_ocid
  user_ocid        = var.user_ocid
  fingerprint      = var.fingerprint
  private_key_path = var.private_key_path
  region           = var.region
}
```

### Cluster Resource

```terraform
resource "oci_containerengine_cluster" "todo_cluster" {
  compartment_id     = var.compartment_ocid
  kubernetes_version = "v1.28.2"
  name               = "todo-oke-cluster"
  vcn_id             = oci_core_vcn.todo_vcn.id
}
```

### Node Pool (Always-Free Tier)

```terraform
resource "oci_containerengine_node_pool" "todo_node_pool" {
  node_shape = "VM.Standard.A1.Flex"  # Always-free shape
  node_shape_config {
    memory_in_gbs = 12
    ocpus         = 2
  }
  node_config_details {
    size = 2  # 2 nodes
  }
}
```

---

## 3. AKS (Azure Kubernetes Service) - Secondary

### Provider Configuration

```terraform
provider "azurerm" {
  features {}
}
```

### Cluster Resource

```terraform
resource "azurerm_kubernetes_cluster" "todo_cluster" {
  name                = "todo-aks-cluster"
  location            = var.location
  resource_group_name = azurerm_resource_group.todo_rg.name
  kubernetes_version  = "1.28"
}
```

---

## 4. GKE (Google Kubernetes Engine) - Secondary

### Provider Configuration

```terraform
provider "google" {
  project = var.project_id
  region  = var.region
}
```

### Cluster Resource

```terraform
resource "google_container_cluster" "todo_cluster" {
  name     = "todo-gke-cluster"
  location = var.region
}
```

---

## 5. Dapr Installation

### Automation

```terraform
resource "null_resource" "dapr_init" {
  provisioner "local-exec" {
    command = "dapr init -k --runtime-version 1.12 --enable-mtls=true"
  }
  depends_on = [cluster_resource]
}
```

---

## 6. Terraform Commands

### Initialize

```bash
terraform init
```

### Plan

```bash
terraform plan -var-file="terraform.tfvars"
```

### Apply

```bash
terraform apply -var-file="terraform.tfvars"
```

### Destroy

```bash
terraform destroy -var-file="terraform.tfvars"
```

---

## References

- [Terraform Documentation](https://developer.hashicorp.com/terraform)
- [OCI Provider](https://registry.terraform.io/providers/oracle/oci/latest/docs)
- [Azure Provider](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs)
- [Google Provider](https://registry.terraform.io/providers/hashicorp/google/latest/docs)

