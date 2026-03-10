// Configuration system for platform.toml

use serde::{Deserialize, Serialize};
use std::path::Path;

/// Main platform configuration loaded from platform.toml
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PlatformConfig {
    /// Feature flags for each tier
    pub features: FeatureFlags,

    /// Tier 1: Execution Intelligence configuration
    #[serde(default)]
    pub tier1_execution_intelligence: Tier1Config,

    /// Tier 2: Multi-Agent Coordination configuration
    #[serde(default)]
    pub tier2_multi_agent: Tier2Config,

    /// Tier 3: Trust & Verification configuration
    #[serde(default)]
    pub tier3_trust_verification: Tier3Config,

    /// Tier 4: Organizational Scale configuration
    #[serde(default)]
    pub tier4_organizational: Tier4Config,

    /// Tier 5: Ecosystem configuration
    #[serde(default)]
    pub tier5_ecosystem: Tier5Config,
}

/// Feature flags to enable/disable tiers and components
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct FeatureFlags {
    // Tier 1
    #[serde(default)]
    pub adaptive_planning: bool,
    #[serde(default)]
    pub causal_tracing: bool,
    #[serde(default)]
    pub feedback_collection: bool,

    // Tier 2
    #[serde(default)]
    pub negotiation: bool,
    #[serde(default)]
    pub shared_memory: bool,
    #[serde(default)]
    pub agent_marketplace: bool,

    // Tier 3
    #[serde(default)]
    pub formal_verification: bool,
    #[serde(default)]
    pub adversarial_testing: bool,
    #[serde(default)]
    pub cryptographic_commitment: bool,

    // Tier 4
    #[serde(default)]
    pub cost_tracking: bool,
    #[serde(default)]
    pub human_review: bool,
    #[serde(default)]
    pub tenant_isolation: bool,

    // Tier 5
    #[serde(default)]
    pub benchmarking: bool,
    #[serde(default)]
    pub diff_learning: bool,
    #[serde(default)]
    pub workflow_marketplace: bool,
}

/// Tier 1: Execution Intelligence configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Tier1Config {
    /// Maximum number of replans allowed per workflow
    #[serde(default = "default_max_replans")]
    pub max_replans: u32,

    /// Confidence threshold for plan acceptance (0.0 - 1.0)
    #[serde(default = "default_confidence_threshold")]
    pub confidence_threshold: f64,

    /// Enable causal graph export
    #[serde(default)]
    pub export_causal_graph: bool,

    /// Feedback aggregation window in seconds
    #[serde(default = "default_feedback_window")]
    pub feedback_window_secs: u64,
}

impl Default for Tier1Config {
    fn default() -> Self {
        Self {
            max_replans: default_max_replans(),
            confidence_threshold: default_confidence_threshold(),
            export_causal_graph: false,
            feedback_window_secs: default_feedback_window(),
        }
    }
}

/// Tier 2: Multi-Agent Coordination configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Tier2Config {
    /// Negotiation timeout in milliseconds
    #[serde(default = "default_negotiation_timeout")]
    pub negotiation_timeout_ms: u64,

    /// Default CRDT type for shared memory
    #[serde(default = "default_crdt_type")]
    pub default_crdt_type: String,

    /// Agent marketplace URL
    pub marketplace_url: Option<String>,
}

impl Default for Tier2Config {
    fn default() -> Self {
        Self {
            negotiation_timeout_ms: default_negotiation_timeout(),
            default_crdt_type: default_crdt_type(),
            marketplace_url: None,
        }
    }
}

/// Tier 3: Trust & Verification configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Tier3Config {
    /// Verification tools to enable
    #[serde(default)]
    pub enabled_verifiers: Vec<String>,

    /// Adversarial testing intensity
    #[serde(default = "default_attack_intensity")]
    pub attack_intensity: String,

    /// Time budget for adversarial testing in milliseconds
    #[serde(default = "default_attack_budget")]
    pub attack_budget_ms: u64,

    /// Cryptographic algorithm (RSA-4096 or Ed25519)
    #[serde(default = "default_crypto_algorithm")]
    pub crypto_algorithm: String,
}

impl Default for Tier3Config {
    fn default() -> Self {
        Self {
            enabled_verifiers: vec![],
            attack_intensity: default_attack_intensity(),
            attack_budget_ms: default_attack_budget(),
            crypto_algorithm: default_crypto_algorithm(),
        }
    }
}

