"""
Main application entry point for the Todo In-Memory Python Console Application.

This module contains the main application logic that ties together
the CLI, models, and managers to provide the complete functionality.
"""

import sys
from rich.console import Console
from rich.table import Table
from rich.text import Text

from src.managers.task_manager import TaskManager
from src.cli.arg_parser import parse_arguments


def main():
    """
    Main entry point for the todo application.
    """
    console = Console()
    task_manager = TaskManager()

    try:
        args = parse_arguments()

        if args.command == "add":
            # Validate title length
            if len(args.title) < 1 or len(args.title) > 255:
                console.print("[red]Error: Title must be between 1 and 255 characters[/red]")
                sys.exit(1)

            # Validate description length if provided
            if hasattr(args, 'description') and args.description and len(args.description) > 1000:
                console.print("[red]Error: Description exceeds 1000 characters[/red]")
                sys.exit(1)

            task = task_manager.add_task(args.title, args.description)
            console.print(f"[green]Task added successfully with ID: {task.id}[/green]")

        elif args.command == "list":
            tasks = task_manager.get_all_tasks()

            if not tasks:
                console.print("[yellow]No tasks found[/yellow]")
                return

            table = Table(title="Todo Tasks")
            table.add_column("ID", style="bold")
            table.add_column("Title")
            table.add_column("Description")
            table.add_column("Status")

            for task in tasks:
                status_text = Text(task.status)
                if task.status == "complete":
                    status_text.stylize("strike green")
                else:
                    status_text.stylize("bold")

                table.add_row(
                    str(task.id),
                    task.title,
                    task.description if task.description else "",
                    status_text
                )

            console.print(table)

        elif args.command == "update":
            # Validate title length if provided
            if hasattr(args, 'title') and args.title is not None:
                if len(args.title) < 1 or len(args.title) > 255:
                    console.print("[red]Error: Title must be between 1 and 255 characters[/red]")
                    sys.exit(1)

            # Validate description length if provided
            if hasattr(args, 'description') and args.description is not None:
                if len(args.description) > 1000:
                    console.print("[red]Error: Description exceeds 1000 characters[/red]")
                    sys.exit(1)

            success = task_manager.update_task(args.id, args.title, args.description)
            if success:
                console.print(f"[green]Task {args.id} updated successfully[/green]")
            else:
                console.print(f"[red]Error: Task with ID {args.id} not found[/red]")
                sys.exit(1)

        elif args.command == "delete":
            success = task_manager.delete_task(args.id)
            if success:
                console.print(f"[green]Task {args.id} deleted successfully[/green]")
            else:
                console.print(f"[red]Error: Task with ID {args.id} not found[/red]")
                sys.exit(1)

        elif args.command == "complete":
            success = task_manager.mark_task_status(args.id, args.status)
            if success:
                console.print(f"[green]Task {args.id} marked as {args.status} successfully[/green]")
            else:
                console.print(f"[red]Error: Task with ID {args.id} not found[/red]")
                sys.exit(1)

    except ValueError as e:
        console.print(f"[red]Error: {str(e)}[/red]")
        sys.exit(1)
    except SystemExit:
        # Re-raise SystemExit to preserve exit codes
        raise
    except Exception as e:
        console.print(f"[red]An unexpected error occurred: {str(e)}[/red]")
        sys.exit(1)


if __name__ == "__main__":
    main()