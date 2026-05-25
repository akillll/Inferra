from pydantic import BaseModel
from typing import Optional

class InferenceLogSchema(BaseModel):

    request_id: str
    conversation_id: str

    provider: str
    model: str

    latency_ms: Optional[int] = None

    prompt_tokens: Optional[int] = None
    completion_tokens: Optional[int] = None
    total_tokens: Optional[int] = None

    status: str

    error_message: Optional[str] = None

    request_preview: str
    response_preview: Optional[str] = None

    timestamp: str