# Runtime Native Install Audit

## Purpose

Audit the current `install-runtime.js` implementation **before** dogfooding or claiming any runtime mode is stable for adopters.

Step 5 delivered project `.harness/` init. A subsequent commit added runtime-native payloads earlier than the original step sequence. This document records what the code actually does, confidence levels, and what evidence is still required.

### Post-D2 patch (AGENTS.md ownership)

D1/D2 dogfood found `--init-harness` creating a minimal `AGENTS.md` before `generic`/`codex` runtime, causing runtime SKIP and skipping `runtime/bootstrap/AGENTS.project.md`. **Fixed:** `.harness/` init no longer writes `AGENTS.md`; `generic`/`codex` project runtime owns that bootstrap. Re-run or spot-check D1/D2 before stable claims.

## Current Implementation Summary

| Component | Role |
|---|---|
| [install.sh](../install.sh) | Runtime/scope selection, `.harness/` init, dispatches non-`manual` to `install-runtime.js` |
| [install-runtime.js](../install-runtime.js) | Writes files from [runtime/](../runtime/) only — **no** `exportPaths` / root pack copy |
| [runtime/](../runtime/) | Minimal payloads (rules, plugin JS, extension manifest, AGENTS snippets) |
| [install.js](../install.js) | **Manual fallback only** — copies installed surface to target root |

Automated tests cover file creation and dry-run for several paths. **Scenarios D1–D3** dogfood **generic**, **codex**, and **cursor (project)** in external repos. **No external dogfood reports yet** for Claude, Gemini, or OpenCode in real tools.

## Runtime Payload Inventory

| Path | Used by |
|---|---|
| `runtime/bootstrap/AGENTS.project.md` | codex, generic (project) |
| `runtime/bootstrap/AGENTS.global.codex.md` | codex (global) |
| `runtime/cursor/rules/ai-engineering-harness.mdc` | cursor, windsurf (alias) |
| `runtime/claude/CLAUDE.project.md` | claude (project) |
| `runtime/claude/CLAUDE.global.md` | claude (global) |
| `runtime/claude/settings.project.fragment.json` | claude (merge into settings.json) |
| `runtime/gemini/gemini-extension.json` | gemini |
| `runtime/gemini/GEMINI.md` | gemini |
| `runtime/opencode/plugins/ai-engineering-harness.js` | opencode |
| `.claude-plugin/plugin.json` (pack root) | **Not** copied by installer — future marketplace packaging |

## Runtime Support Status

| Runtime | Implemented path(s) | Scope support | Confidence | Dogfood status | Stable claim allowed? |
|---|---|---|---|---|---|
| **manual** | `install.js` → root copy | target only | High (Scenario C) | Dogfooded (one-line) | **No** (fallback only) |
| **generic** | `AGENTS.md` bootstrap | project | High | **D1 completed** ([scenario-d1-generic-project.md](pack-dogfood-reports/scenario-d1-generic-project.md)) — experimental PASS | **No** |
| **codex** | `AGENTS.md` or `~/.codex/AGENTS.md` | project, global | High (file/install); manual CLI **BLOCKED** (usage limit) | **D2 completed** ([scenario-d2-codex-project.md](pack-dogfood-reports/scenario-d2-codex-project.md)) — experimental PASS | **No** |
| **cursor** | `.cursor/rules/ai-engineering-harness.mdc` | project, global | High (file/install); manual IDE **not run** | **D3 completed** ([scenario-d3-cursor-project.md](pack-dogfood-reports/scenario-d3-cursor-project.md)) — experimental PASS; `--profile-only` fails without `AGENTS.md` | **No** |
| **windsurf** | Same as cursor (`--runtime windsurf` alias) | project, global | Medium (alias only) | Not dogfooded | **No** |
| **opencode** | `.opencode/plugins/*.js`, `opencode.json` | project, global | Medium (OpenCode plugin docs; plugin is minimal console bootstrap) | Not dogfooded | **No** |
| **gemini** | `~/.gemini/extensions/...` or `<repo>/.gemini/extensions/...` | project, global | **Low–Medium** (project path is best-effort) | Not dogfooded | **No** |
| **claude** | `.claude/CLAUDE.md`, merge `settings.json` | project, global | Medium (settings merge + marketplace hint; full plugin bundle not installed) | Not dogfooded | **No** |
| **all** | Sequential: opencode → cursor → claude → codex → gemini → generic | project or global | Low for combined | Not dogfooded | **No** |
| **harness init** | `.harness/*` via `install.sh` | project only | High (unit tests) | Partial (automated only) | **No** (structural scaffold only) |

**Rule:** Until a runtime has a dogfood report with evidence, treat it as **implemented but not stable**.

## Verified vs Best-Effort

| Category | Runtimes / behaviors |
|---|---|
| **Verified (code + docs alignment)** | No root `commands/`/`skills/` copy from `install-runtime.js`; global `.harness` rejected; payload files exist under `runtime/` |
| **Best-effort (needs tool dogfood)** | cursor, windsurf, opencode, claude, gemini, codex, generic, `all` |
| **Dogfooded fallback** | `manual` one-line install (bulk copy) — not the v1 target UX |

## Known Risks

