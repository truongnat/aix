# Git — edge cases

## Rewriting public history

**Problem:** `git push --force` on a shared branch breaks clones and open PRs.

**Default:** On `main` / `develop`, prefer **`git revert <bad-sha>`** to create a forward fix without rewriting history.

```bash
git revert --no-commit <sha1>..<sha2>   # range of bad commits
git commit -m "revert: rollback feature X"
```

**When force-push might be allowed:** Personal feature branch after coordinating with reviewers; never without team policy.

## Large files

Git is poor for big binaries. Use **Git LFS** or store artifacts outside the repo.

```gitattributes
*.psd filter=lfs diff=lfs merge=lfs -text
```

## Line endings

Mixed CRLF/LF causes noisy diffs. Use `.gitattributes`:

```gitattributes
* text=auto eol=lf
*.bat text eol=crlf
```

## Case-only renames (macOS / Windows)

```bash
git mv OldName oldname-tmp && git mv oldname-tmp oldname
```

Two-step rename avoids case-insensitive filesystem issues.

## Merge conflict resolution

```bash
git status                    # see unmerged paths
# edit files, remove conflict markers
git add path/resolved.ts
git merge --continue          # or rebase --continue
```

## Detached HEAD

After checking out a tag or SHA:

```bash
git switch -c fix/from-detached
```

## Submodule drift

**Symptom:** Superproject points to old submodule commit.

**Mitigation:** After updating submodule repo, commit the **superproject** pointer change explicitly.

## Subtree vs submodule

- **Submodule:** separate repo pointer; reviewers must understand two repos.
- **Subtree:** vendor code merged in; simpler clone but heavier history — team should pick one pattern.

## Merge queue / stacked PRs

- **Merge queue** (GitHub/GitLab features) rebases **topic onto moving `main`** before merge — conflicts can appear **only** in queue; coordinate with **`ci-cd-pro`** — **`decision-framework-and-trade-offs.md`**.
- **Stacked branches** (`feat-a` → `feat-b`): rebasing bottom PR changes top PR bases — reorder or communicate — **`failure-modes-detection-mitigation.md`**.

See [commits-and-branching.md](commits-and-branching.md) and [decision-tree.md](decision-tree.md).
