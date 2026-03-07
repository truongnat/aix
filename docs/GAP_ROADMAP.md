# Gap Closure Roadmap

Kế hoạch khắc phục các gaps quan trọng của `agentic-sdlc` dựa trên phân tích chi tiết.

## Tổng quan

Project hiện tại có ý tưởng tốt về deterministic runtime cho AI agents, nhưng còn nhiều gaps về implementation thực tế. Roadmap này ưu tiên các gaps theo impact và effort.

---

## Phase 1: Critical Foundations (Weeks 1-4)

### 1.1 LLM Determinism & Reproducibility
**Priority:** 🔴 Critical | **Effort:** High

**Problem:**
- LLM outputs non-deterministic do temperature/sampling
- Không có snapshot/replay thực sự cho content
- Claim "deterministic" chỉ đúng với step order, không phải output

**Solution:**
- [ ] Enforce `temperature=0` và `seed` parameter cho tất cả LLM calls
- [ ] Implement content snapshot system:
  - Store LLM request/response pairs với trace_id
  - Replay mode: return cached responses thay vì call LLM
  - Schema: `{trace_id, step_id, request_hash, response, timestamp}`
- [ ] Add `--replay-mode` flag để replay từ snapshot
- [ ] Document determinism scope rõ ràng: orchestration vs content

**Files to modify:**
- `src/skills/llm_subagent.rs` - Add seed/temperature enforcement
- `src/engine/workflow_engine/` - Add snapshot storage
- New: `src/engine/replay_store.rs` - Replay cache implementation

**Acceptance:**
- Same workflow + input → same step order AND same LLM outputs (replay mode)
- Non-replay mode: document variance expectations

---

### 1.2 Real Code Execution Sandbox
**Priority:** 🔴 Critical | **Effort:** High

**Problem:**
- Project chỉ xử lý markdown workflows, không execute code thực
- Không có sandbox cho skill execution
- Security risk từ imported skills

**Solution:**
- [ ] Implement isolated execution environment:
  - Use Docker containers hoặc gVisor cho sandbox
  - Resource limits: CPU, memory, network, filesystem
  - Timeout enforcement per skill execution
- [ ] Add skill execution modes:
  - `trusted`: full access (local skills only)
  - `constrained`: limited filesystem/network
  - `untrusted`: full sandbox (imported skills)
- [ ] Integrate với existing `TrustTier` system
- [ ] Add execution telemetry: resource usage, violations

**Files to create:**
- `src/engine/sandbox/` - Sandbox implementation
- `src/engine/sandbox/docker.rs` - Docker backend
- `src/engine/sandbox/resource_monitor.rs` - Resource tracking

**Files to modify:**
- `src/skill/capability.rs` - Extend TrustTier enforcement
- `src/engine/workflow_engine/executor.rs` - Route through sandbox

**Acceptance:**
- Untrusted skills run in isolated containers
- Resource violations → skill failure with clear error
- Telemetry shows actual resource usage

---

## Phase 2: Enterprise Integration (Weeks 5-8)

### 2.1 Extended LLM Provider Support
**Priority:** 🟠 High | **Effort:** Medium

**Problem:**
- Chỉ support 3 providers (ollama, openai, gemini)
- Thiếu Anthropic Claude, Azure OpenAI, AWS Bedrock
- Fallback logic không rõ ràng

**Solution:**
- [ ] Add provider implementations:
  - Anthropic Claude (already in Cargo.toml!)
  - Azure OpenAI
  - AWS Bedrock (already have aws-sdk-bedrockruntime!)
- [ ] Implement smart fallback:
  - Fallback triggers: timeout, rate limit, 5xx errors
  - Circuit breaker pattern per provider
  - Exponential backoff with jitter
- [ ] Add provider health checks
- [ ] Document fallback behavior clearly

**Files to modify:**
- `src/skills/llm_subagent.rs` - Add new providers
- New: `src/engine/llm/providers/` - Provider implementations
- New: `src/engine/llm/circuit_breaker.rs` - Circuit breaker

**Acceptance:**
- All 6 providers work with same interface
- Fallback triggers documented and tested
- Circuit breaker prevents cascade failures

---

### 2.2 Git & CI/CD Integration
**Priority:** 🟠 High | **Effort:** Medium

