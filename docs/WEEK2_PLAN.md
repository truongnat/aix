# Week 2 Plan - Replay Store Implementation

## 🎯 Goal

Implement replay store for true deterministic LLM content reproduction.

---

## 📋 Objectives

### Primary Goal
Enable same workflow + inputs → same LLM outputs through response caching and replay.

### Success Criteria
- [ ] Replay store saves all LLM requests/responses
- [ ] Replay mode returns cached responses
- [ ] CLI flags `--save-replay` and `--replay-mode` work
- [ ] Performance overhead < 5%
- [ ] All tests passing
- [ ] Documentation complete

---

## 🏗️ Architecture

### Components

```
┌─────────────────────────────────────────────┐
│           LLM Subagent Skill                │
├─────────────────────────────────────────────┤
│                                             │
│  ┌──────────────┐      ┌──────────────┐   │
│  │ Normal Mode  │      │ Replay Mode  │   │
│  └──────┬───────┘      └──────┬───────┘   │
│         │                     │            │
│         ▼                     ▼            │
│  ┌──────────────┐      ┌──────────────┐   │
│  │ Call Provider│      │ Check Cache  │   │
│  └──────┬───────┘      └──────┬───────┘   │
│         │                     │            │
│         ▼                     ▼            │
│  ┌──────────────┐      ┌──────────────┐   │
│  │ Save to Cache│      │Return Cached │   │
│  └──────────────┘      └──────────────┘   │
│                                             │
└─────────────────────────────────────────────┘
                    │
                    ▼
         ┌──────────────────────┐
         │   Replay Store       │
         ├──────────────────────┤
         │ - In-memory cache    │
         │ - JSON persistence   │
         │ - Request hashing    │
         └──────────────────────┘
```

---

## 📝 Implementation Tasks

### Task 1: Replay Store Core (4 hours)

**File:** `src/engine/replay_store.rs`

**Structs:**
```rust
pub struct LlmSnapshot {
    pub trace_id: String,
    pub step_id: String,
    pub request_hash: String,
    pub provider: String,
    pub model: String,
    pub prompt: String,
    pub response: String,
    pub timestamp_ms: u64,
    pub tokens: u32,
    pub cost_usd: f64,
}

pub struct ReplayStore {
    snapshots: HashMap<String, LlmSnapshot>,
    metadata: ReplayMetadata,
    file_path: Option<PathBuf>,
}

pub struct ReplayMetadata {
    version: String,
    created_at_ms: u64,
    updated_at_ms: u64,
    total_snapshots: usize,
}
```

**Methods:**
- `new()` - Create empty store
- `load(path)` - Load from file
- `save(path)` - Save to file
- `add_snapshot(snapshot)` - Add entry
- `get_snapshot(hash)` - Retrieve entry
- `compute_hash(provider, model, prompt, temperature, seed)` - Hash function

**Tests:**
- [ ] Create and save store
- [ ] Load existing store
- [ ] Add and retrieve snapshots
- [ ] Hash consistency

---

### Task 2: Replay Cache (2 hours)

**File:** `src/engine/replay_cache.rs`

**Purpose:** In-memory cache for fast lookups during execution

**Struct:**
```rust
pub struct ReplayCache {
    cache: Arc<RwLock<HashMap<String, LlmSnapshot>>>,
    store: Option<ReplayStore>,
    mode: ReplayMode,
}

pub enum ReplayMode {
    Off,
    Record,    // Save responses
    Replay,    // Use cached responses
}
```

**Methods:**
- `new(mode, store_path)` - Initialize
- `check_cache(hash)` - Check if cached
- `add_to_cache(hash, snapshot)` - Add entry
- `flush()` - Save to disk

---

### Task 3: LLM Integration (3 hours)

**File:** `src/skills/llm_subagent.rs`

**Changes:**

1. Add replay cache to `LlmSubAgentSkill`:
```rust
pub struct LlmSubAgentSkill {
    // ... existing fields
    replay_cache: Option<Arc<ReplayCache>>,
}
```

2. Update `execute()` method:
```rust
async fn execute(&self, input: SkillInput, ctx: &mut ExecutionContext) -> Result<SkillOutput> {
    // ... existing code
    
    // Check replay cache
    if let Some(cache) = &self.replay_cache {
        let hash = compute_request_hash(&provider, &model, &prompt, temperature, seed);
        
        if let Some(snapshot) = cache.check_cache(&hash).await {
            // Return cached response
            return Ok(build_output_from_snapshot(snapshot));
        }
    }
    
    // Call provider (existing code)
    let result = self.call_provider_with_retry(...).await?;
    
    // Save to cache
    if let Some(cache) = &self.replay_cache {
        let snapshot = LlmSnapshot {
            trace_id: ctx.trace_id.clone(),
            step_id: ctx.step_id.clone(),
            request_hash: hash,
            provider: result.provider,
            model: result.model,
            prompt: prompt.clone(),
            response: result.text.clone(),
            timestamp_ms: now_ms(),
            tokens: result.usage.total_tokens,
            cost_usd: estimated_usd,
        };
        cache.add_to_cache(&hash, snapshot).await;
    }
    
    // ... rest of existing code
}
```

3. Add hash function:
```rust
fn compute_request_hash(
    provider: &LlmProvider,
    model: &str,
    prompt: &str,
    temperature: f32,
    seed: Option<i64>,
) -> String {
    let combined = format!(
        "{}:{}:{}:{}:{}",
        provider.as_str(),
        model,
        prompt,
        temperature,
        seed.map(|s| s.to_string()).unwrap_or_default()
    );
    fnv1a64_hex(combined.as_bytes())
}
```

