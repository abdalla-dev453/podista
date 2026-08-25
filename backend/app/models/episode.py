from datetime import datetime, timezone
from app.extensions import db



class Episode(db.Model):
    __tablename__ = "episodes"


    id = db.Column(db.Integer, primary_key=True)
    channel_id = db.Column(db.Integer, db.ForeignKey("channels.id"), nullable=False)
    created_by_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    title = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, nullable=True)
    audio_url = db.Column(db.String(255), nullable=False)
    cover_image_url = db.Column(db.String(255), nullable=True)
    duration_seconds = db.Column(db.Integer, nullable=True)
    plays_count = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    channel = db.relationship("Channel", back_populates="episodes")
    created_by = db.relationship("User")


    def to_dict(self):
        return {
            "id": self.id,
            "channel_id": self.channel_id,
            "channel": {"id": self.channel.id, "name": self.channel.name, "slug": self.channel.slug,
                        "cover_image_url": self.channel.cover_image_url} if self.channel else None,
            "created_by": self.created_by.to_dict() if self.created_by else None,
            "title": self.title,
            "description": self.description,
            "audio_url": self.audio_url,
            "cover_image_url": self.cover_image_url,
            "duration_seconds": self.duration_seconds,
            "plays_count": self.plays_count,
            "created_at": self.created_at.isoformat(),
        }
