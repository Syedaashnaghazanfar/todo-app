# Phase II Todo App Specification

## Overview
This specification outlines the implementation of Phase II of the Todo app: a full-stack web application with authentication and persistent storage.

## Requirements
- Implement all 5 Basic Level features as a web application
- Create RESTful API endpoints
- Build responsive frontend interface
- Store data in Neon Serverless PostgreSQL database
- Authentication – Implement user signup/signin using Better Auth

## Technology Stack
- Frontend: Next.js 16+ (App Router)
- Backend: Python FastAPI
- ORM: SQLModel
- Database: Neon Serverless PostgreSQL
- Spec-Driven: Claude Code + Spec-Kit Plus
- Authentication: Better Auth

## Skills to Use
The following skills should be leveraged during implementation:

1. **task_crud.md**: For implementing all task management operations
2. **auth_setup.md**: For implementing Better Auth with JWT integration
3. **database_schema.md**: For designing and managing the database schema
4. **frontend_components.md**: For creating the UI components

## Implementation Phases
1. Set up project structure with frontend and backend
2. Implement backend API with FastAPI and SQLModel
3. Set up database schema for tasks
4. Implement Better Auth with JWT
5. Create frontend components for task management
6. Connect frontend to backend API
7. Test complete workflow

## API Endpoints
- GET /api/{user_id}/tasks - List all tasks
- POST /api/{user_id}/tasks - Create a new task
- GET /api/{user_id}/tasks/{id} - Get task details
- PUT /api/{user_id}/tasks/{id} - Update a task
- DELETE /api/{user_id}/tasks/{id} - Delete a task
- PATCH /api/{user_id}/tasks/{id}/complete - Toggle completion

## MCP Server Integration
- Use `next-devtools` for Next.js development
- Use `shadcn` for UI component creation
- Use `Neon` for database operations
- Use `better-auth` for authentication implementation
- Use `context7` for additional development context

## Subagents to Use
The following subagents should be leveraged during implementation to enhance development efficiency:

1. **ui-builder-subagent**: For generating React components dynamically based on skill outputs with consistent styling and animations
2. **data-fetcher-subagent**: For retrieving and preparing data from APIs, databases, or skill outputs for UI display
3. **theme-sub-agent**: For implementing and reviewing React components with consistent purple theme and accessibility compliance
4. **data-processor-sub-agent**: For transforming raw data from APIs or databases into formatted, consumable datasets for UI components
5. **frontend-data-integrator**: For transforming skill outputs (JSON objects, arrays, or API responses) into React component props and JSX for rendering
6. **chart-visualizer**: For converting numerical or structured data into interactive, production-ready React charts
7. **auth-security-validator**: For validating user credentials, authenticating requests, and ensuring secure interactions with databases and APIs