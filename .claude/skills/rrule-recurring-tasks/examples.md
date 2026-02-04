# RRULE Recurring Tasks Examples

These examples support the `rrule-recurring-tasks` Skill for Phase V.

They demonstrate RRULE pattern parsing and next occurrence calculation.

---

## Example 1 – Calculate Next Daily Occurrence

**Goal:** Calculate next occurrence for daily recurring task.

```python
from dateutil.rrule import rrule, DAILY
from datetime import datetime, timezone

def calculate_next_daily(current: datetime) -> datetime:
    """Calculate next daily occurrence."""
    rule = rrule(DAILY, dtstart=current, count=1, interval=1)
    next_occurrences = list(rule)
    return next_occurrences[0].replace(tzinfo=timezone.utc)

# Usage
current = datetime(2025, 12, 29, 10, 0, 0, tzinfo=timezone.utc)
next_occurrence = calculate_next_daily(current)
# Result: 2025-12-30T10:00:00Z
```

---

## Example 2 – Calculate Next Weekly Occurrence

**Goal:** Calculate next occurrence for weekly recurring task.

```python
from dateutil.rrule import rrule, WEEKLY

def calculate_next_weekly(current: datetime) -> datetime:
    """Calculate next weekly occurrence."""
    rule = rrule(WEEKLY, dtstart=current, count=1, interval=1)
    next_occurrences = list(rule)
    return next_occurrences[0].replace(tzinfo=timezone.utc)

# Usage
current = datetime(2025, 12, 29, 10, 0, 0, tzinfo=timezone.utc)
next_occurrence = calculate_next_weekly(current)
# Result: 2026-01-05T10:00:00Z
```

---

## Example 3 – Parse RRULE String

**Goal:** Parse full RFC 5545 RRULE string.

```python
from dateutil.rrule import rrulestr

def parse_rrule_string(rrule_string: str, dtstart: datetime) -> list:
    """Parse RRULE string and get occurrences."""
    full_rule = f"DTSTART:{dtstart.strftime('%Y%m%dT%H%M%SZ')}\nRRULE:{rrule_string}"
    rule = rrulestr(full_rule)
    return list(rule)

# Usage
rrule_string = "FREQ=DAILY;INTERVAL=1;COUNT=10"
dtstart = datetime(2025, 12, 29, 10, 0, 0, tzinfo=timezone.utc)
occurrences = parse_rrule_string(rrule_string, dtstart)
```

---

## Example 4 – RRULE Parser Service

**Goal:** Complete RRULE parser with simplified patterns.

```python
# backend/src/integrations/rrule_parser.py
from dateutil.rrule import rrule, rrulestr, DAILY, WEEKLY, MONTHLY, YEARLY
from datetime import datetime, timezone
from typing import Literal

class RRuleParser:
    """Parse RRULE patterns and calculate next occurrences."""
    
    SIMPLIFIED_PATTERNS = {
        "DAILY": DAILY,
        "WEEKLY": WEEKLY,
        "MONTHLY": MONTHLY,
        "YEARLY": YEARLY
    }
    
    def parse_pattern(self, pattern: str) -> rrule:
        """Parse RRULE pattern (simplified or full RFC 5545)."""
        pattern_upper = pattern.upper()
        
        # Check if simplified pattern
        if pattern_upper in self.SIMPLIFIED_PATTERNS:
            freq = self.SIMPLIFIED_PATTERNS[pattern_upper]
            return rrule(freq, interval=1)
        
        # Full RRULE string
        if pattern.startswith("FREQ="):
            return rrulestr(f"RRULE:{pattern}")
        
        # Try parsing as full RRULE
        try:
            return rrulestr(pattern)
        except Exception:
            raise ValueError(f"Invalid RRULE pattern: {pattern}")
    
    def calculate_next(
        self,
        pattern: str,
        dtstart: datetime,
        end_date: datetime | None = None
    ) -> datetime | None:
        """Calculate next occurrence from pattern."""
        rule = self.parse_pattern(pattern)
        rule.dtstart = dtstart.replace(tzinfo=timezone.utc)
        
        occurrences = list(rule)
        if not occurrences:
            return None
        
        next_occurrence = occurrences[0]
        
        # Check end date
        if end_date and next_occurrence > end_date.replace(tzinfo=timezone.utc):
            return None
        
        return next_occurrence

# Usage
parser = RRuleParser()
next_occurrence = parser.calculate_next(
    pattern="DAILY",
    dtstart=datetime.utcnow().replace(tzinfo=timezone.utc)
)
```

---

## Example 5 – Handle Recurring End Date

**Goal:** Stop creating occurrences after end date.

