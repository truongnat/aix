# Private Install Git Hygiene

## Purpose

Document how **private** project installs keep generated harness/runtime files off `git status` without editing tracked `.gitignore`.

Primary surface: `npx ai-engineering-harness install --visibility private`. Shell/bootstrap fallback details live in [install-sh-usage.md](install-sh-usage.md).

**Dogfood:** Scenario E1 — [pack-dogfood-reports/scenario-e1-cursor-private-git-hygiene.md](pack-dogfood-reports/scenario-e1-cursor-private-git-hygiene.md) (private Cursor, `git status` clean for generated paths).

## Private vs Shared

| `--visibility` | Git behavior |
|---|---|
| `private` | Prefer `.git/info/exclude` — local to checkout, not committed |
| `shared` | No exclude edits — new files visible for commit |

## Why `.git/info/exclude`

- Same syntax as `.gitignore`
- **Not committed** — no extra tracked file change
- Fits “personal harness in a team repo”

`.gitignore` is only for explicit team policy on shell/bootstrap fallback paths. The primary Node CLI does not expose `--ignore-strategy`.

## Commands

```bash
npx ai-engineering-harness install --provider cursor --scope project \
  --visibility private --yes
```

Shell/bootstrap fallback:

```bash
sh install.sh --runtime cursor --scope project --visibility private --init-harness --yes
```

Dry-run:

```bash
npx ai-engineering-harness install --provider cursor --scope project --visibility private --dry-run --yes
```

Expect `WOULD UPDATE .git/info/exclude` before file writes.

## Generated Ignore Block

```gitignore
# ai-engineering-harness start
.ai-harness/
.harness/
.cursor/commands/
.cursor/rules/
# ai-engineering-harness end
```

Paths included when applicable:

- `.ai-harness/` when capability cache is installed (default for all project runtime-native installs)
- `.harness/` when project install initializes harness state
- Runtime bootstrap paths for the selected provider

See [private-capability-cache.md](private-capability-cache.md).

## Runtime Paths

| Runtime | Paths in block |
|---|---|
| cursor | `.cursor/commands/`, `.cursor/rules/` |
| claude | `.claude/CLAUDE.md`, `.claude/settings.json` |
| gemini | `.gemini/extensions/ai-engineering-harness/` |
| codex, generic, manual | `AGENTS.md` |

## Dry Run

Prints `WOULD UPDATE .git/info/exclude` and `ignore:` lines — does not write exclude or runtime files when combined with runtime dry-run.

## Non-Git Targets

`.git/info/exclude` only exists in Git repositories. If the target folder has no `.git/`:

- Install continues (files are still written)
- Warning + manual exclude instructions printed
- No `.git/info/exclude` write — generated harness/runtime files may show up in `git status` later once you initialize Git
- Run `git init` (or install inside a cloned repo) before private install when you want a clean `git status` without manual exclude steps
- `aih.ps1` prints an early warning when private project install/update targets a non-Git directory
- `doctor` reports: `FAIL target is not a Git repo — run git init or run inside a cloned repository`

## Existing Tracked Files

If a path is already **tracked**, exclude rules do not untrack it. Installer may warn; user must `git rm --cached` to hide.

## Troubleshooting

| Symptom | Cause | Action |
|---|---|---|
| Files still in `git status` | Not a Git repo or path tracked | `git init` or untrack path |
| `.gitignore` modified | Used shell/bootstrap fallback with an explicit gitignore strategy | Prefer the primary Node CLI private mode or `info-exclude` on shell fallback |
| Duplicate blocks | Should not happen | Re-run install; block is idempotent (one marker pair) |
| No `--visibility` warning | Non-interactive default | Pass `--visibility private` explicitly |

## Related Docs

- [git-hygiene-policy.md](git-hygiene-policy.md)
- [install-command-model.md](install-command-model.md)
- [installer-ux-v0.9.2-plan.md](installer-ux-v0.9.2-plan.md)
