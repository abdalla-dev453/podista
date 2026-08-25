from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models.bookmark import Bookmark
from app.models.episode import Episode

bookmarks_bp = Blueprint("bookmarks", __name__)


@bookmarks_bp.get("")
@jwt_required()
def list_bookmarks():
    user_id = int(get_jwt_identity())
    saved = (
        Bookmark.query.filter_by(user_id=user_id).order_by(Bookmark.created_at.desc()).all()
    )
    return jsonify([b.episode.to_dict() for b in saved if b.episode])


@bookmarks_bp.post("/<int:episode_id>")
@jwt_required()
def add_bookmark(episode_id):
    user_id = int(get_jwt_identity())
    Episode.query.get_or_404(episode_id)
    existing = Bookmark.query.filter_by(user_id=user_id, episode_id=episode_id).first()
    if not existing:
        db.session.add(Bookmark(user_id=user_id, episode_id=episode_id))
        db.session.commit()
    return jsonify({"status": "saved"}), 201


@bookmarks_bp.delete("/<int:episode_id>")
@jwt_required()
def remove_bookmark(episode_id):
    user_id = int(get_jwt_identity())
    existing = Bookmark.query.filter_by(user_id=user_id, episode_id=episode_id).first()
    if existing:
        db.session.delete(existing)
        db.session.commit()
    return "", 204