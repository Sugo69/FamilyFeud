---
name: CFM 2027 New Testament transition
description: Next year the Come Follow Me schedule moves from Old Testament to New Testament; cfm-schedule.js will need a full rewrite when the 2027 manual publishes (~November 2026)
type: project
originSessionId: c6bbd0d1-a640-4385-a922-92b05357df8a
---
Come Follow Me 2027 = New Testament (2026 is Old Testament). The 2027 manual typically publishes around November 2026 on churchofjesuschrist.org.

**Why:** `src/lib/cfm-schedule.js` currently hardcodes the 2026 OT Sunday→URL map (`CFM_2026_OT`). The 2027 NT schedule will use a different manual slug, different lesson IDs, and different Gospel Library URL paths. Without an update, the admin ⭐ Fill This Week's Lesson button and `getCurrentCfmLesson()` will break on the first 2027 Sunday.

**Hard deadline:** January 3, 2027 (first Sunday of 2027).

**Manual slug (predicted):** `come-follow-me-for-home-and-church-new-testament-2027`  
(2023 used `come-follow-me-for-individuals-and-families-new-testament-2023`; the naming convention changed to `for-home-and-church` with the 2026 OT manual — 2027 NT will follow the same pattern)

**2023 NT schedule = reference for 2027 content/slugs** (same 4-year cycle; 53 weeks):
Slugs 01–53. Lessons are Gospels (02–27, mostly narrative), Acts (28–32, narrative), Epistles (33–49, doctrinal), Revelation (50–53, mixed), plus Easter (15, mixed) and Christmas (52, mixed).
Full week-by-week title list: https://www.churchofjesuschrist.org/study/manual/come-follow-me-for-individuals-and-families-new-testament-2023?lang=eng

**What can be coded now:**
- All `slug` and `title` fields (identical to 2023)
- All `type` annotations (narrative/doctrinal/mixed — NT canon is fixed)

**What must wait for Nov 2026:**
- `weekStart` / `weekEnd` dates (the Church sets these; Jan 1, 2027 is a Friday so first Sunday = Jan 3)

**How to apply:**
- Stub `CFM_2027_NT` array now with placeholder dates and `// TODO: update dates when 2027 NT manual publishes (~Nov 2026)` comment
- When the 2027 manual drops, fill in exact dates and flip `MANUAL_SLUG`/`MANUAL_BASE` constants
- Update exported helpers (`getCurrentCfmLesson`, `getCfmLessonForDate`, `getNextCfmLesson`, `resolveLessonIdFromUrl`) to pick the right year's array based on current date
- URL allowlist in `api/_lib/pipeline.js` already accepts `/study/manual/` broadly — verify the 2027 NT path still matches
- `getUpcomingCfmLessons` (admin "📅 Generate Next 8 Weeks") should span the year boundary cleanly
- Deterministic doc IDs (`cfm-{manual}-{slug}`) naturally separate 2026 OT from 2027 NT in `lessonLibrary` — no Firestore migration needed
