from datetime import datetime, timezone
from app.extensions import db


class Reaction(db.Model):
    """Emoji reaction on a chat message."""
    __tablename__ = "reactions"
    __table_args__ = (db.UniqueConstraint("message_id", "user_id", "emoji", name="uq_message_user_emoji"),)

    id = db.Column(db.Integer, primary_key=True)
    message_id = db.Column(db.Integer, db.ForeignKey("messages.id"), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    emoji = db.Column(db.String(8), nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
