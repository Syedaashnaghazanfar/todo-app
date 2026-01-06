from sqlalchemy.orm import Session
from fastapi import Depends, HTTPException, Cookie, Header, status
from typing import Optional
from jose import JWTError
from backend.database.connection import SessionLocal
from backend.utils.jwt import decode_token


def get_db() -> Session:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user_id(
    auth_token: Optional[str] = Cookie(None),
    authorization: Optional[str] = Header(None)
) -> str:
    """
    Extract user_id from JWT token (Cookie OR Authorization header).

    Supports both authentication methods for cross-domain compatibility:
    1. Cookie: auth_token (same-site requests)
    2. Authorization header: Bearer token (cross-site requests)

    Args:
        auth_token: JWT token from Cookie header
        authorization: Bearer token from Authorization header

    Returns:
        user_id: User UUID as string

    Raises:
        HTTPException 401: If token is missing, invalid, or expired

    Cache Behavior:
        - Uses JWT caching from decode_token (5-minute TTL)
        - Cache hit: <5ms response time
        - Cache miss: ~40ms for JWT validation
    """
    import logging
    logger = logging.getLogger(__name__)

    # Debug logging
    logger.info(f"[AUTH] Cookie token present: {bool(auth_token)}")
    logger.info(f"[AUTH] Authorization header present: {bool(authorization)}")
    if authorization:
        logger.info(f"[AUTH] Authorization header value: {authorization[:30]}...")

    # Try Authorization header first (for cross-domain requests)
    token = None
    if authorization and authorization.startswith("Bearer "):
        token = authorization.replace("Bearer ", "")
        logger.info(f"[AUTH] Extracted token from Authorization header: {token[:20]}...")
    # Fall back to cookie (for same-site requests)
    elif auth_token:
        token = auth_token
        logger.info(f"[AUTH] Using token from cookie: {token[:20]}...")

    if not token:
        logger.error("[AUTH] No token found in either Authorization header or cookie!")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please login to access this resource."
        )

    try:
        # decode_token already implements caching with 5-minute TTL
        # It will raise JWTError if token is invalid, expired, or malformed
        payload = decode_token(token, use_cache=True)
        user_id = payload.get("sub")

        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: missing user identifier"
            )

        return user_id

    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid or expired token: {str(e)}"
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token validation failed: {str(e)}"
        )
