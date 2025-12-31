from .task import TaskCreate, TaskUpdate, TaskResponse
from .history import HistoryResponse, PaginatedHistoryResponse, PaginationMetadata, WeeklyStatsResponse
from .auth import SignupRequest, LoginRequest, AuthResponse, LogoutResponse
from .user import UserResponse

__all__ = [
    # Task schemas
    "TaskCreate",
    "TaskUpdate",
    "TaskResponse",
    # History schemas
    "HistoryResponse",
    "PaginatedHistoryResponse",
    "PaginationMetadata",
    "WeeklyStatsResponse",
    # Auth schemas
    "SignupRequest",
    "LoginRequest",
    "AuthResponse",
    "LogoutResponse",
    # User schemas
    "UserResponse",
]
