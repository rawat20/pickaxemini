from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from app.schemas.chat import ChatRequest
from app.services.llm import stream_chat
import json

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("/stream")
async def chat_stream(body: ChatRequest):
    async def event_generator():
        async for chunk in stream_chat(
            system_prompt=body.system_prompt,
            messages=[m.model_dump() for m in body.messages],
            agent_name=body.agent_name,
        ):
            # SSE format: data: <payload>\n\n
            yield f"data: {json.dumps({'text': chunk})}\n\n"

        # Signal stream end
        yield f"data: {json.dumps({'done': True})}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )