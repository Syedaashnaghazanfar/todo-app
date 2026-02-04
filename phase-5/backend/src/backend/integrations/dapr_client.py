"""
Dapr HTTP Client for Phase V Event-Driven Architecture

Provides abstraction layer for:
- Pub/Sub (publish events to Kafka via Dapr)
- Secrets (retrieve secrets from Azure Key Vault / K8s Secrets)
- State (get/set conversation history in PostgreSQL state store)
- Service Invocation (call other microservices via Dapr mTLS)

All Dapr API calls use HTTP (not gRPC) for simplicity.
Dapr sidecar runs on localhost:3500 by default.
"""

import os
from typing import Any, Dict, Optional
from uuid import UUID

import httpx
import structlog
from pydantic import BaseModel

logger = structlog.get_logger(__name__)

# Dapr sidecar configuration
DAPR_HTTP_PORT = int(os.getenv("DAPR_HTTP_PORT", "3500"))
DAPR_GRPC_PORT = int(os.getenv("DAPR_GRPC_PORT", "50001"))
DAPR_BASE_URL = f"http://localhost:{DAPR_HTTP_PORT}"

# Dapr component names (must match Helm chart templates)
PUBSUB_NAME = os.getenv("DAPR_PUBSUB_NAME", "pubsub-kafka")
SECRETSTORE_NAME = os.getenv("DAPR_SECRETSTORE_NAME", "secretstore")
STATESTORE_NAME = os.getenv("DAPR_STATESTORE_NAME", "statestore-postgres")


