# Documentation Index

Welcome! User-facing documentation for **ai-engineering-harness**, organized with [Diátaxis](https://diataxis.fr/):

| Type | Purpose | Start here |
| --- | --- | --- |
| **Tutorial** | Learn by doing | [first-5-minutes.md](first-5-minutes.md) |
| **How-to** | Solve a task | [adoption-guide.md](adoption-guide.md), [harness-init-usage.md](harness-init-usage.md) |
| **Reference** | Facts & contracts | [harness-command-behavior.md](harness-command-behavior.md), [compatibility-matrix.md](compatibility-matrix.md) |
| **Explanation** | Concepts & design | [concepts.md](concepts.md), [architecture.md](architecture.md), [architecture/](architecture/) |

## Quick Navigation

### 🚀 Getting Started
- **[Adoption Guide](adoption-guide.md)** — How to install and set up the harness in your project
- **[Concepts](concepts.md)** — Core terminology: commands, skills, workflows, patterns, gates
- **[Architecture](architecture.md)** — System design and component relationships

### 📖 Using the Harness
- **[Phase Discipline Rules](phase-discipline.md)** ⭐ **START HERE** — The canonical source for phase discipline, preconditions, hard stops, and evidence standards
- **[Harness Commands](harness-command-behavior.md)** — Reference for all 10 harness commands (map, start, discuss, plan, run, verify, ship, remember, doctor, status)
- **[Workflows](../workflows/README.md)** — Pre-built workflows for features, bugfixes, incidents, refactoring, code review
- **[Patterns](../patterns/README.md)** — Team collaboration patterns (hierarchical delegation, producer-reviewer, supervisor, etc.)
- **[Skills](../skills/README.md)** — Reusable expert behaviors (code review, verification, planning, etc.)
- **[Templates](../templates/README.md)** — Artifact templates (.harness files)

### 🔧 Provider-Specific Guides
| Provider | Status | Link |
|---|---|---|
| **Claude Code** | Primary | [Claude Runtime](runtimes/claude.md) |
| **Cursor** | Secondary | [Cursor Runtime](runtimes/cursor.md) |
| **Codex** | Experimental | [Codex Runtime](runtimes/codex.md) |
| **Gemini CLI** | Experimental | [Gemini Runtime](runtimes/gemini-cli.md) |
| **Generic** | Fallback | [Generic AGENTS.md](runtimes/comparison.md) |

### 💾 Memory & State
- **[Memory Model](memory-model.md)** — How the harness stores context between sessions
- **[Session Memory](session-memory.md)** — Project-local state and durable artifacts
- **[Session Start Protocol](session-start-checklist.md)** — What happens when you begin a new session

### 🛠️ Advanced Topics
- **[Tool Discovery & Routing](tool-discovery-and-routing.md)** — How the harness discovers and routes to available tools
- **[Provider Rule Configuration](provider-rule-configuration.md)** — Customizing rules per provider
- **[Hooks & Skills Layer](hooks-and-skills-layer.md)** — Extensibility and automation
- **[Context Engineering](context-engineering.md)** — Compaction, just-in-time retrieval, and delta-spec discipline
- **[Token Budget](token-budget.md)** — Why the harness stays lightweight by design
- **[Quality Gates Matrix](quality-gates-matrix.md)** — Entry/exit criteria per phase
- **[Delegated Workers](delegated-workers.md)** — Claude-native subagent framework

### 📋 Development & Contribution
- **[Contributing Guide](../CONTRIBUTING.md)** — How to contribute to the harness
- **[Skill Authoring Rules](../skills/SKILL_AUTHORING_RULES.md)** — How to write new skills
- **[Skill System](skill-system.md)** — Design and lifecycle
- **[Validation](runtime-aware-validation.md)** — Harness validation contract

### 📦 Installation & Deployment
- **[Install Command Model](install-command-model.md)** — How `npx ai-engineering-harness install` works
- **[Runtime-Native Installation](runtime-native-install.md)** — Provider-specific install payloads and follow-up actions
- **[Consumption Modes](consumption-modes.md)** — Different ways to use the harness

### 📚 Release Notes & History
| Version | Notes |
|---|---|
| **v1.1.4** | [Release Notes](v1.1.4-release-notes.md) |
| v1.1.0 | [Release Notes](v1.1.0-release-notes.md) |
| v1.0.0 | [Release Notes](v1.0.0-release-notes.md) |
| v0.x archive | [internal/archive/v0/](internal/archive/v0/) |
| [Older versions...](versioning.md) | See version history |

---

## Common Tasks

### I want to...

**Install the harness in my project**
→ Start with [Adoption Guide](adoption-guide.md)

**Understand how the command loop works**
→ Read [Harness Command Behavior](harness-command-behavior.md) and [Core Loop](../workflows/core-loop.md)

**Write a goal/plan and run my first session**
→ Follow [Session Start Protocol](session-start-checklist.md)

**Add a custom skill**
→ Read [Skill Authoring Rules](../skills/SKILL_AUTHORING_RULES.md)

**Customize rules for my provider**
→ See [Provider Rule Configuration](provider-rule-configuration.md)

**Understand the memory model**
→ Read [Memory Model](memory-model.md) and [Session Memory](session-memory.md)

**Set up hooks for automation**
→ See [Hooks & Skills Layer](hooks-and-skills-layer.md)

**See examples of real projects**
→ Check [Examples](../examples/README.md)

---

## Internal/Archive (for maintainers)

The following subdirectories contain internal development notes, planning documents, and release archives. Most users do not need these:

- **`docs/internal/superpowers/`** — Planning and design notes for major features
- **`docs/internal/archive/install/`** — Historical install UX plans, installer design notes, and provider research
- **`docs/internal/archive/v0/`** — Historical v0 release/plan/readiness notes
- **`docs/internal/archive/runtime/`** — Historical runtime-install research, audits, and dogfood plans
- **`docs/internal/archive/`** — Frozen contracts, gap analysis, positioning
- **`docs/internal/reviews/`** — Improvement and review reports
- **`docs/architecture/`** — ADRs for major technical decisions
- **Dogfood reports** — `docs/pack-dogfood-reports/` — testing logs from the team

---

## Glossary

**Command** — A harness action (map, start, discuss, plan, run, verify, ship, remember, doctor, status)

**Skill** — A reusable expert behavior (code review, verification, planning, etc.)

**Workflow** — A pre-built sequence of commands + skills for a task (feature, bugfix, incident, etc.)

**Pattern** — A team collaboration model (hierarchical delegation, producer-reviewer, supervisor, etc.)

**Harness** — The `.harness/` directory containing project goals, plans, tasks, and session memory

**Gate** — A blocking condition that prevents moving to the next phase (e.g., must verify before shipping)

**Provider** — An AI coding agent runtime (Claude Code, Cursor, Codex, Gemini, etc.)

**Skill Pack** — A collection of skills organized by domain (frontend, backend, mobile, debugging, etc.)

---

## Still Lost?

- Check the main [README.md](../README.md) for a 30-second overview
- Read [Concepts](concepts.md) to understand the mental model
- See [Architecture](architecture.md) for system design
- Look at an [Example](../examples/dogfood-tiny-node-api/README.md) for a working project
