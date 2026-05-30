# Checkpoint — 2026-05-29 PM session

Big session — 17 commits, four major features shipped on top of the morning's Scripture Trail P0. This continues where [CHECKPOINT-2026-05-29.md](./CHECKPOINT-2026-05-29.md) left off (last commit at handoff: `7ac5ea9`).

---

## 🚀 What shipped this session (pushed to `main`)

Oldest → newest, after `7ac5ea9`:

| Commit | What |
|---|---|
| `e862904` | **NT Seminary schedule (160 lessons)** — replaced the 10-lesson stub with the full New Testament Seminary year, Aug 17 2026 → Apr 28 2027. School-day calendar (Mon–Fri) with Labor Day, Thanksgiving, Winter break, MLK, Presidents Day, Spring break excluded. Each lesson tagged `narrative/doctrinal/mixed/intro` and 23 lessons carry a `dmPassage` field for the 25 NT Doctrinal Mastery passages. `SEMINARY_IS_STUB` flipped to `false`. Added `getSeminaryLessonById()` and `SEMINARY_CACHE_TTL_DAYS = 60` for on-demand generation. |
| `f0c6612` | **Per-curriculum trail board refactor** — extracted hardcoded `x/y` from `TRAIL_STOPS` into `src/lib/trail-positions-ot.js` (10 positions, board src, region labels). Stub files for nt/bom/dc/moses/abraham. New `src/lib/trail-themes.js` with `resolveTrailTheme(lessonId)` resolver + `getPositionsForCount(theme, count)` even-distribution picker. Renamed `scripture-trail-board.png` → `-board-ot.png`. |
| `9adb82c` | **5 new trail board PNGs** — Gemini-generated NT/BOM/DC/Moses/Abraham boards added to `public/games/assets/`. boardSrc in all 5 stub files updated to point at the new art. |
| `6d59da3` | **Favicon for Scripture Trail tab.** |
| `8a3bcd0` | **Admin "🗺 Calibrate" tab v1** — click on the board image to place 10 stop positions + 4 region labels. Live JS output snippet ready to paste into position files. |
| `fbd39ea` | **Calibration v2 — Firestore save/load + drag** — per-theme state preserved across switches; drag any placed marker to move it; 💾 Save button writes to Firestore `trailThemes/{key}`; Scripture Trail reads override at load. Fixed regions-all-same-point bug from `oninput` rebuilding DOM mid-keystroke. |
| `ff7f4a3` | **Removed non-affiliation footer from admin page** (kept on Library card tooltip). |
| `c6886c1` | **All-game chips on Upcoming cards** — instead of just a NARRATIVE/DOCTRINAL/MIXED badge, every Upcoming lesson card now shows chips for all non-limited games (best fit at full opacity, good fit muted). |
| `705f139` | **Per-chip nav + Scripture Match green** — fixed bug where every chip on Upcoming cards navigated to Scripture Trail because the outer `<a>` swallowed all clicks. Each chip is now its own `<a>` link. Scripture Match colour changed pink → green (`#4ade80`) for contrast against blue background. |
| `3569e14` | **Common Ground auto-load from library + `intro` type suppression** — `?lesson=` URL param now triggers automatic library lookup and writes to `activeGame/current` so teachers don't have to manually load. Seminary lessons 1/3/4/5 (methodology/overview) tagged `type:'intro'`; portal suppresses game chips for intro lessons and shows "Introductory lesson — no game required" on Today card. Lesson 2 (Plan of Salvation) restored to `doctrinal`. |
| `e14af88` | **NT Doctrinal Mastery 25-passage library** — `src/lib/doctrinal-mastery-nt.js` with all 25 official NT DM passages: full KJV text, key phrase, doctrinal theme, seminary lesson slug, stable `dmId` keys. Helpers: `getDmPassageById`, `getDmPassagesByTheme`, `getDmPassagesForLesson`, `DM_THEMES`. Also committed `Seminary_Schedule.md` as design notes (week-based vs date-based, hemisphere differences). |
| `4dbc4b1` | **By Heart — Doctrinal Mastery memorisation game (Phase A)** — `games/by-heart.html` standalone game, 6th MPA entry. Three picker modes (This Week / All 25 / Any Verse). 5 progressive levels: Read → Echo → Recall → Speak → Heart-Set with progressive cloze blanking (0/25/50/80/100%). Tap-to-reveal blanks. Deterministic content-word-first blank algorithm so the same passage+level always produces identical blanks. Purple tile on portal catalog. |
| `8dc9564` | **Scripture Trail pipeline (no more 501)** — `api/_lib/pipeline.js` `buildTrailGenerationPrompt()` generates 7 stops in 2-3 story arcs, each with verse, 3-choice question (1 correct + 2 distractors), summary, discussion, Christ connection, optional arc metadata (region, video, context). `backfillStops()` fills verse text / URLs from extraction. Structural compliance validates exactly 3 choices, exactly 1 correct, verse + Christ connection present. Retry, safety review, and rewrite paths all extended to handle `parsed.stops`. |
| `bff7c4f` | **Landing copy: drop "or General Conference talks"** from hero description. |
| `e2a4e9b` | **Merged Christ Connection into Why box** in Scripture Trail stop modal — one fewer card on screen. |
| `911fcd0` | **Bug fix: Firestore calibration positions now actually load** — the override block used `_authReady` before it was defined (hoisting bug, ReferenceError swallowed by catch). Game was always falling back to JS-file 7-stop placeholders even though admin had saved 10. Moved override block to run after `_authReady` is created. |
| `38b8015` | **Scripture Trail teacher editor** — new `#editor-scene` inside the game page. Click-to-expand stop rows with reorder ▲▼, delete, all 12+ fields editable (title, ref, verse, URL, summary, objective, 3-choice toggle, answer, discussion, Christ, points, optional arc opener with region/icon/video/context). `+ Add Stop`, validation on Save, Reset to library. Storage: classroom-scoped at `classrooms/{room}/trailLessons/{lessonId}`; loader checks classroom override → global library → inline default. CUSTOM badge on setup scene when classroom edits are active. |

