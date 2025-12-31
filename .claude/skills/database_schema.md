# Database Schema Management Skill

## Description
A skill to design and manage the Neon PostgreSQL database schema for the Todo app using SQLModel.

## Usage
Use this skill when implementing or modifying database schema including:
- Creating SQLModel database models
- Designing table relationships
- Managing database migrations
- Optimizing database queries
- Ensuring proper indexing

## MCP Server Integration
- Use `Neon` server for database operations and schema management
- Use `shadcn` server for UI that displays database information

## Implementation Guidelines
1. Use SQLModel for all database models
2. Follow the schema defined in PROJECT-STRUCTURE.md
3. Implement proper relationships between tables
4. Add appropriate indexes for performance
5. Follow database best practices for security and optimization

## Required Models
- Task model with fields: id, user_id, title, description, completed, created_at, updated_at
- Proper foreign key relationship to users table (managed by Better Auth)
- Indexes on user_id for efficient filtering
- Indexes on completed status for efficient status filtering