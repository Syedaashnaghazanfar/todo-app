"""
CLI Argument Parser for the Todo In-Memory Python Console Application.

This module defines the argument parser for the command-line interface.
"""

import argparse
from typing import Any


def create_parser() -> argparse.ArgumentParser:
    """
    Create and configure the argument parser for the todo application.

    Returns:
        ArgumentParser: Configured argument parser
    """
    parser = argparse.ArgumentParser(
        description="Todo In-Memory Python Console Application",
        formatter_class=argparse.RawDescriptionHelpFormatter
    )

    subparsers = parser.add_subparsers(dest="command", help="Available commands", required=True)

    # Add task command
    add_parser = subparsers.add_parser("add", help="Add a new task")
    add_parser.add_argument("--title", required=True, help="Title of the task")
    add_parser.add_argument("--description", required=False, default="", help="Description of the task")

    # List tasks command
    list_parser = subparsers.add_parser("list", help="List all tasks")

    # Update task command
    update_parser = subparsers.add_parser("update", help="Update an existing task")
    update_parser.add_argument("--id", type=int, required=True, help="ID of the task to update")
    update_parser.add_argument("--title", required=False, help="New title of the task")
    update_parser.add_argument("--description", required=False, help="New description of the task")

    # Delete task command
    delete_parser = subparsers.add_parser("delete", help="Delete a task")
    delete_parser.add_argument("--id", type=int, required=True, help="ID of the task to delete")

    # Complete task command
    complete_parser = subparsers.add_parser("complete", help="Mark task as complete/incomplete")
    complete_parser.add_argument("--id", type=int, required=True, help="ID of the task to update")
    complete_parser.add_argument("--status", required=True, choices=["complete", "incomplete"],
                                help="Status to set ('complete' or 'incomplete')")

    return parser


def parse_arguments(args: Any = None) -> argparse.Namespace:
    """
    Parse command-line arguments.

    Args:
        args: Arguments to parse (defaults to sys.argv)

    Returns:
        Namespace: Parsed arguments
    """
    parser = create_parser()
    return parser.parse_args(args)