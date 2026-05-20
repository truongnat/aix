# Cost-Optimized Workflow Example

Example workflow using Gemini for maximum cost savings.

## Setup

```bash
export GEMINI_API_KEY=AIza...
export AGENTIC_SDLC_LLM_PROVIDER=gemini
export AGENTIC_SDLC_LLM_MODEL=gemini-1.5-flash
```

## Workflow

### analyze_requirements
- skill: llm_subagent
- input: |
    Analyze these requirements for a todo app:
    - Users can create, read, update, delete todos
    - Todos have title, description, due date, priority
    - Users can filter by status and priority
    - Users can search todos
    
    Provide a brief technical analysis.
- on_failure: abort

### design_api
- skill: llm_subagent
- input: "Design a RESTful API for the todo app. List endpoints with methods and paths."
- depends_on: [analyze_requirements]
- on_failure: abort

### design_database
- skill: llm_subagent
- input: "Design a database schema for the todo app. Use PostgreSQL."
- depends_on: [analyze_requirements]
- on_failure: abort

### implementation_plan
- skill: llm_subagent
- input: "Create a step-by-step implementation plan based on the API and database design."
- depends_on: [design_api, design_database]
- on_failure: abort

## Cost Comparison

### Gemini (This Workflow)
- Input: ~1,000 tokens
- Output: ~800 tokens
- Cost: **$0.00032** (Gemini Flash)

### OpenAI (Alternative)
- Same tokens
- Cost: $0.00063 (GPT-4o-mini)
- **2x more expensive**

### Anthropic (Alternative)
- Same tokens
- Cost: $0.00125 (Claude Haiku)
- **4x more expensive**

## Savings

For 1,000 workflow runs:
- Gemini: $0.32
- OpenAI: $0.63 (save $0.31)
- Anthropic: $1.25 (save $0.93)

## Run

```bash
cargo run -- --workflow examples/cost_optimized_workflow.md
```

## With Replay Store (Even Cheaper!)

```bash
# Record once (pay once)
cargo run -- --workflow examples/cost_optimized_workflow.md \
  --save-replay cache.json

# Replay unlimited times (FREE!)
cargo run -- --workflow examples/cost_optimized_workflow.md \
  --replay-mode cache.json

# Cost: $0.00032 for first run, $0 for all replays
```

## Large Context Example

Gemini supports 1M tokens - perfect for large documents:

```bash
# Analyze large codebase
export AGENTIC_SDLC_LLM_MODEL=gemini-1.5-flash

# Can handle 1M tokens at $0.075/1M
# vs OpenAI 128K limit at $0.15/1M
```
