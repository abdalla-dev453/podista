import bcrypt
from datetime import datetime, timezone
from app.extensions import db


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)  # e.g. @alex_m
    email = db.Column(db.String(120), unique=True, nullable=False)
    display_name = db.Column(db.String(100), nullable=False)
    password_hash = db.Column(db.String(255), nullable=True)  # nullable for OAuth-only users
    avatar_url = db.Column(db.String(255), nullable=True)
    oauth_provider = db.Column(db.String(20), nullable=True)  # 'google' | 'apple' | None
    is_platform_admin = db.Column(db.Boolean, default=False)  # sees Admin Dashboard / Moderation
    bio = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    memberships = db.relationship("Membership", back_populates="user", cascade="all, delete-orphan")
    messages = db.relationship("Message", back_populates="author", cascade="all, delete-orphan")

    def set_password(self, raw_password):
        self.password_hash = bcrypt.hashpw(raw_password.encode(), bcrypt.gensalt()).decode()

    def check_password(self, raw_password):
        if not self.password_hash:
            return False
        return bcrypt.checkpw(raw_password.encode(), self.password_hash.encode())

    def to_dict(self):
        return {
            "id": self.id,
            "username": self.username,
            "display_name": self.display_name,
            "bio": self.bio,
            "avatar_url": self.avatar_url,
            "is_platform_admin": self.is_platform_admin,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
