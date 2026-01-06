"""
Multi-provider model factory for AI agents.

Supports OpenAI, Gemini, Groq, and OpenRouter providers.
Configured via LLM_PROVIDER environment variable.
"""

import os
from pathlib import Path
from dotenv import load_dotenv
from agents import OpenAIChatCompletionsModel
from openai import AsyncOpenAI

# Load .env file
env_path = Path(__file__).parent.parent.parent / ".env"
if env_path.exists():
    load_dotenv(env_path, override=True)


def create_model(provider: str | None = None, model: str | None = None) -> OpenAIChatCompletionsModel:
    """
    Create LLM model instance based on environment configuration.

    Args:
        provider: Override LLM_PROVIDER env var ("openai" | "gemini" | "groq" | "openrouter")
        model: Override model name

    Returns:
        OpenAIChatCompletionsModel configured for selected provider

    Raises:
        ValueError: If provider unsupported or API key missing

    Examples:
        # Use default from environment
        >>> model = create_model()

        # Override provider
        >>> model = create_model(provider="gemini")

        # Override both provider and model
        >>> model = create_model(provider="groq", model="llama-3.3-70b-versatile")
    """
    provider = provider or os.getenv("LLM_PROVIDER", "openai").lower()

    if provider == "openai":
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("OPENAI_API_KEY required when LLM_PROVIDER=openai")

        client = AsyncOpenAI(api_key=api_key)
        model_name = model or os.getenv("OPENAI_DEFAULT_MODEL", "gpt-4o-mini")

        return OpenAIChatCompletionsModel(model=model_name, openai_client=client)

    elif provider == "gemini":
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY required when LLM_PROVIDER=gemini")

        # Gemini via OpenAI-compatible API
        client = AsyncOpenAI(
            api_key=api_key,
            base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
        )
        model_name = model or os.getenv("GEMINI_DEFAULT_MODEL", "gemini-2.0-flash")

        return OpenAIChatCompletionsModel(model=model_name, openai_client=client)

    elif provider == "groq":
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            raise ValueError("GROQ_API_KEY required when LLM_PROVIDER=groq")

        client = AsyncOpenAI(
            api_key=api_key,
            base_url="https://api.groq.com/openai/v1",
        )
        model_name = model or os.getenv("GROQ_DEFAULT_MODEL", "llama-3.3-70b-versatile")

        return OpenAIChatCompletionsModel(model=model_name, openai_client=client)

    elif provider == "openrouter":
        api_key = os.getenv("OPENROUTER_API_KEY")
        if not api_key:
            raise ValueError("OPENROUTER_API_KEY required when LLM_PROVIDER=openrouter")

        client = AsyncOpenAI(
            api_key=api_key,
            base_url="https://openrouter.ai/api/v1",
        )
        model_name = model or os.getenv("OPENROUTER_DEFAULT_MODEL", "openai/gpt-oss-20b:free")

        return OpenAIChatCompletionsModel(model=model_name, openai_client=client)

    else:
        raise ValueError(
            f"Unsupported provider: {provider}. "
            f"Supported: openai, gemini, groq, openrouter"
        )
