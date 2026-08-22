from datetime import datetime, timezone
from app.extensions import db


class Report(db.Model):
    """A moderation-queue entry: user X reported in channel Y for reason Z."""
    __tablename__ = "reports"

    id = db.Column(db.Integer, primary_key=True)
    reported_user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    reported_by_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    channel_id = db.Column(db.Integer, db.ForeignKey("channels.id"), nullable=False)
    reason = db.Column(db.String(50), nullable=False)  # 'Hate Speech' | 'Spam Links' | ...
    status = db.Column(db.String(20), default="open")  # open | actioned | dismissed
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    reported_user = db.relationship("User", foreign_keys=[reported_user_id])
    reported_by = db.relationship("User", foreign_keys=[reported_by_id])
    channel = db.relationship("Channel", back_populates="reports")

    def to_dict(self):
        return {
            "id": self.id,
            "reported_user": self.reported_user.username if self.reported_user else None,
            "channel": self.channel.name if self.channel else None,
            "reason": self.reason,
            "status": self.status,
            "created_at": self.created_at.isoformat(),
        }