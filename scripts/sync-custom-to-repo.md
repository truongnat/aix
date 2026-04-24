# Sync to Upstream Repo

Script to sync custom skills/workflows/templates to upstream repository via PR.

## Usage

```bash
node scripts/sync-custom-to-repo.mjs
```

## What it does

1. Detects custom skills/workflows/templates in local devkit
2. Clones upstream repo to temp directory
3. Creates new branch in cloned repo
4. Copies custom additions to cloned repo
5. Commits and pushes branch to upstream
6. Creates pull request (if GitHub CLI is available)
7. Cleans up temp directory

## Requirements

- Git must be installed
- GitHub CLI (`gh`) recommended for automatic PR creation
- Internet connection to clone upstream repo

## Example Output

```
=== Sync Custom to Upstream Repo ===
Found 3 custom addition(s):
  Skills: custom-skill-1, custom-skill-2
  Workflows: custom-workflow

Cloning upstream repo to temp directory...
✓ Cloning upstream repo to temp directory (2.34s)

Creating new branch in cloned repo...
✓ Creating new branch in cloned repo (0.12s)

Copying custom skills to cloned repo...
✓ Copying custom skills to cloned repo (0.45s)

...

Pushing branch to upstream...
✓ Pushing branch to upstream (2.91s)

Creating pull request...
✓ PR created successfully

=== Sync complete ===
```

## Note

If GitHub CLI is not installed, the script will still push the branch and provide manual instructions for creating the PR.
