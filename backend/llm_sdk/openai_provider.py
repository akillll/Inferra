from openai import AsyncOpenAI
from dotenv import load_dotenv
import os

from llm_sdk.base_provider import BaseProvider
from utils.retry import retry_with_backoff

load_dotenv()

client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

class OpenAIProvider(BaseProvider):
    async def stream_chat(self, messages):
        async def api_call():
            return await client.chat.completions.create(
                model="gpt-4.1-mini",
                messages=messages,
                stream=True,
                stream_options={
                    "include_usage": True
                }
            )

        stream = await retry_with_backoff(api_call)

        return stream