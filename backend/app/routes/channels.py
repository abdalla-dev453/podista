from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models.channel import Channel
from app.models.membership import Membership
from app.models.invitation import Invitation
from app.models.report import Report
from app.models.user import User
from app.utils.slugify import slugify

channels_bp = Blueprint("channels", __name__)


@channels_bp.get("")
@jwt_required()
def joined_channels():
    """Powers the 'Joined Channels' grid on the Home dashboard."""
    user_id = int(get_jwt_identity())
    memberships = Membership.query.filter_by(user_id=user_id).all()
    return jsonify(
        [m.channel.to_dict(member_count=len(m.channel.memberships)) for m in memberships if m.channel.status == "active"]
    )


@channels_bp.get("/explore")
@jwt_required()
def explore_channels():
    user_id = int(get_jwt_identity())
    category = request.args.get("category")
    search = request.args.get("search", "").strip()

    query = Channel.query.filter_by(status="active", is_private=False)
    if category and category != "All":
        query = query.filter_by(category=category)
    if search:
        query = query.filter(
            (Channel.name.ilike(f"%{search}%")) | (Channel.description.ilike(f"%{search}%"))
        )

    channels = query.order_by(Channel.is_live.desc(), Channel.created_at.desc()).all()
    user_memberships = {
        m.channel_id for m in Membership.query.filter_by(user_id=user_id).all()
    }

    result = []
    for c in channels:
        data = c.to_dict(member_count=len(c.memberships))
        data["is_joined"] = c.id in user_memberships
        result.append(data)

    return jsonify(result)


@channels_bp.get("/mine")
@jwt_required()
def my_created_channels():
    """Powers the 'Channel Management' page — channels this user owns."""
    user_id = int(get_jwt_identity())
    owned = Channel.query.filter_by(created_by_id=user_id).all()
    max_channels = current_app.config["MAX_CHANNELS_PER_USER"]
    return jsonify(
        {
            "channels": [c.to_dict(member_count=len(c.memberships)) for c in owned],
            "active_count": len([c for c in owned if c.status == "active"]),
            "max_channels": max_channels,
        }
    )


@channels_bp.get("/<int:channel_id>")
@jwt_required()
def get_channel(channel_id):
    user_id = int(get_jwt_identity())
    channel = Channel.query.get_or_404(channel_id)
    membership = Membership.query.filter_by(user_id=user_id, channel_id=channel_id).first()
    data = channel.to_dict(member_count=len(channel.memberships))
    data["is_member"] = membership is not None
    data["role"] = membership.role if membership else None
    return jsonify(data)


@channels_bp.post("")
@jwt_required()
def create_channel():
    user_id = int(get_jwt_identity())
    data = request.get_json() or {}
    name = data.get("name")
    if not name:
        return jsonify({"error": "name is required"}), 400

    owned_active = Channel.query.filter_by(created_by_id=user_id, status="active").count()
    if owned_active >= current_app.config["MAX_CHANNELS_PER_USER"]:
        return jsonify({"error": "Channel limit reached"}), 403

    base_slug = slugify(name)
    slug = base_slug
    counter = 1
    while Channel.query.filter_by(slug=slug).first():
        slug = f"{base_slug}-{counter}"
        counter += 1

    channel = Channel(
        name=name,
        slug=slug,
        description=data.get("description"),
        category=data.get("category", "General"),
        is_private=data.get("is_private", False),
        created_by_id=user_id,
    )
    db.session.add(channel)
    db.session.flush()

    db.session.add(Membership(user_id=user_id, channel_id=channel.id, role="owner"))
    db.session.commit()
    return jsonify(channel.to_dict(member_count=1)), 201


@channels_bp.patch("/<int:channel_id>")
@jwt_required()
def update_channel(channel_id):
    user_id = int(get_jwt_identity())
    channel = Channel.query.get_or_404(channel_id)
    membership = Membership.query.filter_by(user_id=user_id, channel_id=channel_id).first()
    if not membership or membership.role not in ("owner", "moderator"):
        return jsonify({"error": "Not authorized"}), 403

    data = request.get_json() or {}
    for field in ("name", "description", "category", "is_private", "status", "is_live"):
        if field in data:
            setattr(channel, field, data[field])
    db.session.commit()
    return jsonify(channel.to_dict(member_count=len(channel.memberships)))


@channels_bp.post("/<int:channel_id>/join")
@jwt_required()
def join_channel(channel_id):
    user_id = int(get_jwt_identity())
    channel = Channel.query.get_or_404(channel_id)
    if channel.is_private:
        return jsonify({"error": "Private channel requires invite link"}), 403

    existing = Membership.query.filter_by(user_id=user_id, channel_id=channel_id).first()
    if not existing:
        db.session.add(Membership(user_id=user_id, channel_id=channel_id, role="member"))
        db.session.commit()
    return jsonify(channel.to_dict(member_count=len(channel.memberships)))


