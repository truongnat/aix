# Week 4 Plan - Process Isolation Foundation

## 🎯 Goal

Implement basic process isolation for skill execution as foundation for full sandbox (Gap #2).

**Approach:** Start simple, iterate to complex
- Week 4: Process isolation + resource monitoring
- Week 5: Docker sandbox (if needed)

## 📊 Current Status

**Gap #2: Real Code Execution Sandbox** - 0% Complete

**What Exists:**
- ✅ TrustTier system (Trusted, Constrained, Untrusted)
- ✅ Capability permissions (fs_read, fs_write, network, etc.)
- ✅ Resource budget tracking
- ❌ No actual isolation
- ❌ No sandbox enforcement
- ❌ Skills run in same process

**What's Missing:**
- Process isolation
- Resource limits enforcement
- Sandbox for untrusted skills
- Security boundaries

## 📅 Timeline: 4 Days (12 hours)

### Day 1: Architecture & Design (3 hours)
**Goal:** Design process isolation architecture

**Tasks:**
1. Design sandbox architecture
   - Process-based isolation (Week 4)
   - Docker-based isolation (Week 5, optional)
   - Resource monitoring
   - Security boundaries

2. Define interfaces
   - `Sandbox` trait
   - `ProcessSandbox` implementation
   - `ResourceMonitor` trait

3. Plan integration
   - How skills route through sandbox
   - How to enforce TrustTier
   - How to monitor resources

**Deliverables:**
- `docs/SANDBOX_ARCHITECTURE.md`
- Interface definitions
- Integration plan

---

### Day 2: Process Isolation (4 hours)
**Goal:** Implement basic process isolation

**Tasks:**
1. Create sandbox module
   - `src/engine/sandbox/mod.rs`
   - `src/engine/sandbox/process.rs`
   - `Sandbox` trait definition

2. Implement ProcessSandbox
   - Spawn subprocess for skill execution
   - Pass input via stdin/stdout
   - Capture output
   - Handle errors

3. Add timeout enforcement
   - Kill process after timeout
   - Return timeout error

4. Basic tests
   - Test subprocess spawn
   - Test timeout
   - Test error handling

**Deliverables:**
- `src/engine/sandbox/` module
- `ProcessSandbox` implementation
- Basic tests

---

### Day 3: Resource Monitoring (3 hours)
**Goal:** Monitor resource usage

**Tasks:**
1. Implement ResourceMonitor
   - Track CPU usage
   - Track memory usage
   - Track execution time

2. Add resource limits
   - CPU limit
   - Memory limit
   - Time limit

3. Enforce limits
   - Kill process if exceeded
   - Return resource limit error

4. Add telemetry
   - Log resource usage
   - Include in trace

**Deliverables:**
- `src/engine/sandbox/resource_monitor.rs`
- Resource limit enforcement
- Telemetry integration

---

### Day 4: Integration & Testing (2 hours)
**Goal:** Integrate with workflow engine

**Tasks:**
1. Integrate with executor
   - Route untrusted skills through sandbox
   - Keep trusted skills in-process
   - Use TrustTier to decide

2. Update skill execution
   - Modify skill executor
   - Add sandbox routing
   - Preserve existing behavior

3. End-to-end testing
   - Test trusted skills (no sandbox)
   - Test untrusted skills (with sandbox)
   - Test resource limits

4. Documentation
   - Update README
   - Create SANDBOX.md guide
   - Add examples

**Deliverables:**
- Integrated sandbox
- End-to-end tests
- Documentation

---

## 🎯 Success Criteria

### Functional Requirements
- [ ] Untrusted skills run in separate process
- [ ] Trusted skills run in-process (no overhead)
- [ ] Resource limits enforced (CPU, memory, time)
- [ ] Timeout enforcement works
- [ ] Clear error messages on violations

### Quality Requirements
- [ ] Tests for all components
- [ ] Documentation complete
- [ ] No breaking changes to existing skills
- [ ] Performance overhead < 10% for trusted skills

### Performance Targets
- [ ] Process spawn < 100ms
- [ ] Resource monitoring overhead < 5%
- [ ] Trusted skills: no overhead (in-process)

---

## 📦 Deliverables

### Code (4 files, ~800 lines)

1. `src/engine/sandbox/mod.rs` (100 lines)
   - Module definition
   - Sandbox trait
   - Public API

2. `src/engine/sandbox/process.rs` (400 lines)
   - ProcessSandbox implementation
   - Subprocess management
   - Input/output handling

3. `src/engine/sandbox/resource_monitor.rs` (200 lines)
   - Resource tracking
   - Limit enforcement
   - Telemetry

4. Integration in `src/engine/workflow_engine/executor.rs` (100 lines)
   - Sandbox routing
   - TrustTier enforcement

### Documentation (3 files, ~1,000 lines)

1. `docs/SANDBOX_ARCHITECTURE.md` (300 lines)
   - Architecture overview
   - Design decisions
   - Security model

2. `docs/SANDBOX.md` (500 lines)
   - User guide
   - Configuration
   - Examples
   - Troubleshooting

3. `docs/WEEK4_PROGRESS.md` (200 lines)
   - Progress tracking
   - Issues and solutions

### Tests (~10 tests)

1. Sandbox unit tests
2. Resource monitoring tests
3. Integration tests
4. End-to-end tests

---

## 🔧 Technical Details

### Sandbox Trait

```rust
pub trait Sandbox {
    /// Execute skill in sandbox
    async fn execute(
        &self,
        skill_name: &str,
        input: SkillInput,
        timeout: Duration,
        resource_limits: ResourceLimits,
    ) -> Result<SkillOutput>;
    
    /// Check if sandbox is available
    fn is_available(&self) -> bool;
}
```

### ProcessSandbox

```rust
pub struct ProcessSandbox {
    // Configuration
}

impl ProcessSandbox {
    pub fn new() -> Self { ... }
    
    async fn spawn_process(&self, ...) -> Result<Child> { ... }
    
    async fn monitor_resources(&self, pid: u32) -> ResourceUsage { ... }
    
    async fn enforce_limits(&self, pid: u32, limits: ResourceLimits) -> Result<()> { ... }
}
```

### Resource Limits

```rust
pub struct ResourceLimits {
    pub max_cpu_percent: u32,      // 0-100
    pub max_memory_mb: u32,         // MB
    pub max_execution_time_ms: u64, // milliseconds
}
```

### Integration

```rust
// In executor
match skill.trust_tier() {
    TrustTier::Trusted => {
        // Execute in-process (existing behavior)
        skill.execute(input, ctx).await
    }
    TrustTier::Untrusted => {
        // Execute in sandbox
        sandbox.execute(skill_name, input, timeout, limits).await
    }
}
```

---

## 🎯 Scope Decisions

### In Scope (Week 4)
- ✅ Process isolation
- ✅ Resource monitoring
- ✅ Timeout enforcement
- ✅ Basic security boundaries
- ✅ TrustTier integration

### Out of Scope (Week 5+)
- ❌ Docker containers (too complex for Week 4)
- ❌ Network isolation (process-level sufficient)
- ❌ Filesystem isolation (use permissions)
- ❌ Advanced security (AppArmor, SELinux)

### Why This Approach?

**Week 4 (Process):**
- Simpler to implement
- Faster to test
- Good enough for most use cases
- Foundation for Docker

**Week 5 (Docker, optional):**
- Full isolation
- Better security
- More complex
- Can build on Week 4

---

## 🧪 Testing Strategy

### Unit Tests
- [ ] Sandbox trait implementation
- [ ] Process spawn/kill
- [ ] Resource monitoring
- [ ] Limit enforcement

### Integration Tests
- [ ] Trusted skill execution (in-process)
- [ ] Untrusted skill execution (sandbox)
- [ ] Resource limit violations
- [ ] Timeout handling

### Manual Tests
- [ ] Run workflow with untrusted skills
- [ ] Verify resource limits
- [ ] Check telemetry
- [ ] Test error messages

---

## 📊 Metrics

### Code Metrics
- **Lines Added:** ~800
- **Files Created:** 4
- **Tests Added:** ~10

### Documentation Metrics
- **Guides:** 3
- **Total Lines:** ~1,000

### Time Tracking
- **Day 1:** 3h (Architecture)
- **Day 2:** 4h (Process Isolation)
- **Day 3:** 3h (Resource Monitoring)
- **Day 4:** 2h (Integration)
- **Total:** 12h

---

## 🚀 Impact

### For Users
- **Security:** Untrusted skills isolated
- **Reliability:** Resource limits prevent runaway processes
- **Visibility:** Resource usage tracked

### For Project
- **Gap Closure:** Gap #2 → 50% complete (foundation)
- **Security:** Better than current (no isolation)
- **Foundation:** Ready for Docker (Week 5)

---

## 🎓 Learning Goals

### Technical Skills
- Process management in Rust
- Resource monitoring
- Security boundaries
- Async subprocess handling

### Architecture Skills
- Sandbox design
- Security model
- Integration patterns

---

## 📝 Notes

### Why Not Docker in Week 4?

**Docker is complex:**
- Requires Docker daemon
- Complex setup
- Harder to test
- More dependencies

**Process isolation is simpler:**
- Built into OS
- Easy to test
- Fast to implement
- Good enough for most cases

**Strategy:**
- Week 4: Process (foundation)
- Week 5: Docker (if needed)
- Users can choose

### Alternative: Skip Sandbox?

**No, because:**
- Security risk from imported skills
- Resource limits needed
- Critical gap in roadmap

**But we can:**
- Start simple (process)
- Iterate to complex (Docker)
- Ship incrementally

---

## 🔗 Related Documents

- [Gap Roadmap](GAP_ROADMAP.md)
- [Gap Coverage](GAP_COVERAGE.md)
- [Implementation Plan](IMPLEMENTATION_PLAN.md)
- [Week 3 Summary](WEEK3_SUMMARY.md)

---

**Version:** 1.0  
**Created:** 2026-03-07  
**Status:** Ready to Start  
**Priority:** Critical
