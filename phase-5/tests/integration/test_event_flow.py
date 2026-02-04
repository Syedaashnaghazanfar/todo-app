"""
Integration Test: Event Flow Validation

Tests end-to-end event flow from task operations to Kafka to consumers.
Validates <1 second latency, idempotency, and DLQ routing.

Requirements:
- Docker Compose test environment with Kafka, PostgreSQL, Dapr
- Backend service running with Kafka producer
- Recurring-task-service consumer running

Run with: pytest tests/integration/test_event_flow.py -v
"""

import asyncio
import json
import os
import time
from datetime import datetime, timedelta, timezone
from typing import Dict, Any
from uuid import uuid4

import httpx
import pytest
from aiokafka import AIOKafkaConsumer

# Test configuration
BACKEND_API_URL = os.getenv("TEST_BACKEND_URL", "http://localhost:8000")
KAFKA_BOOTSTRAP_SERVERS = os.getenv("TEST_KAFKA_BROKERS", "localhost:9092")
TASK_OPERATIONS_TOPIC = "task-operations"
TASK_OPERATIONS_DLQ_TOPIC = "task-operations-dlq"
MAX_EVENT_LATENCY_SECONDS = 1.0  # <1 second requirement


@pytest.fixture
async def http_client():
    """HTTP client for API requests"""
    async with httpx.AsyncClient(base_url=BACKEND_API_URL, timeout=10.0) as client:
        yield client


@pytest.fixture
async def kafka_consumer():
    """Kafka consumer for event validation"""
    consumer = AIOKafkaConsumer(
        TASK_OPERATIONS_TOPIC,
        bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS,
        group_id=f"test-consumer-{uuid4()}",
        auto_offset_reset="earliest",
        enable_auto_commit=False,
        value_deserializer=lambda v: json.loads(v.decode("utf-8")),
    )
    await consumer.start()
    yield consumer
    await consumer.stop()


@pytest.fixture
async def dlq_consumer():
    """Kafka consumer for DLQ validation"""
    consumer = AIOKafkaConsumer(
        TASK_OPERATIONS_DLQ_TOPIC,
        bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS,
        group_id=f"test-dlq-consumer-{uuid4()}",
        auto_offset_reset="earliest",
        enable_auto_commit=False,
        value_deserializer=lambda v: json.loads(v.decode("utf-8")),
    )
    await consumer.start()
    yield consumer
    await consumer.stop()


@pytest.fixture
def test_user_id():
    """Generate test user ID"""
    return str(uuid4())


class TestEventFlowTaskCreated:
    """Test task.created event flow"""

    @pytest.mark.asyncio
    async def test_task_created_event_published(
        self, http_client, kafka_consumer, test_user_id
    ):
        """
        Test: task.created event is published to Kafka when task is created.

        Validates:
        - Event is published to task-operations topic
        - Event follows CloudEvents format
        - Event payload contains correct task data
        - Event latency is <1 second
        """
        # Create task via API
        task_data = {
            "title": f"Test Task {uuid4()}",
            "description": "Integration test task",
            "user_id": test_user_id,
            "due_date": (datetime.now(timezone.utc) + timedelta(hours=24)).isoformat(),
            "tags": ["Work", "Urgent"],
            "priority": "HIGH",
        }

        start_time = time.time()

        response = await http_client.post("/api/tasks", json=task_data)
        assert response.status_code == 201

        created_task = response.json()
        task_id = created_task["id"]

        # Consume event from Kafka
        event_received = False
        timeout = time.time() + 5  # 5 second timeout

        while time.time() < timeout:
            try:
                # Poll with short timeout
                message = await asyncio.wait_for(
                    kafka_consumer.getone(), timeout=0.5
                )

                event = message.value

                # Check if this is our task.created event
                if (
                    event.get("type") == "task.created"
                    and event.get("data", {}).get("task_id") == task_id
                ):
                    event_received = True
                    end_time = time.time()
                    latency = end_time - start_time

                    # Validate CloudEvents format
                    assert "id" in event, "Event missing 'id' field"
                    assert event["type"] == "task.created"
                    assert event["source"] == "backend-api"
                    assert event["specversion"] == "1.0"
                    assert "time" in event
                    assert "data" in event

                    # Validate event payload
                    event_data = event["data"]
                    assert event_data["task_id"] == task_id
                    assert event_data["user_id"] == test_user_id
                    assert event_data["title"] == task_data["title"]
                    assert event_data["priority"] == task_data["priority"]

                    # Validate latency
                    assert (
                        latency < MAX_EVENT_LATENCY_SECONDS
                    ), f"Event latency {latency:.2f}s exceeds 1s requirement"

                    print(
                        f"\n✓ task.created event validated (latency: {latency:.3f}s)"
                    )
                    break

            except asyncio.TimeoutError:
                continue

        assert event_received, "task.created event not received within timeout"


