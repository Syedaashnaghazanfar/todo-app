# Quick Start Guide: Backend Task Management

**Objective**: Set up the backend development environment and verify API functionality.

**Time**: ~15-20 minutes
**Prerequisites**: Python 3.11+, git, curl or Postman

## Step 1: Clone or Navigate to Repository

```bash
cd D:/code/Q4/hackathon-2/todo-app
```

## Step 2: Create Python Virtual Environment

```bash
# Windows
python -m venv venv
.\venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

**Verify activation**: Prompt should show `(venv)` prefix.

## Step 3: Create Backend Directory Structure

```bash
mkdir -p backend
cd backend
```

## Step 4: Create requirements.txt

Create `backend/requirements.txt`:

```
fastapi==0.109.0
uvicorn[standard]==0.27.0
sqlalchemy==2.0.23
alembic==1.13.1
psycopg2-binary==2.9.9
python-dotenv==1.0.0
pydantic==2.5.0
python-dateutil==2.8.2
pytest==7.4.3
pytest-asyncio==0.21.1
httpx==0.25.2
```

## Step 5: Install Dependencies

```bash
pip install -r requirements.txt
```

**Verify**: Should complete without errors.

## Step 6: Set Up Neon PostgreSQL Connection

### Option A: Use Existing Neon Project

Get connection string from Neon console (Settings → Connection String):

```
postgresql://[user]:[password]@[host]/[database]?sslmode=require
```

### Option B: Create New Neon Project

1. Visit [Neon Console](https://console.neon.tech)
2. Create new project (or use existing)
3. Copy connection string

## Step 7: Create .env File

Create `backend/.env`:

```env
# Database
DATABASE_URL=postgresql://[user]:[password]@[host]/[database]?sslmode=require

# Server
DEBUG=True
HOST=0.0.0.0
PORT=8000

# CORS
FRONTEND_URL=http://localhost:3000

# Logging
LOG_LEVEL=INFO
```

**Security**: Never commit .env file. Add to .gitignore.

## Step 8: Create Initial Project Structure

Create the following files:

### backend/main.py

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="Todo App Backend",
    version="0.1.0",
    docs_url="/api/docs",
    openapi_url="/api/openapi.json"
)

# CORS Configuration
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/v1/health")
async def health_check():
    return {"status": "healthy", "service": "todo-app-backend"}

@app.get("/")
async def root():
    return {"message": "Todo App Backend API - See /api/docs for endpoints"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
```

### backend/config.py

```python
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
DEBUG = os.getenv("DEBUG", "False").lower() == "true"
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
```

### backend/src/__init__.py

(Empty file)

### backend/src/database/__init__.py

(Empty file)

### backend/src/database/connection.py

```python
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import NullPool
from config import DATABASE_URL

# Neon recommends NullPool for serverless/managed deployments
engine = create_engine(
    DATABASE_URL,
    poolclass=NullPool,
    echo=False,
    connect_args={"timeout": 30}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

## Step 9: Initialize Alembic for Database Migrations

```bash
alembic init alembic
```

### Edit alembic/env.py

Update the database URL configuration to use your DATABASE_URL from config:

```python
# In the configure_logger section, after imports:
from config import DATABASE_URL

# In the run_migrations_offline() and run_migrations_online() functions:
# Replace: configuration.get_main_option("sqlalchemy.url")
# With: DATABASE_URL
```

## Step 10: Create Your First Model

### backend/src/models/__init__.py

```python
from .task import Task
from .task_history import TaskHistory

__all__ = ["Task", "TaskHistory"]
```

### backend/src/models/task.py

```python
from sqlalchemy import Column, String, Text, Boolean, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import declarative_base
from datetime import datetime
import uuid

Base = declarative_base()

class Task(Base):
    __tablename__ = "tasks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    is_completed = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    completed_at = Column(DateTime, nullable=True)

    def __repr__(self):
        return f"<Task(id={self.id}, title={self.title}, is_completed={self.is_completed})>"
