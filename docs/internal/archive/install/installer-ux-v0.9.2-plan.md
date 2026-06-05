# v0.9.2 Installer UX and Git Hygiene Plan

## Purpose

Address **real install feedback** after `v0.9.1` Cursor dogfood: Git dirty state, unclear `.harness/` commit policy, missing Antigravity, and installer complexity. This milestone is **Installer UX + Git Hygiene** — design first, then phased implementation.

**Do not** widen `v0.9.1` promotion until `v0.9.2` ships these UX fixes.

## Real Install Feedback

Observed after installing into a real product repo with Cursor (project scope):

| Issue | Evidence |
|---|---|
| `.harness/` not local-ignored | `init_harness_profile()` creates skeleton only; no exclude logic ([harness-init-usage.md](harness-init-usage.md)) |
| Runtime files dirty Git | `.cursor/rules/ai-engineering-harness.mdc` — correct write; wrong if user wanted **private checkout** install |
| `.gitignore` as default ignore | **Rejected** — `.gitignore` is tracked; editing it creates repo change; use `.git/info/exclude` for private mode |
| Antigravity missing | [install.sh](../install.sh) supports `claude`, `codex`, `cursor`, `windsurf`, `gemini`, `opencode`, `generic`, `all`, `manual` — no `antigravity` |
| Install too complex | Runtime/scope picker exists but no single wizard, multi-provider, visibility, uninstall, or update |
| Uninstall/update missing | No verb model; users cannot cleanly remove or refresh harness files |

User expectation:

> One command → pick provider(s) → global vs project → shared vs private → clean Git unless team-shared.

## Problems To Fix

1. **Git hygiene** — shared vs private; private → **`.git/info/exclude`** first; `.gitignore` only explicit ([git-hygiene-policy.md](git-hygiene-policy.md)).
2. **Command model** — `install` / `uninstall` / `update` ([install-command-model.md](install-command-model.md)).
3. **Provider multi-select** — comma-separated and interactive checkboxes.
4. **Scope + visibility** — global vs project; shared vs private; smart `--scope auto` where safe.
5. **Antigravity** — research done; implement only after path verification ([antigravity-provider-research.md](antigravity-provider-research.md)).
6. **Documentation** — stop implying installer is complete for “wide promotion.”

## Target UX

### One command entry

```bash
curl -fsSL https://raw.githubusercontent.com/truongnat/ai-engineering-harness/main/install.sh | sh
```

No args → **install wizard** (not silent manual fallback without warning).

### Interactive flow (target)

```txt
AI Engineering Harness

Detected:
  ✓ Cursor (project)
  ✓ Git repository
  ✓ No .harness found

Choose provider(s):
  [x] Cursor
  [ ] Claude
  [ ] Codex
  [ ] Gemini
  [ ] OpenCode
  [ ] Antigravity (planned)
  [ ] Generic

Harness files in this repo?
  1) Private to this checkout — use .git/info/exclude (no tracked ignore change)
  2) Shared with team — show in git status; may commit
  3) Global runtime only — no project harness paths

Install scope:
  1) Global
  2) Project

Initialize .harness?
  1) Yes
  2) No
```

### Non-interactive

```bash
sh install.sh install --runtime cursor,generic --scope project --visibility private --ignore-strategy info-exclude --init-harness --yes
sh install.sh uninstall --runtime cursor --scope project --yes
sh install.sh update --runtime cursor --scope project --ref v0.9.2 --yes
```

## Commands

| Verb | Purpose |
|---|---|
| `install` | Install or refresh harness payloads |
| `uninstall` | Remove harness-owned files ([uninstall-update-design.md](uninstall-update-design.md)) |
| `update` | Pull pack ref and overwrite (with skip/force rules) |

Legacy: `install.sh --runtime cursor ...` → `install.sh install --runtime cursor ...`

## Provider Selection

- Multi-runtime in one invocation: `--runtime cursor,claude`
- Wizard: multi-select; run installs in deterministic order (generic last if combined with AGENTS bootstrap — document order).
- `antigravity`: listed when implemented; until then wizard shows **planned** and docs link to research.

## Scope Selection

| Mode | Behavior |
|---|---|
| `global` | Home-dir runtime config only; no `.harness/` init |
| `project` | Repo paths + optional `--init-harness` |
| `auto` | Detect Git repo + flags; fail closed in CI without `--scope` |

## Project Visibility

| Value | Git |
|---|---|
| `shared` | No exclude/gitignore edits; files visible in `git status` |
| `private` | Prefer `.git/info/exclude` delimited block — **not** `.gitignore` by default |

See [git-hygiene-policy.md](git-hygiene-policy.md).

## Git Hygiene

