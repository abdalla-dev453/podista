from  datetime import datetime, timezone
from app.extensions import db



class Bookmark(db.Model):
    """A user saving an episode to listen to later."""
    __tablename__ = "bookmarks"
    __table_args__ = (db.UniqueConstraint("user_id", "episode_id", name="uq_user_episode_bookmark"),)

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    episode_id = db.Column(db.Integer, db.ForeignKey("episodes.id"), nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    episode = db.relationship("Episode")
