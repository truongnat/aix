# Agentic Goal CLI

A multi-agent SDLC harness on the command line. Give it a one-line idea and it will:

1. **Plan** the architecture (top-tier model)
2. **Rules** — ask clarifying questions about stack/conventions
3. **Tasks** — decompose into a kanban of tickets
4. **Execute** — coder + reviewer loop until each ticket scores ≥ 9/10

Built with **LangGraph** (state graph + checkpointer), **Typer** (CLI),
**Rich** (live UI), and **multi-provider LLM routing** (OpenAI / Anthropic / OpenRouter).

---

## Features

- 🧠 **Multi-agent pipeline**: planner → rules advisor → task decomposer → ticket planner → coder → reviewer
- 🛑 **Human-in-the-loop**: graph pauses (`interrupt_before`) at plan / rules / tasks for approval
- 💾 **Checkpointed state**: every step persisted to SQLite, resume any time with `goal continue`
- 📊 **Live kanban + cost dashboard**: per-role token & USD breakdown
- 🔧 **Sandboxed tools**: file I/O, shell, git — all run inside `.goal/<goal_id>/`
- 🔁 **Retry + structured output**: tenacity-backed LLM calls, Pydantic-validated reviewer scores
- 📝 **3-sink event bus**: terminal (Rich), `events.jsonl`, `transcript.md`

---

## Installation

Requires **Python 3.11+**.

```bash
git clone <repo>
cd agentic-sdlc
pip3 install -e ".[dev]"
```

This installs the `goal` CLI into your environment.

---

## Configuration

### API keys

Set at least one provider API key in your environment (or `.env` in the project root):

```bash
export OPENAI_API_KEY="sk-..."
export ANTHROPIC_API_KEY="sk-ant-..."
# or
export OPENROUTER_API_KEY="sk-or-..."
```

### Default model assignment

| Role | Default Model |
|---|---|
| `planner` | `anthropic/claude-opus-4` |
| `rules_advisor` | `anthropic/claude-opus-4` |
| `task_decomposer` | `anthropic/claude-sonnet-4` |
| `ticket_planner` | `openai/gpt-4.1-mini` |
| `coder` | `openai/gpt-4.1-mini` |
| `reviewer` | `anthropic/claude-opus-4` |

> ⚠️ The `reviewer` model **must differ** from `coder` (enforced by config validation).

### Override per-role model

Three layers, last write wins:

1. **Global YAML** — `~/.config/agentic-goal/config.yaml`
2. **Goal-local YAML** — `.goal/<goal_id>/config.yaml`
3. **Env var** — `GOAL_MODEL_<ROLE>=...` (e.g. `GOAL_MODEL_CODER=openai/gpt-4.1`)
4. **CLI flag** — `--model-override coder=gpt-4`

### Local fallback (Ollama)

If a role's configured provider has **no API key** in the environment, the CLI automatically falls back to local Ollama (if running at `http://localhost:11434`):

- **Detection**: Checks if Ollama is reachable at startup
- **Model selection**: Auto-picks the best already-pulled model per role:
  - `coder` → prefers `qwen2.5-coder*`, `deepseek-coder*`, `codellama*`
  - `planner` / `rules_advisor` / `reviewer` → prefers larger models (`*70b` > `*13b` > `*8b`), prefers `llama3.*`, `qwen2.5*`, `mistral*`
  - `task_decomposer` / `ticket_planner` → any general chat model
- **Pull prompt**: If no suitable models are found, prompts you to `ollama pull` recommended models (`llama3.1:8b`, `qwen2.5-coder:7b`)
- **Mixed mode**: Some roles can use cloud APIs while others fall back to Ollama
- **Validation warning**: If both `reviewer` and `coder` fall back to the same Ollama model, a warning is printed (review quality may be degraded)

To use Ollama exclusively:
```bash
# Don't set any API keys; ensure Ollama is running
ollama serve

# Run goal - it will auto-detect and use Ollama
goal start "Build a CLI todo app"
```

Example global config:

```yaml
# ~/.config/agentic-goal/config.yaml
default_provider: openai
roles:
  coder:
    model: openai/gpt-4.1
    temperature: 0.1
  reviewer:
    model: anthropic/claude-opus-4
budgets:
  per_goal_usd: 10.0
  hard_stop: true
```

---

## Quickstart

### 1. Start a new goal

```bash
goal start "Build a CLI todo app in Rust with SQLite backend"
```

The graph runs through **plan → rules → tasks** and stops at each approval gate.
Artifacts are written to `.goal/g_<id>/`:

