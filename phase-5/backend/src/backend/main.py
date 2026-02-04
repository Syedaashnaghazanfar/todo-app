from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os
import logging
from dotenv import load_dotenv
from backend.api.v1.tasks import router as tasks_router
from backend.api.v1.history import router as history_router
from backend.api.v1.stats import router as stats_router
from backend.api.v1.auth import router as auth_router
from backend.api.v1.notifications import router as notifications_router
from backend.api.v1.recurring import router as recurring_router  # Phase 5 Recurring Tasks
from backend.exceptions.handlers import register_exception_handlers
from backend.api.v1.chatkit_proper import router as chatkit_router  # Phase 3 ChatKit endpoint (consolidated)
from backend.tasks.reminder_scheduler import start_scheduler, shutdown_scheduler

load_dotenv()

# Configure logging to show INFO level
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    FastAPI lifespan context manager for startup and shutdown events.

    Startup:
    - Initialize and start the reminder scheduler

    Shutdown:
    - Gracefully stop the reminder scheduler
    """
    # Startup
    try:
        logger.info("[Lifespan] Starting reminder scheduler...")
        start_scheduler()
        logger.info("[Lifespan] Reminder scheduler started successfully")
    except Exception as e:
        logger.error(f"[Lifespan] Failed to start scheduler: {str(e)}", exc_info=True)
        raise

    yield

    # Shutdown
    try:
        logger.info("[Lifespan] Shutting down reminder scheduler...")
        shutdown_scheduler()
        logger.info("[Lifespan] Reminder scheduler stopped successfully")
    except Exception as e:
        logger.error(f"[Lifespan] Error during scheduler shutdown: {str(e)}", exc_info=True)


app = FastAPI(
    title="Todo App Backend",
    version="0.1.0",
    docs_url="/api/docs",
    openapi_url="/api/openapi.json",
    lifespan=lifespan
)

# CORS Configuration
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],  # Allow frontend to read all response headers
)

# Register exception handlers
register_exception_handlers(app)

# Include routers
app.include_router(auth_router, prefix="/api/v1")
app.include_router(tasks_router, prefix="/api/v1")
app.include_router(history_router, prefix="/api/v1")
app.include_router(stats_router, prefix="/api/v1")
app.include_router(notifications_router, prefix="/api/v1")
app.include_router(recurring_router, prefix="/api/v1")  # Phase 5 Recurring Tasks
app.include_router(chatkit_router)  # Phase 3 ChatKit endpoint (consolidated, prefix already in router)

@app.get("/api/v1/health")
async def health_check():
    return {"status": "healthy", "service": "todo-app-backend"}

@app.get("/")
async def root():
    return {"message": "Todo App Backend API - See /api/docs for endpoints"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("APP_PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