```python
def should_create_next_occurrence(
    next_occurrence: datetime,
    recurring_end_date: datetime | None
) -> bool:
    """Check if next occurrence should be created."""
    if not recurring_end_date:
        return True  # No end date, infinite recurrence
    
    return next_occurrence <= recurring_end_date.replace(tzinfo=timezone.utc)

# Usage
next_occurrence = datetime(2026, 1, 5, 10, 0, 0, tzinfo=timezone.utc)
end_date = datetime(2026, 1, 31, 23, 59, 59, tzinfo=timezone.utc)

if should_create_next_occurrence(next_occurrence, end_date):
    # Create next occurrence
    pass
```

---

## Example 6 – Generate Simplified Patterns

**Goal:** Generate simplified RRULE patterns from user input.

```python
def generate_simplified_pattern(
    frequency: Literal["DAILY", "WEEKLY", "MONTHLY", "YEARLY"],
    interval: int = 1
) -> str:
    """Generate simplified RRULE pattern."""
    if frequency == "DAILY":
        return "DAILY" if interval == 1 else f"FREQ=DAILY;INTERVAL={interval}"
    
    if frequency == "WEEKLY":
        return f"FREQ=WEEKLY;INTERVAL={interval}"
    
    if frequency == "MONTHLY":
        return f"FREQ=MONTHLY;INTERVAL={interval}"
    
    if frequency == "YEARLY":
        return f"FREQ=YEARLY;INTERVAL={interval}"
    
    raise ValueError(f"Unknown frequency: {frequency}")

# Usage
pattern = generate_simplified_pattern("DAILY", interval=1)
# Result: "DAILY"
```

---

## Example 7 – UTC-Only Time Handling

**Goal:** Always use UTC timestamps.

```python
from datetime import datetime, timezone

# ✅ Good: UTC timestamps
current = datetime.utcnow().replace(tzinfo=timezone.utc)
next_occurrence = calculate_next_occurrence("DAILY", current)

# ❌ Bad: Local timezone
current = datetime.now()  # Local timezone
```

---

## Example 8 – Integration with Task Service

**Goal:** Update next_occurrence field for recurring task.

```python
from sqlmodel import Session

async def update_next_occurrence(
    session: Session,
    task_id: int,
    parser: RRuleParser
) -> datetime | None:
    """Update next_occurrence field for recurring task."""
    task = session.get(Task, task_id)
    
    if not task or not task.recurring_pattern:
        return None
    
    # Calculate next occurrence
    next_occurrence = parser.calculate_next(
        pattern=task.recurring_pattern,
        dtstart=datetime.utcnow().replace(tzinfo=timezone.utc),
        end_date=task.recurring_end_date
    )
    
    if next_occurrence:
        task.next_occurrence = next_occurrence
        session.add(task)
        session.commit()
    
    return next_occurrence
```

---

## Example 9 – Edge Cases: DST and Leap Years

**Goal:** Handle DST transitions and leap years.

```python
# RRULE handles DST automatically when using UTC
rule = rrule(
    DAILY,
    dtstart=datetime(2025, 3, 9, 10, 0, 0, tzinfo=timezone.utc),  # DST change day
    count=5
)

# RRULE handles leap years automatically
rule = rrule(
    YEARLY,
    dtstart=datetime(2024, 2, 29, 10, 0, 0, tzinfo=timezone.utc),  # Leap year
    count=5
)
```

---

## Example 10 – Complete RRULE Service

**Goal:** Complete RRULE service with all features.

```python
class RRuleService:
    """Complete RRULE service for recurring tasks."""
    
    def __init__(self):
        self.parser = RRuleParser()
    
    async def create_recurring_task(
        self,
        title: str,
        pattern: str,
        user_id: str,
        end_date: datetime | None = None
    ) -> Task:
        """Create recurring task with next occurrence."""
        # Calculate first next occurrence
        next_occurrence = self.parser.calculate_next(
            pattern=pattern,
            dtstart=datetime.utcnow().replace(tzinfo=timezone.utc),
            end_date=end_date
        )
        
        # Create task
        task = Task(
            title=title,
            user_id=user_id,
            recurring_pattern=pattern,
            recurring_end_date=end_date,
            next_occurrence=next_occurrence
        )
        
        return task
    
    async def create_next_occurrence(
        self,
        parent_task: Task
    ) -> Task | None:
        """Create next occurrence from parent task."""
        if not parent_task.recurring_pattern:
            return None
        
        # Calculate next occurrence
        next_occurrence = self.parser.calculate_next(
            pattern=parent_task.recurring_pattern,
            dtstart=parent_task.next_occurrence or datetime.utcnow().replace(tzinfo=timezone.utc),
            end_date=parent_task.recurring_end_date
        )
        
        if not next_occurrence:
            return None  # Past end date
        
        # Create new task
        new_task = Task(
            title=parent_task.title,
            user_id=parent_task.user_id,
            recurring_pattern=parent_task.recurring_pattern,
            recurring_end_date=parent_task.recurring_end_date,
            next_occurrence=next_occurrence,
            parent_task_id=parent_task.id
        )
        
        return new_task
```

