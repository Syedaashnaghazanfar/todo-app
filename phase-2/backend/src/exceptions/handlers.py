from fastapi import FastAPI, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from src.utils.response import error_response

def register_exception_handlers(app: FastAPI):
    """Register all custom exception handlers"""
    
    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request, exc):
        """Handle pydantic validation errors"""
        errors = []
        for error in exc.errors():
            errors.append(f"{error['loc'][-1]}: {error['msg']}")
        error_msg = ", ".join(errors)
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content=error_response(error_msg)
        )
    
    @app.exception_handler(Exception)
    async def general_exception_handler(request, exc):
        """Handle general exceptions"""
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content=error_response("Internal server error")
        )
