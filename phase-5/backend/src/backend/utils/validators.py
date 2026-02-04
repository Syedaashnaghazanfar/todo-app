import uuid
from typing import Optional

def validate_title(title: str) -> bool:
    """Validate task title"""
    if not title or not isinstance(title, str):
        return False
    if len(title.strip()) == 0 or len(title) > 255:
        return False
    return True

def validate_description(description: Optional[str]) -> bool:
    """Validate task description"""
    if description is None:
        return True
    if not isinstance(description, str):
        return False
    if len(description) > 5000:
        return False
    return True

def validate_uuid(value: str) -> bool:
    """Validate UUID format"""
    try:
        uuid.UUID(value)
        return True
    except (ValueError, TypeError):
        return False

def validate_pagination(page: int, limit: int) -> bool:
    """Validate pagination parameters"""
    if page < 1 or limit < 1 or limit > 100:
        return False
    return True

def get_validation_error(field: str, reason: str) -> str:
    """Format validation error message"""
    return f"{field}: {reason}"
