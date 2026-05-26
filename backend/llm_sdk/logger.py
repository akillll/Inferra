import json

from db.redis_client import redis_client
from utils.pii_redaction import redact_pii

QUEUE_NAME = "inference_logs"

async def send_log(payload):

    try:
        if payload.get(
            "request_preview"
        ):
            payload["request_preview"] = (
                redact_pii(
                    payload[
                        "request_preview"
                    ]
                )
            )

        if payload.get(
            "response_preview"
        ):
            payload["response_preview"] = (
                redact_pii(
                    payload[
                        "response_preview"
                    ]
                )
            )

        redis_client.rpush(
            QUEUE_NAME,
            json.dumps(payload)
        )

    except Exception:
        pass