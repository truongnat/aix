# Multi-Provider Fallback Example

Example workflow demonstrating automatic fallback between providers.

## Setup

```bash
# Primary: OpenAI
export OPENAI_API_KEY=sk-proj-...
export ANTIGRAV_LLM_PROVIDER=openai

# Fallback: Gemini, then Anthropic
export GEMINI_API_KEY=AIza...
export ANTHROPIC_API_KEY=sk-ant-...
export ANTIGRAV_LLM_FALLBACK=gemini,anthropic
export ANTIGRAV_LLM_FALLBACK_POLICY=transient_only
```

## Workflow

### step1_primary
- skill: llm_subagent
- input: "Explain the concept of dependency injection in 2 sentences"
- on_failure: continue

### step2_fallback_test
- skill: llm_subagent
- input: "What are the benefits of dependency injection?"
- depends_on: [step1_primary]
- on_failure: continue

### step3_summary
- skill: llm_subagent
- input: "Summarize the key points about dependency injection"
- depends_on: [step2_fallback_test]
- on_failure: abort

## Fallback Behavior

**Scenario 1: OpenAI works**
- All steps use OpenAI
- No fallback triggered
- Fast, consistent

**Scenario 2: OpenAI rate limited**
- Step 1: OpenAI (429 error)
- Step 1 retry: Gemini (success)
- Step 2: Gemini (continues with fallback)
- Step 3: Gemini

**Scenario 3: OpenAI timeout**
- Step 1: OpenAI (timeout)
- Step 1 retry: Gemini (success)
- Subsequent steps: Gemini

## Fallback Triggers

- Rate limit (429)
- Timeout (> 120s)
- Server error (500-599)
- Network error

## Run

```bash
cargo run -- --workflow examples/multi_provider_fallback.md
```

## Testing Fallback

```bash
# Simulate OpenAI failure by using invalid key
export OPENAI_API_KEY=invalid
export ANTIGRAV_LLM_FALLBACK=gemini

# Should fallback to Gemini
cargo run -- --workflow examples/multi_provider_fallback.md
```

## Cost Optimization

```bash
# Use cheapest provider first
export ANTIGRAV_LLM_PROVIDER=gemini
export ANTIGRAV_LLM_FALLBACK=openai,anthropic

# Gemini: $0.075/1M input (cheapest)
# OpenAI: $0.15/1M input (fallback)
# Anthropic: $0.25/1M input (last resort)
```