---

### Task 4: CLI Integration (2 hours)

**File:** `src/cli.rs`

**Add flags:**
```rust
#[derive(Parser)]
pub struct Cli {
    // ... existing fields
    
    /// Save LLM responses to replay file
    #[arg(long)]
    save_replay: Option<String>,
    
    /// Replay from saved file (deterministic mode)
    #[arg(long)]
    replay_mode: Option<String>,
}
```

**Initialize replay cache:**
```rust
let replay_mode = if cli.replay_mode.is_some() {
    ReplayMode::Replay
} else if cli.save_replay.is_some() {
    ReplayMode::Record
} else {
    ReplayMode::Off
};

let replay_path = cli.replay_mode.or(cli.save_replay);
let replay_cache = if replay_mode != ReplayMode::Off {
    Some(Arc::new(ReplayCache::new(replay_mode, replay_path)?))
} else {
    None
};
```

---

### Task 5: Testing (3 hours)

**Unit Tests:**
- [ ] Replay store save/load
- [ ] Cache hit/miss
- [ ] Hash consistency
- [ ] Concurrent access

**Integration Tests:**
- [ ] Record mode saves responses
- [ ] Replay mode uses cached responses
- [ ] Same inputs → same outputs
- [ ] Different inputs → cache miss

**Test File:** `tests/replay_store_test.rs`

```rust
#[tokio::test]
async fn test_replay_determinism() {
    // Run 1: Record mode
    let output1 = run_workflow_with_replay(
        "test.md",
        ReplayMode::Record,
        "replay1.json"
    ).await?;
    
    // Run 2: Replay mode
    let output2 = run_workflow_with_replay(
        "test.md",
        ReplayMode::Replay,
        "replay1.json"
    ).await?;
    
    // Should be identical
    assert_eq!(output1, output2);
}
```

---

### Task 6: Documentation (2 hours)

**Update Files:**

1. **README.md** - Add replay mode section
2. **docs/DETERMINISTIC_MODE.md** - Add replay store details
3. **docs/REPLAY_STORE.md** - New comprehensive guide

**Content:**
- How replay store works
- Usage examples
- Performance considerations
- Troubleshooting

---

## 📅 Schedule

### Day 1 (Monday)
- ✅ Morning: Task 1 - Replay Store Core (4h)
- ✅ Afternoon: Task 2 - Replay Cache (2h)

### Day 2 (Tuesday)
- ✅ Morning: Task 3 - LLM Integration (3h)
- ✅ Afternoon: Task 4 - CLI Integration (2h)

### Day 3 (Wednesday)
- ✅ Morning: Task 5 - Testing (3h)
- ✅ Afternoon: Task 6 - Documentation (2h)

### Day 4 (Thursday)
- ✅ Morning: Bug fixes and polish
- ✅ Afternoon: Code review and cleanup

### Day 5 (Friday)
- ✅ Morning: Final testing
- ✅ Afternoon: Documentation review and commit

**Total Effort:** 16 hours over 5 days

---

## 🧪 Testing Strategy

### Test Scenarios

1. **Basic Replay**
   - Record workflow execution
   - Replay with same inputs
   - Verify identical outputs

2. **Cache Miss**
   - Replay with different inputs
   - Should call provider
   - Should add to cache

3. **Performance**
   - Measure overhead in record mode
   - Measure speedup in replay mode
   - Target: < 5% overhead, > 10x speedup

4. **Concurrent Access**
   - Multiple workflows recording
   - Thread-safe cache operations
   - No data corruption

5. **Error Handling**
   - Missing replay file
   - Corrupted cache
   - Hash collisions

---

## 📊 Success Metrics

### Functional
- [ ] Record mode saves all LLM calls
- [ ] Replay mode returns cached responses
- [ ] 100% deterministic with replay
- [ ] All existing tests still pass

### Performance
- [ ] Record overhead < 5%
- [ ] Replay speedup > 10x
- [ ] Memory usage < 100MB for 1000 snapshots

### Quality
- [ ] Test coverage > 80%
- [ ] No memory leaks
- [ ] Thread-safe operations
- [ ] Clear error messages

---

## 🚨 Risks & Mitigation

### Risk 1: Hash Collisions
**Mitigation:** Use FNV-1a 64-bit hash + include all parameters

### Risk 2: Large Cache Files
**Mitigation:** Add compression, implement cache pruning

### Risk 3: Performance Overhead
**Mitigation:** Async I/O, batch writes, in-memory cache

### Risk 4: Thread Safety
**Mitigation:** Use Arc<RwLock<>> for shared state

---

## 📝 Checklist

### Implementation
- [ ] Replay store core
- [ ] Replay cache
- [ ] LLM integration
- [ ] CLI flags
- [ ] Hash function
- [ ] Save/load logic

### Testing
- [ ] Unit tests
- [ ] Integration tests
- [ ] Performance tests
- [ ] Concurrent tests
- [ ] Error handling tests

### Documentation
- [ ] README update
- [ ] Deterministic mode guide
- [ ] Replay store guide
- [ ] API documentation
- [ ] Examples

### Quality
- [ ] Code review
- [ ] Performance profiling
- [ ] Memory leak check
- [ ] Thread safety audit

---

## 🎯 Definition of Done

- [ ] All tasks completed
- [ ] All tests passing
- [ ] Documentation complete
- [ ] Code reviewed
- [ ] Performance validated
- [ ] Committed to main branch
- [ ] Ready for Week 3

---

**Week:** 2 of 20  
**Phase:** 1 (Critical Foundations)  
**Status:** Ready to Start  
**Next:** Week 3 - Code Execution Sandbox
