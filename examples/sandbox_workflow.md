# Sandbox Workflow Example

Example workflow demonstrating sandbox execution with resource limits.

## Overview

This workflow shows:
- Trusted vs Untrusted skill execution
- Resource limit configuration
- Monitoring resource usage
- Handling limit violations

## Workflow

```yaml
name: sandbox_demo
description: Demonstrate sandbox execution

steps:
  - id: trusted_step
    skill: demo.trusted_echo
    input: "This runs in-process (fast)"
    
  - id: untrusted_step
    skill: demo.untrusted_echo
    input: "This runs in subprocess (isolated)"
    depends_on: [trusted_step]
    
  - id: cpu_intensive
    skill: demo.cpu_intensive
    input: "Heavy computation"
    depends_on: [untrusted_step]
    
  - id: memory_intensive
    skill: demo.memory_intensive
    input: "Large data processing"
    depends_on: [cpu_intensive]
```

## Skills

### Trusted Echo (In-Process)

```rust
struct TrustedEchoSkill;

#[async_trait]
impl Skill for TrustedEchoSkill {
    fn name(&self) -> &str {
        "trusted_echo"
    }

    fn capability(&self) -> SkillCapability {
        SkillCapability::new(
            "trusted_echo",
            "Echo input in-process",
            SkillIOType::Text,
            SkillIOType::Text,
            CapabilityPermissions::all(),
            SideEffectClass::Pure,
        )
        .with_trust_tier(TrustTier::Trusted)  // In-process
    }

    async fn execute(
        &self,
        input: SkillInput,
        _ctx: &mut ExecutionContext,
    ) -> Result<SkillOutput> {
        Ok(SkillOutput::text(input.as_text().unwrap_or("").to_string()))
    }
}
```

### Untrusted Echo (Subprocess)

```rust
struct UntrustedEchoSkill;

#[async_trait]
impl Skill for UntrustedEchoSkill {
    fn name(&self) -> &str {
        "untrusted_echo"
    }

    fn capability(&self) -> SkillCapability {
        SkillCapability::new(
            "untrusted_echo",
            "Echo input in subprocess",
            SkillIOType::Text,
            SkillIOType::Text,
            CapabilityPermissions::none(),
            SideEffectClass::Pure,
        )
        .with_trust_tier(TrustTier::Untrusted)  // Subprocess
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

### CPU Intensive (With Limits)

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
        .with_latency(5000)  // Estimated 5 seconds
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
```

## Execution with Limits

```rust
use agentic_sdlc::engine::executor::Executor;
use agentic_sdlc::engine::budget::{ExecutionBudget, ResourceBudget};
use agentic_sdlc::engine::routing::RoutingPolicy;
use agentic_sdlc::engine::security::DomainSecurityPolicy;

#[tokio::main]
async fn main() -> Result<()> {
    // Create executor
    let mut registry = DomainRegistry::new();
    registry.register_domain("demo");
    registry.register_skill("demo", Arc::new(TrustedEchoSkill)).unwrap();
    registry.register_skill("demo", Arc::new(UntrustedEchoSkill)).unwrap();
    registry.register_skill("demo", Arc::new(CpuIntensiveSkill)).unwrap();
    
    let executor = Executor::new(Arc::new(registry));

    // Configure resource limits
    let budget = ExecutionBudget {
        resource_budget: ResourceBudget {
            max_cpu_ms: 10_000,      // 10 seconds CPU
            max_wall_time_ms: 30_000, // 30 seconds wall time
            max_memory_mb: 512,       // 512 MB memory
            max_fs_reads: 100,
            max_fs_writes: 10,
            max_network_calls: 5,
        },
        ..Default::default()
    };

    // Load workflow
    let workflow = load_workflow("examples/sandbox_workflow.md")?;

    // Execute
    let result = executor.execute_workflow(
        &workflow,
        None,
        None,
        vec![],
        0,
        budget,
        RoutingPolicy::for_single_domain("demo"),
        DomainSecurityPolicy::default(),
    ).await?;

    println!("Result: {}", result);

    // Check resource usage
    let usage = executor.get_resource_usage_by_step();
    for (step_id, step_usage) in usage {
        println!("\nStep: {}", step_id);
        println!("  CPU: {:.1}%", step_usage.cpu_percent);
        println!("  Memory: {} MB", step_usage.memory_mb);
        println!("  Time: {} ms", step_usage.elapsed_ms);
    }

    // Check backend types
    let backends = executor.get_backend_type_by_step();
    for (step_id, backend) in backends {
        println!("\nStep: {} -> Backend: {:?}", step_id, backend);
    }

    Ok(())
}
```

## Expected Output

```
Step: trusted_step -> Backend: InProcess
  CPU: 0.0%
  Memory: 0 MB
  Time: 1 ms

Step: untrusted_step -> Backend: Subprocess
  CPU: 5.2%
  Memory: 8 MB
  Time: 52 ms

Step: cpu_intensive -> Backend: Subprocess
  CPU: 95.3%
  Memory: 12 MB
  Time: 5234 ms

Result: done
```

## Handling Violations

```rust
// Execute with strict limits
let strict_budget = ExecutionBudget {
    resource_budget: ResourceBudget {
        max_cpu_ms: 1_000,   // Only 1 second!
        max_memory_mb: 50,    // Only 50 MB!
        ..Default::default()
    },
    ..Default::default()
};

match executor.execute_workflow(..., strict_budget, ...).await {
    Ok(result) => println!("Success: {}", result),
    Err(e) if e.to_string().contains("CPU limit") => {
        println!("CPU limit exceeded!");
        // Retry with higher limit or optimize skill
    }
    Err(e) if e.to_string().contains("Memory limit") => {
        println!("Memory limit exceeded!");
        // Retry with higher limit or process in chunks
    }
    Err(e) if e.to_string().contains("Timeout") => {
        println!("Timeout exceeded!");
        // Retry with longer timeout or break into steps
    }
    Err(e) => println!("Error: {}", e),
}
```

## Performance Comparison

| Skill Type | Execution | Overhead | Use Case |
|------------|-----------|----------|----------|
| Trusted | In-process | 0ms | Verified, local skills |
| Untrusted | Subprocess | ~50-100ms | Imported, unverified skills |

## Best Practices

1. **Use Trusted for verified skills** - No overhead
2. **Use Untrusted for imports** - Safety first
3. **Set realistic limits** - Don't be too restrictive
4. **Monitor resource usage** - Track and optimize
5. **Handle violations gracefully** - Retry or adjust

## See Also

- [Sandbox Guide](../docs/SANDBOX.md) - Complete documentation
- [Sandbox Architecture](../docs/SANDBOX_ARCHITECTURE.md) - Design details
- [Deterministic Mode](../docs/DETERMINISTIC_MODE.md) - Reproducible execution
- [LLM Providers](../docs/LLM_PROVIDERS.md) - Provider configuration

