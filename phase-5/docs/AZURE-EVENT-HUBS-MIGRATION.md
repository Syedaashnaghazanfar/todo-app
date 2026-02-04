# Azure Event Hubs Migration Guide

**Migration Date**: 2026-01-14
**From**: Redpanda Cloud (3rd-party SaaS)
**To**: Azure Event Hubs (Azure-native Kafka-compatible service)

## Why Azure Event Hubs?

### Previous Architecture (Redpanda Cloud)
- ❌ Third-party dependency outside Azure ecosystem
- ✅ Free tier ($300 credits)
- ❌ Separate vendor management
- ❌ Additional network hops

### New Architecture (Azure Event Hubs)
- ✅ 100% Azure-native (no third-party dependencies)
- ✅ Kafka-compatible (minimal code changes)
- ✅ Fully managed (zero operational overhead)
- ✅ Integrated with Azure Monitor, Key Vault, RBAC
- ✅ Same Azure portal for all resources
- ✅ Azure $200 free tier for 30 days

---

## Azure Free Tier Strategy

### How to Use $200 Free Credits

**1. Sign Up for Azure Free Account**
- Visit: https://azure.microsoft.com/en-us/free/
- Get **$200 USD credits for 30 days**
- No credit card required (but you need to add one for verification)
- Credits expire after 30 days

**2. Credits Coverage**

With $200 free credits, you can run the **entire Phase V infrastructure** for 30 days:

| Service | Monthly Cost | Free Tier Coverage |
|---------|--------------|-------------------|
| **Event Hubs Standard** | $166 | ✅ Covered (2 TUs) |
| **AKS Cluster** | $0 | ✅ Free (control plane) |
| **AKS Nodes** | ~$100 | ✅ Covered (3x Standard_DS2_v2) |
| **Key Vault** | $0.03 | ✅ Covered |
| **Container Registry** | $20 | ✅ Covered |
| **Log Analytics** | $10 | ✅ Covered |
| **Total** | **~$296/month** | ✅ **Fully covered by $200 credits** |

**Note**: You can optimize further by reducing node count or using spot instances.

**3. After 30 Days**

When free credits expire, you have 3 options:

**Option A: Continue with Event Hubs** ($166/month)
- If you value Azure-native architecture
- If usage justifies the cost
- If operational simplicity is worth the price

**Option B: Switch to Self-Hosted Kafka in AKS** (free within AKS resources)
- Deploy Kafka as StatefulSet in existing AKS cluster
- No additional messaging service cost
- More operational overhead (you manage Kafka)

**Option C: Switch to Azure Service Bus Free Tier** (12.5M ops/month free forever)
- Different protocol (AMQP instead of Kafka)
- Requires Dapr Pub/Sub configuration change
- Permanent free tier with usage limits

---

## Cost Breakdown

### Azure Event Hubs Pricing (Standard Tier)

**Base Cost**: $166/month
- Includes 2 throughput units (TUs)
- 1 TU = 1 MB/s ingress, 2 MB/s egress
- 2 TUs = **2 MB/s ingress, 4 MB/s egress**

**Additional Costs**:
- **Extra TUs**: $83/month per TU (if you need more than 2)
- **Capture** (Event Hubs to Blob Storage): $0.10 per GB (if enabled)
- **Auto-Inflate**: Free (automatically scales TUs up to max)

**For Our Use Case** (1000 users, 1M events/day):
- Average throughput: ~12 KB/sec
- Peak throughput: ~100 KB/sec
- **2 TUs are sufficient** → **$166/month total**

**Compared to Alternatives**:
- Redpanda Cloud Free Tier: $0 (but 3rd-party dependency)
- Self-Hosted Kafka in AKS: ~$0 (uses existing nodes, more ops work)
- Azure Service Bus Free: $0 (different protocol, 12.5M ops limit)

---

## What Changed in the Implementation

### 1. Terraform (`terraform/aks/main.tf`)

