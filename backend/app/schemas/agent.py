from pydantic import BaseModel, Field


class GeneratePromptRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: str = Field(..., min_length=10, max_length=1000)


class GeneratePromptResponse(BaseModel):
    system_prompt: str
    suggested_greeting: str