**Problem:**
- Không có git integration thực sự (chỉ có policy checks)
- Không push/create PR
- Không integrate với CI/CD systems

**Solution:**
- [ ] Implement git operations:
  - Create branch, commit, push
  - Create PR/MR (GitHub, GitLab, Bitbucket APIs)
  - Handle merge conflicts programmatically
- [ ] CI/CD integration:
  - GitHub Actions workflow templates
  - GitLab CI templates
  - Webhook listeners for CI status
- [ ] Add workflow steps:
  - `git_create_pr` skill
  - `ci_wait_for_status` skill
  - `git_auto_merge` skill (with policies)

**Files to create:**
- `src/skills/git_integration.rs` - Full git operations
- `src/skills/ci_integration.rs` - CI/CD integrations
- `templates/github_actions/` - Workflow templates

**Files to modify:**
- `src/skills/git_ops.rs` - Extend existing git skills

**Acceptance:**
- Workflow can create branch → commit → push → PR
- CI status integrated into workflow decisions
- Auto-merge with policy enforcement

---

## Phase 3: Security & Observability (Weeks 9-12)

### 3.1 Real Security Integration
**Priority:** 🟠 High | **Effort:** High

**Problem:**
- Security check là workflow step, không phải real scan
- AI agent tự review security = circular reasoning
- Không có SAST/DAST integration

**Solution:**
- [ ] Integrate real security tools:
  - Semgrep for SAST
  - Trivy for dependency scanning
  - OWASP ZAP for DAST (optional)
- [ ] Implement security gate:
  - Run scans in sandbox
  - Parse tool outputs
  - Block workflow on critical findings
  - Allow manual override with approval
- [ ] Add security policies:
  - Severity thresholds
  - Allowed CVE exceptions
  - Required approvers for overrides

**Files to create:**
- `src/engine/security/scanners/` - Scanner integrations
- `src/engine/security/policy_engine.rs` - Policy enforcement
- `src/skills/security_scan.rs` - Security scan skills

**Acceptance:**
- Real SAST/DAST scans run before deployment
- Critical findings block workflow
- Security reports in trace timeline

---

### 3.2 OpenTelemetry Integration
**Priority:** 🟡 Medium | **Effort:** Low

**Problem:**
- Custom trace format, không phải OpenTelemetry
- Không integrate với APM tools
- Thiếu alerting/monitoring

**Solution:**
- [ ] Migrate to OpenTelemetry:
  - Use `opentelemetry` and `opentelemetry-otlp` crates
  - Export spans to OTLP endpoint
  - Keep existing timeline format as fallback
- [ ] Add structured logging:
  - Use `tracing` crate
  - Correlate logs with traces
- [ ] Document integration với:
  - Jaeger
  - Grafana Tempo
  - Datadog
  - Honeycomb

**Files to modify:**
- `Cargo.toml` - Add opentelemetry deps
- `src/cli.rs` - Replace custom otel_* functions
- New: `src/engine/telemetry/` - OTel setup

**Acceptance:**
- Traces visible in Jaeger/Grafana
- Logs correlated with trace_id
- Integration guide for popular APM tools

---

## Phase 4: Scalability & Performance (Weeks 13-16)

### 4.1 Scalable Vector Store
**Priority:** 🟠 High | **Effort:** Medium

**Problem:**
- Vector backend là JSON file - không scale
- SQLite single-writer - không concurrent-safe
- Không rõ embedding model

**Solution:**
- [ ] Implement proper vector store:
  - Qdrant (self-hosted) hoặc Pinecone (cloud)
  - PostgreSQL + pgvector (simpler option)
  - Keep JSON as fallback for dev
- [ ] Add embedding configuration:
  - Support multiple embedding models
  - OpenAI embeddings, Sentence Transformers, etc.
  - Cache embeddings to avoid recomputation
- [ ] Concurrent-safe operations:
  - Connection pooling
  - Read replicas for queries
  - Write batching

**Files to create:**
- `src/engine/vector_store/` - Vector store abstraction
- `src/engine/vector_store/qdrant.rs` - Qdrant backend
- `src/engine/vector_store/pgvector.rs` - PostgreSQL backend

**Files to modify:**
- `src/skills/vector_memory.rs` - Use new abstraction

