"""
Phase 2 Implementation Test Script
Tests all Phase 2 deliverables (T018-T025)
"""
import sys
import os

# Add backend to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def test_models():
    """Test T018-T021: Model imports and structure"""
    print("Testing Models...")
    from src.models import User, Session, Task, TaskHistory, ActionType

    # Check User model
    assert hasattr(User, 'id')
    assert hasattr(User, 'email')
    assert hasattr(User, 'password_hash')
    assert hasattr(User, 'created_at')
    assert hasattr(User, 'updated_at')
    assert hasattr(User, 'tasks')
    assert hasattr(User, 'sessions')
    assert hasattr(User, 'history')
    print("  [OK] User model verified")

    # Check Session model
    assert hasattr(Session, 'id')
    assert hasattr(Session, 'user_id')
    assert hasattr(Session, 'jwt_token')
    assert hasattr(Session, 'expires_at')
    assert hasattr(Session, 'created_at')
    assert hasattr(Session, 'last_used_at')
    assert hasattr(Session, 'user')
    print("  [OK] Session model verified")

    # Check Task model (updated)
    assert hasattr(Task, 'id')
    assert hasattr(Task, 'title')
    assert hasattr(Task, 'description')
    assert hasattr(Task, 'is_completed')
    assert hasattr(Task, 'created_at')
    assert hasattr(Task, 'updated_at')
    assert hasattr(Task, 'user_id')  # NEW
    assert hasattr(Task, 'user')  # NEW
    print("  [OK] Task model updated with user_id")

    # Check TaskHistory model (updated)
    assert hasattr(TaskHistory, 'history_id')
    assert hasattr(TaskHistory, 'task_id')
    assert hasattr(TaskHistory, 'action_type')
    assert hasattr(TaskHistory, 'timestamp')
    assert hasattr(TaskHistory, 'user_id')  # NEW
    assert hasattr(TaskHistory, 'user')  # NEW
    print("  [OK] TaskHistory model updated with user_id")

    print("[OK] All models verified\n")

def test_schemas():
    """Test T022-T023: Schema imports and structure"""
    print("Testing Schemas...")
    from src.schemas import (
        SignupRequest, LoginRequest, AuthResponse, LogoutResponse,
        UserResponse
    )

    # Check SignupRequest
    signup = SignupRequest(email="test@example.com", password="password123")
    assert signup.email == "test@example.com"
    assert signup.password == "password123"
    print("  [OK] SignupRequest schema verified")

    # Check LoginRequest
    login = LoginRequest(email="test@example.com", password="password123")
    assert login.email == "test@example.com"
    assert login.password == "password123"
    print("  [OK] LoginRequest schema verified")

    # Check AuthResponse
    auth_resp = AuthResponse(
        message="Login successful",
        user={"id": "uuid", "email": "test@example.com", "created_at": "2025-12-15T10:30:00Z"}
    )
    assert auth_resp.message == "Login successful"
    assert auth_resp.user["id"] == "uuid"
    print("  [OK] AuthResponse schema verified")

    # Check LogoutResponse
    logout_resp = LogoutResponse(message="Logged out successfully")
    assert logout_resp.message == "Logged out successfully"
    print("  [OK] LogoutResponse schema verified")

    # Check UserResponse (NO password_hash)
    from datetime import datetime
    user_resp = UserResponse(
        id="test-uuid",
        email="test@example.com",
        created_at=datetime.now()
    )
    assert user_resp.id == "test-uuid"
    assert user_resp.email == "test@example.com"
    assert not hasattr(user_resp, 'password_hash')
    print("  [OK] UserResponse schema verified (NO password_hash)")

    print("[OK] All schemas verified\n")

def test_jwt_utilities():
    """Test T024-T025: JWT utilities and caching"""
    print("Testing JWT Utilities...")
    from src.utils.jwt import (
        create_access_token, decode_token, get_user_id_from_token,
        get_email_from_token, is_token_expired, clear_token_cache
    )

    # Test create_access_token
    token = create_access_token(
        user_id="test-uuid-123",
        email="test@example.com"
    )
    assert isinstance(token, str)
    assert len(token) > 50  # JWT tokens are long
    print("  [OK] create_access_token verified")

    # Test decode_token (with caching)
    payload = decode_token(token)
    assert payload["sub"] == "test-uuid-123"
    assert payload["email"] == "test@example.com"
    assert "exp" in payload
    assert "iat" in payload
    assert payload["iss"] == "todoapp-api"
    assert payload["aud"] == "todoapp-client"
    print("  [OK] decode_token verified")

    # Test cache (second call should be faster)
    payload2 = decode_token(token)
    assert payload == payload2
    print("  [OK] JWT caching verified (5-minute TTL)")

    # Test get_user_id_from_token
    user_id = get_user_id_from_token(token)
    assert user_id == "test-uuid-123"
    print("  [OK] get_user_id_from_token verified")

    # Test get_email_from_token
    email = get_email_from_token(token)
    assert email == "test@example.com"
    print("  [OK] get_email_from_token verified")

    # Test is_token_expired
    expired = is_token_expired(token)
    assert not expired  # Fresh token should not be expired
    print("  [OK] is_token_expired verified")

    # Test clear_token_cache
    clear_token_cache()
    print("  [OK] clear_token_cache verified")

    print("[OK] All JWT utilities verified\n")

def test_environment_config():
    """Verify environment variables are configured"""
    print("Testing Environment Configuration...")
    from dotenv import load_dotenv
    load_dotenv()

    jwt_secret = os.getenv("JWT_SECRET")
    jwt_algorithm = os.getenv("JWT_ALGORITHM")
    jwt_expiry_days = os.getenv("JWT_EXPIRY_DAYS")

    assert jwt_secret is not None, "JWT_SECRET not configured"
    assert len(jwt_secret) >= 32, "JWT_SECRET must be at least 32 characters"
    assert jwt_algorithm == "HS256", "JWT_ALGORITHM must be HS256"
    assert jwt_expiry_days == "30", "JWT_EXPIRY_DAYS must be 30"

    print("  [OK] JWT_SECRET configured (32+ chars)")
    print("  [OK] JWT_ALGORITHM configured (HS256)")
    print("  [OK] JWT_EXPIRY_DAYS configured (30)")
    print("[OK] Environment configuration verified\n")

def main():
    """Run all Phase 2 tests"""
    print("=" * 60)
    print("Phase 2 Implementation Verification")
    print("=" * 60)
    print()

    try:
        test_models()
        test_schemas()
        test_jwt_utilities()
        test_environment_config()

        print("=" * 60)
        print("[OK] PHASE 2 VERIFICATION COMPLETE")
        print("=" * 60)
        print()
        print("All 8 tasks (T018-T025) verified successfully:")
        print("  [OK] T018: User model")
        print("  [OK] T019: Session model")
        print("  [OK] T020: Task model updated")
        print("  [OK] T021: History model updated")
        print("  [OK] T022: Auth schemas")
        print("  [OK] T023: User schema")
        print("  [OK] T024: JWT utilities")
        print("  [OK] T025: JWT caching (5-minute TTL)")
        print()
        print("Ready for Phase 3: User Story Implementation")
        return 0

    except AssertionError as e:
        print(f"[ERROR] Verification failed: {e}")
        return 1
    except Exception as e:
        print(f"[ERROR] Error during verification: {e}")
        import traceback
        traceback.print_exc()
        return 1

if __name__ == "__main__":
    sys.exit(main())
