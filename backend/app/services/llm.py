import google.generativeai as genai
from app.core.config import settings
from app.core.exceptions import LLMException
from typing import AsyncGenerator

genai.configure(api_key=settings.gemini_api_key)


def _get_model():
    return genai.GenerativeModel(settings.gemini_model)


async def generate_text(prompt: str) -> str:
    try:
        model = _get_model()
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        raise LLMException(f"Gemini generation failed: {str(e)}")


async def stream_chat(
    system_prompt: str,
    messages: list[dict],
    agent_name: str,
) -> AsyncGenerator[str, None]:
    try:
        model = genai.GenerativeModel(
            model_name=settings.gemini_model,
            system_instruction=system_prompt,
        )

        # Convert messages to Gemini format
        history = [
            {
                "role": "user" if m["role"] == "user" else "model",
                "parts": [m["content"]],
            }
            for m in messages[:-1]  # all except last
        ]

        chat = model.start_chat(history=history)

        # Stream the last user message
        last_message = messages[-1]["content"]
        response = chat.send_message(last_message, stream=True)

        for chunk in response:
            if chunk.text:
                yield chunk.text

    except Exception as e:
        raise LLMException(f"Gemini streaming failed: {str(e)}")