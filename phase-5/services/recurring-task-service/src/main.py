"""
Recurring Task Service - FastAPI Application

Handles recurring task lifecycle management via Dapr Pub/Sub.
Subscribes to task.completed events and generates next task instances.

Phase 5: Enterprise Cloud Infrastructure - Recurring Task Lifecycle Management
"""
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import logging
import os
from datetime import datetime
from typing import Dict, Any

from consumers.task_completion_consumer import TaskCompletionConsumer

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Global consumer instance
consumer: TaskCompletionConsumer = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Startup and shutdown events for FastAPI application.
    """
    # Startup
    global consumer
    logger.info("Starting recurring-task-service...")

    # Initialize consumer
    consumer = TaskCompletionConsumer()
    logger.info("Task completion consumer initialized")

    logger.info("Recurring-task-service started successfully")

    yield

    # Shutdown
    logger.info("Shutting down recurring-task-service...")


# Create FastAPI app
app = FastAPI(
    title="Recurring Task Service",
    description="Handles recurring task lifecycle management via Dapr Pub/Sub",
    version="1.0.0",
    lifespan=lifespan
)


# Dapr Pub/Sub Subscription Configuration
@app.get("/dapr/subscribe")
async def dapr_subscribe():
    """
    Dapr subscription endpoint.
    Returns list of topics to subscribe to.
    """
    subscriptions = [
        {
            "pubsubname": "kafka-pubsub",
            "topic": "task-operations",
            "route": "/task-completed-handler"
        }
    ]
    logger.info(f"Dapr subscriptions configured: {subscriptions}")
    return subscriptions


# Event Handler Endpoint
@app.post("/task-completed-handler")
async def task_completed_handler(request: Request):
    """
    Handle task.completed events from Dapr Pub/Sub.

    Endpoint receives CloudEvent from Dapr sidecar.
    Filters for task.completed events and processes recurring tasks.
    """
    try:
        # Parse CloudEvent from request body
        event = await request.json()

        logger.info(f"Received event: {event.get('id')} of type {event.get('type')}")

        # Process event through consumer
        result = await consumer.handle_task_completed(event)

        status_code = 200 if result["status"] in ["success", "duplicate", "ignored"] else 500

        return JSONResponse(
            status_code=status_code,
            content=result
        )

    except Exception as e:
        logger.error(f"Error handling task completion event: {str(e)}", exc_info=True)
        return JSONResponse(
            status_code=500,
            content={"status": "error", "message": str(e)}
        )


# Health Check Endpoints
@app.get("/health")
async def health_check():
    """
    Health check endpoint for Kubernetes liveness probe.
    """
    try:
        consumer_health = await consumer.health_check() if consumer else {"status": "not_initialized"}

        return {
            "status": "healthy",
            "service": "recurring-task-service",
            "timestamp": datetime.utcnow().isoformat(),
            "consumer": consumer_health
        }
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        raise HTTPException(status_code=503, detail="Service unhealthy")


@app.get("/ready")
async def readiness_check():
    """
    Readiness check endpoint for Kubernetes readiness probe.
    """
    if consumer is None:
        raise HTTPException(status_code=503, detail="Consumer not initialized")

    return {
        "status": "ready",
        "service": "recurring-task-service",
        "timestamp": datetime.utcnow().isoformat()
    }


# Prometheus Metrics Endpoint
@app.get("/metrics")
async def metrics():
    """
    Prometheus metrics endpoint.
    Returns metrics in Prometheus text format.

    Metrics exposed:
    - recurring_task_events_processed_total
    - recurring_task_generation_success_total
    - recurring_task_generation_failure_total
    - recurring_task_cache_size
    """
    try:
        cache_size = len(consumer._processed_events) if consumer else 0

        metrics_output = f"""# HELP recurring_task_cache_size Size of event deduplication cache
# TYPE recurring_task_cache_size gauge
recurring_task_cache_size {cache_size}

# HELP recurring_task_service_up Service up status
# TYPE recurring_task_service_up gauge
recurring_task_service_up 1
"""
        return JSONResponse(
            content={"metrics": metrics_output},
            media_type="text/plain"
        )

    except Exception as e:
        logger.error(f"Metrics endpoint error: {str(e)}")
        return JSONResponse(
            content={"error": str(e)},
            status_code=500
        )


# Root endpoint
@app.get("/")
async def root():
    """
    Root endpoint with service information.
    """
    return {
        "service": "recurring-task-service",
        "version": "1.0.0",
        "description": "Handles recurring task lifecycle management via Dapr Pub/Sub",
        "endpoints": {
            "dapr_subscribe": "/dapr/subscribe",
            "task_completed_handler": "/task-completed-handler",
            "health": "/health",
            "ready": "/ready",
            "metrics": "/metrics"
        }
    }


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", "8001"))
    host = os.getenv("HOST", "0.0.0.0")

    logger.info(f"Starting recurring-task-service on {host}:{port}")

    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=os.getenv("ENV", "production") == "development",
        log_level="info"
    )
