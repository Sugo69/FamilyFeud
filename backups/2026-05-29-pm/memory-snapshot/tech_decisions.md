---
name: Tech Decisions
description: Key technical choices — port, MPA structure, Firebase, Anthropic API, lesson pipeline, retry logic, deployment
type: project
originSessionId: b20eb376-7e49-4ea8-962f-4a6a1629e832
---
- **Dev port**: 5173 — flipped from 5174 on 2026-05-29 (the other project on this machine now uses 5174; locked via `strictPort: true` in vite.config.js)
- **Stack**: Vite MPA + vanilla HTML/CSS/JS for portal, Common Ground, and Scripture Trail; React 18 + Babel CDN for Scripture Match
- **MPA build**: `vite.config.js` `rollupOptions.input` declares all five pages (main, admin, commonGround, memory, scriptureTrail)
- **Real-time sync**: Firebase Firestore. Anonymous auth for game monitor/play; Google Auth for portal (`index.html`) and admin (`admin.html`). Project: `family-feud-game-5b8e7`, appId: `exodus-feud-final-v10`
- **Classroom scoping**: `basePath` variable in each game switches between global and `classrooms/{id}` sub-path from `?room=` URL param. `globalBasePath` always points to global — used for `lessonLibrary` reads. Monitor view (no `?room=`) always falls back to global.
- **Scripture Match Firebase pattern**: Firebase lives in a `<script type="module">` block (separate from Babel script). Must call `signInAnonymously` and await it (`_authReady` promise) before any Firestore read. Exposes `window.loadMemoryLibrary()` / `window.loadMemoryFromLibrary()` for React.
- **Firebase config**: Via `VITE_*` environment variables — gitignored `.env`
- **AI**: Claude `claude-sonnet-4-6` via Anthropic API
  - Dev: Vite plugin middleware in `vite.config.js` reads `ANTHROPIC_API_KEY` via `loadEnv`
  - Prod: Vercel serverless functions in `api/*.js`
  - **Security**: `ANTHROPIC_API_KEY` must NEVER have `VITE_` prefix — would expose key in browser bundle
- **Lesson pipeline v3** (`/api/lesson-pipeline`): two-step Claude pipeline + runtime compliance. **Shared module** at `api/_lib/pipeline.js` exports `runLessonPipeline()`; both the Vercel handler and Vite dev middleware are thin wrappers. Step 1: extract lesson structure (scripture refs with `verseText`, video/talk links, themes). Step 2: generate game content. Step 3: structural compliance (required fields, URL allowlist, hard-block regex). Step 4: optional AI safety review (`ENABLE_SAFETY_REVIEW` env, default on). Returns `rounds[]` or `pairs[{cardA, cardB, icon, scene, verse, question, christConnection, url, complianceCheck}]` + `complianceReport{overall, passCount, reviewCount, rewrittenCount, blockedCount, policyRefs}`. Pipeline label: `'lesson-pipeline-v3'`.
- **CFM schedule** (`src/lib/cfm-schedule.js`): 35-entry map of 2026 OT Sundays → Gospel Library URLs. Exports `getCurrentCfmLesson()`, `resolveLessonIdFromUrl(url)`. Used by admin Library's "⭐ Fill This Week" button and to derive deterministic `cfm-{manual}-{slug}` doc IDs via `setDoc` (prevents duplicate library entries).
- **Retry logic for Claude API**:
  - Server side: on 500/503/529 or timeout/overload error → wait 5s → retry once (`api/lesson-pipeline.js` + vite middleware)
  - Client side: on any error → 30-second countdown shown in status bar → auto-retry; clicking Generate again cancels countdown and retries immediately
- **Deployment**: Vercel (preferred — static Vite build + serverless /api functions)
- **GitHub repo**: https://github.com/Sugo69/FamilyFeud (branch: main, user: Sugo69)
- **Video files**: Gitignored (`*.mp4`) — up to 287MB each, exceed GitHub's 100MB limit

**Why Firestore:** Enables instant real-time sync between TV monitor and admin phone/iPad without a backend server.

**Why Vite middleware for AI (not Vercel CLI):** Vercel CLI required account login and had legacy auth issues on this machine. Vite's `configureServer` plugin handles all `/api/*` routes locally — no extra tools needed.

**How to apply:** Keep the app as a pure static frontend. All "backend" is Firebase + Anthropic via serverless. No Node.js server needed at runtime.
