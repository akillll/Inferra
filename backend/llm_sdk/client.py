import time

from uuid import uuid4

from llm_sdk.openai_provider import (
    OpenAIProvider
)

from llm_sdk.logger import (
    send_log
)

from utils.cache import (

    generate_cache_key,

    get_cached_response,

    set_cached_response
)

provider = OpenAIProvider()


async def stream_llm_response(
    messages,
    conversation_id=""
):

    cache_key = generate_cache_key(
        messages
    )

    cached = get_cached_response(
        cache_key
    )

    if cached:

        for char in cached:

            yield {
                "type": "token",
                "value": char
            }

        return

    start_time = time.time()

    request_id = str(uuid4())

    full_response = ""

    usage_data = None

    try:

        stream = await provider.stream_chat(
            messages
        )

        async for chunk in stream:

            # usage chunk
            if (
                hasattr(chunk, "usage")
                and chunk.usage
            ):

                usage_data = chunk.usage

            # skip empty choices
            if not chunk.choices:
                continue

            delta = (
                chunk
                .choices[0]
                .delta
                .content
            )

            if delta:

                full_response += delta

                yield {
                    "type": "token",
                    "value": delta
                }

        latency_ms = int(
            (time.time() - start_time)
            * 1000
        )

        log_payload = {

            "request_id":
                request_id,

            "conversation_id":
                conversation_id,

            "provider":
                "openai",

            "model":
                "gpt-4.1-mini",

            "latency_ms":
                latency_ms,

            "prompt_tokens":
                getattr(
                    usage_data,
                    "prompt_tokens",
                    0
                ),

            "completion_tokens":
                getattr(
                    usage_data,
                    "completion_tokens",
                    0
                ),

            "total_tokens":
                getattr(
                    usage_data,
                    "total_tokens",
                    0
                ),

            "status":
                "success",

            "request_preview":
                messages[-1]["content"][
                    :100
                ],

            "response_preview":
                full_response[:100],
        }

        await send_log(log_payload)

        set_cached_response(
            cache_key,
            full_response
        )

    except Exception as e:

        log_payload = {

            "request_id":
                request_id,

            "conversation_id":
                conversation_id,

            "provider":
                "openai",

            "model":
                "gpt-4.1-mini",

            "status":
                "error",

            "error_message":
                str(e),

            "request_preview":
                messages[-1]["content"][
                    :100
                ],
        }

        await send_log(log_payload)

        raise e