1. **Codex / generic project `AGENTS.md`:** Runtime writes `AGENTS.project.md` when missing; SKIP unless `--force` if team `AGENTS.md` already exists (init no longer blocks runtime).
2. **Claude `settings.json` merge:** Deep-merge only; conflicting keys are not resolved intelligently; marketplace plugin is **not** installed automatically.
3. **Gemini project extension path:** Official docs emphasize `~/.gemini/extensions`; repo-local `.gemini/extensions/` may not load — installer prints `gemini extensions install` as fallback.
4. **Cursor global:** Writes `~/.cursor/rules/` if home dir exists; Cursor User Rules in app UI may still be separate.
5. **`all` runtime:** Multiple `AGENTS.md` / config writes in one target; order is fixed in `ALL_RUNTIMES` — review for redundancy.
6. **Overclaim in README/marketing:** Must say **experimental** until per-runtime dogfood passes.
7. **Profile validation vs Cursor-only install:** `validate.js --profile-only` requires `AGENTS.md`; Cursor project mode does not create it (D3). Needs runtime-aware validation or documented exception — not a Cursor install bug.

## Runtime-by-Runtime Audit

### Claude

| Scope | Write paths | Behavior |
|---|---|---|
| **global** | `~/.claude/CLAUDE.md`, `~/.claude/settings.json` (merge `extraKnownMarketplaces`) | Creates/updates; merge UPDATE if exists |
| **project** | `<target>/.claude/CLAUDE.md`, `<target>/.claude/settings.json` | Same merge behavior |

**Settings merge:** Reads [runtime/claude/settings.project.fragment.json](../runtime/claude/settings.project.fragment.json) — registers GitHub marketplace `ai-engineering-harness` → `truongnat/ai-engineering-harness`.

**Next command printed:**

```txt
/plugin install ai-engineering-harness@ai-engineering-harness
```

**Gaps:** No bundled skills/commands in plugin install; `.claude-plugin/plugin.json` at pack root is not deployed by installer.

### Cursor / Windsurf

| Scope | Write paths |
|---|---|
| **global** | `~/.cursor/rules/ai-engineering-harness.mdc` |
| **project** | `<target>/.cursor/rules/ai-engineering-harness.mdc` |

**Windsurf:** `--runtime windsurf` resolves to cursor installer ([install-runtime.js](../install-runtime.js) `RUNTIME_ALIASES`). Interactive menu option 3 is labeled **Cursor / Windsurf**. No separate Windsurf payload.

**Payload:** `alwaysApply: true` rule pointing agents at `.harness/`.

### Codex

| Scope | Write paths |
|---|---|
| **global** | `~/.codex/AGENTS.md` from `AGENTS.global.codex.md` |
| **project** | `<target>/AGENTS.md` from `AGENTS.project.md` |

**Risk:** Overwrites only when `--force`; otherwise SKIP leaves existing file without harness headings.

### Gemini

| Scope | Write paths |
|---|---|
| **global** | `~/.gemini/extensions/ai-engineering-harness/gemini-extension.json`, `GEMINI.md` |
| **project** | `<target>/.gemini/extensions/ai-engineering-harness/` (same files) |

**Best-effort:** Project-local extension directory is **not** fully verified against Gemini CLI docs (global install is documented).

**Next (project):** `gemini extensions install https://github.com/truongnat/ai-engineering-harness`

### OpenCode

| Scope | Write paths |
|---|---|
| **global** | `~/.config/opencode/plugins/ai-engineering-harness.js`, `~/.config/opencode/opencode.json` |
| **project** | `<target>/.opencode/plugins/ai-engineering-harness.js`, `<target>/opencode.json` |

**Plugin:** Session-created console log only — does not load pack `skills/` tree.

**Note:** `opencode.json` merge adds `$schema` only; local plugin dir load does not require npm `plugin` array entry per OpenCode docs.

### Generic

| Scope | Behavior |
|---|---|
| **project** | Same as Codex project (`AGENTS.md` bootstrap) |
| **global** | SKIP with message to use `codex` runtime |

### All

**Order** (in `install-runtime.js` `ALL_RUNTIMES`): `opencode` → `cursor` → `claude` → `codex` → `gemini` → `generic`.

**Conflict risk:** `codex` and `generic` both target `AGENTS.md`; second may SKIP if first created file. `claude` + `codex` both touch agent instruction surfaces — intentional overlap for different tools.

## Scope Behavior Audit

| Rule | Status |
|---|---|
| Global install does not create `.harness/` | Enforced in `install.sh` |
| Project `--init-harness` creates `.harness/` only | Enforced |
| `manual` ignores scope in plan text | OK |
| Non-interactive requires `--scope` (except `all` defaults to project) | OK |

## Project State Audit

`.harness/` init is **separate** from runtime install and is the only supported project-state mechanism. Runtime installs must not create shared global `.harness/`.

## Root Pollution Audit

| Check | Result |
|---|---|
| `install-runtime.js` references `commands/`, `skills/`, `workflows/` copy | **None** |
| `manual` still copies root surface | Yes — documented fallback |
| Runtime install creates `docs/` at product root | **No** |

## Required Dogfood Before Stable

Per runtime, capture in [pack-dogfood-reports/](pack-dogfood-reports/) (new scenario files):

1. Command used (dry-run + write)
2. Files on disk (listing)
3. Tool observes harness behavior (pass/fail/unknown)
4. `node validate.js --target … --profile-only` when applicable
5. Rollback steps

See [runtime-native-install-dogfood-plan.md](runtime-native-install-dogfood-plan.md).

## Release Impact

- **v0.9.x:** May ship **experimental** runtime install with audit + dogfood plan; do not freeze as v1 contract.
- **v1.0.0:** Runtime modes need per-runtime dogfood PASS and honest matrix update in [runtime-install-matrix-research.md](runtime-install-matrix-research.md).
