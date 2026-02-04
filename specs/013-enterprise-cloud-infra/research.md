# Research: Phase V Technology Decisions

**Date**: 2026-01-13 | **Phase**: Phase 0

---

## Key Technology Decisions

### 1. Dapr Jobs API for Scheduling
- **Choice**: Use Dapr Jobs API (v1.0-alpha1, stable in Dapr 1.15)
- **Why**: Eliminates database polling, distributed scheduling, graceful cancellation
- **API**: POST /v1.0-alpha1/jobs/{jobName} with schedule, data, failurePolicy
- **Pattern**: Job name = `notification-reminder-{task_id}-{offset}`

### 2. RRULE (RFC 5545) via python-dateutil
- **Choice**: python-dateutil library for RRULE parsing
- **Why**: Industry standard, handles edge cases (leap years, COUNT exhausted)
- **Patterns**: FREQ=DAILY|WEEKLY|MONTHLY|YEARLY, BYDAY, COUNT, UNTIL
- **Edge Cases**: rrule.after() returns None when COUNT/UNTIL exhausted → mark series inactive

### 3. Kafka Partitioning Strategy
- **Choice**: Partition by user_id hash, 12 partitions per topic
- **Why**: Guarantees per-user event ordering, enables 12 consumer instances
- **Formula**: 10,000 users / 12 partitions = ~833 users per partition
- **Implementation**: Dapr Pub/Sub handles partitioning via metadata

### 4. CloudEvents 1.0 Format
- **Required Fields**: specversion, id (UUID), source, type, time, datacontenttype, data
- **Naming**: com.todoapp.{entity}.{action} (e.g., com.todoapp.task.completed)
- **Why**: Standardized envelope, schema validation, interoperability

### 5. Communication Pattern
- **Choice**: Event-driven via Dapr Pub/Sub (NO direct Kafka clients)
- **Why**: Specification constraint, vendor-neutral, automatic retries, mTLS
- **Rejected**: Direct HTTP (tight coupling), direct Kafka (violates constraint)

### 6. Idempotency Pattern
- **Choice**: Event ID deduplication + database unique constraints
- **Implementation**: Check event_id in processed_events table, UNIQUE(series_id, due_date) on tasks
- **Why**: At-least-once delivery with deduplication prevents duplicates

### 7. Secrets Management
- **Production**: Azure Key Vault via Dapr secretstore (managed identity, no client secrets)
- **Local**: Kubernetes Secrets via Dapr secretstore
- **Why**: Dapr abstraction allows environment-agnostic code

---

## Reference Documentation

- Dapr Jobs API: https://docs.dapr.io/developing-applications/building-blocks/jobs/
- python-dateutil: https://dateutil.readthedocs.io/en/stable/rrule.html
- RFC 5545 (RRULE): https://datatracker.ietf.org/doc/html/rfc5545#section-3.3.10
- CloudEvents Spec: https://github.com/cloudevents/spec/blob/v1.0.2/cloudevents/spec.md
- Kafka Partitioning: https://kafka.apache.org/documentation/#intro_concepts_and_terms

---

**Status**: Research complete. Ready for data model design.
