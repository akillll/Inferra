import asyncio
import json
from uuid import uuid4

from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from db.session import SessionLocal, get_db_session

from services.stream_manager import active_streams

from services.chat_service import (
    create_conversation,
    save_message,
    get_conversation_messages,
    get_all_conversations,
    update_conversation_title
)

from llm_sdk.client import stream_llm_response

router = APIRouter()


def sse_event(event: str, payload: dict) -> str:
    return (
        f"event: {event}\n"
        f"data: {json.dumps(payload)}\n\n"
    )

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
):
    db = SessionLocal()

    try:
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

        update_conversation_title(
            db,
            current_conversation_id,
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
    finally:
        db.close()

    async def event_generator():

        stream_id = str(uuid4())
        active_streams[stream_id] = True
        full_response = ""

        yield sse_event(
            "stream",
            {
                "stream_id": stream_id,
                "conversation_id": current_conversation_id
            }
        )

        yield sse_event(
            "conversation",
            {
                "conversation_id": current_conversation_id
            }
        )

        try:

            async for chunk in stream_llm_response(messages, current_conversation_id):

                if not active_streams.get(stream_id):
                    break

                token = chunk["value"]
                full_response += token

                yield sse_event(
                    "token",
                    {
                        "value": token
                    }
                )

                await asyncio.sleep(0)

            yield sse_event(
                "done",
                {
                    "conversation_id": current_conversation_id
                }
            )

        except Exception as exc:
            yield sse_event(
                "stream-error",
                {
                    "message": str(exc)
                }
            )

        finally:

            try:
                if full_response.strip():
                    save_db = SessionLocal()

                    try:
                        save_message(
                            save_db,
                            current_conversation_id,
                            "assistant",
                            full_response
                        )
                    finally:
                        save_db.close()

            finally:
                active_streams.pop(stream_id, None)

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        }
    )

@router.post("/cancel/{stream_id}")
async def cancel_stream(stream_id: str):

    if stream_id in active_streams:
        active_streams[stream_id] = False

    return {
        "status": "cancelled"
    }
