from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db, socketio
from app.models.message import Message
from app.models.membership import Membership
from app.models.reaction import Reaction

messages_bp = Blueprint("messages", __name__)


def _require_membership(user_id, channel_id):
    return Membership.query.filter_by(user_id=user_id, channel_id=channel_id).first()


@messages_bp.get("/channel/<int:channel_id>")
@jwt_required()
def get_messages(channel_id):
    user_id = int(get_jwt_identity())
    if not _require_membership(user_id, channel_id):
        return jsonify({"error": "Not a member of this channel"}), 403

    msgs = (
        Message.query.filter_by(channel_id=channel_id)
        .order_by(Message.created_at.asc())
        .limit(200)
        .all()
    )
    return jsonify([m.to_dict() for m in msgs])


@messages_bp.post("/channel/<int:channel_id>")
@jwt_required()
def send_message(channel_id):
    user_id = int(get_jwt_identity())
    if not _require_membership(user_id, channel_id):
        return jsonify({"error": "Not a member of this channel"}), 403

    data = request.get_json() or {}
    if not data.get("body") and not data.get("attachment_url"):
        return jsonify({"error": "Message body or attachment required"}), 400

    msg = Message(
        channel_id=channel_id,
        author_id=user_id,
        body=data.get("body"),
        attachment_url=data.get("attachment_url"),
    )
    db.session.add(msg)
    db.session.commit()

    payload = msg.to_dict()
    socketio.emit("new_message", payload, room=f"channel_{channel_id}")
    return jsonify(payload), 201


@messages_bp.post("/<int:message_id>/react")
@jwt_required()
def toggle_reaction(message_id):
    """Toggle an emoji reaction on a message. Returns the aggregated reactions list."""
    user_id = int(get_jwt_identity())
    msg = Message.query.get_or_404(message_id)
    if not _require_membership(user_id, msg.channel_id):
        return jsonify({"error": "Not a member of this channel"}), 403
    emoji = (request.get_json() or {}).get("emoji")
    if not emoji:
        return jsonify({"error": "emoji required"}), 400
    existing = Reaction.query.filter_by(
        message_id=message_id, user_id=user_id, emoji=emoji
    ).first()
    if existing:
        db.session.delete(existing)
    else:
        db.session.add(Reaction(message_id=message_id, user_id=user_id, emoji=emoji))
    db.session.commit()

    payload = {"message_id": message_id, "reactions": _serialize_reactions(msg)}
    socketio.emit("message_reaction", payload, room=f"channel_{msg.channel_id}")
    return jsonify(payload)


def _serialize_reactions(msg):
    """Aggregate reactions as [{emoji, count, user_ids}] for the frontend."""
    grouped = {}
    for r in msg.reactions.order_by(Reaction.created_at).all():
        g = grouped.setdefault(r.emoji, {"emoji": r.emoji, "user_ids": []})
        g["user_ids"].append(r.user_id)
    for g in grouped.values():
        g["count"] = len(g["user_ids"])
    return list(grouped.values())

@socketio.on("join_channel")
def handle_join_channel(data):
    from flask_socketio import join_room
    join_room(f"channel_{data.get('channel_id')}")

@socketio.on("join_user_room")
def handle_join_user_room(data):
    """Personal room so notify() can push live notifications to this user."""
    from flask_socketio import join_room
    join_room(f"user_{data.get('user_id')}")
