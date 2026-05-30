---
name: Backlog & Features
description: 6 seeded backlog items, AI guide generation workflow, Firestore guide persistence
type: project
originSessionId: 087b6ec5-f180-4eeb-89f2-405c2f0beabd
---
## Backlog Items (BL-001 to BL-006)
All stored in Firestore `backlogItems` collection. Confirmed seeded 2026-04-19.

| ID | Priority | Batch | Summary |
|---|---|---|---|
| BL-001 | P0 | BATCH-1 | No-Code Content Editor — Teacher's Portal (URL → AI → questions) |
| BL-002 | P1 | BATCH-2 | Distributed Wireless Buzzers — Phone-as-Buzzer Player Mode |
| BL-003 | P1 | BATCH-1 | Active Cinematic Transitions between rounds |
| BL-004 | P2 | BATCH-2 | Audience Participation Poll via QR code |
| BL-005 | P2 | BATCH-3 | Session Memory & Season Standings / Leaderboard |
| BL-006 | P1 | BATCH-2 | Scripture Display & Hybrid Game Mode (Memory Game integration) |

## AI Story Generator Workflow
1. Click **🤖 Story** on any item OR **Generate Stories** in filter bar (batch mode)
2. Modal opens pre-loaded with item(s) — Claude generates user stories, impl plan, test cases, validation checklist, Claude Code prompt
3. Output auto-saved to Firestore `blGuides/{blDocId}` immediately
4. Green **📄 Guide** badge replaces 🤖 Story button — opens saved guide instantly (no API call)
5. Download as `{BL-ID}-implementation-guide.md` or copy to clipboard
6. BL-001 implementation guide already generated and downloaded (2026-04-19)

## Batch Groupings
- **BATCH-1**: Core platform (BL-001 Content Editor, BL-003 Transitions) — "most immediate/magical"
- **BATCH-2**: Multiplayer & engagement (BL-002 Buzzers, BL-004 Poll, BL-006 Scripture)
- **BATCH-3**: Long-term / season memory (BL-005 Standings)

**Why:** Batch IDs group items for user story writing and sprint planning. One batch ID can span multiple BL items.
