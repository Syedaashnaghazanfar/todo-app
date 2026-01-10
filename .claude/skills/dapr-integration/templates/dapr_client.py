"""
Dapr Client Template - Complete Dapr integration with all 5 building blocks.

This template provides a complete Dapr client implementation for Phase V.
Copy this file to your project and customize as needed.
"""

import httpx
from typing import Dict, List, Optional, Any
from datetime import datetime
import uuid


class DaprClient:
    """
    Complete Dapr client with all 5 building blocks:
    1. Pub/Sub (Kafka)
    2. State Store (PostgreSQL)
    3. Jobs API (Scheduled reminders)
    4. Secrets Management (Kubernetes/Cloud vaults)
    5. Service Invocation (mTLS)
    """
    
    def __init__(
        self,
        dapr_port: int = 3500,
        pubsub_name: str = "kafka-pubsub",
        state_store_name: str = "statestore",
        secrets_store_name: str = "kubernetes-secrets"
    ):
        self.dapr_url = f"http://localhost:{dapr_port}"
        self.pubsub_name = pubsub_name
        self.state_store_name = state_store_name
        self.secrets_store_name = secrets_store_name
    
    # ==================== Pub/Sub (Building Block 1) ====================
    
    async def publish_event(
        self,
        topic: str,
        event_data: Dict[str, Any],
        user_id: Optional[str] = None
    ) -> None:
        """
        Publish event to Kafka topic via Dapr Pub/Sub.
        
        Args:
            topic: Kafka topic name (e.g., "task-events", "reminders")
            event_data: Event payload (must include user_id for partitioning)
            user_id: User ID for partitioning (if not in event_data)
        """
        # Ensure user_id is in event
        if user_id and "user_id" not in event_data:
            event_data["user_id"] = user_id
        
        if "event_id" not in event_data:
            event_data["event_id"] = str(uuid.uuid4())
        
        if "timestamp" not in event_data:
            event_data["timestamp"] = datetime.utcnow().isoformat() + "Z"
        
        url = f"{self.dapr_url}/v1.0/publish/{self.pubsub_name}/{topic}"
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                url,
                json=event_data,
                headers={"Content-Type": "application/json"}
            )
            response.raise_for_status()
    
    # ==================== State Store (Building Block 2) ====================
    
    async def save_state(
        self,
        key: str,
        value: Dict[str, Any]
    ) -> None:
        """
        Save state to Dapr State Store.
        
        Args:
            key: State key (e.g., "conversation-{user_id}-{conversation_id}")
            value: State value (dict)
        """
        url = f"{self.dapr_url}/v1.0/state/{self.state_store_name}"
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                url,
                json=[{"key": key, "value": value}],
                headers={"Content-Type": "application/json"}
            )
            response.raise_for_status()
    
    async def get_state(
        self,
        key: str
    ) -> Optional[Dict[str, Any]]:
        """
        Get state from Dapr State Store.
        
        Args:
            key: State key
            
        Returns:
            State value or None if not found
        """
        url = f"{self.dapr_url}/v1.0/state/{self.state_store_name}/{key}"
        
        async with httpx.AsyncClient() as client:
            response = await client.get(url)
            if response.status_code == 404:
                return None
            response.raise_for_status()
            return response.json()
    
    async def delete_state(self, key: str) -> None:
        """Delete state from Dapr State Store."""
        url = f"{self.dapr_url}/v1.0/state/{self.state_store_name}/{key}"
        
        async with httpx.AsyncClient() as client:
            response = await client.delete(url)
            response.raise_for_status()
    
    # ==================== Jobs API (Building Block 3) ====================
    
    async def schedule_job(
        self,
        job_name: str,
        due_time: str | None = None,  # ISO 8601 format: "2025-12-29T16:00:00Z" or RFC3339
        schedule: str | None = None,  # Cron expression or "@every 1m" format
        data: Dict[str, Any] | str | None = None,  # Job payload (JSON serialized string or dict)
        repeats: int | None = None,  # Number of times to repeat
        ttl: str | None = None  # Time to live (RFC3339 or Go duration string)
    ) -> None:
        """
        Schedule a job using Dapr Jobs API.
        
        Args:
            job_name: Unique job identifier (e.g., "reminder-task-123")
            due_time: Optional one-time execution time (ISO 8601/RFC3339 format)
            schedule: Optional recurring schedule (cron or "@every 1m" format)
            data: Optional job payload (dict will be JSON serialized, or pass string)
            repeats: Optional number of times to repeat
            ttl: Optional time to live for the job
            
        Note: At least one of `dueTime` or `schedule` must be provided.
        """
        url = f"{self.dapr_url}/v1.0-alpha1/jobs/{job_name}"
        
        # Prepare request body
        request_body: Dict[str, Any] = {}
        
        if due_time:
            request_body["dueTime"] = due_time
        if schedule:
            request_body["schedule"] = schedule
        if data:
            # If data is a dict, serialize it to JSON string (as per Dapr API)
            if isinstance(data, dict):
                import json
                request_body["data"] = json.dumps(data)
            else:
                request_body["data"] = data
        if repeats is not None:
            request_body["repeats"] = repeats
        if ttl:
            request_body["ttl"] = ttl
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                url,
                json=request_body,
                headers={"Content-Type": "application/json"}
            )
            response.raise_for_status()
    
    # ==================== Secrets (Building Block 4) ====================
    
    async def get_secret(
        self,
        secret_name: str,
        key: Optional[str] = None
    ) -> str | Dict[str, Any]:
        """
        Get secret from Dapr Secrets API.
        
        Args:
            secret_name: Secret name in secret store
            key: Optional key within secret (if secret is a dict)
            
        Returns:
            Secret value (string if key provided, dict if not)
            
        Note: Dapr Secrets API returns secrets directly as a dict (for Kubernetes)
        or as a single value (for Vault). The response format depends on the
        secret store type.
        """
        url = f"{self.dapr_url}/v1.0/secrets/{self.secrets_store_name}/{secret_name}"
        
        # Add key as query parameter if provided
        if key:
            url += f"?key={key}"
        
        async with httpx.AsyncClient() as client:
            response = await client.get(url)
            response.raise_for_status()
            secrets = response.json()
            
            # For Kubernetes secrets, response is a dict like {"key1": "value1", "key2": "value2"}
            # For Vault, response is like {"secret-name": "value"}
            if key:
                # If key provided, return specific value
                return secrets.get(key) if isinstance(secrets, dict) else secrets
            return secrets
    
    # ==================== Service Invocation (Building Block 5) ====================
    
    async def invoke_service(
        self,
        app_id: str,
        method: str,
        data: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Invoke another service via Dapr Service Invocation (with mTLS).
        
        Args:
            app_id: Dapr app ID of target service
            method: API method path (e.g., "api/tasks")
            data: Optional request payload
            
        Returns:
            Service response (dict)
        """
        url = f"{self.dapr_url}/v1.0/invoke/{app_id}/method/{method}"
        
        async with httpx.AsyncClient() as client:
            if data:
                response = await client.post(url, json=data)
            else:
                response = await client.get(url)
            response.raise_for_status()
            return response.json()


# ==================== Usage Examples ====================

async def example_usage():
    """Example usage of DaprClient."""
    dapr = DaprClient()
    
    # 1. Publish event
    await dapr.publish_event(
        topic="task-events",
        event_data={
            "event_type": "task.completed",
            "task_id": 123,
            "user_id": "user-456"
        }
    )
    
    # 2. Save state
    await dapr.save_state(
        key="conversation-user-456-conv-123",
        value={
            "conversation_id": "conv-123",
            "user_id": "user-456",
            "messages": [
                {"role": "user", "content": "Create a task"},
                {"role": "assistant", "content": "Task created"}
            ]
        }
    )
    
    # 3. Schedule reminder
    await dapr.schedule_job(
        job_name="reminder-task-123",
        due_time="2025-12-29T16:00:00Z",
        data={
            "type": "reminder",
            "task_id": 123,
            "user_id": "user-456"
        }
    )
    
    # 4. Get secret
    db_password = await dapr.get_secret("database-credentials", "password")
    
    # 5. Invoke service
    result = await dapr.invoke_service(
        app_id="backend",
        method="api/tasks",
        data={"task_id": 123}
    )