```

### backend/src/models/task_history.py

```python
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import declarative_base, relationship
from datetime import datetime
import uuid
import enum

Base = declarative_base()

class ActionType(str, enum.Enum):
    CREATED = "CREATED"
    UPDATED = "UPDATED"
    DELETED = "DELETED"
    COMPLETED = "COMPLETED"
    INCOMPLETED = "INCOMPLETED"

class TaskHistory(Base):
    __tablename__ = "task_history"

    history_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    task_id = Column(UUID(as_uuid=True), ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False)
    action_type = Column(Enum(ActionType), nullable=False)
    description = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)

    def __repr__(self):
        return f"<TaskHistory(history_id={self.history_id}, task_id={self.task_id}, action={self.action_type})>"
```

## Step 11: Create First Migration

```bash
alembic revision --autogenerate -m "Initial schema: tasks and task_history tables"
```

Verify the migration file in `alembic/versions/` looks correct.

## Step 12: Run Migrations

```bash
alembic upgrade head
```

**Check database**: Connect to Neon and verify `tasks` and `task_history` tables exist.

## Step 13: Start Development Server

```bash
python main.py
```

**Output**: Should show:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
```

## Step 14: Verify API is Running

### In browser or curl:

```bash
# Health check
curl http://localhost:8000/api/v1/health

# OpenAPI documentation
# Visit: http://localhost:8000/api/docs
```

**Expected response**:
```json
{
  "status": "healthy",
  "service": "todo-app-backend"
}
```

## Step 15: Test API with Sample Request (Future)

After implementing endpoints:

```bash
# Create a task
curl -X POST http://localhost:8000/api/v1/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Test Task", "description": "Testing the API"}'

# List tasks
curl http://localhost:8000/api/v1/tasks

# Get stats
curl http://localhost:8000/api/v1/stats/weekly
```

## Troubleshooting

### Database Connection Error

**Problem**: `psycopg2.OperationalError: FATAL: password authentication failed`

**Solution**:
- Verify DATABASE_URL in .env is correct
- Check username/password in Neon console
- Ensure sslmode=require is included

### Port Already in Use

**Problem**: `Address already in use`

**Solution**:
```bash
# Change port in .env or command line:
python main.py --port 8001
```

### Import Errors

**Problem**: `ModuleNotFoundError: No module named 'fastapi'`

**Solution**:
- Verify virtual environment is activated: `(venv)` in prompt
- Reinstall requirements: `pip install -r requirements.txt`

## Next Steps

1. **Implement CRUD endpoints** (see contracts/task-endpoints.md)
2. **Add Pydantic schemas** for request/response validation
3. **Implement business logic** in services/
4. **Add comprehensive tests** in tests/ directory
5. **Set up CI/CD pipeline** for automated testing
6. **Deploy to production** (Heroku, Railway, AWS, etc.)

## Development Workflow

1. Make code changes
2. Auto-reload restarts server (development mode)
3. Test changes with curl/Postman/frontend
4. Run tests: `pytest tests/`
5. Commit changes with clear messages
6. Create migration if schema changed: `alembic revision --autogenerate`

## Useful Commands

```bash
# Run all tests
pytest tests/ -v

# Run specific test
pytest tests/contract/test_tasks_create.py -v

# Generate coverage report
pytest tests/ --cov=src --cov-report=html

# Format code with black
black src/ tests/

# Check imports with isort
isort src/ tests/

# Type checking with mypy
mypy src/
```

## API Documentation

While running, Swagger UI is available at:
- **Swagger**: http://localhost:8000/api/docs
- **ReDoc**: http://localhost:8000/api/redoc
- **OpenAPI JSON**: http://localhost:8000/api/openapi.json

## Learn More

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)
- [Alembic Documentation](https://alembic.sqlalchemy.org/)
- [Neon Documentation](https://neon.tech/docs)
