from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app.extensions import db
from app.models.user import User
from app.models.ban import Ban

auth_bp = Blueprint("auth", __name__)


@auth_bp.post("/register")
def register():
    data = request.get_json() or {}
    required = ["email", "username", "display_name", "password"]
    if not all(data.get(f) for f in required):
        return jsonify({"error": "email, username, display_name, password are required"}), 400

    if User.query.filter_by(email=data["email"]).first():
        return jsonify({"error": "Email already registered"}), 409
    if User.query.filter_by(username=data["username"]).first():
        return jsonify({"error": "Username already taken"}), 409

    is_admin = bool(data.get("is_platform_admin", False))
    user = User(
        email=data["email"],
        username=data["username"],
        display_name=data["display_name"],
        is_platform_admin=is_admin,
    )
    user.set_password(data["password"])
    db.session.add(user)
    db.session.commit()

    token = create_access_token(identity=str(user.id))
    return jsonify({"token": token, "user": user.to_dict()}), 201


@auth_bp.post("/login")
def login():
    data = request.get_json() or {}
    user = User.query.filter_by(email=data.get("email")).first()
    if not user or not user.check_password(data.get("password", "")):
        return jsonify({"error": "Invalid email or password"}), 401

    ban = Ban.query.filter_by(user_id=user.id, active=True).first()
    if ban:
        return jsonify({"error": f"Account suspended: {ban.reason or 'Policy violation'}"}), 403

    token = create_access_token(identity=str(user.id))
    return jsonify({"token": token, "user": user.to_dict()})


@auth_bp.post("/oauth/<provider>")
def oauth_login(provider):
    """Stub for Google / Apple continue-with buttons. Wire up real OAuth exchange here."""
    if provider not in ("google", "apple"):
        return jsonify({"error": "Unsupported provider"}), 400
    return jsonify({"error": f"{provider} OAuth not yet configured"}), 501


@auth_bp.get("/me")
@jwt_required()
def me():
    user_id = int(get_jwt_identity())
    ban = Ban.query.filter_by(user_id=user_id, active=True).first()
    if ban:
        return jsonify({"error": "Account suspended"}), 403
    user = User.query.get_or_404(user_id)
    return jsonify(user.to_dict())
