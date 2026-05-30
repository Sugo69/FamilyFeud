---
name: Claude Code Skills Pipeline
description: Three-skill lesson-to-game pipeline for LDS youth Sunday School; extract-lesson → youth-leader → gamemaster
type: project
originSessionId: b20eb376-7e49-4ea8-962f-4a6a1629e832
---
Three Claude Code project skills form a complete pipeline:

1. `/project:extract-lesson <URL>` — fetches a Come Follow Me lesson, extracts scriptures/questions/themes/FSY connections, AND fetches `verseText` for every scripture ref from Gospel Library (batched by chapter, max 400 chars per range); saves JSON + mindmap to `lesson-database/`. Output `allScriptureRefs[]` includes `{ ref, book, chapter, verses, verseText, url, section, fromChildrenSection, isDuplicate }`.
2. `/project:youth-leader <lesson.json>` — reads `allScriptureRefs[].verseText` and builds lookup map; generates 50-min lesson plan, activity bank, QR codes, Common Ground game questions (with `verseText` + `url` per question); appends teaching layer to mindmap
3. `/project:gamemaster <lesson.json>` — reads `allScriptureRefs[].verseText`, `allVideoLinks[]`, `allConferenceMessages[]`; designs classroom game session (primary game + warm-up), full facilitation script, print-ready question/sabotage cards (with verbatim verse text), game questions JSON (with `verseText` + `url`); privacy-audits all content; appends game layer to mindmap

**IMPORTANT:** These are CLI-only Claude Code skills — they run in this conversation, NOT as HTTP endpoints. The HTTP lesson pipeline (`/api/lesson-pipeline`) is a separate implementation that mirrors their quality.

**Also available via Teacher Portal UI (no CLI needed):**
- Both Common Ground and Scripture Match games have a "From Lesson URL" button in their Teacher Portal
- Calls `/api/lesson-pipeline` (v2 — two-step Claude pipeline) with `gameType:'common-ground'` or `gameType:'memory'`
- Returns `rounds[]` or `pairs[{..., scene, verse, christConnection, url}]` + `videoLinks[]` + `talkLinks[]`

**Why:** Together they take a lesson URL and produce everything a teacher needs — extracted data, lesson plan, and a complete game experience ready to run in class.

**How to apply:** CLI skills are for deep lesson prep; the UI pipeline is the quickest path for teachers in class. Both produce verbatim scripture verse text — never paraphrase.

## Compliance contracts (added 2026-04-21)
All three skills now have an appended **Compliance Metadata Contract** that requires machine-readable reports in the output:
- `extract-lesson` → top-level `extractionReport` (scriptureRefCount, verseTextFetched/Failed, urlAllowlistViolations, warnings)
- `youth-leader` / `gamemaster` → top-level `complianceReport` with `structural`, `christConnectionCoverage`, and `overall: PASS | PASS_WITH_REWRITES | REVIEW_REQUIRED`
- Every `round`/`pair` must carry `complianceCheck: "PASS" | "REVIEW: <reason>"` and `christConnection`
- URLs only on `churchofjesuschrist.org` / `media.churchofjesuschrist.org` / `abn.churchofjesuschrist.org` / `speeches.byu.edu`

## Subagents (`.claude/agents/`)
- `lesson-reviewer.md` (Sonnet) — per-item PASS/REWRITE/BLOCK verdict across Handbook §13, §37.8, Teaching in the Savior's Way, FSY. Skills must invoke this before declaring content classroom-ready.
- `content-safety.md` (Haiku) — narrow, fast filter for substances / sexual / personal-exposure / URL allowlist / trademark. Runs pre-commit on user-facing strings.
