# Deterministic Mode Guide

## Overview

`agentic-sdlc` supports deterministic execution at two levels:

1. **Workflow Determinism** (✅ Implemented): Same workflow + inputs → same step order
2. **Content Determinism** (🚧 Partial): Same LLM inputs → same LLM outputs

## Current Status

### ✅ Workflow Determinism
- Step execution order is deterministic
- State transitions are reproducible
- Trace IDs enable replay of engine decisions

### 🚧 Content Determinism (✅ Implemented in Week 2)
- Temperature control via environment variable
- Seed generation from workflow_instance_id + step_id
- OpenAI seed support added
- **✅ NEW: Replay Store** for perfect determinism

## Configuration

### Temperature Control

Control LLM temperature (0.0 = deterministic, 2.0 = creative):

```bash
# Default: 0.0 (deterministic)
export ANTIGRAV_LLM_TEMPERATURE=0.0

# More creative
export ANTIGRAV_LLM_TEMPERATURE=0.7

# Maximum creativity
export ANTIGRAV_LLM_TEMPERATURE=2.0
```

### Seed Control

For providers that support seed (OpenAI):

```bash
# Auto-generate from trace_id + step_id (default)
# No configuration needed

# Override with specific seed
export ANTIGRAV_LLM_SEED=42
```

## Usage Examples

### Deterministic Workflow Execution

```bash
# Run with deterministic settings (default)
cargo run -- --workflow feature.md

# Explicitly set temperature to 0
ANTIGRAV_LLM_TEMPERATURE=0.0 cargo run -- --workflow feature.md

# With specific seed
ANTIGRAV_LLM_SEED=12345 cargo run -- --workflow feature.md
```

### Check Determinism Mode

```bash
# Temperature = 0.0 means deterministic mode is active
cargo run -- workflow doctor
```

## Provider Support

| Provider | Temperature | Seed | Notes |
|----------|-------------|------|-------|
| Ollama | ✅ | ❌ | Temperature supported |
| OpenAI | ✅ | ✅ | Full determinism support |
| Gemini | ✅ | ❌ | Temperature only |
| Anthropic | ✅ | ❌ | Temperature only |
| Azure OpenAI | ✅ | ✅ | Same as OpenAI |
| AWS Bedrock | ✅ | ❌ | Temperature only |

## Determinism Guarantees

### What IS Deterministic

✅ **Workflow orchestration:**
- Step execution order
- State transitions
- Trace generation
- Budget enforcement
- Policy checks

✅ **With temperature=0.0:**
- OpenAI responses (with seed)
- Azure OpenAI responses (with seed)
- Reduced variance for other providers

### What is NOT Deterministic (Yet)

❌ **Without replay store:**
- LLM responses vary across runs (even with temp=0)
- Different API versions may behave differently
- Network conditions affect timing

❌ **Provider limitations:**
- Ollama, Gemini, Anthropic, Bedrock don't support seed
- Temperature=0 reduces but doesn't eliminate variance

## Roadmap: Full Determinism

### ✅ Phase 1: Replay Store (Week 2 - COMPLETE)

Response caching for true determinism is now available:

```bash
# Record mode: save all LLM responses
cargo run -- --workflow feature.md --save-replay snapshot.json

# Replay mode: use cached responses (10x+ faster, $0 cost)
cargo run -- --workflow feature.md --replay-mode snapshot.json
```

**Benefits:**
- Perfect determinism: same inputs → same outputs, always
- 10x+ speedup in replay mode
- Zero API costs during replay
- Offline development and testing

See [Replay Store Guide](REPLAY_STORE.md) for complete documentation.

### Phase 2: Snapshot Management (Week 3)

```bash
# List snapshots
cargo run -- workflow snapshots

# Diff two snapshots
cargo run -- workflow snapshot-diff run1.json run2.json

# Merge snapshots
cargo run -- workflow snapshot-merge base.json new.json -o merged.json

# Validate snapshot
cargo run -- workflow snapshot-validate snapshot.json
```

### Phase 3: CI Integration (Week 4)

```bash
# In CI: verify determinism
cargo run -- workflow verify-determinism feature.md --baseline baseline.json

# Generate baseline
cargo run -- workflow generate-baseline feature.md -o baseline.json
```

