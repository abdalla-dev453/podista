from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models.user import User

users_bp = Blueprint("users", __name__)


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
