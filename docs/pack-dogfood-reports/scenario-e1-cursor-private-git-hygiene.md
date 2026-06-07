# Scenario E1: Cursor Private Git Hygiene

## Scenario

Dogfood **v0.9.2 Step 1** — Cursor project install with `--visibility private` and `.git/info/exclude`, reproducing the real-install case where generated `.harness/` and `.cursor/rules/` previously dirtied `git status`.

- **Runtime:** `cursor`
- **Scope:** `project`
- **Visibility:** `private`
- **Ignore strategy:** `info-exclude`
- **Init harness:** yes
- **Target:** disposable external Git repo `../harness-dogfood-cursor-private` (not committed to pack)

## Commands Run

From pack root (`ai-engineering-harness`):

```bash
# one-time target setup (maintainer)
mkdir -p ../harness-dogfood-cursor-private
printf '# dogfood cursor private\n' > ../harness-dogfood-cursor-private/README.md
cd ../harness-dogfood-cursor-private && git init

# dry-run
sh install.sh install --runtime cursor --scope project \
  --visibility private --ignore-strategy info-exclude --init-harness \
  --dry-run --yes --target ../harness-dogfood-cursor-private

# write
sh install.sh install --runtime cursor --scope project \
  --visibility private --ignore-strategy info-exclude --init-harness \
  --yes --target ../harness-dogfood-cursor-private

# validation (from pack)
node bin/validate.js --target ../harness-dogfood-cursor-private --runtime cursor --profile-only

# git checks (from target)
cd ../harness-dogfood-cursor-private
git status --short
grep -A5 'ai-engineering-harness start' .git/info/exclude
```

Remote equivalent:

```bash
curl -fsSL https://raw.githubusercontent.com/truongnat/ai-engineering-harness/main/install.sh | sh -s -- \
  install --runtime cursor --scope project --visibility private --ignore-strategy info-exclude --init-harness --yes
```

## Files Created

| Path | Expected |
|---|---|
| `.git/info/exclude` | Harness delimited block appended |
| `.harness/HARNESS.md` (+ profile skeleton) | yes |
| `.harness/TEAM.md`, `SKILLS.md`, `WORKFLOW.md`, `GATES.md`, `MEMORY.md` | yes |
| `.harness/goals/.gitkeep` | yes |
| `.cursor/rules/ai-engineering-harness.mdc` | yes |
| `.gitignore` | not created |
| Root pack dirs (`commands/`, `skills/`, …) | not created |

## .git/info/exclude Check

Block present (markers + paths):

```gitignore
# ai-engineering-harness start
.harness/
.cursor/rules/ai-engineering-harness.mdc
# ai-engineering-harness end
```

Installer output: `UPDATE .git/info/exclude`

Dry-run output: `WOULD UPDATE .git/info/exclude` with `ignore:` lines for both paths.

## .gitignore Check

- **No** `.gitignore` file in target before or after install.
- Installer does not reference or modify `.gitignore` for private + `info-exclude`.

## Git Status Result

After write install:

```txt
?? README.md
```

**PASS** — `.harness/` and `.cursor/rules/ai-engineering-harness.mdc` do **not** appear in `git status` (excluded as untracked).

Only pre-existing untracked `README.md` (created before `git init` for minimal repo) remains visible.

## Runtime-aware Validation Result

```bash
node bin/validate.js --target ../harness-dogfood-cursor-private --runtime cursor --profile-only
```

**PASS** — profile contract (cursor runtime paths + `.harness/`).

## What Worked

- Private visibility + `info-exclude` writes exclude **before** harness init and runtime install.
- Generated harness/runtime paths hidden from `git status` without touching tracked `.gitignore`.
- Idempotent block format documented in [private-install-git-hygiene.md](../private-install-git-hygiene.md).
- Aligns with [git-hygiene-policy.md](../git-hygiene-policy.md).

## Friction

| Item | Severity | Notes |
|---|---|---|
| Installer may print absolute target path in plan | low | Same as prior dogfood; reports use `../harness-dogfood-cursor-private` |
| `.git` as file (worktree/submodule) not resolved | low | `is_git_repo` accepts file `.git` but exclude path assumes `.git/info/exclude` directory — patch candidate |
| Manual Cursor IDE rule load | not run | File/install + git hygiene only; stable claim still **No** |

## Verdict

**PASS** — Private Cursor project install no longer dirties `git status` for generated `.harness/` and `.cursor/rules/ai-engineering-harness.mdc` when using `--visibility private --ignore-strategy info-exclude`. `.gitignore` untouched.

**Stable claim:** **No** (IDE session not verified).

**Next:** Step 2 — `uninstall` command with safe delete + exclude block cleanup ([uninstall-update-design.md](../uninstall-update-design.md)).
