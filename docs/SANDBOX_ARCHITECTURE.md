# Sandbox Architecture

Architecture design for skill execution isolation in `agentic-sdlc`.

## 🎯 Goals

1. **Security:** Isolate untrusted skills from system
2. **Resource Control:** Enforce CPU, memory, time limits
3. **Compatibility:** No breaking changes to existing skills
4. **Performance:** Minimal overhead for trusted skills

## 📊 Current State

### Existing Components

**TrustTier System:**
```rust
pub enum TrustTier {
    Trusted,      // Local, verified skills
    Constrained,  // Limited permissions
    Untrusted,    // Imported, unverified skills
}
```

**Capability Permissions:**
```rust
pub struct CapabilityPermissions {
    pub allow_fs_read: bool,
    pub allow_fs_write: bool,
    pub allow_network: bool,
    pub allow_env: bool,
    pub allow_process_spawn: bool,
}
```

**Resource Budget:**
```rust
pub struct ResourceBudget {
    pub max_cpu_ms: u64,
    pub max_wall_time_ms: u64,
    pub max_fs_reads: u32,
    pub max_fs_writes: u32,
    pub max_network_calls: u32,
    pub max_memory_mb: u32,
}
```

### Current Execution

All skills execute in the same process:
```
Workflow Engine
  ↓
Skill Executor
  ↓
Skill::execute() ← All skills run here (same process)
```

**Problems:**
- No isolation between skills
- Untrusted skills can access everything
- Resource limits not enforced
- Security risk

## 🏗️ Proposed Architecture

### High-Level Design

```
Workflow Engine
  ↓
Skill Executor
  ↓
  ├─→ Trusted Skills → In-Process Execution (fast)
  │
  └─→ Untrusted Skills → Sandbox → Isolated Process
                            ↓
                      Resource Monitor
```

### Components

#### 1. Sandbox Trait

```rust
/// Trait for skill execution isolation
pub trait Sandbox: Send + Sync {
    /// Execute skill in isolated environment
    async fn execute(
        &self,
        skill_name: &str,
        input: SkillInput,
        timeout: Duration,
        resource_limits: ResourceLimits,
    ) -> Result<SandboxResult>;
    
    /// Check if sandbox is available
    fn is_available(&self) -> bool;
    
    /// Get sandbox type
    fn sandbox_type(&self) -> SandboxType;
}

pub enum SandboxType {
    Process,  // Week 4
    Docker,   // Week 5 (optional)
}
```

#### 2. ProcessSandbox

```rust
/// Process-based sandbox implementation
pub struct ProcessSandbox {
    config: SandboxConfig,
}

impl ProcessSandbox {
    /// Create new process sandbox
    pub fn new(config: SandboxConfig) -> Self;
    
    /// Spawn isolated process
    async fn spawn_process(
        &self,
        skill_name: &str,
        input: &SkillInput,
    ) -> Result<Child>;
    
    /// Monitor process resources
    async fn monitor_resources(
        &self,
        pid: u32,
    ) -> Result<ResourceUsage>;
    
    /// Enforce resource limits
    async fn enforce_limits(
        &self,
        pid: u32,
        limits: &ResourceLimits,
    ) -> Result<()>;
    
    /// Kill process
    async fn kill_process(&self, pid: u32) -> Result<()>;
}
```

#### 3. ResourceMonitor

```rust
/// Monitor and enforce resource limits
pub struct ResourceMonitor {
    pid: u32,
    limits: ResourceLimits,
    start_time: Instant,
}

impl ResourceMonitor {
    /// Create new monitor
    pub fn new(pid: u32, limits: ResourceLimits) -> Self;
    
    /// Get current resource usage
    pub async fn current_usage(&self) -> Result<ResourceUsage>;
    
    /// Check if limits exceeded
    pub fn check_limits(&self, usage: &ResourceUsage) -> Option<LimitViolation>;
    
    /// Monitor continuously
    pub async fn monitor_loop(
        &self,
        interval: Duration,
    ) -> Result<ResourceUsage>;
}

pub struct ResourceUsage {
    pub cpu_percent: f32,
    pub memory_mb: u32,
    pub elapsed_ms: u64,
}

pub struct ResourceLimits {
    pub max_cpu_percent: u32,
    pub max_memory_mb: u32,
    pub max_execution_time_ms: u64,
}

pub enum LimitViolation {
    CpuExceeded { actual: f32, limit: u32 },
    MemoryExceeded { actual: u32, limit: u32 },
    TimeoutExceeded { actual: u64, limit: u64 },
}
```

