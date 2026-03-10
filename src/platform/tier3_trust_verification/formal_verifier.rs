// Formal Verifier - cross-check outputs with deterministic tools
//
// This module implements formal verification of agent claims using deterministic tools.
// It provides a plugin architecture for registering custom verification tools and
// supports various claim types for security, testing, and compliance verification.

use crate::platform::{types::*, Result, PlatformError};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::{Arc, RwLock};

/// Artifact represents the target of verification (code, configuration, etc.)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Artifact {
    /// Type of artifact (e.g., "source_code", "configuration", "binary")
    pub artifact_type: String,
    /// Content or path to the artifact
    pub content: ArtifactContent,
    /// Metadata about the artifact
    pub metadata: HashMap<String, String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ArtifactContent {
    /// Inline content
    Inline(String),
    /// Path to file or directory
    Path(String),
    /// Binary data
    Binary(Vec<u8>),
}

impl Artifact {
    /// Create a new artifact from inline content
    pub fn from_inline(artifact_type: impl Into<String>, content: impl Into<String>) -> Self {
        Self {
            artifact_type: artifact_type.into(),
            content: ArtifactContent::Inline(content.into()),
            metadata: HashMap::new(),
        }
    }

    /// Create a new artifact from a file path
    pub fn from_path(artifact_type: impl Into<String>, path: impl Into<String>) -> Self {
        Self {
            artifact_type: artifact_type.into(),
            content: ArtifactContent::Path(path.into()),
            metadata: HashMap::new(),
        }
    }

    /// Add metadata to the artifact
    pub fn with_metadata(mut self, key: impl Into<String>, value: impl Into<String>) -> Self {
        self.metadata.insert(key.into(), value.into());
        self
    }
}

/// Claim represents an assertion made by an agent that needs verification
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Claim {
    /// Unique identifier for this claim
    pub claim_id: String,
    /// Type of claim being made
    pub claim_type: ClaimType,
    /// Agent that asserted this claim
    pub asserted_by: AgentId,
    /// Confidence level (0.0 to 1.0)
    pub confidence: f64,
}

impl Claim {
    /// Create a new claim
    pub fn new(
        claim_id: impl Into<String>,
        claim_type: ClaimType,
        asserted_by: impl Into<String>,
        confidence: f64,
    ) -> Result<Self> {
        if confidence < 0.0 || confidence > 1.0 {
            return Err(PlatformError::InvalidInput(
                "Confidence must be between 0.0 and 1.0".to_string(),
            ));
        }

        Ok(Self {
            claim_id: claim_id.into(),
            claim_type,
            asserted_by: asserted_by.into(),
            confidence,
        })
    }
}

/// Types of claims that can be verified
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum ClaimType {
    /// No SQL injection vulnerabilities present
    NoSQLInjection,
    /// No cross-site scripting (XSS) vulnerabilities present
    NoXSS,
    /// All tests pass successfully
    AllTestsPass,
    /// Code coverage meets or exceeds threshold
    CodeCoverage { threshold: f64 },
    /// No secrets or credentials in code
    NoSecrets,
    /// Compliance check passes for specified standard
    ComplianceCheck { standard: String },
}

/// Result of a verification operation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VerificationResult {
    /// Whether the claim was verified successfully
    pub verified: bool,
    /// Name of the verifier tool that produced this result
    pub verifier_tool: String,
    /// Evidence supporting the verification result
    pub evidence: Vec<Evidence>,
    /// Timestamp when verification was performed
    pub timestamp_ms: u64,
}

impl VerificationResult {
    /// Create a successful verification result
    pub fn success(verifier_tool: impl Into<String>, evidence: Vec<Evidence>) -> Self {
        Self {
            verified: true,
            verifier_tool: verifier_tool.into(),
            evidence,
            timestamp_ms: current_timestamp_ms(),
        }
    }

    /// Create a failed verification result
    pub fn failure(verifier_tool: impl Into<String>, evidence: Vec<Evidence>) -> Self {
        Self {
            verified: false,
            verifier_tool: verifier_tool.into(),
            evidence,
            timestamp_ms: current_timestamp_ms(),
        }
    }
}

/// Policy for verification requirements
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VerificationPolicy {
    /// Step type this policy applies to
    pub step_type: String,
    /// Required claim types that must be verified
    pub required_claims: Vec<ClaimType>,
    /// Whether verification failures should block execution
    pub blocking: bool,
    /// Timeout for verification in milliseconds
    pub timeout_ms: u64,
}

impl VerificationPolicy {
    /// Create a new verification policy
    pub fn new(step_type: impl Into<String>) -> Self {
        Self {
            step_type: step_type.into(),
            required_claims: Vec::new(),
            blocking: true,
            timeout_ms: 300_000, // 5 minutes default
        }
    }

    /// Add a required claim type
    pub fn require_claim(mut self, claim_type: ClaimType) -> Self {
        self.required_claims.push(claim_type);
        self
    }

    /// Set whether verification failures should block execution
    pub fn blocking(mut self, blocking: bool) -> Self {
        self.blocking = blocking;
        self
    }

