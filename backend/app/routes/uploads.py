import os
import uuid
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required
from werkzeug.utils import secure_filename

uploads_bp = Blueprint("uploads", __name__)

ALLOWED_IMAGE = {"png", "jpg", "jpeg", "webp", "gif"}
ALLOWED_AUDIO = {"mp3", "wav", "m4a", "ogg", "aac"}
ALLOWED_VIDEO = {"mp4", "webm", "ogg", "mkv"}


def _ext(filename):
    return filename.rsplit(".", 1)[-1].lower() if "." in filename else ""


def _save(file, subfolder, allowed):
    ext = _ext(file.filename)
    if ext not in allowed:
        return None, ("File type not allowed", 400)

    filename = f"{uuid.uuid4().hex}.{ext}"
    folder = os.path.join(current_app.static_folder, "uploads", subfolder)
    os.makedirs(folder, exist_ok=True)
    file.save(os.path.join(folder, secure_filename(filename)))
    return f"/static/uploads/{subfolder}/{filename}", None


@uploads_bp.post("/image")
@jwt_required()
def upload_image():
    """Used for avatars, channel covers, and episode artwork."""
    if "file" not in request.files:
        return jsonify({"error": "file is required"}), 400
    url, err = _save(request.files["file"], "images", ALLOWED_IMAGE)
    if err:
        return jsonify({"error": err[0]}), err[1]
    return jsonify({"url": url}), 201


@uploads_bp.post("/audio")
@jwt_required()
def upload_audio():
    """Used for podcast episode audio files."""
    if "file" not in request.files:
        return jsonify({"error": "file is required"}), 400
    url, err = _save(request.files["file"], "audio", ALLOWED_AUDIO)
    if err:
        return jsonify({"error": err[0]}), err[1]
    return jsonify({"url": url}), 201

@uploads_bp.post("/video")
@jwt_required()
def upload_video():
    """Used for podcast episode audio files."""
    if "file" not in request.files:
        return jsonify({"error": "file is required"}), 400
    url, err = _save(request.files["file"], "video", ALLOWED_AUDIO)
    if err:
        return jsonify({"error": err[0]}), err[1]
    return jsonify({"url": url}), 201