**Acceptance:**
- Support 10k+ documents without performance degradation
- Concurrent reads/writes work correctly
- Embedding model configurable

---

### 4.2 True Multi-Agent Coordination
**Priority:** 🟡 Medium | **Effort:** High

**Problem:**
- Roles là static configuration
- Không có parallel execution
- Không handle conflicts giữa agents

**Solution:**
- [ ] Implement agent coordination:
  - Parallel step execution với dependencies
  - Shared state với optimistic locking
  - Conflict resolution strategies
- [ ] Dynamic role assignment:
  - Agent capabilities registry
  - Task-to-agent matching
  - Load balancing across agents
- [ ] Communication protocol:
  - Message passing between agents
  - Shared blackboard for coordination
  - Event-driven triggers

**Files to create:**
- `src/engine/coordination/` - Multi-agent coordination
- `src/engine/coordination/scheduler.rs` - Parallel scheduler
- `src/engine/coordination/conflict_resolver.rs` - Conflict handling

**Acceptance:**
- Multiple agents execute steps in parallel
- Conflicts detected and resolved
- Coordination overhead < 10% of total time

---

## Phase 5: Developer Experience (Weeks 17-20)

### 5.1 Documentation & Architecture
**Priority:** 🟡 Medium | **Effort:** Low

**Problem:**
- README quá dài, thiếu conceptual explanation
- Không có architecture diagram
- File naming vague

**Solution:**
- [ ] Restructure documentation:
  - Separate: Getting Started, Concepts, Reference, Guides
  - Add architecture diagrams (use Mermaid)
  - Add sequence diagrams for key flows
- [ ] Improve file organization:
  - Rename `valid_flow.md` → `examples/basic_workflow.md`
  - Rename `demo.md` → `examples/demo_scenario.md`
  - Add `docs/concepts/` folder
- [ ] Add interactive tutorials:
  - Step-by-step workflow creation
  - Skill development guide
  - Troubleshooting guide

**Files to create:**
- `docs/concepts/ARCHITECTURE.md` - System architecture
- `docs/concepts/DETERMINISM.md` - Determinism explained
- `docs/guides/WORKFLOW_CREATION.md` - Tutorial
- `docs/guides/SKILL_DEVELOPMENT.md` - Tutorial

**Acceptance:**
- New users can understand concepts in < 30 minutes
- Architecture clear from diagrams
- Common issues have documented solutions

---

### 5.2 Testing & CI Improvements
**Priority:** 🟡 Medium | **Effort:** Low

**Problem:**
- "137 tests" claimed nhưng không có CI badge
- Live LLM tests require manual flag
- Không có mock layer tốt

**Solution:**
- [ ] Improve test infrastructure:
  - Mock LLM responses for unit tests
  - Contract tests for provider integrations
  - Integration tests với Docker Compose
- [ ] CI/CD pipeline:
  - GitHub Actions workflow (already exists!)
  - Add test coverage reporting
  - Add performance benchmarks
  - Publish binary releases
- [ ] Add test documentation:
  - How to run tests locally
  - How to add new tests
  - Test architecture explanation

**Files to create:**
- `tests/mocks/` - Mock LLM responses
- `.github/workflows/release.yml` - Release automation
- `docs/TESTING.md` - Test guide

**Files to modify:**
- `.github/workflows/ci.yml` - Add coverage, benchmarks

**Acceptance:**
- CI badge shows passing tests
- Test coverage > 70%
- Binary releases published automatically

---

### 5.3 Branding & Maturity
**Priority:** 🟡 Medium | **Effort:** Low

**Problem:**
- Tool name (`antigrav`) ≠ repo name (`agentic-sdlc`)
- v1.0.1 nhưng chỉ 27 commits, 1 star
- Không có binary distribution

**Solution:**
- [ ] Unify branding:
  - Decide: keep `antigrav` or rename to `agentic-sdlc`
  - Update all references consistently
  - Create logo/visual identity
- [ ] Improve project maturity signals:
  - Add CONTRIBUTING.md
  - Add CODE_OF_CONDUCT.md
  - Add SECURITY.md with vulnerability reporting
  - Add project roadmap to README
- [ ] Distribution:
  - Publish to crates.io
  - Binary releases for major platforms
  - Docker image
  - Homebrew formula (macOS)

