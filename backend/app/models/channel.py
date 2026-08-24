import secrets
from datetime import datetime, timezone
from app.extensions import db


class Channel(db.Model):
    __tablename__ = "channels"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)  # "Tech Talk Weekly"
    slug = db.Column(db.String(120), unique=True, nullable=False)
    description = db.Column(db.Text, nullable=True)
    cover_image_url = db.Column(db.String(255), nullable=True)
    is_private = db.Column(db.Boolean, default=False)
    is_live = db.Column(db.Boolean, default=False)
    invite_code = db.Column(db.String(20), unique=True, default=lambda: secrets.token_urlsafe(8))
    status = db.Column(db.String(20), default="active")  # active | archived
    category = db.Column(db.String(50), default="General")
    created_by_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    memberships = db.relationship(
        "Membership", back_populates="channel", cascade="all, delete-orphan"
    )
    messages = db.relationship("Message", back_populates="channel", cascade="all, delete-orphan")
    reports = db.relationship("Report", back_populates="channel", cascade="all, delete-orphan")

    def to_dict(self, member_count=None):
        return {
            "id": self.id,
            "name": self.name,
            "slug": self.slug,
            "description": self.description,
            "category": self.category or "General",
            "cover_image_url": self.cover_image_url,
            "is_private": self.is_private,
            "is_live": self.is_live,
            "invite_code": self.invite_code,
            "status": self.status,
            "member_count": member_count,
            "created_by_id": self.created_by_id,
        }