```
.goal/g_abc123/
├── plan.md          # Architecture plan
├── rules.md         # Stack & convention questions
├── tasks.md         # Decomposed tickets
├── transcript.md    # Human-readable agent log
├── events.jsonl     # Machine-readable event stream
└── state.db         # SQLite checkpoint
```

### 2. Resume after approval

```bash
goal continue                # latest goal
goal continue --id g_abc123  # specific goal
```

LangGraph auto-resumes from the last checkpoint and continues into the
ticket execution loop (`pick_ticket → ticket_plan → coder → reviewer`).

### 3. Check status

```bash
goal status              # latest
goal status --id g_abc123
```

Shows current phase, ticket, kanban with status emoji, cumulative cost & tokens.

### 4. List all goals

```bash
goal list-goals
```

### 5. View logs

```bash
goal logs                          # transcript only
goal logs --phase execution        # filter
goal logs --role coder
goal logs --ticket ticket-001
```

### 6. Cost dashboard

```bash
goal cost-dashboard
```

ASCII bar chart of cost by role.

---

## CLI reference

| Command | Purpose |
|---|---|
| `goal start <idea>` | Begin a new goal |
| `goal continue [--id ID]` | Resume from checkpoint |
| `goal status [--id ID]` | Show current phase + kanban |
| `goal list-goals` | List all goals |
| `goal logs [--phase X] [--role X] [--ticket X]` | View agent transcript |
| `goal cost-dashboard [--id ID]` | Cost breakdown by role |
| `goal config show` | Display effective config |
| `goal config validate` | Validate config (keys present, reviewer ≠ coder) |
| `goal config set <role> <model>` | Set role override |
| `goal config models` | List known models |

Common flags:

- `-v`, `-vv`, `-vvv` — verbosity
- `--no-color` — plain output
- `--json` — JSON output mode
- `--model-override coder=gpt-4` — per-run role override

---

## Architecture overview

```
                    ┌────────┐
   start <idea> ───►│  plan  │── interrupt ──► (user approves)
                    └────────┘
                         │
                    ┌────────┐
                    │ rules  │── interrupt ──► (user answers questions)
                    └────────┘
                         │
                    ┌────────┐
                    │ tasks  │── interrupt ──► (user approves kanban)
                    └────────┘
                         │
                    ┌─────────────┐
              ┌────►│ pick_ticket │──┐
              │     └─────────────┘  │
              │                      ▼
              │              ┌─────────────┐
              │              │ ticket_plan │
              │              └─────────────┘
              │                      │
              │                      ▼
              │              ┌─────────────┐
              │       ┌─────►│    coder    │──tool calls──► sandbox
              │       │      └─────────────┘
              │       │              │
              │       │              ▼
              │       │      ┌─────────────┐
              │       └──────│  reviewer   │  (score < 9 → coder)
              │   not done   └─────────────┘
              │                      │ score ≥ 9
              │                      │
              └──────── done ◄───────┘
                         │
                        END
```

- **State** is `AgentState` (TypedDict) checkpointed by `SqliteSaver`
- **EventBus** is held in a `ContextVar`, not in state, to keep checkpoints serializable
- **Tools** are sandboxed: `run_shell`, `git_*` operate inside `.goal/<id>/`
- **Reviewer** uses Pydantic structured output (`score`, `feedback`, `approved`)
- **All LLM calls** wrapped with `tenacity` retry (3 attempts, exp backoff)

---

## Development

```bash
# Install dev deps
pip install -e ".[dev]"

# Lint
ruff check src/

# Type-check
mypy src/

# Run tests
pytest
```

### Project layout

```
src/agentic_goal/
├── cli.py            # Typer entry point + commands
├── config.py         # Layered config + validation
├── events.py         # EventBus + sinks (terminal/jsonl/markdown)
├── graph.py          # AgentState (TypedDict)
├── graph_builder.py  # LangGraph wiring + checkpointer
├── nodes.py          # All node implementations
└── tools.py          # Sandboxed file/shell/git tools
```

---

## Troubleshooting

**`No module named 'langgraph.checkpoint.sqlite'`**
Reinstall: `pip install -e ".[dev]"` (the `langgraph-checkpoint-sqlite` package was added).

**`Missing API key env var ...`**
Export the env var matching your chosen provider (see `goal config show`).

**Graph runs forever / re-runs same ticket**
The reviewer might be lenient. Check `goal logs --role reviewer` — score must reach ≥ 9 to mark a ticket `done`.

**Want to wipe a goal**
`rm -rf .goal/<goal_id>/`

---

See [PLAN.md](PLAN.md) for the full original architecture spec.
