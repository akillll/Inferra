from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from db.session import get_db_session

from schemas.ingestion_schema import InferenceLogSchema
from models.inference_log import InferenceLog

router = APIRouter()

@router.post("/ingest")
async def ingest_log(
    payload: InferenceLogSchema,
    db: Session = Depends(get_db_session)
):
    log = InferenceLog(**payload.dict())
    db.add(log)
    db.commit()

    return {
        "status": "received"
    }