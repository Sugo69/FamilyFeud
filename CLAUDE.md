# Family Feud Game — CLAUDE.md

## Project Overview
A browser-based Family Feud-style game platform for church youth groups (LDS, ages 14–16). Built as a single-page app with four views sharing live state via Firebase Firestore.

**Four views in one URL:**
- **Monitor View** — full-screen 16:9 TV display for the classroom
- **Admin View** — phone/iPad control panel for the teacher
- **Backlog View** — product backlog tracker with AI story generation
- **Teacher Portal** — no-code content editor; create and publish custom game question sets

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
├── index.html              # Entire app — Monitor + Admin + Backlog + Teacher Portal views
├── package.json
├── vite.config.js          # Vite config + /api/generate, /api/fetch-content, /api/generate-questions dev middleware
├── api/
│   ├── generate.js         # Vercel serverless — AI backlog story generator
│   ├── fetch-content.js    # Vercel serverless — URL proxy/scraper for Teacher Portal
│   └── generate-questions.js  # Vercel serverless — question generator (3 types)
├── .claude/
│   └── commands/           # Claude Code project slash commands
│       ├── extract-lesson.md   # /project:extract-lesson — fetch + parse CFM lesson
│       └── youth-leader.md     # /project:youth-leader — generate lesson plan + game questions
├── lesson-database/        # Extracted lesson data (local, not Firestore)
│   ├── *.json              # Structured lesson data with scriptures, themes, FSY connections
│   └── *-mindmap.md        # Mermaid mindmaps per lesson
├── backups/                # Timestamped backups of CLAUDE.md and MEMORY.md
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
- `ANTHROPIC_API_KEY` — used by `vite.config.js` middleware (dev) and all `api/*.js` functions (prod)

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
├── activeGame/current       # Currently active game (gameId + rounds[]) — monitor reads this
├── games/{gameId}           # Saved custom game sets (name, rounds[], createdAt)
├── backlogItems/{docId}     # Backlog items (seqId, priority, description, batchIds, implementationNotes)
└── blGuides/{blDocId}       # AI-generated implementation guides per BL item
```

## Dev Commands
```bash
npm install
npm run dev        # starts at http://localhost:5174 — all AI endpoints live
npm run build      # production build → dist/
npm run preview    # preview production build
```

> All three `/api/*` endpoints work with `npm run dev` via Vite middleware.
> `ANTHROPIC_API_KEY` must be in `.env` (no VITE_ prefix).

## Game Logic
- Rounds loaded from `activeGame/current` in Firestore (set via Teacher Portal) — falls back to hardcoded Exodus `gameData` if no active game
- `getGameRounds()` wrapper handles the fallback; all game logic uses this — never access `gameData[]` directly
- 3 strikes → opponent gets steal opportunity; 3rd strike auto-switches active team
- After 2 consecutive wins by same team → Switch Play banner
- Auto-advances round 6s after a win banner
- Undo last action supported (`prevState` stored in Firestore)
- Full game reset requires double-tap confirmation

## Teacher Portal
- View switcher: "🎓 Teacher Portal" button → `setView('teacher')`
- **Library view**: lists all saved games from Firestore `games/` collection; "Set Active" pushes a game to the monitor in real time (writes to `activeGame/current` + resets game state)
- **Editor view**: create/edit question sets; name the game; add/remove/reorder questions via SortableJS drag-and-drop
- **URL ingestion**: paste a URL → `/api/fetch-content` strips HTML → `/api/generate-questions` generates questions via Claude
- **Question types** (select before generating or per-card):
  - `scripture_based` — quotes verse verbatim, asks factual question, 4 answers (40/30/20/10 pts)
  - `scripture_application` — quotes verse, asks how it applies today, 4 answers
  - `family_feud` — classic survey style ("Name something…"), 6 answers (38/22/14/10/9/7 pts)
- SortableJS CDN: `https://cdn.jsdelivr.net/npm/sortablejs@1.15.2/Sortable.min.js`

## Backlog System
- Items stored in Firestore `backlogItems` collection
- Fields: `seqId` (BL-001 format), `priority` (P0–P3), `description`, `batchIds[]`, `implementationNotes`, `createdAt`
- `implementationNotes` — free-text field for spec changes, decisions, and post-implementation updates
- Inline edit per item (including notes), delete with confirmation
- Filter by priority badge or batch ID text search
- **6 seeded items**: BL-001 through BL-006 across BATCH-1, BATCH-2, BATCH-3

## AI Story Generator
- **🤖 Story** button on each backlog item → generates user stories, implementation plan, test cases, validation checklist, and a ready-to-paste Claude Code prompt
- **📋 Generate Stories** in filter bar → batch mode (all items in a batch)
- Output auto-saved to Firestore `blGuides/{blDocId}`
- **📄 Guide** button (green) replaces 🤖 Story once a guide is saved
- Download as `{BL-ID}-implementation-guide.md` or copy to clipboard
- Model: `claude-sonnet-4-6`, max 8000 tokens

## Claude Code Skills (`.claude/commands/`)

### `/project:extract-lesson <URL>`
Fetches a Come Follow Me lesson page and extracts:
- All scripture references (section-aware, duplicate-flagged for children's sections)
- Conference messages, video links, discussion questions
- Cross-references against YW Theme, AP Quorum Theme, Annual Youth Theme (HIGH/MEDIUM scoring)
- FSY chapter relevance scoring (fetches chapters scoring ≥5 pts)
Saves: `lesson-database/{lessonId}.json` + `lesson-database/{lessonId}-mindmap.md`

### `/project:youth-leader <path-to-lesson.json>`
Takes an extracted lesson JSON and generates:
1. **Compliance report** — Handbook §13, age-appropriateness, gender-neutral, question safety
2. **50-minute lesson plan** — ice breaker → 2 scripture blocks (chain activity) → application → testimony invitation
3. **Engagement activity bank** — tagged by type/level/duration/materials
4. **QR code access points** — Gospel Library URLs for every scripture + conference talk + FSY chapter
5. **Game questions JSON** — 8 questions (2 scripture_based, 2 scripture_application, 4 family_feud), game-portal-ready
6. **Mindmap teaching layer** — appended to existing lesson mindmap file

Teaching model: Teaching in the Savior's Way · Handbook §13 · chain activity mechanic ·
L1 factual → L4 testimony · no PowerPoint · teacher talks <20% of class time

## Lesson Database (`lesson-database/`)
Extracted lesson JSON files from Come Follow Me. Not stored in Firestore — local files only.
Current: `old-testament-2026-lesson-20` (Deuteronomy 6–8; 15; 18; 29–30; 34 · May 11–17)

## Reference Assets
- `Exodus Matching Game/Exodus-game.html` — Scripture memory matching game (BL-006 reference)
- `Exodus Family Feud Master Prompt.docx` — Original game design document
- `Deployment & Safeguard Guide.docx` — Deployment notes

## Deployment (Vercel)
1. Push to GitHub (`Sugo69/FamilyFeud`, branch `main`)
2. Import repo in Vercel dashboard
3. Set all `VITE_*` env vars + `ANTHROPIC_API_KEY` (no VITE_ prefix)
4. Deploy — Vercel auto-detects Vite; all `api/*.js` files become serverless functions

## Key Constraints
- Dev port **must be 5174** — 5173 is used by another project on this machine
- Firebase anonymous auth — no login required for players or admin
- `ANTHROPIC_API_KEY` must never have `VITE_` prefix
- `.mp4` video files are gitignored (too large for GitHub — up to 287MB each)
- `.claude/settings.local.json` is gitignored — contains machine-specific Claude Code permissions
- `getGameRounds()` must always be used instead of direct `gameData[]` access — it handles the active game fallback
