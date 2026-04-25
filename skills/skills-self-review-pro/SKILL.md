---
name: skills-self-review-pro
description: |
  Production-grade skills bundle self-review: audit system model (scripts vs heuristics vs human gate), failure modes (green validate/bad content, stale tech refresh, INDEX drift, scope explosion), decision trade-offs (bundle vs single skill, automation vs edit), quality guardrails (no invented CLI flags; reproducible commands from scripts/README).

  Use this skill when the user wants a **periodic audit** of bundled skills, a **PR checklist** for skill changes, an **automation vs scripts** backlog, or asks to **find gaps** and **suggested improvements** without manually opening every `SKILL.md` — or to **align** stack skills with **current** upstream technology.

  Use **with** **`repo-tooling-pro`** for script flags and CI wiring; **`web-research-pro`** for **internet / official** doc verification; **`git-operations-pro`** when the output becomes a **commit** or **PR** artifact. Persist decisions in **`knowledge-base/documents/`** per [`policies/documentation-persistence.md`](/knowledge-base/documents/policies/documentation-persistence.md). This skill (`skills-self-review-pro`) owns **review methodology and report shape**; scripts own **deterministic checks**.

  Triggers: "skill self review", "audit skills", "gap report", "improve bundled skills", "analyze_skills", "validate_skills inventory", "authoring checklist", "skill quality", "SKILL.md review", "tech refresh skills", "update skills for new React", "official docs check", "tier rubric", "with-references", "only-actionable", "build-skill-index", "false positive tier".

metadata:
  short-description: Skills self-review — audit model, failure modes, scripts, tech refresh
  content-language: en
  domain: meta-tooling
  level: professional
---

# Skills self-review (professional)

Skill text is **English**; answer in the user’s preferred language when rules or the conversation specify it.

Use **`node dist/tools.js analyze-skills`**, **`validate-skills`**, and **`list-skills`** from **repo root** (see [`scripts/README.md`](/scripts/README.md)); this skill encodes **how** to combine outputs into an **actionable** improvement narrative — not a substitute for reading **`SKILL_AUTHORING_RULES.md`**. Confirm **cwd** is repo root and **`npm install`** / **`npm run build`** have been run so **`dist/tools.js`** exists.

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

Apply **Karpathy principles** throughout: Think Before Coding, Simplicity First, Surgical Changes, Goal-Driven Execution.

1. **Confirm** **repo root**, availability of **`dist/tools.js`**, whether **`--with-references`** / **`--only-actionable`** apply, and whether the user wants **upstream doc** research (**`web-research-pro`**). → verify: [context documented].
2. **State assumptions** about requirements, constraints (**Think Before Coding**).
3. **Apply** minimum solution first; escalate only when justified (**Simplicity First**).
4. **Make surgical changes** — only touch code directly related to the request (**Surgical Changes**).
5. **Define success criteria**; loop until verified (**Goal-Driven Execution**).
6. **Respond** using **Suggested response format**; note main risks.