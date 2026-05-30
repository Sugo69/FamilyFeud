---
name: Lesson pipeline model strategy
description: Current model choices for extraction/generation/safety + planned Opus-as-gold-standard test to derive Sonnet guardrails
type: project
originSessionId: 375ec571-744a-4871-8fc2-031953ab7a1e
---
**Current state (2026-04-21):** lesson-pipeline v3 uses `claude-sonnet-4-6` for all three Claude calls (extraction, generation, safety review). Extraction takes ~75s on complex lessons (25+ scripture refs); server timeout is 180s per call, client timeout 300s total.

**Rejected:** Haiku 4.5 for extraction. Tried it, it was 3× faster but hallucinated cross-manual content — pulled Helaman 5:12 and Exodus 14 into a Leviticus/Tabernacle lesson. Not viable without guardrails.

**Planned experiment (user greenlit, not yet run):** run Opus 4.6 against 2–3 complex lessons as a "gold standard," diff Opus output vs. Sonnet output to identify where Sonnet drifts. Derived guardrails become prompt additions for Sonnet (and eventually Haiku): strict HTML-grounded scripture refs, cross-manual blocklist, tabular verification steps.

**Why:** user is paying for Sonnet-level quality now but wants a path to cheaper/faster without regressing accuracy. Opus tells us *what to enforce*, not *what to run in prod*.

**How to apply:** when user says "let's run the Opus test" — pick the 3 lessons, run pipeline with model swapped to `claude-opus-4-6`, save extraction+generation outputs for side-by-side diff. Do NOT deploy Opus to prod — it's a diagnostic tool only.
