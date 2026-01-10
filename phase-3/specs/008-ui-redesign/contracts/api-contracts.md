# API Contracts: Todo App UI Redesign

## Overview
The UI redesign does not change any API endpoints or contracts. All existing API functionality remains the same, with only visual presentation changing.

## Existing API Endpoints

### Task Management
- `GET /api/v1/tasks` - Retrieve all tasks for the authenticated user
- `POST /api/v1/tasks` - Create a new task
- `PUT /api/v1/tasks/{id}` - Update an existing task
- `DELETE /api/v1/tasks/{id}` - Delete a task
- `PATCH /api/v1/tasks/{id}/complete` - Mark task as completed

### History Management
- `GET /api/v1/history` - Retrieve task history for the authenticated user
- `DELETE /api/v1/history` - Clear all history records

### Authentication (if implemented)
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/logout` - User logout

## Response Format
All API responses maintain the same format as before:
```json
{
  "success": boolean,
  "data": object | array,
  "message": string (optional)
}
```

## Error Format
All API errors maintain the same format as before:
```json
{
  "success": false,
  "error": string,
  "details": object (optional)
}
```

## UI-Specific Contracts
- Theme preferences stored in localStorage with key `todo-app-theme`
- Animation preferences stored in localStorage with key `todo-app-animations-enabled`
- All UI state changes happen client-side without API calls