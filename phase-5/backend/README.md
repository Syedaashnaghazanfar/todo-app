---
title: Todo App Backend
emoji: 🤖
colorFrom: blue
colorTo: purple
sdk: docker
pinned: false
app_port: 7860
---

# Todo App Backend - Docker Deployment

FastAPI backend with AI chatbot integration using OpenAI Agents SDK and MCP protocol.

## 🚀 Quick Start with Docker

### 1. Build and Run

```bash
# Build the image
docker build -t todo-app-backend .

# Run the container
docker run -p 7860:7860 \
  -e DATABASE_URL="postgresql://..." \
  -e FRONTEND_URL="http://localhost:3000" \
  -e OPENAI_API_KEY="sk-..." \
  todo-app-backend
```

### 2. Using Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 📋 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `FRONTEND_URL` | Yes | Frontend URL for CORS |
| `OPENAI_API_KEY` | Yes | OpenAI API key for AI features |
| `APP_PORT` | No | Port (default: 7860) |
| `DEBUG` | No | Enable debug mode |
| `LOG_LEVEL` | No | Logging level (default: INFO) |

### Example .env file

```bash
DATABASE_URL=postgresql://user:password@host.neon.tech/dbname?sslmode=require
FRONTEND_URL=http://localhost:3000
OPENAI_API_KEY=sk-your-api-key
APP_PORT=7860
DEBUG=False
LOG_LEVEL=INFO
```

## 🏗️ Docker Configuration

### Port Mapping

The container exposes port `7860` (Hugging Face Spaces default). Map to desired port:

```bash
docker run -p 8000:7860 todo-app-backend
```

### Health Check

The image includes a health check at `/api/v1/health`:

```bash
curl http://localhost:7860/api/v1/health
```

Expected response:
```json
{
  "status": "healthy",
  "service": "todo-app-backend"
}
```

## 📁 Project Structure

```
backend/
├── src/
│   ├── api/v1/           # API endpoints (chat, tasks, auth, etc.)
│   ├── models/           # SQLModel database models
│   ├── services/         # Business logic
│   └── main.py           # FastAPI application entry point
├── alembic/              # Database migrations
├── tests/                # Test suite
├── Dockerfile            # Docker image definition
├── docker-compose.yml    # Docker Compose configuration
├── requirements.txt      # Python dependencies
├── pyproject.toml        # Project metadata
└── .env                  # Environment variables (not committed)
```

## 🗄️ Database Setup

### Run Migrations

```bash
# Inside container
docker exec -it todo-app-backend-1 alembic upgrade head
```

### Or use entrypoint script

```bash
docker run todo-app-backend ./start_server.sh
```

## 🔧 Development

### Local Development (without Docker)

```bash
# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
# or
.venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt

# Run migrations
alembic upgrade head

# Start server
uvicorn main:app --reload --port 8000
```

### Running Tests

```bash
# Run all tests
pytest tests/ -v

# Run with coverage
pytest tests/ --cov=src --cov-report=html
```

## 📚 API Documentation

Once running, access:

- **Swagger UI**: http://localhost:7860/api/docs
- **ReDoc**: http://localhost:7860/api/redoc
- **OpenAPI JSON**: http://localhost:7860/api/openapi.json

## 🤖 AI Chatbot Features

The backend includes an AI chatbot with natural language task management:

### Supported Commands

| Command | Example |
|---------|---------|
| Add task | "Add a task to buy groceries" |
| List tasks | "Show me all my tasks" |
| Complete task | "Mark task 5 as complete" |
| Delete task | "Delete the meeting task" |
| Update task | "Change task 1 title to 'Call mom'" |

### MCP Tools Available

1. `add_task` - Create new tasks
2. `list_tasks` - Retrieve tasks (all/pending/completed)
3. `complete_task` - Mark tasks as done
4. `delete_task` - Remove tasks
5. `update_task` - Modify task details

## 🔐 Authentication

The API uses JWT authentication via Better Auth. Include the token in requests:

```bash
curl -X POST http://localhost:7860/api/v1/tasks \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

## 📊 Monitoring

### View Logs

```bash
# Docker logs
docker logs -f todo-app-backend

# With timestamps
docker logs -f --timestamps todo-app-backend
```

### Health Endpoints

- `GET /api/v1/health` - Basic health check
- `GET /api/v1/health/ready` - Readiness check (includes DB)

## 🚨 Troubleshooting

### Database Connection Failed

1. Verify `DATABASE_URL` is correct
2. Ensure `?sslmode=require` is appended
3. Check Neon database is not suspended

### CORS Errors

1. Verify `FRONTEND_URL` matches your frontend origin
2. Ensure HTTPS in production URLs

### Container Won't Start

1. Check logs: `docker logs todo-app-backend`
2. Verify all required env vars are set
3. Ensure port 7860 is not in use

## 📦 Deployment Targets

### Hugging Face Spaces

The Dockerfile is optimized for Hugging Face Spaces deployment:

```bash
# Builds automatically on push to HF
# Uses port 7860 by default
```

### Railway / Render / Fly.io

```bash
# For platforms using PORT env var
docker run -p $PORT:7860 todo-app-backend
```

### AWS ECS / GCP Cloud Run

```bash
# Push to container registry
docker tag todo-app-backend:latest YOUR_REGISTRY/todo-app-backend
docker push YOUR_REGISTRY/todo-app-backend
```

## 📄 License

MIT License - see parent repository for details.

## 🤝 Contributing

See parent repository for contribution guidelines.
