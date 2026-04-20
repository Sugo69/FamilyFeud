# Family Feud Game — CLAUDE.md

## Project Overview
A browser-based Family Feud-style game platform for church youth groups (LDS, ages 14–16). Built as a single-page app with three views sharing live state via Firebase Firestore.

**Three views in one URL:**
- **Monitor View** — full-screen 16:9 TV display for the classroom
- **Admin View** — phone/iPad control panel for the teacher
- **Backlog View** — product backlog tracker with AI story generation

## Tech Stack
- **Frontend**: Vite + vanilla HTML/CSS/JS (single `index.html`)
- **Real-time sync**: Firebase Firestore (anonymous auth)
- **AI**: Claude `claude-sonnet-4-6` via Anthropic API (Vite middleware in dev, Vercel function in prod)
- **Dev port**: 5174 (5173 is reserved for another project on this machine)
- **Deployment target**: Vercel (static) or Railway

## Project Structure
```
FamilyFeud/
├── CLAUDE.md
├── index.html              # Entire app — Monitor + Admin + Backlog views
├── package.json
├── vite.config.js          # Vite config + /api/generate dev middleware
├── api/
│   └── generate.js         # Vercel serverless function (production AI endpoint)
├── "Exodus Matching Game"/ # Reference game — HTML + audio assets
│   ├── Exodus-game.html
│   ├── Scriptures.docx
│   └── *.mp3               # Sound effects (mp4 videos gitignored — too large)
├── app.js                  # Original prototype (pre-Vite, for reference)
├── .env                    # Firebase + Anthropic keys (gitignored)
├── .env.example            # Template for .env
└── .gitignore
```

## Environment Variables
### Firebase (browser-side, `VITE_` prefix)
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

### Anthropic API (server-side only, NO `VITE_` prefix)
- `ANTHROPIC_API_KEY` — used by `vite.config.js` middleware (dev) and `api/generate.js` (prod)

> **Security**: Never add `VITE_` prefix to `ANTHROPIC_API_KEY` — that would expose it in the browser bundle.

## Firebase Configuration
- **Project**: `family-feud-game-5b8e7`
- **Anonymous Auth**: Enabled
- **Firestore**: Standard edition, `nam5 (United States)`
- **Security rules**: Authenticated users can read/write `/artifacts/{appId}/public/**`

## Firestore Data Structure
```
artifacts/exodus-feud-final-v10/public/data/
├── feudSession/state        # Live game state (scores, round, strikes, reveals)
├── backlogItems/{docId}     # Backlog items (seqId, priority, description, batchIds)
└── blGuides/{blDocId}       # AI-generated implementation guides per BL item
```

## Dev Commands
```bash
npm install
npm run dev        # starts at http://localhost:5174 — includes AI Story Generator
npm run build      # production build → dist/
npm run preview    # preview production build
```

> **AI Story Generator** works with `npm run dev`. Vite serves `/api/generate`
> as a built-in middleware plugin using `ANTHROPIC_API_KEY` from `.env`.

## Game Logic
- 10 rounds of pre-loaded Exodus questions (hardcoded in `index.html` `gameData` array)
- 3 strikes → opponent gets steal opportunity; 3rd strike auto-switches active team
- After 2 consecutive wins by same team → Switch Play banner
- Auto-advances round 6s after a win banner
- Undo last action supported (`prevState` stored in Firestore)
- Full game reset requires double-tap confirmation

## Backlog System
- Items stored in Firestore `backlogItems` collection
- Fields: `seqId` (BL-001 format), `priority` (P0–P3), `description`, `batchIds[]`, `createdAt`
- Inline edit per item, delete with confirmation
- Filter by priority badge or batch ID text search
- **6 seeded items**: BL-001 through BL-006 across BATCH-1, BATCH-2, BATCH-3

## AI Story Generator
- **🤖 Story** button on each backlog item → generates user stories, implementation plan, test cases, validation checklist, and a ready-to-paste Claude Code prompt
- **📋 Generate Stories** in filter bar → batch mode (all items in a batch)
- Output auto-saved to Firestore `blGuides/{blDocId}`
- **📄 Guide** button (green) replaces 🤖 Story once a guide is saved
- Download as `{BL-ID}-implementation-guide.md` or copy to clipboard
- Model: `claude-sonnet-4-6`, max 8000 tokens

## Reference Assets
- `Exodus Matching Game/Exodus-game.html` — Scripture memory matching game (BL-006 reference)
- `Exodus Family Feud Master Prompt.docx` — Original game design document
- `Deployment & Safeguard Guide.docx` — Deployment notes

## Deployment (Vercel)
1. Push to GitHub (`Sugo69/FamilyFeud`, branch `main`)
2. Import repo in Vercel dashboard
3. Set all `VITE_*` env vars + `ANTHROPIC_API_KEY` (no VITE_ prefix)
4. Deploy — Vercel auto-detects Vite; `api/generate.js` becomes a serverless function

## Key Constraints
- Dev port **must be 5174** — 5173 is used by another project on this machine
- Firebase anonymous auth — no login required for players or admin
- `ANTHROPIC_API_KEY` must never have `VITE_` prefix
- `.mp4` video files are gitignored (too large for GitHub — up to 287MB each)
