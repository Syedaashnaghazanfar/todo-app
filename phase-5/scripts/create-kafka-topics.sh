#!/bin/bash
# Create Kafka Topics for Phase V Event-Driven Architecture
#
# Usage: ./scripts/create-kafka-topics.sh [KAFKA_POD_NAME]
# Default KAFKA_POD_NAME: kafka-0 (Bitnami Helm chart default)

set -e

KAFKA_POD="${1:-kafka-0}"
BOOTSTRAP_SERVER="localhost:9092"

echo "🚀 Creating Kafka topics in pod: $KAFKA_POD"

# Function to create a topic
create_topic() {
    local topic_name=$1
    local partitions=$2
    local replication_factor=$3
    local retention_ms=$4

    echo "📝 Creating topic: $topic_name (partitions=$partitions, replication=$replication_factor, retention=${retention_ms}ms)"

    kubectl exec -it "$KAFKA_POD" -- kafka-topics.sh \
        --create \
        --bootstrap-server "$BOOTSTRAP_SERVER" \
        --topic "$topic_name" \
        --partitions "$partitions" \
        --replication-factor "$replication_factor" \
        --config "retention.ms=$retention_ms" \
        --config "compression.type=snappy" \
        --config "max.message.bytes=1048576" \
        --if-not-exists

    echo "✅ Topic $topic_name created successfully"
}

# Retention times
RETENTION_7_DAYS=$((7 * 24 * 60 * 60 * 1000))   # 7 days for local
RETENTION_30_DAYS=$((30 * 24 * 60 * 60 * 1000)) # 30 days for DLQ

echo ""
echo "Creating primary topics (12 partitions each)..."
echo "================================================"

# Primary topics (12 partitions for horizontal scaling)
create_topic "task-operations" 12 1 "$RETENTION_7_DAYS"
create_topic "alerts" 12 1 "$RETENTION_7_DAYS"
create_topic "task-modifications" 12 1 "$RETENTION_7_DAYS"

echo ""
echo "Creating DLQ topics (1 partition each)..."
echo "=========================================="

# DLQ topics (1 partition for manual investigation)
create_topic "task-operations-dlq" 1 1 "$RETENTION_30_DAYS"
create_topic "alerts-dlq" 1 1 "$RETENTION_30_DAYS"
create_topic "task-modifications-dlq" 1 1 "$RETENTION_30_DAYS"

echo ""
echo "📋 Listing all topics:"
kubectl exec -it "$KAFKA_POD" -- kafka-topics.sh \
    --list \
    --bootstrap-server "$BOOTSTRAP_SERVER"

echo ""
echo "🎉 All Kafka topics created successfully!"
echo ""
echo "To verify topic details, run:"
echo "  kubectl exec -it $KAFKA_POD -- kafka-topics.sh --describe --bootstrap-server $BOOTSTRAP_SERVER --topic task-operations"
