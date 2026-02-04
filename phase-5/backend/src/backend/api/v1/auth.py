"""Authentication endpoints for signup, login, and logout"""
from fastapi import APIRouter, Depends, status, HTTPException, Response
from sqlalchemy.orm import Session

from backend.api.dependencies import get_db, get_current_user_id
from backend.schemas.auth import SignupRequest, LoginRequest, AuthResponse, LogoutResponse
from backend.schemas.user import UserResponse
from backend.services.auth_service import (
    AuthService,
    DuplicateEmailError,
    InvalidCredentialsError,
    InvalidInputError,
    BetterAuthClientError
)


router = APIRouter(prefix="/auth", tags=["Authentication"])


# Cookie settings for JWT token
# - httponly=True: Cookie not accessible via JavaScript (XSS protection)
# - secure=True: Cookie only sent over HTTPS (production setting)
# - samesite="none": Required for cross-site requests (Vercel → HF Spaces)
# - max_age=2592000: 30 days in seconds (30 * 24 * 60 * 60)
# - path="/": Cookie valid for entire application
import os
IS_PRODUCTION = os.getenv("ENV", "development") == "production"

COOKIE_SETTINGS = {
    "key": "auth_token",
    "httponly": True,
    "secure": IS_PRODUCTION,  # True in production (HTTPS required)
    "samesite": "none" if IS_PRODUCTION else "lax",  # "none" for cross-site (requires secure=True)
    "max_age": 2592000,  # 30 days
    "path": "/"
}


@router.post("/signup", status_code=status.HTTP_201_CREATED, response_model=AuthResponse)
async def signup(
    signup_request: SignupRequest,
    response: Response,
    db: Session = Depends(get_db)
):
    """
    Create new user account and automatically log in.

    Request Body:
        - email: Valid email address (will be normalized to lowercase)
        - password: Minimum 8 characters

    Response:
        - 201 Created: Account created successfully, JWT token set in httpOnly cookie
        - 400 Bad Request: Invalid email format or password too short
        - 409 Conflict: Email already registered
        - 500 Internal Server Error: BetterAuth service error

    Cookie Set:
        - auth_token: JWT token (httpOnly, secure, 30-day expiry)

    Example:
        POST /api/v1/auth/signup
        {
            "email": "user@example.com",
            "password": "securePassword123"
        }

        Response:
        {
            "message": "Account created successfully",
            "user": {
                "id": "550e8400-e29b-41d4-a716-446655440000",
                "email": "user@example.com",
                "created_at": "2025-12-15T12:00:00Z"
            }
        }
    """
    try:
        # Call auth service to create user
        user, jwt_token = await AuthService.signup(
            db=db,
            email=signup_request.email,
            password=signup_request.password
        )

        # Set JWT token in httpOnly cookie (for same-site requests)
        response.set_cookie(**COOKIE_SETTINGS, value=jwt_token)

        # Return user information AND token (for cross-site Authorization header)
        return AuthResponse(
            message="Account created successfully",
            user={
                "id": user.id,
                "email": user.email,
                "created_at": user.created_at.isoformat()
            },
            token=jwt_token  # Include token in response body for cross-domain support
        )

    except InvalidInputError as e:
        # 400 Bad Request - Invalid email format or password too short
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

    except DuplicateEmailError as e:
        # 409 Conflict - Email already registered
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(e)
        )

    except BetterAuthClientError as e:
        # 500 Internal Server Error - BetterAuth service failed
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Authentication service error: {str(e)}"
        )

    except Exception as e:
        # 500 Internal Server Error - Unexpected error
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred: {str(e)}"
        )


@router.post("/login", status_code=status.HTTP_200_OK, response_model=AuthResponse)
async def login(
    login_request: LoginRequest,
    response: Response,
    db: Session = Depends(get_db)
):
    """
    Authenticate user with email and password.

    Request Body:
        - email: Registered email address
        - password: User password

    Response:
        - 200 OK: Login successful, JWT token set in httpOnly cookie
        - 401 Unauthorized: Invalid email or password

    Cookie Set:
        - auth_token: JWT token (httpOnly, secure, 30-day expiry)

    Example:
        POST /api/v1/auth/login
        {
            "email": "user@example.com",
            "password": "securePassword123"
        }

        Response:
        {
            "message": "Welcome back!",
            "user": {
                "id": "550e8400-e29b-41d4-a716-446655440000",
                "email": "user@example.com",
                "created_at": "2025-12-15T12:00:00Z"
            }
        }
    """
    try:
        # Call auth service to authenticate user
        user, jwt_token = await AuthService.login(
            db=db,
            email=login_request.email,
            password=login_request.password
        )

        # Set JWT token in httpOnly cookie (for same-site requests)
        response.set_cookie(**COOKIE_SETTINGS, value=jwt_token)

        # Return user information AND token (for cross-site Authorization header)
        return AuthResponse(
            message="Welcome back!",
            user={
                "id": user.id,
                "email": user.email,
                "created_at": user.created_at.isoformat()
            },
            token=jwt_token  # Include token in response body for cross-domain support
        )

    except InvalidCredentialsError as e:
        # 401 Unauthorized - Invalid email or password
        # Use same error message for both to prevent email enumeration
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e)
        )

    except Exception as e:
        # 500 Internal Server Error - Unexpected error
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred: {str(e)}"
        )


@router.post("/logout", status_code=status.HTTP_200_OK, response_model=LogoutResponse)
async def logout(
    response: Response,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """
    Logout current user by destroying session.

    Requires valid JWT authentication.
    Destroys session in database and clears auth cookie.

    Response:
        - 200 OK: Logout successful, auth cookie cleared, session destroyed
        - 401 Unauthorized: Invalid or missing auth token

    Cookie Cleared:
        - auth_token: Set to empty with max_age=0

    Example:
        POST /api/v1/auth/logout
        Cookie: auth_token=<valid-jwt>

        Response:
        {
            "message": "You have been logged out successfully"
        }
    """
    # Destroy session in database
    AuthService.logout(db, user_id)

    # Clear the auth_token cookie by setting max_age to 0
    response.set_cookie(
        key="auth_token",
        value="",
        httponly=True,
        secure=IS_PRODUCTION,  # Match signup/login setting
        samesite="none" if IS_PRODUCTION else "lax",
        max_age=0,  # Expire immediately
        path="/"
    )

    return LogoutResponse(
        message="You have been logged out successfully"
    )


@router.get("/me", status_code=status.HTTP_200_OK, response_model=UserResponse)
async def get_current_user(
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """
    Get current authenticated user information.

    Requires valid JWT authentication.
    Returns user profile data for the authenticated user.

    Response:
        - 200 OK: Current user information
        - 401 Unauthorized: Not authenticated or invalid token
        - 404 Not Found: User not found in database

    Example:
        GET /api/v1/auth/me
        Cookie: auth_token=<valid-jwt>

        Response:
        {
            "id": "550e8400-e29b-41d4-a716-446655440000",
            "email": "user@example.com",
            "created_at": "2025-12-15T12:00:00Z"
        }
    """
    from backend.models.user import User

    # Query user from database
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Return user information
    return UserResponse(
        id=user.id,
        email=user.email,
        created_at=user.created_at.isoformat()
    )
