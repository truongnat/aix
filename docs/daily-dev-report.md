# Daily Dev Report and PR Notes

## Why this exists

Daily development work does not end at verification. Operators need a truthful handoff that answers:

1. What changed?
2. Why did it change?
3. Which files were affected?
4. What verification evidence exists?
5. What risks or gaps remain?
6. What PR title and body should be used?

The harness keeps the command surface at eight canonical commands. Report generation is part of `harness-ship`, not a separate command in v1.

## Relationship to ship

| Artifact / step | Role |
|---|---|
| `harness-verify` | Creates verification evidence |
| `harness-ship` | Gate plus PR/report notes |
| `SHIP.md` | Ship summary and handoff |
| `REPORT.md` | Daily developer report |
| `PR_MESSAGE.md` | Copy-ready PR title and body |
| `CHANGE_SUMMARY.md` | Compact change set for logs and memory |

`harness-ship` is not only a gate. It must produce PR-ready output when verification supports it.

## Session artifact locations

Reports are written to the active session:

```txt
.harness/sessions/<session>/REPORT.md
.harness/sessions/<session>/PR_MESSAGE.md
.harness/sessions/<session>/CHANGE_SUMMARY.md
.harness/sessions/<session>/SHIP.md
```

Templates live in the harness pack:

```txt
templates/REPORT.md
templates/PR_MESSAGE.md
templates/CHANGE_SUMMARY.md
```

## Data sources

Before writing report artifacts, read:

1. `.harness/STATE.md`
2. active session `PLAN-*.md`
3. `TASKS.md`
4. `VERIFY.md`
5. git status and diff

Preferred helper:

```bash
node scripts/generate-report-context.js --json --templates
```

Template discovery (project before harness):

```bash
node scripts/discover-report-templates.js --write
```

Scans, in order: `.github/pull_request_template.md`, `.github/PULL_REQUEST_TEMPLATE/`, `.gitlab/merge_request_templates/`, and other provider paths — then falls back to `templates/PR_MESSAGE.md`.

With a known base branch:

```bash
node scripts/generate-report-context.js --base origin/main --head HEAD --json
```

Fallback when no base exists:

```bash
git status --short
git diff --stat
git diff --name-status
```

If git context cannot be inspected, return Blocked. Do not guess file lists or diffs.

## Skills and workflow

Use the `report-writer` skill during `harness-ship`.

Workflow reference: `workflows/daily-dev-report.md`

Typical skill chain:

```txt
tool-discovery → report-writer → gatekeeper
```

## PR message generation

Use `templates/PR_MESSAGE.md` and `skills/report-writer/references/pr-message-template.md`.

Rules:

- Verification checkboxes must match VERIFY.md and tool-run artifacts.
- Include risks, rollback notes, and reviewer notes when relevant.
- Default language is English. Project-specific locale templates may be added later.

## Blocking behavior

Report generation must block when:

- `VERIFY.md` is missing
- VERIFY status is `pending` or `blocked`
- no verification evidence exists
- git diff cannot be inspected
- no meaningful changes exist when a change-based report is required

Blocked output must ask the minimum question needed to continue, usually redirecting to `harness-verify`.

## Future split

If the surface grows later, a dedicated `harness-report` command may split report-only work from ship gating. In v1, report generation remains part of `harness-ship`.
