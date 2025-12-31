# agents/factory.py
import os

from agents import OpenAIChatCompletionsModel, AsyncOpenAI

OPENAI_BASE_URL = os.getenv("OPENAI_BASE_URL")  # optional override
GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/openai/"

def create_model():
    provider = os.getenv("LLM_PROVIDER", "openai").lower()

    if provider == "gemini":
        client = AsyncOpenAI(
            api_key=os.getenv("GEMINI_API_KEY"),
            base_url=GEMINI_BASE_URL,
        )
        return OpenAIChatCompletionsModel(
            model=os.getenv("GEMINI_DEFAULT_MODEL", "gemini-2.5-flash"),
            openai_client=client,
        )

    # Default: OpenAI
    client = AsyncOpenAI(
        api_key=os.getenv("OPENAI_API_KEY"),
        base_url=OPENAI_BASE_URL or None,
    )
    return OpenAIChatCompletionsModel(
        model=os.getenv("OPENAI_DEFAULT_MODEL", "gpt-4.1-mini"),
        openai_client=client,
    )
