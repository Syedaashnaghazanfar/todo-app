"""
Microservice Template - Complete microservice with all patterns.

This template provides a complete microservice implementation for Phase V.
Copy this file to your project and customize as needed.
"""

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from dapr_integration import DaprClient
from kafka_event_driven import EventPublisher
from pydantic_settings import BaseSettings
import httpx

class ServiceConfig(BaseSettings):
    """Service configuration."""
    service_name: str = "example-service"
    dapr_port: int = 3500
    backend_service_id: str = "backend"
    
    class Config:
        env_prefix = "SERVICE_"

app = FastAPI()
config = ServiceConfig()
dapr = DaprClient(dapr_port=config.dapr_port)
publisher = EventPublisher()

# ==================== Dapr Subscription ====================

@app.post("/dapr/subscribe")
async def subscribe():
    """Dapr subscription endpoint."""
    return [
        {
            "pubsubname": "kafka-pubsub",
            "topic": "task-events",
            "route": "/api/events/task-events"
        }
    ]

# ==================== Event Handlers ====================

@app.post("/api/events/task-events")
async def handle_task_event(request: Request):
    """Handle task events from Kafka."""
    cloud_event = await request.json()
    event_data = cloud_event.get("data", {})
    
    # User isolation check
    user_id = event_data.get("user_id")
    if not user_id:
        return JSONResponse(
            {"status": "error", "message": "Missing user_id"},
            status_code=400
        )
    
    # Process event
    event_type = event_data.get("event_type")
    if event_type == "task.completed":
        await handle_task_completed(event_data, user_id)
    elif event_type == "task.created":
        await handle_task_created(event_data, user_id)
    
    return JSONResponse({"status": "success"})

async def handle_task_completed(event_data: dict, user_id: str):
    """Process task completion event."""
    task_id = event_data.get("task_id")
    payload = event_data.get("payload", {})
    
    # Your business logic here
    # Example: Create next occurrence for recurring task
    if payload.get("recurring_pattern"):
        await create_next_occurrence(task_id, user_id, payload)

async def handle_task_created(event_data: dict, user_id: str):
    """Process task creation event."""
    # Your business logic here
    pass

async def create_next_occurrence(task_id: int, user_id: str, payload: dict):
    """Create next occurrence via backend service."""
    result = await dapr.invoke_service(
        app_id=config.backend_service_id,
        method="api/tasks",
        data={
            "title": payload.get("title"),
            "user_id": user_id,
            "recurring_pattern": payload.get("recurring_pattern"),
            "parent_task_id": task_id
        }
    )
    return result

# ==================== Health Checks ====================

@app.get("/health")
async def health_check():
    """Liveness probe."""
    return {
        "status": "healthy",
        "service": config.service_name
    }

@app.get("/health/ready")
async def readiness_check():
    """Readiness probe - check dependencies."""
    try:
        # Check Dapr sidecar
        response = await httpx.get(f"http://localhost:{config.dapr_port}/v1.0/healthz")
        if response.status_code != 200:
            return JSONResponse({"status": "not ready"}, status_code=503)
        
        return {"status": "ready"}
    except Exception as e:
        return JSONResponse(
            {"status": "not ready", "error": str(e)},
            status_code=503
        )

# ==================== Main Entry Point ====================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)

