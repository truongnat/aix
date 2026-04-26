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

### Operating principles

1. **Think Before Coding** — Confirm review scope, repo state, and whether the goal is local audit, merge gate, or tech-refresh narrative. Ask when “review” could mean either deterministic validation or broader editorial judgment.
2. **Simplicity First** — Start with deterministic checks and the smallest targeted audit that answers the user’s question. Do not open every skill if a scoped report is enough.
3. **Surgical Changes** — Review only the requested bundle slice or quality dimension. Do not turn a focused audit into a full-repo rewrite.
4. **Goal-Driven Execution** — Done = findings are evidence-backed, mapped to actionable fixes, and clearly separated from automation limits.
5. **Scripts are facts, not opinions** — `validate-skills`, `audit-skill-structure`, and `analyze-skills` establish the baseline before narrative interpretation starts.
6. **Heuristics need framing** — Low-signal or inferred gaps should be labeled as such, not presented as deterministic failures.
7. **Freshness matters selectively** — Local audit can rely on repo state; external technology claims need official-source refresh when central to the conclusion.
8. **Meta review must stay meta** — This skill evaluates skill quality and bundle process, not domain correctness of React, Postgres, or other stack content by itself.

## Default recommendations by scenario

- **PR review for skills** — Run deterministic gates first, then summarize only actionable content gaps.
- **Quarterly audit** — Combine structure/tool outputs with a small number of high-impact improvement themes.
- **Tech refresh** — Pair with **`web-research-pro`** and separate stale external facts from purely structural gaps.
- **Single-skill audit** — Scope tightly to one bundle slice rather than extrapolating to the whole repo.

## Decision trees

Summary: decide whether the task is structural validation, heuristic quality audit, or tech-refresh review, then use the minimum evidence set that answers it.

Details: [references/decision-tree.md](references/decision-tree.md)

## Anti-patterns

Summary: treating green CLI output as proof of content quality, treating heuristics as hard truth, and expanding a focused audit into full-repo drift.

Details: [references/anti-patterns.md](references/anti-patterns.md)

### Skill bundle audit system model (summary)

How deterministic checks, heuristic reports, and human judgment should fit together in one coherent review process.

Details: [references/skill-bundle-audit-system-model.md](references/skill-bundle-audit-system-model.md)

### Report structure and scripts (summary)

How to combine script outputs into a useful reviewer-facing report instead of just dumping command logs.

Details: [references/report-structure-and-scripts.md](references/report-structure-and-scripts.md)

### Authoring rules cross-check (summary)

How to verify skill changes against repo authoring rules and avoid false confidence from partial compliance.

Details: [references/authoring-rules-crosscheck.md](references/authoring-rules-crosscheck.md)

### Tech refresh and web research (summary)

When local review is enough and when official-source verification is required to assess stale references or framework drift.

Details: [references/tech-refresh-and-web-research.md](references/tech-refresh-and-web-research.md)

## Suggested response format (STRICT)

1. **Context** — Review scope, repo/tool state, and whether external freshness checks are in scope.
2. **Deterministic findings** — Script-backed facts from validation or audits.
3. **Heuristic or editorial findings** — Higher-level quality gaps with clear confidence framing.
4. **Recommended actions** — Prioritized fixes, grouped by leverage.
5. **Verification plan** — Commands or checks to rerun after changes.
6. **Automation limits** — What the scripts do not prove.
7. **Residual risks** — Remaining stale-content or process gaps.

## Resources in this skill

| Topic | File |
|-------|------|
| Skill bundle audit system model | [references/skill-bundle-audit-system-model.md](references/skill-bundle-audit-system-model.md) |
| Report structure and scripts | [references/report-structure-and-scripts.md](references/report-structure-and-scripts.md) |
| Authoring rules cross-check | [references/authoring-rules-crosscheck.md](references/authoring-rules-crosscheck.md) |
| Tech refresh and web research | [references/tech-refresh-and-web-research.md](references/tech-refresh-and-web-research.md) |
| Failure modes and mitigation | [references/failure-modes-detection-mitigation.md](references/failure-modes-detection-mitigation.md) |
| Decision framework and trade-offs | [references/decision-framework-and-trade-offs.md](references/decision-framework-and-trade-offs.md) |
| Decision tree | [references/decision-tree.md](references/decision-tree.md) |
| Anti-patterns | [references/anti-patterns.md](references/anti-patterns.md) |
| Tips and tricks | [references/tips-and-tricks.md](references/tips-and-tricks.md) |
| Edge cases | [references/edge-cases.md](references/edge-cases.md) |
| Quality validation and guardrails | [references/quality-validation-and-guardrails.md](references/quality-validation-and-guardrails.md) |
| Integration map | [references/integration-map.md](references/integration-map.md) |
| Version notes | [references/versions.md](references/versions.md) |

## Quick example

**Input:** "Audit the whole skill bundle before merge."
- Start with deterministic gates and structural audit, then summarize only the highest-leverage content gaps.
- Separate hard failures from heuristic concerns.
- **Verify:** The report cites which commands passed or failed and which findings still require human judgment.

**Input (tricky):** "React skill feels stale, but scripts are green."
- Call out that structural health does not prove technical freshness.
- Pair with **`web-research-pro`** for official-doc refresh before declaring the skill current.
- **Verify:** The resulting report distinguishes repo-structure status from freshness status.

**Input (cross-skill):** "Turn this audit into a tooling backlog."
- Pair **`repo-tooling-pro`** for script/capability gaps and keep **`skills-self-review-pro`** focused on review methodology and prioritization.
- Convert findings into batches with explicit verification steps.
- **Verify:** Each backlog item maps to a concrete gap and a command or review step.

## Checklist before calling the skill done

- [ ] Review scope, repo/tool state, and freshness needs confirmed first (Think Before Coding)
- [ ] Started with the minimum deterministic checks needed for the requested audit (Simplicity First)
- [ ] Only the requested bundle slice or quality dimension was reviewed (Surgical Changes)
- [ ] Findings, actions, and rerun verification steps are explicit (Goal-Driven Execution)
- [ ] Script-backed facts are separated from heuristic/editorial conclusions
- [ ] Automation limits are stated clearly
- [ ] External tech-freshness claims are verified or labeled as unverified
- [ ] Residual process or bundle risks are documented
