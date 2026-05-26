from fastapi import APIRouter

router = APIRouter()

@router.post("/ingest")
async def ingest_health():
    return {
        "status": "queue active"
    }