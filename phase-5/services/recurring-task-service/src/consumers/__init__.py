"""
Consumers module for recurring-task-service

Phase 5: Enterprise Cloud Infrastructure
"""
from .task_completion_consumer import TaskCompletionConsumer
from .dlq_consumer import DLQConsumer

__all__ = ["TaskCompletionConsumer", "DLQConsumer"]