/// Tier 4: Organizational Scale configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Tier4Config {
    /// Cost tracking granularity
    #[serde(default = "default_cost_granularity")]
    pub cost_granularity: String,

    /// Human review SLA in milliseconds
    #[serde(default = "default_review_sla")]
    pub review_sla_ms: u64,

    /// Default timeout policy for human review
    #[serde(default = "default_timeout_policy")]
    pub timeout_policy: String,

    /// Tenant isolation level (Soft, Hard, Sandboxed)
    #[serde(default = "default_isolation_level")]
    pub isolation_level: String,

    /// Default resource limits per tenant
    #[serde(default)]
    pub default_resource_limits: ResourceLimits,
}

impl Default for Tier4Config {
    fn default() -> Self {
        Self {
            cost_granularity: default_cost_granularity(),
            review_sla_ms: default_review_sla(),
            timeout_policy: default_timeout_policy(),
            isolation_level: default_isolation_level(),
            default_resource_limits: ResourceLimits::default(),
        }
    }
}

/// Tier 5: Ecosystem configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Tier5Config {
    /// Benchmark categories to enable
    #[serde(default)]
    pub enabled_benchmarks: Vec<String>,

    /// Diff learning sample rate (0.0 - 1.0)
    #[serde(default = "default_learning_rate")]
    pub learning_sample_rate: f64,

    /// Workflow marketplace URL
    pub marketplace_url: Option<String>,
}

impl Default for Tier5Config {
    fn default() -> Self {
        Self {
            enabled_benchmarks: vec![],
            learning_sample_rate: default_learning_rate(),
            marketplace_url: None,
        }
    }
}

/// Resource limits for tenant isolation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ResourceLimits {
    #[serde(default = "default_max_workflows")]
    pub max_concurrent_workflows: u32,

    #[serde(default = "default_max_storage")]
    pub max_storage_mb: u64,

    #[serde(default = "default_max_cost")]
    pub max_cost_per_month: f64,
}

impl Default for ResourceLimits {
    fn default() -> Self {
        Self {
            max_concurrent_workflows: default_max_workflows(),
            max_storage_mb: default_max_storage(),
            max_cost_per_month: default_max_cost(),
        }
    }
}

// Default value functions
fn default_max_replans() -> u32 {
    5
}
fn default_confidence_threshold() -> f64 {
    0.7
}
fn default_feedback_window() -> u64 {
    3600
}
fn default_negotiation_timeout() -> u64 {
    300_000
}
fn default_crdt_type() -> String {
    "LWWRegister".to_string()
}
fn default_attack_intensity() -> String {
    "Moderate".to_string()
}
fn default_attack_budget() -> u64 {
    300_000
}
fn default_crypto_algorithm() -> String {
    "Ed25519".to_string()
}
fn default_cost_granularity() -> String {
    "step".to_string()
}
fn default_review_sla() -> u64 {
    1_800_000
}
fn default_timeout_policy() -> String {
    "Block".to_string()
}
fn default_isolation_level() -> String {
    "Soft".to_string()
}
fn default_max_workflows() -> u32 {
    10
}
fn default_max_storage() -> u64 {
    1024
}
fn default_max_cost() -> f64 {
    500.0
}
fn default_learning_rate() -> f64 {
    0.1
}

impl PlatformConfig {
    /// Load configuration from a TOML file
    pub fn from_file<P: AsRef<Path>>(path: P) -> crate::platform::Result<Self> {
        let content = std::fs::read_to_string(path)?;
        let config: PlatformConfig = toml::from_str(&content)?;
        config.validate()?;
        Ok(config)
    }

    /// Create a default configuration with all features disabled
    pub fn default_disabled() -> Self {
        Self {
            features: FeatureFlags::default(),
            tier1_execution_intelligence: Tier1Config::default(),
            tier2_multi_agent: Tier2Config::default(),
            tier3_trust_verification: Tier3Config::default(),
            tier4_organizational: Tier4Config::default(),
            tier5_ecosystem: Tier5Config::default(),
        }
    }

    /// Create a configuration with all features enabled (for testing)
    pub fn all_enabled() -> Self {
        Self {
            features: FeatureFlags {
                adaptive_planning: true,
                causal_tracing: true,
                feedback_collection: true,
                negotiation: true,
                shared_memory: true,
                agent_marketplace: true,
                formal_verification: true,
                adversarial_testing: true,
                cryptographic_commitment: true,
                cost_tracking: true,
                human_review: true,
                tenant_isolation: true,
                benchmarking: true,
                diff_learning: true,
                workflow_marketplace: true,
            },
            tier1_execution_intelligence: Tier1Config::default(),
            tier2_multi_agent: Tier2Config::default(),
            tier3_trust_verification: Tier3Config::default(),
            tier4_organizational: Tier4Config::default(),
            tier5_ecosystem: Tier5Config::default(),
        }
    }

