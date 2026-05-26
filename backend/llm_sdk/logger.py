import json

from db.redis_client import redis_client

QUEUE_NAME = "inference_logs"

async def send_log(payload):
    try:
        redis_client.rpush(
            QUEUE_NAME,
            json.dumps(payload)
        )
    except Exception:
        pass