# OKE Cluster Terraform Template
# Copy this to terraform/oke/main.tf and customize

terraform {
  required_providers {
    oci = {
      source  = "oracle/oci"
      version = "~> 5.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = ">= 2.0"
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

# VCN
resource "oci_core_vcn" "todo_vcn" {
  compartment_id = var.compartment_ocid
  cidr_blocks    = ["10.0.0.0/16"]
  display_name   = "todo-vcn"
  dns_label      = "todovcn"
}

# Subnets
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

# OKE Cluster
resource "oci_containerengine_cluster" "todo_cluster" {
  compartment_id     = var.compartment_ocid
  kubernetes_version = "v1.28.2"
  name               = "todo-oke-cluster"
  vcn_id             = oci_core_vcn.todo_vcn.id

  options {
    service_lb_subnet_ids = [oci_core_subnet.todo_lb_subnet.id]
  }
}

# Node Pool (Always-Free Tier)
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

# Data Sources
data "oci_identity_availability_domains" "ads" {
  compartment_id = var.tenancy_ocid
}

# Kubernetes Provider
provider "kubernetes" {
  host                   = oci_containerengine_cluster.todo_cluster.endpoints[0].kubernetes_api_endpoint
  cluster_ca_certificate = base64decode(oci_containerengine_cluster.todo_cluster.kubeconfig[0].cluster_ca_certificate)
  exec {
    api_version = "client.authentication.k8s.io/v1beta1"
    command     = "oci"
    args = [
      "ce", "cluster", "create-kubeconfig",
      "--cluster-id", oci_containerengine_cluster.todo_cluster.id,
      "--file", "/dev/stdout",
      "--region", var.region,
      "--token-version", "2.0.0"
    ]
  }
}

# Dapr Installation
resource "null_resource" "dapr_init" {
  provisioner "local-exec" {
    command = <<-EOT
      kubectl config use-context ${oci_containerengine_cluster.todo_cluster.name}
      dapr init -k --runtime-version 1.12 --enable-mtls=true
    EOT
  }

  depends_on = [oci_containerengine_node_pool.todo_node_pool]
}

