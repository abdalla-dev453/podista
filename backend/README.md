# PodClub — Backend (Flask API)

Flask + SQLAlchemy + JWT + Socket.IO API for PodClub, a social network for podcast
and audio channels.

## Setup

```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env

flask db init
flask db migrate -m "initial schema"
flask db upgrade

python seed.py     # optional: loads demo data matching the prototype screens
python run.py       # starts on http://localhost:5000
```

## Structure

```
app/
  models/       User, Channel, Membership, Message, Invitation, Report, Ban
  routes/       auth, channels, messages, users, admin
  schemas/      marshmallow serializers (add as needed)
  utils/        slugify, helpers
  extensions.py db / jwt / socketio / cors instances
  config.py     env-driven config
run.py           entrypoint (Flask-SocketIO server)
seed.py          demo data matching the Stitch prototype
```

## Endpoints (high level)

| Area              | Route                                              |
|--------------------|-----------------------------------------------------|
| Auth               | POST /api/auth/register, /login, GET /me            |
| Home dashboard      | GET /api/channels (joined), GET /api/channels/invitations |
| Channel chat        | GET/POST /api/messages/channel/<id> (+ Socket.IO `new_message`) |
| Channel Management  | GET/POST/PATCH/DELETE /api/channels, GET /<id>/invite |
| Admin Dashboard      | GET /api/admin/overview, /moderation-queue, /banned-users |

## Notes / next steps

- Google/Apple OAuth are stubbed in `auth.py` — wire up real token exchange when ready.
- `MAX_CHANNELS_PER_USER` (default 5) enforces the "3/5 Max" limit seen on Channel Management.
- `is_platform_admin` on `User` gates the Admin Dashboard / User Moderation / Channel
  Management nav items shown in the "Backstage Access" sidebar.
- Swap `DATABASE_URL` to Postgres for production, same as your other projects.