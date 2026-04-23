---
name: skills-self-review-pro
description: |
  Production-grade skills bundle self-review: audit system model (scripts vs heuristics vs human gate), failure modes (green validate/bad content, stale tech refresh, INDEX drift, scope explosion), decision trade-offs (bundle vs single skill, automation vs edit), quality guardrails (no invented CLI flags; reproducible commands from scripts/README).

  Use this skill when the user wants a **periodic audit** of bundled skills, a **PR checklist** for skill changes, an **automation vs scripts** backlog, or asks to **find gaps** and **suggested improvements** without manually opening every `SKILL.md` — or to **align** stack skills with **current** upstream technology.

  Use **with** **`repo-tooling-pro`** for script flags and CI wiring; **`web-research-pro`** for **internet / official** doc verification; **`git-operations-pro`** when the output becomes a **commit** or **PR** artifact. Persist decisions in **`knowledge-base/documents/`** per **`.cursor/rules/documentation-persistence.mdc`**. This skill (`skills-self-review-pro`) owns **review methodology and report shape**; scripts own **deterministic checks**.

  Triggers: "skill self review", "audit skills", "gap report", "improve bundled skills", "analyze_skills", "validate_skills inventory", "authoring checklist", "skill quality", "SKILL.md review", "tech refresh skills", "update skills for new React", "official docs check", "tier rubric", "with-references", "only-actionable", "build-skill-index", "false positive tier".

metadata:
  short-description: Skills self-review — audit model, failure modes, scripts, tech refresh
  content-language: en
  domain: meta-tooling
  level: professional
---

# Skills self-review (professional)

Skill text is **English**; answer in the user’s preferred language when rules or the conversation specify it.

Use **`node dist/tools.js analyze-skills`**, **`validate-skills`**, and **`list-skills`** from **repo root** (see [`scripts/README.md`](../../scripts/README.md)); this skill encodes **how** to combine outputs into an **actionable** improvement narrative — not a substitute for reading **`SKILL_AUTHORING_RULES.md`**. Confirm **cwd** is repo root and **`npm install`** / **`npm run build`** have been run so **`dist/tools.js`** exists.

## Boundary

**`skills-self-review-pro`** = **meta** review of the skill bundle and authoring quality. Domain **`react-pro`** etc. = **product** stack guidance. **`repo-tooling-pro`** = exact CLI semantics and KB tooling.

## Related skills (this repo)

| Skill | When to combine with `skills-self-review-pro` |
|-------|-----------------------------------------------|
| **`repo-tooling-pro`** | Exact CLI flags, **`query_kb`**, KB rebuild after doc edits |
| **`web-research-pro`** | **Official** docs, changelogs, **404** handling — **not** local `analyze_skills` output alone |
| **`git-operations-pro`** | Attach report to **PR**, **conventional** commit for tooling changes |
| **`business-analysis-pro`** | Rare — only if review outputs must become **formal** backlog items |

## When to use

- **Before merge** of large skill additions — run **`validate-skills`** + **`analyze-skills --markdown`**.
- **Quarterly** or **milestone** hygiene — generate gap list for maintainers.
- **Onboarding** — explain how bundled skills are **checked** in this repo.
- **Tech refresh** — pair script audit with **`web-research-pro`** + official docs for stacks you maintain.

## When not to use

- **Rewriting application product code** — out of scope.
- **Replacing** `validate-skills` with subjective judgment — scripts are mandatory gates.

## Required inputs

- **Repo root** confirmation and whether **`dist/tools.js`** exists.
- **Scope**: whole bundle vs named skills.

## Expected output

Follow **Suggested response format (STRICT)** — eight sections including automation limits.

## Workflow

1. Confirm **repo root**, availability of **`dist/tools.js`**, whether **`--with-references`** / **`--only-actionable`** apply, and whether the user wants **upstream doc** research (**`web-research-pro`**).
2. Apply the principles and topic summaries below; open `references/` when you need depth; run **`node dist/tools.js analyze-skills --self-review`** for a **complete** repo report; **persist** notable outcomes under **`knowledge-base/documents/`** (see **`.cursor/rules/documentation-persistence.mdc`**).
3. Respond using **Suggested response format (STRICT)**; note **heuristic** limits, **manual** checks, and **doc** updates needed for **INDEX** / **`build-kb`**.

### Operating principles

1. **Scripts first** — Deterministic checks (`validate-skills`) before subjective critique.
2. **Separate concerns** — **Automation/script** gaps (`analyze-skills`) vs **structure** (`SKILL_AUTHORING_RULES.md`) vs **content quality** (human).
3. **Actionable backlog** — Each gap: **owner**, **suggested fix** (link script, add workflow, edit `references/`).
4. **No scope creep** — Review does not **rewrite** unrelated skills in one pass unless user asked.
5. **Reproducible** — Save **`--markdown`** output next to PR or in **`knowledge-base/documents/`** if the team wants history (update **`INDEX.md`**); append **decisions** to **`documents/repo/activity-log.md`** when appropriate.
6. **Honest limits** — Heuristics miss **neutral** wording and **duplicate** conceptual scope; **Related skills** tables need human read.

### Skill bundle audit (system model) (summary)

Deterministic vs heuristic vs human vs persistence — **`skill-bundle-audit-system-model.md`**.

Details: [references/skill-bundle-audit-system-model.md](references/skill-bundle-audit-system-model.md)

### Failure modes — detection and mitigation (summary)

Green validate/bad content, stale refresh, INDEX drift, scope explosion — **`failure-modes-detection-mitigation.md`**.

Details: [references/failure-modes-detection-mitigation.md](references/failure-modes-detection-mitigation.md)

### Decision framework and trade-offs (summary)

