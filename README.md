# Podista

A social network for podcast and audio channels — scaffolded from the Google Stitch
prototype (login/register, home dashboard, live channel chat, channel management,
and an admin moderation dashboard).

## Stack

- **Backend:** Flask 3, SQLAlchemy, Flask-Migrate, Flask-JWT-Extended, Flask-SocketIO (real-time chat), SQLite in dev / PostgreSQL in prod
- **Frontend:** React 18 + Vite, Tailwind CSS, React Router, Zustand-ready, Socket.IO client, lucide-react icons

## Structure

```
podista/
  backend/     Flask API — see backend/README.md
  frontend/    React/Vite app — see below
```

## Screen → code map

| Screen (screenshot)        | Frontend page                          | Backend routes                          |
|-----------------------------|------------------------------------------|--------------------------------------------|
| Login / Register            | `frontend/src/pages/AuthPage.jsx`         | `POST /api/auth/{register,login}`, `/oauth/<provider>` |
| Home (Invitations + Joined) | `frontend/src/pages/Home.jsx`             | `GET /api/channels`, `/channels/invitations` |
| Channel chat                | `frontend/src/pages/ChannelChat.jsx`      | `GET/POST /api/messages/channel/<id>` + Socket.IO |
| Channel Management           | `frontend/src/pages/ChannelManagement.jsx`| `GET/POST/PATCH/DELETE /api/channels`, `/invite` |
| Admin Dashboard              | `frontend/src/pages/AdminDashboard.jsx`   | `/api/admin/overview`, `/moderation-queue`, `/banned-users` |

## Quickstart

**Backend**
```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
flask db init && flask db migrate -m "initial schema" && flask db upgrade
python seed.py     # loads demo users/channels matching the screenshots
python run.py       # http://localhost:5000
```

**Frontend**
```bash
cd frontend
npm install
cp .env.example .env
npm run dev          # http://localhost:5173
```

Demo login after seeding: `alex@podclub.dev` / `password123` (platform admin — sees
Dashboard, User Moderation, and Channel Management in the sidebar).

## What's stubbed vs. real

- Real: auth (JWT), channel CRUD + membership, invitations, live chat over Socket.IO,
  moderation queue (ban/dismiss), banned-user list (unban), channel slot limits.
- Stubbed (intentionally, to keep scope open): Google/Apple OAuth exchange, file/media
  uploads for shared media and avatars, "Go Live" audio streaming itself.

## Next steps to discuss

- Confirm regional integrations you want in (M-Pesa for paid channels/tips? Africa's
  Talking for SMS invites?) — not wired in yet, kept the schema open for it.
- Decide on real audio streaming provider for "Go Live" (Agora, LiveKit, etc.).
- Add Marshmallow schemas per model if you want stricter request/response validation.