# Buonolo

A relocation/immigration companion app: a social feed, a guided settlement roadmap, community groups & events, local "tools" guides, and an AI assistant ("Mr O").

## Architecture

```
/backend    Node.js + TypeScript + Express, Postgres (Prisma), Redis, WebSocket gateway, Gemini API
/web        React + Vite frontend
/mobile
  /android  Kotlin + Jetpack Compose
  /ios      SwiftUI
/nginx      Reverse proxy + static frontend hosting
docker-compose.yml   postgres, redis, backend, nginx
```

The backend owns all data (Postgres via Prisma) and caching/pub-sub (Redis), exposes a REST API under `/api` plus a WebSocket gateway at `/ws` for realtime notifications/messages/posts, and calls the Gemini API server-side for the "Mr O" assistant. Nginx is the single entry point: it serves the built web frontend and reverse-proxies `/api` and `/ws` to the backend, so the browser only ever talks to one origin.

## Running with Docker Compose (recommended)

1. Copy the env template and fill in secrets:
   ```
   cp .env.example .env
   # generate JWT secrets:
   openssl rand -hex 32   # JWT_ACCESS_SECRET
   openssl rand -hex 32   # JWT_REFRESH_SECRET
   # optionally set GEMINI_API_KEY to enable the "Mr O" assistant
   ```
2. Start everything:
   ```
   docker compose up --build
   ```
3. Open http://localhost (or `HTTP_PORT` if you changed it in `.env`).

Postgres migrations run automatically on backend startup. Uploaded post images are stored in a shared Docker volume served directly by Nginx.

## Local development (without Docker)

Backend:
```
cd backend
cp .env.example .env   # point DATABASE_URL/REDIS_URL at local instances
npm install
npm run prisma:migrate:dev
npm run seed            # seeds goal templates
npm run dev              # http://localhost:4000
```

Frontend:
```
cd web
npm install
npm run dev               # http://localhost:3000, proxies /api and /ws to :4000
```

## Mobile apps

- `/mobile/android` — Kotlin + Jetpack Compose, built with Android Studio / Gradle.
- `/mobile/ios` — SwiftUI, built with Xcode (macOS required).

Both talk to the same backend REST + WebSocket API; point them at your backend's URL (see each app's README for configuration).
