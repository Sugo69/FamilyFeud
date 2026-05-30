# Memory Index — Kindred Youth Platform

- [Project Overview](project_overview.md) — Kindred: portal + admin + Common Ground + Scripture Match; Firebase sync; backlog in admin.html; display scale gear menu
- [User Profile](user_profile.md) — LDS teacher/developer building a reusable church youth game platform
- [Tech Decisions](tech_decisions.md) — Vite MPA (5 pages), port 5173, Firebase Firestore, lesson-pipeline v3 (shared module), retry logic, Vercel deployment
- [Backlog & Features](backlog_features.md) — 6 seeded backlog items + Opus47_Backlog.md (scale/compliance/Gemini parity) in admin.html
- [Claude Code Skills](skills_overview.md) — extract-lesson / youth-leader / gamemaster; compliance-metadata contracts; lesson-reviewer + content-safety subagents
- [Compliance System](compliance_system.md) — lesson-pipeline v3 policy-as-code, admin badges, subagent rails, Church policy sources
- [LED Integration](wled_integration.md) — ESP8266 9×7 matrix; USB serial only (Chrome Web Serial, kindred-leds.ino); WiFi proxy deleted 2026-04-23 to shrink attack surface
- [Classroom & Library](classroom_library.md) — ?room= classroom scoping; lessonLibrary always global; deterministic doc IDs via cfm-schedule.js; Fill-This-Week button
- [Cloudflare API bypass](cloudflare_api_bypass.md) — /api/* goes direct to Vercel via api.kindred-youth.org (DNS-only) to dodge CF's 100s edge timeout; revisit 2026-05-07
- [Testing Constraints](testing_constraints.md) — user has only ONE Gmail account; never propose "sign in as second teacher" — use admin-disable toggle or Firestore hand-edits
- [Model Strategy](model_strategy.md) — Sonnet 4.6 for all 3 pipeline calls; Haiku hallucinated cross-manual refs; planned Opus 4.6 gold-standard test to derive Sonnet guardrails
- [CFM 2027 NT Transition](cfm_2027_new_testament.md) — 2027 moves OT→NT; cfm-schedule.js needs rewrite when manual publishes (~Nov 2026); hard deadline first 2027 Sunday
- [Production Hosting](production_hosting.md) — repo Sugo69/Kindred-Youth; kindred-youth.org on Vercel via Cloudflare; .com redirects to .org; vercel.json COOP header
- [Legal Review 2026-04-22](legal_review_snapshot.md) — trademark/copyright/privacy posture review; drove rebrand to kindred-youth + non-affiliation disclaimer; attorney gate before self-serve signup
- [Scripture Scout trademark](trademark_scripture_scout.md) — "Scripture Scout" is a third-party TM; game is Scripture Match — never use Scout
- [Auto-push after commit](feedback_auto_push.md) — auto `git push` after every commit on this solo project; still confirm before destructive pushes / merges / PRs
- [API budget tolerance](feedback_api_budget.md) — small Anthropic/Vercel spend on testing & investigation is fine; flag transparently after; ask first only above ~$5
- [Responsive design](feedback_responsive_design.md) — every Kindred surface must flex phone → tablet → HD → 4K; prefer auto-fill grids and clamp() over fixed pixels
- [Backup before destructive ops](feedback_backup_before_destructive.md) — always copy original-fidelity source assets to `c:/Users/lewis/Documents/Kindred-asset-originals/{date}-{slug}/` before resize/compress/re-encode
# userEmail
The user's email address is lewiswf@gmail.com.
# currentDate
Today's date is 2026-04-21.
