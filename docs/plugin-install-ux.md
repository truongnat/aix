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

The **final** consumer UX is **not** “copy the capability pack into the product repo root.”

Target flow (design only until implemented):

1. Choose **runtime** (Claude, Codex, Cursor, Gemini, OpenCode, generic, all, or manual fallback)
2. Choose **scope** (global vs project)
3. Install into **runtime-correct locations** only
4. Create **project-local** `.harness/` only for project scope or explicit init

See:

- [runtime-install-matrix-research.md](runtime-install-matrix-research.md)
- [interactive-installer-design.md](interactive-installer-design.md)
- [project-state-policy.md](project-state-policy.md)

## Installer Status (v0.9.x)

**Runtime-native installer exists.** All primary runtimes are **experimental** (file/install dogfooded; **stable support: No**). See [runtime-dogfood-summary.md](runtime-dogfood-summary.md).

Recommended consumer path:

```bash
sh install.sh --runtime <name> --scope project --init-harness --yes
node validate.js --target <repo> --runtime <name> --profile-only   # from source pack
```

- `<name>`: `generic`, `codex`, `cursor`, `windsurf`, `opencode`, `gemini`, `claude`
- **Manual fallback** (`manual` / default `curl | sh` without flags): root copy only — [scenario-c-one-line-installer.md](pack-dogfood-reports/scenario-c-one-line-installer.md)

[install.sh](../install.sh) + [install-runtime.js](../install-runtime.js) install **per runtime** without copying `commands/`, `skills/`, etc. to the product root. See [runtime-native-install.md](runtime-native-install.md).

| Capability | Status |
|---|---|
| `manual` / `--legacy-root` | **Implemented** — root copy via `install.js`; dogfooded (Scenario C); **fallback only** |
| `.harness/` init (`--init-harness`) | **Implemented** — project scope; automated tests |
| Runtime-native modes | **Experimental PASS** (D1–D6 file/install) — [runtime-dogfood-summary.md](runtime-dogfood-summary.md); stable **No** until manual runtime checks |
| `generic` + `project` + `--init-harness` | **experimental PASS** (Scenario D1) — [scenario-d1-generic-project.md](pack-dogfood-reports/scenario-d1-generic-project.md) |
| `codex` + `project` + `--init-harness` | **experimental PASS** (Scenario D2) — [scenario-d2-codex-project.md](pack-dogfood-reports/scenario-d2-codex-project.md) |
| `cursor` + `project` + `--init-harness` | **experimental PASS** (Scenario D3) — [scenario-d3-cursor-project.md](pack-dogfood-reports/scenario-d3-cursor-project.md); validate with `node validate.js --target <repo> --runtime cursor --profile-only` |
| `opencode` + `project` + `--init-harness` | **experimental PASS** (Scenario D4) — [scenario-d4-opencode-project.md](pack-dogfood-reports/scenario-d4-opencode-project.md); validate with `node validate.js --target <repo> --runtime opencode --profile-only` |
| `gemini` + `project` or `global` | **experimental PASS** (Scenario D5) — [scenario-d5-gemini.md](pack-dogfood-reports/scenario-d5-gemini.md); project validate with `--runtime gemini`; global extension path preferred for CLI load |
| `claude` + `project` (global dry-run only in D6) | **experimental PASS** (Scenario D6) — [scenario-d6-claude.md](pack-dogfood-reports/scenario-d6-claude.md); validate with `--runtime claude`; manual `/plugin install` required |

Do **not** treat runtime-native modes as **stable** until manual session evidence exists per [runtime-dogfood-summary.md](runtime-dogfood-summary.md).

## Supported User Flows

**Recommended:** runtime-native install + `--init-harness` for project state — see [install-sh-usage.md](install-sh-usage.md), [harness-init-usage.md](harness-init-usage.md), [runtime-aware-validation.md](runtime-aware-validation.md).

Piping `curl | sh` without flags still defaults to **manual** fallback (with a warning). That is **not** the recommended default.

### Project install (default target = cwd) — interim bulk copy

```bash
curl -fsSL https://raw.githubusercontent.com/truongnat/ai-engineering-harness/main/install.sh | sh
```

Copies the harness installed surface into the current directory (legacy behavior). Prefer runtime-native install once available.

### Explicit target install

```bash
curl -fsSL https://raw.githubusercontent.com/truongnat/ai-engineering-harness/main/install.sh | sh -s -- --target ../my-project
```

### Dry run

```bash
curl -fsSL https://raw.githubusercontent.com/truongnat/ai-engineering-harness/main/install.sh | sh -s -- --dry-run
```

### Force overwrite

```bash
curl -fsSL https://raw.githubusercontent.com/truongnat/ai-engineering-harness/main/install.sh | sh -s -- --target . --force
```

### Global CLI install (planned)

```bash
curl -fsSL https://raw.githubusercontent.com/truongnat/ai-engineering-harness/main/install.sh | sh -s -- --global
ai-harness install --target .
ai-harness validate --target . --profile-only
```

See [one-line-installer-design.md](one-line-installer-design.md).

## Runtime-native Install (planned)

Per-runtime install modes (implementation after research):

| Step | Runtime |
|---|---|
| 3B | Claude Code (plugin / marketplace) |
| 3C | Cursor (rules / plugin) |
| 3D | OpenCode (`opencode.json` + plugin entry) |
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