    /// Set verification timeout
    pub fn timeout_ms(mut self, timeout_ms: u64) -> Self {
        self.timeout_ms = timeout_ms;
        self
    }
}

/// Trait for tool-specific verifiers (plugin interface)
pub trait ToolVerifier: Send + Sync {
    /// Name of this verifier tool
    fn name(&self) -> &str;

    /// Verify a claim against an artifact
    fn verify(&self, claim: &Claim, artifact: &Artifact) -> Result<VerificationResult>;

    /// Check if this verifier supports a given claim type
    fn supports_claim_type(&self, claim_type: &ClaimType) -> bool {
        // Default implementation - subclasses should override
        match claim_type {
            ClaimType::NoSQLInjection => false,
            ClaimType::NoXSS => false,
            ClaimType::AllTestsPass => false,
            ClaimType::CodeCoverage { .. } => false,
            ClaimType::NoSecrets => false,
            ClaimType::ComplianceCheck { .. } => false,
        }
    }
}

/// Main formal verifier trait
pub trait FormalVerifier {
    /// Verify a claim against an artifact
    fn verify_claim(&self, claim: Claim, artifact: &Artifact) -> Result<VerificationResult>;

    /// Register a new verification tool
    fn register_verifier(&mut self, verifier: Box<dyn ToolVerifier>) -> Result<()>;

    /// Get the verification policy for a step type
    fn get_verification_policy(&self, step_type: &str) -> Result<VerificationPolicy>;

    /// Set the verification policy for a step type
    fn set_verification_policy(&mut self, policy: VerificationPolicy) -> Result<()>;
}

/// Default implementation of the formal verifier
pub struct DefaultFormalVerifier {
    /// Registered verification tools
    verifiers: Arc<RwLock<Vec<Box<dyn ToolVerifier>>>>,
    /// Verification policies by step type
    policies: Arc<RwLock<HashMap<String, VerificationPolicy>>>,
}

impl DefaultFormalVerifier {
    /// Create a new formal verifier
    pub fn new() -> Self {
        Self {
            verifiers: Arc::new(RwLock::new(Vec::new())),
            policies: Arc::new(RwLock::new(HashMap::new())),
        }
    }

    /// Find a verifier that supports the given claim type
    fn find_verifier(&self, claim_type: &ClaimType) -> Result<String> {
        let verifiers = self.verifiers.read().map_err(|e| {
            PlatformError::InternalError(format!("Failed to acquire verifiers lock: {}", e))
        })?;

        for verifier in verifiers.iter() {
            if verifier.supports_claim_type(claim_type) {
                return Ok(verifier.name().to_string());
            }
        }

        Err(PlatformError::VerificationFailed(format!(
            "No verifier found for claim type: {:?}",
            claim_type
        )))
    }
}

impl Default for DefaultFormalVerifier {
    fn default() -> Self {
        Self::new()
    }
}

impl FormalVerifier for DefaultFormalVerifier {
    fn verify_claim(&self, claim: Claim, artifact: &Artifact) -> Result<VerificationResult> {
        // Find appropriate verifier for this claim type
        let verifiers = self.verifiers.read().map_err(|e| {
            PlatformError::InternalError(format!("Failed to acquire verifiers lock: {}", e))
        })?;

        for verifier in verifiers.iter() {
            if verifier.supports_claim_type(&claim.claim_type) {
                return verifier.verify(&claim, artifact);
            }
        }

        Err(PlatformError::VerificationFailed(format!(
            "No verifier registered for claim type: {:?}",
            claim.claim_type
        )))
    }

    fn register_verifier(&mut self, verifier: Box<dyn ToolVerifier>) -> Result<()> {
        let mut verifiers = self.verifiers.write().map_err(|e| {
            PlatformError::InternalError(format!("Failed to acquire verifiers lock: {}", e))
        })?;

        verifiers.push(verifier);
        Ok(())
    }

    fn get_verification_policy(&self, step_type: &str) -> Result<VerificationPolicy> {
        let policies = self.policies.read().map_err(|e| {
            PlatformError::InternalError(format!("Failed to acquire policies lock: {}", e))
        })?;

        policies
            .get(step_type)
            .cloned()
            .ok_or_else(|| {
                PlatformError::NotFound(format!("No verification policy for step type: {}", step_type))
            })
    }

