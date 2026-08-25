from datetime import datetime, timezone
from app.extensions import db


class Notification(db.Model):
    __tablename__ = "notifications"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)  # recipient
    actor_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)  # who triggered it
    type = db.Column(db.String(30), nullable=False)  # invite | invite_accepted | follow | episode | ban | unban | report_actioned
    message = db.Column(db.String(255), nullable=False)
    link = db.Column(db.String(255), nullable=True)  # frontend route to deep-link to
    channel_id = db.Column(db.Integer, db.ForeignKey("channels.id"), nullable=True)
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    actor = db.relationship("User", foreign_keys=[actor_id])


    def to_dict(self):
        return {
            "id": self.id,
            "type": self.type,
            "message": self.message,
            "link": self.link,
            "is_read": self.is_read,
            "actor": self.actor.to_dict() if self.actor else None,
            "created_at": self.created_at.isoformat(),
        }