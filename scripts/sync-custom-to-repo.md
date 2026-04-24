# Sync Custom to Repo

Script to automatically create a PR with custom skills/workflows/templates from local devkit to upstream repository.

## Use Case

You work on machine B, install devkit, and add custom skills/workflows/templates. This script helps you sync those changes back to the original repository as a PR.

## Features

- Detects custom skills (not in the original bundle)
- Detects custom workflows
- Detects custom templates
- Detects custom commands
- Creates a new branch with meaningful name
- Commits changes with descriptive message
- Pushes to remote
- Creates PR with detailed description (if GitHub CLI is available)

## Usage

### Basic usage (creates PR)
```bash
node scripts/sync-custom-to-repo.js
```

### Dry run (preview without executing)
```bash
node scripts/sync-custom-to-repo.js --dry-run
```

### Custom branch name
```bash
node scripts/sync-custom-to-repo.js --branch my-custom-branch
```

### Skip PR creation (only push branch)
```bash
node scripts/sync-custom-to-repo.js --skip-pr
```

## Requirements

- Git must be initialized and configured
- Remote origin must be set to a GitHub repository
- GitHub CLI (`gh`) recommended for automatic PR creation
- Working tree must be clean (no uncommitted changes)

## What it does

1. **Detects custom additions**: Compares local skills/workflows/templates with the bundle to identify custom additions
2. **Creates branch**: Generates a branch name like `sync-custom-2-skkills-1-workflows-20260424`
3. **Stages changes**: Adds all custom files to git
4. **Commits**: Creates a commit with descriptive message
5. **Pushes**: Pushes the branch to remote
6. **Creates PR**: Uses GitHub CLI to create a PR with detailed description of additions

## PR Description

The generated PR includes:
- List of custom skills with descriptions from SKILL.md
- List of custom workflows with descriptions
- List of custom templates
- List of custom commands with descriptions

## Example Output

```
=== Sync Custom to Repo ===
Detecting custom additions...

Found 3 custom addition(s):
  Skills: ui-reverse-engineer-pro, custom-auth
  Workflows: custom-workflow

Branch name: sync-custom-2-skills-1-workflows-20260424

Creating branch: sync-custom-2-skills-1-workflows-20260424
Staging changes...
Changes committed
Pushing to remote...
Branch pushed successfully
PR created successfully using GitHub CLI

=== Sync complete ===
```

## Troubleshooting

### Working tree not clean
Commit or stash your changes before running the script:
```bash
git status
git add .
git commit -m "WIP"
```

### GitHub CLI not available
The script will fallback to manual PR creation instructions if `gh` is not installed.

### No custom additions detected
The script will exit if no custom skills/workflows/templates are found.
