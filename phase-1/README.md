# Todo In-Memory Python Console Application

A command-line Todo application built with Python 3.13+, featuring in-memory storage with no file persistence. This application implements the 5 basic CRUD operations for managing tasks.

## Features

- Add new tasks with titles and descriptions
- View and list all tasks with their status
- Update existing tasks
- Delete tasks
- Mark tasks as complete or incomplete

## Prerequisites

- Python 3.13 or higher
- UV package manager

## Setup Instructions

1. Clone the repository:
```bash
git clone <repository-url>
cd todo-app
```

2. Install dependencies using UV:
```bash
uv sync
```

Or if you prefer pip:
```bash
pip install -r requirements.txt
```

3. Run the application:
```bash
python -m src.todo_app
```

## Usage

The application supports the following commands:

- `add` - Add a new task
  ```bash
  python -m src.todo_app add --title "Task Title" --description "Optional description"
  ```

- `list` - View all tasks
  ```bash
  python -m src.todo_app list
  ```

- `update` - Modify an existing task
  ```bash
  python -m src.todo_app update --id <task_id> --title "New Title" --description "New description"
  ```

- `delete` - Remove a task
  ```bash
  python -m src.todo_app delete --id <task_id>
  ```

- `complete` - Mark task as complete/incomplete
  ```bash
  python -m src.todo_app complete --id <task_id> --status [complete|incomplete]
  ```

### Usage Examples

1. Add a new task:
   ```bash
   python -m src.todo_app add --title "Buy groceries" --description "Milk and bread"
   ```

2. List all tasks:
   ```bash
   python -m src.todo_app list
   ```

3. Update a task:
   ```bash
   python -m src.todo_app update --id 1 --title "Buy groceries and cook dinner" --description "Milk, bread, and vegetables"
   ```

4. Mark a task as complete:
   ```bash
   python -m src.todo_app complete --id 1 --status complete
   ```

5. Delete a task:
   ```bash
   python -m src.todo_app delete --id 1
   ```

## Project Structure

- `/src` - Source code for the application
  - `/models` - Data models (Task class)
  - `/managers` - Business logic (TaskManager)
  - `/cli` - Command-line interface components
- `/specs` - Specification documents and history
- `/tests` - Test files
- `/history/prompts` - Prompt History Records
- `README.md` - This file
- `CLAUDE.md` - Claude Code usage rules
- `.specify/memory/constitution.md` - Project constitution
- `.specify/memory/plan.md` - Implementation plan
- `.specify/memory/tasks.md` - Development tasks

## Development

This project follows Spec-Driven Development principles and is built according to the project constitution. All contributions must comply with the established principles and guidelines.

## Testing

Run tests with pytest:
```bash
pytest tests/
```

## Architecture

This application follows clean architecture principles with in-memory data storage, ensuring simplicity and avoiding complex persistence mechanisms. All data is stored exclusively in program memory (RAM) and resets on each application restart.