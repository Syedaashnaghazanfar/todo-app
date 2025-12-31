from datetime import datetime, timedelta
import pytz

def get_utc_now() -> datetime:
    """Get current UTC timestamp"""
    return datetime.now(pytz.UTC)

def get_week_boundaries() -> tuple:
    """Get current week boundaries (Monday-Sunday UTC)"""
    now = get_utc_now()
    # Calculate Monday of current week
    monday = now - timedelta(days=now.weekday())
    week_start = monday.replace(hour=0, minute=0, second=0, microsecond=0)
    # Calculate Sunday end time
    week_end = week_start + timedelta(days=7) - timedelta(seconds=1)
    return week_start, week_end

def to_iso_format(dt: datetime) -> str:
    """Convert datetime to ISO 8601 format"""
    if dt is None:
        return None
    return dt.isoformat() + "Z" if dt.tzinfo else dt.isoformat() + "Z"
