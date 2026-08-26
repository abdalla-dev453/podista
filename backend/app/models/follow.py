from datetime import datetime, timezone
from app.extensions import db


class  Follow(db.Model):
    __tablename__ = "follows"
    __table_args__ = (db.UniqueConstraint("follower_id", "followee_id", name="uq_follower_followee"),)



    id = db.Column(db.Integer, primary_key=True)
    follower_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    followee_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    follower = db.relationship("User", foreign_keys=[follower_id])
    followee = db.relationship("User", foreign_keys=[followee_id])