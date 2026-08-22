from flask import Flask
from app.config import Config
from app.extensions import db, migrate, jwt, ma, cors, socketio


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    ma.init_app(app)
    cors.init_app(app, resources={r"/api/*": {"origins": app.config["CORS_ORIGINS"]}})
    socketio.init_app(app)

    from app.models import user, channel, membership, message, invitation, report, ban  # noqa

    # from app.routes.auth import auth_bp
    # from app.routes.channels import channels_bp
    # from app.routes.messages import messages_bp
    # from app.routes.admin import admin_bp
    # from app.routes.users import users_bp

    # app.register_blueprint(auth_bp, url_prefix="/api/auth")
    # app.register_blueprint(channels_bp, url_prefix="/api/channels")
    # app.register_blueprint(messages_bp, url_prefix="/api/messages")
    # app.register_blueprint(admin_bp, url_prefix="/api/admin")
    # app.register_blueprint(users_bp, url_prefix="/api/users")

    @app.get("/api/health")
    def health():
        return {"status": "ok", "service": "podclub-api"}

    return app