Implementation order **#1** — **Private project ignore via `.git/info/exclude`**:

- `append_info_exclude_block()` in shell (no new npm deps)
- Only paths for installed runtimes; delimited `# ai-engineering-harness start` … `end`
- Requires `--visibility private` + `--ignore-strategy info-exclude` (or interactive private + `auto`)
- **Never** edit `.gitignore` by default
- Global install: never touch project `.git/info/exclude` or `.gitignore`

Expected after Step 1:

```bash
sh install.sh install --runtime cursor --scope project --visibility private --ignore-strategy info-exclude --init-harness --yes
```

→ exclude block written → `.mdc` + `.harness/` installed → `git status` clean for generated paths.

## Step 2 — Provider-Agnostic Capability Cache + Runtime Bootstrap Switch

**Problem:** Runtime-native install only wrote provider entrypoint + `.harness/` skeleton. Every provider lacked local `commands/`, `skills/`, `workflows/`.

**Fix:** Install capability surface under `.ai-harness/` via [install-cache.js](../install-cache.js). Each runtime entrypoint (Cursor, Claude, Codex/Generic, Gemini, OpenCode) points at `.ai-harness/` + `.harness/`. Do **not** copy pack dirs to product repo root.

| Piece | Role |
|---|---|
| `.ai-harness/` | Capability source (all providers) |
| `.harness/` | Project state |
| Runtime entrypoint | Provider adapter only |

Default: **all project runtime-native** installs cache. Global/manual: no project cache. Use `--no-install-cache` to opt out.

Private exclude also lists `.ai-harness/` when cache is on.

Docs: [private-capability-cache.md](private-capability-cache.md).

Recommended command:

```bash
sh install.sh install --runtime cursor --scope project --visibility private --init-harness --yes
```

(`--install-cache` is optional — on by default for private project.)

## Uninstall

Implementation order **#5** (after install verb + visibility):

- Known path list per runtime
- Optional `.git/info/exclude` block cleanup; `.gitignore` block only if installer created it (`gitignore` strategy)
- Dry-run first

## Update

Implementation order **#6**:

- `--ref` tarball + re-run runtime install with `--force` optional

## Antigravity Support

- **v0.9.2 design:** research doc only; runtime **planned**
- **Implementation:** after Cursor/git hygiene; dogfood as D7
- Paths: `.agents/rules/` project, `~/.gemini/` global — **not** Cursor `.mdc`

## Migration From v0.9.1

| v0.9.1 | v0.9.2 |
|---|---|
| `install.sh --runtime X` | `install.sh install --runtime X` (alias kept) |
| No visibility flag | `--visibility private\|shared` |
| Git dirty by default | Private → info-exclude; shared → visible in status |
| No uninstall | `uninstall` verb |
| Tag `v0.9.1` | Remains experimental; use `v0.9.2` after UX ship |

Existing installs: re-run `install` with `--visibility private --ignore-strategy info-exclude`; or `uninstall` then reinstall.

## Implementation Order (strict)

Do **not** implement everything at once:

1. **Git hygiene** — `.git/info/exclude` for private project install (**Step 1** — done)
2. **Private capability cache** — `.ai-harness/` install (**Step 2** — done)
3. **`install.sh` command model** — `install` / `uninstall` / `update` verbs + backward compat
4. **Provider multi-select** (comma + wizard)
5. **Project private/shared** (`--visibility`) — partial (flags exist)
6. **Uninstall**
7. **Update**
8. **Antigravity** — only if docs/paths verified + D7 dogfood

## Definition Of Done (v0.9.2 release)

- [ ] Design docs merged (this plan, git hygiene, command model, uninstall/update, Antigravity research)
- [ ] Private install adds `.git/info/exclude` block (default); `.gitignore` only with explicit strategy
- [ ] Shared install does not modify exclude or `.gitignore`
- [ ] `.gitignore` never edited by default
- [ ] `install` / `uninstall` / `update` verbs work with tests
- [ ] Multi-runtime `--runtime a,b` works for implemented runtimes
- [ ] README/plugin-install-ux state experimental; no stable claim
- [ ] Dogfood at least one real repo: Cursor private + shared paths
- [ ] Antigravity: implemented **or** explicitly “planned” in wizard with no false writes
- [ ] `node validate.js` + `npm test` pass

## Related Docs

- [git-hygiene-policy.md](git-hygiene-policy.md)
- [install-command-model.md](install-command-model.md)
- [uninstall-update-design.md](uninstall-update-design.md)
- [antigravity-provider-research.md](antigravity-provider-research.md)
- [v0.9.x-readiness.md](v0.9.x-readiness.md)
- [pack-dogfood-follow-up-backlog.md](pack-dogfood-follow-up-backlog.md)
