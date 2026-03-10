# Platform Quick Reference

**Version:** 1.0  
**Last Updated:** 2026-03-07

---

## 5-Minute Overview

### What is it?

Next-Level Platform Improvements transform the agentic SDLC platform into an enterprise-grade system with 5 tiers of capabilities.

### The 5 Tiers

| Tier | Focus | Key Features |
|------|-------|--------------|
| **1. Execution Intelligence** | Adaptive & Observable | Adaptive planning, causal tracing, feedback loops |
| **2. Multi-Agent Coordination** | Collaboration | Negotiation, shared memory (CRDT), agent marketplace |
| **3. Trust & Verification** | Security | Formal verification, adversarial testing, crypto commitment |
| **4. Organizational Scale** | Governance | Cost tracking, human review, tenant isolation |
| **5. Ecosystem** | Network Effects | Benchmarking, diff learning, workflow marketplace |

---

## Quick Start

### 1. Enable Cost Tracking (5 minutes)

```toml
# platform.toml
[features]
cost_tracking = true
```

```rust
let config = PlatformConfig::from_file("platform.toml")?;
let services = PlatformServices::from_platform_config(&config)?;
let report = services.cost_tracker.get_cost_report("workflow_123")?;
```

### 2. Add Security Verification (10 minutes)

```toml
[features]
cost_tracking = true
formal_verification = true

[tier3_trust_verification]
enabled_verifiers = ["sqlmap", "semgrep"]
```

```rust
let result = services.formal_verifier.verify_claim(&claim, &artifact)?;
```

### 3. Enable Human Review (15 minutes)

```toml
[features]
cost_tracking = true
formal_verification = true
human_review = true
```

```rust
let review_id = services.human_review.request_review(request)?;
```

---

## Configuration Cheat Sheet

### Feature Flags

```toml
[features]
# Tier 1
adaptive_planning = false
causal_tracing = false
feedback_collection = false

# Tier 2
negotiation = false
shared_memory = false
agent_marketplace = false

# Tier 3
formal_verification = false
adversarial_testing = false
cryptographic_commitment = false

# Tier 4
cost_tracking = false
human_review = false
tenant_isolation = false

# Tier 5
benchmarking = false
diff_learning = false
workflow_marketplace = false
```

### Common Configurations

**Development:**
```toml
[features]
cost_tracking = true
```

**Staging:**
```toml
[features]
cost_tracking = true
formal_verification = true
adaptive_planning = true
```

**Production:**
```toml
[features]
cost_tracking = true
formal_verification = true
cryptographic_commitment = true
human_review = true
tenant_isolation = true
```

---

## API Quick Reference

### Tier 1: Execution Intelligence

```rust
// Adaptive Planning
let plan = planner.generate_plan(&workflow, &context)?;
let new_plan = planner.replan(&plan, &trigger)?;

// Causal Tracing
tracer.log_decision(decision)?;
let graph = tracer.export_causal_graph()?;

// Feedback Collection
collector.ingest_signal(signal)?;
let recommendations = collector.get_recommendations("workflow_id")?;
```

### Tier 2: Multi-Agent Coordination

```rust
// Negotiation
let session = negotiation.initiate_negotiation(topic)?;
negotiation.submit_position(&session_id, agent_id, position)?;
let resolution = negotiation.resolve(&session_id)?;

// Shared Memory
memory.write(key, value, agent_id)?;
let value = memory.read(key)?;
let conflicts = memory.merge()?;

// Agent Marketplace
marketplace.register_agent(profile)?;
let agents = marketplace.search_agents(criteria)?;
let team = marketplace.compose_team(&task)?;
```

### Tier 3: Trust & Verification

```rust
// Formal Verification
let result = verifier.verify_claim(&claim, &artifact)?;

// Adversarial Testing
let report = tester.attack(&artifact, profile)?;

// Cryptographic Commitment
let signed = commitment.sign_decision(&decision, &agent_id)?;
let valid = commitment.verify_signature(&signed)?;
```

### Tier 4: Organizational Scale

```rust
// Cost Tracking
cost_tracker.track_usage(usage)?;
let report = cost_tracker.get_cost_report("workflow_id")?;
let roi = cost_tracker.calculate_roi("workflow_id", manual_cost)?;

// Human Review
let review_id = human_review.request_review(request)?;
let status = human_review.check_status(&review_id)?;

// Tenant Isolation
let tenant_id = isolation.create_tenant(config)?;
let context = isolation.get_isolated_context(&tenant_id)?;
isolation.enforce_boundaries(&tenant_id, &operation)?;
```

### Tier 5: Ecosystem

