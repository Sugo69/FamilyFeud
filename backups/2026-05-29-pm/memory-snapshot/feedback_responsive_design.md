---
name: feedback-responsive-design
description: Build every Kindred surface to flex across phone → tablet → HD → 4K classroom display; avoid fixed pixel columns and rigid grids
metadata: 
  node_type: memory
  type: feedback
  originSessionId: eed29652-e942-436c-b0f7-2eacb8b611e1
---

Every screen in Kindred must adapt across a wide range of resolutions — teacher phones, iPads, classroom HD TVs, and 4K monitors all run the same app.

**Why:** The platform already ships with a Mobile/Tablet/HD/4K display-scale gear menu (see [[tech-decisions]]), and a single Sunday classroom may use a teacher phone + projector at the same time. A layout that only looks right at one width is broken in practice.

**How to apply:**
- Prefer `grid-template-columns: repeat(auto-fill, minmax(MIN, 1fr))` over fixed `repeat(N, 1fr)` when the column count should flex.
- Prefer `clamp()` for font sizes and gap/padding that should scale gently with viewport.
- Avoid fixed `width: 980px` on containers — use `min(95vw, 980px)` so they shrink gracefully.
- Scroll is a legitimate tool, not a failure — when content genuinely exceeds the viewport (e.g. 24-tile character picker plus form on a laptop), enabling scroll is correct. The wrong move is *global* `overflow: hidden` that hides keys CTAs below the fold.
- Scope overflow per surface: full-screen game views (Common Ground board, Scripture Trail board) should stay contained; setup/form/library screens should allow vertical scroll.
- For SVGs that anchor game state (trail board, scoreboard), keep `preserveAspectRatio="xMidYMid meet"` so they letterbox rather than crop.
- Mentally test every layout at three widths: ~400px (phone portrait), ~1024px (iPad / projector), ~2560px (4K classroom display) — and at least one *short* viewport (~700px tall laptop).
