# Platform Configuration Example

This example demonstrates how to use the platform configuration system to enable and configure the 5-tier platform improvements.

## Basic Usage

### 1. Load Configuration from File

```rust
use agentic_sdlc::platform::PlatformConfig;

// Load configuration from platform.toml
let config = PlatformConfig::from_file("platform.toml")?;

// Configuration is automatically validated
// Invalid values will return an error
```

### 2. Create Platform Services from Configuration

```rust
use agentic_sdlc::platform::{PlatformConfig, PlatformServices};

// Load and validate configuration
let config = PlatformConfig::from_file("platform.toml")?;

// Create platform services with configuration
let services = PlatformServices::from_platform_config(&config)?;

// Check which tiers are enabled
if services.is_execution_intelligence_enabled() {
    println!("Execution Intelligence tier is enabled");
}

if services.is_trust_verification_enabled() {
    println!("Trust & Verification tier is enabled");
}
```

### 3. Use Default Configurations

```rust
use agentic_sdlc::platform::PlatformConfig;

// All features disabled (safe default)
let config = PlatformConfig::default_disabled();

// All features enabled (for testing)
let config = PlatformConfig::all_enabled();
```

## Configuration File Structure

The `platform.toml` file has the following structure:

```toml
# Feature flags to enable/disable capabilities
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

# Tier-specific configuration
[tier1_execution_intelligence]
max_replans = 5                    # Maximum replans per workflow
confidence_threshold = 0.7         # Plan confidence threshold (0.0-1.0)
export_causal_graph = false        # Export causal graphs for audit
feedback_window_secs = 3600        # Feedback aggregation window

[tier2_multi_agent]
negotiation_timeout_ms = 300000    # Negotiation timeout (5 minutes)
default_crdt_type = "LWWRegister"  # LWWRegister, GCounter, or ORSet
# marketplace_url = "https://marketplace.example.com"

[tier3_trust_verification]
enabled_verifiers = []             # List of verification tools
attack_intensity = "Moderate"      # Light, Moderate, or Aggressive
attack_budget_ms = 300000          # Time budget for adversarial testing
crypto_algorithm = "Ed25519"       # Ed25519 or RSA-4096

[tier4_organizational]
cost_granularity = "step"          # step, workflow, or resource
review_sla_ms = 1800000            # Human review SLA (30 minutes)
timeout_policy = "Block"           # Block, AssumeYes, AssumeNo, or UseDefault
isolation_level = "Soft"           # Soft, Hard, or Sandboxed

[tier4_organizational.default_resource_limits]
max_concurrent_workflows = 10
max_storage_mb = 1024
max_cost_per_month = 500.0

[tier5_ecosystem]
enabled_benchmarks = []            # List of benchmark categories
learning_sample_rate = 0.1         # Diff learning sample rate (0.0-1.0)
# marketplace_url = "https://marketplace.example.com"
```

## Configuration Validation

The configuration system validates all values:

### Tier 1 Validation
- `confidence_threshold`: Must be between 0.0 and 1.0
- `max_replans`: Must be greater than 0

### Tier 2 Validation
- `default_crdt_type`: Must be one of: "LWWRegister", "GCounter", "ORSet"

### Tier 3 Validation
- `attack_intensity`: Must be one of: "Light", "Moderate", "Aggressive"
- `crypto_algorithm`: Must be one of: "Ed25519", "RSA-4096"

### Tier 4 Validation
- `cost_granularity`: Must be one of: "step", "workflow", "resource"
- `timeout_policy`: Must be one of: "Block", "AssumeYes", "AssumeNo", "UseDefault"
- `isolation_level`: Must be one of: "Soft", "Hard", "Sandboxed"
- `max_concurrent_workflows`: Must be greater than 0
- `max_storage_mb`: Must be greater than 0
- `max_cost_per_month`: Must be greater than 0.0

### Tier 5 Validation
- `learning_sample_rate`: Must be between 0.0 and 1.0

## Example Configurations

### Minimal Configuration (Cost Tracking Only)

```toml
[features]
cost_tracking = true

[tier4_organizational]
cost_granularity = "step"

[tier4_organizational.default_resource_limits]
max_concurrent_workflows = 10
max_storage_mb = 1024
max_cost_per_month = 500.0
```

### Security-Focused Configuration

