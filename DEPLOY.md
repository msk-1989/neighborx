# Deploying NeighborX to Vercel

NeighborX is a Next.js 16 app. It deploys cleanly to Vercel with **two
architecture changes** — the database and the real-time chat service — because
Vercel's serverless platform does not support a local SQLite file or long-lived
WebSocket servers.

This guide walks through everything end-to-end.

---

## 0. Prerequisites

- A GitHub account with push access to the repo.
- A Vercel account (free tier is fine).
- A Neon account (free tier is fine) — for Postgres.
- A Render / Railway / Fly.io account (free tier is fine) — for the chat service.

---

## 1. Push the code to GitHub

The sandbox this was built in does not have GitHub credentials, so the push
must run from your own machine:

```bash
git clone https://github.com/msk-1989/neighborx.git   # if not already cloned
cd neighborx
git pull                                              # get the latest commits
# (if you have unpushed local commits from the sandbox)
git push origin main
```

If you don't have the repo locally, you can also fork it and push there.

---

## 2. Create a Neon Postgres database

1. Go to <https://neon.tech> → sign in → **New Project**.
2. Name it `neighborx`, pick a region close to Vercel's default (Washington,
   D.C. / `iad1` for US, or Frankfurt / `fra1` for EU).
3. Neon gives you **two** connection strings:
   - **Pooled** (PgBouncer, for the app runtime) — ends in `-pooler`
   - **Direct** (for migrations / `prisma db push`) — no `-pooler`
4. Copy both. You'll set them on Vercel in step 4.

> Neon's free tier includes 0.5 GB storage and auto-suspend — more than enough
> for a neighborhood app.

---

## 3. Create the schema on Neon

From your local machine (with the repo checked out and `.env` **temporarily**
pointing at Neon so `prisma` can push the schema):

```bash
# one-off: push the schema to Neon
DATABASE_PROVIDER=postgresql \
DATABASE_URL="postgres://USER:PASS@ep-POOLER.REGION.aws.neon.tech/neighborx?sslmode=require&pgbouncer=true" \
DIRECT_DATABASE_URL="postgres://USER:PASS@ep-DIRECT.REGION.aws.neon.tech/neighborx?sslmode=require" \
npx prisma db push
```

This creates all the tables. (You only do this once, or whenever the schema
changes.)

> **Why two URLs?** Neon's pooled endpoint (PgBouncer transaction mode) is
> great for serverless runtime connections but **breaks** Prisma migrations.
> Prisma needs a direct connection for `db push` / `migrate`. The
> `DIRECT_DATABASE_URL` env var exists exactly for this.

---

## 4. Import the project on Vercel

1. Go to <https://vercel.com> → **Add New… → Project**.
2. Import the `msk-1989/neighborx` repo (or your fork).
3. Vercel auto-detects Next.js. The committed `vercel.json` already sets:
   - `framework: nextjs`
   - `buildCommand: bash scripts/vercel-prebuild.sh && next build`
   - `installCommand: bun install`
4. **Do not deploy yet** — first add the environment variables (step 5).

---

## 5. Set Vercel environment variables

In Vercel: **Project → Settings → Environment Variables**, add these for the
**Production**, **Preview**, and **Development** environments:

| Key | Value | Notes |
|---|---|---|
| `DATABASE_PROVIDER` | `postgresql` | Triggers the prebuild provider swap |
| `DATABASE_URL` | `postgres://...-pooler...?sslmode=require&pgbouncer=true&connect_timeout=15` | Neon pooled |
| `DIRECT_DATABASE_URL` | `postgres://...direct...?sslmode=require` | Neon direct (used by prisma CLI at build) |
| `NEXT_PUBLIC_CHAT_SERVICE_URL` | `https://neighborx-chat.onrender.com` | From step 7 (optional — chat falls back to HTTP polling if unset) |

> `NEXT_PUBLIC_*` vars are baked into the client bundle at build time, so they
> **must** be set before deploying.

---

## 6. Deploy

Click **Deploy** on Vercel. The build will:

1. `bun install`
2. `bash scripts/vercel-prebuild.sh` — sees `DATABASE_PROVIDER=postgresql` and
   rewrites `prisma/schema.prisma`'s provider from `"sqlite"` to `"postgresql"`,
   then runs `prisma generate`.
3. `next build`

If it succeeds, you get a `https://neighborx.vercel.app` URL. 🎉

---

## 7. Host the chat service (socket.io) separately

Vercel is serverless — it can't hold a WebSocket connection open. The chat
mini-service in `mini-services/chat-service/` must be hosted elsewhere.

### Option A — Render (easiest, free tier)

