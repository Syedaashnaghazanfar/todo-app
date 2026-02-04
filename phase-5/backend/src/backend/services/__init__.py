"""
Services for Phase 2 (tasks, auth, notifications, history) and Phase 3 (conversations).

Phase 2 services remain unchanged.
Phase 3 adds async conversation_service for chatbot.
"""

# Phase 2 services (existing - unchanged)
from .task_service import TaskService
from .auth_service import AuthService
from .notification_service import NotificationService
from .history_service import HistoryService
from .priority_classifier import classify_priority, reclassify_priority_on_update
from .tag_validator import validate_tags, normalize_tags

# Phase 3 services (new - async)
from . import conversation_service

__all__ = [
    # Phase 2
    "TaskService",
    "AuthService",
    "NotificationService",
    "HistoryService",
    "classify_priority",
    "reclassify_priority_on_update",
    "validate_tags",
    "normalize_tags",
    # Phase 3
    "conversation_service",
]