**Files to create:**
- `CONTRIBUTING.md` - Contribution guide
- `CODE_OF_CONDUCT.md` - Community guidelines
- `SECURITY.md` - Security policy
- `Dockerfile` - Container image
- `homebrew/antigrav.rb` - Homebrew formula

**Acceptance:**
- Consistent naming everywhere
- Published on crates.io
- Easy installation on all platforms

---

## Implementation Priority Matrix

| Phase | Gap | Impact | Effort | Priority | Weeks |
|-------|-----|--------|--------|----------|-------|
| 1 | LLM Determinism | 🔴 Critical | High | P0 | 1-2 |
| 1 | Code Sandbox | 🔴 Critical | High | P0 | 3-4 |
| 2 | LLM Providers | 🟠 High | Medium | P1 | 5-6 |
| 2 | Git/CI Integration | 🟠 High | Medium | P1 | 7-8 |
| 3 | Security Integration | 🟠 High | High | P1 | 9-11 |
| 3 | OpenTelemetry | 🟡 Medium | Low | P2 | 12 |
| 4 | Vector Store | 🟠 High | Medium | P1 | 13-14 |
| 4 | Multi-Agent | 🟡 Medium | High | P2 | 15-16 |
| 5 | Documentation | 🟡 Medium | Low | P2 | 17-18 |
| 5 | Testing/CI | 🟡 Medium | Low | P2 | 19 |
| 5 | Branding | 🟡 Medium | Low | P3 | 20 |

---

## Success Metrics

### Technical Metrics
- [ ] Deterministic replay: 100% reproducibility in replay mode
- [ ] Security: 0 critical vulnerabilities in production
- [ ] Performance: Vector search < 100ms for 10k docs
- [ ] Reliability: 99.9% workflow completion rate
- [ ] Test coverage: > 70%

### Product Metrics
- [ ] Time to first workflow: < 15 minutes
- [ ] Documentation completeness: All features documented
- [ ] Community: > 100 stars, > 10 contributors
- [ ] Adoption: > 50 production deployments

### Developer Experience
- [ ] Setup time: < 5 minutes
- [ ] Build time: < 2 minutes
- [ ] Test time: < 5 minutes
- [ ] Binary size: < 50MB

---

## Risk Mitigation

### Technical Risks
1. **Sandbox performance overhead**
   - Mitigation: Benchmark early, optimize hot paths
   - Fallback: Make sandbox optional for trusted environments

2. **LLM provider API changes**
   - Mitigation: Abstract provider interface, version pinning
   - Fallback: Maintain multiple provider versions

3. **Vector store migration complexity**
   - Mitigation: Phased rollout, keep JSON fallback
   - Fallback: Document manual migration path

### Project Risks
1. **Scope creep**
   - Mitigation: Strict phase boundaries, MVP per phase
   - Fallback: Cut P3 features if needed

2. **Breaking changes**
   - Mitigation: Semantic versioning, deprecation warnings
   - Fallback: Maintain v1.x branch for stability

---

## Next Steps

1. **Week 1:** Start Phase 1.1 (LLM Determinism)
   - Design snapshot schema
   - Implement replay store
   - Add temperature/seed enforcement

2. **Week 2:** Continue Phase 1.1 + Start Phase 1.2
   - Complete replay mode
   - Design sandbox architecture
   - Prototype Docker backend

3. **Week 3-4:** Complete Phase 1
   - Finish sandbox implementation
   - Integration testing
   - Documentation

4. **Week 5+:** Follow phase sequence
   - Review progress weekly
   - Adjust priorities based on feedback
   - Release incremental versions

---

## Version Milestones

- **v1.1.0** (Week 4): Determinism + Sandbox
- **v1.2.0** (Week 8): Enterprise LLM + Git/CI
- **v1.3.0** (Week 12): Security + Observability
- **v1.4.0** (Week 16): Scalability + Multi-Agent
- **v2.0.0** (Week 20): Production-Ready Release

---

## Contributing

Roadmap này là living document. Contributions welcome:
- Open issues cho specific gaps
- Submit PRs theo phase priority
- Discuss trong GitHub Discussions

**Last Updated:** 2026-03-06
**Status:** Draft → Review → Implementation
