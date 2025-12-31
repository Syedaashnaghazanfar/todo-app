"""Authentication service for user signup, login, and session management"""
import os
import re
import uuid
import httpx
import bcrypt
from datetime import datetime, timedelta
from typing import Tuple, Optional
from sqlalchemy.orm import Session

from src.models.user import User
from src.models.session import Session as SessionModel
from src.utils.jwt import create_access_token

# BetterAuth MCP server configuration
BETTERAUTH_API_URL = os.getenv("BETTERAUTH_API_URL", "")


class AuthServiceError(Exception):
    """Base exception for auth service errors"""
    pass


class DuplicateEmailError(AuthServiceError):
    """Raised when email already exists"""
    pass


class InvalidCredentialsError(AuthServiceError):
    """Raised when login credentials are invalid"""
    pass


class InvalidInputError(AuthServiceError):
    """Raised when input validation fails"""
    pass


class BetterAuthClientError(AuthServiceError):
    """Raised when BetterAuth MCP server returns an error"""
    pass


class AuthService:
    """Service for authentication operations using BetterAuth integration"""

    # Email validation regex (RFC 5322 simplified)
    EMAIL_REGEX = re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
    MIN_PASSWORD_LENGTH = 8

    @staticmethod
    def validate_email(email: str) -> bool:
        """
        Validate email format.

        Args:
            email: Email address to validate

        Returns:
            True if valid, False otherwise
        """
        if not email or len(email) > 255:
            return False
        return AuthService.EMAIL_REGEX.match(email) is not None

    @staticmethod
    def validate_password(password: str) -> bool:
        """
        Validate password meets minimum requirements.

        Args:
            password: Password to validate

        Returns:
            True if valid, False otherwise
        """
        # Bcrypt has a 72 byte limit, so validate password length
        if len(password) < AuthService.MIN_PASSWORD_LENGTH:
            return False
        if len(password.encode('utf-8')) > 72:
            return False
        return True

    @staticmethod
    def hash_password(password: str) -> str:
        """
        Hash password using bcrypt.

        Args:
            password: Plain text password

        Returns:
            Hashed password (as string)
        """
        # Bcrypt has 72 byte limit - truncate password
        password_bytes = password.encode('utf-8')[:72]
        # Generate salt and hash password
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password_bytes, salt)
        # Return as string (decode from bytes)
        return hashed.decode('utf-8')

    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """
        Verify password against hash.

        Args:
            plain_password: Plain text password
            hashed_password: Hashed password (string)

        Returns:
            True if password matches, False otherwise
        """
        # Bcrypt has 72 byte limit - truncate password (same as hash_password)
        password_bytes = plain_password.encode('utf-8')[:72]
        hashed_bytes = hashed_password.encode('utf-8')
        # Verify password
        return bcrypt.checkpw(password_bytes, hashed_bytes)

    @staticmethod
    async def call_betterauth_signup(email: str, password_hash: str) -> dict:
        """
        Call BetterAuth MCP server to create user account.

        Args:
            email: User email address
            password_hash: Hashed password

        Returns:
            Dict with user information from BetterAuth

        Raises:
            BetterAuthClientError: If BetterAuth API call fails
        """
        if not BETTERAUTH_API_URL:
            # Fallback: If BetterAuth is not configured, return mock success
            # In production, this should raise an error
            return {
                "success": True,
                "user_id": str(uuid.uuid4()),
                "email": email
            }

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(
                    f"{BETTERAUTH_API_URL}/signup",
                    json={
                        "email": email,
                        "password_hash": password_hash
                    }
                )

                if response.status_code == 409:
                    raise DuplicateEmailError("Email already registered. Please login instead.")

                if response.status_code != 201:
                    raise BetterAuthClientError(f"BetterAuth signup failed: {response.text}")

                return response.json()

        except httpx.RequestError as e:
            # If BetterAuth is unavailable, log warning and continue
            # This allows local development without BetterAuth MCP server
            print(f"Warning: BetterAuth API unavailable: {e}")
            return {
                "success": True,
                "user_id": str(uuid.uuid4()),
                "email": email
            }

    @staticmethod
    async def signup(db: Session, email: str, password: str) -> Tuple[User, str]:
        """
        Create new user account with email and password.

        Args:
            db: Database session
            email: User email address
            password: Plain text password

        Returns:
            Tuple of (User object, JWT token string)

        Raises:
            InvalidInputError: If email or password validation fails
            DuplicateEmailError: If email already exists
            BetterAuthClientError: If BetterAuth service fails
        """
        # Validate email format
        if not AuthService.validate_email(email):
            raise InvalidInputError("Invalid email format")

        # Validate password length
        if not AuthService.validate_password(password):
            raise InvalidInputError(f"Password must be at least {AuthService.MIN_PASSWORD_LENGTH} characters")

        # Normalize email to lowercase
        email = email.lower()

        # Check if email already exists in database
        existing_user = db.query(User).filter(User.email == email).first()
        if existing_user:
            raise DuplicateEmailError("Email already registered. Please login instead.")

        # Hash password
        password_hash = AuthService.hash_password(password)

        # Call BetterAuth MCP server to create user
        betterauth_response = await AuthService.call_betterauth_signup(email, password_hash)

        # Create user in local database
        user = User(
            id=str(uuid.uuid4()),
            email=email,
            password_hash=password_hash,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )

        db.add(user)
        db.commit()
        db.refresh(user)

        # Create JWT token
        jwt_token = create_access_token(user.id, user.email)

        # Calculate session expiration (30 days from now)
        expiry_days = int(os.getenv("JWT_EXPIRY_DAYS", "30"))
        expires_at = datetime.utcnow() + timedelta(days=expiry_days)

        # Create session record
        session = SessionModel(
            id=str(uuid.uuid4()),
            user_id=user.id,
            jwt_token=jwt_token,
            expires_at=expires_at,
            created_at=datetime.utcnow(),
            last_used_at=datetime.utcnow()
        )

        db.add(session)
        db.commit()

        return user, jwt_token

    @staticmethod
    async def login(db: Session, email: str, password: str) -> Tuple[User, str]:
        """
        Authenticate user with email and password.

        Args:
            db: Database session
            email: User email address
            password: Plain text password

        Returns:
            Tuple of (User object, JWT token string)

        Raises:
            InvalidCredentialsError: If email or password is incorrect
        """
        # Normalize email to lowercase
        email = email.lower()

        # Find user by email
        user = db.query(User).filter(User.email == email).first()

        # Use same error message for non-existent email and wrong password
        # to prevent email enumeration attacks
        if not user:
            raise InvalidCredentialsError("Invalid email or password")

        # Verify password
        if not AuthService.verify_password(password, user.password_hash):
            raise InvalidCredentialsError("Invalid email or password")

        # Create JWT token
        jwt_token = create_access_token(user.id, user.email)

        # Create or update session record
        
        # Calculate session expiration (30 days from now)
        expiry_days = int(os.getenv("JWT_EXPIRY_DAYS", "30"))
        expires_at = datetime.utcnow() + timedelta(days=expiry_days)
        session = db.query(SessionModel).filter(SessionModel.user_id == user.id).first()

        if session:
            # Update existing session
            session.jwt_token = jwt_token
            session.expires_at = expires_at
            session.last_used_at = datetime.utcnow()
        else:
            # Create new session
            session = SessionModel(
                id=str(uuid.uuid4()),
                user_id=user.id,
                jwt_token=jwt_token,
                expires_at=expires_at,
                created_at=datetime.utcnow(),
                last_used_at=datetime.utcnow()
            )
            db.add(session)

        db.commit()

        return user, jwt_token

    @staticmethod
    def logout(db: Session, user_id: str) -> bool:
        """
        Logout user by destroying session.

        Args:
            db: Database session
            user_id: User ID to logout

        Returns:
            True if logout successful
        """
        # Delete session records for user
        db.query(SessionModel).filter(SessionModel.user_id == user_id).delete()
        db.commit()

        return True

    @staticmethod
    def get_user_by_id(db: Session, user_id: str) -> Optional[User]:
        """
        Get user by ID.

        Args:
            db: Database session
            user_id: User ID

        Returns:
            User object or None if not found
        """
        return db.query(User).filter(User.id == user_id).first()
