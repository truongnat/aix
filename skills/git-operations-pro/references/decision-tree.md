# Git — decision trees (support tier)

## Merge vs rebase vs squash (feature branch → main)

```
Team policy allows rewriting feature branch history?
├── Yes → Rebase onto latest main for linear history before merge
└── No / shared branch → Merge main into feature; resolve conflicts; merge PR with squash or merge commit per policy
```

**Squash merge:** One commit on `main` per PR — clean history, lose per-commit story (acceptable for many teams).

## Revert vs reset

```
Commits already pushed to shared remote branch?
├── Yes → revert (adds new commits)
└── No, local only → reset --soft/--hard as appropriate (still avoid losing work you need)
```

## When to cherry-pick vs merge entire branch

```
Need exactly one commit from another branch?
├── Yes → cherry-pick that SHA
└── No → merge or rebase branch
```

## Force push

```
Branch is only yours and team allows?
├── Yes → force-with-lease after rebase
└── No → never force to shared/default branches
```

## Conventional Commits type

```
Change type?
├── feat → new user-visible behavior
├── fix → bug fix
├── docs / chore / refactor / test → as per team convention
└── breaking change → footer BREAKING CHANGE: or ! in type scope per spec
```

## When NOT to use interactive rebase

- Branch has **multiple collaborators** actively pushing — coordinate or avoid rewriting.

## Submodule: bump workflow

```
Need newer submodule commit on main?
├── cd submodule && git fetch && checkout <sha>
├── cd .. && git add submodule-path
└── Commit superproject pointer — reviewers see explicit bump
```