class DaprClient:
    """HTTP client for Dapr sidecar APIs"""

    def __init__(self, base_url: str = DAPR_BASE_URL, timeout: int = 30):
        self.base_url = base_url
        self.timeout = timeout
        self.client = httpx.AsyncClient(base_url=base_url, timeout=timeout)

    async def close(self):
        """Close HTTP client"""
        await self.client.aclose()

    # ============================
    # Pub/Sub API
    # ============================

    async def publish_event(
        self, topic: str, data: Dict[str, Any], pubsub_name: str = PUBSUB_NAME
    ) -> bool:
        """
        Publish event to Kafka topic via Dapr Pub/Sub

        Args:
            topic: Kafka topic name (task-operations, alerts, task-modifications)
            data: Event payload (CloudEvents format)
            pubsub_name: Dapr Pub/Sub component name

        Returns:
            True if published successfully, False otherwise
        """
        url = f"/v1.0/publish/{pubsub_name}/{topic}"
        try:
            response = await self.client.post(url, json=data)
            response.raise_for_status()
            logger.info(
                "event_published",
                topic=topic,
                event_id=data.get("id"),
                event_type=data.get("type"),
            )
            return True
        except httpx.HTTPStatusError as e:
            logger.error(
                "event_publish_failed",
                topic=topic,
                event_id=data.get("id"),
                status_code=e.response.status_code,
                error=str(e),
            )
            return False
        except Exception as e:
            logger.error("event_publish_error", topic=topic, error=str(e))
            return False

    # ============================
    # Secrets API
    # ============================

    async def get_secret(
        self, secret_key: str, secretstore_name: str = SECRETSTORE_NAME
    ) -> Optional[str]:
        """
        Retrieve secret from Azure Key Vault / K8s Secrets via Dapr

        Args:
            secret_key: Secret name (e.g., DATABASE_URL, KAFKA_PASSWORD)
            secretstore_name: Dapr Secrets component name

        Returns:
            Secret value or None if not found
        """
        url = f"/v1.0/secrets/{secretstore_name}/{secret_key}"
        try:
            response = await self.client.get(url)
            response.raise_for_status()
            secrets = response.json()
            # Dapr returns secrets as {"secret_key": "secret_value"}
            return secrets.get(secret_key)
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 404:
                logger.warning("secret_not_found", secret_key=secret_key)
                return None
            logger.error(
                "secret_retrieval_failed",
                secret_key=secret_key,
                status_code=e.response.status_code,
                error=str(e),
            )
            return None
        except Exception as e:
            logger.error("secret_retrieval_error", secret_key=secret_key, error=str(e))
            return None

    async def get_bulk_secrets(
        self, secretstore_name: str = SECRETSTORE_NAME
    ) -> Dict[str, str]:
        """
        Retrieve all secrets from secret store

        Returns:
            Dictionary of secret key-value pairs
        """
        url = f"/v1.0/secrets/{secretstore_name}/bulk"
        try:
            response = await self.client.get(url)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error("bulk_secrets_retrieval_error", error=str(e))
            return {}

    # ============================
    # State API
    # ============================

    async def get_state(
        self, key: str, statestore_name: str = STATESTORE_NAME
    ) -> Optional[Dict[str, Any]]:
        """
        Retrieve state from PostgreSQL state store via Dapr

        Args:
            key: State key (e.g., conversation:{user_id})
            statestore_name: Dapr State component name

        Returns:
            State value or None if not found
        """
        url = f"/v1.0/state/{statestore_name}/{key}"
        try:
            response = await self.client.get(url)
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 404:
                return None
            logger.error(
                "state_retrieval_failed",
                key=key,
                status_code=e.response.status_code,
                error=str(e),
            )
            return None
        except Exception as e:
            logger.error("state_retrieval_error", key=key, error=str(e))
            return None

    async def save_state(
        self, key: str, value: Dict[str, Any], statestore_name: str = STATESTORE_NAME
    ) -> bool:
        """
        Save state to PostgreSQL state store via Dapr

        Args:
            key: State key (e.g., conversation:{user_id})
            value: State value (JSON-serializable dict)
            statestore_name: Dapr State component name

        Returns:
            True if saved successfully, False otherwise
        """
        url = f"/v1.0/state/{statestore_name}"
        payload = [{"key": key, "value": value}]
        try:
            response = await self.client.post(url, json=payload)
            response.raise_for_status()
            logger.info("state_saved", key=key)
            return True
        except Exception as e:
            logger.error("state_save_error", key=key, error=str(e))
            return False

    async def delete_state(
        self, key: str, statestore_name: str = STATESTORE_NAME
    ) -> bool:
        """Delete state from state store"""
        url = f"/v1.0/state/{statestore_name}/{key}"
        try:
            response = await self.client.delete(url)
            response.raise_for_status()
            logger.info("state_deleted", key=key)
            return True
        except Exception as e:
            logger.error("state_delete_error", key=key, error=str(e))
            return False

    # ============================
    # Service Invocation API
    # ============================

    async def invoke_service(
        self,
        app_id: str,
        method_name: str,
        data: Optional[Dict[str, Any]] = None,
        http_verb: str = "POST",
    ) -> Optional[Dict[str, Any]]:
        """
        Invoke another microservice via Dapr Service Invocation (mTLS)

        Args:
            app_id: Dapr app-id of target service (e.g., recurring-task-service)
            method_name: HTTP method path (e.g., /api/generate-next-task)
            data: Request payload
            http_verb: HTTP method (GET, POST, PUT, DELETE)

        Returns:
            Response JSON or None if failed
        """
        url = f"/v1.0/invoke/{app_id}/method/{method_name}"
        try:
            if http_verb.upper() == "GET":
                response = await self.client.get(url)
            elif http_verb.upper() == "POST":
                response = await self.client.post(url, json=data)
            elif http_verb.upper() == "PUT":
                response = await self.client.put(url, json=data)
            elif http_verb.upper() == "DELETE":
                response = await self.client.delete(url)
            else:
                raise ValueError(f"Unsupported HTTP verb: {http_verb}")

            response.raise_for_status()
            return response.json() if response.text else None
        except Exception as e:
            logger.error(
                "service_invocation_error",
                app_id=app_id,
                method_name=method_name,
                error=str(e),
            )
            return None

    # ============================
    # Health Check
    # ============================

    async def health_check(self) -> bool:
        """Check if Dapr sidecar is healthy"""
        url = "/v1.0/healthz"
        try:
            response = await self.client.get(url)
            return response.status_code == 200
        except Exception:
            return False


# Singleton instance for application-wide use
dapr_client = DaprClient()


async def get_dapr_client() -> DaprClient:
    """Dependency injection for FastAPI"""
    return dapr_client