#### 4. SandboxResult

```rust
pub struct SandboxResult {
    pub output: SkillOutput,
    pub resource_usage: ResourceUsage,
    pub violations: Vec<LimitViolation>,
    pub exit_code: i32,
}
```

### Execution Flow

#### Trusted Skills (In-Process)

```
1. Executor receives skill
2. Check TrustTier → Trusted
3. Execute directly: skill.execute(input, ctx)
4. Return result
```

**Characteristics:**
- No overhead
- Full access to context
- Fast
- Existing behavior preserved

#### Untrusted Skills (Sandboxed)

```
1. Executor receives skill
2. Check TrustTier → Untrusted
3. Route to sandbox
4. Sandbox spawns process
5. Pass input via stdin
6. Monitor resources
7. Enforce limits
8. Capture output via stdout
9. Kill process if needed
10. Return result with telemetry
```

**Characteristics:**
- Isolated process
- Resource limits enforced
- Slower (process spawn overhead)
- Secure

### Integration Points

#### 1. Skill Executor

```rust
// In src/engine/workflow_engine/executor.rs

async fn execute_skill(
    &self,
    skill: &dyn Skill,
    input: SkillInput,
    ctx: &mut ExecutionContext,
) -> Result<SkillOutput> {
    match skill.trust_tier() {
        TrustTier::Trusted => {
            // In-process execution (existing)
            skill.execute(input, ctx).await
        }
        TrustTier::Constrained => {
            // In-process with limited permissions (existing)
            skill.execute(input, ctx).await
        }
        TrustTier::Untrusted => {
            // Sandboxed execution (new)
            let sandbox = self.get_sandbox();
            let limits = self.get_resource_limits(ctx);
            let timeout = Duration::from_millis(ctx.step_timeout_ms);
            
            let result = sandbox.execute(
                skill.name(),
                input,
                timeout,
                limits,
            ).await?;
            
            // Record resource usage
            ctx.record_resource_usage(result.resource_usage);
            
            // Check violations
            if !result.violations.is_empty() {
                return Err(anyhow!("Resource limit violated: {:?}", result.violations));
            }
            
            Ok(result.output)
        }
    }
}
```

#### 2. Skill Trait

No changes needed! Existing skills work as-is.

```rust
#[async_trait]
pub trait Skill: Send + Sync {
    fn name(&self) -> &str;
    fn trust_tier(&self) -> TrustTier;  // Already exists
    async fn execute(&self, input: SkillInput, ctx: &mut ExecutionContext) -> Result<SkillOutput>;
}
```

## 🔒 Security Model

### Threat Model

**Threats:**
1. Malicious imported skills
2. Resource exhaustion (CPU, memory)
3. Filesystem access
4. Network access
5. Process spawning

### Mitigations

#### Week 4 (Process Isolation)

| Threat | Mitigation | Effectiveness |
|--------|------------|---------------|
| Resource exhaustion | Resource limits + monitoring | ✅ Good |
| CPU abuse | CPU limit + kill | ✅ Good |
| Memory abuse | Memory limit + kill | ✅ Good |
| Filesystem access | Capability permissions | ⚠️ Partial |
| Network access | Capability permissions | ⚠️ Partial |
| Process spawning | Capability permissions | ⚠️ Partial |

**Limitations:**
- Process can still access filesystem (within permissions)
- Process can still access network (within permissions)
- Not fully isolated

#### Week 5 (Docker, Optional)

| Threat | Mitigation | Effectiveness |
|--------|------------|---------------|
| Resource exhaustion | Docker limits | ✅ Excellent |
| CPU abuse | Docker CPU limit | ✅ Excellent |
| Memory abuse | Docker memory limit | ✅ Excellent |
| Filesystem access | Docker volume mounts | ✅ Excellent |
| Network access | Docker network isolation | ✅ Excellent |
| Process spawning | Docker PID namespace | ✅ Excellent |

**Benefits:**
- Full isolation
- Better security
- More control

### Trust Tier Mapping

| Trust Tier | Execution | Isolation | Use Case |
|------------|-----------|-----------|----------|
| Trusted | In-process | None | Local, verified skills |
| Constrained | In-process | Permissions only | Limited access skills |
| Untrusted | Sandboxed | Process isolation | Imported skills |

