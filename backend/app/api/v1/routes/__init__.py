from fastapi import APIRouter
from app.api.v1.routes import agents, chat

router = APIRouter(prefix="/api/v1")
router.include_router(agents.router)
router.include_router(chat.router)