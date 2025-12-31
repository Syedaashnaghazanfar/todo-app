from typing import Optional, Any, Dict
from pydantic import BaseModel

class APIResponse(BaseModel):
    """Standard response wrapper for all API endpoints"""
    success: bool
    data: Optional[Any] = None
    popup: Optional[str] = None
    error: Optional[str] = None

def success_response(data: Any = None, popup: Optional[str] = None) -> Dict:
    """Create a successful response"""
    return {
        "success": True,
        "data": data,
        "popup": popup,
        "error": None
    }

def error_response(error: str, popup: Optional[str] = None) -> Dict:
    """Create an error response"""
    return {
        "success": False,
        "data": None,
        "popup": popup,
        "error": error
    }
