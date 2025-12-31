"""JWT token utilities for authentication"""
import os
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any
from jose import JWTError, jwt
from cachetools import TTLCache


# Load JWT configuration from environment variables
JWT_SECRET = os.getenv("JWT_SECRET", "")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
JWT_EXPIRY_DAYS = int(os.getenv("JWT_EXPIRY_DAYS", "30"))

# JWT validation cache with 5-minute TTL (300 seconds)
# Cache key: JWT token string
# Cache value: Dict with decoded payload (user_id, email, exp, iat, iss, aud)
# maxsize: 1000 tokens (reasonable for concurrent users)
jwt_cache = TTLCache(maxsize=1000, ttl=300)


def create_access_token(user_id: str, email: str) -> str:
    """
    Create a JWT access token for authenticated user.

    Args:
        user_id: User UUID as string
        email: User email address

    Returns:
        JWT token string

    Raises:
        ValueError: If JWT_SECRET is not configured

    Token Payload Structure (per jwt-schema.json):
        - sub: user_id (UUID)
        - email: user email
        - exp: expiration timestamp (30 days from now)
        - iat: issued at timestamp
        - iss: "todoapp-api" (issuer)
        - aud: "todoapp-client" (audience)
    """
    if not JWT_SECRET:
        raise ValueError("JWT_SECRET environment variable is not configured")

    # Calculate expiration timestamp
    now = datetime.now(timezone.utc).replace(tzinfo=None)
    expiry = now + timedelta(days=JWT_EXPIRY_DAYS)

    # Build JWT payload per jwt-schema.json contract
    payload = {
        "sub": user_id,  # Subject - User ID
        "email": email,
        "exp": int(expiry.timestamp()),  # Expiration time (Unix timestamp)
        "iat": int(now.timestamp()),  # Issued at time (Unix timestamp)
        "iss": "todoapp-api",  # Issuer
        "aud": "todoapp-client"  # Audience
    }

    # Encode JWT token
    token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return token


def decode_token(token: str, use_cache: bool = True) -> Dict[str, Any]:
    """
    Decode and validate JWT token with optional caching.

    Args:
        token: JWT token string
        use_cache: Whether to use cache (default True)

    Returns:
        Decoded payload dict with keys: sub, email, exp, iat, iss, aud

    Raises:
        JWTError: If token is invalid, expired, or signature verification fails
        ValueError: If JWT_SECRET is not configured

    Cache Behavior:
        - Cache hit (token in cache): Returns cached payload (fast, <5ms)
        - Cache miss: Decodes token, validates, stores in cache, returns payload (~40ms)
        - Cache TTL: 5 minutes (300 seconds)
        - Invalid tokens are NOT cached
    """
    if not JWT_SECRET:
        raise ValueError("JWT_SECRET environment variable is not configured")

    # Check cache first (if enabled)
    if use_cache and token in jwt_cache:
        return jwt_cache[token]

    # Decode and validate JWT token
    # This will raise JWTError if:
    # - Token signature is invalid
    # - Token is expired (exp < now)
    # - Token format is malformed
    payload = jwt.decode(
        token,
        JWT_SECRET,
        algorithms=[JWT_ALGORITHM],
        audience="todoapp-client",  # Verify audience matches
        issuer="todoapp-api"  # Verify issuer matches
    )

    # Validate required fields per jwt-schema.json
    required_fields = ["sub", "exp", "iat"]
    for field in required_fields:
        if field not in payload:
            raise JWTError(f"JWT token missing required field: {field}")

    # Store in cache for future requests (only if valid)
    if use_cache:
        jwt_cache[token] = payload

    return payload


def get_user_id_from_token(token: str) -> str:
    """
    Extract user_id from JWT token.

    Args:
        token: JWT token string

    Returns:
        User ID (UUID string)

    Raises:
        JWTError: If token is invalid or expired
    """
    payload = decode_token(token)
    return payload["sub"]  # "sub" field contains user_id


def get_email_from_token(token: str) -> str:
    """
    Extract email from JWT token.

    Args:
        token: JWT token string

    Returns:
        User email address

    Raises:
        JWTError: If token is invalid or expired
    """
    payload = decode_token(token)
    return payload.get("email", "")


def is_token_expired(token: str) -> bool:
    """
    Check if JWT token is expired (without raising exception).

    Args:
        token: JWT token string

    Returns:
        True if token is expired, False otherwise
    """
    try:
        payload = decode_token(token, use_cache=False)  # Don't cache for expiry check
        exp_timestamp = payload.get("exp", 0)
        return datetime.now(timezone.utc).replace(tzinfo=None).timestamp() > exp_timestamp
    except JWTError:
        return True  # Invalid or malformed tokens are considered expired


def clear_token_cache():
    """
    Clear the JWT validation cache (useful for testing or security events).
    """
    jwt_cache.clear()
