from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models.user import User
from app.models.follow import Follow
from app.models.channel import Channel
from app.models.episode import Episode
from app.utils.notify import notify
users_bp = Blueprint("users", __name__)


def _public_profile(user, current_user_id):
    channels = Channel.query.filter_by(created_by_id=user.id, status="active", is_private=False).all()
    episode_count = Episode.query.filter_by(created_by_id=user.id).count()
    followers = Follow.query.filter_by(followee_id=user.id).all()
    following = Follow.query.filter_by(follower_id=user.id).all()
    return {
        **user.to_dict(),
        "followers_count": len(followers),
        "following_count": len(following),
        "episode_count": episode_count,
        "is_self": user.id == current_user_id,
        "is_following": any(f.follower_id == current_user_id for f in followers),
        "channels": [c.to_dict(member_count=len(c.memberships)) for c in channels],
    }


@users_bp.get("/profile")
@jwt_required()
def get_profile():
    user = User.query.get_or_404(int(get_jwt_identity()))
    return jsonify(user.to_dict())


@users_bp.patch("/profile")
@jwt_required()
def update_profile():
    user = User.query.get_or_404(int(get_jwt_identity()))
    data = request.get_json() or {}
    for field in ("display_name", "avatar_url", "bio"):
        if field in data:
            setattr(user, field, data[field])
    db.session.commit()
    return jsonify(user.to_dict())


@users_bp.get("/search")
@jwt_required()
def search_users():
    current_user_id = int(get_jwt_identity())
    q = request.args.get("q", "").strip()
    if not q:
        return jsonify([])

    users = (
        User.query.filter(
            (User.username.ilike(f"%{q}%")) | (User.display_name.ilike(f"%{q}%"))
        )
        .filter(User.id != current_user_id)
        .limit(10)
        .all()
    )
    return jsonify([u.to_dict() for u in users])


@users_bp.get("/<username>")
@jwt_required()
def public_profile(username):
    """Public profile: stats + public channels, powers the Profile page."""
    current_user_id = int(get_jwt_identity())
    user = User.query.filter_by(username=username).first_or_404()
    return jsonify(_public_profile(user, current_user_id))


@users_bp.post("/<username>/follow")
@jwt_required()
def follow_user(username):
    follower_id = int(get_jwt_identity())
    target = User.query.filter_by(username=username).first_or_404()
    if target.id == follower_id:
        return jsonify({"error": "You cannot follow yourself"}), 400
    if not Follow.query.filter_by(follower_id=follower_id, followee_id=target.id).first():
        db.session.add(Follow(follower_id=follower_id, followee_id=target.id))
        db.session.commit()
        notify(
            target.id, type="follow",
            message="started following you",
            link=f"/profile/{username}", actor_id=follower_id,
        )
    followers = Follow.query.filter_by(followee_id=target.id).count()
    following = Follow.query.filter_by(follower_id=follower_id).count()
    return jsonify({"following": True, "followers_count": followers, "my_following_count": following})


@users_bp.post("/<username>/unfollow")
@jwt_required()
def unfollow_user(username):
    follower_id = int(get_jwt_identity())
    target = User.query.filter_by(username=username).first_or_404()
    existing = Follow.query.filter_by(follower_id=follower_id, followee_id=target.id).first()
    if existing:
        db.session.delete(existing)
        db.session.commit()
    followers = Follow.query.filter_by(followee_id=target.id).count()
    following = Follow.query.filter_by(follower_id=follower_id).count()
    return jsonify({"following": False, "followers_count": followers, "my_following_count": following})


@users_bp.get("/<username>/followers")
@jwt_required()
def list_followers(username):
    user = User.query.filter_by(username=username).first_or_404()
    rows = (
        Follow.query.join(User, Follow.follower_id == User.id)
        .filter(Follow.followee_id == user.id)
        .order_by(Follow.created_at.desc())
        .all()
    )
    return jsonify([f.follower.to_dict() for f in rows])


@users_bp.get("/<username>/following")
@jwt_required()
def list_following(username):
    user = User.query.filter_by(username=username).first_or_404()
    rows = (
        Follow.query.filter_by(follower_id=user.id)
        .order_by(Follow.created_at.desc())
        .all()
    )
    return jsonify([f.followee.to_dict() for f in rows])
