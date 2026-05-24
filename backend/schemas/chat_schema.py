from pydantic import BaseModel
from typing import List

class ChatRequest(BaseModel):
    conversation_id: str | None = None
    message: str

class MessageResponse(BaseModel):
    role: str
    content: str