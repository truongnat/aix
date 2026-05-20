# Implementation Plan - Gap Fixes

Kế hoạch implementation chi tiết cho việc fix các gaps của `agentic-sdlc`.

## Quick Wins (Có thể làm ngay)

### 1. Add Anthropic & Azure OpenAI Support
**Status:** ✅ Dependencies đã có trong Cargo.toml
**Effort:** 2-3 hours
**Files:**
- `src/skills/llm_subagent.rs` - Đã có `call_anthropic()` và `call_azure_openai()`
- Chỉ cần test và document

**Action:**
```bash
# Test Anthropic
AGENTIC_SDLC_LLM_PROVIDER=anthropic ANTHROPIC_API_KEY=... cargo test

# Test Azure
AGENTIC_SDLC_LLM_PROVIDER=azure AZURE_OPENAI_KEY=... cargo test
```

### 2. Add Temperature & Seed Enforcement
**Effort:** 1-2 hours
**Impact:** Improve determinism

**Changes needed:**
- Add `temperature` and `seed` fields to all LLM request structs
- Default `temperature=0` for deterministic mode
- Add env var: `AGENTIC_SDLC_LLM_TEMPERATURE` (default: 0)
- Add env var: `AGENTIC_SDLC_LLM_SEED` (default: hash of trace_id)

### 3. Improve Documentation Structure
**Effort:** 2-3 hours
**Impact:** Better DX

**Actions:**
- Move examples to `examples/` folder
- Add architecture diagram using Mermaid
- Create `docs/concepts/` folder
- Add troubleshooting guide

### 4. Add OpenTelemetry Export
**Effort:** 3-4 hours
**Impact:** Better observability

**Changes:**
- Add `opentelemetry` and `opentelemetry-otlp` to Cargo.toml
- Create `src/engine/telemetry/otel.rs`
- Add `--otel-endpoint` flag
- Keep existing timeline format as fallback

## Medium-Term Improvements (1-2 weeks each)

### 5. Implement Replay Store
**Effort:** 1 week
**Impact:** True deterministic replay

**Components:**
- `src/engine/replay_store.rs` - Storage layer
- `src/engine/replay_cache.rs` - In-memory cache
- Integration with `llm_subagent.rs`
- CLI: `--replay-mode` and `--save-replay`

**Schema:**
```rust
struct LlmSnapshot {
    trace_id: String,
    step_id: String,
    request_hash: String,  // Hash of prompt + params
    provider: String,
    model: String,
    response: String,
    timestamp_ms: u64,
}
```

### 6. Implement Code Execution Sandbox
**Effort:** 2 weeks
**Impact:** Security & real code execution

**Approach:**
- Phase 1: Process isolation with resource limits
- Phase 2: Docker container backend
- Phase 3: gVisor for stronger isolation (optional)

**Components:**
- `src/engine/sandbox/mod.rs` - Abstraction
- `src/engine/sandbox/process.rs` - Process backend
- `src/engine/sandbox/docker.rs` - Docker backend
- `src/engine/sandbox/monitor.rs` - Resource monitoring

### 7. Git & CI/CD Integration
**Effort:** 1 week
**Impact:** Real automation

**Features:**
- Create branch, commit, push
- Create PR (GitHub, GitLab, Bitbucket)
- Wait for CI status
- Auto-merge with policies

**Components:**
- `src/skills/git_integration.rs` - Full git ops
- `src/skills/ci_integration.rs` - CI/CD APIs
- Templates for GitHub Actions, GitLab CI

### 8. Security Tool Integration
**Effort:** 1 week
**Impact:** Real security scanning

**Tools to integrate:**
- Semgrep (SAST)
- Trivy (dependency scan)
- cargo-audit (Rust deps)

**Components:**
- `src/engine/security/scanners/semgrep.rs`
- `src/engine/security/scanners/trivy.rs`
- `src/engine/security/policy.rs` - Policy enforcement

### 9. Scalable Vector Store
**Effort:** 1 week
**Impact:** Performance & scalability

**Options:**
1. PostgreSQL + pgvector (simplest)
2. Qdrant (self-hosted)
3. Keep JSON as dev fallback

**Components:**
- `src/engine/vector_store/mod.rs` - Abstraction
- `src/engine/vector_store/pgvector.rs`
- `src/engine/vector_store/qdrant.rs`
- Migration tool

## Long-Term Features (2-4 weeks each)

### 10. Multi-Agent Coordination
**Effort:** 3-4 weeks
**Impact:** True parallel execution

