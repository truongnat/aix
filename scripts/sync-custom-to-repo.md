# Sync to Repo

Simple script to push changes to your repository.

## Usage

### Push directly to main
```bash
node scripts/sync-custom-to-repo.js --push
```

### Push to specific repository
```bash
node scripts/sync-custom-to-repo.js --push --repo https://github.com/user/repo.git
```

### Create PR from new branch
```bash
node scripts/sync-custom-to-repo.js --pr
```

### Create PR to specific repository
```bash
node scripts/sync-custom-to-repo.js --pr --repo https://github.com/user/repo.git
```

### Create PR with custom branch name
```bash
node scripts/sync-custom-to-repo.js --pr --branch my-feature
```

## Options

- `--push`: Push directly to main branch
- `--pr`: Create branch, push, and create PR
- `--repo <url>`: Target repository URL (e.g., https://github.com/user/repo.git)
- `--branch <name>`: Custom branch name

## What it does

- **--push**: Stages all changes, commits, and pushes directly to main branch
- **--pr**: Stages all changes, commits, creates new branch, pushes, and creates PR
- **--repo**: Specifies target repository (useful when pushing to a different repo than origin)

## Requirements

- Git must be initialized and configured
- If using `--pr`: GitHub CLI (`gh`) recommended for automatic PR creation

## Example

```bash
# Push changes directly to main (uses origin)
node scripts/sync-custom-to-repo.js --push

# Push to a different repository
node scripts/sync-custom-to-repo.js --push --repo https://github.com/myuser/myrepo.git

# Create PR for review
node scripts/sync-custom-to-repo.js --pr

# Create PR to specific repository
node scripts/sync-custom-to-repo.js --pr --repo https://github.com/myuser/myrepo.git
