# Plugin Install UX

## Purpose

Define the consumer installation experience `ai-engineering-harness` should provide—plugin/superpower style—not an internal SDK clone workflow.

## Why Local Clone Is Not Enough

Today many docs show:

```bash
git clone ai-engineering-harness
cd ai-engineering-harness
node install.js --target ../my-project
```

That is valid for **maintainers** and contributors. It is **not** the desired default for product teams adopting the pack because it:

- requires understanding source pack vs target repo
- forces two repositories in the mental model
- feels like an SDK checkout, not a plugin install
- blocks one-command adoption in CI or fresh machines

Core assets (`AGENTS.md`, commands, skills, `.harness/` contract, `validate.js` behavior) remain sound. The gap is **installation/adoption UX**.

## Plugin-like Install Target

Consumers should think:

```txt
install harness into my repo → init profile → validate → run agent loop
```

Not:

```txt
clone harness repo → cd into harness → point installer at my repo
```

## Target Direction: Interactive Runtime-native Installer

The **recommended** consumer UX is **not** “copy the capability pack into the product repo root.”

Target flow (**shipped in `v0.9.1`**, experimental):

1. Choose **runtime** (Claude, Cursor, Codex, Gemini, generic, or manual fallback — avoid `all` until dogfooded)
2. Choose **scope** (global vs project)
3. Install into **runtime-correct locations** only
4. Create **project-local** `.harness/` only for project scope or explicit init

See:

- [runtime-install-matrix-research.md](runtime-install-matrix-research.md)
- [interactive-installer-design.md](interactive-installer-design.md)
- [project-state-policy.md](project-state-policy.md)

## v0.9.2 Direction (Installer UX + Git Hygiene)

**Active milestone** — address real install feedback before wider promotion. Design: [installer-ux-v0.9.2-plan.md](installer-ux-v0.9.2-plan.md).

| Topic | v0.9.2 target |
|---|---|
| Install wizard | `@clack/prompts` terminal flow — [terminal-wizard-ux.md](terminal-wizard-ux.md); multi-provider; scope + shared/private |
| Git hygiene | Private → **`.git/info/exclude`** (not tracked); `.gitignore` only explicit — [git-hygiene-policy.md](git-hygiene-policy.md) |
| Commands | `install` / `uninstall` / `update` — [install-command-model.md](install-command-model.md) |
| Antigravity | Researched; **planned** until paths verified — [antigravity-provider-research.md](antigravity-provider-research.md) |

`v0.9.1` remains **experimental**; real Cursor install showed Git dirty state — `v0.9.2` fixes via `.git/info/exclude` for private mode (not default `.gitignore` edit).

## Installer Status (v0.9.x)

**Runtime-native installer exists (`v0.9.1` tag).** All primary runtimes are **experimental** (file/install dogfooded; **stable support: No**). See [runtime-dogfood-summary.md](runtime-dogfood-summary.md).

Recommended consumer path (v0.10.x — private project, capability cache, no git noise):

```bash
npx ai-engineering-harness install
```

Use provider-native paths where implemented — [provider-command-matrix.md](provider-command-matrix.md). Claude (primary): `/harness-plan`; Cursor: `/add-plugin` when published; Codex/Gemini: experimental; local catalog at `.ai-harness/runtime-commands/`.

Shell fallback:

```bash
sh aih.sh install --runtime cursor --scope project --visibility private --yes
```

Maintainers validate from source pack:

```bash
node validate.js --target <repo> --runtime <name> --profile-only
```

If the target repo does not expose a provider hint such as `.cursor/`, `.claude/`, or `.gemini/`, use an explicit runtime in non-interactive mode.

All **project** runtime-native installs **default** to `.ai-harness/` capability cache ([private-capability-cache.md](private-capability-cache.md)) — Claude, Cursor, Codex, Gemini, Generic. Each runtime entrypoint only adapts the provider; capabilities live under `.ai-harness/`, project state under `.harness/`.

Team-shared (files visible in `git status`):

```bash
sh aih.sh install --runtime <name> --scope project --visibility shared --init-harness --yes
```

- `<name>`: `generic`, `codex`, `cursor`, `gemini`, `claude`
- **Manual fallback** (`manual` / `--legacy-root`): root copy only — [scenario-c-one-line-installer.md](pack-dogfood-reports/scenario-c-one-line-installer.md)

[install.sh](../install.sh) + [install-runtime.js](../install-runtime.js) install **per runtime** without copying `commands/`, `skills/`, etc. to the product root. Capabilities live under **`.ai-harness/`** when cache is installed (private project default). See [runtime-native-install.md](runtime-native-install.md) and [private-capability-cache.md](private-capability-cache.md).

Uninstall examples:

```bash
sh aih.sh uninstall
sh aih.sh uninstall --runtime cursor --scope project --yes
sh aih.sh uninstall --runtime cursor --scope project --remove-cache --remove-state --yes
sh aih.sh uninstall --all
```

Update examples:

