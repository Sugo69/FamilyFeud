---
name: Compliance System
description: Policy-as-code enforcement across the Kindred lesson pipeline — shared module, runtime checks, admin badges, Claude subagents, Church policy sources
type: project
originSessionId: 811a9bec-c1d9-4c38-9523-b139d7c7ad08
---
The Kindred platform has a layered compliance system designed to protect LDS youth (ages 13–16) and the platform's viability for Church use. Added 2026-04-21 in the Opus 4.7 "right this ship" pass.

## Layer 1 — Shared pipeline module
- `api/_lib/pipeline.js` exports `runLessonPipeline({ url, gameType, questionType, apiKey, enableSafetyReview })` returning `{ status, body }`.
- Both `api/lesson-pipeline.js` (Vercel prod) and the Vite dev middleware (`vite.config.js` `/api/lesson-pipeline`) are thin wrappers calling this same module. **Critical:** any pipeline change must live in the shared module — never edit one wrapper alone or dev/prod will drift.

## Layer 2 — Runtime checks (cannot be prompted away)
1. **Source URL allowlist** — only `churchofjesuschrist.org` + `/study/...` prefixes. Anything else → 400.
2. **Output URL allowlist** — `churchofjesuschrist.org`, `media.churchofjesuschrist.org`, `abn.churchofjesuschrist.org`, `speeches.byu.edu`. Other URLs stripped and flagged.
3. **Hard-block keyword regex** scans every generated string: porn/nudity/sexual, rape/abuse, suicide/self-harm, substances (cannabis, marijuana, heroin, cocaine, vape). Matches raise `complianceCheck: "REVIEW: ..."`.
4. **Structural compliance** — required fields per gameType (verse/scene/question for pairs; question/≥4 answers/christConnection for rounds), scripture types require `verseText`.
5. **AI safety review** (gated by `ENABLE_SAFETY_REVIEW` env, default on) — second Claude pass returns `pass | rewrite | block` per item; rewrites apply in place, blocks remove the item.

## Layer 3 — Compliance report
Every pipeline response carries a top-level `complianceReport`:
```
{ version:'v3', policyRefs:['Handbook §13','Handbook §37.8',"Teaching in the Savior's Way"],
  structural:{itemCount,passCount,reviewCount,findings,urlAllowlistViolations,hardBlockHits},
  safety:{enabled,items,blockedCount,rewrittenCount},
  passCount, reviewCount, rewrittenCount, blockedCount,
  overall: 'PASS' | 'PASS_WITH_REWRITES' | 'REVIEW_REQUIRED' }
```

## Layer 4 — Admin UI surface
`admin.html renderComplianceBadge(report)` emits a pill next to each Library game:
- `✓ Compliant` (green) = PASS
- `⚠ Rewritten` (amber) = PASS_WITH_REWRITES
- `⚠ Review required` (pink) = REVIEW_REQUIRED

Tooltip expands to pass/review/rewritten/blocked counts and cited policy refs.

## Layer 5 — Claude Code subagents (outside-runtime rails)
- `.claude/agents/lesson-reviewer.md` — Sonnet; per-item PASS/REWRITE/BLOCK verdict against Handbook §13, §37.8, Teaching in the Savior's Way, FSY. Skills call this before declaring a lesson "classroom-ready."
- `.claude/agents/content-safety.md` — Haiku; narrow, fast gate for substances, sexual content, personal-exposure traps, URL allowlist, trademark literals. Used pre-commit / pre-deploy on any user-facing string.

## Layer 6 — Skill contracts
All three skills (`extract-lesson`, `youth-leader`, `gamemaster`) now have an appended **Compliance Metadata Contract** section requiring:
- `extract-lesson` emits `extractionReport` (scriptureRefCount, verseTextFetched/Failed, urlAllowlistViolations, warnings)
- `youth-leader` + `gamemaster` emit `complianceReport` with structural, christConnectionCoverage, overall
- Each skill must invoke `lesson-reviewer` before signing off

## Governing policy sources (all layers cite these by name)
1. **Handbook §13** — class structure, two-adult rule, no public shaming, mixed-gender sensitivity
2. **Handbook §37.8** — protection of personal information about youth
3. **Teaching in the Savior's Way** — Christ-centered, student-led, teacher <20% talk time
4. **For the Strength of Youth (2022)** — modesty, language, substances, media
5. **Protecting Children and Youth training** — two-adult rule, no private conversations, mandatory reporting

**Why it's layered:** the runtime layer stops bad content even if a future model drifts; the subagent layer catches bad content before it reaches Firestore or a commit; the admin badge layer lets the teacher see at a glance whether to trust an auto-generated lesson. Any one layer failing shouldn't expose a youth to harm.

**How to apply:** when changing the pipeline, edit only `api/_lib/pipeline.js`. When generating new lesson content in a CLI skill, call `lesson-reviewer` afterward. When landing a PR that changes user-facing strings, run `content-safety` across the diff. Never claim content is "classroom-ready" without the overall verdict being PASS or PASS_WITH_REWRITES.
