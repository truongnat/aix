<div align="center">

# AI Engineering Harness

### A lightweight, markdown-first workflow kit for AI coding agents

![Version](https://img.shields.io/badge/version-v0.11.0-2563eb)
![CI](https://github.com/truongnat/ai-engineering-harness/actions/workflows/ci.yml/badge.svg)
![License](https://img.shields.io/badge/license-MIT-16a34a)
![Markdown First](https://img.shields.io/badge/markdown-first-7c3aed)
![Landing Page](https://img.shields.io/badge/site-truongnat.github.io-818cf8)

Give your repo a repeatable engineering loop — plan, build, verify, ship, and remember — using markdown contracts, command docs, skills, and quality gates instead of scattering workflow files at the project root.

Every workflow begins with **Session Start**: a boot sequence that loads active session, memory, blocked state, and next allowed command. See [docs/session-start.md](docs/session-start.md).

[Quickstart](#quickstart) · [Demo](#demo) · [Why](#why) · [Providers](#providers) · [Commands](#commands) · [Landing Page](https://truongnat.github.io/ai-engineering-harness/)

</div>

---

## Why

**In 10 seconds:** AI coding agents are good at editing code, but they often skip engineering discipline: unclear goals, weak plans, optimistic verification, and forgotten context. `ai-engineering-harness` installs a lightweight workflow contract so agents follow a repeatable loop: **plan, build, verify, ship, and remember**.

You get a private capability cache (`.ai-harness/`), project workflow state (`.harness/`), and provider-native entrypoints (Cursor rules, Claude commands, and similar) — not a runtime platform or universal plugin system.

The harness learns from stronger systems such as Superpowers and GSD, but keeps only the parts that fit a lightweight markdown-first pack: better discussion discipline, smaller plans, clearer verification states, and explicit review or human-check gates.

> [!IMPORTANT]
> **v0.11.0 is experimental.** Per-provider behavior is still being validated. The install wizard lets you **choose** providers; detection only recommends.

---

## Quickstart {#quickstart}

Inside your target project:

```bash
npx ai-engineering-harness install
npx ai-engineering-harness status
npx ai-engineering-harness doctor
```

Non-interactive:

```bash
npx ai-engineering-harness install --provider cursor --yes
```

Wizard UX details: [docs/terminal-wizard-ux.md](docs/terminal-wizard-ux.md), [docs/npx-cli-ux.md](docs/npx-cli-ux.md).

---

## The loop

```text
Plan → Build → Verify → Ship → Remember
```

| Phase | Canonical command ID | Typical artifact |
|-------|----------------------|------------------|
| Plan | `harness-map`, `harness-start`, `harness-discuss`, `harness-plan` | `.harness/GOAL.md`, `PLAN.md` |
| Build | `harness-run` | implementation work |
| Verify | `harness-verify` | `.harness/VERIFY.md` |
| Ship | `harness-ship` | `.harness/SHIP.md` |
| Remember | `harness-remember` | `.harness/REMEMBER.md` |

Native slash commands are provider-specific. Today the concrete local example is Claude project command files exposing `/harness-plan`; elsewhere use the hyphen form via rules, AGENTS.md, or `.ai-harness/runtime-commands/`. Deprecated: legacy colon-separated command IDs in older docs and changelogs.

Command policy (artifacts first): [docs/harness-command-behavior.md](docs/harness-command-behavior.md). Provider matrix: [docs/provider-command-matrix.md](docs/provider-command-matrix.md). Guardrails: [docs/command-guardrails.md](docs/command-guardrails.md). Workflow map: [docs/workflow-visualization.md](docs/workflow-visualization.md).
Dispatch templates: [docs/dispatch-prompt-templates.md](docs/dispatch-prompt-templates.md). Delegated workers: [docs/delegated-workers.md](docs/delegated-workers.md).

---

## Demo {#demo}

End-to-end **workflow-artifact dogfood** (not a full provider install walkthrough): [examples/dogfood-tiny-node-api](examples/dogfood-tiny-node-api).

```bash
git clone https://github.com/truongnat/ai-engineering-harness.git
cd ai-engineering-harness
npm test
cd examples/dogfood-tiny-node-api
npm test
```

The example includes `.harness/GOAL.md`, `PLAN.md`, `VERIFY.md`, `SHIP.md`, and `REMEMBER.md` with real test evidence in [VERIFY.md](examples/dogfood-tiny-node-api/.harness/VERIFY.md).

---

## Providers {#providers}

| Provider | Status | Notes |
|----------|--------|-------|
| Claude Code | **Primary** | Recommended path for dogfooding and polish |
| Cursor | **Secondary** | Plugin-ready packaging; rules fallback until marketplace publish |
| Codex | Experimental | Plugin via `/plugins` when published; project install = AGENTS.md — [codex-plugin-support.md](docs/codex-plugin-support.md) |
| Gemini | Experimental | `gemini extensions install`; extension context |
| OpenCode | **Out of scope** | Not part of v0.11.0 active support; legacy cleanup via `aih.sh uninstall --runtime opencode` |

Research and native surfaces: [docs/provider-native-command-research.md](docs/provider-native-command-research.md), [docs/runtime-command-surface.md](docs/runtime-command-surface.md).

---

## Commands {#commands}

| Command | Purpose |
|---------|---------|
| `npx ai-engineering-harness install` | Interactive wizard → install into project |
| `npx ai-engineering-harness status` | Local install summary |
| `npx ai-engineering-harness doctor` | Readiness checks |
| `npx ai-engineering-harness update` | Refresh cache and entrypoints |
| `npx ai-engineering-harness uninstall` | Remove entrypoints (optional full cleanup) |

Aliases: `npx aih install`, `aih install` (after global install or link).

---

## What gets installed

| Path | Role |
|------|------|
| `.ai-harness/` | Capability cache (`commands/`, `prompt-templates/`, `skills/`, workflows, templates) |
| `.harness/` | Project state (goals, memory, gates) |
| Provider entrypoint | e.g. `.cursor/rules/ai-engineering-harness.mdc` |
| `.git/info/exclude` | Private mode only — local ignore block (not `.gitignore`) |

Root `commands/`, `skills/`, `workflows/`, and `templates/` are **not** copied to the project root. Details: [docs/private-capability-cache.md](docs/private-capability-cache.md).

---

## Known limitations

- **Slash commands vary by provider** — native `/harness-*` paths exist only where documented; otherwise use hyphen-form IDs and the local catalog.
- **Shell installer is not fully cross-platform** — `aih.sh` expects POSIX `sh`; on Windows prefer `npx ai-engineering-harness install`.
- **Windows** may need [Git for Windows](https://git-scm.com/download/win) or WSL for shell fallbacks.
- **Experimental providers** — Codex and Gemini are validating; Claude and Cursor are the most exercised paths.

---

## Why not a framework?

This kit is **not** an agent framework, orchestrator, harness OS, or stable universal plugin system. There is no long-running service or runtime that owns sessions, tools, and routing. You get markdown artifacts, a small installer, and provider-native hooks where each agent already supports them.

If you need one runtime to orchestrate everything, use a framework. If you want shared **plan → verify → ship** discipline inside repos you already work in, use this pack.

---

## Docs

| Topic | Doc |
|-------|-----|
| NPX / wizard | [docs/npx-cli-ux.md](docs/npx-cli-ux.md), [docs/terminal-wizard-ux.md](docs/terminal-wizard-ux.md) |
| Slash / runtime commands | [docs/runtime-command-surface.md](docs/runtime-command-surface.md) |
| Command behavior | [docs/harness-command-behavior.md](docs/harness-command-behavior.md) |
| Guardrails | [docs/command-guardrails.md](docs/command-guardrails.md), [docs/workflow-visualization.md](docs/workflow-visualization.md) |
| Dispatch templates | [docs/dispatch-prompt-templates.md](docs/dispatch-prompt-templates.md) |
| Tool discovery | [docs/tool-discovery-and-routing.md](docs/tool-discovery-and-routing.md) |
| Distillation choices | [docs/distillation-superpowers-gsd.md](docs/distillation-superpowers-gsd.md), [docs/forensics-lite.md](docs/forensics-lite.md) |
| Capability cache | [docs/private-capability-cache.md](docs/private-capability-cache.md) |
| v0.11.0 release | [docs/v0.11.0-release-notes.md](docs/v0.11.0-release-notes.md) |
| Dogfood example | [examples/dogfood-tiny-node-api](examples/dogfood-tiny-node-api) |
| Shell fallback | [docs/simple-cli-ux.md](docs/simple-cli-ux.md) |
| Publish | [docs/npm-publish.md](docs/npm-publish.md) |

---

## Shell fallback

For CI, air-gapped, or no Node:

```bash
sh aih.sh install --runtime cursor --scope project --visibility private --yes
```

```bash
curl -fsSL https://raw.githubusercontent.com/truongnat/ai-engineering-harness/main/aih.sh | sh -s -- install --runtime cursor --yes
```

- `install.sh` — compatibility wrapper around `aih.sh`
- `aih.ps1` — experimental Windows bootstrap (requires Git Bash / WSL for `sh`)

Prefer `npx ai-engineering-harness install` on Windows when Node is available.

---

## Maintainers

```bash
git clone https://github.com/truongnat/ai-engineering-harness.git
cd ai-engineering-harness
node validate.js
npm test
```

Publish: [docs/npm-publish.md](docs/npm-publish.md)

---

## Status

- **v0.11.0 (experimental)** — [release notes](docs/v0.11.0-release-notes.md)
- Primary UX: `npx ai-engineering-harness install`
- Stable per-provider guarantees: **no** (validation in progress)

MIT · [CONTRIBUTING.md](CONTRIBUTING.md) · [SECURITY.md](SECURITY.md)
