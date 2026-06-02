<div align="center">

# ⚙️ ai-engineering-harness

### Markdown-first engineering discipline for AI coding agents

![Version](https://img.shields.io/badge/version-v0.2.0-2563eb)
![License](https://img.shields.io/badge/license-MIT-16a34a)
![Validation](https://img.shields.io/badge/validation-passing-22c55e)
![Markdown First](https://img.shields.io/badge/markdown-first-7c3aed)
![Runtime Light](https://img.shields.io/badge/runtime-lightweight-f59e0b)

Plan. Build. Verify. Ship. Remember — with durable markdown artifacts.

</div>

`ai-engineering-harness` helps AI coding agents work like disciplined engineering partners instead of improvising in a single prompt. It uses markdown commands, skills, workflows, memory, team patterns, and quality gates to create durable project-specific operating context.

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

## 🚀 Quick Start

```bash
git clone https://github.com/truongnat/ai-engineering-harness.git
cd ai-engineering-harness
node validate.js
node install.js --target ../my-project --dry-run
node install.js --target ../my-project
```

Target validation examples:

```bash
node validate.js --target ../my-project --profile-only
node validate.js --target ../my-project --goal google-login
```

Then:

1. Read [AGENTS.md](AGENTS.md).
2. Create or review `.harness/` artifacts in the host repo.
3. Start with [`commands/harness-start.md`](commands/harness-start.md).
4. Move through the loop with evidence at each phase.

## 🗂️ Start Here

| If You Need | Read |
|---|---|
| Long-term direction | [TARGET.md](TARGET.md) |
| Agent contract | [AGENTS.md](AGENTS.md) |
| Adoption guide | [docs/adoption-guide.md](docs/adoption-guide.md) |
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
- [Usage Examples](docs/usage-examples.md)
- [Host Repo Checklist](docs/host-repo-checklist.md)

## 🎯 Release Status

- Current release: [`v0.2.0`](docs/v0.2.0-release-notes.md)
- Previous release: [`v0.1.0`](docs/v0.1.0-release-notes.md)
- `v0.3.0` in readiness review:
  [readiness](docs/v0.3.0-readiness.md) · [scope](docs/v0.3.0-release-scope.md)
- [docs/v0.2.0-release-notes.md](docs/v0.2.0-release-notes.md)
- [docs/v0.2.0-readiness.md](docs/v0.2.0-readiness.md)
- [docs/v0.2.0-release-scope.md](docs/v0.2.0-release-scope.md)
- [docs/v0.3.0-readiness.md](docs/v0.3.0-readiness.md)
- [docs/v0.3.0-release-scope.md](docs/v0.3.0-release-scope.md)
- [CHANGELOG.md](CHANGELOG.md)
- [docs/release-checklist.md](docs/release-checklist.md)
- [docs/versioning.md](docs/versioning.md)

## 🤝 Contributing

- [CONTRIBUTING.md](CONTRIBUTING.md)
- [SECURITY.md](SECURITY.md)

Keep markdown as the source of truth. Avoid heavy runtime features unless the roadmap explicitly moves there.
