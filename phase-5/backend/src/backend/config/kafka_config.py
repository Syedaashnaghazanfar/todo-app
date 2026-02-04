"""
Kafka Topic Configuration for Phase V Event-Driven Architecture

Topic Strategy:
- 3 primary topics: task-operations, alerts, task-modifications
- 3 DLQ topics: task-operations-dlq, alerts-dlq, task-modifications-dlq
- 12 partitions per primary topic (supports 12 consumer instances)
- 1 partition per DLQ topic (manual investigation required)
- Partitioning: Hash of user_id for per-user ordering guarantees
- Retention: 30 days production, 7 days local

Consumer Groups:
- recurring-task-service: Consumes task-operations (task.completed events)
- notification-service: Consumes alerts (alert.scheduled events)
"""

import hashlib
import os
from typing import Literal

# Kafka broker configuration (override via environment variables)
KAFKA_BROKERS = os.getenv("KAFKA_BROKERS", "localhost:9092").split(",")
KAFKA_SASL_USERNAME = os.getenv("KAFKA_SASL_USERNAME", "")
KAFKA_SASL_PASSWORD = os.getenv("KAFKA_SASL_PASSWORD", "")
KAFKA_SASL_MECHANISM = os.getenv("KAFKA_SASL_MECHANISM", "SCRAM-SHA-256")
KAFKA_SECURITY_PROTOCOL = os.getenv("KAFKA_SECURITY_PROTOCOL", "PLAINTEXT")

# Topic names
TOPIC_TASK_OPERATIONS = "task-operations"
TOPIC_ALERTS = "alerts"
TOPIC_TASK_MODIFICATIONS = "task-modifications"

# DLQ topic names
TOPIC_TASK_OPERATIONS_DLQ = "task-operations-dlq"
TOPIC_ALERTS_DLQ = "alerts-dlq"
TOPIC_TASK_MODIFICATIONS_DLQ = "task-modifications-dlq"

# Partition configuration
PARTITIONS_PER_TOPIC = 12  # Supports up to 12 consumer instances per service
REPLICATION_FACTOR = int(os.getenv("KAFKA_REPLICATION_FACTOR", "1"))  # 1 local, 3 production

# Retention configuration
RETENTION_MS_PRODUCTION = 30 * 24 * 60 * 60 * 1000  # 30 days
RETENTION_MS_LOCAL = 7 * 24 * 60 * 60 * 1000  # 7 days
RETENTION_MS = int(
    os.getenv("KAFKA_RETENTION_MS", str(RETENTION_MS_LOCAL))
)  # Default to local

# Consumer group names
CONSUMER_GROUP_RECURRING = "recurring-task-service-group"
CONSUMER_GROUP_NOTIFICATION = "notification-service-group"

# Event types mapped to topics
EVENT_TYPE_TO_TOPIC = {
    "task.created": TOPIC_TASK_OPERATIONS,
    "task.completed": TOPIC_TASK_OPERATIONS,
    "task.deleted": TOPIC_TASK_OPERATIONS,
    "task.updated": TOPIC_TASK_MODIFICATIONS,
    "alert.scheduled": TOPIC_ALERTS,
    "alert.cancelled": TOPIC_ALERTS,
}


def get_topic_for_event_type(event_type: str) -> str:
    """
    Get Kafka topic name for a given event type

    Args:
        event_type: CloudEvents type (e.g., task.created, alert.scheduled)

    Returns:
        Kafka topic name

    Raises:
        ValueError: If event type is unknown
    """
    topic = EVENT_TYPE_TO_TOPIC.get(event_type)
    if not topic:
        raise ValueError(f"Unknown event type: {event_type}")
    return topic


def calculate_partition_key(user_id: str) -> int:
    """
    Calculate Kafka partition for a given user_id using consistent hashing

    Ensures all events for the same user_id go to the same partition,
    maintaining per-user ordering guarantees.

    Args:
        user_id: User identifier

    Returns:
        Partition number (0 to PARTITIONS_PER_TOPIC - 1)
    """
    # Use MD5 hash for consistent partition distribution
    hash_value = int(hashlib.md5(user_id.encode()).hexdigest(), 16)
    return hash_value % PARTITIONS_PER_TOPIC


def get_dlq_topic(primary_topic: str) -> str:
    """
    Get DLQ topic name for a primary topic

    Args:
        primary_topic: Primary topic name

    Returns:
        DLQ topic name

    Raises:
        ValueError: If primary topic is unknown
    """
    dlq_mapping = {
        TOPIC_TASK_OPERATIONS: TOPIC_TASK_OPERATIONS_DLQ,
        TOPIC_ALERTS: TOPIC_ALERTS_DLQ,
        TOPIC_TASK_MODIFICATIONS: TOPIC_TASK_MODIFICATIONS_DLQ,
    }
    dlq_topic = dlq_mapping.get(primary_topic)
    if not dlq_topic:
        raise ValueError(f"No DLQ topic defined for: {primary_topic}")
    return dlq_topic


# Kafka topic creation configurations (for scripts/create-kafka-topics.sh)
TOPIC_CONFIGS = {
    TOPIC_TASK_OPERATIONS: {
        "partitions": PARTITIONS_PER_TOPIC,
        "replication_factor": REPLICATION_FACTOR,
        "config": {
            "retention.ms": str(RETENTION_MS),
            "compression.type": "snappy",
            "max.message.bytes": "1048576",  # 1MB
        },
    },
    TOPIC_ALERTS: {
        "partitions": PARTITIONS_PER_TOPIC,
        "replication_factor": REPLICATION_FACTOR,
        "config": {
            "retention.ms": str(RETENTION_MS),
            "compression.type": "snappy",
            "max.message.bytes": "1048576",  # 1MB
        },
    },
    TOPIC_TASK_MODIFICATIONS: {
        "partitions": PARTITIONS_PER_TOPIC,
        "replication_factor": REPLICATION_FACTOR,
        "config": {
            "retention.ms": str(RETENTION_MS),
            "compression.type": "snappy",
            "max.message.bytes": "1048576",  # 1MB
        },
    },
    TOPIC_TASK_OPERATIONS_DLQ: {
        "partitions": 1,  # Single partition for DLQ (manual investigation)
        "replication_factor": REPLICATION_FACTOR,
        "config": {
            "retention.ms": str(RETENTION_MS_PRODUCTION),  # Always keep DLQ longer
            "compression.type": "snappy",
        },
    },
    TOPIC_ALERTS_DLQ: {
        "partitions": 1,
        "replication_factor": REPLICATION_FACTOR,
        "config": {
            "retention.ms": str(RETENTION_MS_PRODUCTION),
            "compression.type": "snappy",
        },
    },
    TOPIC_TASK_MODIFICATIONS_DLQ: {
        "partitions": 1,
        "replication_factor": REPLICATION_FACTOR,
        "config": {
            "retention.ms": str(RETENTION_MS_PRODUCTION),
            "compression.type": "snappy",
        },
    },
}
