---
name: API budget tolerance for investigations
description: User accepts small Anthropic/Vercel spend on testing, verification, and coding investigations — don't be overly cautious
type: feedback
originSessionId: d1e97936-ee43-43d1-a180-f581679f2a6f
---
User explicitly OK with small API spend (~$0.05 range) on testing, verification curls, and coding investigations.

**Why:** Said verbatim "Totally fine to burn 5 cents :). Feel free to use usage for good coding investigations." after I flagged that test curls hit live Claude calls during the Origin gate verification.

**How to apply:** Don't refuse to run live API calls when verifying behavior, and don't pad responses with apologies for sub-dollar usage. Still flag the cost transparently after the fact (so they can object if pattern accumulates), and still avoid wasteful runaway loops or repeated calls when one would do. Cap is rough order: <$1/task is unremarkable, $1–5 worth a one-line heads-up, >$5 ask first.