---

## 🏗 Architecture additions

### Trail themes (per-curriculum)
- `src/lib/trail-themes.js` — central registry. `resolveTrailTheme(lessonId)` maps lesson IDs to one of 6 keys: `ot/nt/bom/dc/moses/abraham`. Defaults to `ot` for unrecognised IDs.
- `src/lib/trail-positions-{key}.js` — one file per curriculum, exports `THEME = { key, boardSrc, tokenStart, positions[10], regions[4] }`.
- `getPositionsForCount(theme, count)` — evenly distributes N stops across the 10 calibrated positions. Lessons with 7 stops use indices 0/1.5/3/4.5/6/7.5/9 (rounded) so they span the full trail.
- Board art: `public/games/assets/scripture-trail-board-{key}.png`. Native size 2000×1116.

### Trail calibration system
- Admin tab "🗺 Calibrate" → click theme dropdown → click board to place stops 1-10 in order → drag to refine → 💾 Save.
- Firestore path: `artifacts/exodus-feud-final-v10/public/data/trailThemes/{key}` (global, admin-owned).
- Game loader (in `games/scripture-trail.html` module script) reads this path after auth and overrides JS-file defaults. Falls back silently if missing.
- All 6 themes have saved positions verified via REST API check.

### Doctrinal Mastery library
- `src/lib/doctrinal-mastery-nt.js` — 25 NT DM passages with `dmId`, ref, full KJV text, key phrase, theme, lesson slug.
- Two lessons each anchor two DM passages: lesson 011 (Matt 6:24 + 6:33), lesson 111 (1 Cor 15:20–22 + 15:29). Use `getDmPassagesForLesson(slug)` to retrieve all matches.

### By Heart game
- `games/by-heart.html` — 6th MPA entry in `vite.config.js` as `byHeart`.
- No backend; reads `seminary-schedule.js` for the current lesson and `doctrinal-mastery-nt.js` for passages. Custom verse mode is purely client-side.
- Cloze algorithm prioritises content words at lower levels, falls through to function words at higher; deterministic seed `(idx * 2654435761) >>> 0` so same passage+level always blanks the same words.

### Scripture Trail teacher editor
- Classroom-scoped path: `artifacts/exodus-feud-final-v10/public/data/classrooms/{room}/trailLessons/{lessonId}`.
- Editor opens from setup scene; works on a deep-clone of `TRAIL_STOPS` so changes don't apply until Save.
- `window.saveTrailEditsToClassroom(lessonId, trailData)` writes; `window.resetTrailEditsToLibrary(lessonId)` clears.
- `window.__kindredTrailIsCustom` flag drives the CUSTOM badge on the setup scene.
- Validation on Save: title required, question required, exactly 3 choices with exactly 1 correct, all choices have text.

---

## 📦 Live config snapshots

- **Dev port:** 5173 (unchanged)
- **Production URL:** https://kindred-youth.org
- **MPA entries in `vite.config.js`:** main, admin, commonGround, memory, scriptureTrail, **byHeart** (6 total)
- **Asset folder:** `public/games/assets/` — 6 trail boards (ot/nt/bom/dc/moses/abraham), 24 character portraits
- **Firestore collections added today:**
  - `trailThemes/{key}` — admin-calibrated board positions, global
  - `classrooms/{room}/trailLessons/{lessonId}` — classroom-scoped Scripture Trail edits

---

## 🧠 Key strategic decisions made

