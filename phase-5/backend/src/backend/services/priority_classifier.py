"""
Priority Classification Service for Task Management

This module implements automatic priority classification based on task urgency
keywords and due date proximity, following the Skills & Subagents Architecture.

Classification Rules:
- VERY_IMPORTANT: Urgency keyword in title OR due date within 6 hours
- HIGH: Due date within 24 hours
- MEDIUM: Due date within 7 days
- LOW: Due date beyond 7 days OR no due date
"""

from datetime import datetime, timedelta, timezone
from typing import Optional


# Urgency keywords (case-insensitive matching)
URGENCY_KEYWORDS = ['urgent', 'asap', 'critical', 'important', 'emergency']


def classify_priority(title: str, due_date: Optional[datetime]) -> str:
    """
    Classify task priority based on title urgency keywords and due date proximity.

    Args:
        title: Task title to check for urgency keywords
        due_date: Optional task due date (timezone-aware datetime)

    Returns:
        Priority level: 'VERY_IMPORTANT' | 'HIGH' | 'MEDIUM' | 'LOW'

    Examples:
        >>> classify_priority("Urgent: Fix production bug", None)
        'VERY_IMPORTANT'

        >>> from datetime import datetime, timezone, timedelta
        >>> now = datetime.now(timezone.utc)
        >>> classify_priority("Normal task", now + timedelta(hours=3))
        'VERY_IMPORTANT'

        >>> classify_priority("Normal task", now + timedelta(hours=20))
        'HIGH'

        >>> classify_priority("Normal task", now + timedelta(days=5))
        'MEDIUM'

        >>> classify_priority("Normal task", now + timedelta(days=10))
        'LOW'

        >>> classify_priority("Normal task", None)
        'LOW'
    """
    # Check for urgency keywords in title (case-insensitive)
    title_lower = title.lower()
    has_urgency_keyword = any(keyword in title_lower for keyword in URGENCY_KEYWORDS)

    # If no due date, only urgency keyword matters
    if due_date is None:
        return 'VERY_IMPORTANT' if has_urgency_keyword else 'LOW'

    # Calculate time until due date
    now = datetime.now(timezone.utc).replace(tzinfo=None)

    # Ensure due_date is timezone-aware for comparison
    if due_date.tzinfo is None:
        # Treat naive datetime as UTC
        due_date = due_date.replace(tzinfo=timezone.utc)

    # Convert now to timezone-aware
    now = now.replace(tzinfo=timezone.utc)

    time_until_due = due_date - now

    # Classification logic based on due date proximity
    if time_until_due <= timedelta(hours=6):
        # Within 6 hours OR has urgency keyword
        return 'VERY_IMPORTANT'
    elif time_until_due <= timedelta(hours=24):
        # Within 24 hours
        return 'HIGH'
    elif time_until_due <= timedelta(days=7):
        # Within 1 week
        return 'MEDIUM'
    else:
        # Beyond 1 week
        return 'LOW'


def reclassify_priority_on_update(
    title: Optional[str],
    due_date: Optional[datetime],
    current_title: str,
    current_due_date: Optional[datetime]
) -> str:
    """
    Re-classify priority when task is updated.

    Args:
        title: New title (None if not being updated)
        due_date: New due date (None if not being updated, could be explicitly set to None to clear)
        current_title: Current task title
        current_due_date: Current task due date

    Returns:
        Priority level: 'VERY_IMPORTANT' | 'HIGH' | 'MEDIUM' | 'LOW'
    """
    # Use updated title if provided, otherwise keep current
    effective_title = title if title is not None else current_title

    # Use updated due_date if provided in the update, otherwise keep current
    # Note: If due_date is explicitly being cleared, it will be passed as None
    effective_due_date = due_date if due_date is not None else current_due_date

    return classify_priority(effective_title, effective_due_date)
