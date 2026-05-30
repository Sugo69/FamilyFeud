---
name: Classroom Isolation & Lesson Library
description: Multi-teacher classroom scoping via ?room= param + admin Lesson Library tab for pre-generated content
type: project
originSessionId: 21cf5b35-fd26-4eba-aa20-f5bce9ad0d35
---
## Classroom Isolation

Teachers sign in via Google on `index.html`. Admin (`lewiswf@gmail.com`) bypasses picker and enters with `room=null`. Other teachers are matched to classrooms by `teacherEmail` in Firestore.

Game links append `?room={classroomId}`. Both games read this param at startup:
- `classroomId = new URLSearchParams(location.search).get('room')`
- `basePath = classroomId ? \`artifacts/${appId}/public/data/classrooms/${classroomId}\` : \`artifacts/${appId}/public/data\``
- `globalBasePath = \`artifacts/${appId}/public/data\`` (always global — for library reads)

Monitor view has no `?room=` and falls back to global path — no auth required for Monitor.

`sessionStorage` keys: `kindred_classroom_id`, `kindred_classroom_name` — cleared on sign-out.

**Why:** Multiple teachers can run simultaneous sessions without colliding on Firestore state.

## Lesson Library

Admin pre-generates lessons in the Library tab of `admin.html` (5th tab). Stored in `lessonLibrary/{lessonId}` in the **global** path (not classroom-scoped — all classrooms share the library).

Library entry schema:
```
{ name, url, lessonId, createdAt,
  commonGround: { topic, rounds[], sourceUrl, generatedAt, videoLinks[], talkLinks[], complianceReport },
  memory:       { topic, pairs[], sourceUrl, generatedAt, videoLinks[], talkLinks[], complianceReport } }
```

**Doc IDs are deterministic** — `addLibraryEntry()` calls `resolveLessonIdFromUrl(url)` from `src/lib/cfm-schedule.js` and writes via `setDoc` with id `cfm-{manual}-{slug}` (e.g. `cfm-come-follow-me-for-home-and-church-old-testament-2026-20`). Duplicate adds are blocked with a user-facing message. Old random-ID entries from before 2026-04-21 still exist — don't collide but are not dedupable against new deterministic ones.

**"⭐ Fill This Week's Lesson" button** in the Add Entry row reads `getCurrentCfmLesson()` (from the same module) and prefills name + URL for the current 2026 OT Sunday.

**Compliance badge** on each library card reads `entry.commonGround.complianceReport.overall` / `entry.memory.complianceReport.overall`: `✓ Compliant` (green) / `⚠ Rewritten` (amber) / `⚠ Review required` (pink).

Teachers access it via 📚 Library (amber) button in Teacher Portal of either game. Loads instantly with no API call.

**Common Ground**: `tp-lessonlibrary-view` dedicated HTML sub-view; `loadLessonLibrary()` + `window.loadFromLibrary(lessonId)`.

**Scripture Match**: `portalView === 'library'` React state; `useEffect` with `cancelled` flag prevents stale setState on navigation; `loadFromLibrary` clears `retryTimerRef` then navigates to `portalView='home'` on success.

**How to apply:** `lessonLibrary` must always be read/written from `globalBasePath`, never `basePath`. Admin generates content; teachers consume it.
