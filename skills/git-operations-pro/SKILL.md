---
name: git-operations-pro
description: |
  Production-grade Git workflow: conventional commits, branch strategies, merge vs rebase vs squash discipline, PR hygiene, inspection (log, blame, bisect), recovery (revert vs reset) — plus repository/history/ref model (DAG, three trees), failure modes (force-push, leaked secrets, submodule drift, merge-queue conflicts), decision trade-offs (squash vs merge commit, velocity vs safety), quality guardrails (no fabricated SHAs; rotate secrets not only rewrite history).

  Use this skill when the user asks about **commit conventions**, **branch naming**, **feature vs trunk flow**, **resolving conflicts**, **review hygiene**, **git log** interpretation, **revert vs reset**, or **what not to commit**.

  Use **with** **`testing-pro`** for CI gates; **`security-pro`** for secrets and signing; **`deployment-pro`** for tags/releases; **`ci-cd-pro`** for workflow triggers; **`feedback-pro`** for review policy; **`planning-pro`** for release trains. This skill owns **VCS** mechanics; **`code-packaging-pro`** owns workflow **file** authoring when the task is YAML syntax, not merge strategy.

  Triggers: "git", "commit", "conventional commits", "branch", "merge", "rebase", "pull request", "PR", "conflict", "git log", "bisect", "revert", "cherry-pick", "stash", "force push", "trunk", "Git Flow", "CODEOWNERS".

metadata:
  short-description: Git — DAG/refs model, commits, branches, PRs, failure modes, safety
  content-language: en
  domain: version-control
  level: professional
---

# Git operations (professional)

Skill text is **English**; answer in the user’s preferred language when rules or the conversation specify it.

