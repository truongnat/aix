# Deterministic Workflow Example

Example workflow using OpenAI with seed for perfect determinism.

## Setup

```bash
export OPENAI_API_KEY=sk-proj-...
export ANTIGRAV_LLM_PROVIDER=openai
export ANTIGRAV_LLM_MODEL=gpt-4o-mini
export ANTIGRAV_LLM_TEMPERATURE=0.0
export ANTIGRAV_LLM_SEED=42
```

## Workflow

### generate_function
- skill: llm_subagent
- input: |
    Generate a Python function that:
    - Takes a list of numbers
    - Returns the sum of even numbers
    - Includes docstring and type hints
- on_failure: abort

### generate_tests
- skill: llm_subagent
- input: "Generate pytest unit tests for the function above"
- depends_on: [generate_function]
- on_failure: abort

### review_code
- skill: llm_subagent
- input: "Review the function and tests. Suggest improvements."
- depends_on: [generate_tests]
- on_failure: abort

## Determinism Guarantees

With `temperature=0.0` and `seed=42`:

**Run 1:**
```python
def sum_even_numbers(numbers: list[int]) -> int:
    """Sum all even numbers in the list."""
    return sum(n for n in numbers if n % 2 == 0)
```

**Run 2:**
```python
def sum_even_numbers(numbers: list[int]) -> int:
    """Sum all even numbers in the list."""
    return sum(n for n in numbers if n % 2 == 0)
```

**Identical output!** ✅

## Testing Determinism

```bash
# Run 1
cargo run -- --workflow examples/deterministic_workflow.md > run1.txt

# Run 2
cargo run -- --workflow examples/deterministic_workflow.md > run2.txt

# Compare
diff run1.txt run2.txt
# Should show no differences!
```

## With Replay Store (Perfect Determinism)

```bash
# Record once
cargo run -- --workflow examples/deterministic_workflow.md \
  --save-replay deterministic_cache.json

# Replay - guaranteed identical
cargo run -- --workflow examples/deterministic_workflow.md \
  --replay-mode deterministic_cache.json

# 100% identical, 10x faster, $0 cost
```

## Provider Support

| Provider | Temperature | Seed | Determinism |
|----------|-------------|------|-------------|
| OpenAI | ✅ | ✅ | Perfect |
| Azure OpenAI | ✅ | ✅ | Perfect |
| Gemini | ✅ | ❌ | Good |
| Anthropic | ✅ | ❌ | Good |
| Bedrock | ✅ | ❌ | Good |
| Ollama | ✅ | ❌ | Fair |

**Recommendation:** Use OpenAI or Azure for deterministic workflows.

## Use Cases

**Testing:**
```bash
# Generate baseline
cargo run -- --workflow test.md --save-replay baseline.json

# Verify no regressions
cargo run -- --workflow test.md --replay-mode baseline.json
```

**CI/CD:**
```bash
# In CI pipeline
cargo run -- --workflow ci_test.md --replay-mode fixtures/ci_cache.json
# Fast, deterministic, no API costs
```

**Debugging:**
```bash
# Reproduce exact issue
export ANTIGRAV_LLM_SEED=42
cargo run -- --workflow debug.md
# Same output every time
```

## Run

```bash
cargo run -- --workflow examples/deterministic_workflow.md
```