1. **Seminary is generation-on-demand, not pre-generated.** Seminary has 160 lessons vs CFM's 26 — 5× the volume. Pre-generating would burn API budget on lessons that may never be taught. Generated lessons cache in `lessonLibrary` for 60 days (`SEMINARY_CACHE_TTL_DAYS`), then regenerate.
2. **Trail board positions live in Firestore, not source code.** Admin calibrates visually via the "🗺 Calibrate" tab; positions persist instantly. JS-file positions are seed defaults only — Firestore overrides at runtime.
3. **Scripture Match colour is green, not pink.** Pink had insufficient contrast against the dark blue background — confirmed by user. Updated CFM `GAME_META` + all CSS variants (`.cyan/.pink/.green/.gold`).
4. **Christ Connection is part of the Why box, not its own card.** Reduces visual noise on the stop modal. Same amber colour, separated by a thin border.
5. **Intro lessons (Seminary 1/3/4/5) don't get games.** They're methodology/overview, not scripture content. Portal shows "Introductory lesson — no game required" instead of game tiles.
6. **Scripture Trail edits are classroom-scoped.** Teacher A's edits don't affect Teacher B. The global `lessonLibrary` stays admin-curated; classroom overrides at `classrooms/{room}/trailLessons/{lessonId}` win at load.
7. **Pipeline generates exactly 7 stops by default.** The 10-position calibration grid is a maximum; `getPositionsForCount(theme, 7)` distributes evenly across all 10 slots. Editor allows adding more (up to 10 fit cleanly; beyond that overlaps).

---

## 🔜 Deferred work

### P1 (worth tackling next)
1. **Scripture Trail Monitor view** — same Monitor/Admin split that Common Ground has. Today Scripture Trail is single-page only; teacher and class watch the same screen. A Monitor view would let the class watch on a TV while the teacher controls from phone.
2. **By Heart progress persistence** — currently nothing saves between sessions. A `passagesLearned` field per-user in Firestore would let teachers see which passages a youth has mastered.
3. **NT trail board calibration in Firestore** — only OT has live-tested calibration data. NT/BOM/DC/Moses/Abraham have saved positions but never had a real game played on them.

### P2
1. **Lesson-type detector AI step in pipeline** — replace hardcoded CFM `type` field with an AI tag step during extraction. Scales to NT 2027 and beyond without manual tagging.
2. **Curriculum picker in teacher profile** — "Primary curriculum: CFM / Seminary / Both". Default-tab and pipeline batch-generate horizon respect it.
3. **Southern hemisphere Seminary support** — current schedule is North-only (Aug→May). Southern needs Jan→Oct. Could be a week-picker UI ("which Seminary week are you on?") instead of date-driven.

### P3
1. **Delete hidden legacy long-form sections in [index.html](index.html)** — `display:none` blocks from before the toolkit revision. Nothing references them.
2. **Mockups folder cleanup** — `mockups/` is still untracked at 198 MB. Add to `.gitignore` or delete.

---

## ⚠️ Known issues to surface

- **Trail pipeline isn't auto-cached for Seminary lessons yet.** It runs on-demand via `triggerScriptureTrailPipeline()` but the cache TTL enforcement isn't wired — same lesson will re-generate every load if nobody pre-fills `lessonLibrary`.
- **By Heart "This Week" tab shows empty** for current Seminary lesson (Intro to NT — `dmPassage: null`). This is correct behaviour but might confuse first-time users. Could add explicit "No DM passage this week" copy.
- **CUSTOM badge polls every 500ms for 10 seconds** after page load to catch the async lesson loader. Slightly wasteful but harmless. Could be replaced with a proper event-driven flag if it gets annoying.

---

## 📋 RE-ENTRY SCRIPT (copy-paste at start of fresh session)

```
Resuming Kindred-Youth work after another long session. Please:

1. Read CHECKPOINT-2026-05-29-pm.md in the project root — the full session
   handoff, 17 commits since the morning checkpoint.
2. Read CLAUDE.md — pay attention to "Next actions" near the bottom.
3. Skim `git log --oneline -20` so you see commits e862904 through 38b8015.
4. Read MEMORY.md to load durable feedback / project context.

The site at kindred-youth.org now has 4 games (Common Ground, Scripture
Match, Scripture Trail, By Heart) and a full Seminary curriculum tab.
Once you've loaded context, tell me:

  - What's live, what's stubbed, what's untested
  - Which P1 you'd pick first
  - Anything in the last 17 commits that looks fragile or worth refactoring
    before more is added on top

Don't start coding until I confirm the slice.
```

---

**Memory snapshot** at session end: `backups/2026-05-29-pm/memory-snapshot/`
**CLAUDE.md backup** at session end: `backups/2026-05-29-pm/CLAUDE.md.bak`
