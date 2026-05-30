---
name: Production Hosting & Domains
description: Where Kindred is deployed in production — registrar, DNS, Vercel project, domain setup, env vars, COOP header, Firebase auth domain list
type: reference
originSessionId: d1e97936-ee43-43d1-a180-f581679f2a6f
---
**Repo**: `github.com/Sugo69/Kindred-Youth` (renamed from FamilyFeud on 2026-04-22; local remote was updated to the capitalized URL to stop the redirect warning).

**Primary domain**: `kindred-youth.org` — CNAME `@` → Vercel apex record (DNS-only / grey cloud at Cloudflare so Vercel handles the TLS cert via Let's Encrypt).

**Defensive domain**: `kindred-youth.com` — owned + on Cloudflare. Cloudflare Redirect Rule issues 301 → `https://kindred-youth.org`. Rule needs DNS records to fire, so there are dummy proxied A records `@` + `www` → `192.0.2.1`.

**Registrar**: Cloudflare Registrar (at-cost, no markup). WHOIS privacy is automatic on Cloudflare Registrar. DNSSEC on. SSL/TLS Full (strict). Always Use HTTPS. Bot Fight Mode. Email Routing configured.

**Hosting**: Vercel project `kindred-youth` (or whatever the user named it at import — the same project serves `kindred-youth.org`). Vercel auto-deploys from GitHub `main` branch. Vite MPA is auto-detected; all `api/*.js` files become serverless functions.

**Required Vercel env vars** (Production scope):
- `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`
- `ANTHROPIC_API_KEY` (no `VITE_` prefix — would expose in browser bundle)

If env vars are missing, prod loads as a blank page and the console shows `auth/invalid-api-key`.

**Firebase Authorized Domains**: must include `kindred-youth.org` (Firebase Console → Authentication → Settings → Authorized Domains). Missing entry → `auth/unauthorized-domain` on sign-in.

**`vercel.json`**: sets `Cross-Origin-Opener-Policy: same-origin-allow-popups` for all routes — required so the Google OAuth popup doesn't get blocked or warned by Chrome's COOP policy.

**How to apply**: when debugging prod-only auth issues, check (in order) env vars present → Firebase auth domain list → vercel.json COOP header → latest deploy succeeded. When adding a new prod domain in future, mirror the .org setup (CNAME apex + grey cloud + Firebase authorized domain + Vercel domain config).
