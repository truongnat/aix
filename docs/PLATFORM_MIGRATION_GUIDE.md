# Platform Migration Guide

**Version:** 1.0  
**Last Updated:** 2026-03-07

---

## Overview

This guide helps you migrate existing workflows to use the Next-Level Platform Improvements. The platform is designed to be opt-in, so you can enable features incrementally without breaking existing workflows.

---

## Migration Strategy

### Phase 1: Enable Cost Tracking (Recommended First Step)

Cost tracking has zero impact on workflow behavior and provides immediate value.

**Before:**
```rust
// No cost tracking
let result = workflow_engine.execute(&workflow)?;
```

**After:**
```rust
// Enable cost tracking
let config = PlatformConfig {
    features: FeatureFlags {
        cost_tracking: true,
        ..Default::default()
    },
    ..PlatformConfig::default_disabled()
};

let services = PlatformServices::from_platform_config(&config)?;
let hooks = WorkflowExecutionHooks::new(Arc::new(services));

// Costs are now tracked automatically
let result = workflow_engine.execute_with_hooks(&workflow, &hooks)?;

// Get cost report
let report = services.cost_tracker.get_cost_report(&workflow.id)?;
println!("Total cost: ${:.2}", report.total_cost);
```

### Phase 2: Add Formal Verification (Security)

Add verification for critical security claims.

**Before:**
```rust
// Agent claims code is secure, but no verification
let code = agent.generate_code(&spec)?;
deploy(code)?;
```

**After:**
```rust
// Enable formal verification
let config = PlatformConfig {
    features: FeatureFlags {
        cost_tracking: true,
        formal_verification: true,
        ..Default::default()
    },
    tier3_trust_verification: Tier3Config {
        enabled_verifiers: vec!["sqlmap".to_string(), "semgrep".to_string()],
        ..Default::default()
    },
    ..PlatformConfig::default_disabled()
};

let services = PlatformServices::from_platform_config(&config)?;

// Verify security claims
let claim = Claim {
    claim_id: "sec_001".to_string(),
    claim_type: ClaimType::NoSQLInjection,
    asserted_by: "agent".to_string(),
    confidence: 0.95,
};

let artifact = Artifact::from_code(&code)?;
let result = services.formal_verifier.verify_claim(&claim, &artifact)?;

if result.verified {
    deploy(code)?;
} else {
    println!("Verification failed: {:?}", result.evidence);
}
```

### Phase 3: Enable Human Review (Governance)

Add human-in-the-loop for ambiguous decisions.

**Before:**
```rust
// Agent makes decision without human oversight
let decision = agent.decide(&ambiguous_situation)?;
execute(decision)?;
```

**After:**
```rust
// Enable human review
let config = PlatformConfig {
    features: FeatureFlags {
        cost_tracking: true,
        formal_verification: true,
        human_review: true,
        ..Default::default()
    },
    tier4_organizational: Tier4Config {
        review_sla_ms: 1800000, // 30 minutes
        timeout_policy: "Block".to_string(),
        ..Default::default()
    },
    ..PlatformConfig::default_disabled()
};

let services = PlatformServices::from_platform_config(&config)?;

// Request human review for ambiguity
let request = ReviewRequest {
    request_id: "rev_001".to_string(),
    workflow_id: workflow.id.clone(),
    step_id: "decision_step".to_string(),
    ambiguity: AmbiguityType::UnclearIntent {
        question: "Should we prioritize speed or accuracy?".to_string(),
    },
    context: HashMap::new(),
    sla_deadline_ms: current_timestamp() + 1800000,
    timeout_policy: TimeoutPolicy::Block,
};

let review_id = services.human_review.request_review(request)?;

// Wait for human decision
loop {
    match services.human_review.check_status(&review_id)? {
        ReviewStatus::Completed { decision } => {
            execute(&decision.decision)?;
            break;
        }
        ReviewStatus::Pending => {
            std::thread::sleep(Duration::from_secs(10));
        }
        ReviewStatus::TimedOut => {
            // Handle timeout per policy
            break;
        }
    }
}
```


### Phase 4: Enable Adaptive Planning (Advanced)

Add automatic replanning for resilient workflows.

**Before:**
```rust
// Workflow fails on test failure
let result = workflow_engine.execute(&workflow)?;
if result.has_failures() {
    // Manual intervention required
    return Err("Tests failed".into());
}
```

**After:**
```rust
// Enable adaptive planning
let config = PlatformConfig {
    features: FeatureFlags {
        cost_tracking: true,
        formal_verification: true,
        human_review: true,
        adaptive_planning: true,
        ..Default::default()
    },
    tier1_execution_intelligence: Tier1Config {
        max_replans: 5,
        confidence_threshold: 0.7,
        ..Default::default()
    },
    ..PlatformConfig::default_disabled()
};

let services = PlatformServices::from_platform_config(&config)?;

// Workflow automatically replans on test failure
let result = workflow_engine.execute_with_adaptive_planning(&workflow, &services)?;
// Tests failed? Planner adds debugging and fix steps automatically
```

### Phase 5: Enable Multi-Tenant Isolation (Enterprise)

Add tenant isolation for multi-team deployments.

**Before:**
```rust
// All workflows share same execution environment
let result = workflow_engine.execute(&workflow)?;
```

