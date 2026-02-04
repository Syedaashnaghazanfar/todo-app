"""
Structured JSON Logging Configuration for Phase V

Uses structlog for structured logging with JSON output.
All logs include:
- timestamp: ISO 8601 UTC
- level: DEBUG, INFO, WARNING, ERROR, CRITICAL
- service: Service name (backend-api, recurring-task-service, notification-service)
- user_id: User identifier (from request context)
- request_id: Unique request identifier for distributed tracing
- message: Log message
- context: Additional structured context (key-value pairs)

Example log output:
{
    "timestamp": "2026-01-14T10:00:00.123456Z",
    "level": "info",
    "service": "backend-api",
    "user_id": "user-123",
    "request_id": "req-abc-456",
    "message": "task_created",
    "context": {"task_id": "task-789", "title": "Buy groceries"}
}
"""

import logging
import os
import sys
from typing import Any, Dict

import structlog

# Service name (override via environment variable)
SERVICE_NAME = os.getenv("SERVICE_NAME", "backend-api")

# Log level (override via environment variable)
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO").upper()


def configure_logging():
    """
    Configure structured logging for the service

    Sets up structlog with JSON output and appropriate processors.
    Call this function once during application startup.
    """
    # Configure standard library logging
    logging.basicConfig(
        format="%(message)s",
        stream=sys.stdout,
        level=getattr(logging, LOG_LEVEL, logging.INFO),
    )

    # Configure structlog processors
    structlog.configure(
        processors=[
            # Add log level to event dict
            structlog.stdlib.add_log_level,
            # Add timestamp in ISO 8601 UTC format
            structlog.processors.TimeStamper(fmt="iso", utc=True),
            # Add service name to all logs
            structlog.processors.CallsiteParameterAdder(
                {
                    structlog.processors.CallsiteParameter.FILENAME,
                    structlog.processors.CallsiteParameter.FUNC_NAME,
                    structlog.processors.CallsiteParameter.LINENO,
                }
            ),
            # Format stack traces
            structlog.processors.format_exc_info,
            # Render as JSON
            structlog.processors.JSONRenderer(),
        ],
        wrapper_class=structlog.stdlib.BoundLogger,
        context_class=dict,
        logger_factory=structlog.stdlib.LoggerFactory(),
        cache_logger_on_first_use=True,
    )


def get_logger(name: str = __name__) -> structlog.stdlib.BoundLogger:
    """
    Get a configured logger instance

    Args:
        name: Logger name (typically __name__ from calling module)

    Returns:
        Configured structlog logger
    """
    return structlog.get_logger(name).bind(service=SERVICE_NAME)


def bind_request_context(
    logger: structlog.stdlib.BoundLogger, user_id: str, request_id: str
) -> structlog.stdlib.BoundLogger:
    """
    Bind request context to logger for distributed tracing

    Args:
        logger: Base logger instance
        user_id: User identifier from request
        request_id: Unique request identifier

    Returns:
        Logger with bound context
    """
    return logger.bind(user_id=user_id, request_id=request_id)


# Example usage:
# from backend.config.logging_config import configure_logging, get_logger
#
# # During application startup:
# configure_logging()
#
# # In application code:
# logger = get_logger(__name__)
# logger.info("task_created", task_id="task-123", title="Buy groceries")
#
# # With request context:
# request_logger = bind_request_context(logger, user_id="user-456", request_id="req-789")
# request_logger.info("processing_request", endpoint="/api/tasks")
