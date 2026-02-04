# RRULE Recurring Tasks Reference

This reference document supports the `rrule-recurring-tasks` Skill for Phase V.

It standardizes **RRULE pattern parsing and next occurrence calculation**.

---

## 1. Scope of This Reference

This file focuses on **RRULE patterns**:

- Simplified patterns (DAILY, WEEKLY, MONTHLY, YEARLY)
- Full RFC 5545 RRULE parsing
- Next occurrence calculation
- UTC-only time handling
- Recurring end date handling

---

## 2. Simplified Patterns

### Supported Frequencies

- **DAILY** - Every day
- **WEEKLY** - Every week
- **MONTHLY** - Every month
- **YEARLY** - Every year

### Pattern Format

```python
# Simple
pattern = "DAILY"

# With interval
pattern = "FREQ=DAILY;INTERVAL=2"  # Every 2 days
```

---

## 3. Full RRULE Format

### RFC 5545 RRULE

```python
rrule_string = "FREQ=DAILY;INTERVAL=1;COUNT=10"
rule = rrulestr(f"DTSTART:20251229T100000Z\nRRULE:{rrule_string}")
```

### Common RRULE Parameters

- `FREQ` - Frequency (DAILY, WEEKLY, MONTHLY, YEARLY)
- `INTERVAL` - Interval between occurrences
- `COUNT` - Number of occurrences
- `UNTIL` - End date
- `BYDAY` - Day of week (for WEEKLY)

---

## 4. Next Occurrence Calculation

### Basic Calculation

```python
from dateutil.rrule import rrule, DAILY

rule = rrule(DAILY, dtstart=current, count=1)
next_occurrences = list(rule)
next_occurrence = next_occurrences[0]
```

### With End Date Check

```python
if end_date and next_occurrence > end_date:
    return None  # Don't create next occurrence
```

---

## 5. UTC-Only Time Handling

### Always Use UTC

```python
# ✅ Good
dt = datetime.utcnow().replace(tzinfo=timezone.utc)

# ❌ Bad
dt = datetime.now()  # Local timezone
```

### Convert to UTC

```python
from dateutil.parser import parse

dt = parse("2025-12-29T10:00:00-05:00")  # EST
dt_utc = dt.astimezone(timezone.utc)
```

---

## 6. Best Practices

1. **Always use UTC** for all timestamps
2. **Validate patterns** before using
3. **Handle end dates** to stop recurrence
4. **Cache parsed rules** for performance
5. **Handle edge cases** (DST, leap years)

---

## References

- [python-dateutil RRULE](https://dateutil.readthedocs.io/en/stable/rrule.html)
- [RFC 5545 RRULE](https://www.rfc-editor.org/rfc/rfc5545#section-3.3.10)

