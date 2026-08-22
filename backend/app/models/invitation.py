from datetime import datetime, timezone
from app.extensions import db


class Invitation(db.Model):
    """Direct invite of a user to a channel (shown under 'Invitations' on the Home dashboard)."""
    __tablename__ = "invitations"

    id = db.Column(db.Integer, primary_key=True)
    channel_id = db.Column(db.Integer, db.ForeignKey("channels.id"), nullable=False)
    invited_user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    invited_by_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    status = db.Column(db.String(20), default="pending")  # pending | accepted | declined
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    channel = db.relationship("Channel")
    invited_user = db.relationship("User", foreign_keys=[invited_user_id])
    invited_by = db.relationship("User", foreign_keys=[invited_by_id])
