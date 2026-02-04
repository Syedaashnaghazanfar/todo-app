"""
RRULE Parser Template - Parse RRULE patterns and calculate next occurrences.

This template provides a complete RRULE parser for Phase V.
Copy this file to your project and customize as needed.
"""

from dateutil.rrule import rrule, rrulestr, DAILY, WEEKLY, MONTHLY, YEARLY
from dateutil.parser import parse
from datetime import datetime, timezone
from typing import Literal, Optional


class RRuleParser:
    """
    Parse RRULE patterns and calculate next occurrences.
    
    Supports:
    - Simplified patterns (DAILY, WEEKLY, MONTHLY, YEARLY)
    - Full RFC 5545 RRULE strings
    - UTC-only time handling
    - Recurring end date support
    """
    
    SIMPLIFIED_PATTERNS = {
        "DAILY": DAILY,
        "WEEKLY": WEEKLY,
        "MONTHLY": MONTHLY,
        "YEARLY": YEARLY
    }
    
    def parse_pattern(self, pattern: str) -> rrule:
        """
        Parse RRULE pattern (simplified or full RFC 5545).
        
        Args:
            pattern: RRULE pattern (e.g., "DAILY" or "FREQ=DAILY;INTERVAL=1")
            
        Returns:
            Parsed rrule object
            
        Raises:
            ValueError: If pattern is invalid
        """
        pattern_upper = pattern.upper()
        
        # Check if simplified pattern
        if pattern_upper in self.SIMPLIFIED_PATTERNS:
            freq = self.SIMPLIFIED_PATTERNS[pattern_upper]
            return rrule(freq, interval=1)
        
        # Full RRULE string
        if pattern.startswith("FREQ="):
            # Can use rrulestr with just RRULE part
            return rrulestr(f"RRULE:{pattern}")
        
        # Try parsing as full RRULE string (with DTSTART)
        try:
            return rrulestr(pattern)
        except Exception:
            # Try parsing as RRULE only (will need dtstart set later)
            try:
                return rrulestr(f"RRULE:{pattern}")
            except Exception as e:
                raise ValueError(f"Invalid RRULE pattern: {pattern} - {e}")
    
    def calculate_next(
        self,
        pattern: str,
        dtstart: datetime,
        end_date: Optional[datetime] = None
    ) -> Optional[datetime]:
        """
        Calculate next occurrence from pattern.
        
        Args:
            pattern: RRULE pattern
            dtstart: Start datetime (current occurrence)
            end_date: Optional recurring end date
            
        Returns:
            Next occurrence datetime or None if past end date
        """
        rule = self.parse_pattern(pattern)
        
        # Set dtstart (ensure UTC)
        # Note: rrule objects need dtstart set before generating occurrences
        if hasattr(rule, 'dtstart'):
            rule.dtstart = dtstart.replace(tzinfo=timezone.utc) if dtstart.tzinfo is None else dtstart
        else:
            # If rrule doesn't have dtstart attribute, recreate with dtstart
            from dateutil.rrule import rrule, DAILY, WEEKLY, MONTHLY, YEARLY
            pattern_upper = pattern.upper()
            if pattern_upper in self.SIMPLIFIED_PATTERNS:
                freq = self.SIMPLIFIED_PATTERNS[pattern_upper]
                rule = rrule(freq, dtstart=dtstart.replace(tzinfo=timezone.utc), count=1, interval=1)
            else:
                # For full RRULE, use rrulestr with dtstart parameter
                rule = rrulestr(pattern, dtstart=dtstart.replace(tzinfo=timezone.utc))
        
        # Get next occurrence
        occurrences = list(rule)
        if not occurrences:
            return None
        
        next_occurrence = occurrences[0]
        
        # Check end date
        if end_date:
            end_date_utc = end_date.replace(tzinfo=timezone.utc) if end_date.tzinfo is None else end_date
            if next_occurrence > end_date_utc:
                return None  # Past end date
        
        return next_occurrence.replace(tzinfo=timezone.utc)
    
    def validate_pattern(self, pattern: str) -> bool:
        """
        Validate RRULE pattern.
        
        Args:
            pattern: RRULE pattern to validate
            
        Returns:
            True if valid, False otherwise
        """
        try:
            self.parse_pattern(pattern)
            return True
        except Exception:
            return False
    
    def generate_simplified_pattern(
        self,
        frequency: Literal["DAILY", "WEEKLY", "MONTHLY", "YEARLY"],
        interval: int = 1
    ) -> str:
        """
        Generate simplified RRULE pattern from frequency.
        
        Args:
            frequency: Frequency (DAILY, WEEKLY, MONTHLY, YEARLY)
            interval: Interval between occurrences (default: 1)
            
        Returns:
            Simplified pattern string
        """
        if frequency == "DAILY":
            return "DAILY" if interval == 1 else f"FREQ=DAILY;INTERVAL={interval}"
        
        if frequency == "WEEKLY":
            return f"FREQ=WEEKLY;INTERVAL={interval}"
        
        if frequency == "MONTHLY":
            return f"FREQ=MONTHLY;INTERVAL={interval}"
        
        if frequency == "YEARLY":
            return f"FREQ=YEARLY;INTERVAL={interval}"
        
        raise ValueError(f"Unknown frequency: {frequency}")


# ==================== Usage Examples ====================

async def example_usage():
    """Example usage of RRuleParser."""
    parser = RRuleParser()
    
    # Calculate next daily occurrence
    current = datetime.utcnow().replace(tzinfo=timezone.utc)
    next_occurrence = parser.calculate_next("DAILY", current)
    print(f"Next daily occurrence: {next_occurrence}")
    
    # Calculate next weekly occurrence with end date
    end_date = datetime(2026, 1, 31, 23, 59, 59, tzinfo=timezone.utc)
    next_occurrence = parser.calculate_next("WEEKLY", current, end_date)
    print(f"Next weekly occurrence: {next_occurrence}")
    
    # Parse full RRULE string
    rrule_string = "FREQ=DAILY;INTERVAL=2;COUNT=10"
    rule = parser.parse_pattern(rrule_string)
    occurrences = list(rule)
    print(f"Occurrences: {occurrences}")
    
    # Validate pattern
    is_valid = parser.validate_pattern("DAILY")
    print(f"Pattern valid: {is_valid}")
    
    # Generate simplified pattern
    pattern = parser.generate_simplified_pattern("DAILY", interval=1)
    print(f"Generated pattern: {pattern}")

