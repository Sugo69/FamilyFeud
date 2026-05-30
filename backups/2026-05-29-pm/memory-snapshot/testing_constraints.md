---
name: Testing constraints — single Gmail account
description: User has only one Google account (lewiswf@gmail.com) — cannot test multi-user flows by signing in as a second teacher
type: user
originSessionId: 375ec571-744a-4871-8fc2-031953ab7a1e
---
User has only one Gmail account: **lewiswf@gmail.com** (also the admin email).

**How to apply:**
- Do NOT propose test steps that say "sign in as a second teacher" or "use a different Google account" — they cannot do that.
- For multi-teacher flows (pending approval, co-teacher invite, join-classroom, leave-classroom), suggest one of these instead:
  1. **Admin toggle trick** — temporarily set `ADMIN_EMAIL = '__admin_disabled__'` in `admin.html` + `index.html` so their one account routes through the teacher path; restore after test.
  2. **Direct Firestore edits** — open Firebase console and hand-edit a pendingTeachers or classrooms doc to simulate the counterparty.
  3. **Manual doc creation** — add a fake second teacher via the admin Teachers tab (no auth required on that path) to test the classroom cards / co-teacher chips UI.
- When the admin-toggle trick is used, always remind them to revert `ADMIN_EMAIL` back to `'lewiswf@gmail.com'` at the end.
- Confirmed during OPUS-033 / signup wizard testing on 2026-04-21.