1. Go to <https://render.com> → **New + → Web Service**.
2. Connect your GitHub repo.
3. Settings:
   - **Root Directory**: `mini-services/chat-service`
   - **Runtime**: `Bun` (or Node if Bun isn't available — add `@types/node`)
   - **Build Command**: `bun install` (or `npm install`)
   - **Start Command**: `bun run start` (or `npm start`)
   - **Plan**: Free
4. Render auto-sets the `PORT` env var — the service reads it (defaults to
   3003 locally).
5. Deploy. You get a URL like `https://neighborx-chat.onrender.com`.
6. Set `NEXT_PUBLIC_CHAT_SERVICE_URL` to that URL on Vercel (step 5) and
   redeploy the Vercel app.

### Option B — Railway / Fly.io

Same idea: point at `mini-services/chat-service`, run `bun run start`, let the
platform inject `PORT`. Railway and Fly both have free-ish tiers.

### Graceful fallback

If you skip this step entirely, the chat UI still works — it falls back to
HTTP polling against `/api/chat` every 4 seconds (the component already does
this). You just lose instant real-time delivery.

---

## 8. Seed the production database (optional)

The repo's `prisma/seed.ts` populates demo data. To run it against Neon:

```bash
DATABASE_PROVIDER=postgresql \
DATABASE_URL="postgres://...-pooler...?sslmode=require&pgbouncer=true" \
DIRECT_DATABASE_URL="postgres://...direct...?sslmode=require" \
bun run db:seed
```

(For production you'd typically write a real seeding/migration script, but
this is fine for a demo deploy.)

---

## 9. Local dev

Unchanged from before. `.env` already points at the local SQLite file:

```bash
bun install
bun run db:push     # creates/syncs the local SQLite DB
bun run db:seed     # optional: load demo data
bun run dev         # http://localhost:3000
```

The chat mini-service runs separately:

```bash
cd mini-services/chat-service
bun install
bun run dev         # http://localhost:3003
```

---

## Architecture summary

```
┌─────────────────────┐        ┌──────────────────────┐
│  Vercel (Next.js)   │        │  Render / Railway    │
│  - App routes       │        │  - socket.io chat    │
│  - /api/* (serverless)│      │    mini-service      │
│                     │        │  (PORT from env)     │
│  DATABASE_URL ──────┼────────┼─► NEXT_PUBLIC_CHAT_  │
│  (Neon Postgres)    │        │   SERVICE_URL        │
└─────────┬───────────┘        └──────────────────────┘
          │
          ▼
┌─────────────────────┐
│  Neon (Postgres)    │
│  - pooled endpoint  │  ← DATABASE_URL (runtime)
│  - direct endpoint  │  ← DIRECT_DATABASE_URL (prisma CLI)
└─────────────────────┘
```

---

## Troubleshooting

**Build fails with `Environment variable not found: DATABASE_URL`** —
You forgot to set the env vars on Vercel (step 5).

**Build fails with `Prisma schema validation … provider`** —
The prebuild script didn't run. Check that `vercel.json`'s `buildCommand`
starts with `bash scripts/vercel-prebuild.sh &&`.

**Runtime error `PrismaClientInitializationError` / `Can't reach database`** —
`DATABASE_URL` is the wrong format. For Neon it MUST include
`?sslmode=require` and the pooled endpoint should have `&pgbouncer=true`.

**Chat doesn't update in real time on Vercel** —
Either `NEXT_PUBLIC_CHAT_SERVICE_URL` isn't set, or the chat service isn't
deployed. The UI falls back to 4-second HTTP polling, so messages still
appear — just not instantly. Check the browser console for socket.io
connection errors.

**`prisma db push` against Neon fails with `transactions not supported`** —
You're using the pooled URL. Use `DIRECT_DATABASE_URL` (the non-pooler
endpoint) for `db push` / `migrate`.

---

## TL;DR for the impatient

```bash
# 1. Push to GitHub (from your machine)
git push origin main

# 2. Create Neon DB, push schema once
DATABASE_PROVIDER=postgresql \
DATABASE_URL="postgres://USER:PASS@ep-POOLER...?sslmode=require&pgbouncer=true" \
DIRECT_DATABASE_URL="postgres://USER:PASS@ep-DIRECT...?sslmode=require" \
npx prisma db push

# 3. On Vercel: import the repo, set these 4 env vars, deploy:
#    DATABASE_PROVIDER=postgresql
#    DATABASE_URL=<neon pooled>
#    DIRECT_DATABASE_URL=<neon direct>
#    NEXT_PUBLIC_CHAT_SERVICE_URL=<render url, optional>

# 4. On Render: deploy mini-services/chat-service as a Bun web service
#    (auto PORT), then put its URL in Vercel's NEXT_PUBLIC_CHAT_SERVICE_URL
```
