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

        history = [
            {
                "role": "user" if m["role"] == "user" else "model",
                "parts": [m["content"]],
            }
            for m in messages[:-1]
        ]

        chat = model.start_chat(history=history)
        last_message = messages[-1]["content"]
        response = chat.send_message(last_message, stream=True)

        for chunk in response:
            if chunk.text:
                yield chunk.text

    except Exception as e:
        error_str = str(e)
        if '429' in error_str:
            yield "\n\n⚠️ Rate limit reached on Gemini free tier (20 requests/day). Please wait a few minutes and try again."
        else:
            yield f"\n\n⚠️ Something went wrong: {error_str[:100]}"