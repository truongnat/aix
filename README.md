<div align="center">

# ⚙️ ai-engineering-harness

### Markdown-first engineering discipline for AI coding agents

![Version](https://img.shields.io/badge/version-v0.9.0-2563eb)
![License](https://img.shields.io/badge/license-MIT-16a34a)
![Validation](https://img.shields.io/badge/validation-passing-22c55e)
![Markdown First](https://img.shields.io/badge/markdown-first-7c3aed)
![Runtime Light](https://img.shields.io/badge/runtime-lightweight-f59e0b)

Plan. Build. Verify. Ship. Remember — with durable markdown artifacts.

</div>

`ai-engineering-harness` is a plugin-like markdown capability pack for AI coding agents. It helps agents load engineering discipline into an existing repository instead of improvising in a single prompt.

It can be installed or vendored into an existing repo. You do not use this repository as your product app repo.

See [TARGET.md](TARGET.md) for the long-term target.

## 🏗️ Harness Design System

`v0.2.0` focuses on project-specific harness profiles instead of only generic operating guidance.

- [TARGET.md](TARGET.md)
- [docs/harness-build-usage.md](docs/harness-build-usage.md)
- [docs/harness-build-prompts.md](docs/harness-build-prompts.md)
- [docs/target-repo-validation.md](docs/target-repo-validation.md)
- [docs/gap-analysis.md](docs/gap-analysis.md)
- [docs/system-positioning.md](docs/system-positioning.md)
- [docs/team-architecture-selection.md](docs/team-architecture-selection.md)
- [docs/memory-model.md](docs/memory-model.md)
- [docs/memory-safety.md](docs/memory-safety.md)
- [docs/sdlc-execution-model.md](docs/sdlc-execution-model.md)
- [docs/harness-build-contract.md](docs/harness-build-contract.md)
- [commands/harness-build.md](commands/harness-build.md)

## ✨ What It Is

- A markdown-first harness design system for AI-assisted engineering work
- A plugin-like capability pack that can be installed into an existing repository
- A portable operating model for planning, execution, verification, shipping, and memory
- A repo-friendly approach that works with Claude Code, Codex, Cursor, Gemini, OpenCode, or any agent that can read files

## 🚫 What It Is Not

- No framework
- No runtime platform
- No server or orchestration layer
- No database-backed memory system
- No heavy infrastructure hidden behind the docs

## 🧭 Why It Exists

- Agents lose context.
- Agents code before planning.
- Agents skip verification.
- Agents forget previous fixes.
- Agents need durable project-specific artifacts.

## 🔁 Core Loop

```txt
Map → Start → Discuss → Plan → Run → Verify → Ship → Remember
```

Start with [`commands/`](commands/) and treat the loop as the default operating path.

## 🧱 Core Model

| Layer | Purpose |
|---|---|
| Skills | capability |
| Memory | context |
| Workflows | process |
| Team Patterns | collaboration structure |
| Quality Gates | evidence discipline |
| Harness Profile | project-specific operating context |

## 🚀 Install

**Runtime-native installer: experimental** — dogfooded for `generic`, `codex`, `cursor`, `opencode`, `gemini`, `claude` (file/install). **Stable runtime support: not yet.** Summary: [runtime-dogfood-summary](docs/runtime-dogfood-summary.md) · [readiness](docs/v0.9.x-readiness.md) · [audit](docs/runtime-native-install-audit.md)

```bash
curl -fsSL https://raw.githubusercontent.com/truongnat/ai-engineering-harness/main/install.sh | sh -s -- \
  --runtime opencode --scope project --init-harness --yes
```

Validate from source pack: `node validate.js --target <repo> --runtime opencode --profile-only` ([runtime-aware-validation](docs/runtime-aware-validation.md)).

Runtimes: `claude`, `codex`, `cursor`, `windsurf`, `gemini`, `opencode`, `generic`. Avoid `--runtime all` until dogfooded. Legacy root copy: `--runtime manual`.

Design: [interactive-installer-design](docs/interactive-installer-design.md), [runtime-install-matrix-research](docs/runtime-install-matrix-research.md), [project-state-policy](docs/project-state-policy.md).

**Manual fallback** (bulk copy): [install-sh-usage](docs/install-sh-usage.md)

```bash
curl -fsSL https://raw.githubusercontent.com/truongnat/ai-engineering-harness/main/install.sh | sh
```

Preview what the fallback would copy:

```bash
curl -fsSL https://raw.githubusercontent.com/truongnat/ai-engineering-harness/main/install.sh | sh -s -- --target . --dry-run
```

Project `.harness/` scaffold with runtime-native install:

```bash
curl -fsSL https://raw.githubusercontent.com/truongnat/ai-engineering-harness/main/install.sh | sh -s -- \
  --runtime claude --scope project --init-harness --dry-run --yes
```

See [harness-init-usage](docs/harness-init-usage.md).

Pin a release tag: `--ref v0.9.0` ([install security](docs/plugin-install-security.md)).

## 🛠️ Maintainer quick start (source pack)

```bash
git clone https://github.com/truongnat/ai-engineering-harness.git
cd ai-engineering-harness
node validate.js
node install.js --target ../my-project --dry-run
node install.js --target ../my-project
```

Clone is for **maintainers and contributors**. Product work stays in the target repository.

Target validation examples:

```bash
node validate.js --target ../my-project --profile-only
node validate.js --target ../my-project --goal google-login
```

Then:

1. Read [AGENTS.md](AGENTS.md).
2. Create or review `.harness/` artifacts in the host repo.
3. Follow the printed next steps after install.
4. Run `node validate.js --target ../my-project --profile-only`.
5. Start with [`commands/harness-start.md`](commands/harness-start.md).
6. Move through the loop with evidence at each phase.

## 🗂️ Start Here

| If You Need | Read |
|---|---|
| Long-term direction | [TARGET.md](TARGET.md) |
| Agent contract | [AGENTS.md](AGENTS.md) |
| Adoption guide | [docs/adoption-guide.md](docs/adoption-guide.md) |
| Consume as pack | [docs/consume-as-pack.md](docs/consume-as-pack.md) |
| Plugin model | [docs/plugin-model.md](docs/plugin-model.md) |
| Consumption modes | [docs/consumption-modes.md](docs/consumption-modes.md) |
| Distribution model | [docs/distribution-model.md](docs/distribution-model.md) |
| Release archive | [docs/release-archive-model.md](docs/release-archive-model.md) |
| Installed surface | [docs/installed-surface-contract.md](docs/installed-surface-contract.md) |
| Runtime comparison | [docs/runtimes/comparison.md](docs/runtimes/comparison.md) |
| Build a harness profile | [docs/harness-build-usage.md](docs/harness-build-usage.md) |
| Copy-paste prompts | [docs/harness-build-prompts.md](docs/harness-build-prompts.md) |
| Validate adopted profile | [docs/target-repo-validation.md](docs/target-repo-validation.md) |
| Runtime overview | [docs/runtime-compatibility.md](docs/runtime-compatibility.md) |
| Runtime-specific usage | [docs/runtimes/README.md](docs/runtimes/README.md) |
| Quality gates | [docs/quality-gates-matrix.md](docs/quality-gates-matrix.md) |
| Session startup | [docs/session-start-checklist.md](docs/session-start-checklist.md) |
| Examples | [examples/demo-project/](examples/demo-project/), [examples/workflows/](examples/workflows/), and [examples/harness-build/flutter-google-login/](examples/harness-build/flutter-google-login/) |

## 🛠️ Adoption

- [Adoption Guide](docs/adoption-guide.md)
- [Adoption Smoke Test](docs/adoption-smoke-test.md)
- [Install-To-Profile Walkthrough](docs/install-to-profile-walkthrough.md)
- [Validation Troubleshooting](docs/validation-troubleshooting.md)
- [Tiny Repo Adoption Example](examples/tiny-repo-adoption/)
- [Small Repo Memory](docs/small-repo-memory.md)
- [Usage Examples](docs/usage-examples.md)
- [Host Repo Checklist](docs/host-repo-checklist.md)

## 🎯 Release Status

- Current release: [`v0.9.0`](docs/v0.9.0-release-notes.md) — contract docs shipped; **active work:** [Plugin Install UX](docs/v0.9.0-plan.md)
- Next: `install.sh` + dogfood → `v1.0.0` Stable Plugin-like Capability Pack
- [Plugin install UX](docs/plugin-install-ux.md) · [contracts (pre-v1)](docs/stable-contract-index.md) · [PACK.md](PACK.md)
- `v0.9.0` docs: [notes](docs/v0.9.0-release-notes.md) · [readiness](docs/v0.9.0-readiness.md) · [scope](docs/v0.9.0-release-scope.md)
- `v0.8.0` docs: [notes](docs/v0.8.0-release-notes.md) · [readiness](docs/v0.8.0-readiness.md) · [scope](docs/v0.8.0-release-scope.md) · [dogfood](docs/pack-dogfood-scenarios.md)
- `v0.7.0` docs: [notes](docs/v0.7.0-release-notes.md) · [readiness](docs/v0.7.0-readiness.md) · [scope](docs/v0.7.0-release-scope.md) · [package](docs/manual-packaging-guide.md)
- `v0.6.0` docs: [notes](docs/v0.6.0-release-notes.md) · [readiness](docs/v0.6.0-readiness.md) · [scope](docs/v0.6.0-release-scope.md) · [model](docs/runtime-consumption-model.md)
- `v0.5.0` docs: [notes](docs/v0.5.0-release-notes.md) · [readiness](docs/v0.5.0-readiness.md) · [scope](docs/v0.5.0-release-scope.md)
- `v0.4.0` docs: [notes](docs/v0.4.0-release-notes.md) · [readiness](docs/v0.4.0-readiness.md) · [scope](docs/v0.4.0-release-scope.md)
- Previous releases: [`v0.3.0`](docs/v0.3.0-release-notes.md), [`v0.2.0`](docs/v0.2.0-release-notes.md), [`v0.1.0`](docs/v0.1.0-release-notes.md)
- Release docs: [v0.3.1 notes](docs/v0.3.1-release-notes.md) · [v0.3.0 readiness](docs/v0.3.0-readiness.md) · [changelog](CHANGELOG.md)
- Release process: [docs/release-checklist.md](docs/release-checklist.md) · [docs/versioning.md](docs/versioning.md)

## 🤝 Contributing

- [CONTRIBUTING.md](CONTRIBUTING.md)
- [SECURITY.md](SECURITY.md)

Keep markdown as the source of truth. Avoid heavy runtime features unless the roadmap explicitly moves there.
