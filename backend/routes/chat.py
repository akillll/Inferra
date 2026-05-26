from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import asyncio

from db.session import get_db_session

from services.stream_manager import active_streams
from schemas.chat_schema import ChatRequest

from services.chat_service import (
    create_conversation,
    save_message,
    get_conversation_messages,
    get_all_conversations
)

from llm_sdk.client import stream_llm_response

router = APIRouter()

@router.get("/conversations")
async def list_conversations(
    db: Session = Depends(get_db_session)
):
    conversations = get_all_conversations(db)

    return [
        {
            "id": str(c.id),
            "title": c.title,
            "created_at": c.created_at
        }
        for c in conversations
    ]


@router.get("/conversation/{conversation_id}")
async def get_conversation(
    conversation_id: str,
    db: Session = Depends(get_db_session)
):

    messages = get_conversation_messages(
        db,
        conversation_id
    )

    return [
        {
            "role": m.role,
            "content": m.content
        }
        for m in messages
    ]

@router.get("/chat-stream")
async def chat_stream(
    message: str = Query(...),
    conversation_id: str | None = None,
    db: Session = Depends(get_db_session)
):

    if conversation_id:
        current_conversation_id = conversation_id

    else:
        conversation = create_conversation(db)
        current_conversation_id = str(conversation.id)

    save_message(
        db,
        current_conversation_id,
        "user",
        message
    )

    history = get_conversation_messages(
        db,
        current_conversation_id
    )

    messages = [
        {
            "role": msg.role,
            "content": msg.content
        }
        for msg in history
    ]

    async def event_generator():

        stream_id = str(current_conversation_id)
        active_streams[stream_id] = True
        full_response = ""

        yield f"data: __conversation__:{current_conversation_id}\n\n"

        try:

            async for token in stream_llm_response(messages):

                if not active_streams.get(stream_id):
                    break

                full_response += token

                yield f"data: {token}\n\n"

                await asyncio.sleep(0)

        finally:

            save_message(
                db,
                current_conversation_id,
                "assistant",
                full_response
            )

            active_streams.pop(stream_id, None)

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream"
    )

@router.post("/cancel/{conversation_id}")
async def cancel_stream(conversation_id: str):

    active_streams[conversation_id] = False

    return {
        "status": "cancelled"
    }