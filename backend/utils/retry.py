import asyncio

async def retry_with_backoff(
    fn,
    retries=3,
    delay=1
):
    last_exception = None

    for attempt in range(retries):
        try:
            return await fn()

        except Exception as e:
            last_exception = e

            await asyncio.sleep(
                delay * (2 ** attempt)
            )

    raise last_exception