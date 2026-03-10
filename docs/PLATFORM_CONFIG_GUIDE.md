# Platform Configuration Guide

**Version:** 1.0  
**Last Updated:** 2026-03-07

---

## Overview

This guide provides comprehensive documentation for configuring the Next-Level Platform Improvements via `platform.toml`.

---

## Quick Start

### Minimal Configuration

```toml
# Enable only cost tracking
[features]
cost_tracking = true

[tier4_organizational]
cost_granularity = "step"

[tier4_organizational.default_resource_limits]
max_concurrent_workflows = 10
max_storage_mb = 1024
max_cost_per_month = 500.0
```

### Recommended Production Configuration

```toml
[features]
# Enable core production features
cost_tracking = true
formal_verification = true
cryptographic_commitment = true
human_review = true
tenant_isolation = true

[tier3_trust_verification]
enabled_verifiers = ["sqlmap", "semgrep"]
crypto_algorithm = "Ed25519"

[tier4_organizational]
cost_granularity = "workflow"
review_sla_ms = 3600000  # 1 hour
timeout_policy = "Block"
isolation_level = "Hard"

[tier4_organizational.default_resource_limits]
max_concurrent_workflows = 50
max_storage_mb = 10240
max_cost_per_month = 5000.0
```

---

## Configuration Structure

### Feature Flags

Enable or disable platform capabilities.

```toml
[features]
# Tier 1: Execution Intelligence
adaptive_planning = false
causal_tracing = false
feedback_collection = false

# Tier 2: Multi-Agent Coordination
negotiation = false
shared_memory = false
agent_marketplace = false

# Tier 3: Trust & Verification
formal_verification = false
adversarial_testing = false
cryptographic_commitment = false

# Tier 4: Organizational Scale
cost_tracking = false
human_review = false
tenant_isolation = false

# Tier 5: Ecosystem
benchmarking = false
diff_learning = false
workflow_marketplace = false
```

**Default:** All features disabled (safe default)

---

## Tier 1: Execution Intelligence

### Configuration

```toml
[tier1_execution_intelligence]
max_replans = 5
confidence_threshold = 0.7
export_causal_graph = false
feedback_window_secs = 3600
```

### Parameters

#### `max_replans`
- **Type:** Integer
- **Default:** 5
- **Range:** > 0
- **Description:** Maximum number of replans allowed per workflow
- **Example:** `max_replans = 10`

#### `confidence_threshold`
- **Type:** Float
- **Default:** 0.7
- **Range:** 0.0 - 1.0
- **Description:** Minimum confidence score required for plan acceptance
- **Example:** `confidence_threshold = 0.8`

#### `export_causal_graph`
- **Type:** Boolean
- **Default:** false
- **Description:** Export causal graphs for audit and compliance
- **Example:** `export_causal_graph = true`

#### `feedback_window_secs`
- **Type:** Integer
- **Default:** 3600 (1 hour)
- **Range:** > 0
- **Description:** Time window for feedback signal aggregation (seconds)
- **Example:** `feedback_window_secs = 7200`

---

## Tier 2: Multi-Agent Coordination

### Configuration

```toml
[tier2_multi_agent]
negotiation_timeout_ms = 300000
default_crdt_type = "LWWRegister"
# marketplace_url = "https://marketplace.example.com"
```

### Parameters

#### `negotiation_timeout_ms`
- **Type:** Integer
- **Default:** 300000 (5 minutes)
- **Range:** > 0
- **Description:** Timeout for negotiation sessions (milliseconds)
- **Example:** `negotiation_timeout_ms = 600000`

#### `default_crdt_type`
- **Type:** String
- **Default:** "LWWRegister"
- **Valid Values:** "LWWRegister", "GCounter", "ORSet"
- **Description:** Default CRDT type for shared memory
- **Example:** `default_crdt_type = "GCounter"`

#### `marketplace_url`
- **Type:** String (optional)
- **Default:** None
- **Description:** URL for agent marketplace service
- **Example:** `marketplace_url = "https://marketplace.example.com"`

---

## Tier 3: Trust & Verification

### Configuration

```toml
[tier3_trust_verification]
enabled_verifiers = []
attack_intensity = "Moderate"
attack_budget_ms = 300000
crypto_algorithm = "Ed25519"
```

### Parameters

#### `enabled_verifiers`
- **Type:** Array of strings
- **Default:** []
- **Valid Values:** "sqlmap", "semgrep", "bandit", "eslint", etc.
- **Description:** List of verification tools to enable
- **Example:** `enabled_verifiers = ["sqlmap", "semgrep", "bandit"]`

