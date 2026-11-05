# Repository, history, and ref model

## Directed acyclic graph (DAG)

Commits point to **parent(s)**; branches and tags are **movable pointers** into this graph — **`commits-and-branching.md`**.

```text
main ──●──●──●── HEAD
          \
feature ──●──●
```

**Reachability** — `git log main..feature` shows commits on `feature` not ancestors of `main`.

## Three trees (mental model)

| Tree | Holds |
|------|--------|
| **Working tree** | Files you edit |
| **Index (staging)** | Next commit snapshot |
| **HEAD commit** | Last commit on current branch (or detached SHA) |

**Why it matters:** `git restore`, `git reset`, and merge/rebase manipulate these layers differently — **`tips-and-tricks.md`**.

## Refs

| Ref | Role |
|-----|------|
| **branch** | Moves with new commits |
| **tag** | Usually immutable release marker — pair with **`deployment-pro`** |
| **HEAD** | Current checkout; detached when not on a branch |

## Shared vs local history

- **Remote-tracking** branches (`origin/main`) mirror last **fetched** state; **not** live — **`collaboration-and-safety.md`**.
- **Rewriting** shared refs changes **everyone’s** base → policy matter — **`failure-modes-detection-mitigation.md`**.
