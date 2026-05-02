from fastapi import APIRouter
from app.schemas.agent import GeneratePromptRequest, GeneratePromptResponse
from app.services.prompt import generate_system_prompt

router = APIRouter(prefix="/agents", tags=["agents"])


@router.post("/generate-prompt", response_model=GeneratePromptResponse)
async def generate_prompt(body: GeneratePromptRequest):
    system_prompt, greeting = await generate_system_prompt(
        name=body.name,
        description=body.description,
    )
    return GeneratePromptResponse(
        system_prompt=system_prompt,
        suggested_greeting=greeting,
    )