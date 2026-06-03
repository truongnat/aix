# Uninstall and Update Design

## Purpose

Specify safe **uninstall** and **update** behavior for `install.sh` in `v0.9.2` without deleting user-owned files or breaking unrelated config.

`uninstall` and **project** `update` are implemented for runtime-native installs in `v0.9.2`. Global update remains planned.

## Uninstall Scope

Uninstall is parameterized by:

- `--runtime` (single runtime or `all`)
- `--scope` (`global` | `project`)
- `--target` (project root for project scope)

Current safe defaults:

- remove runtime entrypoint only
- keep `.ai-harness/` unless `--remove-cache`
- keep `.harness/` unless `--remove-state`
- remove the harness block from `.git/info/exclude` when present

Uninstall **does not** remove:

- User-edited content outside known harness paths
- Full `opencode.json` unless harness-only file (prefer remove plugin + revert merge — future)
- Arbitrary lines in `.git/info/exclude` or `.gitignore` except harness delimited blocks we created

## Update Scope

Update refreshes **harness-owned** payloads from a pack ref:

- Same paths as install for given runtime + scope
- Project update refreshes `.ai-harness/` and runtime entrypoints with overwrite semantics
- `--ref` pins tarball version (e.g. `v0.9.2`)

Update does **not**:

- Update `.harness/`
- Change `.gitignore`
- Support manual runtime update

## Manifest / Ownership Tracking

### v0.9.2 design (minimal)

**No manifest file required** for first implementation.

Ownership rules use:

1. **Exact known paths** per runtime + scope ([runtime-native-install-audit.md](runtime-native-install-audit.md))
2. **Marker comments** inside files we create (e.g. header in `.mdc`, `CLAUDE.md` banner) — optional future
3. **`.git/info/exclude` or `.gitignore` delimited block** — uninstall may remove harness block if empty

### Future (optional)

| Manifest | Use |
|---|---|
| `.harness/install-manifest.json` | **Shared** mode — committed with team harness |
| `.git/ai-engineering-harness/manifest.json` or metadata in exclude header | **Private** mode — not committed; records paths + strategy |

- No manifest is used in the current implementation.

## Without Manifest Behavior

For each known path:

| Path state | Uninstall action |
|---|---|
| Exists, known runtime entrypoint | Delete file or directory |
| Exists, requires ownership signal (`AGENTS.md`) | Delete only when file contains `ai-engineering-harness` |
| Exists, shared config risk (`.claude/settings.json`, `opencode.json`) | Skip; print path |
| Missing | Skip silently |
| Directory (`.ai-harness/`, `.harness/`, extension dir) | Remove only when explicit flag requests it, or when it is a runtime-owned extension dir |

Conservative rule: **when in doubt, skip and print**.

## Safe Delete Rules

### Always safe to delete (project)

- `.cursor/rules/ai-engineering-harness.mdc`
- `.opencode/plugins/ai-engineering-harness.js` (if no local edits detected)
- `.claude/CLAUDE.md` only if installer-created banner present (impl detail)
- `.gemini/extensions/ai-engineering-harness/` tree if installer-created

### Never delete without explicit ownership signal

- `AGENTS.md` if it does not clearly reference `ai-engineering-harness`
- `opencode.json` — only strip harness plugin entry via JSON merge revert (future); v0.9.2 may skip `opencode.json` uninstall
- `.claude/settings.json` unless a future reversible merge cleanup is added

### Global uninstall

- Planned, not implemented in this step

### Global update

- Planned, not implemented in this step

## `.git/info/exclude` Block Cleanup

On `uninstall --scope project`:

1. If a harness delimited block exists in `.git/info/exclude`, remove the block.
2. Preserve unrelated lines.
3. If block is missing, print `SKIP .git/info/exclude`.

Preferred cleanup target for default private strategy.

## `.gitignore` Block Cleanup (only if explicitly created)

Same rules as exclude, but **only** when install used `--ignore-strategy gitignore`.

Do not remove `.gitignore` harness block if install only used `info-exclude`.

Dry-run prints would-remove lines for both.

## Version Pinning

`update --ref v0.9.2`:

1. Download tarball at ref
2. Re-run capability cache install with overwrite semantics
3. Re-run `install-runtime.js` equivalent for listed runtimes with overwrite semantics
4. Keep `.harness/` untouched

Default ref: current install ref if detectable, else `main` with warning.

## Dry Run

```bash
sh install.sh uninstall --runtime cursor --scope project --dry-run
sh install.sh update --runtime cursor --scope project --ref v0.9.2 --dry-run
```

Output:

- `WOULD REMOVE` / `WOULD KEEP` / `WOULD UPDATE` / `SKIP`

## Examples

**Uninstall Cursor from project:**

```bash
sh install.sh uninstall --runtime cursor --scope project --target . --yes
```

**Update Cursor rules from tag:**

```bash
sh install.sh update --runtime cursor --scope project --ref v0.9.2 --force --yes
```

**Uninstall global Gemini extension:**

```bash
sh install.sh uninstall --runtime gemini --scope global --yes
```

## Related Docs

- [install-command-model.md](install-command-model.md)
- [git-hygiene-policy.md](git-hygiene-policy.md)
- [installer-ux-v0.9.2-plan.md](installer-ux-v0.9.2-plan.md)
- [uninstall-usage.md](uninstall-usage.md)
- [update-usage.md](update-usage.md)
