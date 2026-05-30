---
name: feedback-backup-before-destructive
description: "Always back up original-fidelity source assets to a safe out-of-repo location before any destructive transformation (resize, compress, re-encode)"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: eed29652-e942-436c-b0f7-2eacb8b611e1
---

Before any operation that loses information from source media — image resize, audio compress, video re-encode, asset optimization — back up the originals to a safe out-of-repo location first. Do not assume the user is OK losing original fidelity even when the transform is "obviously" needed for shipping.

**Why:** User explicitly stopped a Pillow resize batch on 2026-05-29 to ask for an originals backup. They were thinking about future re-generation needs (e.g. swapping in a higher-DPI variant later, regenerating from a corrected master, comparing against a future Gemini run). Their concern is reversibility, not paranoia.

**How to apply:**
- Standard backup root for this project: `c:/Users/lewis/Documents/Kindred-asset-originals/{YYYY-MM-DD}-{slug}/` (Windows path, outside the repo so git doesn't pick it up).
- For art assets generated via Gemini (character portraits, board art, scene tiles), always preserve the raw 1024×1024+ source before downsampling for production.
- When the user already has untouched copies somewhere (e.g. `mockups/assets/` mirroring `games/assets/`), still create a deliberate dated backup — `mockups/` is working scratch and might get cleaned up later.
- Apply the same rule before: deleting from `lessonLibrary`, dropping a Firestore collection, force-pushing a branch with art-heavy commits, or running ImageMagick / Pillow / ffmpeg in batch mode against the repo.
- This is one specific case of the broader rule in [[feedback-auto-push]]: solo project, fast iteration is fine, but irreversibility deserves a one-step pause.
