# Scenario F1: Simple CLI Lifecycle

## Goal

Dogfood the `aih.sh` lifecycle dispatcher on a disposable Cursor-style target repository and verify:

- `install`
- `status`
- `doctor`
- `update`
- `uninstall`
- `uninstall --all`
- `install.sh` wrapper compatibility

## Environment

- Date: 2026-06-03
- Source repo: `ai-engineering-harness`
- Target repo: `../harness-dogfood-simple-cli`
- Target setup:
  - `git init`
  - `.cursor/` provider hint present

## Commands Run

```bash
sh aih.sh install --target ../harness-dogfood-simple-cli --yes
sh aih.sh status --target ../harness-dogfood-simple-cli
sh aih.sh doctor --target ../harness-dogfood-simple-cli
sh aih.sh update --target ../harness-dogfood-simple-cli --yes
sh aih.sh uninstall --target ../harness-dogfood-simple-cli --yes
sh aih.sh uninstall --target ../harness-dogfood-simple-cli --all --yes
sh install.sh install --target ../harness-dogfood-simple-cli --runtime cursor --yes --dry-run
```

## Install Result

`aih.sh install` auto-detected `cursor` from the target `.cursor/` directory and defaulted to:

- scope: `project`
- visibility: `private`
- ignore strategy: `info-exclude`
- init harness: `yes`
- install cache: `yes`

Created:

- `.ai-harness/`
- `.harness/`
- `.cursor/rules/ai-engineering-harness.mdc`

Updated:

- `.git/info/exclude`

## Status Result

`aih.sh status` reported:

- git repo: `yes`
- detected runtimes: `cursor`
- `.ai-harness exists: yes`
- `.harness exists: yes`
- exclude block exists: `yes`

## Doctor Result

`aih.sh doctor` passed:

- node available
- target is a Git repo
- `.ai-harness` exists
- `.harness` exists
- runtime entrypoint detected
- Cursor entrypoint references `.ai-harness/`
- exclude block exists

## Update Result

Before `update`, the target was modified intentionally:

- `.ai-harness/AGENTS.md` replaced with stale content
- `.cursor/rules/ai-engineering-harness.mdc` replaced with stale content
- `.harness/HARNESS.md` replaced with `# user state`

`aih.sh update`:

- refreshed `.ai-harness/`
- overwrote `.cursor/rules/ai-engineering-harness.mdc`
- preserved `.harness/HARNESS.md` exactly as `# user state`
- left ignore settings unchanged because no `--visibility` was passed

## Uninstall Result

Default `aih.sh uninstall`:

- removed `.cursor/rules/ai-engineering-harness.mdc`
- kept `.ai-harness/`
- kept `.harness/`
- removed the harness block from `.git/info/exclude`

Observed side effect:

- after uninstall, `git status --short` showed:

```txt
?? .ai-harness/
?? .harness/
```

This is consistent with current behavior, because uninstall removes the local exclude block while preserving cache/state.

## Full Uninstall Result

`aih.sh uninstall --all`:

- removed `.ai-harness/`
- removed `.harness/`
- left `.git/info/exclude` without the harness block
- left the repo clean in `git status --short`

## Wrapper Compatibility

`install.sh` compatibility wrapper was verified with:

```bash
sh install.sh install --target ../harness-dogfood-simple-cli --runtime cursor --yes --dry-run
```

Result:

- wrapper delegated correctly to `aih.sh`
- dry-run plan matched the expected Cursor project install path

## Git Hygiene Result

After `install`:

- private generated files were hidden from `git status`
- `.git/info/exclude` contained:
  - `.harness/`
  - `.cursor/rules/ai-engineering-harness.mdc`
  - `.ai-harness/`

After default `uninstall`:

- exclude block removed
- kept cache/state became visible in `git status`

After `uninstall --all`:

- cache/state removed
- repo returned to clean `git status`

## Outcome

**PASS** for the simple lifecycle command surface:

- `aih.sh install`
- `aih.sh status`
- `aih.sh doctor`
- `aih.sh update`
- `aih.sh uninstall`
- `aih.sh uninstall --all`
- `install.sh` wrapper compatibility

## Follow-up

One UX question remains open for private installs:

- should default `uninstall` remove the exclude block even when `.ai-harness/` and `.harness/` are kept?

Current behavior is internally consistent, but it makes private repos noisy immediately after uninstall unless the user also removes cache/state or re-adds local ignore rules.