## Best Practices

### For Development

```bash
# Use default deterministic settings
cargo run -- --workflow feature.md

# Temperature = 0.0 by default
# Seed auto-generated from trace_id
```

### For Testing (Recommended)

```bash
# Record baseline with replay store
ANTIGRAV_LLM_TEMPERATURE=0.0 \
  cargo run -- --workflow test.md --save-replay baseline.json

# Replay for fast, deterministic testing
cargo run -- --workflow test.md --replay-mode baseline.json

# Perfect reproducibility, 10x+ faster, $0 cost
```

### For Production

```bash
# Use higher temperature for creativity
ANTIGRAV_LLM_TEMPERATURE=0.7 \
  cargo run -- --workflow feature.md

# Or use role-specific temperature
# (configured in role profile)
```

## Debugging Non-Determinism

### Check Temperature

```bash
# Verify temperature setting
echo $ANTIGRAV_LLM_TEMPERATURE

# Should be 0.0 for deterministic mode
```

### Check Provider

```bash
# OpenAI/Azure have best determinism
export ANTIGRAV_LLM_PROVIDER=openai

# Avoid Ollama for deterministic workflows
# (no seed support)
```

### Check Trace

```bash
# Export trace to see what happened
cargo run -- workflow trace <instance_id> --json > trace.json

# Look for:
# - provider used
# - model used
# - temperature used
# - seed used (if applicable)
```

## Implementation Details

### Temperature Resolution

```rust
fn resolve_temperature() -> f32 {
    std::env::var("ANTIGRAV_LLM_TEMPERATURE")
        .ok()
        .and_then(|v| v.trim().parse::<f32>().ok())
        .unwrap_or(0.0)  // Default: deterministic
        .clamp(0.0, 2.0)
}
```

### Seed Generation

```rust
fn generate_seed(trace_id: &str, step_id: &str) -> Option<i64> {
    // Override via environment
    if let Ok(seed_str) = std::env::var("ANTIGRAV_LLM_SEED") {
        return seed_str.parse::<i64>().ok();
    }
    
    // Generate from trace_id + step_id
    let combined = format!("{}:{}", trace_id, step_id);
    let hash = fnv1a64(&combined);
    Some((hash & 0x7FFFFFFFFFFFFFFF) as i64)
}
```

### Determinism Check

```rust
fn is_deterministic_mode() -> bool {
    resolve_temperature() == 0.0
}
```

## FAQ

### Q: Why do I get different results with temperature=0?

A: With Week 2's Replay Store, you now have perfect determinism:

**Without Replay Store:**
- Temperature=0 reduces variance but doesn't guarantee identical outputs
- Only OpenAI/Azure support seed for better determinism

**With Replay Store (Recommended):**
```bash
# Record once
cargo run -- --workflow test.md --save-replay cache.json

# Replay always gives identical results
cargo run -- --workflow test.md --replay-mode cache.json
```

See [Replay Store Guide](REPLAY_STORE.md) for details.

### Q: Which provider is most deterministic?

A: OpenAI and Azure OpenAI, because they support both temperature and seed.

### Q: Can I use deterministic mode in production?

A: Yes, but consider:
- Temperature=0 may reduce creativity
- Use role-specific temperature overrides
- Consider replay mode for critical workflows

### Q: How do I verify determinism?

A: Run the same workflow twice and compare:
```bash
cargo run -- --workflow test.md --snapshot-out run1.json
cargo run -- --workflow test.md --snapshot-out run2.json
diff run1.json run2.json
```

### Q: What about network timing?

A: Network timing affects wall-clock time but not:
- Step execution order (deterministic)
- LLM responses (with replay store)
- State transitions (deterministic)

## Related Documentation

- [Replay Store Guide](REPLAY_STORE.md) - **NEW: Perfect determinism with caching**
- [Architecture](ARCHITECTURE.md)
- [Gap Roadmap](GAP_ROADMAP.md)
- [Implementation Plan](IMPLEMENTATION_PLAN.md)
- [Progress Summary](PROGRESS_SUMMARY.md)

---

**Last Updated:** 2026-03-07
**Status:** ✅ Replay Store Implemented (Week 2)
**Next:** Snapshot Management (Week 3)
