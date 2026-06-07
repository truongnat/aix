# Architecture

The ai-engineering-harness uses **markdown-first architecture** instead of runtime orchestration. It standardizes engineering behavior through documents, skills, validation rules, and provider adapters — not through services, databases, or control planes.

## Core Design Principles

### 1. Markdown-First (Not Prompt-First)

**Why?** Markdown is portable across editors, repos, and agent tools. Plans, verification, and memory stay visible in version control instead of being hidden inside prompts or runtime services.

**What this means:**
- Artifacts are readable by humans and agents equally
- Changes are reviewable in PRs (you can see what decisions changed)
- Memory persists across sessions without API calls
- No lock-in to any specific platform or LLM provider

**Example:**
```
❌ Bad: Agent holds plan in memory, context resets, plan is lost
✅ Good: Agent writes PLAN.md, later sessions read it, context restores
```

### 2. No Heavy Runtime (Intentional)

Version 1 deliberately excludes:

| What | Why Not |
|---|---|
| Server/service | Agents work locally, no deployment needed |
| Database | Markdown files are the database |
| LangGraph/DSL | Would lock users into framework |
| Graph intelligence | Markdown is linearly readable, good enough |
| Autonomous meshes | Humans stay in control of orchestration |
| Web UI | Artifacts are git-friendly, no UI needed |

**The payoff:** This repo weighs ~3MB, installs in seconds, runs anywhere, requires no ops.

### 3. Distribution Over Centralization

Instead of a central platform, distribute:
- **Commands** → Provider-specific rule files (.claude/, .cursor/, AGENTS.md)
- **Memory** → Project-local `.harness/` directory
- **Validation** → npm package with validation scripts
- **Skills** → Markdown files colocated with commands

Each target repo is self-contained. No external service needed.

---

## System Architecture

### Layer Stack

```
┌──────────────────────────────────────────────────────────────┐
│ LAYER 1: Agent System Prompt (agent-system/)                │
│ ├─ SYSTEM_PROMPT.md — Role, MUST/MUST NOT rules             │
│ ├─ RESPONSE_CONTRACT.md — Output format expectations         │
│ ├─ TONE_AND_FORMAT.md — How to communicate                   │
│ └─ provider-adapters/ — Provider-specific hints              │
├──────────────────────────────────────────────────────────────┤
│ LAYER 2: Commands (commands/, .claude/commands/, etc.)       │
│ ├─ harness-start — Restore session                          │
│ ├─ harness-map — Understand state                           │
│ ├─ harness-discuss — Analyze approach                       │
│ ├─ harness-plan — Write implementation plan                 │
│ ├─ harness-run — Execute plan                               │
│ ├─ harness-verify — Verify with evidence                    │
│ ├─ harness-ship — Commit and handoff                        │
│ └─ harness-remember — Store lessons                         │
├──────────────────────────────────────────────────────────────┤
│ LAYER 3: Workflows (workflows/)                              │
│ ├─ feature.md — Build new feature                           │
│ ├─ bugfix.md — Fix a bug                                    │
│ ├─ refactor.md — Improve code                               │
│ ├─ incident.md — Respond to outage                          │
│ └─ code-review.md — Review changes                          │
├──────────────────────────────────────────────────────────────┤
│ LAYER 4: Skills (skills/)                                    │
│ ├─ Core skills: planning, verification, TDD, memory         │
│ ├─ Packs: frontend, backend, mobile, devops, debugging      │
│ └─ Tool-specific: git-worktrees, code-graph, ripgrep        │
├──────────────────────────────────────────────────────────────┤
│ LAYER 5: Patterns (patterns/)                                │
│ ├─ hierarchical-delegation.md                               │
│ ├─ producer-reviewer.md                                     │
│ ├─ supervisor.md                                            │
│ ├─ pipeline.md                                              │
│ └─ expert-pool.md                                           │
├──────────────────────────────────────────────────────────────┤
│ LAYER 6: Templates (templates/)                              │
│ ├─ .harness/GOAL.md, PLAN.md, VERIFY.md, etc.               │
│ └─ Blank markdown with section headers & guidance            │
├──────────────────────────────────────────────────────────────┤
│ LAYER 7: Rules & Validation (rules/, lib/validate/)          │
│ ├─ Phase guards (enforce command order)                     │
│ ├─ Blocking rules (gates prevent skipping)                  │
│ ├─ Tool routing (find right tool for task)                  │
│ └─ Session memory (preserve state safely)                   │
├──────────────────────────────────────────────────────────────┤
│ LAYER 8: Installation & Integration                          │
│ ├─ bin/aih.js / bin/validate.js — CLI entrypoints           │
│ ├─ lib/install-runtime.ts — Set up in target repo           │
│ ├─ lib/validate/index.ts — Check harness health             │
│ ├─ hooks/ — Provider-specific automation                    │
│ └─ workers/ — Delegated subagents (Claude only)             │
└──────────────────────────────────────────────────────────────┘
```

### Data Flow Diagram

```
Agent reads artifact → Executes command → Writes new artifact → Validates → Moves to next phase

Example: harness-plan flow

  1. Agent reads       → GOAL.md, STATE.md, DISCUSSION.md
  2. Executes         → harness-plan command
  3. Writes new       → PLAN-001.md (with steps, assumptions, risks)
  4. Validates        → Check plan is detailed, breaks work into small tasks
  5. Gate check       → [Quality Gate: plan detailed enough?]
  6. Next phase       → Ready for harness-run
```

