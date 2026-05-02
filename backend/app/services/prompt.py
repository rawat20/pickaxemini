from app.services.llm import generate_text


async def generate_system_prompt(name: str, description: str) -> tuple[str, str]:
    """
    Returns (system_prompt, suggested_greeting)
    """
    meta_prompt = f"""
You are an AI prompt engineer. Generate a system prompt and greeting for an AI agent.

Agent Name: {name}
Agent Description: {description}

Respond in this EXACT format (no markdown, no extra text):
SYSTEM_PROMPT: <the system prompt here>
GREETING: <a friendly opening message from the agent>

The system prompt should be clear, focused, and under 200 words.
The greeting should be 1-2 sentences welcoming the user.
"""

    raw = await generate_text(meta_prompt)

    # Parse response
    system_prompt = ""
    greeting = ""

    for line in raw.strip().split("\n"):
        if line.startswith("SYSTEM_PROMPT:"):
            system_prompt = line.replace("SYSTEM_PROMPT:", "").strip()
        elif line.startswith("GREETING:"):
            greeting = line.replace("GREETING:", "").strip()

    # Fallbacks
    if not system_prompt:
        system_prompt = f"You are {name}. {description}"
    if not greeting:
        greeting = f"Hi! I'm {name}. How can I help you today?"

    return system_prompt, greeting