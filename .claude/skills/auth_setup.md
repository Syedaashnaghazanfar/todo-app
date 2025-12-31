# Authentication Setup Skill

## Description
A skill to implement Better Auth with JWT token integration for the Todo app, ensuring secure communication between frontend and backend.

## Usage
Use this skill when implementing or modifying authentication functionality including:
- Setting up Better Auth in Next.js frontend
- Configuring JWT token generation and validation
- Securing API endpoints
- Implementing user session management
- Connecting frontend auth with backend verification

## MCP Server Integration
- Use `better-auth` server for authentication implementation
- Use `next-devtools` for Next.js frontend implementation
- Use `Neon` server for user data management if needed

## Implementation Guidelines
1. Configure Better Auth with JWT plugin enabled
2. Set up shared secret key (BETTER_AUTH_SECRET) for both frontend and backend
3. Implement middleware in FastAPI to verify JWT tokens
4. Ensure all API endpoints require valid JWT tokens
5. Filter all queries by authenticated user's ID
6. Follow security best practices for token handling

## Key Components to Implement
- Better Auth configuration with JWT
- Frontend API client with JWT token attachment
- FastAPI middleware for JWT verification
- User identification and authorization in all endpoints