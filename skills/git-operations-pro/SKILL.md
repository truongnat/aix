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

Apply **Karpathy principles** throughout: Think Before Coding, Simplicity First, Surgical Changes, Goal-Driven Execution.

1. **Confirm** branch protection, merge strategy, and whether history is **shared**. → verify: [context documented].
2. **State assumptions** about requirements, constraints (**Think Before Coding**).
3. **Apply** minimum solution first; escalate only when justified (**Simplicity First**).
4. **Make surgical changes** — only touch code directly related to the request (**Surgical Changes**).
5. **Define success criteria**; loop until verified (**Goal-Driven Execution**).
6. **Respond** using **Suggested response format**; note main risks.