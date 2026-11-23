from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from app.core.exceptions import CineMatchException

def register_error_handlers(app: FastAPI):
    
    @app.exception_handler(CineMatchException)
    async def cinematch_exception_handler(request: Request, exc: CineMatchException):
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "success": False,
                "message": exc.message,
                "code": exc.code
            }
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        return JSONResponse(
            status_code=422,
            content={
                "success": False,
                "message": "Invalid request parameters",
                "code": "VALIDATION_ERROR",
                "details": exc.errors()
            }
        )

    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        # In a real production app, we would log this traceback securely.
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "message": "An unexpected internal server error occurred.",
                "code": "INTERNAL_SERVER_ERROR"
            }
        )
