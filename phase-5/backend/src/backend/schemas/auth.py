"""Authentication schemas for API contracts"""
from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from datetime import datetime


class SignupRequest(BaseModel):
    """Schema for user signup request"""
    email: EmailStr = Field(..., description="User email address")
    password: str = Field(..., min_length=8, description="User password (minimum 8 characters)")

    class Config:
        json_schema_extra = {
            "example": {
                "email": "user@example.com",
                "password": "securepassword123"
            }
        }


class LoginRequest(BaseModel):
    """Schema for user login request"""
    email: EmailStr = Field(..., description="User email address")
    password: str = Field(..., description="User password")

    class Config:
        json_schema_extra = {
            "example": {
                "email": "user@example.com",
                "password": "securepassword123"
            }
        }


class AuthResponse(BaseModel):
    """Schema for authentication response (signup and login)"""
    message: str = Field(..., description="Success message")
    user: dict = Field(..., description="User information (id, email, created_at)")
    token: str = Field(..., description="JWT token for Authorization header")

    class Config:
        json_schema_extra = {
            "example": {
                "message": "Login successful",
                "user": {
                    "id": "550e8400-e29b-41d4-a716-446655440000",
                    "email": "user@example.com",
                    "created_at": "2025-12-15T10:30:00Z"
                },
                "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
            }
        }


class LogoutResponse(BaseModel):
    """Schema for logout response"""
    message: str = Field(..., description="Logout success message")

    class Config:
        json_schema_extra = {
            "example": {
                "message": "You have been logged out successfully"
            }
        }
