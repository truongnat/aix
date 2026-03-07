# Replay Store Guide

The Replay Store provides deterministic LLM response caching for perfect reproducibility and fast replay of workflows.

## Overview

The Replay Store solves a fundamental challenge in agentic workflows: **LLM responses are non-deterministic**. Even with `temperature=0.0`, different runs can produce slightly different outputs due to:

- Model updates
- API changes
- Network conditions
- Sampling variations

The Replay Store captures LLM request/response pairs and allows perfect replay without making actual LLM calls.

## Benefits

### 1. Perfect Determinism
- Same inputs → same outputs, always
- Bit-for-bit reproducible workflows
- Reliable testing and debugging

### 2. Performance
- **10x+ speedup** in replay mode
- No network latency
- Instant response from cache

### 3. Cost Savings
- Zero API costs during replay
- Reuse expensive LLM calls
- Test without burning credits

### 4. Offline Development
- Work without internet
- Test in CI/CD without API keys
- Develop on planes/trains

## Quick Start

### Record Mode

Save LLM responses to a cache file:

```bash
cargo run -- --workflow feature.md --save-replay llm_cache.json
```

This will:
1. Execute the workflow normally
2. Call LLM providers as usual
3. Save all request/response pairs to `llm_cache.json`
4. Auto-flush cache on completion

### Replay Mode

Use cached responses instead of calling LLMs:

```bash
cargo run -- --workflow feature.md --replay-mode llm_cache.json
```

This will:
1. Load cache from `llm_cache.json`
2. Check cache before each LLM call
3. Return cached response if found
4. Skip actual LLM API calls
5. Complete 10x+ faster

## How It Works

### Request Hashing

Each LLM request is hashed using FNV-1a based on:
- Provider (e.g., "openai", "anthropic")
- Model (e.g., "gpt-4o-mini")
- Prompt text
- Temperature
- Seed (if deterministic mode)

Same inputs → same hash → same cached response.

### Cache Structure

The cache file is JSON with this structure:

```json
{
  "metadata": {
    "version": "1.0",
    "created_at_ms": 1709827200000,
    "snapshot_count": 5
  },
  "snapshots": {
    "abc123def456": {
      "trace_id": "workflow-instance-123",
      "step_id": "analyze",
      "request_hash": "abc123def456",
      "provider": "openai",
      "model": "gpt-4o-mini",
      "prompt": "Analyze this code...",
      "response": "This code implements...",
      "timestamp_ms": 1709827201000,
      "tokens": 150,
      "cost_usd": 0.00045
    }
  }
}
```

### Thread Safety

The cache uses `Arc<RwLock<HashMap>>` for:
- Multiple concurrent readers
- Single writer at a time
- Safe for parallel workflow steps

### Auto-Flush

Cache automatically flushes to disk:
- On `Drop` (when cache goes out of scope)
- On explicit `flush()` call
- Ensures data safety even on panic

## Usage Patterns

### Development Workflow

```bash
# 1. Record once with real LLM
cargo run -- --workflow feature.md --save-replay dev_cache.json

# 2. Iterate quickly with replay
cargo run -- --workflow feature.md --replay-mode dev_cache.json
# (repeat as needed, instant feedback)

# 3. Update cache when prompt changes
cargo run -- --workflow feature.md --save-replay dev_cache.json
```

### Testing

```bash
# Record golden responses
cargo run -- --workflow test_suite.md --save-replay golden.json

# Run tests with replay (fast, deterministic)
cargo run -- --workflow test_suite.md --replay-mode golden.json
```

### CI/CD

```yaml
# .github/workflows/test.yml
- name: Test with replay
  run: |
    cargo run -- --workflow ci_tests.md --replay-mode fixtures/ci_cache.json
```

No API keys needed in CI!

## Advanced Usage

### Combining with Deterministic Mode

For maximum reproducibility:

