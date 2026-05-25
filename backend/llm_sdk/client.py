import time
from uuid import uuid4

from llm_sdk.openai_provider import OpenAIProvider
from llm_sdk.logger import send_log

provider = OpenAIProvider()

async def generate_llm_response(
        messages,
        conversation_id
):
    start_time = time.time()
    request_id = str(uuid4())

    try:
        response = await provider.chat(messages)

        latency_ms = int((time.time() - start_time) * 1000)

        content = response.choices[0].message.content

        usage = response.usage

        log_payload = {
            "request_id": request_id,
            "conversation_id": str(conversation_id),

            "provider": "openai",
            "model": "gpt-4.1-mini",

            "latency_ms": latency_ms,

            "prompt_tokens": usage.prompt_tokens,
            "completion_tokens": usage.completion_tokens,
            "total_tokens": usage.total_tokens,

            "status": "success",

            "request_preview": messages[-1]["content"][:100],
            "response_preview": content[:100],

            "timestamp": str(time.time())
        }

        await send_log(log_payload)

        return content
    
    except Exception as e:
        log_payload = {
            "request_id": request_id,
            "conversation_id": str(conversation_id),

            "provider": "openai",
            "model": "gpt-4.1-mini",

            "status": "error",
            "error_message": str(e),

            "request_preview": messages[-1]["content"][:100],

            "timestamp": str(time.time())
        }

        await send_log(log_payload)

        raise e