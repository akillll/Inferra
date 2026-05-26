from fastapi import Request
from fastapi.responses import JSONResponse

from db.redis_client import (
    redis_client
)

RATE_LIMIT = 100


async def rate_limit_middleware(
    request: Request,
    call_next
):

    ip = request.client.host

    key = f"rate_limit:{ip}"

    current = redis_client.get(key)

    if current and int(current) >= RATE_LIMIT:

        return JSONResponse(
            status_code=429,
            content={
                "message":
                "Rate limit exceeded"
            }
        )

    pipe = redis_client.pipeline()

    pipe.incr(key, 1)

    pipe.expire(key, 60)

    pipe.execute()

    response = await call_next(
        request
    )

    return response