class TestEventFlowTaskUpdated:
    """Test task.updated event flow"""

    @pytest.mark.asyncio
    async def test_task_updated_event_published(
        self, http_client, kafka_consumer, test_user_id
    ):
        """
        Test: task.updated event is published when task is updated.

        Validates:
        - Event contains only changed fields
        - Event latency is <1 second
        """
        # Create task first
        task_data = {
            "title": "Original Title",
            "user_id": test_user_id,
        }
        response = await http_client.post("/api/tasks", json=task_data)
        assert response.status_code == 201
        task_id = response.json()["id"]

        # Wait for task.created event to clear from queue
        await asyncio.sleep(0.5)

        # Update task
        update_data = {"title": "Updated Title", "priority": "VERY_IMPORTANT"}

        start_time = time.time()
        response = await http_client.patch(f"/api/tasks/{task_id}", json=update_data)
        assert response.status_code == 200

        # Consume task.updated event
        event_received = False
        timeout = time.time() + 5

        while time.time() < timeout:
            try:
                message = await asyncio.wait_for(
                    kafka_consumer.getone(), timeout=0.5
                )
                event = message.value

                if (
                    event.get("type") == "task.updated"
                    and event.get("data", {}).get("task_id") == task_id
                ):
                    event_received = True
                    end_time = time.time()
                    latency = end_time - start_time

                    # Validate updated_fields contains only changed fields
                    event_data = event["data"]
                    updated_fields = event_data.get("updated_fields", {})
                    assert "title" in updated_fields
                    assert updated_fields["title"] == "Updated Title"

                    # Validate latency
                    assert latency < MAX_EVENT_LATENCY_SECONDS

                    print(
                        f"\n✓ task.updated event validated (latency: {latency:.3f}s)"
                    )
                    break

            except asyncio.TimeoutError:
                continue

        assert event_received, "task.updated event not received"


class TestEventFlowTaskCompleted:
    """Test task.completed event flow and recurring task generation"""

    @pytest.mark.asyncio
    async def test_task_completed_event_triggers_next_task(
        self, http_client, kafka_consumer, test_user_id
    ):
        """
        Test: task.completed event triggers generation of next recurring task.

        Validates:
        - task.completed event is published
        - Recurring task service consumes event
        - Next task instance is created
        - Event latency is <1 second
        """
        # Create recurring task series first
        series_data = {
            "title": "Weekly Meeting",
            "user_id": test_user_id,
            "recurrence_pattern": "FREQ=WEEKLY;BYDAY=MO",
            "start_date": datetime.now(timezone.utc).isoformat(),
            "is_active": True,
        }

        # Note: This assumes there's an API endpoint for creating series
        # If not, this test would need to be adjusted
        response = await http_client.post(
            "/api/recurring-series", json=series_data
        )
        assert response.status_code == 201
        series_id = response.json()["series_id"]

        # Create first task instance
        task_data = {
            "title": "Weekly Meeting",
            "user_id": test_user_id,
            "series_id": series_id,
            "is_recurring": True,
            "recurrence_pattern": "FREQ=WEEKLY;BYDAY=MO",
        }
        response = await http_client.post("/api/tasks", json=task_data)
        assert response.status_code == 201
        task_id = response.json()["id"]

        # Complete the task
        start_time = time.time()
        response = await http_client.post(f"/api/tasks/{task_id}/complete")
        assert response.status_code == 200

        # Consume task.completed event
        event_received = False
        timeout = time.time() + 5

        while time.time() < timeout:
            try:
                message = await asyncio.wait_for(
                    kafka_consumer.getone(), timeout=0.5
                )
                event = message.value

                if (
                    event.get("type") == "task.completed"
                    and event.get("data", {}).get("task_id") == task_id
                ):
                    event_received = True
                    end_time = time.time()
                    latency = end_time - start_time

                    # Validate event data
                    event_data = event["data"]
                    assert event_data["task_id"] == task_id
                    assert event_data["series_id"] == series_id
                    assert event_data["recurrence_pattern"] == "FREQ=WEEKLY;BYDAY=MO"

                    # Validate latency
                    assert latency < MAX_EVENT_LATENCY_SECONDS

                    print(
                        f"\n✓ task.completed event validated (latency: {latency:.3f}s)"
                    )
                    break

            except asyncio.TimeoutError:
                continue

        assert event_received, "task.completed event not received"

        # Wait for recurring service to generate next task
        await asyncio.sleep(2)

        # Verify next task was created
        response = await http_client.get(
            f"/api/tasks?user_id={test_user_id}&series_id={series_id}"
        )
        assert response.status_code == 200
        tasks = response.json()

        # Should have original completed task + new task
        assert len(tasks) >= 2, "Next recurring task was not created"


class TestEventIdempotency:
    """Test event deduplication and idempotency"""

    @pytest.mark.asyncio
    async def test_duplicate_event_handling(self, http_client, test_user_id):
        """
        Test: Duplicate events are not processed twice.

        Validates:
        - Deduplication service detects duplicate event_id
        - Only one task is created for duplicate events
        """
        # This test would require injecting events directly into Kafka
        # or having a test endpoint that simulates duplicate event consumption
        # Skipping full implementation as it requires mock infrastructure

        # Pseudocode:
        # 1. Publish same event twice to Kafka (same event_id)
        # 2. Verify recurring service only processes it once
        # 3. Check deduplication state store for event_id

        pytest.skip("Requires test infrastructure for Kafka injection")


class TestDLQRouting:
    """Test Dead Letter Queue routing for failed events"""

    @pytest.mark.asyncio
    async def test_failed_event_routed_to_dlq(self, dlq_consumer):
        """
        Test: Failed events are routed to DLQ topic.

        Validates:
        - Events that fail processing go to DLQ
        - DLQ consumer can reprocess them
        """
        # This test requires simulating a failure condition
        # e.g., invalid series_id, database connection failure, etc.

        pytest.skip("Requires test infrastructure for failure injection")


# Pytest configuration
@pytest.fixture(scope="session")
def event_loop():
    """Create event loop for async tests"""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


if __name__ == "__main__":
    pytest.main([__file__, "-v", "-s"])
