"""
Reminder System Configuration Settings

This module defines configuration constants for the recurring reminder system.
All settings are loaded from environment variables with sensible defaults.
"""

import os
from typing import List


# Reminder system configuration
REMINDER_CHECK_INTERVAL: int = int(os.getenv("REMINDER_CHECK_INTERVAL", "10"))  # minutes
"""Background job execution frequency in minutes (default: 10)"""

REMINDER_ENABLE_OVERDUE: bool = os.getenv("REMINDER_ENABLE_OVERDUE", "true").lower() == "true"
"""Whether to create notifications for overdue tasks (default: true)"""

REMINDER_THRESHOLDS: List[float] = [6.0, 3.0, 1.0, 0.5, 0.25]  # hours
"""
Reminder thresholds in hours before due date.
Order: 6h, 3h, 1h, 30m (0.5h), 15m (0.25h)
"""

REMINDER_THRESHOLD_WINDOW: float = 0.17  # ~10 minutes in hours
"""
Threshold window size in hours for matching reminder times.
Allows reminders to trigger even if job runs slightly early/late.
"""
