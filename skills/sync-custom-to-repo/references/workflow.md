# Sync Custom to Upstream Repo - Workflow

## Overview

This skill automates the process of syncing custom skills, workflows, and templates from a local devkit to an upstream GitHub repository via pull requests.

## Workflow Steps

### 1. Detection Phase

**Purpose:** Identify custom content to sync

**Actions:**
- Scan `skills/` directory for subdirectories containing `SKILL.md`
- Scan `workflows/` directory for workflow directories
- Scan `templates/` directory for template directories
- Report total count and breakdown by type

**Output:** List of custom skills, workflows, templates

### 2. Branch Naming

**Purpose:** Create descriptive, content-based branch names

**Pattern:** `sync-{content}-{date}`

**Examples:**
- `sync-ocr-pro-20260424` - Single skill
- `sync-ocr-pro-keycloak-pro-20260424` - Multiple skills
- `sync-dev-workflow-20260424` - Workflow

**Rules:**
- Content string limited to 30 characters
- Date format: YYYYMMDD
- Hyphen-separated content names

### 3. Repository Clone

**Purpose:** Create isolated working copy

**Actions:**
- Clone upstream repo to OS temp directory
- Use unique temp directory name with timestamp
- Verify clone success before proceeding

**Cleanup:** Temp directory removed after sync completes

### 4. Branch Creation

**Purpose:** Create isolated feature branch

**Actions:**
- Create new branch in cloned repo
- Branch name from step 2
- Verify branch creation

### 5. Content Copy

**Purpose:** Copy custom content to cloned repo

**Windows Implementation:**
```batch
xcopy "{source}" "{destination}" /E /I /Y
```

**Flags:**
- `/E` - Copy subdirectories including empty ones
- `/I` - Assume destination is directory
- `/Y` - Suppress overwrite prompts

**Process:**
- Copy skills to `skills/` in cloned repo
- Copy workflows to `workflows/` in cloned repo
- Copy templates to `templates/` in cloned repo

### 6. Commit Creation

**Purpose:** Create descriptive commit message

**Pattern:** `Sync {X skill(s), Y workflow(s), Z template(s)} - {timestamp}`

**Example:** `Sync 1 skill(s) - 2026-04-24 16:30:45`

**Actions:**
- Stage all changes (`git add -A`)
- Create commit with descriptive message
- Verify commit creation

### 7. Branch Push

**Purpose:** Push branch to upstream repository

**Actions:**
- Push branch with upstream tracking (`-u origin`)
- Verify push success
- Handle authentication errors gracefully

### 8. PR Creation

**Purpose:** Create or guide PR creation

**Automatic (GitHub CLI available):**
```bash
gh pr create --base main --head {branch} --title "Sync custom changes" --body "Sync custom skills/workflows/templates from local devkit"
```

**Manual (GitHub CLI unavailable):**
- Display PR URL: `{repo}/pull/new/{branch}`
- User manually creates PR via web interface

### 9. Cleanup

**Purpose:** Remove temporary files

**Actions:**
- Remove temp directory recursively
- Verify cleanup success

### 10. Summary Report

**Purpose:** Provide clear sync summary

**Format:**
```
=== Sync complete ===

=== Summary ===
Synced: {summary}
Branch: {branch-name}
{content breakdown}
Branch đã sẵn sàng: {pr-url}
```

## Error Handling

### No Custom Content

**Detection:** Total count = 0

**Action:** Report "No custom additions detected. Nothing to sync." and exit

### Git Operation Failures

**Detection:** Git command returns non-zero exit code

**Action:** Propagate error with descriptive message, cleanup temp directory

### GitHub CLI Unavailable

**Detection:** `gh` command not found or fails

**Action:** Fall back to manual PR URL display

### Authentication Failures

**Detection:** Git push fails with 401/403

**Action:** Display authentication error, guide user to check credentials

## Platform Considerations

### Current Implementation

- **Platform:** Windows
- **Copy command:** `xcopy`
- **Shell:** PowerShell

### Future Enhancements

**Platform Detection:**
```javascript
const platform = process.platform;
if (platform === 'win32') {
  // Use xcopy
} else {
  // Use cp -r
}
```

**Cross-Platform Copy:**
- Windows: `xcopy` or `robocopy`
- Unix: `cp -r` or `rsync`
- Node.js: Use `fs-extra.copySync()`

## Security Considerations

### Credential Handling

- Script does not store or handle credentials
- Relies on Git's credential helper
- GitHub CLI uses its own authentication

### Temporary Files

- Uses OS temp directory
- Unique directory names prevent conflicts
- Cleanup on both success and failure

### Repository Access

- Requires write access to upstream repo
- Verify permissions before sync
- Handle permission errors gracefully

## Integration Points

### Input Sources

- `.agents/devkit/skills/` - Custom skills
- `.agents/devkit/workflows/` - Custom workflows
- `.agents/devkit/templates/` - Custom templates

### Output Targets

- GitHub repository - Upstream sync target
- PR creation interface - Manual or automated

### Dependencies

- Git - Version control operations
- GitHub CLI (optional) - Automated PR creation
- Node.js - Script execution environment

## Testing Checklist

- [ ] Detects custom skills correctly
- [ ] Detects custom workflows correctly
- [ ] Detects custom templates correctly
- [ ] Creates descriptive branch names
- [ ] Clones repository successfully
- [ ] Copies content correctly
- [ ] Creates commits with proper messages
- [ ] Pushes branch successfully
- [ ] Creates PR via GitHub CLI (if available)
- [ ] Falls back to manual PR URL (if CLI unavailable)
- [ ] Cleans up temp directory
- [ ] Generates accurate summary report
- [ ] Handles no-custom-content case
- [ ] Handles git operation failures
- [ ] Handles authentication errors
