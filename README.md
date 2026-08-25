# Podista

A social network for podcast and audio creators — live channels for the conversation,
real episode feeds for the show, and a follower graph that travels with your name
across every channel you run. Scaffolded from the original Google Stitch prototype
and since expanded well beyond "just creating channels."

## Stack

- **Backend:** Flask 3, SQLAlchemy, Flask-Migrate, Flask-JWT-Extended, Flask-SocketIO (real-time chat + notifications), SQLite in dev / PostgreSQL in prod
- **Frontend:** React 19 + Vite, Tailwind CSS 4, React Router, Socket.IO client, lucide-react icons

## Structure

```
podista/
  backend/     Flask API — see backend/README.md
  frontend/    React/Vite app — see below
```

## What's in it now

**Core (original scaffold)**
- Auth (JWT, register/login), channel CRUD + membership, invitations, live chat over
  Socket.IO, moderation queue (ban/dismiss), banned-user list (unban), channel slot limits.

**Added in this pass — the "more than just creating channels" layer**
- **Episode feeds** — channels aren't just chat rooms anymore. Owners/moderators publish
  real podcast episodes (audio + optional cover art) to a channel feed; anyone can play,
  and plays are counted. This is the single biggest addition — it turns a channel from a
  live-chat room into an actual show.
- **Follows** — a social graph independent of channel membership. Follow a creator and
  see their new episodes in your personal feed, even in channels you haven't joined.
- **Notifications** — a real notification feed (DB-backed, pushed live over Socket.IO)
  for invites, follows, and new episodes. Bell icon with unread count, mark-as-read.
- **Message reactions** — emoji reactions on chat messages, synced live to everyone in
  the room.
- **Bookmarks** — save an episode to a personal "saved" list to listen to later.
- **File uploads** — real local disk storage for avatars, channel covers, and episode
  audio (`/api/uploads/image`, `/api/uploads/audio`), served back from Flask's static
  folder. Swap in S3/Cloudinary later without touching the API shape.
- **Unified search** — one endpoint (`/api/search?q=`) across channels, creators, and
  episodes, with a debounced dropdown search bar on the frontend.
- **Public creator profiles** (`/u/<username>`) — bio, follower/following counts,
  published episode count, and their public channels, with a follow button.
- **Landing page** — a real marketing homepage (`/`) for logged-out visitors: hero,
  feature grid, "how it works," CTA. Logged-in users skip straight to `/home`.
- **Explore page** (`/explore`) — trending episodes, browse-and-search public channels,
  and a saved/bookmarks tab.
- **Design system pass** — added a display font (Space Grotesk) alongside Inter, a
  gradient text/background utility, an elevated card style, and fade-in motion — used
  across the new Landing, Explore, and Profile pages while keeping the original
  violet/teal dark theme intact.

## Screen → code map

| Screen                        | Frontend page                              | Backend routes                                               |
|--------------------------------|----------------------------------------------|------------------------------------------------------------------|
| Landing (logged out)          | `frontend/src/pages/Landing.jsx`           | —                                                             |
| Login / Register              | `frontend/src/pages/AuthPage.jsx`          | `POST /api/auth/{register,login}`, `/oauth/<provider>`      |
| Home (Invitations + Joined)   | `frontend/src/pages/Home.jsx`              | `GET /api/channels`, `/channels/invitations`                |
| Explore (trending/browse/saved) | `frontend/src/pages/Explore.jsx`         | `/api/episodes/{trending,feed}`, `/channels/explore`, `/bookmarks` |
| Channel chat + Episodes tab   | `frontend/src/pages/ChannelChat.jsx`       | `/api/messages/channel/<id>`, `/api/episodes/channel/<id>` + Socket.IO |
| Channel Management            | `frontend/src/pages/ChannelManagement.jsx` | `/api/channels`, `/invite`                                   |
| Public creator profile        | `frontend/src/pages/Profile.jsx`           | `/api/users/<username>`, `/follow`, `/unfollow`             |
| Admin Dashboard                | `frontend/src/pages/AdminDashboard.jsx`    | `/api/admin/overview`, `/moderation-queue`, `/banned-users` |

## Quickstart

**Backend**
```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
flask db init && flask db migrate -m "add episodes, follows, notifications, reactions, bookmarks" && flask db upgrade
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

> Note: `flask db migrate` needs a real diff against your existing dev database to
> generate the migration for the five new tables (`episodes`, `follows`,
> `notifications`, `reactions`, `bookmarks`). This was validated by creating all
> tables directly via `db.create_all()` against a fresh SQLite file — the models and
> relationships are confirmed correct — but the actual Alembic migration file wasn't
> generated against your existing `podclub.db`, so run `flask db migrate` yourself
> before deploying.

## What's stubbed vs. real

- Real: everything listed under "What's in it now" above, all smoke-tested against a
  live server (register → create channel → join → follow → publish episode →
  notification fires → bookmark → public profile → search → react to a message).
- Stubbed (intentionally, to keep scope open): Google/Apple OAuth exchange, "Go Live"
  audio streaming itself (chat + episodes are real; true live broadcast still needs a
  provider), direct messages between users.

## Next steps to discuss

- Confirm regional integrations you want in (M-Pesa for paid channels/tips? Africa's
  Talking for SMS invites?) — not wired in yet, kept the schema open for it.
- Decide on a real audio streaming provider for "Go Live" (Agora, LiveKit, etc.).
- Swap local disk uploads for S3/Cloudinary/Backblaze before production — the API
  shape (`{url}` response) won't need to change.
- Add Marshmallow schemas per model if you want stricter request/response validation.
- Consider episode duration auto-detection server-side (currently accepted as an
  optional field, not computed).