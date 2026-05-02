from fastapi import Request
from fastapi.responses import JSONResponse


class LLMException(Exception):
    def __init__(self, message: str, status_code: int = 500):
        self.message = message
        self.status_code = status_code


async def llm_exception_handler(request: Request, exc: LLMException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": exc.message},
    )


async def generic_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error"},
    )