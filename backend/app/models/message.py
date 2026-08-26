from datetime import datetime, timezone
from app.extensions import db

def _aggregate_reactions(msg):
    """Aggregate reactions as [{emoji, count, user_ids}] for the frontend."""
    grouped = {}
    for r in msg.reactions.order_by("created_at").all():
        g = grouped.setdefault(r.emoji, {"emoji": r.emoji, "user_ids": []})
        g["user_ids"].append(r.user_id)
    for g in grouped.values():
        g["count"] = len(g["user_ids"])
    return list(grouped.values())


class Message(db.Model):
    __tablename__ = "messages"

    id = db.Column(db.Integer, primary_key=True)
    channel_id = db.Column(db.Integer, db.ForeignKey("channels.id"), nullable=False)
    author_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    body = db.Column(db.Text, nullable=True)
    attachment_url = db.Column(db.String(255), nullable=True)  # shared media (image/audio)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    channel = db.relationship("Channel", back_populates="messages")
    author = db.relationship("User", back_populates="messages")
    reactions = db.relationship("Reaction", backref="message", lazy="dynamic",
                                cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "channel_id": self.channel_id,
            "author": self.author.to_dict() if self.author else None,
            "body": self.body,
            "attachment_url": self.attachment_url,
            "created_at": self.created_at.isoformat(),
            "reactions": _aggregate_reactions(self),
        }