---

## Host Repository Model

Target repositories (where you use the harness) follow this structure:

```
your-project/
├── src/                        # Your application code
├── test/                        # Your tests
├── .harness/                   # Harness artifacts (version controlled)
│   ├── PROJECT.md              # Project metadata
│   ├── STATE.md                # Current state
│   ├── MEMORY.md               # Durable lessons
│   ├── REQUIREMENTS.md         # Acceptance criteria
│   └── sessions/               # One per active goal
│       └── 2024-01-15-feature/
│           ├── GOAL.md
│           ├── DISCUSSION.md
│           ├── PLAN-001.md
│           ├── TASKS.md
│           ├── VERIFY.md
│           └── SHIP.md
├── .claude/                    # Claude provider adapter (if using Claude)
│   ├── CLAUDE.md
│   ├── settings.json
│   └── commands/
├── .cursor/rules/              # Cursor rules (if using Cursor)
│   └── ai-engineering-harness.mdc
└── AGENTS.md                   # Generic fallback (all providers)
```

### Typical Flow

1. **Session starts** → Agent runs `harness-start` to restore context
2. **Agent reads** `.harness/` artifacts (GOAL, STATE, MEMORY)
3. **Agent works** through the command loop (map → discuss → plan → run → verify → ship → remember)
4. **Agent updates** `.harness/` artifacts as work progresses
5. **Session ends** → Artifacts are committed to version control
6. **Next session** → Starts with full context (no amnesia)

---

## Provider Integration Architecture

```
Generic Target Repo
│
├─→ Claude Code Provider
│   ├─ .claude/CLAUDE.md (system prompt)
│   ├─ .claude/commands/harness-*.md (native commands)
│   ├─ .claude/agents/ (delegated workers)
│   └─ .claude/settings.json (hooks & automation)
│
├─→ Cursor Provider
│   ├─ .cursor/rules/ai-engineering-harness.mdc (rules)
│   └─ hooks/hooks-cursor.json (pending)
│
├─→ Codex Provider
│   ├─ .codex-plugin/plugin.json (manifest)
│   └─ AGENTS.md (fallback)
│
├─→ Gemini CLI Provider
│   ├─ gemini-extension.json (extension manifest)
│   ├─ .gemini/extensions/.../GEMINI.md (context file)
│   └─ AGENTS.md (fallback)
│
└─→ Generic / Any Agent
    └─ AGENTS.md (read and follow instructions)
```

**Key insight:** One markdown source tree, multiple provider adapters. Each provider gets the interface it understands (native commands, rules, markdown, or both).

---

## Design Decisions

### Why Session Directories Instead of Flat Root?

```
❌ Old (flat root):
.harness/GOAL.md
.harness/PLAN.md
.harness/VERIFY.md
→ Only one goal at a time, hard to track parallel work

✅ New (session-based):
.harness/sessions/2024-01-15-feature/GOAL.md
.harness/sessions/2024-01-15-refactor/GOAL.md
→ Multiple goals active simultaneously, clear session context
```

### Why Validation in the npm Package?

Validation (`bin/validate.js`) runs locally before any work happens:
- Catches configuration problems early
- Doesn't require CI/server
- Works offline
- Fast (runs in <1 second)

### Why Rules Over Code?

```
❌ Code approach: Write a JavaScript validator
✅ Rules approach: Write markdown requirements + a generic validator

Benefits of rules:
- Non-developers can read/update rules
- Rules live next to commands (easy to find)
- Rules sync across providers automatically
- No compilation step
```

---

## What This Architecture Enables

### ✅ Multi-Provider Support (Claude, Cursor, Codex, Gemini)
Single markdown source tree generates provider-specific adapters on install.

### ✅ Local-Only Operation
No servers, APIs, or external dependencies. Works offline.

### ✅ Version Control Integration
All state is in git. PRs can review plans and decisions before work happens.

### ✅ Human-in-the-Loop
Artifacts are readable by humans. Humans can guide agents at artifact boundaries.

### ✅ Zero Learning Curve
If you know markdown and git, you already know how to use the harness.

### ✅ Extensibility
Add new skills, patterns, or workflows by adding markdown files.

---

## Limitations & Future

### Current Scope (v1.0.0)
- Single agent focus (one agent per session)
- No real-time collaboration UI
- No metrics/dashboards
- Manual command invocation (no auto-orchestration)

### Could Be Added (v1.1+)
- Team collaboration (shared `.harness/`, merge-friendly artifacts)
- IDE integration (VS Code extension showing harness status)
- Metrics dashboard (session rate, verification coverage)
- Auto-orchestration (agent calls next command automatically)
- Graph analysis (understand decision relationships)

### Won't Be Added (Intentional)
- Heavy runtime dependencies
- Proprietary formats
- Framework lock-in
- Autonomous agent meshes
- Centralized control planes

---

## Next: Understanding the System

To dive deeper into each layer:

1. **Agent system** → [SYSTEM_PROMPT.md](../agent-system/SYSTEM_PROMPT.md)
2. **Commands** → [Harness Commands](harness-command-behavior.md)
3. **Workflows** → [Workflows README](../workflows/README.md)
4. **Skills** → [Skills README](../skills/README.md)
5. **Patterns** → [Patterns README](../patterns/README.md)

Or jump straight to practice: [Your First 5 Minutes](first-5-minutes.md)