```bash
sh aih.sh update
sh aih.sh update --runtime cursor --scope project --ref v0.9.2 --yes
sh aih.sh update --runtime all --scope project --ref main --yes
```

| Capability | Status |
|---|---|
| `manual` / `--legacy-root` | **Implemented** — root copy via `install.js`; dogfooded (Scenario C); **fallback only** |
| `.harness/` init (`--init-harness`) | **Implemented** — project scope; automated tests |
| Runtime-native modes | **Experimental PASS** (D1–D6 file/install) — [runtime-dogfood-summary.md](runtime-dogfood-summary.md); stable **No** until manual runtime checks |
| `generic` + `project` + `--init-harness` | **experimental PASS** (Scenario D1) — [scenario-d1-generic-project.md](pack-dogfood-reports/scenario-d1-generic-project.md) |
| `codex` + `project` + `--init-harness` | **experimental PASS** (Scenario D2) — [scenario-d2-codex-project.md](pack-dogfood-reports/scenario-d2-codex-project.md) |
| `cursor` + `project` + `--init-harness` | **experimental PASS** (Scenario D3) — [scenario-d3-cursor-project.md](pack-dogfood-reports/scenario-d3-cursor-project.md); validate with `node validate.js --target <repo> --runtime cursor --profile-only` |
| OpenCode (removed v0.11.0) | Historical only — [scenario-d4-opencode-project.md](pack-dogfood-reports/scenario-d4-opencode-project.md); no longer an active install/validate runtime |
| `gemini` + `project` or `global` | **experimental PASS** (Scenario D5) — [scenario-d5-gemini.md](pack-dogfood-reports/scenario-d5-gemini.md); project validate with `--runtime gemini`; global extension path preferred for CLI load |
| `claude` + `project` (global dry-run only in D6) | **experimental PASS** (Scenario D6) — [scenario-d6-claude.md](pack-dogfood-reports/scenario-d6-claude.md); validate with `--runtime claude`; manual `/plugin install` required |

Do **not** treat runtime-native modes as **stable** until manual session evidence exists per [runtime-dogfood-summary.md](runtime-dogfood-summary.md).

## Supported User Flows

**Recommended:** runtime-native install + `--init-harness` for project state — see [install-sh-usage.md](install-sh-usage.md), [harness-init-usage.md](harness-init-usage.md), [runtime-aware-validation.md](runtime-aware-validation.md).

Piping `curl | sh` without flags on `aih.sh` now maps to `install`, using runtime detection or interactive provider selection. Manual fallback remains explicit only.

### Project install (default target = cwd)

```bash
curl -fsSL https://raw.githubusercontent.com/truongnat/ai-engineering-harness/main/aih.sh | sh -s -- install
```

Installs with runtime detection, project scope, private visibility, `.ai-harness/` capability cache, `.harness/` init when missing, and `.git/info/exclude` hygiene when applicable.

### Explicit target install

```bash
curl -fsSL https://raw.githubusercontent.com/truongnat/ai-engineering-harness/main/aih.sh | sh -s -- install --target ../my-project
```

### Dry run

```bash
curl -fsSL https://raw.githubusercontent.com/truongnat/ai-engineering-harness/main/aih.sh | sh -s -- install --dry-run
```

### Force overwrite

```bash
curl -fsSL https://raw.githubusercontent.com/truongnat/ai-engineering-harness/main/aih.sh | sh -s -- install --target . --force
```

### Global CLI install (planned)

```bash
curl -fsSL https://raw.githubusercontent.com/truongnat/ai-engineering-harness/main/aih.sh | sh -s -- install --scope global
ai-harness install --target .
ai-harness validate --target . --profile-only
```

`install.sh` remains available as a compatibility wrapper for existing commands. Long explicit commands are still supported for advanced/debug flows, but `aih.sh` is the primary UX.

See [one-line-installer-design.md](one-line-installer-design.md).

## Runtime-native Install (planned)

Per-runtime install modes (implementation after research):

| Step | Runtime |
|---|---|
| 3B | Claude Code (plugin / marketplace) |
| 3C | Cursor (rules / plugin) |
| ~~3D~~ | OpenCode removed from active scope (v0.11.0) |
| 3E | Gemini CLI (extension) |
| 3F | Codex (`AGENTS.md` bootstrap) |
| 3G | Generic `AGENTS.md` fallback |

`v0.10.0` may add runtime capability folder conventions; see [runtime-consumption-model.md](runtime-consumption-model.md).

## What This Does Not Mean

- not npm publish or marketplace (yet)
- not runtime adapters or MCP plugins
- not removing `install.js` or structural validation
- not merging source pack and target repo into one tree

## v1 Implications

`v1.0.0` should be **Stable Plugin-like Capability Pack**, not stable “clone source pack first.”

Contract freeze documents under `docs/frozen-*.md` are **pre-v1 candidates** until plugin install UX is implemented and dogfooded. See [stable-contract-index.md](stable-contract-index.md).

Manual clone remains documented for maintainers: [manual-packaging-guide.md](manual-packaging-guide.md), [consume-as-pack.md](consume-as-pack.md).
