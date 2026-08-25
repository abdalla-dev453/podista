from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models.episode import Episode
from app.models.channel import Channel
from app.models.membership import Membership
from app.models.follow import Follow
from app.utils.notify import notify

episodes_bp = Blueprint("episodes", __name__)


@episodes_bp.get("/channel/<int:channel_id>")
@jwt_required()
def list_channel_episodes(channel_id):
    episodes = (
        Episode.query.filter_by(channel_id=channel_id).order_by(Episode.created_at.desc()).all()
    )
    return jsonify([e.to_dict() for e in episodes])


@episodes_bp.post("/channel/<int:channel_id>")
@jwt_required()
def create_episode(channel_id):
    user_id = int(get_jwt_identity())
    channel = Channel.query.get_or_404(channel_id)
    membership = Membership.query.filter_by(user_id=user_id, channel_id=channel_id).first()
    if not membership or membership.role not in ("owner", "moderator"):
        return jsonify({"error": "Only channel owners or moderators can publish episodes"}), 403

    data = request.get_json() or {}
    if not data.get("title") or not data.get("audio_url"):
        return jsonify({"error": "title and audio_url are required"}), 400

    episode = Episode(
        channel_id=channel_id,
        created_by_id=user_id,
        title=data["title"],
        description=data.get("description"),
        audio_url=data["audio_url"],
        cover_image_url=data.get("cover_image_url") or channel.cover_image_url,
        duration_seconds=data.get("duration_seconds"),
    )
    db.session.add(episode)
    db.session.commit()

    # Notify channel members and followers of the creator, minus the publisher.
    recipient_ids = {m.user_id for m in channel.memberships}
    recipient_ids |= {
        f.follower_id for f in Follow.query.filter_by(followee_id=channel.created_by_id).all()
    }
    recipient_ids.discard(user_id)
    for uid in recipient_ids:
        notify(
            uid, type="episode",
            message=f"New episode on {channel.name}: \"{episode.title}\"",
            link=f"/channels/{channel.id}", actor_id=user_id, channel_id=channel.id,
        )

    return jsonify(episode.to_dict()), 201


@episodes_bp.get("/feed")
@jwt_required()
def discover_feed():
    """'For You' feed: episodes from channels the user has joined or creators they follow, else trending."""
    user_id = int(get_jwt_identity())
    joined_channel_ids = {m.channel_id for m in Membership.query.filter_by(user_id=user_id).all()}
    followed_ids = {f.followee_id for f in Follow.query.filter_by(follower_id=user_id).all()}

    query = Episode.query.join(Channel)
    if joined_channel_ids or followed_ids:
        query = query.filter(
            db.or_(
                Episode.channel_id.in_(joined_channel_ids) if joined_channel_ids else False,
                Episode.created_by_id.in_(followed_ids) if followed_ids else False,
            )
        )
    else:
        query = query.filter(Channel.is_private.is_(False))

    episodes = query.order_by(Episode.created_at.desc()).limit(30).all()
    return jsonify([e.to_dict() for e in episodes])


@episodes_bp.get("/trending")
@jwt_required()
def trending_feed():
    episodes = (
        Episode.query.join(Channel)
        .filter(Channel.is_private.is_(False))
        .order_by(Episode.plays_count.desc(), Episode.created_at.desc())
        .limit(20)
        .all()
    )
    return jsonify([e.to_dict() for e in episodes])


@episodes_bp.get("/<int:episode_id>")
@jwt_required()
def get_episode(episode_id):
    return jsonify(Episode.query.get_or_404(episode_id).to_dict())


@episodes_bp.post("/<int:episode_id>/play")
@jwt_required()
def play_episode(episode_id):
    episode = Episode.query.get_or_404(episode_id)
    episode.plays_count = (episode.plays_count or 0) + 1
    db.session.commit()
    return jsonify({"plays_count": episode.plays_count})


@episodes_bp.delete("/<int:episode_id>")
@jwt_required()
def delete_episode(episode_id):
    user_id = int(get_jwt_identity())
    episode = Episode.query.get_or_404(episode_id)
    membership = Membership.query.filter_by(user_id=user_id, channel_id=episode.channel_id).first()
    if episode.created_by_id != user_id and (not membership or membership.role != "owner"):
        return jsonify({"error": "Not authorized"}), 403
    db.session.delete(episode)
    db.session.commit()
    return "", 204
