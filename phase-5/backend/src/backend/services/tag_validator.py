"""
Tag Validation Service for Task Management

This module implements tag validation rules for the Skills & Subagents Architecture,
ensuring tasks use only standard predefined tag categories with proper constraints.

Validation Rules:
- Maximum 5 tags per task
- No duplicate tags
- All tags must be from standard categories
"""

from typing import List, Tuple, Optional


# Standard tag categories (case-sensitive)
STANDARD_TAGS = [
    'Work',
    'Personal',
    'Shopping',
    'Health',
    'Finance',
    'Learning',
    'Urgent'
]


def validate_tags(tags: List[str]) -> Tuple[bool, Optional[str]]:
    """
    Validate task tags against standard categories and constraints.

    Args:
        tags: List of tag names to validate

    Returns:
        Tuple of (is_valid: bool, error_message: Optional[str])
        - If valid: (True, None)
        - If invalid: (False, "error message explaining the issue")

    Examples:
        >>> validate_tags(['Work', 'Urgent'])
        (True, None)

        >>> validate_tags(['Work', 'Personal', 'Shopping', 'Health', 'Finance', 'Learning'])
        (False, 'Maximum 5 tags allowed per task')

        >>> validate_tags(['Work', 'Work'])
        (False, 'Duplicate tags are not allowed: Work')

        >>> validate_tags(['InvalidTag'])
        (False, "Invalid tag 'InvalidTag'. Allowed tags: Work, Personal, Shopping, Health, Finance, Learning, Urgent")

        >>> validate_tags([])
        (True, None)
    """
    # Empty tags list is valid
    if not tags:
        return (True, None)

    # Rule 1: Maximum 5 tags per task
    if len(tags) > 5:
        return (False, 'Maximum 5 tags allowed per task')

    # Rule 2: No duplicate tags
    seen_tags = set()
    for tag in tags:
        if tag in seen_tags:
            return (False, f'Duplicate tags are not allowed: {tag}')
        seen_tags.add(tag)

    # Rule 3: All tags must be from standard categories (case-sensitive)
    for tag in tags:
        if tag not in STANDARD_TAGS:
            allowed_tags = ', '.join(STANDARD_TAGS)
            return (False, f"Invalid tag '{tag}'. Allowed tags: {allowed_tags}")

    # All validations passed
    return (True, None)


def normalize_tags(tags: Optional[List[str]]) -> List[str]:
    """
    Normalize tags list, handling None and empty cases.

    Args:
        tags: Optional list of tags

    Returns:
        Normalized tags list (empty list if None)

    Examples:
        >>> normalize_tags(None)
        []

        >>> normalize_tags([])
        []

        >>> normalize_tags(['Work', 'Personal'])
        ['Work', 'Personal']
    """
    return tags if tags is not None else []


def get_standard_tag_info() -> List[dict]:
    """
    Get detailed information about standard tag categories for API documentation.

    Returns:
        List of tag info dictionaries with name and description

    Example:
        >>> info = get_standard_tag_info()
        >>> info[0]
        {'name': 'Work', 'description': 'Work-related tasks, projects, meetings'}
    """
    tag_descriptions = {
        'Work': 'Work-related tasks, projects, meetings',
        'Personal': 'Personal life, hobbies, self-care',
        'Shopping': 'Errands, purchases, groceries',
        'Health': 'Medical appointments, fitness, wellness',
        'Finance': 'Bills, budgeting, financial planning',
        'Learning': 'Education, courses, reading',
        'Urgent': 'Time-sensitive tasks requiring immediate attention'
    }

    return [
        {'name': tag, 'description': tag_descriptions.get(tag, '')}
        for tag in STANDARD_TAGS
    ]
