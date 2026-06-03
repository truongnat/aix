<div align="center">

# ⚙️ ai-engineering-harness

### A lightweight, markdown-first workflow kit for AI coding agents

![Version](https://img.shields.io/badge/version-v0.11.0-2563eb)
![CI](https://github.com/truongnat/ai-engineering-harness/actions/workflows/ci.yml/badge.svg)
![License](https://img.shields.io/badge/license-MIT-16a34a)
![Markdown First](https://img.shields.io/badge/markdown-first-7c3aed)

**Plan → Build → Verify → Ship → Remember**

Install discipline into your repo with an interactive wizard — commands, skills, and `.harness/` state stay in a private capability cache, not scattered at the project root.

[Quickstart](#-quickstart) · [Demo](#demo) · [Providers](#provider-support) · [Commands](#-commands) · [Docs](#-docs)

</div>

---

## What is this?

`ai-engineering-harness` is a **lightweight, markdown-first workflow kit** for AI coding agents. It installs a local capability cache (`.ai-harness/`), project workflow state (`.harness/`), and provider-specific entrypoints (Cursor rules, Claude commands, etc.) so agents follow the same engineering loop without copying `commands/` and `skills/` into your repo root.

> [!IMPORTANT]
> **v0.11.0 is experimental.** Per-provider behavior is still being validated. The install wizard lets you **choose** providers — detection only recommends; it does not auto-install.

---

## Why not a framework?

This kit is **not** an agent framework, orchestrator, or “harness OS.” There is no long-running service, plugin runtime platform, or universal slash-command layer across every tool. You get markdown artifacts, a small installer, and provider-native hooks where each agent already supports them. If you need a single runtime that owns sessions, tools, and routing, use a framework; if you want shared **plan → verify → ship** discipline inside repos you already work in, use this pack.

---

## 🚀 Quickstart

Inside your target project:

```bash
npx ai-engineering-harness install
```

Verify:

```bash
npx ai-engineering-harness status
npx ai-engineering-harness doctor
```

Non-interactive:

```bash
npx ai-engineering-harness install --provider cursor --yes
```

The wizard uses [@clack/prompts](https://github.com/natemoo-re/clack) for a polished terminal flow (intro, multiselect, plan, spinner, outro). See [docs/terminal-wizard-ux.md](docs/terminal-wizard-ux.md) and [docs/npx-cli-ux.md](docs/npx-cli-ux.md).

## Demo

End-to-end **workflow-artifact dogfood** (not a full provider install demo): [examples/dogfood-tiny-node-api](examples/dogfood-tiny-node-api).

```bash
git clone https://github.com/truongnat/ai-engineering-harness.git
cd ai-engineering-harness
npm test
cd examples/dogfood-tiny-node-api
npm test
```

The example includes `.harness/GOAL.md`, `PLAN.md`, `VERIFY.md`, `SHIP.md`, and `REMEMBER.md`. [.harness/VERIFY.md](examples/dogfood-tiny-node-api/.harness/VERIFY.md) records real `npm test` evidence (`status: passed`). Optional terminal notes: [TRANSCRIPT.md](examples/dogfood-tiny-node-api/TRANSCRIPT.md).

## Provider support

Active scope (v0.11.0):

| Provider | Status | Notes |
|----------|--------|-------|
| Claude Code | **Primary** | Recommended path for dogfooding and polish |
| Cursor | **Secondary** | Plugin-ready packaging (`.cursor-plugin/`); rules fallback until marketplace publish |
| Codex | Experimental | Plugin via `/plugins` when published; project install = AGENTS.md fallback — [codex-plugin-support.md](docs/codex-plugin-support.md) |
| Gemini | Experimental | `gemini extensions install`; extension context |

**OpenCode is no longer part of the active provider scope** (v0.11.0). Historical releases may still mention OpenCode. Legacy cleanup: `aih.sh uninstall --runtime opencode`.

Command details: [docs/provider-command-matrix.md](docs/provider-command-matrix.md), [docs/provider-native-command-research.md](docs/provider-native-command-research.md).

Local catalog (always): `.ai-harness/runtime-commands/` — canonical `harness:plan`, not a universal `/harness:plan` slash in every UI.

## Known limitations

- **Slash commands differ by provider** — native `/harness-*` paths exist only where documented; elsewhere use canonical `harness:plan` via rules, AGENTS.md, or the local catalog.
- **Shell installer is not fully cross-platform** — `aih.sh` expects a POSIX `sh`; Windows users should prefer `npx ai-engineering-harness install`.
- **Windows** may need [Git for Windows](https://git-scm.com/download/win) (Git Bash) or WSL when using shell fallbacks.
- **Provider support is still validating** — Claude and Cursor are the most exercised paths; Codex and Gemini are experimental.

## Command behavior

Harness commands use **existing local artifacts first**. For example, `harness:discuss` summarizes and discusses `.harness/REVIEW.md` when present, instead of asking what to do next. Policy: [docs/harness-command-behavior.md](docs/harness-command-behavior.md).

---

## What gets installed

| Path | Role |
|------|------|
| `.ai-harness/` | Capability cache (`commands/`, `skills/`, workflows, templates) |
| `.harness/` | Project state (goals, memory, gates) |
| Provider entrypoint | e.g. `.cursor/rules/ai-engineering-harness.mdc` |
| `.git/info/exclude` | Private mode only — local ignore block (not `.gitignore`) |

Root `commands/`, `skills/`, `workflows/`, and `templates/` are **not** created at the project root.

---

## 🧰 Commands

| Command | Purpose |
|---------|---------|
| `npx ai-engineering-harness install` | Interactive wizard → install |
| `npx ai-engineering-harness status` | Local install summary |
| `npx ai-engineering-harness doctor` | Readiness checks |
| `npx ai-engineering-harness update` | Refresh cache + entrypoints |
| `npx ai-engineering-harness uninstall` | Remove entrypoints (optional full cleanup) |

Aliases: `npx aih install`, `aih install` (after global install/link).

---

## Release discipline

- **Wording-only doc edits** do not require a version bump.
- When releasing, keep **README badge**, `package.json`, `CHANGELOG`, and git tags aligned on the same version.
- Each versioned release should include **install verification** or a short **dogfood note** in release docs (what was actually run).

Current release: [v0.11.0 release notes](docs/v0.11.0-release-notes.md).

---

## 📚 Docs

| Topic | Doc |
|-------|-----|
| NPX wizard | [docs/npx-cli-ux.md](docs/npx-cli-ux.md) |
| Slash commands | [docs/runtime-command-surface.md](docs/runtime-command-surface.md) |
| v0.11.0 release | [docs/v0.11.0-release-notes.md](docs/v0.11.0-release-notes.md) |
| End-to-end dogfood | [examples/dogfood-tiny-node-api](examples/dogfood-tiny-node-api) |
| npm publish | [docs/npm-publish.md](docs/npm-publish.md) |
| Git hygiene | [docs/private-install-git-hygiene.md](docs/private-install-git-hygiene.md) |
| Capability cache | [docs/private-capability-cache.md](docs/private-capability-cache.md) |
| Shell fallback | [docs/simple-cli-ux.md](docs/simple-cli-ux.md) |

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
- `aih.ps1` — experimental Windows bootstrap (downloads `aih.sh`, requires Git Bash / WSL for `sh`)

Windows: prefer `npx ai-engineering-harness install`; if `sh` is missing, install [Git for Windows](https://git-scm.com/download/win) or use WSL.

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

- Current: **v0.11.0** (experimental) — [release notes](docs/v0.11.0-release-notes.md)
- Primary UX: `npx ai-engineering-harness install`
- Stable per-provider guarantees: **No** (validation in progress)

[CONTRIBUTING.md](CONTRIBUTING.md) · [SECURITY.md](SECURITY.md)
