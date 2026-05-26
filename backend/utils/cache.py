import hashlib
import json

from db.redis_client import (
    redis_client
)


def generate_cache_key(messages):

    payload = json.dumps(
        messages,
        sort_keys=True
    )

    return hashlib.md5(
        payload.encode()
    ).hexdigest()


def get_cached_response(key):

    return redis_client.get(
        f"cache:{key}"
    )


def set_cached_response(
    key,
    value,
    ttl=300
):

    redis_client.setex(
        f"cache:{key}",
        ttl,
        value
    )