    /// Validate the configuration
    pub fn validate(&self) -> crate::platform::Result<()> {
        // Validate Tier 1 configuration
        if self.tier1_execution_intelligence.confidence_threshold < 0.0
            || self.tier1_execution_intelligence.confidence_threshold > 1.0
        {
            return Err(crate::platform::PlatformError::ConfigurationError(
                "confidence_threshold must be between 0.0 and 1.0".to_string(),
            ));
        }

        if self.tier1_execution_intelligence.max_replans == 0 {
            return Err(crate::platform::PlatformError::ConfigurationError(
                "max_replans must be greater than 0".to_string(),
            ));
        }

        // Validate Tier 2 configuration
        let valid_crdt_types = ["LWWRegister", "GCounter", "ORSet"];
        if !valid_crdt_types.contains(&self.tier2_multi_agent.default_crdt_type.as_str()) {
            return Err(crate::platform::PlatformError::ConfigurationError(format!(
                "default_crdt_type must be one of: {:?}",
                valid_crdt_types
            )));
        }

        // Validate Tier 3 configuration
        let valid_intensities = ["Light", "Moderate", "Aggressive"];
        if !valid_intensities.contains(&self.tier3_trust_verification.attack_intensity.as_str()) {
            return Err(crate::platform::PlatformError::ConfigurationError(format!(
                "attack_intensity must be one of: {:?}",
                valid_intensities
            )));
        }

        let valid_algorithms = ["Ed25519", "RSA-4096"];
        if !valid_algorithms.contains(&self.tier3_trust_verification.crypto_algorithm.as_str()) {
            return Err(crate::platform::PlatformError::ConfigurationError(format!(
                "crypto_algorithm must be one of: {:?}",
                valid_algorithms
            )));
        }

        // Validate Tier 4 configuration
        let valid_granularities = ["step", "workflow", "resource"];
        if !valid_granularities.contains(&self.tier4_organizational.cost_granularity.as_str()) {
            return Err(crate::platform::PlatformError::ConfigurationError(format!(
                "cost_granularity must be one of: {:?}",
                valid_granularities
            )));
        }

        let valid_policies = ["Block", "AssumeYes", "AssumeNo", "UseDefault"];
        if !valid_policies.contains(&self.tier4_organizational.timeout_policy.as_str()) {
            return Err(crate::platform::PlatformError::ConfigurationError(format!(
                "timeout_policy must be one of: {:?}",
                valid_policies
            )));
        }

        let valid_isolation_levels = ["Soft", "Hard", "Sandboxed"];
        if !valid_isolation_levels.contains(&self.tier4_organizational.isolation_level.as_str()) {
            return Err(crate::platform::PlatformError::ConfigurationError(format!(
                "isolation_level must be one of: {:?}",
                valid_isolation_levels
            )));
        }

        if self
            .tier4_organizational
            .default_resource_limits
            .max_concurrent_workflows
            == 0
        {
            return Err(crate::platform::PlatformError::ConfigurationError(
                "max_concurrent_workflows must be greater than 0".to_string(),
            ));
        }

        if self
            .tier4_organizational
            .default_resource_limits
            .max_storage_mb
            == 0
        {
            return Err(crate::platform::PlatformError::ConfigurationError(
                "max_storage_mb must be greater than 0".to_string(),
            ));
        }

        if self
            .tier4_organizational
            .default_resource_limits
            .max_cost_per_month
            <= 0.0
        {
            return Err(crate::platform::PlatformError::ConfigurationError(
                "max_cost_per_month must be greater than 0.0".to_string(),
            ));
        }

        // Validate Tier 5 configuration
        if self.tier5_ecosystem.learning_sample_rate < 0.0
            || self.tier5_ecosystem.learning_sample_rate > 1.0
        {
            return Err(crate::platform::PlatformError::ConfigurationError(
                "learning_sample_rate must be between 0.0 and 1.0".to_string(),
            ));
        }

        Ok(())
    }