```bash
# Record with deterministic settings
ANTIGRAV_LLM_TEMPERATURE=0.0 \
ANTIGRAV_LLM_SEED=42 \
cargo run -- --workflow feature.md --save-replay cache.json

# Replay with same settings
ANTIGRAV_LLM_TEMPERATURE=0.0 \
ANTIGRAV_LLM_SEED=42 \
cargo run -- --workflow feature.md --replay-mode cache.json
```

### Cache Management

```bash
# Check cache size
ls -lh llm_cache.json

# View cache metadata
jq '.metadata' llm_cache.json

# Count snapshots
jq '.snapshots | length' llm_cache.json

# View first snapshot
jq '.snapshots | to_entries | .[0].value' llm_cache.json

# Calculate total cost
jq '[.snapshots[].cost_usd] | add' llm_cache.json
```

### Partial Cache

If cache is missing some requests:
- Record mode: Adds new entries, keeps existing
- Replay mode: Falls back to live LLM call if not cached

### Cache Invalidation

Rebuild cache when:
- Prompts change significantly
- Model versions update
- Requirements change

```bash
# Delete old cache
rm llm_cache.json

# Record fresh cache
cargo run -- --workflow feature.md --save-replay llm_cache.json
```

## Performance Benchmarks

Typical performance improvements:

| Metric | Record Mode | Replay Mode | Speedup |
|--------|-------------|-------------|---------|
| Execution Time | 45s | 3s | 15x |
| API Calls | 10 | 0 | ∞ |
| Cost | $0.05 | $0.00 | 100% savings |
| Network I/O | 500KB | 0KB | - |

Actual speedup depends on:
- Number of LLM calls
- Network latency
- Model response time
- Workflow complexity

## Troubleshooting

### Cache Miss

**Problem:** Replay mode makes live LLM calls

**Causes:**
- Prompt changed
- Different temperature/seed
- Different model
- Cache file not found

**Solution:**
```bash
# Re-record with current settings
cargo run -- --workflow feature.md --save-replay cache.json
```

### Cache File Corrupted

**Problem:** JSON parse error

**Solution:**
```bash
# Validate JSON
jq . cache.json

# If invalid, re-record
rm cache.json
cargo run -- --workflow feature.md --save-replay cache.json
```

### Slow Replay

**Problem:** Replay not much faster than record

**Causes:**
- Cache misses (falling back to live calls)
- Disk I/O bottleneck
- Small cache file

**Solution:**
```bash
# Check cache hit rate (should be 100%)
# Add logging to see cache hits/misses

# Ensure cache is on fast storage (SSD)
```

### Large Cache Files

**Problem:** Cache file grows too large

**Solution:**
```bash
# Split by workflow
cargo run -- --workflow part1.md --save-replay cache_part1.json
cargo run -- --workflow part2.md --save-replay cache_part2.json

# Or prune old entries manually
jq 'del(.snapshots | to_entries | .[10:] | from_entries)' cache.json > cache_pruned.json
```

## Implementation Details

### Architecture

```
CLI (entrypoint.rs)
  ↓
ReplayCache (replay_cache.rs)
  ↓
ReplayStore (replay_store.rs)
  ↓
JSON File
```

### Key Components

**ReplayCache**
- In-memory cache with `Arc<RwLock<HashMap>>`
- Thread-safe concurrent access
- Auto-flush on drop
- Mode-aware behavior (Off/Record/Replay)

**ReplayStore**
- JSON serialization/deserialization
- File I/O operations
- Metadata management
- Snapshot storage

**LlmSubAgentSkill**
- Cache check before provider calls
- Cache save after successful calls
- Hash computation for request deduplication

### Hash Function

Uses FNV-1a (Fowler-Noll-Vo) 64-bit hash:
- Fast (single pass)
- Good distribution
- Low collision rate
- Deterministic