@channels_bp.post("/<int:channel_id>/leave")
@jwt_required()
def leave_channel(channel_id):
    user_id = int(get_jwt_identity())
    membership = Membership.query.filter_by(user_id=user_id, channel_id=channel_id).first()
    if membership:
        if membership.role == "owner":
            return jsonify({"error": "Channel owners cannot leave their channel. Delete it instead."}), 400
        db.session.delete(membership)
        db.session.commit()
    return jsonify({"status": "left"})


@channels_bp.post("/<int:channel_id>/toggle-live")
@jwt_required()
def toggle_live(channel_id):
    user_id = int(get_jwt_identity())
    channel = Channel.query.get_or_404(channel_id)
    membership = Membership.query.filter_by(user_id=user_id, channel_id=channel_id).first()
    if not membership or membership.role not in ("owner", "moderator"):
        return jsonify({"error": "Not authorized to manage stream"}), 403

    channel.is_live = not channel.is_live
    db.session.commit()
    return jsonify(channel.to_dict(member_count=len(channel.memberships)))


@channels_bp.post("/<int:channel_id>/invite-user")
@jwt_required()
def invite_user(channel_id):
    user_id = int(get_jwt_identity())
    channel = Channel.query.get_or_404(channel_id)
    target_user_id = request.get_json().get("user_id")

    if not target_user_id:
        return jsonify({"error": "user_id required"}), 400

    existing_invite = Invitation.query.filter_by(
        channel_id=channel_id, invited_user_id=target_user_id, status="pending"
    ).first()
    if existing_invite:
        return jsonify({"message": "Invitation already pending"}), 200

    invite = Invitation(
        channel_id=channel_id,
        invited_user_id=target_user_id,
        invited_by_id=user_id,
    )
    db.session.add(invite)
    db.session.commit()
    return jsonify({"message": "Invitation sent successfully"}), 201


@channels_bp.post("/<int:channel_id>/report")
@jwt_required()
def report_user(channel_id):
    user_id = int(get_jwt_identity())
    data = request.get_json() or {}
    reported_user_id = data.get("reported_user_id")
    reason = data.get("reason", "Inappropriate Behavior")

    if not reported_user_id:
        return jsonify({"error": "reported_user_id required"}), 400

    report = Report(
        reported_user_id=reported_user_id,
        reported_by_id=user_id,
        channel_id=channel_id,
        reason=reason,
    )
    db.session.add(report)
    db.session.commit()
    return jsonify(report.to_dict()), 201


@channels_bp.delete("/<int:channel_id>")
@jwt_required()
def delete_channel(channel_id):
    user_id = int(get_jwt_identity())
    channel = Channel.query.get_or_404(channel_id)
    if channel.created_by_id != user_id:
        return jsonify({"error": "Only the owner can delete this channel"}), 403
    db.session.delete(channel)
    db.session.commit()
    return "", 204


@channels_bp.get("/<int:channel_id>/invite")
@jwt_required()
def get_invite_link(channel_id):
    channel = Channel.query.get_or_404(channel_id)
    return jsonify(
        {"invite_url": f"/join/{channel.invite_code}", "invite_code": channel.invite_code}
    )


@channels_bp.post("/join/<invite_code>")
@jwt_required()
def join_channel_by_code(invite_code):
    user_id = int(get_jwt_identity())
    channel = Channel.query.filter_by(invite_code=invite_code).first_or_404()
    existing = Membership.query.filter_by(user_id=user_id, channel_id=channel.id).first()
    if not existing:
        db.session.add(Membership(user_id=user_id, channel_id=channel.id, role="member"))
        db.session.commit()
    return jsonify(channel.to_dict(member_count=len(channel.memberships)))


@channels_bp.get("/invitations")
@jwt_required()
def pending_invitations():
    user_id = int(get_jwt_identity())
    invites = Invitation.query.filter_by(invited_user_id=user_id, status="pending").all()
    return jsonify(
        [
            {
                "id": i.id,
                "channel": i.channel.to_dict(),
                "invited_by": i.invited_by.to_dict(),
                "created_at": i.created_at.isoformat(),
            }
            for i in invites
        ]
    )


@channels_bp.post("/invitations/<int:invitation_id>/respond")
@jwt_required()
def respond_invitation(invitation_id):
    user_id = int(get_jwt_identity())
    invite = Invitation.query.get_or_404(invitation_id)
    if invite.invited_user_id != user_id:
        return jsonify({"error": "Not authorized"}), 403

    action = (request.get_json() or {}).get("action")
    if action not in ("accept", "decline"):
        return jsonify({"error": "action must be 'accept' or 'decline'"}), 400

    invite.status = "accepted" if action == "accept" else "declined"
    if action == "accept":
        existing = Membership.query.filter_by(user_id=user_id, channel_id=invite.channel_id).first()
        if not existing:
            db.session.add(Membership(user_id=user_id, channel_id=invite.channel_id, role="member"))
    db.session.commit()
    return jsonify({"status": invite.status})