    /// Convert feature flags to EnabledTiers for integration
    pub fn to_enabled_tiers(&self) -> crate::platform::integration::EnabledTiers {
        crate::platform::integration::EnabledTiers {
            execution_intelligence: self.features.adaptive_planning
                || self.features.causal_tracing
                || self.features.feedback_collection,
            multi_agent_coordination: self.features.negotiation
                || self.features.shared_memory
                || self.features.agent_marketplace,
            trust_verification: self.features.formal_verification
                || self.features.adversarial_testing
                || self.features.cryptographic_commitment,
            organizational_scale: self.features.cost_tracking
                || self.features.human_review
                || self.features.tenant_isolation,
            ecosystem: self.features.benchmarking
                || self.features.diff_learning
                || self.features.workflow_marketplace,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::io::Write;
    use tempfile::NamedTempFile;

    #[test]
    fn test_default_config() {
        let config = PlatformConfig::default_disabled();
        assert!(!config.features.adaptive_planning);
        assert!(!config.features.causal_tracing);
        assert!(config.validate().is_ok());
    }

    #[test]
    fn test_all_enabled_config() {
        let config = PlatformConfig::all_enabled();
        assert!(config.features.adaptive_planning);
        assert!(config.features.causal_tracing);
        assert!(config.features.formal_verification);
        assert!(config.validate().is_ok());
    }

    #[test]
    fn test_load_from_file() {
        let mut file = NamedTempFile::new().unwrap();
        writeln!(
            file,
            r#"
[features]
adaptive_planning = true
causal_tracing = true
feedback_collection = false

[tier1_execution_intelligence]
max_replans = 10
confidence_threshold = 0.8
export_causal_graph = true
feedback_window_secs = 7200

[tier2_multi_agent]
negotiation_timeout_ms = 600000
default_crdt_type = "GCounter"

[tier3_trust_verification]
enabled_verifiers = ["sqlmap", "semgrep"]
attack_intensity = "Aggressive"
attack_budget_ms = 600000
crypto_algorithm = "RSA-4096"

[tier4_organizational]
cost_granularity = "workflow"
review_sla_ms = 3600000
timeout_policy = "AssumeYes"
isolation_level = "Hard"

[tier4_organizational.default_resource_limits]
max_concurrent_workflows = 20
max_storage_mb = 2048
max_cost_per_month = 1000.0

[tier5_ecosystem]
enabled_benchmarks = ["quality", "performance"]
learning_sample_rate = 0.2
        "#
        )
        .unwrap();

        let config = PlatformConfig::from_file(file.path()).unwrap();

        // Verify feature flags
        assert!(config.features.adaptive_planning);
        assert!(config.features.causal_tracing);
        assert!(!config.features.feedback_collection);

        // Verify Tier 1 config
        assert_eq!(config.tier1_execution_intelligence.max_replans, 10);
        assert_eq!(
            config.tier1_execution_intelligence.confidence_threshold,
            0.8
        );
        assert!(config.tier1_execution_intelligence.export_causal_graph);
        assert_eq!(
            config.tier1_execution_intelligence.feedback_window_secs,
            7200
        );

        // Verify Tier 2 config
        assert_eq!(config.tier2_multi_agent.negotiation_timeout_ms, 600000);
        assert_eq!(config.tier2_multi_agent.default_crdt_type, "GCounter");

        // Verify Tier 3 config
        assert_eq!(
            config.tier3_trust_verification.enabled_verifiers,
            vec!["sqlmap", "semgrep"]
        );
        assert_eq!(
            config.tier3_trust_verification.attack_intensity,
            "Aggressive"
        );
        assert_eq!(config.tier3_trust_verification.attack_budget_ms, 600000);
        assert_eq!(config.tier3_trust_verification.crypto_algorithm, "RSA-4096");

        // Verify Tier 4 config
        assert_eq!(config.tier4_organizational.cost_granularity, "workflow");
        assert_eq!(config.tier4_organizational.review_sla_ms, 3600000);
        assert_eq!(config.tier4_organizational.timeout_policy, "AssumeYes");
        assert_eq!(config.tier4_organizational.isolation_level, "Hard");
        assert_eq!(
            config
                .tier4_organizational
                .default_resource_limits
                .max_concurrent_workflows,
            20
        );
        assert_eq!(
            config
                .tier4_organizational
                .default_resource_limits
                .max_storage_mb,
            2048
        );
        assert_eq!(
            config
                .tier4_organizational
                .default_resource_limits
                .max_cost_per_month,
            1000.0
        );

        // Verify Tier 5 config
        assert_eq!(
            config.tier5_ecosystem.enabled_benchmarks,
            vec!["quality", "performance"]
        );
        assert_eq!(config.tier5_ecosystem.learning_sample_rate, 0.2);
    }

    #[test]
    fn test_validation_confidence_threshold_too_low() {
        let mut config = PlatformConfig::default_disabled();
        config.tier1_execution_intelligence.confidence_threshold = -0.1;

        let result = config.validate();
        assert!(result.is_err());
        assert!(result
            .unwrap_err()
            .to_string()
            .contains("confidence_threshold"));
    }

    #[test]
    fn test_validation_confidence_threshold_too_high() {
        let mut config = PlatformConfig::default_disabled();
        config.tier1_execution_intelligence.confidence_threshold = 1.5;

        let result = config.validate();
        assert!(result.is_err());
        assert!(result
            .unwrap_err()
            .to_string()
            .contains("confidence_threshold"));
    }

    #[test]
    fn test_validation_max_replans_zero() {
        let mut config = PlatformConfig::default_disabled();
        config.tier1_execution_intelligence.max_replans = 0;

        let result = config.validate();
        assert!(result.is_err());
        assert!(result.unwrap_err().to_string().contains("max_replans"));
    }

    #[test]
    fn test_validation_invalid_crdt_type() {
        let mut config = PlatformConfig::default_disabled();
        config.tier2_multi_agent.default_crdt_type = "InvalidType".to_string();

        let result = config.validate();
        assert!(result.is_err());
        assert!(result
            .unwrap_err()
            .to_string()
            .contains("default_crdt_type"));
    }

    #[test]
    fn test_validation_invalid_attack_intensity() {
        let mut config = PlatformConfig::default_disabled();
        config.tier3_trust_verification.attack_intensity = "VeryAggressive".to_string();

        let result = config.validate();
        assert!(result.is_err());
        assert!(result.unwrap_err().to_string().contains("attack_intensity"));
    }

    #[test]
    fn test_validation_invalid_crypto_algorithm() {
        let mut config = PlatformConfig::default_disabled();
        config.tier3_trust_verification.crypto_algorithm = "MD5".to_string();

        let result = config.validate();
        assert!(result.is_err());
        assert!(result.unwrap_err().to_string().contains("crypto_algorithm"));
    }

    #[test]
    fn test_validation_invalid_cost_granularity() {
        let mut config = PlatformConfig::default_disabled();
        config.tier4_organizational.cost_granularity = "invalid".to_string();

        let result = config.validate();
        assert!(result.is_err());
        assert!(result.unwrap_err().to_string().contains("cost_granularity"));
    }

    #[test]
    fn test_validation_invalid_timeout_policy() {
        let mut config = PlatformConfig::default_disabled();
        config.tier4_organizational.timeout_policy = "MaybeYes".to_string();

        let result = config.validate();
        assert!(result.is_err());
        assert!(result.unwrap_err().to_string().contains("timeout_policy"));
    }

    #[test]
    fn test_validation_invalid_isolation_level() {
        let mut config = PlatformConfig::default_disabled();
        config.tier4_organizational.isolation_level = "SuperHard".to_string();

        let result = config.validate();
        assert!(result.is_err());
        assert!(result.unwrap_err().to_string().contains("isolation_level"));
    }

    #[test]
    fn test_validation_zero_max_workflows() {
        let mut config = PlatformConfig::default_disabled();
        config
            .tier4_organizational
            .default_resource_limits
            .max_concurrent_workflows = 0;

        let result = config.validate();
        assert!(result.is_err());
        assert!(result
            .unwrap_err()
            .to_string()
            .contains("max_concurrent_workflows"));
    }

    #[test]
    fn test_validation_zero_max_storage() {
        let mut config = PlatformConfig::default_disabled();
        config
            .tier4_organizational
            .default_resource_limits
            .max_storage_mb = 0;

        let result = config.validate();
        assert!(result.is_err());
        assert!(result.unwrap_err().to_string().contains("max_storage_mb"));
    }

    #[test]
    fn test_validation_negative_max_cost() {
        let mut config = PlatformConfig::default_disabled();
        config
            .tier4_organizational
            .default_resource_limits
            .max_cost_per_month = -100.0;

        let result = config.validate();
        assert!(result.is_err());
        assert!(result
            .unwrap_err()
            .to_string()
            .contains("max_cost_per_month"));
    }

    #[test]
    fn test_validation_learning_rate_too_low() {
        let mut config = PlatformConfig::default_disabled();
        config.tier5_ecosystem.learning_sample_rate = -0.1;

        let result = config.validate();
        assert!(result.is_err());
        assert!(result
            .unwrap_err()
            .to_string()
            .contains("learning_sample_rate"));
    }

    #[test]
    fn test_validation_learning_rate_too_high() {
        let mut config = PlatformConfig::default_disabled();
        config.tier5_ecosystem.learning_sample_rate = 1.5;

        let result = config.validate();
        assert!(result.is_err());
        assert!(result
            .unwrap_err()
            .to_string()
            .contains("learning_sample_rate"));
    }

    #[test]
    fn test_to_enabled_tiers_all_disabled() {
        let config = PlatformConfig::default_disabled();
        let tiers = config.to_enabled_tiers();

        assert!(!tiers.execution_intelligence);
        assert!(!tiers.multi_agent_coordination);
        assert!(!tiers.trust_verification);
        assert!(!tiers.organizational_scale);
        assert!(!tiers.ecosystem);
    }

    #[test]
    fn test_to_enabled_tiers_all_enabled() {
        let config = PlatformConfig::all_enabled();
        let tiers = config.to_enabled_tiers();

        assert!(tiers.execution_intelligence);
        assert!(tiers.multi_agent_coordination);
        assert!(tiers.trust_verification);
        assert!(tiers.organizational_scale);
        assert!(tiers.ecosystem);
    }

    #[test]
    fn test_to_enabled_tiers_partial() {
        let mut config = PlatformConfig::default_disabled();
        config.features.adaptive_planning = true;
        config.features.cost_tracking = true;

        let tiers = config.to_enabled_tiers();

        assert!(tiers.execution_intelligence);
        assert!(!tiers.multi_agent_coordination);
        assert!(!tiers.trust_verification);
        assert!(tiers.organizational_scale);
        assert!(!tiers.ecosystem);
    }

    #[test]
    fn test_valid_crdt_types() {
        let valid_types = ["LWWRegister", "GCounter", "ORSet"];

        for crdt_type in valid_types {
            let mut config = PlatformConfig::default_disabled();
            config.tier2_multi_agent.default_crdt_type = crdt_type.to_string();
            assert!(
                config.validate().is_ok(),
                "CRDT type {} should be valid",
                crdt_type
            );
        }
    }

    #[test]
    fn test_valid_attack_intensities() {
        let valid_intensities = ["Light", "Moderate", "Aggressive"];

        for intensity in valid_intensities {
            let mut config = PlatformConfig::default_disabled();
            config.tier3_trust_verification.attack_intensity = intensity.to_string();
            assert!(
                config.validate().is_ok(),
                "Attack intensity {} should be valid",
                intensity
            );
        }
    }

    #[test]
    fn test_valid_crypto_algorithms() {
        let valid_algorithms = ["Ed25519", "RSA-4096"];

        for algorithm in valid_algorithms {
            let mut config = PlatformConfig::default_disabled();
            config.tier3_trust_verification.crypto_algorithm = algorithm.to_string();
            assert!(
                config.validate().is_ok(),
                "Crypto algorithm {} should be valid",
                algorithm
            );
        }
    }

    #[test]
    fn test_valid_cost_granularities() {
        let valid_granularities = ["step", "workflow", "resource"];

        for granularity in valid_granularities {
            let mut config = PlatformConfig::default_disabled();
            config.tier4_organizational.cost_granularity = granularity.to_string();
            assert!(
                config.validate().is_ok(),
                "Cost granularity {} should be valid",
                granularity
            );
        }
    }

    #[test]
    fn test_valid_timeout_policies() {
        let valid_policies = ["Block", "AssumeYes", "AssumeNo", "UseDefault"];

        for policy in valid_policies {
            let mut config = PlatformConfig::default_disabled();
            config.tier4_organizational.timeout_policy = policy.to_string();
            assert!(
                config.validate().is_ok(),
                "Timeout policy {} should be valid",
                policy
            );
        }
    }

    #[test]
    fn test_valid_isolation_levels() {
        let valid_levels = ["Soft", "Hard", "Sandboxed"];

        for level in valid_levels {
            let mut config = PlatformConfig::default_disabled();
            config.tier4_organizational.isolation_level = level.to_string();
            assert!(
                config.validate().is_ok(),
                "Isolation level {} should be valid",
                level
            );
        }
    }
}