**Added**:
```hcl
# Event Hubs Namespace (Kafka-compatible)
resource "azurerm_eventhub_namespace" "main" {
  name     = "${var.cluster_name}-eventhubs-${random_string.suffix.result}"
  sku      = "Standard"  # Required for Kafka support
  capacity = 2           # 2 throughput units
  kafka_enabled = true   # Enable Kafka protocol
}

# 6 Event Hubs (topics): task-operations, alerts, task-modifications + 3 DLQs
resource "azurerm_eventhub" "task_operations" {
  partition_count   = 12  # Match original Kafka design
  message_retention = 30  # 30 days for production
}

# Connection string stored in Key Vault
resource "azurerm_key_vault_secret" "eventhubs_connection_string" {
  value = azurerm_eventhub_namespace_authorization_rule.app_access.primary_connection_string
}
```

### 2. Dapr Pub/Sub Component (`helm/todo-app/templates/dapr-components/pubsub-kafka.yaml`)

**Changed**:
```yaml
# Production: Azure Event Hubs authentication
- name: authType
  value: "password"  # Event Hubs uses SASL/PLAIN

- name: saslUsername
  value: "$ConnectionString"  # Always this value for Event Hubs

- name: saslPassword
  secretKeyRef:
    name: secretstore
    key: "eventhubs-connection-string"  # Full connection string from Key Vault
```

### 3. Helm Values (`helm/todo-app/values-aks.yaml`)

**Changed**:
```yaml
kafka:
  # Azure Event Hubs broker endpoint (Kafka-compatible)
  brokers: "todo-app-eventhubs-prod.servicebus.windows.net:9093"
  useEventHubs: true  # Flag for Event Hubs-specific configuration
```

### 4. Variables (`terraform/aks/variables.tf`)

**Added**:
```hcl
variable "eventhubs_capacity" {
  description = "Event Hubs throughput units (1-20)"
  default     = 2  # 2 MB/s ingress, 4 MB/s egress
}
```

---

## Deployment Instructions

### Step 1: Provision Azure Event Hubs

```bash
cd phase-5/terraform/aks

# Initialize Terraform
terraform init

# Plan (review resources)
terraform plan -out=tfplan

# Apply (provision Event Hubs + AKS + Key Vault)
terraform apply tfplan

# Get Event Hubs endpoint
terraform output eventhubs_kafka_endpoint
# Output: todo-app-eventhubs-abc123.servicebus.windows.net:9093
```

### Step 2: Verify Event Hubs Creation

```bash
# List Event Hubs (topics)
az eventhubs eventhub list \
  --namespace-name todo-app-eventhubs-abc123 \
  --resource-group todo-app-aks-prod \
  --output table

# Expected output: 6 Event Hubs
# - task-operations
# - task-operations-dlq
# - alerts
# - alerts-dlq
# - task-modifications
# - task-modifications-dlq
```

### Step 3: Deploy Application to AKS

```bash
# Get AKS credentials
az aks get-credentials \
  --resource-group todo-app-aks-prod \
  --name todo-app-aks-abc123

# Update Helm values with actual Event Hubs namespace name
# Edit: helm/todo-app/values-aks.yaml
# Set: kafka.brokers: "<your-namespace>.servicebus.windows.net:9093"

# Deploy via Helm
helm upgrade --install todo-app ./helm/todo-app \
  -f helm/todo-app/values-aks.yaml \
  --namespace todo-app-prod \
  --create-namespace

# Verify Dapr components
kubectl get components -n todo-app-prod
# Should see: pubsub-kafka, jobs-api, secretstore, statestore

# Verify pods
kubectl get pods -n todo-app-prod
# All pods should be Running with 2/2 containers (app + Dapr sidecar)
```

### Step 4: Test Kafka Connectivity

