"""
Reminder Scheduler - APScheduler Integration

This module sets up and configures the APScheduler BackgroundScheduler
for the recurring reminder system. It runs a background job every 10 minutes
to check VERY_IMPORTANT tasks and create deadline notifications.
"""

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from backend.database.connection import SessionLocal
from backend.services.reminder_service import ReminderService
from backend.config.settings import REMINDER_CHECK_INTERVAL
import logging

logger = logging.getLogger(__name__)


# Global scheduler instance
scheduler: BackgroundScheduler = None


def check_reminders_job():
    """
    Background job that checks tasks and creates reminder notifications.

    This function:
    1. Opens a database session
    2. Calls ReminderService.check_and_create_reminders()
    3. Logs results
    4. Handles errors gracefully

    Runs every REMINDER_CHECK_INTERVAL minutes (default: 10).
    """
    start_time = datetime.now(timezone.utc)
    logger.info(f"[ReminderJob] Started at {start_time.isoformat()}")

    db: Session = None
    try:
        # Open database session
        db = SessionLocal()

        # Call reminder service
        result = ReminderService.check_and_create_reminders(db)

        logger.info(
            f"[ReminderJob] Completed - "
            f"Checked {result['tasks_checked']} tasks, "
            f"Created {result['notifications_created']} notifications, "
            f"Duration: {result['execution_time_ms']:.0f}ms"
        )

    except Exception as e:
        logger.error(f"[ReminderJob] Failed: {str(e)}", exc_info=True)

    finally:
        # Always close database session
        if db:
            db.close()
            logger.debug("[ReminderJob] Database session closed")


def init_scheduler():
    """
    Initialize and configure the APScheduler BackgroundScheduler.

    Configuration:
    - Timezone: UTC (all calculations in UTC)
    - max_instances: 1 (prevent concurrent executions)
    - misfire_grace_time: 300s (skip if >5 minutes late)
    - coalesce: True (combine missed runs into one)

    Returns:
        BackgroundScheduler: Configured scheduler instance
    """
    global scheduler

    if scheduler is not None:
        logger.warning("[ReminderScheduler] Scheduler already initialized")
        return scheduler

    logger.info("[ReminderScheduler] Initializing APScheduler BackgroundScheduler")

    # Create scheduler with UTC timezone
    scheduler = BackgroundScheduler(
        timezone='UTC',
        job_defaults={
            'max_instances': 1,  # Prevent concurrent job runs
            'misfire_grace_time': 300,  # Skip if more than 5 minutes late
            'coalesce': True,  # Combine missed runs into one
        }
    )

    # Add recurring job with interval trigger
    scheduler.add_job(
        func=check_reminders_job,
        trigger=IntervalTrigger(minutes=REMINDER_CHECK_INTERVAL),
        id='recurring_reminder_check',
        replace_existing=True,
        name='Recurring Reminder Check'
    )

    logger.info(f"[ReminderScheduler] Job registered: check every {REMINDER_CHECK_INTERVAL} minutes")

    return scheduler


def start_scheduler():
    """
    Start the background scheduler.

    This is non-blocking - the scheduler runs in a separate thread.
    """
    global scheduler

    if scheduler is None:
        init_scheduler()

    if not scheduler.running:
        scheduler.start()
        logger.info("[ReminderScheduler] Scheduler started")
    else:
        logger.warning("[ReminderScheduler] Scheduler already running")


def shutdown_scheduler():
    """
    Shutdown the background scheduler gracefully.

    Waits for running jobs to complete before shutting down.
    """
    global scheduler

    if scheduler and scheduler.running:
        logger.info("[ReminderScheduler] Shutting down scheduler...")
        scheduler.shutdown(wait=True)
        logger.info("[ReminderScheduler] Scheduler stopped")
    else:
        logger.warning("[ReminderScheduler] Scheduler not running")