```rust
// Benchmarking
let result = benchmark_service.run_benchmark(benchmark)?;
let comparison = benchmark_service.compare_results(results)?;

// Diff Learning
diff_learning.capture_edit(edit)?;
let patterns = diff_learning.analyze_patterns("workflow_id")?;

// Workflow Marketplace
marketplace.publish_workflow(package)?;
let workflows = marketplace.search_workflows(query)?;
marketplace.install_workflow(&package_id, version)?;
```

---

## Common Use Cases

### Use Case 1: Track Costs

**Goal:** Understand LLM costs per workflow

**Configuration:**
```toml
[features]
cost_tracking = true
```

**Code:**
```rust
let report = services.cost_tracker.get_cost_report("workflow_123")?;
println!("Total: ${:.2}", report.total_cost);
```

### Use Case 2: Verify Security

**Goal:** Verify code has no SQL injection

**Configuration:**
```toml
[features]
formal_verification = true

[tier3_trust_verification]
enabled_verifiers = ["sqlmap"]
```

**Code:**
```rust
let claim = Claim {
    claim_type: ClaimType::NoSQLInjection,
    ..Default::default()
};
let result = services.formal_verifier.verify_claim(&claim, &artifact)?;
```

### Use Case 3: Require Human Approval

**Goal:** Require human approval for critical decisions

**Configuration:**
```toml
[features]
human_review = true

[tier4_organizational]
review_sla_ms = 1800000
timeout_policy = "Block"
```

**Code:**
```rust
let request = ReviewRequest {
    ambiguity: AmbiguityType::RiskDecision { risk_level: Severity::High },
    ..Default::default()
};
let review_id = services.human_review.request_review(request)?;
```

### Use Case 4: Isolate Teams

**Goal:** Isolate workflows for different teams

**Configuration:**
```toml
[features]
tenant_isolation = true

[tier4_organizational]
isolation_level = "Hard"
```

**Code:**
```rust
let tenant_id = services.tenant_isolation.create_tenant(config)?;
let context = services.tenant_isolation.get_isolated_context(&tenant_id)?;
```

---

## Performance Impact

| Feature | Overhead |
|---------|----------|
| Cost Tracking | +1ms |
| Causal Tracing | +1-2ms |
| Adaptive Planning | +5-10ms |
| Shared Memory | +1-5ms |
| Formal Verification | +1-30s |
| Adversarial Testing | +1-5min |
| Crypto Commitment | +5-10ms |
| Human Review | Async (no overhead) |
| Tenant Isolation | +5-10ms |

---

## Documentation Map

### Getting Started (30 minutes)
1. [Platform Overview](PLATFORM_OVERVIEW.md) - 20 min
2. [Quick Start](#quick-start) - 10 min

### Implementation (2 hours)
1. [Migration Guide](PLATFORM_MIGRATION_GUIDE.md) - 25 min
2. [Configuration Guide](PLATFORM_CONFIG_GUIDE.md) - 30 min
3. [Usage Examples](PLATFORM_USAGE_EXAMPLES.md) - 35 min
4. [API Documentation](PLATFORM_API.md) - 40 min

### Reference (as needed)
- [Tier 1 API](platform/TIER1_API.md)
- [Configuration Example](../examples/platform_config_example.md)
- [Requirements](../.kiro/specs/next-level-platform-improvements/requirements.md)
- [Design](../.kiro/specs/next-level-platform-improvements/design.md)

---

## Troubleshooting

### Configuration validation fails

**Error:** `ConfigurationError("confidence_threshold must be between 0.0 and 1.0")`

**Fix:** Check parameter values in [Configuration Guide](PLATFORM_CONFIG_GUIDE.md)

### Feature not working

**Error:** Feature enabled but not functioning

**Fix:** Ensure feature flag is `true` in `[features]` section

### Verification tools not found

**Error:** `VerificationError("Verifier 'sqlmap' not found")`

**Fix:** Install tools or remove from `enabled_verifiers`

---

## Next Steps

1. ✅ Read [Platform Overview](PLATFORM_OVERVIEW.md)
2. ✅ Try [Quick Start](#quick-start)
3. ✅ Review [Migration Guide](PLATFORM_MIGRATION_GUIDE.md)
4. ✅ Configure [platform.toml](PLATFORM_CONFIG_GUIDE.md)
5. ✅ Explore [Usage Examples](PLATFORM_USAGE_EXAMPLES.md)

---

## Support

- **Documentation:** [docs/INDEX.md](INDEX.md)
- **GitHub:** [github.com/truongnat/agentic-sdlc](https://github.com/truongnat/agentic-sdlc)
- **Examples:** [examples/](../examples/)

---

**Version:** 1.0  
**Status:** Production Ready ✅  
**Last Updated:** 2026-03-07