**Features:**
- Parallel step execution
- Shared state with locking
- Conflict resolution
- Dynamic role assignment

**Components:**
- `src/engine/coordination/scheduler.rs`
- `src/engine/coordination/state_manager.rs`
- `src/engine/coordination/conflict_resolver.rs`

## Implementation Order (Recommended)

### Sprint 1 (Week 1)
- [x] Create GAP_ROADMAP.md
- [ ] Add temperature/seed enforcement
- [ ] Test Anthropic & Azure providers
- [ ] Improve documentation structure
- [ ] Add architecture diagram

### Sprint 2 (Week 2)
- [ ] Implement replay store
- [ ] Add `--replay-mode` flag
- [ ] Add replay tests
- [ ] Document determinism scope

### Sprint 3 (Week 3)
- [ ] Implement process sandbox
- [ ] Add resource monitoring
- [ ] Add sandbox tests
- [ ] Document sandbox usage

### Sprint 4 (Week 4)
- [ ] Add OpenTelemetry export
- [ ] Test with Jaeger/Grafana
- [ ] Document OTel integration
- [ ] Add structured logging

### Sprint 5 (Week 5)
- [ ] Git integration (branch, commit, push)
- [ ] PR creation (GitHub, GitLab)
- [ ] CI status integration
- [ ] Add workflow examples

### Sprint 6 (Week 6)
- [ ] Semgrep integration
- [ ] Trivy integration
- [ ] Security policy engine
- [ ] Add security workflow examples

### Sprint 7 (Week 7)
- [ ] PostgreSQL + pgvector backend
- [ ] Embedding configuration
- [ ] Migration tool
- [ ] Performance benchmarks

### Sprint 8 (Week 8)
- [ ] Docker sandbox backend
- [ ] Container image
- [ ] Publish to Docker Hub
- [ ] Add Kubernetes examples

## Testing Strategy

### Unit Tests
- Mock LLM responses
- Test each provider separately
- Test fallback logic
- Test error handling

### Integration Tests
- Docker Compose setup
- Real provider calls (gated)
- End-to-end workflows
- Performance tests

### Security Tests
- Sandbox escape attempts
- Resource limit violations
- Malicious skill detection
- Dependency scanning

## Release Strategy

### v1.1.0 (Week 2)
- Temperature/seed enforcement
- Replay store
- Anthropic/Azure support
- Documentation improvements

### v1.2.0 (Week 4)
- Process sandbox
- OpenTelemetry export
- Structured logging
- Performance improvements

### v1.3.0 (Week 6)
- Git/CI integration
- Security scanning
- Policy enforcement
- Workflow templates

### v1.4.0 (Week 8)
- Scalable vector store
- Docker sandbox
- Container distribution
- Production hardening

### v2.0.0 (Week 12+)
- Multi-agent coordination
- Breaking changes cleanup
- Production-ready release
- Enterprise features

## Success Criteria

### Technical
- [ ] 100% deterministic replay
- [ ] < 10% sandbox overhead
- [ ] < 100ms vector search (10k docs)
- [ ] > 70% test coverage
- [ ] 0 critical security issues

### Product
- [ ] < 15 min time to first workflow
- [ ] All features documented
- [ ] > 100 GitHub stars
- [ ] > 10 contributors

### Performance
- [ ] < 5 min setup time
- [ ] < 2 min build time
- [ ] < 5 min test time
- [ ] < 50MB binary size

## Risk Management

### Technical Risks
1. **Sandbox performance** → Benchmark early, make optional
2. **Provider API changes** → Version pinning, abstraction layer
3. **Vector store migration** → Keep JSON fallback, phased rollout

### Project Risks
1. **Scope creep** → Strict sprint boundaries, MVP focus
2. **Breaking changes** → Semantic versioning, deprecation warnings
3. **Resource constraints** → Prioritize P0/P1, defer P2/P3

## Next Actions

1. **Today:** 
   - ✅ Create GAP_ROADMAP.md
   - ✅ Create IMPLEMENTATION_PLAN.md
   - [ ] Add temperature/seed to LLM requests
   - [ ] Test existing Anthropic/Azure code

2. **This Week:**
   - [ ] Implement replay store
   - [ ] Add architecture diagram
   - [ ] Reorganize documentation
   - [ ] Add troubleshooting guide

3. **Next Week:**
   - [ ] Start sandbox implementation
   - [ ] Add OpenTelemetry
   - [ ] Write integration tests
   - [ ] Prepare v1.1.0 release

---

**Last Updated:** 2026-03-06
**Status:** Ready for Implementation
