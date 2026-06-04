# Daily Dev Report Workflow

## Purpose

Produce daily developer handoff notes and PR-ready message from completed work.

## Skills Used

1. tool-discovery
2. report-writer
3. gatekeeper

## Required Inputs

- Active session
- PLAN / TASKS
- VERIFY
- Git diff / status

## Steps

### Step 1 — Collect context

Run or inspect:

```bash
node scripts/generate-report-context.js --json
```

Or manually:

```bash
git status --short
git diff --stat
git diff --name-status
```

If base and head exist:

```bash
node scripts/generate-report-context.js --base origin/main --head HEAD --json
```

### Step 2 — Validate report readiness

Check:

- VERIFY exists.
- VERIFY has explicit status.
- Verification evidence exists.
- Changed files are known.

Block if any check fails.

### Step 3 — Generate report artifacts

Write to the active session:

- `REPORT.md`
- `PR_MESSAGE.md`
- `CHANGE_SUMMARY.md`

Also update `SHIP.md` when completing `harness-ship`.

### Step 4 — Gate

If report cannot be generated truthfully, return Blocked.

Use `gatekeeper` when ship decision is required.

## Stop Conditions

Stop if:

- verification is blocked
- diff cannot be inspected
- user approval is required for known gaps

## Dispose Rules

- Do not delete user-authored report content without reason.
- Archive session-only report skills after completion when applicable.