```bash
# Port-forward to backend pod
kubectl port-forward -n todo-app-prod svc/backend-api 8000:8000

# Test event publishing (create a task)
curl -X POST http://localhost:8000/api/v1/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Test Event Hubs", "description": "Testing Kafka events"}'

# Check Dapr logs for event publishing
kubectl logs -n todo-app-prod <backend-pod-name> daprd | grep "pubsub"

# Expected: "Successfully published message to topic task-operations"
```

---

## Troubleshooting

### Issue 1: Authentication Failed

**Symptoms**:
```
Error: SASL authentication failed
```

**Solution**:
1. Verify connection string is in Key Vault:
```bash
az keyvault secret show \
  --vault-name todo-app-keyvault-prod \
  --name eventhubs-connection-string
```

2. Verify Dapr secretstore component is configured:
```bash
kubectl describe component secretstore -n todo-app-prod
```

3. Verify AKS managed identity has Key Vault access:
```bash
az role assignment list \
  --scope /subscriptions/<sub-id>/resourceGroups/<rg>/providers/Microsoft.KeyVault/vaults/todo-app-keyvault-prod
```

### Issue 2: Connection Timeout

**Symptoms**:
```
Error: dial tcp: i/o timeout
```

**Solution**:
1. Verify AKS subnet is allowed in Event Hubs network rules:
```bash
az eventhubs namespace network-rule-set show \
  --namespace-name todo-app-eventhubs-prod \
  --resource-group todo-app-aks-prod
```

2. Add AKS subnet if missing:
```bash
az eventhubs namespace network-rule-set update \
  --namespace-name todo-app-eventhubs-prod \
  --resource-group todo-app-aks-prod \
  --default-action Deny \
  --trusted-services true \
  --subnet /subscriptions/<sub-id>/resourceGroups/<rg>/providers/Microsoft.Network/virtualNetworks/<vnet>/subnets/aks-subnet
```

### Issue 3: Event Not Received

**Symptoms**:
- Event published successfully but consumer doesn't receive it

**Solution**:
1. Check consumer group offset:
```bash
# This requires Kafka CLI tools (not available via Event Hubs portal)
# Use Azure Monitor metrics instead
```

2. View Event Hubs metrics in Azure Portal:
- Go to Event Hubs namespace → Metrics
- Select metric: "Incoming Messages"
- Select metric: "Outgoing Messages"
- Compare: If incoming > outgoing, consumer lag exists

3. Check Dapr subscriber endpoint:
```bash
kubectl logs -n todo-app-prod <recurring-service-pod> -c daprd | grep "subscribe"
# Should see: "Subscribed to topic task-operations"
```

---

## Monitoring & Observability

### Azure Monitor Metrics

**Key Metrics to Track**:

1. **Event Hubs Namespace Metrics**:
   - Incoming Requests (events/sec)
   - Outgoing Requests (events/sec)
   - Throttled Requests (should be 0)
   - Server Errors (should be 0)
   - User Errors (authentication failures)

2. **Per-Event Hub Metrics**:
   - Incoming Messages (by topic)
   - Outgoing Messages (by topic)
   - Capture Backlog (if capture enabled)

3. **Throughput Unit Utilization**:
   - Ingress Bytes/Sec (should be < 2 MB/s for 2 TUs)
   - Egress Bytes/Sec (should be < 4 MB/s for 2 TUs)

**Alert Recommendations**:
```bash
# Alert: Throttled Requests > 0
az monitor metrics alert create \
  --name "eventhubs-throttled" \
  --resource-group todo-app-aks-prod \
  --scopes /subscriptions/<sub-id>/resourceGroups/todo-app-aks-prod/providers/Microsoft.EventHub/namespaces/todo-app-eventhubs-prod \
  --condition "count Microsoft.EventHub/namespaces ThrottledRequests > 0" \
  --window-size 5m \
  --evaluation-frequency 1m

# Alert: Server Errors > 0
az monitor metrics alert create \
  --name "eventhubs-server-errors" \
  --resource-group todo-app-aks-prod \
  --scopes /subscriptions/<sub-id>/resourceGroups/todo-app-aks-prod/providers/Microsoft.EventHub/namespaces/todo-app-eventhubs-prod \
  --condition "count Microsoft.EventHub/namespaces ServerErrors > 0" \
  --window-size 5m \
  --evaluation-frequency 1m
```

