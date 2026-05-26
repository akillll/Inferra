from models.conversation import Conversation
from models.message import Message
from sqlalchemy.orm import Session

def create_conversation(db: Session):
    conversation = Conversation()

    db.add(conversation)
    db.commit()
    db.refresh(conversation)

    return conversation

def save_message(
        db: Session,
        conversation_id,
        role,
        content
):
    message = Message(
        conversation_id=conversation_id,
        role=role,
        content=content
    )

    db.add(message)
    db.commit()
    db.refresh(message)

    return message

def get_conversation_messages(db: Session, conversation_id):
    return(
        db.query(Message)
        .filter(Message.conversation_id == conversation_id)
        .order_by(Message.created_at.asc())
        .all()
    )

def get_all_conversations(db: Session):
    return (
        db.query(Conversation)
        .order_by(Conversation.updated_at.desc()).all()
    )