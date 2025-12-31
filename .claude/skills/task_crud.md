# Task CRUD Operations Skill

## Description
A skill to handle all task management operations for the Todo app, using the appropriate MCP servers for different aspects of the implementation.

## Usage
Use this skill when implementing or modifying task management functionality including:
- Creating new tasks
- Reading/listing tasks
- Updating existing tasks
- Deleting tasks
- Marking tasks as complete/incomplete

## MCP Server Integration
- Use `shadcn` server for UI component creation
- Use `Neon` server for database operations
- Use `next-devtools` for Next.js frontend implementation
- Use `better-auth` for authentication integration

## Implementation Guidelines
1. Follow the API endpoint structure defined in PROJECT-STRUCTURE.md
2. Ensure all operations are user-specific (with user_id in endpoints)
3. Implement proper authentication using JWT tokens
4. Use SQLModel for database operations
5. Follow REST API best practices

## API Endpoints to Implement
- GET /api/{user_id}/tasks - List all tasks
- POST /api/{user_id}/tasks - Create a new task
- GET /api/{user_id}/tasks/{id} - Get task details
- PUT /api/{user_id}/tasks/{id} - Update a task
- DELETE /api/{user_id}/tasks/{id} - Delete a task
- PATCH /api/{user_id}/tasks/{id}/complete - Toggle completion