from functools import wraps
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models.user import User
from app.models.channel import Channel
from app.models.report import Report
from app.models.ban import Ban

admin_bp = Blueprint("admin", __name__)


def admin_required(fn):
    @wraps(fn)
    @jwt_required()
    def wrapper(*args, **kwargs):
        user = User.query.get(int(get_jwt_identity()))
        if not user or not user.is_platform_admin:
            return jsonify({"error": "Admin access required"}), 403
        return fn(*args, **kwargs)

    return wrapper


@admin_bp.get("/overview")
@admin_required
def overview():
    """Powers the Admin Dashboard stat cards: Total Users, Active Channels, New Reports."""
    return jsonify(
        {
            "total_users": User.query.count(),
            "active_channels": Channel.query.filter_by(status="active").count(),
            "new_reports": Report.query.filter_by(status="open").count(),
        }
    )


@admin_bp.get("/moderation-queue")
@admin_required
def moderation_queue():
    reports = Report.query.filter_by(status="open").order_by(Report.created_at.desc()).all()
    return jsonify([r.to_dict() for r in reports])


@admin_bp.post("/moderation-queue/<int:report_id>/ban")
@admin_required
def ban_reported_user(report_id):
    admin_id = int(get_jwt_identity())
    report = Report.query.get_or_404(report_id)
    ban = Ban(user_id=report.reported_user_id, banned_by_id=admin_id, reason=report.reason)
    report.status = "actioned"
    db.session.add(ban)
    db.session.commit()
    return jsonify(ban.to_dict()), 201


@admin_bp.post("/moderation-queue/<int:report_id>/dismiss")
@admin_required
def dismiss_report(report_id):
    report = Report.query.get_or_404(report_id)
    report.status = "dismissed"
    db.session.commit()
    return jsonify({"status": "dismissed"})


@admin_bp.get("/banned-users")
@admin_required
def banned_users():
    bans = Ban.query.filter_by(active=True).order_by(Ban.created_at.desc()).all()
    return jsonify([b.to_dict() for b in bans])


@admin_bp.post("/banned-users/<int:ban_id>/unban")
@admin_required
def unban_user(ban_id):
    ban = Ban.query.get_or_404(ban_id)
    ban.active = False
    db.session.commit()
    return jsonify({"status": "unbanned"})