#### `attack_intensity`
- **Type:** String
- **Default:** "Moderate"
- **Valid Values:** "Light", "Moderate", "Aggressive"
- **Description:** Intensity level for adversarial testing
- **Example:** `attack_intensity = "Aggressive"`

#### `attack_budget_ms`
- **Type:** Integer
- **Default:** 300000 (5 minutes)
- **Range:** > 0
- **Description:** Time budget for adversarial testing (milliseconds)
- **Example:** `attack_budget_ms = 600000`

#### `crypto_algorithm`
- **Type:** String
- **Default:** "Ed25519"
- **Valid Values:** "Ed25519", "RSA-4096"
- **Description:** Cryptographic algorithm for signing decisions
- **Example:** `crypto_algorithm = "RSA-4096"`

---

## Tier 4: Organizational Scale

### Configuration

```toml
[tier4_organizational]
cost_granularity = "step"
review_sla_ms = 1800000
timeout_policy = "Block"
isolation_level = "Soft"

[tier4_organizational.default_resource_limits]
max_concurrent_workflows = 10
max_storage_mb = 1024
max_cost_per_month = 500.0
```

### Parameters

#### `cost_granularity`
- **Type:** String
- **Default:** "step"
- **Valid Values:** "step", "workflow", "resource"
- **Description:** Granularity level for cost tracking
- **Example:** `cost_granularity = "workflow"`

#### `review_sla_ms`
- **Type:** Integer
- **Default:** 1800000 (30 minutes)
- **Range:** > 0
- **Description:** SLA deadline for human review (milliseconds)
- **Example:** `review_sla_ms = 3600000`

#### `timeout_policy`
- **Type:** String
- **Default:** "Block"
- **Valid Values:** "Block", "AssumeYes", "AssumeNo", "UseDefault"
- **Description:** Policy for handling review timeouts
- **Example:** `timeout_policy = "AssumeYes"`

#### `isolation_level`
- **Type:** String
- **Default:** "Soft"
- **Valid Values:** "Soft", "Hard", "Sandboxed"
- **Description:** Tenant isolation level
- **Example:** `isolation_level = "Hard"`

### Resource Limits

#### `max_concurrent_workflows`
- **Type:** Integer
- **Default:** 10
- **Range:** > 0
- **Description:** Maximum concurrent workflows per tenant
- **Example:** `max_concurrent_workflows = 50`

#### `max_storage_mb`
- **Type:** Integer
- **Default:** 1024
- **Range:** > 0
- **Description:** Maximum storage per tenant (megabytes)
- **Example:** `max_storage_mb = 10240`

#### `max_cost_per_month`
- **Type:** Float
- **Default:** 500.0
- **Range:** > 0.0
- **Description:** Maximum monthly cost per tenant (dollars)
- **Example:** `max_cost_per_month = 5000.0`

---

## Tier 5: Ecosystem

### Configuration

```toml
[tier5_ecosystem]
enabled_benchmarks = []
learning_sample_rate = 0.1
# marketplace_url = "https://marketplace.example.com"
```

### Parameters

#### `enabled_benchmarks`
- **Type:** Array of strings
- **Default:** []
- **Valid Values:** "quality", "performance", "security", "cost", etc.
- **Description:** List of benchmark categories to enable
- **Example:** `enabled_benchmarks = ["quality", "performance", "security"]`

#### `learning_sample_rate`
- **Type:** Float
- **Default:** 0.1
- **Range:** 0.0 - 1.0
- **Description:** Sample rate for diff learning (0.0 = disabled, 1.0 = all edits)
- **Example:** `learning_sample_rate = 0.2`

#### `marketplace_url`
- **Type:** String (optional)
- **Default:** None
- **Description:** URL for workflow marketplace service
- **Example:** `marketplace_url = "https://marketplace.example.com"`

---

## Configuration Examples

### Development Environment

```toml
[features]
cost_tracking = true
adaptive_planning = true

[tier1_execution_intelligence]
max_replans = 10
confidence_threshold = 0.6

[tier4_organizational]
cost_granularity = "step"

[tier4_organizational.default_resource_limits]
max_concurrent_workflows = 5
max_storage_mb = 512
max_cost_per_month = 100.0
```

### Staging Environment

```toml
[features]
cost_tracking = true
formal_verification = true
adaptive_planning = true
causal_tracing = true

[tier1_execution_intelligence]
max_replans = 5
confidence_threshold = 0.7
export_causal_graph = true

[tier3_trust_verification]
enabled_verifiers = ["sqlmap", "semgrep"]
crypto_algorithm = "Ed25519"

[tier4_organizational]
cost_granularity = "workflow"

[tier4_organizational.default_resource_limits]
max_concurrent_workflows = 20
max_storage_mb = 2048
max_cost_per_month = 1000.0
```