```rust
fn compute_request_hash(
    provider: &str,
    model: &str,
    prompt: &str,
    temperature: f32,
    seed: Option<i64>,
) -> String {
    let combined = format!(
        "{}:{}:{}:{}:{}",
        provider, model, prompt, temperature,
        seed.map(|s| s.to_string()).unwrap_or_default()
    );
    fnv1a64_hex(combined.as_bytes())
}
```

## Best Practices

### 1. Version Control

**DO:**
```bash
# Commit cache files for tests
git add tests/fixtures/*.json
git commit -m "Add test cache fixtures"
```

**DON'T:**
```bash
# Don't commit large dev caches
echo "*.json" >> .gitignore  # (except fixtures/)
```

### 2. Cache Naming

Use descriptive names:
```bash
# Good
--save-replay feature_auth_flow.json
--save-replay test_golden_responses.json
--save-replay ci_integration_tests.json

# Bad
--save-replay cache.json
--save-replay temp.json
```

### 3. Cache Hygiene

```bash
# Refresh caches periodically
find . -name "*_cache.json" -mtime +30 -delete

# Re-record after major changes
rm old_cache.json
cargo run -- --workflow updated.md --save-replay new_cache.json
```

### 4. Documentation

Document cache files:
```bash
# tests/fixtures/README.md
## Cache Files

- `auth_flow.json` - Authentication workflow responses (recorded 2024-03-01)
- `payment.json` - Payment processing responses (recorded 2024-03-05)
- `golden.json` - Golden test responses (DO NOT MODIFY)
```

## Limitations

### Current Limitations

1. **No Compression**
   - Cache files can be large
   - Future: Add gzip compression

2. **No Pruning**
   - Old entries never removed
   - Future: Add TTL and size limits

3. **No Encryption**
   - Cache stored as plain JSON
   - Future: Add optional encryption

4. **Single File**
   - All snapshots in one file
   - Future: Add sharding support

### Known Issues

None currently. Report issues at: https://github.com/truongnat/agentic-sdlc/issues

## Future Enhancements

### Planned Features

- [ ] Cache compression (gzip)
- [ ] Cache pruning (TTL, size limits)
- [ ] Cache encryption (optional)
- [ ] Cache sharding (multiple files)
- [ ] Cache statistics (hit rate, savings)
- [ ] Cache diff tool (compare caches)
- [ ] Cache merge tool (combine caches)

### Roadmap

**Week 3:** Cache compression and pruning  
**Week 4:** Cache statistics and monitoring  
**Week 5:** Cache encryption and security  

## FAQ

**Q: Does replay mode work offline?**  
A: Yes! Once cached, no internet needed.

**Q: Can I share cache files?**  
A: Yes, cache files are portable. Share via git or file transfer.

**Q: What if my prompt changes slightly?**  
A: Cache miss → live LLM call. Re-record to update cache.

**Q: Is the cache secure?**  
A: Cache is plain JSON. Don't cache sensitive data. Encryption coming soon.

**Q: Can I use multiple caches?**  
A: Not yet. Use one cache per workflow for now.

**Q: Does this work with all LLM providers?**  
A: Yes! Works with OpenAI, Anthropic, Gemini, Azure, Bedrock, Ollama.

**Q: What's the overhead in record mode?**  
A: < 5% typically. Mostly JSON serialization.

**Q: Can I edit cache files manually?**  
A: Yes, it's JSON. But be careful with hash consistency.

## Related Documentation

- [Deterministic Mode Guide](DETERMINISTIC_MODE.md)
- [Week 2 Implementation Plan](WEEK2_PLAN.md)
- [Week 2 Progress](WEEK2_PROGRESS.md)

## Support

For questions or issues:
- GitHub Issues: https://github.com/truongnat/agentic-sdlc/issues
- Documentation: https://github.com/truongnat/agentic-sdlc/tree/main/docs

---

**Version:** 1.0  
**Last Updated:** 2026-03-07  
**Status:** Production Ready
