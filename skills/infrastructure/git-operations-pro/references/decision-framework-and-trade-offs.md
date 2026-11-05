# Decision framework and trade-offs

## History shape

| Strategy | Upside | Downside |
|----------|--------|----------|
| **Squash merge** | Linear `main`, one unit per PR | Loses intra-PR commit story |
| **Merge commit** | Preserves branch topology | Busier graph |
| **Rebase + fast-forward** | Linear, readable | Rewrite churn on shared branches — **`decision-tree.md`** |

**Pick one default** per repo; document exceptions (e.g. release branches).

## Velocity vs safety

| Pressure | Risk | Mitigation |
|----------|------|------------|
| Hotfix | Skip review | Pair / post-merge audit; still no secrets — **`collaboration-and-safety.md`** |
| Long-lived branch | Merge hell | Trunk bias; small PRs — **`commits-and-branching.md`** |

## Local ergonomics vs team policy

- **Interactive rebase** cleans history **before** merge — only if branch isn’t collaborative without coordination — **`decision-tree.md`**.
- **`git pull --rebase`** default — aligns with linear preference; verify team agreement.

## Automation coupling

| Integration | Concern |
|-------------|---------|
| **Merge queue** | Order of merges changes conflict surface — communicate with **`ci-cd-pro`**. |
| **Tags → deploy** | Wrong tag moves wrong artifact — **`deployment-pro`**. |
