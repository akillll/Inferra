from sqlalchemy import func
from sqlalchemy.orm import Session

from models.inference_log import (
    InferenceLog
)

def get_total_requests(db: Session):

    return db.query(
        InferenceLog
    ).count()


def get_avg_latency(db: Session):

    value = db.query(
        func.avg(
            InferenceLog.latency_ms
        )
    ).scalar()

    return round(value or 0, 2)


def get_total_errors(db: Session):

    return db.query(
        InferenceLog
    ).filter(
        InferenceLog.status == "error"
    ).count()


def get_total_tokens(db: Session):

    value = db.query(
        func.sum(
            InferenceLog.total_tokens
        )
    ).scalar()

    return value or 0


def get_provider_usage(db: Session):

    rows = db.query(

        InferenceLog.provider,

        func.count(
            InferenceLog.id
        )

    ).group_by(
        InferenceLog.provider
    ).all()

    return [
        {
            "provider": row[0],
            "count": row[1]
        }
        for row in rows
    ]

def get_requests_per_minute(db: Session):

    minute_bucket = func.date_trunc(
        "minute",
        InferenceLog.created_at
    )

    rows = db.query(

        minute_bucket,

        func.count(
            InferenceLog.id
        )

    ).group_by(

        minute_bucket

    ).order_by(

        minute_bucket

    ).all()

    return [
        {
            "minute": str(row[0]),
            "count": row[1]
        }
        for row in rows
    ]