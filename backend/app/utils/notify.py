from app.extensions import db, socketio
from app.models.notification import Notification


def notify(user_id, type, message, link=None, actor_id=None, channel_id=None):
    """Create a notification row and push it live over Socket.IO to that user's personal room."""
    if actor_id == user_id:
        return None  # never notify people about their own actions
    n = Notification(
        user_id=user_id, actor_id=actor_id, type=type,
        message=message, link=link, channel_id=channel_id,
    )
    db.session.add(n)
    db.session.commit()
    socketio.emit("new_notification", n.to_dict(), room=f"user_{user_id}")
    return n
