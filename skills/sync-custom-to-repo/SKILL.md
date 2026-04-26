---
name: sync-custom-to-repo
description: |
  Sync custom skills/workflows/templates from local devkit to upstream GitHub repository via automated PR workflow. Detects custom additions, creates feature branches with descriptive names, commits changes with dynamic messages, pushes to remote, and provides PR creation URL. Handles Windows environments with xcopy commands and provides comprehensive summary reporting.

  Use this skill when the user wants to sync local custom skills, workflows, or templates to the upstream skills repository. Handles the full sync workflow including detection, branching, committing, pushing, and PR creation guidance.

  Use **with** **`git-operations-pro`** for advanced Git workflows, **`cli-pro`** for command-line tool patterns, **`security-pro`** for credential handling and repository access security.

  Triggers: "sync custom", "sync skills", "sync to repo", "push to upstream", "sync devkit", "sync changes", "PR creation", "branch sync", "custom skills sync", "workflow sync", "template sync".

metadata:
  short-description: Sync custom skills/workflows/templates to upstream repo via PR
  content-language: en
  domain: devkit
  level: professional
---

# Sync Custom to Upstream Repo (professional)

Skill text is **English**; answer in the user's preferred language when Cursor User Rules or the conversation specify it.

Use Git operations and GitHub repository patterns for API truth; align with **branch naming conventions**, **commit message standards**, and **PR workflow best practices**. This skill encodes **repository sync discipline**, **change tracking**, **branch management**, and **automated PR workflow**. Confirm **repository URL**, **custom content types**, and **sync frequency** when known.

## Boundary

**`sync-custom-to-repo`** owns **sync workflow automation**: detecting custom skills/workflows/templates, creating descriptive branch names, committing with dynamic messages, pushing to remote, and providing PR creation URLs. It does **not** replace **`git-operations-pro`** for advanced Git operations, **`cli-pro`** for CLI tool design, or **`security-pro`** for credential management.

| Skill | When to combine |
|-------|-----------------|
| **`git-operations-pro`** | Advanced Git workflows, conflict resolution, branch management |
| **`cli-pro`** | Command-line tool design patterns, cross-platform compatibility |
| **`security-pro`** | Credential handling, repository access security, token management |

## When to use

- Syncing custom skills from local devkit to upstream repository
- Syncing custom workflows to the skills repository
- Syncing custom templates to the skills repository
- Creating feature branches with descriptive names based on content
- Automating PR creation workflow for custom additions
- Trigger keywords: `sync custom`, `sync skills`, `sync to repo`, `push to upstream`

## When not to use

- **General Git operations** without sync context — **`git-operations-pro`** first
- **CLI tool development** — **`cli-pro`** for tooling patterns
- **Security/credential management** — **`security-pro`** for access control

## Required inputs