```toml
[features]
formal_verification = true
adversarial_testing = true
cryptographic_commitment = true

[tier3_trust_verification]
enabled_verifiers = ["sqlmap", "semgrep", "bandit"]
attack_intensity = "Aggressive"
attack_budget_ms = 600000
crypto_algorithm = "Ed25519"
```

### Enterprise Configuration

```toml
[features]
# Enable all organizational scale features
cost_tracking = true
human_review = true
tenant_isolation = true

# Enable trust & verification
formal_verification = true
cryptographic_commitment = true

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

### Full Platform Configuration

```toml
[features]
# Enable all tiers
adaptive_planning = true
causal_tracing = true
feedback_collection = true
negotiation = true
shared_memory = true
agent_marketplace = true
formal_verification = true
adversarial_testing = true
cryptographic_commitment = true
cost_tracking = true
human_review = true
tenant_isolation = true
benchmarking = true
diff_learning = true
workflow_marketplace = true

[tier1_execution_intelligence]
max_replans = 10
confidence_threshold = 0.8
export_causal_graph = true
feedback_window_secs = 7200

[tier2_multi_agent]
negotiation_timeout_ms = 600000
default_crdt_type = "GCounter"

[tier3_trust_verification]
enabled_verifiers = ["sqlmap", "semgrep", "bandit"]
attack_intensity = "Aggressive"
attack_budget_ms = 600000
crypto_algorithm = "Ed25519"

[tier4_organizational]
cost_granularity = "workflow"
review_sla_ms = 3600000
timeout_policy = "AssumeYes"
isolation_level = "Hard"

[tier4_organizational.default_resource_limits]
max_concurrent_workflows = 100
max_storage_mb = 20480
max_cost_per_month = 10000.0

[tier5_ecosystem]
enabled_benchmarks = ["quality", "performance", "security"]
learning_sample_rate = 0.2
```

## Programmatic Configuration

You can also create and modify configurations programmatically:

```rust
use agentic_sdlc::platform::PlatformConfig;

// Start with default disabled configuration
let mut config = PlatformConfig::default_disabled();

// Enable specific features
config.features.cost_tracking = true;
config.features.formal_verification = true;

// Customize tier settings
config.tier4_organizational.cost_granularity = "workflow".to_string();
config.tier3_trust_verification.crypto_algorithm = "Ed25519".to_string();

// Validate configuration
config.validate()?;

// Create services
let services = PlatformServices::from_platform_config(&config)?;
```

## Error Handling

Configuration errors are returned as `PlatformError::ConfigurationError`:

```rust
use agentic_sdlc::platform::{PlatformConfig, PlatformError};

match PlatformConfig::from_file("platform.toml") {
    Ok(config) => {
        println!("Configuration loaded successfully");
    }
    Err(PlatformError::ConfigurationError(msg)) => {
        eprintln!("Configuration error: {}", msg);
    }
    Err(PlatformError::IoError(msg)) => {
        eprintln!("Failed to read configuration file: {}", msg);
    }
    Err(e) => {
        eprintln!("Unexpected error: {}", e);
    }
}
```

## Best Practices

1. **Start Small**: Begin with a minimal configuration and enable features as needed
2. **Validate Early**: Always validate configuration before creating services
3. **Use Defaults**: Leverage default values for most settings
4. **Document Changes**: Comment your configuration file to explain why features are enabled
5. **Test Configurations**: Test with `all_enabled()` to ensure your code works with all features
6. **Security First**: Enable trust & verification features for production deployments
7. **Monitor Costs**: Enable cost tracking to understand resource usage
8. **Isolate Tenants**: Use tenant isolation for multi-team deployments

## Integration with Workflow Engine

The configuration system integrates seamlessly with the workflow engine:

```rust
use agentic_sdlc::platform::{PlatformConfig, PlatformServices, WorkflowExecutionHooks};
use std::sync::Arc;

// Load configuration
let config = PlatformConfig::from_file("platform.toml")?;

// Create platform services
let services = Arc::new(PlatformServices::from_platform_config(&config)?);

// Create execution hooks
let hooks = WorkflowExecutionHooks::new(services.clone());

// Use hooks in workflow execution
// hooks.on_workflow_start(&workflow, &context, tenant_id)?;
// hooks.on_step_start(&step_id, &workflow, &context)?;
// hooks.on_step_complete(&step_id, output, tokens, cost, agent_id)?;
```
