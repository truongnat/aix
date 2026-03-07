# Sandbox Execution Guide

Complete guide to skill execution isolation in `agentic-sdlc`.

## 📖 Table of Contents

- [Overview](#overview)
- [How It Works](#how-it-works)
- [Trust Tiers](#trust-tiers)
- [Resource Limits](#resource-limits)
- [Configuration](#configuration)
- [Examples](#examples)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)
- [FAQ](#faq)

---

## Overview

The sandbox system provides **process isolation** for untrusted skills, protecting your system from:
- Resource exhaustion (CPU, memory)
- Runaway processes
- Malicious code execution
- System instability

### Key Features

✅ **Process Isolation** - Untrusted skills run in separate processes  
✅ **Resource Monitoring** - Track CPU, memory, and execution time  
✅ **Automatic Enforcement** - Kill processes that exceed limits  
✅ **Zero Overhead** - Trusted skills run in-process (no performance impact)  
✅ **Transparent** - Works automatically based on TrustTier  

---

## How It Works

### Execution Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     Workflow Engine                          │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
              ┌────────────────┐
              │ Check TrustTier│
              └────────┬───────┘
                       │
         ┌─────────────┴─────────────┐
         │                           │
         ▼                           ▼
┌────────────────┐          ┌────────────────┐
│    Trusted     │          │   Untrusted    │
│  In-Process    │          │    Sandbox     │
│   Execution    │          │   Execution    │
└────────────────┘          └────────┬───────┘
         │                           │
         │                           ▼
         │                  ┌────────────────┐
         │                  │ Spawn Process  │
         │                  │ Monitor CPU    │
         │                  │ Monitor Memory │
         │                  │ Enforce Limits │
         │                  └────────┬───────┘
         │                           │
         └───────────┬───────────────┘
                     ▼
              ┌─────────────┐
              │   Result    │
              └─────────────┘
```

### Backend Selection

The system automatically selects the execution backend based on the skill's `TrustTier`:

| TrustTier | Backend | Isolation | Use Case |
|-----------|---------|-----------|----------|
| **Trusted** | In-Process | None | Local, verified skills |
| **Constrained** | In-Process | Permissions only | Limited access skills |
| **Untrusted** | Subprocess | Process isolation | Imported, unverified skills |

---

## Trust Tiers

### Trusted

**Characteristics:**
- Runs in-process (same process as engine)
- No performance overhead
- Full access to context
- Fast execution

**Use For:**
- Built-in skills
- Locally developed skills
- Verified, audited skills

**Example:**
```rust
SkillCapability::new(
    "my_skill",
    "description",
    SkillIOType::Text,
    SkillIOType::Text,
    CapabilityPermissions::all(),
    SideEffectClass::Pure,
)
.with_trust_tier(TrustTier::Trusted)
```

### Constrained

**Characteristics:**
- Runs in-process
- Limited by capability permissions
- Moderate performance overhead (permission checks)

**Use For:**
- Skills with limited scope
- Read-only operations
- Controlled side effects

**Example:**
```rust
SkillCapability::new(
    "read_only_skill",
    "description",
    SkillIOType::Text,
    SkillIOType::Text,
    CapabilityPermissions::new(
        true,  // fs_read
        false, // fs_write
        false, // network
        false, // env
        false, // process_spawn
    ),
    SideEffectClass::Pure,
)
.with_trust_tier(TrustTier::Constrained)
```

### Untrusted

**Characteristics:**
- Runs in isolated subprocess
- Resource monitoring enabled
- Automatic limit enforcement
- Higher overhead (~50-100ms spawn time)

**Use For:**
- Imported skills from external sources
- Unverified code
- Potentially dangerous operations

**Example:**
```rust
SkillCapability::new(
    "imported_skill",
    "description",
    SkillIOType::Text,
    SkillIOType::Text,
    CapabilityPermissions::none(),
    SideEffectClass::ExternalMutation,
)
.with_trust_tier(TrustTier::Untrusted)
```

---

## Resource Limits

### Available Limits

```rust
pub struct ResourceLimits {
    /// Maximum CPU usage percentage (0-100)
    pub max_cpu_percent: u32,
    
    /// Maximum memory in MB
    pub max_memory_mb: u32,
    
    /// Maximum execution time in milliseconds
    pub max_execution_time_ms: u64,
}
```

### Default Limits

```rust
ResourceLimits {
    max_cpu_percent: 100,        // No CPU limit
    max_memory_mb: u32::MAX,     // No memory limit
    max_execution_time_ms: u64::MAX, // No timeout
}
```

### Setting Limits

Limits are configured via `ExecutionBudget`:

```rust
let budget = ExecutionBudget {
    resource_budget: ResourceBudget {
        max_cpu_ms: 10_000,      // 10 seconds of CPU time
        max_wall_time_ms: 30_000, // 30 seconds wall time
        max_memory_mb: 512,       // 512 MB memory
        max_fs_reads: 100,
        max_fs_writes: 10,
        max_network_calls: 5,
    },
    ..Default::default()
};
```

### Limit Enforcement

When a limit is exceeded:

1. **Process is killed immediately**
2. **Error is returned** with violation details
3. **Telemetry is recorded** for monitoring

**Example Error:**
```
CPU limit exceeded: 75.5% > 50%
Memory limit exceeded: 150MB > 100MB
Timeout exceeded: 6000ms > 5000ms
```

---

## Configuration

### Sandbox Directory

Default: `.agents/sandbox/subprocess`

**Custom Directory:**
```rust
let sandbox = ProcessSandbox::with_sandbox_dir("/tmp/my-sandbox");
```

### Monitoring Interval

Default: 20ms

**Custom Interval:**
```rust
let config = ProcessSandboxConfig {
    sandbox_dir: PathBuf::from(".agents/sandbox/subprocess"),
    monitor_interval_ms: 50, // Check every 50ms
};
let sandbox = ProcessSandbox::new(config);
```

**Trade-offs:**
- **Lower interval** (10ms): More responsive, higher CPU overhead
- **Higher interval** (100ms): Less responsive, lower CPU overhead
- **Recommended**: 20-50ms for most use cases

---

## Examples

### Example 1: Basic Untrusted Skill

```rust
use crate::skill::{Skill, SkillCapability, SubprocessCommand};
use crate::skill::capability::{TrustTier, CapabilityPermissions, SideEffectClass, SkillIOType};
use crate::skill::io::{SkillInput, SkillOutput};
use crate::engine::context::ExecutionContext;
use async_trait::async_trait;
use anyhow::Result;

struct UntrustedEchoSkill;

#[async_trait]
impl Skill for UntrustedEchoSkill {
    fn name(&self) -> &str {
        "untrusted_echo"
    }

    fn capability(&self) -> SkillCapability {
        SkillCapability::new(
            "untrusted_echo",
            "Echo input in isolated subprocess",
            SkillIOType::Text,
            SkillIOType::Text,
            CapabilityPermissions::none(),
            SideEffectClass::Pure,
        )
        .with_trust_tier(TrustTier::Untrusted)
    }

    fn subprocess_command(&self, _input: &SkillInput) -> Option<SubprocessCommand> {
        Some(SubprocessCommand {
            program: "/bin/cat".to_string(),
            args: vec![],
            stdin: None,
        })
    }

    async fn execute(
        &self,
        _input: SkillInput,
        _ctx: &mut ExecutionContext,
    ) -> Result<SkillOutput> {
        Err(anyhow::anyhow!("Must run in subprocess"))
    }
}
```

### Example 2: CPU-Intensive Skill with Limits

```rust
struct CpuIntensiveSkill;

#[async_trait]
impl Skill for CpuIntensiveSkill {
    fn name(&self) -> &str {
        "cpu_intensive"
    }

    fn capability(&self) -> SkillCapability {
        SkillCapability::new(
            "cpu_intensive",
            "CPU-intensive computation",
            SkillIOType::Text,
            SkillIOType::Text,
            CapabilityPermissions::none(),
            SideEffectClass::Pure,
        )
        .with_trust_tier(TrustTier::Untrusted)
        .with_latency(5000) // Estimated 5 seconds
    }

    fn subprocess_command(&self, _input: &SkillInput) -> Option<SubprocessCommand> {
        Some(SubprocessCommand {
            program: "/bin/sh".to_string(),
            args: vec![
                "-c".to_string(),
                "for i in {1..1000000}; do echo $i > /dev/null; done; echo done".to_string(),
            ],
            stdin: None,
        })
    }

    async fn execute(
        &self,
        _input: SkillInput,
        _ctx: &mut ExecutionContext,
    ) -> Result<SkillOutput> {
        Err(anyhow::anyhow!("Must run in subprocess"))
    }
}

// Usage with limits
let budget = ExecutionBudget {
    resource_budget: ResourceBudget {
        max_cpu_ms: 10_000,      // 10 seconds CPU
        max_wall_time_ms: 15_000, // 15 seconds wall time
        max_memory_mb: 100,       // 100 MB
        ..Default::default()
    },
    ..Default::default()
};
```

### Example 3: Memory-Limited Skill

```rust
// Workflow with memory limit
let workflow = Workflow {
    name: "memory_limited".to_string(),
    steps: vec![
        WorkflowStep {
            id: "s1".to_string(),
            skill: "demo.memory_intensive".to_string(),
            input: SkillInput::text("process data"),
            depends_on: vec![],
            retry: None,
        },
    ],
};

let budget = ExecutionBudget {
    resource_budget: ResourceBudget {
        max_memory_mb: 256, // 256 MB limit
        ..Default::default()
    },
    ..Default::default()
};

let result = executor.execute_workflow(
    &workflow,
    None,
    None,
    vec![],
    0,
    budget,
    RoutingPolicy::for_single_domain("demo"),
    DomainSecurityPolicy::default(),
).await;
```

---

## Monitoring

### Resource Usage Tracking

The sandbox automatically tracks:
- **CPU usage** (percentage)
- **Memory usage** (MB)
- **Execution time** (milliseconds)

### Accessing Metrics

```rust
// After execution
let resource_usage = executor.get_resource_usage_by_step();
let step_usage = resource_usage.get("s1").unwrap();

println!("CPU: {:.1}%", step_usage.cpu_percent);
println!("Memory: {} MB", step_usage.memory_mb);
println!("Time: {} ms", step_usage.elapsed_ms);
```

### Telemetry

Resource usage is included in execution traces:

```rust
let traces = executor.get_execution_traces();
for trace in traces {
    println!("Step: {}", trace.node_id);
    println!("Backend: {:?}", trace.backend_type);
    println!("Isolation: {:?}", trace.isolation_mode);
    // Resource usage in trace
}
```

---

## Troubleshooting

### Issue: "Must run in subprocess"

**Cause:** Skill has `TrustTier::Untrusted` but no `subprocess_command()` implementation.

**Solution:** Implement `subprocess_command()`:

```rust
fn subprocess_command(&self, _input: &SkillInput) -> Option<SubprocessCommand> {
    Some(SubprocessCommand {
        program: "/bin/sh".to_string(),
        args: vec!["-c".to_string(), "your-command".to_string()],
        stdin: None,
    })
}
```

### Issue: "CPU limit exceeded"

**Cause:** Process used more CPU than allowed.

**Solution:**
1. Increase CPU limit in `ResourceBudget`
2. Optimize skill implementation
3. Use `TrustTier::Trusted` if skill is verified

### Issue: "Memory limit exceeded"

**Cause:** Process used more memory than allowed.

**Solution:**
1. Increase memory limit: `max_memory_mb: 512`
2. Optimize skill to use less memory
3. Process data in chunks

### Issue: "Timeout exceeded"

**Cause:** Process took longer than allowed.

**Solution:**
1. Increase timeout: `max_wall_time_ms: 60_000`
2. Optimize skill for faster execution
3. Break work into smaller steps

### Issue: Slow subprocess spawn

**Cause:** Process creation overhead (~50-100ms).

**Solution:**
1. Use `TrustTier::Trusted` for verified skills
2. Batch operations to reduce spawn count
3. Accept overhead for security benefits

---

## FAQ

### Q: When should I use Untrusted tier?

**A:** Use `TrustTier::Untrusted` for:
- Skills imported from external sources
- Unverified or untested code
- Skills that might be malicious
- Skills with unknown resource requirements

### Q: What's the performance impact?

**A:**
- **Trusted skills:** 0ms overhead (in-process)
- **Untrusted skills:** ~50-100ms spawn overhead + ~2-5% monitoring overhead
- **Recommendation:** Use Trusted for verified skills, Untrusted for imports

### Q: Can I disable the sandbox?

**A:** No, but you can use `TrustTier::Trusted` to run skills in-process without isolation.

### Q: How accurate is resource monitoring?

**A:**
- **Memory:** Very accurate (via `ps -o rss=`)
- **CPU:** Accurate to ~5% (via `ps -o %cpu=`)
- **Time:** Exact (via `Instant::now()`)

### Q: What happens if a process crashes?

**A:** The sandbox catches crashes and returns an error. The main process continues running.

### Q: Can I run Docker containers?

**A:** Not yet. Docker sandbox is planned for Week 5 (optional enhancement).

### Q: How do I debug sandbox issues?

**A:**
1. Check execution traces: `executor.get_execution_traces()`
2. Check resource usage: `executor.get_resource_usage_by_step()`
3. Check backend type: `executor.get_backend_type_by_step()`
4. Enable debug logging

### Q: Can untrusted skills access the filesystem?

**A:** Only within the sandbox directory (`.agents/sandbox/subprocess`) and only if capability permissions allow it.

### Q: What if I need more isolation?

**A:** Wait for Week 5 Docker sandbox implementation, or use external containerization.

---

## Best Practices

### 1. Choose the Right Trust Tier

```rust
// ✅ Good: Trusted for verified skills
TrustTier::Trusted  // Local, audited skills

// ✅ Good: Untrusted for imports
TrustTier::Untrusted  // External, unverified skills

// ⚠️ Careful: Constrained for limited access
TrustTier::Constrained  // Needs careful permission setup
```

### 2. Set Reasonable Limits

```rust
// ✅ Good: Realistic limits
ResourceBudget {
    max_cpu_ms: 30_000,      // 30 seconds
    max_memory_mb: 512,       // 512 MB
    max_wall_time_ms: 60_000, // 1 minute
    ..Default::default()
}

// ❌ Bad: Too restrictive
ResourceBudget {
    max_cpu_ms: 100,    // 0.1 seconds - too short!
    max_memory_mb: 10,   // 10 MB - too small!
    ..Default::default()
}
```

### 3. Monitor Resource Usage

```rust
// ✅ Good: Check resource usage
let usage = executor.get_resource_usage_by_step();
for (step_id, step_usage) in usage {
    if step_usage.memory_mb > 100 {
        println!("Warning: {} used {} MB", step_id, step_usage.memory_mb);
    }
}
```

### 4. Handle Errors Gracefully

```rust
// ✅ Good: Handle sandbox errors
match executor.execute_workflow(...).await {
    Ok(output) => println!("Success: {}", output),
    Err(e) if e.to_string().contains("limit exceeded") => {
        println!("Resource limit hit: {}", e);
        // Retry with higher limits or different approach
    }
    Err(e) => println!("Error: {}", e),
}
```

---

## Architecture

For detailed architecture information, see:
- [SANDBOX_ARCHITECTURE.md](SANDBOX_ARCHITECTURE.md) - Design and implementation details
- [WEEK4_PLAN.md](WEEK4_PLAN.md) - Development plan and timeline

---

## Version History

- **v1.0** (2026-03-07) - Initial release
  - Process-based sandbox
  - CPU, memory, timeout monitoring
  - Automatic enforcement
  - 183 tests passing

---

**Questions?** Check [TROUBLESHOOTING_LLM.md](TROUBLESHOOTING_LLM.md) or open an issue.