## 📊 Performance Considerations

### Overhead Analysis

#### Trusted Skills (In-Process)
- **Overhead:** 0ms (no change)
- **Memory:** Shared process memory
- **CPU:** Direct execution

#### Untrusted Skills (Process Sandbox)
- **Overhead:** ~50-100ms (process spawn)
- **Memory:** Separate process (~10MB base)
- **CPU:** Monitoring overhead (~2-5%)

### Optimization Strategies

1. **Process Pooling** (Future)
   - Pre-spawn processes
   - Reuse for multiple executions
   - Reduce spawn overhead

2. **Lazy Monitoring** (Week 4)
   - Monitor every 100ms (not every ms)
   - Reduce CPU overhead

3. **Selective Sandboxing** (Week 4)
   - Only untrusted skills
   - Trusted skills: no overhead

## 🧪 Testing Strategy

### Unit Tests

```rust
#[tokio::test]
async fn test_process_sandbox_spawn() {
    let sandbox = ProcessSandbox::new(SandboxConfig::default());
    let result = sandbox.execute(
        "echo_skill",
        SkillInput::text("hello"),
        Duration::from_secs(5),
        ResourceLimits::default(),
    ).await;
    assert!(result.is_ok());
}

#[tokio::test]
async fn test_resource_limit_cpu() {
    let sandbox = ProcessSandbox::new(SandboxConfig::default());
    let limits = ResourceLimits {
        max_cpu_percent: 50,
        max_memory_mb: 100,
        max_execution_time_ms: 5000,
    };
    // Test CPU-intensive skill
    let result = sandbox.execute(
        "cpu_intensive_skill",
        SkillInput::text(""),
        Duration::from_secs(10),
        limits,
    ).await;
    // Should fail with CPU limit violation
    assert!(result.is_err());
}
```

### Integration Tests

```rust
#[tokio::test]
async fn test_trusted_skill_no_sandbox() {
    // Trusted skill should execute in-process
    let engine = create_test_engine();
    let workflow = create_test_workflow_with_trusted_skill();
    let result = engine.run(workflow).await;
    assert!(result.is_ok());
    // Verify no sandbox was used
}

#[tokio::test]
async fn test_untrusted_skill_with_sandbox() {
    // Untrusted skill should execute in sandbox
    let engine = create_test_engine();
    let workflow = create_test_workflow_with_untrusted_skill();
    let result = engine.run(workflow).await;
    assert!(result.is_ok());
    // Verify sandbox was used
    // Verify resource usage recorded
}
```

## 📝 Implementation Plan

### Phase 1: Core Sandbox (Day 2)
1. Create `src/engine/sandbox/mod.rs`
2. Define `Sandbox` trait
3. Implement `ProcessSandbox`
4. Basic process spawn/kill
5. Unit tests

### Phase 2: Resource Monitoring (Day 3)
1. Create `src/engine/sandbox/resource_monitor.rs`
2. Implement resource tracking
3. Implement limit enforcement
4. Add telemetry
5. Unit tests

### Phase 3: Integration (Day 4)
1. Modify skill executor
2. Add sandbox routing
3. Integrate with TrustTier
4. End-to-end tests
5. Documentation

## 🔮 Future Enhancements

### Week 5: Docker Sandbox (Optional)

```rust
pub struct DockerSandbox {
    client: Docker,
    config: DockerConfig,
}

impl Sandbox for DockerSandbox {
    async fn execute(...) -> Result<SandboxResult> {
        // 1. Create container
        // 2. Start container
        // 3. Execute skill
        // 4. Monitor resources
        // 5. Stop container
        // 6. Remove container
    }
}
```

### Week 6+: Advanced Features

- Process pooling
- Warm containers
- Network isolation
- Filesystem isolation
- Advanced security (AppArmor, SELinux)

## 📚 References

- [Rust std::process](https://doc.rust-lang.org/std/process/)
- [tokio::process](https://docs.rs/tokio/latest/tokio/process/)
- [sysinfo crate](https://docs.rs/sysinfo/) - Resource monitoring
- [Docker SDK](https://docs.rs/bollard/) - For Week 5

---

**Version:** 1.0  
**Last Updated:** 2026-03-07  
**Status:** Design Complete
