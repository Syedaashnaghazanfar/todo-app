"""
RRULE Parsing Service

Parses RRULE strings and calculates next occurrences for recurring tasks.
Uses python-dateutil for RFC 5545 RRULE support.

Phase 5: Enterprise Cloud Infrastructure - Recurring Task Lifecycle Management
"""
from datetime import datetime, timezone
from typing import Optional
from dateutil import rrule
from dateutil.rrule import rrulestr
import logging

logger = logging.getLogger(__name__)


class RRuleParsingError(Exception):
    """Raised when RRULE parsing fails"""
    pass


class RRuleService:
    """
    Service for parsing RRULE strings and calculating next task occurrences.

    Supported RRULE parameters:
    - FREQ: DAILY, WEEKLY, MONTHLY, YEARLY
    - INTERVAL: How often to repeat (e.g., INTERVAL=2 for every 2 weeks)
    - BYDAY: Days of week (MO, TU, WE, TH, FR, SA, SU)
    - COUNT: Number of occurrences before stopping
    - UNTIL: End date for recurrence
    """

    @staticmethod
    def parse_rrule(rrule_string: str, start_date: Optional[datetime] = None) -> rrule.rrule:
        """
        Parse an RRULE string into a python-dateutil rrule object.

        Args:
            rrule_string: RRULE format string (e.g., "FREQ=DAILY;INTERVAL=1")
            start_date: Starting date for recurrence (defaults to now)

        Returns:
            rrule.rrule object for calculating occurrences

        Raises:
            RRuleParsingError: If RRULE string is invalid
        """
        try:
            # Default to current UTC time if no start date provided
            if start_date is None:
                start_date = datetime.now(timezone.utc)

            # Ensure start_date is timezone-aware (UTC)
            if start_date.tzinfo is None:
                start_date = start_date.replace(tzinfo=timezone.utc)

            # Parse the RRULE string with start date
            # Format: DTSTART:20260114T000000Z\nRRULE:FREQ=DAILY;INTERVAL=1
            dtstart_str = start_date.strftime("%Y%m%dT%H%M%SZ")
            full_rrule = f"DTSTART:{dtstart_str}\nRRULE:{rrule_string}"

            parsed_rule = rrulestr(full_rrule, dtstart=start_date)

            logger.debug(f"Successfully parsed RRULE: {rrule_string} with start date {start_date}")
            return parsed_rule

        except Exception as e:
            logger.error(f"Failed to parse RRULE string '{rrule_string}': {str(e)}")
            raise RRuleParsingError(f"Invalid RRULE string: {str(e)}")

    @staticmethod
    def calculate_next_occurrence(
        rrule_string: str,
        after_date: Optional[datetime] = None,
        start_date: Optional[datetime] = None
    ) -> Optional[datetime]:
        """
        Calculate the next occurrence after a given date.

        Args:
            rrule_string: RRULE format string
            after_date: Calculate next occurrence after this date (defaults to now)
            start_date: Original start date of the recurrence series

        Returns:
            Next occurrence datetime (UTC) or None if no more occurrences

        Raises:
            RRuleParsingError: If RRULE string is invalid
        """
        try:
            # Default to current UTC time if no after_date provided
            if after_date is None:
                after_date = datetime.now(timezone.utc)

            # Ensure after_date is timezone-aware (UTC)
            if after_date.tzinfo is None:
                after_date = after_date.replace(tzinfo=timezone.utc)

            # Parse the RRULE
            parsed_rule = RRuleService.parse_rrule(rrule_string, start_date)

            # Get the next occurrence after the given date
            next_occurrence = parsed_rule.after(after_date, inc=False)

            if next_occurrence:
                # Ensure result is timezone-aware (UTC)
                if next_occurrence.tzinfo is None:
                    next_occurrence = next_occurrence.replace(tzinfo=timezone.utc)
                logger.debug(f"Next occurrence calculated: {next_occurrence}")
            else:
                logger.info(f"No more occurrences for RRULE: {rrule_string}")

            return next_occurrence

        except RRuleParsingError:
            raise
        except Exception as e:
            logger.error(f"Failed to calculate next occurrence: {str(e)}")
            raise RRuleParsingError(f"Failed to calculate next occurrence: {str(e)}")

    @staticmethod
    def validate_rrule(rrule_string: str) -> bool:
        """
        Validate an RRULE string without calculating occurrences.

        Args:
            rrule_string: RRULE format string to validate

        Returns:
            True if valid, False otherwise
        """
        try:
            RRuleService.parse_rrule(rrule_string)
            return True
        except RRuleParsingError:
            return False

    @staticmethod
    def get_occurrences_between(
        rrule_string: str,
        start_date: datetime,
        end_date: datetime,
        include_start: bool = True
    ) -> list[datetime]:
        """
        Get all occurrences between two dates.

        Args:
            rrule_string: RRULE format string
            start_date: Start of date range
            end_date: End of date range
            include_start: Whether to include occurrences on start_date

        Returns:
            List of occurrence datetimes (UTC)

        Raises:
            RRuleParsingError: If RRULE string is invalid
        """
        try:
            # Ensure dates are timezone-aware (UTC)
            if start_date.tzinfo is None:
                start_date = start_date.replace(tzinfo=timezone.utc)
            if end_date.tzinfo is None:
                end_date = end_date.replace(tzinfo=timezone.utc)

            # Parse the RRULE
            parsed_rule = RRuleService.parse_rrule(rrule_string, start_date)

            # Get occurrences between dates
            occurrences = list(parsed_rule.between(start_date, end_date, inc=include_start))

            logger.debug(f"Found {len(occurrences)} occurrences between {start_date} and {end_date}")
            return occurrences

        except RRuleParsingError:
            raise
        except Exception as e:
            logger.error(f"Failed to get occurrences between dates: {str(e)}")
            raise RRuleParsingError(f"Failed to get occurrences: {str(e)}")

    @staticmethod
    def simplify_rrule_for_display(rrule_string: str) -> str:
        """
        Convert RRULE string to human-readable format.

        Args:
            rrule_string: RRULE format string

        Returns:
            Human-readable recurrence description
        """
        try:
            parsed_rule = RRuleService.parse_rrule(rrule_string)

            # Use python-dateutil's built-in humanization (if available)
            # Otherwise, provide basic formatting
            freq_map = {
                rrule.DAILY: "daily",
                rrule.WEEKLY: "weekly",
                rrule.MONTHLY: "monthly",
                rrule.YEARLY: "yearly"
            }

            freq = parsed_rule._freq
            interval = parsed_rule._interval

            if interval == 1:
                return freq_map.get(freq, "unknown")
            else:
                return f"every {interval} {freq_map.get(freq, 'unknown')}s"

        except Exception:
            return "custom recurrence"
