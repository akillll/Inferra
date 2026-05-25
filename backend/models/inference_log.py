from sqlalchemy import Column, String, Integer, DateTime, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid

from db.session import Base

class InferenceLog(Base):

    __tablename__ = "inference_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    request_id = Column(String)

    conversation_id = Column(String)

    provider = Column(String)
    model = Column(String)

    latency_ms = Column(Integer)

    prompt_tokens = Column(Integer)
    completion_tokens = Column(Integer)
    total_tokens = Column(Integer)

    status = Column(String)
    error_message = Column(Text, nullable=True)

    request_preview = Column(Text)
    response_preview = Column(Text)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )