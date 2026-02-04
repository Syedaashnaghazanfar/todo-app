"""
Services module for recurring-task-service

Phase 5: Enterprise Cloud Infrastructure
"""
from .rrule_service import RRuleService, RRuleParsingError
from .task_generation_service import TaskGenerationService, TaskGenerationError
from .deduplication_service import (
    DeduplicationService,
    get_deduplication_service,
    close_deduplication_service,
)

__all__ = [
    "RRuleService",
    "RRuleParsingError",
    "TaskGenerationService",
    "TaskGenerationError",
    "DeduplicationService",
    "get_deduplication_service",
    "close_deduplication_service",
]
