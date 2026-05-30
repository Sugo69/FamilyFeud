---
name: Cloudflare API bypass via api.kindred-youth.org
description: Static site is CF-proxied; /api/* routes direct to Vercel via DNS-only subdomain to dodge CF's 100s edge timeout. Revisit 2026-05-07.
type: project
originSessionId: d1e97936-ee43-43d1-a180-f581679f2a6f
---
Production /api/* traffic routes through `api.kindred-youth.org` (DNS-only grey cloud, CNAME to `cname.vercel-dns.com`). The static site (`kindred-youth.org`, `www.kindred-youth.org`) stays orange-cloud proxied through Cloudflare.

**Why:** Cloudflare Free/Pro/Business have a hard 100-second origin timeout. `lesson-pipeline.js` routinely takes 90–150s (Claude extraction + generation + safety review). Real lessons were 524-ing at the edge, even though Vercel's own `maxDuration` was set to 300s. An HTML error page came back and the client blew up trying to `JSON.parse` it.

**How to apply:**
- Client resolves `API_BASE` at page load (in `admin.html`, `games/common-ground.html`, `games/memory.html`): prod → `https://api.kindred-youth.org`, else `""`.
- All 8 fetch sites use `${API_BASE}/api/X`. The Scripture Match React/Babel script uses `window.__kindredApiBase` set in the module script bridge.
- CORS: the Origin allowlist in `api/_lib/origin.js` already includes `https://kindred-youth.org` and `https://www.kindred-youth.org`, so cross-origin calls from the static host to the api host pass without server changes.
- Trade-off: API subdomain loses Cloudflare WAF + rate-limit. Defenses fall back to in-app gates (Origin allowlist + Firebase ID token + auth-required 401).

**Revisit 2026-05-07 (2 weeks from 2026-04-23):** decide whether to (a) keep this split, (b) move pipeline to an async Firestore-backed job queue so every call finishes <100s and CF can proxy /api/* again, or (c) upgrade to a plan with longer edge timeouts. Keep whichever path preserves defense-in-depth without shipping more architecture than the classroom use case needs.
