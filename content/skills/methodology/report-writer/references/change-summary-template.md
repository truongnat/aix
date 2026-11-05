# Change Summary Template Reference

Use `templates/CHANGE_SUMMARY.md` as the canonical structure.

Populate from git context:

```bash
git status --short
git diff --stat
git diff --name-status
```

When a merge base exists:

```bash
git merge-base HEAD origin/main
git diff --stat $(git merge-base HEAD origin/main)..HEAD
```

Or use:

```bash
node scripts/generate-report-context.js --base origin/main --head HEAD --json
```