    fn set_verification_policy(&mut self, policy: VerificationPolicy) -> Result<()> {
        let mut policies = self.policies.write().map_err(|e| {
            PlatformError::InternalError(format!("Failed to acquire policies lock: {}", e))
        })?;

        policies.insert(policy.step_type.clone(), policy);
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_claim_creation() {
        let claim = Claim::new(
            "test_claim",
            ClaimType::NoSQLInjection,
            "test_agent",
            0.95,
        );
        assert!(claim.is_ok());

        let claim = claim.unwrap();
        assert_eq!(claim.claim_id, "test_claim");
        assert_eq!(claim.asserted_by, "test_agent");
        assert_eq!(claim.confidence, 0.95);
    }

    #[test]
    fn test_claim_invalid_confidence() {
        let claim = Claim::new(
            "test_claim",
            ClaimType::NoSQLInjection,
            "test_agent",
            1.5,
        );
        assert!(claim.is_err());

        let claim = Claim::new(
            "test_claim",
            ClaimType::NoSQLInjection,
            "test_agent",
            -0.1,
        );
        assert!(claim.is_err());
    }

    #[test]
    fn test_artifact_creation() {
        let artifact = Artifact::from_inline("source_code", "fn main() {}");
        assert_eq!(artifact.artifact_type, "source_code");
        assert!(matches!(artifact.content, ArtifactContent::Inline(_)));

        let artifact = Artifact::from_path("source_code", "/path/to/file.rs");
        assert!(matches!(artifact.content, ArtifactContent::Path(_)));
    }

    #[test]
    fn test_artifact_with_metadata() {
        let artifact = Artifact::from_inline("source_code", "fn main() {}")
            .with_metadata("language", "rust")
            .with_metadata("version", "1.0");

        assert_eq!(artifact.metadata.get("language"), Some(&"rust".to_string()));
        assert_eq!(artifact.metadata.get("version"), Some(&"1.0".to_string()));
    }

    #[test]
    fn test_verification_result_creation() {
        let result = VerificationResult::success("test_tool", vec![]);
        assert!(result.verified);
        assert_eq!(result.verifier_tool, "test_tool");

        let result = VerificationResult::failure("test_tool", vec![]);
        assert!(!result.verified);
    }

    #[test]
    fn test_verification_policy() {
        let policy = VerificationPolicy::new("security_check")
            .require_claim(ClaimType::NoSQLInjection)
            .require_claim(ClaimType::NoXSS)
            .blocking(true)
            .timeout_ms(60_000);

        assert_eq!(policy.step_type, "security_check");
        assert_eq!(policy.required_claims.len(), 2);
        assert!(policy.blocking);
        assert_eq!(policy.timeout_ms, 60_000);
    }

    #[test]
    fn test_formal_verifier_creation() {
        let verifier = DefaultFormalVerifier::new();
        assert!(verifier.verifiers.read().unwrap().is_empty());
        assert!(verifier.policies.read().unwrap().is_empty());
    }

    #[test]
    fn test_formal_verifier_policy_management() {
        let mut verifier = DefaultFormalVerifier::new();

        let policy = VerificationPolicy::new("test_step")
            .require_claim(ClaimType::AllTestsPass);

        assert!(verifier.set_verification_policy(policy).is_ok());

        let retrieved = verifier.get_verification_policy("test_step");
        assert!(retrieved.is_ok());
        assert_eq!(retrieved.unwrap().step_type, "test_step");

        let not_found = verifier.get_verification_policy("nonexistent");
        assert!(not_found.is_err());
    }

    // Mock verifier for testing
    struct MockVerifier {
        name: String,
        supported_claims: Vec<ClaimType>,
    }

    impl ToolVerifier for MockVerifier {
        fn name(&self) -> &str {
            &self.name
        }

        fn verify(&self, _claim: &Claim, _artifact: &Artifact) -> Result<VerificationResult> {
            Ok(VerificationResult::success(self.name.clone(), vec![]))
        }

        fn supports_claim_type(&self, claim_type: &ClaimType) -> bool {
            self.supported_claims.contains(claim_type)
        }
    }

    #[test]
    fn test_verifier_registration() {
        let mut verifier = DefaultFormalVerifier::new();

        let mock = Box::new(MockVerifier {
            name: "mock_verifier".to_string(),
            supported_claims: vec![ClaimType::NoSQLInjection],
        });

        assert!(verifier.register_verifier(mock).is_ok());
        assert_eq!(verifier.verifiers.read().unwrap().len(), 1);
    }

    #[test]
    fn test_verify_claim_with_registered_verifier() {
        let mut verifier = DefaultFormalVerifier::new();

        let mock = Box::new(MockVerifier {
            name: "mock_verifier".to_string(),
            supported_claims: vec![ClaimType::NoSQLInjection],
        });

        verifier.register_verifier(mock).unwrap();

        let claim = Claim::new(
            "test_claim",
            ClaimType::NoSQLInjection,
            "test_agent",
            0.95,
        ).unwrap();

        let artifact = Artifact::from_inline("source_code", "SELECT * FROM users");

        let result = verifier.verify_claim(claim, &artifact);
        assert!(result.is_ok());
        assert!(result.unwrap().verified);
    }

    #[test]
    fn test_verify_claim_without_verifier() {
        let verifier = DefaultFormalVerifier::new();

        let claim = Claim::new(
            "test_claim",
            ClaimType::NoSQLInjection,
            "test_agent",
            0.95,
        ).unwrap();

        let artifact = Artifact::from_inline("source_code", "SELECT * FROM users");

        let result = verifier.verify_claim(claim, &artifact);
        assert!(result.is_err());
    }
}
