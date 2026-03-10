// Shared error types for the platform improvements

use std::fmt;

/// Result type alias for platform operations
pub type Result<T> = std::result::Result<T, PlatformError>;

/// Comprehensive error type for all platform operations
#[derive(Debug, Clone)]
pub enum PlatformError {
    // Tier 1: Execution Intelligence errors
    PlanningError(String),
    ReplanFailed(String),
    CausalTracingError(String),
    FeedbackCollectionError(String),

    // Tier 2: Multi-Agent Coordination errors
    NegotiationError(String),
    SharedMemoryError(String),
    CRDTMergeConflict(String),
    MarketplaceError(String),

    // Tier 3: Trust & Verification errors
    VerificationFailed(String),
    AdversarialTestFailed(String),
    SignatureError(String),
    CertificateError(String),

    // Tier 4: Organizational Scale errors
    CostTrackingError(String),
    BudgetExceeded { current: f64, threshold: f64 },
    HumanReviewTimeout(String),
    TenantIsolationViolation(String),
    ResourceLimitExceeded(String),

    // Tier 5: Ecosystem errors
    BenchmarkError(String),
    DiffLearningError(String),
    MarketplacePublishError(String),
    DependencyError(String),

    // Common errors
    ConfigurationError(String),
    InvalidInput(String),
    NotFound(String),
    Unauthorized(String),
    InternalError(String),
    IoError(String),
    SerializationError(String),
    LockError(String),
}

impl fmt::Display for PlatformError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            // Tier 1
            PlatformError::PlanningError(msg) => write!(f, "Planning error: {}", msg),
            PlatformError::ReplanFailed(msg) => write!(f, "Replan failed: {}", msg),
            PlatformError::CausalTracingError(msg) => write!(f, "Causal tracing error: {}", msg),
            PlatformError::FeedbackCollectionError(msg) => {
                write!(f, "Feedback collection error: {}", msg)
            }

            // Tier 2
            PlatformError::NegotiationError(msg) => write!(f, "Negotiation error: {}", msg),
            PlatformError::SharedMemoryError(msg) => write!(f, "Shared memory error: {}", msg),
            PlatformError::CRDTMergeConflict(msg) => write!(f, "CRDT merge conflict: {}", msg),
            PlatformError::MarketplaceError(msg) => write!(f, "Marketplace error: {}", msg),

            // Tier 3
            PlatformError::VerificationFailed(msg) => write!(f, "Verification failed: {}", msg),
            PlatformError::AdversarialTestFailed(msg) => {
                write!(f, "Adversarial test failed: {}", msg)
            }
            PlatformError::SignatureError(msg) => write!(f, "Signature error: {}", msg),
            PlatformError::CertificateError(msg) => write!(f, "Certificate error: {}", msg),

            // Tier 4
            PlatformError::CostTrackingError(msg) => write!(f, "Cost tracking error: {}", msg),
            PlatformError::BudgetExceeded { current, threshold } => {
                write!(
                    f,
                    "Budget exceeded: current cost ${:.2} exceeds threshold ${:.2}",
                    current, threshold
                )
            }
            PlatformError::HumanReviewTimeout(msg) => write!(f, "Human review timeout: {}", msg),
            PlatformError::TenantIsolationViolation(msg) => {
                write!(f, "Tenant isolation violation: {}", msg)
            }
            PlatformError::ResourceLimitExceeded(msg) => {
                write!(f, "Resource limit exceeded: {}", msg)
            }

            // Tier 5
            PlatformError::BenchmarkError(msg) => write!(f, "Benchmark error: {}", msg),
            PlatformError::DiffLearningError(msg) => write!(f, "Diff learning error: {}", msg),
            PlatformError::MarketplacePublishError(msg) => {
                write!(f, "Marketplace publish error: {}", msg)
            }
            PlatformError::DependencyError(msg) => write!(f, "Dependency error: {}", msg),

            // Common
            PlatformError::ConfigurationError(msg) => write!(f, "Configuration error: {}", msg),
            PlatformError::InvalidInput(msg) => write!(f, "Invalid input: {}", msg),
            PlatformError::NotFound(msg) => write!(f, "Not found: {}", msg),
            PlatformError::Unauthorized(msg) => write!(f, "Unauthorized: {}", msg),
            PlatformError::InternalError(msg) => write!(f, "Internal error: {}", msg),
            PlatformError::IoError(msg) => write!(f, "I/O error: {}", msg),
            PlatformError::SerializationError(msg) => write!(f, "Serialization error: {}", msg),
            PlatformError::LockError(msg) => write!(f, "Lock error: {}", msg),
        }
    }
}

impl std::error::Error for PlatformError {}

// Conversions from common error types
impl From<std::io::Error> for PlatformError {
    fn from(err: std::io::Error) -> Self {
        PlatformError::IoError(err.to_string())
    }
}

impl From<serde_json::Error> for PlatformError {
    fn from(err: serde_json::Error) -> Self {
        PlatformError::SerializationError(err.to_string())
    }
}

impl From<toml::de::Error> for PlatformError {
    fn from(err: toml::de::Error) -> Self {
        PlatformError::ConfigurationError(err.to_string())
    }
}