### Grafana Dashboards

Prometheus ServiceMonitors already configured for application metrics. Add Event Hubs-specific panels:

**Panel 1: Event Throughput**
```promql
# Events published per second
rate(kafka_events_produced_total[5m])
```

**Panel 2: Event Latency**
```promql
# p95 latency for event publishing
histogram_quantile(0.95, rate(kafka_produce_duration_seconds_bucket[5m]))
```

---

## Cost Optimization

### Option 1: Reduce Throughput Units (After 30-Day Trial)

If your actual usage is lower than expected:

```bash
# Scale down to 1 TU (saves $83/month)
az eventhubs namespace update \
  --name todo-app-eventhubs-prod \
  --resource-group todo-app-aks-prod \
  --capacity 1

# Cost: $83/month (50% savings)
```

### Option 2: Enable Auto-Inflate

Auto-inflate automatically scales TUs during peak load:

```bash
# Enable auto-inflate (max 5 TUs)
az eventhubs namespace update \
  --name todo-app-eventhubs-prod \
  --resource-group todo-app-aks-prod \
  --enable-auto-inflate true \
  --maximum-throughput-units 5

# Cost: $166 base + $83 per additional TU (only when needed)
```

### Option 3: Switch to Basic Tier (NOT Recommended)

**DO NOT USE**: Basic tier does **NOT** support Kafka protocol.

Only Standard and Premium tiers support Kafka clients.

---

## Comparison: Event Hubs vs Alternatives

| Feature | Event Hubs | Self-Hosted Kafka | Service Bus Free |
|---------|-----------|------------------|-----------------|
| **Cost** | $166/month | ~$0 (uses AKS nodes) | $0 (12.5M ops/month) |
| **Operational Overhead** | Zero (fully managed) | High (you manage Kafka) | Zero (fully managed) |
| **Kafka Compatible** | ✅ Yes (Kafka 1.0+) | ✅ Yes (native) | ❌ No (AMQP only) |
| **Azure Native** | ✅ Yes | ✅ Yes | ✅ Yes |
| **Scalability** | Auto-scale (1-20 TUs) | Manual (StatefulSet) | Auto-scale (limited) |
| **Multi-AZ** | ✅ Built-in | Manual setup | ✅ Built-in |
| **Integration** | Azure Monitor, RBAC | Manual setup | Azure Monitor, RBAC |
| **Free Tier** | $200 credits (30 days) | No (uses existing AKS) | 12.5M ops/month forever |

**Recommendation**: Use Event Hubs for the first 30 days with $200 credits, then evaluate based on actual usage and decide whether to continue or switch.

---

## Next Steps

1. **Deploy to Azure** using Terraform
2. **Validate connectivity** by publishing test events
3. **Monitor metrics** for 30 days
4. **Decide after trial**:
   - Continue with Event Hubs ($166/month)
   - Switch to self-hosted Kafka (free, more ops work)
   - Switch to Service Bus free tier (different protocol)

---

## References

- [Azure Event Hubs Documentation](https://docs.microsoft.com/en-us/azure/event-hubs/)
- [Event Hubs Kafka Protocol Guide](https://docs.microsoft.com/en-us/azure/event-hubs/apache-kafka-migration-guide)
- [Azure Free Account](https://azure.microsoft.com/en-us/free/)
- [Event Hubs Pricing](https://azure.microsoft.com/en-us/pricing/details/event-hubs/)
- [Dapr Pub/Sub with Event Hubs](https://docs.dapr.io/reference/components-reference/supported-pubsub/setup-apache-kafka/)

---

**Questions?** Check `phase-5/docs/TROUBLESHOOTING.md` for common issues or open a GitHub issue.
