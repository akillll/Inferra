from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from db.session import get_db_session

from schemas.chat_schema import ChatRequest

from services.chat_service import (
    create_conversation,
    save_message,
    get_conversation_messages
)

from llm_sdk.client import generate_llm_response

router = APIRouter()

@router.post("/chat")
async def chat(request: ChatRequest, db: Session = Depends(get_db_session)):

    if request.conversation_id:
        conversation_id = request.conversation_id
    else:
        conversation = create_conversation(db)
        conversation_id = conversation.id

    save_message(
        db,
        conversation_id,
        "user",
        request.message
    )

    history = get_conversation_messages(
        db,
        conversation_id
    )

    messages = [
        {
            "role": msg.role,
            "content": msg.content
        }
        for msg in history
    ]

    assistant_reply = generate_llm_response(messages, conversation_id)

    save_message(
        db,
        conversation_id,
        "assistant",
        assistant_reply
    )

    return {
        "conversation_id": str(conversation_id),
        "reply": assistant_reply
    }