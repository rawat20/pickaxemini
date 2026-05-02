from pydantic import BaseModel, Field
from typing import Literal


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class ChatRequest(BaseModel):
    system_prompt: str = Field(..., min_length=1)
    messages: list[ChatMessage]
    agent_name: str = "Assistant"