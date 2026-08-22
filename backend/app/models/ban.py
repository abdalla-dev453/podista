from datetime import datetime, timezone
from app.extensions import db


class Ban(db.Model):
    """Platform-wide ban (shown in Admin Dashboard 'Banned Users')."""
    __tablename__ = "bans"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    banned_by_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    reason = db.Column(db.String(255), nullable=True)
    active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    user = db.relationship("User", foreign_keys=[user_id])
    banned_by = db.relationship("User", foreign_keys=[banned_by_id])

    def to_dict(self):
        return {
            "id": self.id,
            "username": self.user.username if self.user else None,
            "reason": self.reason,
            "active": self.active,
            "banned_at": self.created_at.isoformat(),
        }