- **Repository URL**: Target upstream repository (default: https://github.com/truongnat/skills.git)
- **Devkit root path**: Path to local devkit directory (default: script's parent directory)
- **Custom content types**: Skills, workflows, and/or templates to sync

## Expected output

- **Branch name**: Dynamic based on content (e.g., `sync-ocr-pro-20260424`)
- **Commit message**: Descriptive with content counts and timestamp
- **PR URL**: Direct link to create PR (when GitHub CLI unavailable)
- **Summary report**: Complete breakdown of synced items

## Workflow

### Detection Phase

1. **Scan skills directory** for directories containing `SKILL.md`
2. **Scan workflows directory** for workflow directories
3. **Scan templates directory** for template directories
4. **Report total count** and breakdown by type

### Branch Creation

1. **Generate date string**: YYYYMMDD format
2. **Generate content string**: Join skill/workflow/template names (max 30 chars)
3. **Create branch name**: `sync-{content}-{date}`

### Sync Process

1. **Clone upstream repo** to temporary directory
2. **Create feature branch** in cloned repo
3. **Copy custom skills** using Windows xcopy command
4. **Copy custom workflows** using Windows xcopy command
5. **Copy custom templates** using Windows xcopy command
6. **Commit with descriptive message** including content counts and timestamp
7. **Push branch to upstream** with tracking
8. **Attempt PR creation** via GitHub CLI, fallback to manual URL

### Cleanup

1. **Remove temporary directory** after sync completes
2. **Generate summary report** with branch name and synced items

### Reporting

**Summary format:**
```
=== Sync complete ===

=== Summary ===
Synced: 1 skill(s)
Branch: sync-ocr-pro-20260424
Skills synced (1):
  - ocr-pro
Branch đã sẵn sàng: https://github.com/truongnat/skills/pull/new/sync-ocr-pro-20260424
```

## Implementation details

### Windows compatibility

Uses `xcopy` command for directory copying:
- `/E` - Copy subdirectories including empty ones
- `/I` - Assume destination is a directory
- `/Y` - Suppress overwrite prompts

### Error handling

- **GitHub CLI failure**: Falls back to manual PR URL display
- **No custom content**: Reports and exits gracefully
- **Git operation failures**: Propagate errors with descriptive messages

### Dynamic naming

**Branch name pattern:**
- Content-based: Includes actual skill/workflow/template names
- Date-based: YYYYMMDD format for chronological ordering
- Length-limited: Content string truncated to 30 characters

**Commit message pattern:**
- Descriptive: Includes count of each content type synced
- Timestamped: ISO format timestamp for audit trail
- Clear: "Sync X skill(s), Y workflow(s), Z template(s) - YYYY-MM-DD HH:MM:SS"

## Cross-platform considerations

**Current implementation:** Windows-specific (PowerShell, xcopy)

**Future enhancements:**
- Detect platform (Windows vs Unix)
- Use `cp -r` for Unix systems
- Use `robocopy` or `rsync` for better performance
- Add platform detection logic

## Integration points

**Works with:**
- `.agents/devkit/skills/` - Custom skills directory
- `.agents/devkit/workflows/` - Custom workflows directory
- `.agents/devkit/templates/` - Custom templates directory
- GitHub repository - Upstream target

**Does not modify:**
- Local devkit structure
- Original custom content
- Git configuration

## Security considerations

- **Repository access**: Requires Git credentials for push operations
- **Temporary files**: Uses OS temp directory, cleaned up after sync
- **No secrets**: Script does not handle or store credentials
- **GitHub CLI**: Optional, falls back gracefully if unavailable

## Troubleshooting

**Issue:** "Not a git repository" error
- **Cause:** Script run from non-git directory
- **Fix:** Ensure devkit is in a git-tracked location

**Issue:** xcopy command fails
- **Cause:** Path contains special characters or spaces
- **Fix:** Quote paths in xcopy command

**Issue:** GitHub CLI not found
- **Cause:** gh not installed or not in PATH
- **Fix:** Manual PR creation using provided URL

**Issue:** Branch push fails
- **Cause:** Authentication failure or permission denied
- **Fix:** Check Git credentials and repository permissions

### Operating principles

- Detect and report the **actual custom content set** before creating any branch.
- Keep the workflow **deterministic and minimal**: copy only the intended custom directories.
- Prefer **descriptive branch and commit naming** so review scope is obvious upstream.
- Treat push/PR creation as **separate verification points**; do not blur local sync success with remote success.
- Surface platform assumptions clearly when the script is Windows-specific or environment-specific.

## Suggested response format

Use this structure for sync work:

1. **Context** — target repo, content types, local source, platform assumptions.
2. **Detected changes** — counts and names of skills/workflows/templates to sync.
3. **Sync plan or result** — branch name, commit message pattern, push/PR status.
4. **Verification** — what was copied, what remote state was confirmed, what remains manual.
5. **Residual risks** — auth, conflicts, platform limits, or upstream review dependencies.

## Resources in this skill

- `references/workflow.md` — canonical sync workflow, branch/commit behavior, and reporting expectations.

## Quick example

User asks: "Sync my custom OCR skill and template to the upstream skills repo."

Response shape:
- Detect the exact custom skill/template directories present.
- Generate a descriptive branch and commit scope from those directories.
- Report whether clone, copy, commit, push, and PR-link generation each succeeded.
- Call out any manual GitHub step if PR creation is not automatic.

## Checklist before calling the skill done

- The exact content selected for sync is listed.
- Branch and commit naming are descriptive and reproducible.
- Local sync success and remote push/PR success are reported separately.
- Platform-specific assumptions or limitations are explicit.
- Remaining manual steps are clearly called out.
