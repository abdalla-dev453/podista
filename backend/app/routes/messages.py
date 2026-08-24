from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db, socketio
from app.models.message import Message
from app.models.membership import Membership

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


@socketio.on("join_channel")
def handle_join_channel(data):
    from flask_socketio import join_room

    join_room(f"channel_{data.get('channel_id')}")
