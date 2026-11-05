# Git — tips and tricks

## Named stash

```bash
git stash push -m "wip: auth refactor before rebase"
git stash list
git stash pop stash@{0}
```

## Partial stage (hunk)

```bash
git add -p path/to/file.ts
# y/n/s/e/q — stage only the hunks you intend
```

## Unstage / discard (modern)

```bash
git restore --staged path/to/file.ts   # unstage
git restore path/to/file.ts             # discard working tree changes (careful)
```

## Interactive rebase (local branch only)

```bash
git fetch origin
git rebase -i origin/main
# pick / squash / reword / drop as needed
```

## Useful inspection

```bash
git log --oneline --graph -20
git blame -L 40,60 path/to/file.ts
git diff main...HEAD --stat
```

## Cherry-pick single commit

```bash
git cherry-pick <sha>
# If conflicts: fix files → git add → git cherry-pick --continue
```

## Bisect (find bad commit)

```bash
git bisect start
git bisect bad                 # current is bad
git bisect good <good-sha>     # last known good
# test each step → git bisect good | bad until found
git bisect reset
```

## Submodule reminder (if repo uses them)

```bash
git submodule update --init --recursive
```

Document **whether** the team uses submodule vs subtree — both confuse newcomers; see [collaboration-and-safety.md](collaboration-and-safety.md).
