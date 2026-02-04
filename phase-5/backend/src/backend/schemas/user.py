"""User schemas for API responses"""
from pydantic import BaseModel, Field, EmailStr
from datetime import datetime


class UserResponse(BaseModel):
    """Schema for user response - NEVER includes password_hash"""
    id: str = Field(..., description="User unique identifier (UUID)")
    email: EmailStr = Field(..., description="User email address")
    created_at: datetime = Field(..., description="Account creation timestamp")

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": "550e8400-e29b-41d4-a716-446655440000",
                "email": "user@example.com",
                "created_at": "2025-12-15T10:30:00Z"
            }
        }
