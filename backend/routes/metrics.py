from fastapi import (
    APIRouter,
    Depends
)

from sqlalchemy.orm import Session

from db.session import get_db_session

from services.metrics_service import (
    get_total_requests,
    get_avg_latency,
    get_total_errors,
    get_total_tokens,
    get_provider_usage,
    get_requests_per_minute
)

router = APIRouter()


@router.get("/metrics")

async def metrics(
    db: Session = Depends(get_db_session)
):

    return {

        "total_requests":
            get_total_requests(db),

        "avg_latency":
            get_avg_latency(db),

        "total_errors":
            get_total_errors(db),

        "total_tokens":
            get_total_tokens(db),

        "provider_usage":
            get_provider_usage(db),

        "requests_per_minute":
            get_requests_per_minute(db),
    }