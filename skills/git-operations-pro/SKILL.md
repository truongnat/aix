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

### Operating principles

1. **Think Before Coding** — Confirm whether history is shared, what protections exist, and what the team policy is before suggesting Git operations. Ask before recommending history rewrite on collaborative branches.
2. **Simplicity First** — Use the least destructive Git operation that solves the problem. Prefer revert over reset on shared history unless there is a clear exception.
3. **Surgical Changes** — Change only the refs, commits, or branch flow directly involved. Do not “clean up” unrelated history or workflow.
4. **Goal-Driven Execution** — Done = the repository state is corrected safely and collaborators can understand the resulting history.
5. **History is a collaboration contract** — Readability and recoverability often matter more than aesthetic commit graphs.
6. **Recovery should preserve safety** — Fixing a mistake should minimize teammate disruption and data loss risk.
7. **Inspection precedes intervention** — Use log, diff, and branch state to understand the graph before moving it.
8. **Secrets are operational incidents** — Rewriting history alone is not enough when credentials leaked; rotation and follow-up are required.

## Default recommendations by scenario

- **Shared branch mistake** — Prefer revert or follow documented merge-queue policy.
- **Local cleanup** — Use reset/rebase only while history is still private.
- **Conflict-heavy branch** — Clarify merge vs rebase strategy before touching history.
- **Release tagging** — Keep tag intent and release relationship explicit rather than inferred from branch names.

## Decision trees

Summary: choose merge, rebase, squash, revert, or reset based on branch sharing, policy, and recovery risk.

Details: [references/decision-tree.md](references/decision-tree.md)

## Anti-patterns

Summary: force-pushing shared branches casually, rebasing after review without notice, and treating leaked secrets as a pure Git cleanup issue.

Details: [references/anti-patterns.md](references/anti-patterns.md)

### Repository history and ref model (summary)

How the DAG, refs, index, and working tree interact so Git actions are reasoned about safely.

Details: [references/repository-history-and-ref-model.md](references/repository-history-and-ref-model.md)

### Commits and branching (summary)

How branch strategy, commit shape, and naming conventions affect collaboration and release flow.

Details: [references/commits-and-branching.md](references/commits-and-branching.md)

### Collaboration and safety (summary)

How PR hygiene, force-push rules, review flow, and recovery practices should work on team repos.

Details: [references/collaboration-and-safety.md](references/collaboration-and-safety.md)

### Failure modes and mitigation (summary)

Merge queue drift, history rewrite mistakes, leaked secrets, submodule confusion, and graph misunderstandings to catch early.

Details: [references/failure-modes-detection-mitigation.md](references/failure-modes-detection-mitigation.md)

### Versions (summary)

Version notes that affect Git behavior, host integrations, and recommended workflow assumptions.

Details: [references/versions.md](references/versions.md)

## Suggested response format

1. **Context** — Branch state, sharing/protection model, team policy, and the operation goal.
2. **Git model** — Explain the relevant history/ref behavior behind the recommendation.
3. **Recommendation** — Minimum safe Git operation or workflow change with rationale.
4. **Verification** — How to confirm the branch/history state is correct after the operation.
5. **Residual risks** — Remaining collaborator, secret, or release-flow caveats.

## Resources in this skill

| Topic | File |
|-------|------|
| Repository history and ref model | [references/repository-history-and-ref-model.md](references/repository-history-and-ref-model.md) |
| Commits and branching | [references/commits-and-branching.md](references/commits-and-branching.md) |
| Collaboration and safety | [references/collaboration-and-safety.md](references/collaboration-and-safety.md) |
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

**Input:** "I merged a bad PR into main. What should I do?"
- Prefer revert on the shared branch instead of resetting published history.
- Keep the recovery path understandable to the rest of the team.
- **Verify:** Main now points to a safe state and the revert is visible in history.

**Input (tricky):** "I accidentally committed a secret and already pushed."
- Explain that history cleanup alone is insufficient; secret rotation is mandatory.
- Choose rewrite only if policy and blast radius justify it, and state the coordination cost.
- **Verify:** The secret is rotated and the repo/remotes no longer expose the old credential path where possible.

**Input (cross-skill):** "We need a branch and tag strategy for release trains."
- Pair **`planning-pro`** or **`deployment-pro`** for train cadence, while **`git-operations-pro`** owns the VCS mechanics.
- Keep release workflow and Git graph responsibilities distinct.
- **Verify:** The branch/tag policy maps cleanly to how releases are reviewed and shipped.

## Checklist before calling the skill done

- [ ] Branch sharing, protection, and team policy confirmed first (Think Before Coding)
- [ ] Minimum safe Git operation chosen; no unnecessary history surgery (Simplicity First)
- [ ] Only the relevant refs/history path was changed (Surgical Changes)
- [ ] Success criteria and post-operation verification are explicit (Goal-Driven Execution)
- [ ] The recommendation preserves collaborator safety
- [ ] Inspection steps precede destructive operations
- [ ] Secret incidents include rotation or security follow-up where relevant
- [ ] Residual release or collaboration risks are documented
