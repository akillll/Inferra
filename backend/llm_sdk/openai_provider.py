from openai import AsyncOpenAI
import os

from llm_sdk.base_provider import BaseProvider

client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

class OpenAIProvider(BaseProvider):
    async def stream_chat(self, messages):
        stream = await client.chat.completions.create(
            model="gpt-4.1-mini",
            messages=messages,
            stream=True
        )

        return stream