Use official [Git documentation](https://git-scm.com/doc) for flags; this skill encodes **team-safe defaults**, **history literacy**, and **collaboration contracts** — not host-specific UI screenshots.

## Boundary

**`git-operations-pro`** owns **local and collaborative Git** usage (commits, branches, merges, recovery, inspection). **`deployment-pro`** owns **runtime promotion** after artifacts exist. **`ci-cd-pro`** owns **pipeline definition** when the question is workflow structure. **`security-pro`** owns **credential lifecycle** when secrets leak.

## Related skills (this repo)

| Skill | When to combine |
|-------|----------------|
| **`testing-pro`** | CI gates tied to PR events |
| **`security-pro`** | Leaked secrets, signing, scanning |
| **`deployment-pro`** | Tags, releases, changelog → prod |
| **`code-packaging-pro`** | Actions/workflow **syntax** when not merge-strategy |
| **`ci-cd-pro`** | Branch triggers, merge queue, caches |
| **`feedback-pro`** | CODEOWNERS, review templates |
| **`planning-pro`** | Release trains vs branching |
| **`repo-tooling-pro`** | Repo hooks, `validate-skills`, devkit scripts |

## When to use

- Commit messages, branch naming, trunk vs feature flow.
- PR size, description, draft, review hygiene.
- Conflicts, merge/rebase/squash choice per policy.
- Recovery: **revert** on shared branches, **reset** locally.
- Inspection: `log`, `blame`, **bisect**.

## When not to use

- **Kubernetes rollout** or **pipeline** architecture as primary topic — **`deployment-pro`** / **`ci-cd-pro`**.
- **Cryptographic** threat modeling beyond “rotate key” — **`security-pro`**.

## Required inputs

- **Branch protection** and **merge strategy** (squash/merge/rebase) when advising PR workflow.
- **Team policy** on force-push and rebase if recommending history rewrite.

## Expected output

Follow **Suggested response format** strictly — model + policy + risks.

## Workflow

1. Confirm branch protection, merge strategy, and whether history is **shared**.
2. Apply summaries; open `references/`; defer **release infra** to **`deployment-pro`** when scope drifts.
3. Respond with **Suggested response format**; include **failure modes** when rewriting history or secrets.

### Operating principles

1. **Small, reviewable units** — Bisect-friendly — **`repository-history-and-ref-model.md`**.
2. **No secrets in Git** — **`security-pro`**.
3. **Shared history** — Prefer **revert**; **force** only by policy — **`failure-modes-detection-mitigation.md`**.
4. **Obvious branch purpose** — Ticket/`feat-`/`fix-` when team uses them.
5. **Merge/rebase** — Per policy; **`--force-with-lease`** not bare `--force` when allowed — **`decision-tree.md`**.
6. **PR body** — What / why / how to test — **`collaboration-and-safety.md`**.

### Repository, history, and ref model (summary)

DAG, refs, working tree vs index vs HEAD — **`repository-history-and-ref-model.md`**.

Details: [references/repository-history-and-ref-model.md](references/repository-history-and-ref-model.md)

### Failure modes — detection and mitigation (summary)

Force-push, secrets, submodule drift, merge-queue/stacked PR surprises — **`failure-modes-detection-mitigation.md`**.

Details: [references/failure-modes-detection-mitigation.md](references/failure-modes-detection-mitigation.md)

### Decision framework and trade-offs (summary)

Squash vs merge commit vs rebase; merge queue coupling — **`decision-framework-and-trade-offs.md`**.

Details: [references/decision-framework-and-trade-offs.md](references/decision-framework-and-trade-offs.md)

### Quality validation and guardrails (summary)

Placeholders for SHAs; rotate leaked keys — **`quality-validation-and-guardrails.md`**.

Details: [references/quality-validation-and-guardrails.md](references/quality-validation-and-guardrails.md)

### Commits and branching (summary)

Conventional Commits, branching models — **`commits-and-branching.md`**.

Details: [references/commits-and-branching.md](references/commits-and-branching.md)

### Collaboration and safety (summary)

PRs, hooks, CI pointer, secrets — **`collaboration-and-safety.md`**.

Details: [references/collaboration-and-safety.md](references/collaboration-and-safety.md)

### Tips and tricks (summary)

Stash, patch staging, restore — **`tips-and-tricks.md`**.

Details: [references/tips-and-tricks.md](references/tips-and-tricks.md)

### Edge cases (summary)

Force-push policy, LFS, line endings, case rename, merge queue — **`edge-cases.md`**.

Details: [references/edge-cases.md](references/edge-cases.md)

### Decision trees (summary)

Merge vs rebase vs squash, revert vs reset — **`decision-tree.md`**.

Details: [references/decision-tree.md](references/decision-tree.md)

### Anti-patterns (summary)

Force `main`, giant commits — **`anti-patterns.md`**.

Details: [references/anti-patterns.md](references/anti-patterns.md)

### Integration map (summary)

**`ci-cd-pro`**, **`deployment-pro`**, **`security-pro`**, **`feedback-pro`**, **`planning-pro`**, … — **`integration-map.md`**.

Details: [references/integration-map.md](references/integration-map.md)

### Versions (summary)

Git client, host features (merge queue, rulesets), LFS — **`versions.md`**.

Details: [references/versions.md](references/versions.md)

## Suggested response format (STRICT — implement / review)

1. **Context** — Repo policy (protected branches, squash vs merge), solo vs shared branch, host (GitHub/GitLab/…) if relevant.
2. **Problem / goal** — Conflict storm, bad commit on `main`, secret leak, branch strategy.
3. **System design** — Where in DAG/refs/working tree the operation applies — **`repository-history-and-ref-model.md`**.
4. **Decision reasoning** — Merge vs rebase vs squash; revert vs reset — **`decision-framework-and-trade-offs.md`** / **`decision-tree.md`**.
5. **Implementation sketch** — Commands / message template — placeholders for real SHAs — **`quality-validation-and-guardrails.md`**.
6. **Trade-offs** — History readability vs rewrite churn; queue ordering risk.
7. **Failure modes** — What breaks teammates/CI — **`failure-modes-detection-mitigation.md`** themes.
8. **Residual risks** — Forks still have secrets; **`security-pro`** rotation; **`ci-cd-pro`** if triggers change.

## Resources in this skill

| Topic | File |
|-------|------|
| **Repository & ref model** | [references/repository-history-and-ref-model.md](references/repository-history-and-ref-model.md) |
| Failure modes | [references/failure-modes-detection-mitigation.md](references/failure-modes-detection-mitigation.md) |
| Decision framework & trade-offs | [references/decision-framework-and-trade-offs.md](references/decision-framework-and-trade-offs.md) |
| Quality guardrails | [references/quality-validation-and-guardrails.md](references/quality-validation-and-guardrails.md) |
| Commits & branching | [references/commits-and-branching.md](references/commits-and-branching.md) |
| Collaboration & safety | [references/collaboration-and-safety.md](references/collaboration-and-safety.md) |
| Tips | [references/tips-and-tricks.md](references/tips-and-tricks.md) |
| Edge cases | [references/edge-cases.md](references/edge-cases.md) |
| Decision trees | [references/decision-tree.md](references/decision-tree.md) |
| Anti-patterns | [references/anti-patterns.md](references/anti-patterns.md) |
| Integration map | [references/integration-map.md](references/integration-map.md) |
| Versions | [references/versions.md](references/versions.md) |

## Quick examples

### 1 — Simple (common)

**Input:** Merged `main` into feature — 50 conflicts; shortcut?  
**Expected output:** Full **Suggested response format** — abort vs finish; rebase policy; **no** force to `main`; **failure modes** of blind resolution.

### 2 — Tricky (edge case)

**Input:** Remove bad commit already on `origin/main` — no force-push allowed.  
**Expected output:** `git revert` series — **`edge-cases.md`**; why revert beats rewrite for shared history — **`failure-modes-detection-mitigation.md`**.

### 3 — Cross-skill

**Input:** Pushed `.env` with API key.  
**Expected output:** **`git-operations-pro`** remove from tracking / history options — **`security-pro`** **rotate** credential — **`quality-validation-and-guardrails.md`** on rotation vs rewrite alone.

## Checklist before calling the skill done

### Policy & mechanics

- [ ] **Convention** matches team (Conventional vs internal) — **`commits-and-branching.md`**.
- [ ] **Protected** branches and **force** rules respected — **`anti-patterns.md`**.
- [ ] **DAG/refs** reasoning explicit when merge/rebase/revert — **`repository-history-and-ref-model.md`**.

### Safety

- [ ] **Secrets** — No real credentials in examples; rotation path if leak — **`quality-validation-and-guardrails.md`**.
- [ ] **Failure modes** cited when rewriting history or resolving mass conflicts — **`failure-modes-detection-mitigation.md`**.

### Scope

- [ ] **Deployment/runtime** not conflated with Git mechanics — **`deployment-pro`** when ship path dominates.
- [ ] **CI/CD** trigger impact noted when branch/tag strategy changes — **`integration-map.md`**.