**After:**
```rust
// Enable tenant isolation
let config = PlatformConfig {
    features: FeatureFlags {
        cost_tracking: true,
        formal_verification: true,
        human_review: true,
        adaptive_planning: true,
        tenant_isolation: true,
        ..Default::default()
    },
    tier4_organizational: Tier4Config {
        isolation_level: "Hard".to_string(),
        default_resource_limits: ResourceLimits {
            max_concurrent_workflows: 10,
            max_storage_mb: 1024,
            max_cost_per_month: 500.0,
        },
        ..Default::default()
    },
    ..PlatformConfig::default_disabled()
};

let services = PlatformServices::from_platform_config(&config)?;

// Create isolated tenant
let tenant_config = TenantConfig {
    tenant_id: TenantId::new("team_alpha".to_string())?,
    name: "Team Alpha".to_string(),
    resource_limits: ResourceLimits {
        max_concurrent_workflows: 10,
        max_storage_mb: 1024,
        max_cost_per_month: 500.0,
    },
    isolation_level: IsolationLevel::Hard,
};

let tenant_id = services.tenant_isolation.create_tenant(tenant_config)?;

// Execute workflow in isolated context
let context = services.tenant_isolation.get_isolated_context(&tenant_id)?;
let result = workflow_engine.execute_in_tenant(&workflow, &context)?;
```

---

## Common Migration Patterns

### Pattern 1: Gradual Feature Adoption

Start with minimal features and add more as needed.

```rust
// Week 1: Cost tracking only
let mut config = PlatformConfig::default_disabled();
config.features.cost_tracking = true;

// Week 2: Add verification
config.features.formal_verification = true;

// Week 3: Add human review
config.features.human_review = true;

// Week 4: Add adaptive planning
config.features.adaptive_planning = true;
```

### Pattern 2: Feature Flags for A/B Testing

Test new features with a subset of workflows.

```rust
fn get_config_for_workflow(workflow_id: &str) -> PlatformConfig {
    let mut config = PlatformConfig::default_disabled();
    config.features.cost_tracking = true;
    
    // Enable adaptive planning for 10% of workflows
    if workflow_id.chars().last().unwrap().is_digit(10) {
        config.features.adaptive_planning = true;
    }
    
    config
}
```

### Pattern 3: Environment-Based Configuration

Use different configurations for dev/staging/prod.

```rust
fn get_config_for_environment() -> PlatformConfig {
    match std::env::var("ENVIRONMENT").as_deref() {
        Ok("production") => {
            // Full security in production
            let mut config = PlatformConfig::default_disabled();
            config.features.cost_tracking = true;
            config.features.formal_verification = true;
            config.features.cryptographic_commitment = true;
            config.features.human_review = true;
            config.features.tenant_isolation = true;
            config
        }
        Ok("staging") => {
            // Testing features in staging
            let mut config = PlatformConfig::default_disabled();
            config.features.cost_tracking = true;
            config.features.formal_verification = true;
            config.features.adaptive_planning = true;
            config
        }
        _ => {
            // Minimal features in dev
            let mut config = PlatformConfig::default_disabled();
            config.features.cost_tracking = true;
            config
        }
    }
}
```

---

## Breaking Changes

### None!

The platform is designed to be 100% backward compatible. All features are opt-in and disabled by default.

**Existing workflows continue to work without any changes.**

---

## Performance Impact

### Tier 1: Execution Intelligence
- **Adaptive Planning**: +5-10ms per replan check
- **Causal Tracing**: +1-2ms per decision
- **Feedback Collection**: +1ms per signal

### Tier 2: Multi-Agent Coordination
- **Negotiation**: +50-200ms per negotiation session
- **Shared Memory**: +1-5ms per read/write
- **Agent Marketplace**: +10-50ms per search

### Tier 3: Trust & Verification
- **Formal Verification**: +1-30s per verification (depends on tool)
- **Adversarial Testing**: +1-5min per attack session
- **Cryptographic Commitment**: +5-10ms per signature

### Tier 4: Organizational Scale
- **Cost Tracking**: +1ms per resource usage record
- **Human Review**: No overhead (async)
- **Tenant Isolation**: +5-10ms per boundary check

### Tier 5: Ecosystem
- **Benchmarking**: Depends on benchmark
- **Diff Learning**: +1-2ms per edit capture
- **Workflow Marketplace**: +10-50ms per search

---

## Troubleshooting

### Issue: Configuration validation fails

**Symptom:**
```
Error: ConfigurationError("confidence_threshold must be between 0.0 and 1.0")
```

**Solution:**
Check configuration values against validation rules in [Configuration Guide](PLATFORM_CONFIG_GUIDE.md).

### Issue: Verification tools not found

**Symptom:**
```
Error: VerificationError("Verifier 'sqlmap' not found")
```

**Solution:**
Install required verification tools or remove from `enabled_verifiers` list.

### Issue: Human review timeout

**Symptom:**
Workflow blocks indefinitely waiting for human decision.

**Solution:**
Configure appropriate `timeout_policy` in `tier4_organizational` config.

---

## Next Steps

1. Read [Configuration Guide](PLATFORM_CONFIG_GUIDE.md) for detailed configuration options
2. Review [Usage Examples](PLATFORM_USAGE_EXAMPLES.md) for tier-specific examples
3. Check [API Documentation](PLATFORM_API.md) for complete API reference
4. Join community discussions for migration support

---

## Support

For migration assistance:
- GitHub Issues: [github.com/truongnat/agentic-sdlc/issues](https://github.com/truongnat/agentic-sdlc/issues)
- Documentation: [docs/INDEX.md](INDEX.md)
