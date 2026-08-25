from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models.notification import Notification

notifications_bp = Blueprint("notifications", __name__)


@notifications_bp.get("")
@jwt_required()
def list_notifications():
    user_id = int(get_jwt_identity())
    items = (
        Notification.query.filter_by(user_id=user_id)
        .order_by(Notification.created_at.desc())
        .limit(50)
        .all()
    )
    return jsonify([n.to_dict() for n in items])


@notifications_bp.get("/unread-count")
@jwt_required()
def unread_count():
    user_id = int(get_jwt_identity())
    count = Notification.query.filter_by(user_id=user_id, is_read=False).count()
    return jsonify({"unread_count": count})


@notifications_bp.post("/<int:notification_id>/read")
@jwt_required()
def mark_read(notification_id):
    user_id = int(get_jwt_identity())
    n = Notification.query.get_or_404(notification_id)
    if n.user_id != user_id:
        return jsonify({"error": "Not authorized"}), 403
    n.is_read = True
    db.session.commit()
    return jsonify(n.to_dict())


@notifications_bp.post("/read-all")
@jwt_required()
def mark_all_read():
    user_id = int(get_jwt_identity())
    Notification.query.filter_by(user_id=user_id, is_read=False).update({"is_read": True})
    db.session.commit()
    return jsonify({"status": "ok"})