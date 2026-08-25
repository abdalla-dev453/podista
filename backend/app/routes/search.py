from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.channel import Channel
from app.models.user import User
from app.models.episode import Episode

search_bp = Blueprint("search", __name__)


@search_bp.get("")
@jwt_required()
def unified_search():
    """Powers the global search bar: channels, creators, and episodes in one call."""
    current_user_id = int(get_jwt_identity())
    q = request.args.get("q", "").strip()
    if not q:
        return jsonify({"channels": [], "users": [], "episodes": []})

    channels = (
        Channel.query.filter_by(status="active", is_private=False)
        .filter((Channel.name.ilike(f"%{q}%")) | (Channel.description.ilike(f"%{q}%")))
        .limit(6)
        .all()
    )
    users = (
        User.query.filter((User.username.ilike(f"%{q}%")) | (User.display_name.ilike(f"%{q}%")))
        .filter(User.id != current_user_id)
        .limit(6)
        .all()
    )
    episodes = (
        Episode.query.join(Channel)
        .filter(Channel.is_private.is_(False))
        .filter((Episode.title.ilike(f"%{q}%")) | (Episode.description.ilike(f"%{q}%")))
        .limit(6)
        .all()
    )

    return jsonify(
        {
            "channels": [c.to_dict(member_count=len(c.memberships)) for c in channels],
            "users": [u.to_dict() for u in users],
            "episodes": [e.to_dict() for e in episodes],
        }
    )