from fastapi import APIRouter

# Create the v1 API router
router = APIRouter(prefix="/api/v1", tags=["v1"])

# Routes will be included here after implementation
# from .tasks import router as tasks_router
# from .history import router as history_router
# from .stats import router as stats_router

# router.include_router(tasks_router)
# router.include_router(history_router)
# router.include_router(stats_router)
