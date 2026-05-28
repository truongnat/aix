<div align="center">

# ⚡ Agentic Goal CLI

**Turn a one-line idea into shipped code — autonomously.**

[![Python 3.11+](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![CI](https://github.com/truongnat/agentic-sdlc/actions/workflows/test.yml/badge.svg)](https://github.com/truongnat/agentic-sdlc/actions/workflows/test.yml)
[![Built with LangGraph](https://img.shields.io/badge/built%20with-LangGraph-purple)](https://github.com/langchain-ai/langgraph)
[![Powered by OpenRouter](https://img.shields.io/badge/powered%20by-OpenRouter-green)](https://openrouter.ai)

```bash
goal start "Build a REST API with auth and PostgreSQL"
```

| Phase | Status |
|---|---|
| ⚡ Plan | Architecture drafted — approved |
| � Rules | Tech stack & conventions locked in |
| 🎫 Tasks | 12 tickets decomposed and ready |
| 🤖 ticket-001 | ✅ done |
| 🤖 ticket-002 | ✅ done |
| 🤖 ticket-003 | 🔄 in progress |

</div>

---

## What is this?

`goal` is a **multi-agent SDLC harness** that runs an entire software development pipeline from a single idea:

1. 🧠 **Plan** — top-tier model architects the solution
2. 📐 **Rules** — generates project conventions & tech stack decisions
3. 🎫 **Tasks** — decomposes into an executable kanban of tickets
4. 🤖 **Execute** — coder agent implements each ticket, runs tests (if defined), reviewer scores it; loops until ≥ 9/10

Every step is **checkpointed to SQLite** — interrupt and resume any time. Long text generation (plan/rules/tasks) streams in real-time.

---

## Quickstart

### Requirements

- Python 3.11+
- An API key for at least one provider (OpenRouter recommended)

### Install

```bash
git clone https://github.com/your-org/agentic-sdlc
cd agentic-sdlc
pip install -e ".[dev]"
```

### Initialize a project

```bash
cd your-project
goal init
```

This creates `.goal/config.yaml` in the current directory. Edit it to set your provider and models.

### Set your API key

```bash
# Recommended: one key for all models via OpenRouter
export OPENROUTER_API_KEY="sk-or-..."

# Or use providers directly
export ANTHROPIC_API_KEY="sk-ant-..."
export OPENAI_API_KEY="sk-..."
```

### Run

```bash
goal start "Build a CLI todo app in Node.js"
```

At each phase the CLI pauses, saves the artifact to `.goal/g_<id>/`, and asks:

```
Plan  1) approve  2) regenerate  3) abort
Choice [1]:
```

Edit the file in your IDE if needed, then approve or give feedback to regenerate.

---

## Pipeline

```
goal start "idea"
      │
      ▼
  ┌────────┐   interrupt   ┌──────────────────┐
  │  plan  │──────────────►│  you: approve /  │
  └────────┘               │  regenerate with │
      │        ◄───────────│  feedback        │
      ▼                    └──────────────────┘
  ┌────────┐   interrupt
  │ rules  │──────────────► (approve / edit / regenerate)
  └────────┘
      │
      ▼
  ┌────────┐   interrupt
  │ tasks  │──────────────► (approve kanban / regenerate)
  └────────┘
      │
      ▼
  ┌─────────────┐
  │ pick_ticket │◄──────────────────────┐
  └─────────────┘                       │
        │                               │ next ticket
        ▼                               │
  ┌─────────────┐                       │
  │ ticket_plan │                       │
  └─────────────┘                       │
        │                               │
        ▼                               │
  ┌─────────────┐   tools        ┌──────┴──────┐
  │    coder    │──────────────► │  reviewer   │
  └─────────────┘   fs/shell/git └─────────────┘
        │                               │
        ▼                               │
   run tests (if defined)               │
        │                               │
        └───────────────────────────────┘
                              score ≥ 9 → done ✅
                              score < 9 → retry 🔄
```

---

## Configuration

### Layered config (last write wins)

```
defaults  ←  ~/.config/agentic-goal/config.yaml  ←  .goal/config.yaml  ←  GOAL_MODEL_* env  ←  --model-override
```

### Project config (`.goal/config.yaml`)

```yaml
default_provider: openrouter   # anthropic | openai | ollama | openrouter

roles:
  planner:
    model: anthropic/claude-opus-4
    temperature: 0.2
    max_tokens: 8000
  rules_advisor:
    model: anthropic/claude-opus-4
  task_decomposer:
    model: anthropic/claude-sonnet-4
  ticket_planner:
    model: openai/gpt-4.1-mini
  coder:
    model: openai/gpt-4.1-mini
    temperature: 0.1
  reviewer:
    model: anthropic/claude-opus-4   # must differ from coder
    temperature: 0.0

budgets:
  per_goal_usd: 5.0
  per_ticket_usd: 0.5
  hard_stop: true

limits:
  coder_max_iterations: 10
  recursion_limit: 200
  subprocess_timeout_seconds: 300
  review_approval_score: 7
  shell_command_denylist:
    - "rm -rf /"
    - "dd if="
    - "mkfs"
    - "format"
```

> ⚠️ `reviewer.model` **must differ** from `coder.model` — enforced at startup.

### Role defaults

| Role | Default Model | Purpose |
|---|---|---|
| `planner` | `anthropic/claude-opus-4` | Architecture & plan |
| `rules_advisor` | `anthropic/claude-opus-4` | Tech stack rules |
| `task_decomposer` | `anthropic/claude-sonnet-4` | Ticket breakdown |
| `ticket_planner` | `openai/gpt-4.1-mini` | Per-ticket impl plan |
| `coder` | `openai/gpt-4.1-mini` | Code implementation |
| `reviewer` | `anthropic/claude-opus-4` | Code review & scoring |

### Provider shortcuts

```bash
# OpenRouter (one key → all models)
export OPENROUTER_API_KEY="sk-or-..."

# Direct providers
export ANTHROPIC_API_KEY="sk-ant-..."
export OPENAI_API_KEY="sk-..."

# Per-role override via env
export GOAL_MODEL_CODER="openai/gpt-4.1"

# Per-run override via CLI
goal start "idea" --model-override coder=openai/gpt-4.1
```

### Local models (Ollama)

If no API key is set, the CLI automatically falls back to local Ollama:

```bash
ollama serve
ollama pull llama3.1:8b
ollama pull qwen2.5-coder:7b

goal start "Build a CLI app"   # uses local models, zero cost
```

Model selection per role:
- `coder` → prefers `qwen2.5-coder`, `deepseek-coder`, `codellama`
- `planner` / `reviewer` → prefers larger (`70b > 13b > 8b`), `llama3`, `qwen2.5`, `mistral`

---

## Skills

Skills are **reusable context blocks** injected into agent prompts to improve output quality. The system supports three layers of skill loading:

```
.goal/skills/
├── global.md                    # injected into every role
├── coding-style.md              # primary skill for coder
├── review-rubric.md             # primary skill for reviewer
├── architecture.md              # primary skill for planner
├── coder-frontend.md           # pattern-matched (coder-*.md)
├── db-postgres.md              # context-matched via frontmatter tags
└── auth.md                      # context-matched via frontmatter tags
```

### Skill layers

1. **Global** (`global.md`) — injected into every role
2. **Primary** (`coding-style.md`, etc.) — one per role, loaded by filename
3. **Pattern-matched** (`coder-*.md`, `frontend-*.md`, etc.) — auto-discovered by glob
4. **Contextual** — matched dynamically via YAML frontmatter tags against ticket/idea description

### Dynamic contextual skills

Add YAML frontmatter with tags to any `.md` file in `.goal/skills/`:

```markdown
---
tags: [auth, jwt, security, oauth]
description: Authentication patterns for web apps
---

# Auth Patterns
- Use JWT access tokens (15-min expiry)
- Store refresh tokens in httpOnly cookies
```

When a ticket mentions "Implement JWT authentication", the `auth.md` skill is **automatically loaded** because its tag `jwt` matches the context.

### Import skills from the web

```bash
# Import from GitHub raw URL
goal skills import https://raw.githubusercontent.com/.../react-hooks.md

# Import with custom name
goal skills import https://gist.githubusercontent.com/.../auth.md --name auth.md

# List all skills with tags
goal skills list

# View a skill
goal skills show auth
```

---

## CLI Reference

### Core commands

```bash
goal init                          # initialize project (.goal/config.yaml)
goal start "idea"                  # start a new goal
goal continue [--id g_abc123]      # resume from checkpoint
goal status  [--id g_abc123]       # kanban + phase + cost
goal list-goals                    # all goals with phase & idea
```

### Recovery commands

```bash
goal retry-ticket <ticket-id> [--id g_abc123]    # mark ticket as pending for re-execution
goal skip-ticket <ticket-id> [--id g_abc123]     # mark ticket as done (skip it)
goal abort [--id g_abc123]                       # mark goal as aborted (stop execution)
goal clean [--older-than 7d] [--only-done]       # remove old goal workspaces
```

### Observation & debugging

```bash
goal logs                          # full transcript
goal logs --phase execution        # filter by phase
goal logs --role coder             # filter by role
goal logs --ticket ticket-003      # filter by ticket
goal cost-dashboard [--id ID]      # cost breakdown by role (ASCII bar chart)
```

### Skills management

```bash
goal skills list                            # list all skill files with tags
goal skills show <name>                     # display contents of a skill
goal skills import <url> [--name <file>]    # download skill from URL
```

### Config management

```bash
goal config show                   # effective merged config
goal config validate               # check keys present, reviewer ≠ coder
goal config set <role> <model>     # update global config
```

### Flags

| Flag | Description |
|---|---|
| `-v` / `-vv` / `-vvv` | Verbosity (show tool results, full event data) |
| `--no-color` | Plain output |
| `--json` | JSON output mode |
| `--model-override role=model` | Override a role's model for this run |

---

## Workspace layout

Every goal gets its own workspace under `.goal/`:

```
.goal/
├── config.yaml              ← project config (goal init)
├── skills/                  ← optional: skill files per role
│   ├── global.md
│   ├── coding-style.md
│   └── review-rubric.md
└── g_abc123/                ← one directory per goal
    ├── plan.md              ← architecture plan (editable)
    ├── rules.md             ← tech stack & conventions (editable)
    ├── tasks.md             ← ticket breakdown (editable)
    ├── transcript.md        ← human-readable agent log
    ├── events.jsonl         ← machine-readable event stream
    └── state.db             ← SQLite checkpoint (LangGraph)
```

---

## Architecture

### State machine

```
AgentState (TypedDict, checkpointed by SqliteSaver)
├── goal_id, idea, phase
├── plan, rules, tasks, kanban
├── current_ticket_id
├── feedback            ← user regeneration hint, cleared on approve
├── cumulative_cost_usd, cumulative_tokens
└── messages            ← Annotated[list, add_messages]
```

### Key design decisions

- **EventBus in `ContextVar`** — not in graph state, so checkpoints stay serializable
- **`interrupt_before`** — LangGraph pauses before `plan_approval`, `rules_approval`, `tasks_approval`; CLI handles the human interaction outside the graph
- **Reviewer uses structured output** — Pydantic `ReviewOutput(score, feedback, approved)`; approval threshold is `score >= 7` AND non-empty diff
- **All LLM calls retried** — `tenacity` with 3 attempts + exponential backoff
- **Tools run in CWD** — `run_shell`, `git_*` operate in the user's working directory; `.goal/` is reserved for agent metadata

### Module map

```
src/agentic_goal/
├── cli.py            ← Typer commands + approval loop
├── config.py         ← Layered config, Ollama fallback, validation
├── events.py         ← EventBus + 3 sinks (terminal / jsonl / markdown)
├── graph.py          ← AgentState TypedDict
├── graph_builder.py  ← LangGraph wiring + interrupt points
├── nodes.py          ← All node implementations + skills loader
└── tools.py          ← read_file, write_file, run_shell, git_*
```

---

## Development

```bash
# Install with dev extras
pip install -e ".[dev]"

# Run tests
pytest -v

# Lint
ruff check src/

# Type-check
mypy src/
```

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| `No module named 'langgraph.checkpoint.sqlite'` | `pip install -e ".[dev]"` |
| `Missing API key env var ...` | Export the key or run `goal config validate` to see which |
| `BadRequestResponseError: not a valid model ID` | Check model name in `.goal/config.yaml`; use `openrouter/<provider>/<slug>` format |
| Graph re-runs same ticket forever | Reviewer score < 9; check `goal logs --role reviewer` |
| Want to wipe a goal | `rm -rf .goal/g_<id>/` |
| Need a fresh start | `goal init --force` overwrites `.goal/config.yaml` |

---

## License

MIT — see [LICENSE](LICENSE)
