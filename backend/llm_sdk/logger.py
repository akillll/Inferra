import httpx
import asyncio
from datetime import datetime

INGESTION_URL = "http://localhost:8000/ingest"

async def send_log(payload):
    async with httpx.AsyncClient() as client:
        try:
            await client.post(
                INGESTION_URL,
                json=payload,
                timeout=2
            )
        except Exception:
            pass