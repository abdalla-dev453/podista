from datetime import datetime, timezone
from app.extensions import db


class Membership(db.Model):
    """Join table: which users belong to which channels, and their role in it."""
    __tablename__ = "memberships"
    __table_args__ = (db.UniqueConstraint("user_id", "channel_id", name="uq_user_channel"),)

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    channel_id = db.Column(db.Integer, db.ForeignKey("channels.id"), nullable=False)
    role = db.Column(db.String(20), default="member")  # owner | moderator | member
    muted = db.Column(db.Boolean, default=False)
    pinned = db.Column(db.Boolean, default=False)
    joined_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    user = db.relationship("User", back_populates="memberships")
    channel = db.relationship("Channel", back_populates="memberships")
