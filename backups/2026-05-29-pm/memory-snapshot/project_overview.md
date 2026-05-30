---
name: Project Overview
description: Kindred youth game platform — portal + two games, Firebase sync, backlog + AI story generator
type: project
originSessionId: b20eb376-7e49-4ea8-962f-4a6a1629e832
---
**Kindred** ("Youth Learning Together") — interactive game platform for LDS Sunday School youth, ages 14–16. Multi-page Vite app. Firestore appId kept as `exodus-feud-final-v10` to preserve all existing data.

**Four pages:**
- `index.html` — Kindred portal hub: Google Sign-In gate, classroom picker, game catalog with `?room=` links, display scale gear menu
- `admin.html` — Google-authenticated admin portal (`lewiswf@gmail.com`): Overview / Teachers / Classrooms / **Library** / Backlog tabs
- `games/common-ground.html` — **Common Ground** (survey/Family Feud game; classroom-scoped via `?room=` param)
- `games/memory.html` — **Scripture Match** (memory matching pairs, React 18 + Babel CDN; classroom-scoped)

**Each game has:** Monitor View (TV display) · Admin View (phone controller) · Teacher Portal (📚 Library + lesson URL pipeline + manual editor)

**Classroom isolation:** `?room={classroomId}` URL param gates both games to a classroom-scoped Firestore path. Admin (`lewiswf@gmail.com`) bypasses classroom picker. Teachers must be assigned to a classroom in admin.

**Lesson Library:** Admin pre-generates content (Common Ground rounds + Scripture Match pairs) in the Library tab. Teachers load instantly with no API call via 📚 Library button in Teacher Portal.

**Game state** stored in Firestore at `artifacts/exodus-feud-final-v10/public/data/` — classroom-scoped under `classrooms/{id}/` when `?room=` is present.

**Backlog system** (Firestore `backlogItems` collection) — lives in `admin.html` (Backlog tab):
- 6 seeded items BL-001 through BL-006, priorities P0–P2, across BATCH-1/2/3
- Inline edit, filter by priority/batch, delete
- AI Story Generator: per-item (🤖 Story) or per-batch (Generate Stories)
- Guides auto-saved to Firestore `blGuides/{blDocId}` → green 📄 Guide badge appears

**Display scale:** 4 presets (Mobile 0.55 / Tablet 0.75 / HD 1.0 / 4K 1.3) stored in `localStorage.kindred_display_scale` — both games read this on mount; set via gear (⚙) dropdown on portal and Scripture Match portal header.

**Why:** Engaging weekly class activity. Platform vision: any teacher can run any lesson as a game without touching code.

**How to apply:** `index.html` is the portal, NOT the game. Games are in `games/`. Back nav on both games links `../index.html`. Keep Firestore appId as `exodus-feud-final-v10`.
