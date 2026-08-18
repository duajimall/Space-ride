# the music box — a trip to the stars

A personal playlist site built for a big batch of songs (designed around
~300 tracks, but not capped there). Every imported song gets a unique
fictional cosmic name and its own mini cassette tape. Public visitors
open the box and pick a tape to play; you (the owner) get a password-locked
page to bulk-import the whole collection in one go.

## How it works

- **Owner page** (`/owner`) — password-protected. Select up to ~300 audio
  files at once. Each file is hashed in the browser (SHA-256), checked
  against the database for duplicates, uploaded **directly** to object
  storage (not through the server, so it scales past hundreds of files),
  then recorded with a freshly minted cosmic name. At the end you get:
  `Imported: 294 · Duplicates skipped: 5 · Failed: 1`.
- **Public page** (`/`) — "open the music box" reveals every tape in a
  grid, with the live count (`287 tracks · a trip to the stars`), search,
  and a cassette-deck-style player at the bottom.
- Storage and the database are both externally hosted, so the collection
  is permanent — nobody needs to re-upload anything after the first import.

## Stack

- **Next.js 14** (App Router) — hosted on **Vercel** (free tier)
- **Postgres** via **Neon** (free tier) — stores song metadata + cosmic names
- **Cloudflare R2** (S3-compatible object storage, free tier) — stores the
  actual audio files and serves them publicly

## One-time setup

### 1. Database (Neon)
1. Create a free project at https://neon.tech
2. Copy the connection string into `DATABASE_URL`

### 2. Object storage (Cloudflare R2)
1. In the Cloudflare dashboard, create an R2 bucket, e.g. `cosmic-music-box`
2. Under the bucket's **Settings**, enable public access (or attach a
   custom domain) and copy the public URL into `R2_PUBLIC_URL`
3. Create an R2 API token (Account → R2 → Manage API Tokens) with
   read/write access; copy the Account ID, Access Key ID, and Secret
   Access Key into `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`
4. In the bucket's CORS settings, allow `PUT` and `GET` from your site's
   domain (and `http://localhost:3000` while developing) so the browser
   can upload directly

### 3. Local setup
```bash
cp .env.example .env
# fill in .env with the values above, plus:
#   OWNER_PASSWORD  — whatever password unlocks /owner
#   OWNER_SECRET    — any long random string

npm install
npx prisma migrate dev --name init
npm run dev
```
Visit `http://localhost:3000/owner` to import your first batch, and
`http://localhost:3000` to open the box.

### 4. Deploy (Vercel)
1. Push this project to a GitHub repo
2. Import it in Vercel
3. Add all the variables from `.env` as Vercel Environment Variables
4. Deploy — then run `npx prisma migrate deploy` once (locally, pointed
   at the production `DATABASE_URL`) to create the database table

## Notes on the ~300-song requirement

- The owner page has **no artificial limit** — every valid audio file you
  select is queued and processed; nothing is silently dropped.
- Files upload with 4-way concurrency so a batch of ~300 completes in
  one operation without overwhelming the browser or the API.
- Duplicates are detected by **file content hash**, not filename, so a
  renamed copy of a song already in the collection is still caught.
- The total count shown everywhere (`N tracks · a trip to the stars`)
  is always a live `COUNT` from the database — never hardcoded.
- Supported formats: mp3, wav, m4a, aac, ogg, flac.

## Project structure

```
app/
  page.tsx              public music box
  owner/page.tsx         password-gated import dashboard
  api/upload/init        step 1: dedup check + presigned upload URL
  api/upload/finalize    step 2: record song + mint cosmic name
  api/songs              list/search songs
  api/owner/login        owner password check
components/
  MusicBox.tsx           public browsing + player experience
  OwnerUploader.tsx       batch import UI + progress + summary
  Tape.tsx                the cassette tape (SVG)
  Player.tsx              bottom playback bar
lib/
  cosmicNames.ts          the name generator
  clientAudio.ts          browser-side hashing + duration probing
  storage.ts              R2 presigned URLs
  db.ts                   Prisma client
prisma/schema.prisma      Song table
```
