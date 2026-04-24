# Sync to Repo

Simple script to push changes to your repository.

## Usage

### Push directly to main
```bash
node scripts/sync-custom-to-repo.js --push
```

### Create PR from new branch
```bash
node scripts/sync-custom-to-repo.js --pr
```

### Create PR with custom branch name
```bash
node scripts/sync-custom-to-repo.js --pr --branch my-feature
```

## What it does

- **--push**: Stages all changes, commits, and pushes directly to main branch
- **--pr**: Stages all changes, commits, creates new branch, pushes, and creates PR

## Requirements

- Git must be initialized and configured
- Remote origin must be set
- GitHub CLI (`gh`) recommended for automatic PR creation (when using --pr)

## Example

```bash
# Push changes directly to main
node scripts/sync-custom-to-repo.js --push

# Or create a PR for review
node scripts/sync-custom-to-repo.js --pr
```
