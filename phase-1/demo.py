"""
Demo script to test the Todo application interactively.
Run this to see all features in action!
"""

from src.managers.task_manager import TaskManager
from rich.console import Console
from rich.table import Table
from rich.text import Text

def main():
    console = Console()
    tm = TaskManager()

    console.print("\n[bold cyan]Welcome to Todo App Demo![/bold cyan]\n")

    # 1. Add some tasks
    console.print("[yellow]Step 1: Adding tasks...[/yellow]")
    task1 = tm.add_task("Write documentation", "Create README and user guide")
    task2 = tm.add_task("Fix bug #123", "Resolve the login issue")
    task3 = tm.add_task("Deploy to production", "")
    console.print(f"[green]+ Added task {task1.id}: {task1.title}[/green]")
    console.print(f"[green]+ Added task {task2.id}: {task2.title}[/green]")
    console.print(f"[green]+ Added task {task3.id}: {task3.title}[/green]")

    # 2. List all tasks
    console.print("\n[yellow]Step 2: Listing all tasks...[/yellow]")
    tasks = tm.get_all_tasks()
    table = Table(title="Current Tasks")
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

    # 3. Update a task
    console.print("\n[yellow]Step 3: Updating task 1...[/yellow]")
    tm.update_task(1, title="Write comprehensive documentation",
                   description="Create README, user guide, and API docs")
    console.print("[green]+ Updated task 1[/green]")

    # 4. Mark task as complete
    console.print("\n[yellow]Step 4: Marking task 2 as complete...[/yellow]")
    tm.mark_task_status(2, "complete")
    console.print("[green]+ Marked task 2 as complete[/green]")

    # 5. List tasks again to see changes
    console.print("\n[yellow]Step 5: Listing tasks after updates...[/yellow]")
    tasks = tm.get_all_tasks()
    table2 = Table(title="Updated Tasks")
    table2.add_column("ID", style="bold")
    table2.add_column("Title")
    table2.add_column("Description")
    table2.add_column("Status")

    for task in tasks:
        status_text = Text(task.status)
        if task.status == "complete":
            status_text.stylize("strike green")
        else:
            status_text.stylize("bold")

        table2.add_row(
            str(task.id),
            task.title,
            task.description if task.description else "",
            status_text
        )
    console.print(table2)

    # 6. Delete a task
    console.print("\n[yellow]Step 6: Deleting task 3...[/yellow]")
    tm.delete_task(3)
    console.print("[green]+ Deleted task 3[/green]")

    # 7. Final list
    console.print("\n[yellow]Step 7: Final task list...[/yellow]")
    tasks = tm.get_all_tasks()
    console.print(f"[cyan]Total tasks remaining: {len(tasks)}[/cyan]")
    for task in tasks:
        status_icon = "[X]" if task.status == "complete" else "[ ]"
        console.print(f"  {status_icon} [{task.id}] {task.title}")

    console.print("\n[bold green]Demo completed! All features working perfectly.[/bold green]")
    console.print("\n[dim]Note: Since this is an in-memory app, all data will be lost when the program exits.[/dim]\n")

if __name__ == "__main__":
    main()
