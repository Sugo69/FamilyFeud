---
name: Auto-push after commit
description: User wants commits on this solo project pushed to origin automatically — no need to ask before pushing
type: feedback
originSessionId: d1e97936-ee43-43d1-a180-f581679f2a6f
---
After committing on the Kindred-Youth project, push to `origin` automatically without asking for confirmation. Apply to both feature branches and `main`.

**Why**: Solo developer, single-author repo, GitHub is also the only off-machine backup, and Vercel only sees changes after push. The default "confirm before push" round trip just adds friction. The user established this preference on 2026-04-22 after I asked one too many times.

**How to apply**:
- After a successful `git commit`, run `git push origin <current-branch>` in the same flow.
- Still ask before *destructive* pushes: `--force`, `--force-with-lease`, force-push to `main`, deleting remote branches. Auto-push only covers normal forward-progress pushes.
- Still ask before merging branches into `main` or opening PRs — those are different decisions, not just "ship the commit I just made."
- If a commit is intentionally local-only (e.g., experimental WIP, sensitive content under review), the user will say so explicitly; otherwise default to push.