### Production Environment

```toml
[features]
# Enable all critical features
cost_tracking = true
formal_verification = true
cryptographic_commitment = true
human_review = true
tenant_isolation = true
causal_tracing = true
adversarial_testing = true

[tier1_execution_intelligence]
max_replans = 3
confidence_threshold = 0.8
export_causal_graph = true
feedback_window_secs = 3600

[tier3_trust_verification]
enabled_verifiers = ["sqlmap", "semgrep", "bandit"]
attack_intensity = "Aggressive"
attack_budget_ms = 600000
crypto_algorithm = "Ed25519"

[tier4_organizational]
cost_granularity = "workflow"
review_sla_ms = 3600000
timeout_policy = "Block"
isolation_level = "Hard"

[tier4_organizational.default_resource_limits]
max_concurrent_workflows = 100
max_storage_mb = 20480
max_cost_per_month = 10000.0
```

---

## Validation Rules

Configuration values are validated on load. Invalid values will return an error.

### Tier 1 Validation
- `confidence_threshold`: Must be between 0.0 and 1.0
- `max_replans`: Must be greater than 0
- `feedback_window_secs`: Must be greater than 0

### Tier 2 Validation
- `default_crdt_type`: Must be one of: "LWWRegister", "GCounter", "ORSet"
- `negotiation_timeout_ms`: Must be greater than 0

### Tier 3 Validation
- `attack_intensity`: Must be one of: "Light", "Moderate", "Aggressive"
- `crypto_algorithm`: Must be one of: "Ed25519", "RSA-4096"
- `attack_budget_ms`: Must be greater than 0

### Tier 4 Validation
- `cost_granularity`: Must be one of: "step", "workflow", "resource"
- `timeout_policy`: Must be one of: "Block", "AssumeYes", "AssumeNo", "UseDefault"
- `isolation_level`: Must be one of: "Soft", "Hard", "Sandboxed"
- `max_concurrent_workflows`: Must be greater than 0
- `max_storage_mb`: Must be greater than 0
- `max_cost_per_month`: Must be greater than 0.0
- `review_sla_ms`: Must be greater than 0

### Tier 5 Validation
- `learning_sample_rate`: Must be between 0.0 and 1.0

---

## Environment Variables

Configuration can be overridden with environment variables:

```bash
# Override feature flags
export PLATFORM_COST_TRACKING=true
export PLATFORM_FORMAL_VERIFICATION=true

# Override tier settings
export PLATFORM_MAX_REPLANS=10
export PLATFORM_CONFIDENCE_THRESHOLD=0.8
export PLATFORM_CRYPTO_ALGORITHM=Ed25519
```

---

## Programmatic Configuration

Create and modify configurations in code:

```rust
use agentic_sdlc::platform::PlatformConfig;

// Start with default disabled
let mut config = PlatformConfig::default_disabled();

// Enable features
config.features.cost_tracking = true;
config.features.formal_verification = true;

// Customize settings
config.tier4_organizational.cost_granularity = "workflow".to_string();
config.tier3_trust_verification.crypto_algorithm = "Ed25519".to_string();

// Validate
config.validate()?;

// Use configuration
let services = PlatformServices::from_platform_config(&config)?;
```

---

## Best Practices

1. **Start Minimal**: Begin with cost tracking only, add features incrementally
2. **Validate Early**: Always validate configuration before creating services
3. **Use Defaults**: Leverage default values for most settings
4. **Document Changes**: Comment your configuration file
5. **Test Configurations**: Test with `all_enabled()` to ensure compatibility
6. **Security First**: Enable trust & verification features for production
7. **Monitor Costs**: Enable cost tracking to understand resource usage
8. **Isolate Tenants**: Use tenant isolation for multi-team deployments

---

## Troubleshooting

### Configuration validation fails

**Error:** `ConfigurationError("confidence_threshold must be between 0.0 and 1.0")`

**Solution:** Check parameter values against validation rules above.

### Feature not working

**Error:** Feature enabled but not functioning

**Solution:** Ensure feature flag is set to `true` in `[features]` section.

### Performance issues

**Error:** Slow workflow execution

**Solution:** Disable expensive features like adversarial testing or reduce attack budget.

---

## See Also

- [Migration Guide](PLATFORM_MIGRATION_GUIDE.md)
- [Usage Examples](PLATFORM_USAGE_EXAMPLES.md)
- [API Documentation](PLATFORM_API.md)
- [Example Configuration](../examples/platform_config_example.md)
