# MCP Research Documentation - Phase V Cloud Infrastructure

**Date:** 2026-01-13
**Research Phase:** Pre-Implementation Discovery
**Status:** Complete

This document captures critical technical research findings from Context-7 MCP Server and web sources to inform the Phase V enterprise cloud infrastructure design.

---

## 1. Kafka Partitioning Strategies

### User_ID Partition Key Best Practices

**Key Finding:** Using `user_id` as a partition key is optimal for maintaining per-user event ordering while enabling horizontal scalability.

**Rationale:**
- Kafka guarantees ordering only within a partition
- All events for a specific user route to the same partition
- High cardinality (many distinct user IDs) ensures even distribution
- Enables parallel processing across different users

**Hot Partition Mitigation:**
For high-volume "celebrity" users:
1. **Composite Key Strategy:** Use `userId|subKey` (e.g., `user123|0`, `user123|1`)
2. **Dedicated Partitions:** Allocate specific partitions for high-activity users
3. **Hash Distribution:** Map remaining users via hash partitioning

**Implementation Recommendations:**
- Monitor partition health and message latency regularly
- Use 12 partitions locally (development) for balance between parallelism and overhead
- Scale to 24-48 partitions in production based on user volume
- Implement consumer group scaling to match partition count

**Sources:**
- [Apache Kafka Partition Key Guide](https://www.confluent.io/learn/kafka-partition-key/)
- [Kafka Partitioning Strategies](https://www.redpanda.com/guides/kafka-tutorial-kafka-partition-strategy)
- [Kafka Topic Partitioning Best Practices](https://newrelic.com/blog/best-practices/effective-strategies-kafka-topic-partitioning)
- [Kafka Partitioning Performance Considerations](https://medium.com/@27.rahul.k/kafka-partitioning-key-performance-considerations-94e5e980bb6a)

---

## 2. Kafka Retention Policies

### Local vs Cloud Configuration

**Local Development (Minikube):**
- Retention: 7 days (`retention.ms=604800000`)
- Justification: Balance between debugging capability and storage constraints
- Persistent volumes required to survive pod restarts

**Cloud Production (Redpanda Cloud):**
- Retention: 30 days (`retention.ms=2592000000`)
- Justification: Compliance, auditing, and replay requirements
- Usage-based pricing makes longer retention economically viable

**Implementation Notes:**
- Configure per-topic retention via Kafka topic configurations
- Monitor storage consumption and adjust based on message volume
- Implement log compaction for stateful topics (if needed)

---

## 3. At-Least-Once Delivery Guarantees

### Dapr Pub/Sub Semantics

**Core Guarantee:** Dapr guarantees at-least-once delivery for all pub/sub components, including Kafka.

**Mechanism:**
1. Dapr acknowledges messages only after successful subscriber processing
2. Failed deliveries trigger automatic redelivery until success
3. Application crashes trigger message replay from last unacknowledged offset

**Consumer Idempotency Requirements:**
- **CRITICAL:** All event consumers MUST be idempotent
- Use event IDs/timestamps to deduplicate
- Store processing state in database transactions
- Implement idempotency keys for external API calls

**Configuration:**
```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: kafka-pubsub
spec:
  type: pubsub.kafka
  metadata:
    - name: consumerID
      value: "recurring-task-service"
    - name: clientID
      value: "recurring-task-consumer"
    - name: enableAutoCommit
      value: "false"  # Dapr controls offset commits
```

**Sources:**
- [Dapr Pub/Sub Overview](https://docs.dapr.io/developing-applications/building-blocks/pubsub/pubsub-overview/)
- [Dapr At-Least-Once Delivery](https://github.com/dapr/dapr/issues/6610)

---

## 4. Dead Letter Queue Patterns

### Dapr DLQ Implementation

**Capability:** Dapr provides dead letter topics even for systems (like Kafka) that don't natively support them.

**Recommended Architecture:**

**Primary Topics:**
- `task-operations` → DLQ: `task-events-dlq`
- `alerts` → DLQ: `alerts-dlq`
- `task-modifications` → DLQ: `updates-dlq`

**Retry Policy Integration:**
```yaml
apiVersion: dapr.io/v1alpha1
kind: Subscription
metadata:
  name: task-events-sub
spec:
  topic: task-operations
  route: /events/task-operation
  pubsubname: kafka-pubsub
  deadLetterTopic: task-events-dlq
  bulkSubscribe:
    enabled: true
    maxMessagesCount: 10
```

**Resiliency Policy (separate resource):**
```yaml
apiVersion: dapr.io/v1alpha1
kind: Resiliency
metadata:
  name: kafka-retry-policy
spec:
  policies:
    retries:
      pubsubRetry:
        policy: constant
        duration: 5s
        maxRetries: 3
  targets:
    components:
      kafka-pubsub:
        outbound:
          retry: pubsubRetry
```

**DLQ Processing Strategy:**
1. Separate consumer monitors DLQ topics
2. Logs errors to observability platform
3. Alerts on-call team for manual intervention
4. Supports replay after bug fixes

**Sources:**
- [Dapr Dead Letter Topics](https://docs.dapr.io/developing-applications/building-blocks/pubsub/pubsub-deadletter/)
- [Dapr Retry Policies](https://docs.dapr.io/operations/resiliency/policies/retries/retries-overview/)

---

## 5. Dapr Jobs API Behavior

### Scheduling Capabilities

**Purpose:** Orchestrate future jobs at specific times or intervals without polling.

**Schedule Formats:**
- **Cron:** `0 0 * * *` (midnight daily)
- **Systemd Timer:** `*-*-* 00:00:00`
- **Human-readable:** `@daily`, `@hourly`, `@every 30m`

**Delivery Guarantees:**
- **At-least-once execution** (bias towards durability over precision)
- Centralized, highly available scheduler service
- Persistent job state across restarts

**Retry Behavior:**
- **Default:** 3 retries with 1-second interval for client errors
- **Configurable:** Constant retry policy with custom `maxRetries` and `interval`
- **Unlimited retries:** Set `maxRetries: nil` (use with caution)

**Failure Policies:**
1. **Constant Policy:** Retries with fixed interval
   ```yaml
   failurePolicy:
     policy: constant
     maxRetries: 5
     interval: 10s
   ```

2. **Drop Policy:** Drops job after first failure (no retry)

**Non-Client Errors:**
Jobs that fail due to unavailable sidecars enter a staging queue and retry automatically when sidecars become available.

**Implementation for Recurring Tasks:**
```json
POST http://localhost:3500/v1.0-beta1/jobs/{name}
{
  "schedule": "@every 1h",
  "repeats": 0,  // infinite
  "data": {
    "userId": "user123",
    "taskId": "task456",
    "recurrencePattern": "daily"
  },
  "failurePolicy": {
    "policy": "constant",
    "maxRetries": 3,
    "interval": "5s"
  }
}
```

**Limitations:**
- **No exponential backoff** in Jobs API (only constant interval)
- Use Dapr Workflows if exponential backoff required
- Precision not guaranteed during high load (durability prioritized)

**Sources:**
- [Dapr Jobs Overview](https://docs.dapr.io/developing-applications/building-blocks/jobs/jobs-overview/)
- [Dapr Jobs API Reference](https://docs.dapr.io/reference/api/jobs_api/)
- [Tuning Dapr Scheduler for Production](https://www.diagrid.io/blog/tuning-dapr-scheduler-for-production)
- [Dapr Workflow Patterns](https://docs.dapr.io/developing-applications/building-blocks/workflow/workflow-patterns/)

---

## 6. Dapr Pub/Sub Semantics

### Core Concepts

**Abstraction Layer:** Dapr Pub/Sub provides cloud-agnostic messaging over Kafka, RabbitMQ, Azure Service Bus, etc.

**Key Features:**
1. **Topic-based routing** with declarative subscriptions
2. **CloudEvents envelope** for message metadata
3. **Bulk subscribe** for batched processing
4. **Message TTL** for automatic expiration
5. **Content-type negotiation** (JSON, Protobuf, etc.)

**Message Flow:**
```
Publisher → Dapr Sidecar → Kafka Broker → Dapr Sidecar → Subscriber
```

**Metadata Propagation:**
- `traceparent` for distributed tracing
- `user_id` for partitioning
- `event_type` for filtering
- `idempotency_key` for deduplication

**CloudEvents Envelope:**
```json
{
  "specversion": "1.0",
  "type": "task.completed",
  "source": "backend",
  "id": "event-123",
  "time": "2025-01-13T10:00:00Z",
  "datacontenttype": "application/json",
  "data": {
    "userId": "user123",
    "taskId": "task456"
  }
}
```

**Sources:**
- [Dapr Pub/Sub Overview](https://docs.dapr.io/developing-applications/building-blocks/pubsub/pubsub-overview/)
- [Dapr Pub/Sub API Reference](https://docs.dapr.io/reference/api/pubsub_api/)

---

## 7. Dapr Retry & Backoff Mechanisms

### Resiliency Policies

**Retry Policy Types:**

1. **Constant Backoff:**
   ```yaml
   policies:
     retries:
       constantRetry:
         policy: constant
         duration: 2s
         maxRetries: 5
   ```

2. **Exponential Backoff:**
   ```yaml
   policies:
     retries:
       exponentialRetry:
         policy: exponential
         maxInterval: 60s
         maxRetries: 10
   ```

**Application to Components:**
```yaml
targets:
  components:
    kafka-pubsub:
      outbound:
        retry: exponentialRetry
        timeout: 30s
        circuitBreaker: standardCB
```

**Circuit Breaker Integration:**
```yaml
circuitBreakers:
  standardCB:
    maxRequests: 3
    interval: 10s
    timeout: 30s
    trip: consecutiveFailures >= 5
```

**Best Practices:**
- Use exponential backoff for transient failures
- Combine with circuit breakers to prevent cascading failures
- Set reasonable `maxRetries` to avoid infinite loops
- Monitor retry metrics in Prometheus

**Sources:**
- [Dapr Retry Policies](https://docs.dapr.io/operations/resiliency/policies/retries/retries-overview/)

---

## 8. mTLS Security Model

### Zero Trust Architecture with Dapr

**Overview:** Dapr enables automatic mutual TLS between services without code changes.

**Configuration Levels:**

1. **Development (Disabled):**
   ```yaml
   apiVersion: dapr.io/v1alpha1
   kind: Configuration
   metadata:
     name: daprConfig
   spec:
     mtls:
       enabled: false
   ```

2. **Production (Enabled):**
   ```yaml
   spec:
     mtls:
       enabled: true
       workloadCertTTL: "24h"
       allowedClockSkew: "15m"
   ```

**Certificate Management:**
- Dapr generates and rotates certificates automatically
- Sentry service acts as certificate authority
- Certificates stored as Kubernetes secrets
- Short-lived certs (24h default) for security

**Service Invocation with mTLS:**
```
Backend → Dapr Sidecar (TLS handshake) → Dapr Sidecar → Recurring Service
```

**Network Policies (Layered Security):**
```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: backend-policy
spec:
  podSelector:
    matchLabels:
      app: backend
  ingress:
    - from:
        - podSelector:
            matchLabels:
              app: frontend
      ports:
        - protocol: TCP
          port: 8000
```

**AKS-Specific Recommendations:**
- Use Azure CNI for network policies
- Integrate with Azure Key Vault for external secrets
- Enable Azure Monitor for mTLS audit logs
- Use Azure Policy to enforce mTLS across clusters

**Sources:**
- [AKS Authentication & Security Best Practices (2025)](https://medium.com/@h.stoychev87/aks-authentication-and-authorization-a-comprehensive-guide-to-azure-caf-and-waf-part-1-c9d86c77cfbf)
- [AKS Security Checklist](https://www.the-aks-checklist.com/)
- [AKS Networking Best Practices (2025)](https://medium.com/@h.stoychev87/aks-azure-networking-and-services-best-practices-azure-caf-and-waf-2025-edition-part-3-9a342d9e2abd)

---

## 9. Azure Key Vault Integration

### Secrets Management with Dapr

**Component Configuration:**
```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: azurekeyvault
spec:
  type: secretstores.azure.keyvault
  version: v1
  metadata:
    - name: vaultName
      value: "todoapp-prod-kv"
    - name: azureEnvironment
      value: "AZUREPUBLICCLOUD"
    - name: azureTenantId
      secretKeyRef:
        name: tenant-id
        key: value
    - name: azureClientId
      secretKeyRef:
        name: client-id
        key: value
```

**Secret Access in Applications:**
```python
# Python FastAPI example
@app.get("/api/tasks")
async def get_tasks():
    # Dapr automatically fetches from Key Vault
    db_password = os.getenv("DATABASE_PASSWORD")
    # Use password...
```

**Security Best Practices:**
- Use Managed Identity (no client secrets)
- Enable RBAC on Key Vault
- Rotate secrets every 90 days
- Audit all secret access via Azure Monitor
- Use separate Key Vaults per environment (dev/staging/prod)

**Local Development:**
Use Kubernetes Secrets instead of Key Vault:
```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: local-secrets
spec:
  type: secretstores.kubernetes
  version: v1
```

**Sources:**
- [AKS Security Best Practices](https://www.wiz.io/academy/aks-security-best-practices)
- [Azure AKS Concepts - Security](https://learn.microsoft.com/en-us/azure/aks/concepts-security)

---

## 10. AKS Production Best Practices

### 2025 Cloud Adoption Framework (CAF) Alignment

**Cluster Configuration:**
- **Node Pools:** Separate pools for system (Dapr, monitoring) and user workloads
- **Autoscaling:** Enable cluster autoscaler and HPA (Horizontal Pod Autoscaler)
- **Availability Zones:** Deploy across 3 AZs for 99.99% SLA
- **VM SKUs:** Use Standard_D4s_v5 (4 vCPU, 16 GB RAM) minimum for production

**Networking:**
- **CNI:** Azure CNI for advanced networking features
- **Network Policies:** Calico or Azure Network Policies
- **Load Balancer:** Standard SKU for production
- **Ingress:** NGINX Ingress Controller with cert-manager for TLS

**Identity & Access:**
- **Managed Identity:** Azure AD Workload Identity for pod-to-Azure authentication
- **RBAC:** Kubernetes RBAC integrated with Azure AD
- **Pod Identity:** Avoid legacy aad-pod-identity (use Workload Identity)

**Observability:**
- **Monitoring:** Azure Monitor Container Insights
- **Logging:** Azure Log Analytics workspace
- **Tracing:** Integrate with Application Insights
- **Metrics:** Prometheus + Grafana for custom dashboards

**Cost Optimization:**
- **Spot Instances:** For non-critical batch workloads
- **Reserved Instances:** For predictable workloads (3-year commitment)
- **Rightsizing:** Monitor CPU/memory usage and adjust requests/limits
- **Storage:** Use managed disks with lifecycle policies

**Disaster Recovery:**
- **Backups:** Velero for cluster backup/restore
- **Multi-Region:** Document multi-region failover procedures
- **RTO/RPO:** Target RTO < 1 hour, RPO < 5 minutes for critical services

**Sources:**
- [AKS Best Practices (Microsoft Learn)](https://learn.microsoft.com/en-us/azure/aks/best-practices)
- [AKS Security Best Practices](https://www.tigera.io/learn/guides/kubernetes-security/aks-security/)
- [Mastering AKS Performance & Security](https://cloudnativenow.com/contributed-content/mastering-aks-performance-security-and-cost-optimization-in-the-cloud/)

---

## 11. Redpanda Cloud vs Apache Kafka

### Platform Selection for Phase V

**Redpanda Cloud Serverless (RECOMMENDED):**

**Advantages:**
- ✅ **Free Tier:** $300 credits for 30 days (no credit card for trial)
- ✅ **Kafka Compatibility:** 100% Kafka API compatible
- ✅ **Performance:** 10x lower latency, 3-6x cost efficiency vs Kafka
- ✅ **Resource Efficiency:** 3x fewer compute resources than Kafka
- ✅ **Managed Service:** No ZooKeeper, simplified operations
- ✅ **99.9% SLA** for Serverless tier

**Limitations:**
- ⚠️ Multi-tenant (Serverless) - dedicated clusters available separately
- ⚠️ Currently AWS-only for Serverless (Azure support in roadmap)

**Apache Kafka (Self-Hosted):**

**Advantages:**
- ✅ Free and open-source
- ✅ Full control over configuration
- ✅ Runs anywhere (Minikube, AKS, on-premises)

**Disadvantages:**
- ❌ Requires operational expertise (ZooKeeper, broker tuning)
- ❌ Higher resource consumption
- ❌ Manual scaling and monitoring setup
- ❌ No managed service for free

**Recommendation:**
- **Local Development (Minikube):** Self-hosted Kafka via Helm (Bitnami chart)
- **Cloud Production (AKS):** Redpanda Cloud Serverless
- **Migration Path:** Use Dapr Pub/Sub abstraction to swap brokers without code changes

**Sources:**
- [Redpanda Cloud Serverless](https://www.redpanda.com/product/serverless)
- [Redpanda vs Kafka TCO](https://www.redpanda.com/blog/is-redpanda-better-than-kafka-tco-comparison)
- [Apache Kafka vs Redpanda](https://www.confluent.io/redpanda-vs-kafka-vs-confluent/)

---

## Summary of Key Decisions

| **Aspect** | **Decision** | **Rationale** |
|------------|--------------|---------------|
| **Partitioning** | `user_id` as partition key | Maintains per-user ordering, high cardinality |
| **Retention** | 7 days local, 30 days cloud | Balance storage cost with debugging/compliance |
| **Delivery** | At-least-once with idempotent consumers | Dapr guarantee + consumer responsibility |
| **DLQs** | Separate DLQ per topic | Error isolation and targeted replay |
| **Scheduling** | Dapr Jobs API | Centralized, durable, no polling |
| **Retry** | Constant + exponential backoff | Context-appropriate based on failure type |
| **mTLS** | Enabled in production (Dapr) | Zero Trust security model |
| **Secrets** | Azure Key Vault (prod), K8s Secrets (local) | Managed rotation and audit |
| **Cluster** | AKS with 3 AZs | 99.99% availability SLA |
| **Messaging** | Redpanda Cloud + Dapr abstraction | Cost efficiency, managed service, migration flexibility |

---

## Next Steps

1. ✅ Research Complete
2. ⏭️ Write Technical Specification (`specs/011-enterprise-cloud-infra/spec.md`)
3. ⏭️ Generate Implementation Roadmap (`specs/011-enterprise-cloud-infra/plan.md`)
4. ⏭️ Break into Atomic Tasks (`specs/011-enterprise-cloud-infra/tasks.md`)
5. ⏭️ Delegate to `phase5-cloud-deployment-engineer` subagent

---

**Document Version:** 1.0
**Last Updated:** 2026-01-13
**Author:** Claude Code (Principal Cloud Architect)