Full bundle vs single skill; automation vs immediate edit — **`decision-framework-and-trade-offs.md`**.

Details: [references/decision-framework-and-trade-offs.md](references/decision-framework-and-trade-offs.md)

### Quality validation and guardrails (summary)

No invented flags; reproducible commands — **`quality-validation-and-guardrails.md`**.

Details: [references/quality-validation-and-guardrails.md](references/quality-validation-and-guardrails.md)

### Tech refresh and web research (summary)

After local **`analyze-skills`**, use **`web-research-pro`** for **stack** updates; log in **`activity-log.md`**.

Details: [references/tech-refresh-and-web-research.md](references/tech-refresh-and-web-research.md)

### Report structure and script gaps (summary)

**Tiers**, **`--markdown`**, interpretation — **`analyze_skills`**.

Details: [references/report-structure-and-scripts.md](references/report-structure-and-scripts.md)

### Authoring rules cross-check (summary)

**`validate-skills`**, **`list-skills`**, **`SKILL_AUTHORING_RULES.md`** §2–§8 checklist.

Details: [references/authoring-rules-crosscheck.md](references/authoring-rules-crosscheck.md)

### Tips and tricks (summary)

PR attachment, KB verify, golden **low-tier** skills.

Details: [references/tips-and-tricks.md](references/tips-and-tricks.md)

### Edge cases (summary)

False positives/negatives, template include, private forks.

Details: [references/edge-cases.md](references/edge-cases.md)

### Decision flow and anti-patterns (summary)

PR vs quarterly audit; skipping validate; INDEX drift.

Details: [references/decision-tree.md](references/decision-tree.md) · [references/anti-patterns.md](references/anti-patterns.md)

### Cross-skill handoffs (summary)

**`repo-tooling-pro`**, **`web-research-pro`**, **`git-operations-pro`**.

Details: [references/integration-map.md](references/integration-map.md)

### Versions (summary)

`dist/tools.js` rebuild, Node alignment, upstream stack majors in logs.

Details: [references/versions.md](references/versions.md)

## Suggested response format (STRICT — implement / review)

1. **Context** — Repo root, scope (bundle vs skills), deadline, flags used.
2. **Problem / goal** — PR hygiene, quarterly audit, or tech refresh target stacks.
3. **System design** — Script vs heuristic vs human responsibilities — **`skill-bundle-audit-system-model.md`**.
4. **Decision reasoning** — What to run next (`validate-skills` → `analyze-skills` → manual) — **`decision-framework-and-trade-offs.md`** / **`decision-tree.md`**.
5. **Implementation sketch** — Command lines and artifact paths — **Code** (must match **`scripts/README.md`**).
6. **Trade-offs** — Full bundle time cost vs depth per skill.
7. **Failure modes** — Heuristic blind spots, INDEX drift — **`failure-modes-detection-mitigation.md`** themes.
8. **Residual risks** — Manual checklist items; **`build-skill-index`** / **`build-kb`** follow-ups.

## Resources in this skill

| Topic | File |
|-------|------|
| **Bundle audit model** | [references/skill-bundle-audit-system-model.md](references/skill-bundle-audit-system-model.md) |
| Failure modes | [references/failure-modes-detection-mitigation.md](references/failure-modes-detection-mitigation.md) |
| Decision framework & trade-offs | [references/decision-framework-and-trade-offs.md](references/decision-framework-and-trade-offs.md) |
| Quality guardrails | [references/quality-validation-and-guardrails.md](references/quality-validation-and-guardrails.md) |
| `analyze_skills` report | [references/report-structure-and-scripts.md](references/report-structure-and-scripts.md) |
| Authoring cross-check | [references/authoring-rules-crosscheck.md](references/authoring-rules-crosscheck.md) |
| Tech refresh & web research | [references/tech-refresh-and-web-research.md](references/tech-refresh-and-web-research.md) |
| Tips | [references/tips-and-tricks.md](references/tips-and-tricks.md) |
| Edge cases | [references/edge-cases.md](references/edge-cases.md) |
| Decision tree | [references/decision-tree.md](references/decision-tree.md) |
| Anti-patterns | [references/anti-patterns.md](references/anti-patterns.md) |
| Integration map | [references/integration-map.md](references/integration-map.md) |
| Versions | [references/versions.md](references/versions.md) |
| **Script index** | [`scripts/README.md`](../../scripts/README.md) |

## Quick examples

**Input (simple):** “Give me a gap report before we tag v2.”  
**Expected output:** Full **Suggested response format (STRICT)** — `validate-skills` outcome; `analyze-skills --self-review`; actionable tier; manual §2 checks.

**Input (tricky):** “Tier says we’re fine — merge.”  
**Expected output:** Human pass on triggers/Related skills; heuristics miss nuance; never override failing **`validate-skills`**.

**Input (cross-skill):** “Refresh Next.js skill from official docs and log it.”  
**Expected output:** **`web-research-pro`** + this skill’s report shape + persistence under **`knowledge-base/documents/`**.

## Checklist before calling the skill done

- [ ] **`node dist/tools.js validate-skills`** outcome stated (pass / fail with paths).
- [ ] **`node dist/tools.js analyze-skills`** run with **documented** flags; **Markdown** or summary provided.
- [ ] **Authoring** checklist invoked for **structural** gaps, not only automation tiers.
- [ ] **Limits** of automation stated (**false positives** / **neutral** wording).
- [ ] If **tech refresh** was in scope: **`web-research-pro`** (or **Context7**) used for **official** sources; **activity-log** or **INDEX** updated when saving decisions.
- [ ] **`build-skill-index`** / **`build-kb`** follow-ups noted when content or KB docs changed.
- [ ] **Scope** respected — no unsolicited rewrite of untouched skills unless requested.
